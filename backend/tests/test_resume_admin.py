"""
Resume Admin Module - Backend API Test Suite
Tests all 9 admin endpoints with authentication, authorization, and data validation
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

from app.main import app
from app.core.database import Base, get_db
from app.models import User, PlanType
from app.core.auth import get_password_hash, create_access_token

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_resume_admin.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Test fixtures
@pytest.fixture(scope="module")
def setup_database():
    """Create test database and tables"""
    Base.metadata.create_all(bind=engine)
    
    # Create resume admin tables
    with engine.begin() as connection:
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS resume_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                template_id TEXT NOT NULL,
                template_name TEXT,
                template_tier TEXT DEFAULT 'free',
                ats_score INTEGER DEFAULT 0,
                ai_generated BOOLEAN DEFAULT FALSE,
                pdf_export_count INTEGER DEFAULT 0,
                resume_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """))
        
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS ai_generation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                module TEXT NOT NULL,
                request_type TEXT NOT NULL,
                status TEXT NOT NULL,
                response_time_ms INTEGER,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """))
        
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS ai_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module TEXT UNIQUE NOT NULL,
                model_name TEXT NOT NULL,
                prompt_version TEXT NOT NULL,
                ai_enabled BOOLEAN DEFAULT TRUE,
                free_user_limit INTEGER DEFAULT 5,
                premium_user_limit INTEGER DEFAULT 50,
                settings_data TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_by INTEGER,
                FOREIGN KEY (updated_by) REFERENCES users(id)
            )
        """))
    
    yield
    
    # Cleanup
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def admin_user(setup_database):
    """Create admin user for testing"""
    db = TestingSessionLocal()
    
    admin = User(
        email="admin@test.com",
        name="Admin User",
        hashed_password=get_password_hash("Admin@123"),
        plan=PlanType.PRO,
        is_admin=True,
        is_google_user=False
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    yield admin
    
    db.delete(admin)
    db.commit()
    db.close()


@pytest.fixture
def regular_user(setup_database):
    """Create regular user for testing"""
    db = TestingSessionLocal()
    
    user = User(
        email="user@test.com",
        name="Regular User",
        hashed_password=get_password_hash("User@123"),
        plan=PlanType.FREE,
        is_admin=False,
        is_google_user=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    yield user
    
    db.delete(user)
    db.commit()
    db.close()


@pytest.fixture
def admin_token(admin_user):
    """Generate JWT token for admin user"""
    token = create_access_token(data={"sub": admin_user.email})
    return token


@pytest.fixture
def user_token(regular_user):
    """Generate JWT token for regular user"""
    token = create_access_token(data={"sub": regular_user.email})
    return token


@pytest.fixture
def sample_resume_data(admin_user, regular_user):
    """Create sample resume tracking data"""
    db = TestingSessionLocal()
    
    with engine.begin() as connection:
        # Insert sample resumes
        connection.execute(text("""
            INSERT INTO resume_tracking 
            (user_id, template_id, template_name, template_tier, ats_score, ai_generated, pdf_export_count, resume_data)
            VALUES 
            (:user_id1, 'ats-clean', 'ATS Clean', 'free', 85, true, 3, '{"name": "John Doe"}'),
            (:user_id1, 'professional-classic', 'Professional Classic', 'free', 78, false, 1, '{"name": "John Doe"}'),
            (:user_id2, 'creative-teal', 'Creative Teal', 'premium', 92, true, 5, '{"name": "Admin User"}')
        """), {"user_id1": regular_user.id, "user_id2": admin_user.id})
        
        # Insert AI generation logs
        connection.execute(text("""
            INSERT INTO ai_generation_logs 
            (user_id, module, request_type, status, response_time_ms)
            VALUES 
            (:user_id, 'resume', 'summary', 'success', 1200),
            (:user_id, 'resume', 'project', 'success', 1500),
            (:user_id, 'resume', 'experience', 'failed', 2000),
            (:user_id, 'resume', 'template_recommendation', 'success', 800)
        """), {"user_id": regular_user.id})
        
        # Insert AI settings
        connection.execute(text("""
            INSERT INTO ai_settings 
            (module, model_name, prompt_version, ai_enabled, free_user_limit, premium_user_limit, updated_by)
            VALUES 
            ('resume', 'gemini-1.5-flash', 'v1.0', true, 5, 50, :admin_id)
        """), {"admin_id": admin_user.id})
    
    yield
    
    # Cleanup
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM resume_tracking"))
        connection.execute(text("DELETE FROM ai_generation_logs"))
        connection.execute(text("DELETE FROM ai_settings"))
    
    db.close()


# ============================================================================
# TEST CASES - AUTHENTICATION & AUTHORIZATION
# ============================================================================

def test_resume_analytics_requires_auth():
    """Test that resume analytics endpoint requires authentication"""
    response = client.get("/api/admin/resume-analytics")
    assert response.status_code == 403  # No token provided


def test_resume_analytics_requires_admin(user_token):
    """Test that regular users cannot access resume analytics"""
    response = client.get(
        "/api/admin/resume-analytics",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 403
    assert "Admin access required" in response.json()["detail"]


def test_all_endpoints_require_admin(user_token):
    """Test that all resume admin endpoints require admin privileges"""
    endpoints = [
        ("GET", "/api/admin/resume-analytics"),
        ("GET", "/api/admin/resume-templates"),
        ("PUT", "/api/admin/resume-templates/ats-clean/toggle"),
        ("PUT", "/api/admin/resume-templates/ats-clean/tier?tier=premium"),
        ("GET", "/api/admin/user-resumes"),
        ("DELETE", "/api/admin/user-resumes/1"),
        ("GET", "/api/admin/ai-resume-monitor"),
        ("GET", "/api/admin/ai-settings"),
        ("PUT", "/api/admin/ai-settings"),
    ]
    
    for method, endpoint in endpoints:
        if method == "GET":
            response = client.get(endpoint, headers={"Authorization": f"Bearer {user_token}"})
        elif method == "PUT":
            response = client.put(endpoint, headers={"Authorization": f"Bearer {user_token}"}, json={})
        elif method == "DELETE":
            response = client.delete(endpoint, headers={"Authorization": f"Bearer {user_token}"})
        
        assert response.status_code == 403, f"{method} {endpoint} should require admin"


# ============================================================================
# TEST CASES - RESUME ANALYTICS
# ============================================================================

def test_get_resume_analytics_success(admin_token, sample_resume_data):
    """Test successful retrieval of resume analytics"""
    response = client.get(
        "/api/admin/resume-analytics",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert "total_resumes" in data
    assert "ai_generated" in data
    assert "manual_created" in data
    assert "pdf_exports" in data
    assert "average_ats_score" in data
    assert "premium_template_usage" in data
    assert "most_selected_template" in data
    assert "completion_rate" in data
    assert "templates_breakdown" in data
    
    # Verify data
    assert data["total_resumes"] == 3
    assert data["ai_generated"] == 2
    assert data["manual_created"] == 1
    assert data["pdf_exports"] == 9  # 3 + 1 + 5
    assert data["premium_template_usage"] == 1
    assert isinstance(data["templates_breakdown"], list)


def test_resume_analytics_empty_database(admin_token):
    """Test analytics with no resume data"""
    # Clear data first
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM resume_tracking"))
    
    response = client.get(
        "/api/admin/resume-analytics",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_resumes"] == 0
    assert data["ai_generated"] == 0
    assert data["pdf_exports"] == 0


# ============================================================================
# TEST CASES - RESUME TEMPLATES
# ============================================================================

def test_get_resume_templates_success(admin_token):
    """Test successful retrieval of resume templates"""
    response = client.get(
        "/api/admin/resume-templates",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "templates" in data
    assert "most_popular" in data
    assert len(data["templates"]) == 15  # All 15 templates
    
    # Verify template structure
    template = data["templates"][0]
    assert "id" in template
    assert "name" in template
    assert "tier" in template
    assert "active" in template
    assert "usage_count" in template
    assert "export_count" in template


def test_toggle_template_status(admin_token):
    """Test toggling template active/inactive status"""
    response = client.put(
        "/api/admin/resume-templates/ats-clean/toggle",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_change_template_tier_valid(admin_token):
    """Test changing template tier to valid value"""
    response = client.put(
        "/api/admin/resume-templates/ats-clean/tier?tier=premium",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_change_template_tier_invalid(admin_token):
    """Test changing template tier to invalid value"""
    response = client.put(
        "/api/admin/resume-templates/ats-clean/tier?tier=invalid",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 422  # Validation error


# ============================================================================
# TEST CASES - USER RESUMES
# ============================================================================

def test_get_user_resumes_success(admin_token, sample_resume_data):
    """Test successful retrieval of user resumes"""
    response = client.get(
        "/api/admin/user-resumes",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "resumes" in data
    assert len(data["resumes"]) == 3
    
    # Verify resume structure
    resume = data["resumes"][0]
    assert "id" in resume
    assert "user_id" in resume
    assert "user_name" in resume
    assert "user_email" in resume
    assert "template_id" in resume
    assert "ats_score" in resume
    assert "ai_generated" in resume
    assert "pdf_export_count" in resume
    assert "created_at" in resume
    assert "updated_at" in resume


def test_get_user_resumes_with_search(admin_token, sample_resume_data):
    """Test searching user resumes by name/email"""
    response = client.get(
        "/api/admin/user-resumes?search=john",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Should only return resumes for users matching "john"
    assert len(data["resumes"]) >= 1
    for resume in data["resumes"]:
        assert "john" in resume["user_name"].lower() or "john" in resume["user_email"].lower()


def test_delete_user_resume_success(admin_token, sample_resume_data):
    """Test successful deletion of user resume"""
    # Get a resume ID first
    response = client.get(
        "/api/admin/user-resumes",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    resume_id = response.json()["resumes"][0]["id"]
    
    # Delete it
    response = client.delete(
        f"/api/admin/user-resumes/{resume_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "deleted successfully" in data["message"]


def test_delete_nonexistent_resume(admin_token):
    """Test deleting a resume that doesn't exist"""
    response = client.delete(
        "/api/admin/user-resumes/99999",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


# ============================================================================
# TEST CASES - AI RESUME MONITOR
# ============================================================================

def test_get_ai_monitor_success(admin_token, sample_resume_data):
    """Test successful retrieval of AI monitor data"""
    response = client.get(
        "/api/admin/ai-resume-monitor",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert "total_generations" in data
    assert "successful_requests" in data
    assert "failed_requests" in data
    assert "avg_response_time" in data
    assert "summary_generations" in data
    assert "project_generations" in data
    assert "experience_generations" in data
    assert "template_recommendations" in data
    assert "recent_requests" in data
    
    # Verify data
    assert data["total_generations"] == 4
    assert data["successful_requests"] == 3
    assert data["failed_requests"] == 1
    assert data["summary_generations"] == 1
    assert data["project_generations"] == 1
    assert data["experience_generations"] == 1
    assert data["template_recommendations"] == 1
    assert isinstance(data["recent_requests"], list)


def test_ai_monitor_recent_requests_structure(admin_token, sample_resume_data):
    """Test structure of recent AI requests"""
    response = client.get(
        "/api/admin/ai-resume-monitor",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    data = response.json()
    
    if len(data["recent_requests"]) > 0:
        request = data["recent_requests"][0]
        assert "id" in request
        assert "user_email" in request
        assert "request_type" in request
        assert "status" in request
        assert "response_time" in request
        assert "timestamp" in request


# ============================================================================
# TEST CASES - AI SETTINGS
# ============================================================================

def test_get_ai_settings_success(admin_token, sample_resume_data):
    """Test successful retrieval of AI settings"""
    response = client.get(
        "/api/admin/ai-settings",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert "model_name" in data
    assert "prompt_version" in data
    assert "ai_enabled" in data
    assert "free_user_limit" in data
    assert "premium_user_limit" in data
    
    # Verify data
    assert data["model_name"] == "gemini-1.5-flash"
    assert data["prompt_version"] == "v1.0"
    assert data["ai_enabled"] is True
    assert data["free_user_limit"] == 5
    assert data["premium_user_limit"] == 50


def test_update_ai_settings_success(admin_token):
    """Test successful update of AI settings"""
    new_settings = {
        "model_name": "gemini-1.5-pro",
        "prompt_version": "v2.0",
        "ai_enabled": True,
        "free_user_limit": 10,
        "premium_user_limit": 100
    }
    
    response = client.put(
        "/api/admin/ai-settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=new_settings
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["settings"]["model_name"] == "gemini-1.5-pro"
    assert data["settings"]["free_user_limit"] == 10


def test_update_ai_settings_invalid_limits(admin_token):
    """Test updating AI settings with invalid limits"""
    # Negative limits
    response = client.put(
        "/api/admin/ai-settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "model_name": "gemini-1.5-flash",
            "prompt_version": "v1.0",
            "ai_enabled": True,
            "free_user_limit": -5,
            "premium_user_limit": 50
        }
    )
    
    assert response.status_code == 400
    assert "non-negative" in response.json()["detail"]


def test_update_ai_settings_free_exceeds_premium(admin_token):
    """Test that free limit cannot exceed premium limit"""
    response = client.put(
        "/api/admin/ai-settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "model_name": "gemini-1.5-flash",
            "prompt_version": "v1.0",
            "ai_enabled": True,
            "free_user_limit": 100,
            "premium_user_limit": 50
        }
    )
    
    assert response.status_code == 400
    assert "cannot exceed premium" in response.json()["detail"]


def test_update_ai_settings_missing_fields(admin_token):
    """Test updating AI settings with missing required fields"""
    response = client.put(
        "/api/admin/ai-settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "model_name": "",
            "prompt_version": "v1.0",
            "ai_enabled": True,
            "free_user_limit": 5,
            "premium_user_limit": 50
        }
    )
    
    assert response.status_code == 400
    assert "required" in response.json()["detail"].lower()


# ============================================================================
# TEST CASES - DATA VALIDATION
# ============================================================================

def test_resume_tracking_cascade_delete(admin_user, regular_user):
    """Test that deleting a user cascades to resume_tracking"""
    db = TestingSessionLocal()
    
    # Create a test user with resume
    test_user = User(
        email="cascade@test.com",
        name="Cascade Test",
        hashed_password=get_password_hash("Test@123"),
        plan=PlanType.FREE,
        is_admin=False
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # Add resume for this user
    with engine.begin() as connection:
        connection.execute(text("""
            INSERT INTO resume_tracking (user_id, template_id, template_name)
            VALUES (:user_id, 'ats-clean', 'ATS Clean')
        """), {"user_id": test_user.id})
    
    # Verify resume exists
    with engine.begin() as connection:
        result = connection.execute(
            text("SELECT COUNT(*) FROM resume_tracking WHERE user_id = :user_id"),
            {"user_id": test_user.id}
        )
        assert result.fetchone()[0] == 1
    
    # Delete user
    db.delete(test_user)
    db.commit()
    
    # Verify resume was cascade deleted
    with engine.begin() as connection:
        result = connection.execute(
            text("SELECT COUNT(*) FROM resume_tracking WHERE user_id = :user_id"),
            {"user_id": test_user.id}
        )
        assert result.fetchone()[0] == 0
    
    db.close()


def test_ai_generation_logs_cascade_delete(regular_user):
    """Test that deleting a user cascades to ai_generation_logs"""
    db = TestingSessionLocal()
    
    # Create a test user with AI logs
    test_user = User(
        email="ailog@test.com",
        name="AI Log Test",
        hashed_password=get_password_hash("Test@123"),
        plan=PlanType.FREE,
        is_admin=False
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # Add AI log for this user
    with engine.begin() as connection:
        connection.execute(text("""
            INSERT INTO ai_generation_logs (user_id, module, request_type, status, response_time_ms)
            VALUES (:user_id, 'resume', 'summary', 'success', 1000)
        """), {"user_id": test_user.id})
    
    # Verify log exists
    with engine.begin() as connection:
        result = connection.execute(
            text("SELECT COUNT(*) FROM ai_generation_logs WHERE user_id = :user_id"),
            {"user_id": test_user.id}
        )
        assert result.fetchone()[0] == 1
    
    # Delete user
    db.delete(test_user)
    db.commit()
    
    # Verify log was cascade deleted
    with engine.begin() as connection:
        result = connection.execute(
            text("SELECT COUNT(*) FROM ai_generation_logs WHERE user_id = :user_id"),
            {"user_id": test_user.id}
        )
        assert result.fetchone()[0] == 0
    
    db.close()


# ============================================================================
# TEST CASES - EDGE CASES
# ============================================================================

def test_resume_analytics_with_null_ats_scores(admin_token, regular_user):
    """Test analytics calculation with NULL ATS scores"""
    with engine.begin() as connection:
        connection.execute(text("""
            INSERT INTO resume_tracking (user_id, template_id, ats_score, ai_generated)
            VALUES (:user_id, 'ats-clean', NULL, false)
        """), {"user_id": regular_user.id})
    
    response = client.get(
        "/api/admin/resume-analytics",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "average_ats_score" in data
    # Should handle NULL gracefully


def test_ai_monitor_with_no_logs(admin_token):
    """Test AI monitor with no generation logs"""
    # Clear logs
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM ai_generation_logs"))
    
    response = client.get(
        "/api/admin/ai-resume-monitor",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_generations"] == 0
    assert data["recent_requests"] == []


def test_invalid_bearer_token():
    """Test with invalid JWT token"""
    response = client.get(
        "/api/admin/resume-analytics",
        headers={"Authorization": "Bearer invalid_token_12345"}
    )
    
    assert response.status_code == 401


def test_expired_token():
    """Test with expired JWT token"""
    # Create an expired token (expires immediately)
    from datetime import timedelta
    expired_token = create_access_token(
        data={"sub": "admin@test.com"},
        expires_delta=timedelta(seconds=-1)
    )
    
    response = client.get(
        "/api/admin/resume-analytics",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    
    assert response.status_code == 401


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
