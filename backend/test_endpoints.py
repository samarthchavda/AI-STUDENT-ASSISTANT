"""
Automated Tests for CodeCampus AI API
Run with: pytest test_endpoints.py -v
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine
from sqlalchemy.orm import Session
import json

# Create test client
client = TestClient(app)

# Test data
TEST_USER = {
    "email": "test@codecampus.ai",
    "password": "Test@123456",
    "name": "Test User"
}

TEST_ADMIN = {
    "email": "admin@codecampus.ai",
    "password": "Admin@123456",
    "name": "Admin User"
}

# Global variables to store tokens
user_token = None
admin_token = None


class TestHealthEndpoints:
    """Test health and status endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns API info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["status"] == "running"
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "environment" in data


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_register_new_user(self):
        """Test user registration"""
        response = client.post("/api/auth/register", json=TEST_USER)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER["email"]
        
        # Save token for later tests
        global user_token
        user_token = data["access_token"]
    
    def test_register_duplicate_email(self):
        """Test registration with existing email fails"""
        response = client.post("/api/auth/register", json=TEST_USER)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_login_success(self):
        """Test successful login"""
        response = client.post("/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == TEST_USER["email"]
    
    def test_login_wrong_password(self):
        """Test login with wrong password fails"""
        response = client.post("/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": "WrongPassword123"
        })
        assert response.status_code == 401
        assert "invalid credentials" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email fails"""
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "Test@123"
        })
        assert response.status_code == 401


class TestChatEndpoints:
    """Test chat and learning endpoints"""
    
    def test_chat_without_auth(self):
        """Test chat endpoint requires authentication"""
        response = client.post("/api/chat", json={
            "messages": [{"role": "user", "content": "Hello"}]
        })
        assert response.status_code == 403  # Forbidden without auth
    
    def test_chat_with_auth(self):
        """Test chat endpoint with authentication"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/chat", 
            json={
                "messages": [{"role": "user", "content": "What is DSA?"}],
                "language": "english"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
    
    def test_chat_history_get(self):
        """Test getting chat history"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get("/api/chat/history", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "history" in data
        assert isinstance(data["history"], list)
    
    def test_chat_history_clear(self):
        """Test clearing chat history"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.delete("/api/chat/history", headers=headers)
        assert response.status_code == 200
        assert "message" in response.json()


class TestExamEndpoints:
    """Test exam preparation endpoints"""
    
    def test_mock_test_generation(self):
        """Test mock test generation"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/exam/mock-test",
            json={
                "subject": "Data Structures",
                "topic": "Arrays",
                "difficulty": "medium",
                "numQuestions": 5
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) > 0
    
    def test_solve_pyq(self):
        """Test previous year question solving"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/exam/solve-pyq",
            json={
                "question": "What is time complexity of binary search?",
                "subject": "Algorithms"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "solution" in data
    
    def test_study_plan_generation(self):
        """Test study plan generation"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/exam/study-plan",
            json={
                "examDate": "2024-06-01",
                "subjects": ["DSA", "DBMS", "OS"]
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "plan" in data


class TestCodingEndpoints:
    """Test coding help endpoints"""
    
    def test_code_explanation(self):
        """Test code explanation"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/coding/help",
            json={
                "code": "def hello():\n    print('Hello')",
                "language": "python",
                "task": "explain"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
    
    def test_dsa_hint(self):
        """Test DSA problem hints"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/coding/dsa-hint",
            json={
                "problem": "Two Sum problem"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "solution" in data
    
    def test_project_guidance(self):
        """Test project guidance"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/coding/project-guide",
            json={
                "projectType": "E-commerce Website",
                "techStack": ["React", "Node.js", "MongoDB"]
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "guidance" in data


class TestCareerEndpoints:
    """Test career guidance endpoints"""
    
    def test_resume_analysis(self):
        """Test resume analysis"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/career/resume-analyze",
            json={
                "resumeText": "John Doe\nSoftware Engineer\nSkills: Python, React"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "atsScore" in data
        assert "analysis" in data
    
    def test_interview_prep(self):
        """Test interview preparation"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/career/interview-prep",
            json={
                "company": "Google",
                "role": "SDE"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "preparation" in data
        assert "commonQuestions" in data


class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_rate_limit_on_login(self):
        """Test rate limiting on login endpoint"""
        # Try to login 15 times (limit is 10/minute)
        for i in range(15):
            response = client.post("/api/auth/login", json={
                "email": "test@test.com",
                "password": "test123"
            })
            
            if i < 10:
                # First 10 should work (or fail with 401)
                assert response.status_code in [200, 401]
            else:
                # After 10, should get rate limited
                if response.status_code == 429:
                    assert "rate limit" in response.json()["detail"].lower()
                    break


class TestSecurityHeaders:
    """Test security headers are present"""
    
    def test_security_headers_present(self):
        """Test that security headers are added to responses"""
        response = client.get("/")
        headers = response.headers
        
        assert "x-content-type-options" in headers
        assert headers["x-content-type-options"] == "nosniff"
        
        assert "x-frame-options" in headers
        assert headers["x-frame-options"] == "DENY"
        
        assert "x-xss-protection" in headers


class TestErrorHandling:
    """Test error handling"""
    
    def test_invalid_endpoint(self):
        """Test 404 for invalid endpoint"""
        response = client.get("/api/invalid-endpoint")
        assert response.status_code == 404
    
    def test_invalid_json(self):
        """Test handling of invalid JSON"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/api/chat",
            data="invalid json",
            headers=headers
        )
        assert response.status_code == 422  # Unprocessable Entity
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        response = client.post("/api/auth/register", json={
            "email": "test@test.com"
            # Missing password and name
        })
        assert response.status_code == 422


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

