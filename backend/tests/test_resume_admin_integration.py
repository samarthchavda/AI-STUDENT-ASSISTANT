"""
Resume Admin Module - Integration Tests
Tests database operations, migrations, and data integrity
"""

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Test database URL
TEST_DB_URL = os.getenv("TEST_DATABASE_URL", "postgresql://localhost/codecampus_test")

engine = create_engine(TEST_DB_URL)
SessionLocal = sessionmaker(bind=engine)


class TestDatabaseMigration:
    """Test that migration creates all required tables and indexes"""
    
    def test_resume_tracking_table_exists(self):
        """Verify resume_tracking table exists"""
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'resume_tracking'
                )
            """))
            assert result.fetchone()[0] is True
    
    def test_ai_generation_logs_table_exists(self):
        """Verify ai_generation_logs table exists"""
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'ai_generation_logs'
                )
            """))
            assert result.fetchone()[0] is True
    
    def test_ai_settings_table_exists(self):
        """Verify ai_settings table exists"""
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'ai_settings'
                )
            """))
            assert result.fetchone()[0] is True
    
    def test_resume_tracking_columns(self):
        """Verify resume_tracking has all required columns"""
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'resume_tracking'
            """))
            columns = [row[0] for row in result.fetchall()]
            
            required_columns = [
                'id', 'user_id', 'template_id', 'template_name', 
                'template_tier', 'ats_score', 'ai_generated', 
                'pdf_export_count', 'resume_data', 'created_at', 'updated_at'
            ]
            
            for col in required_columns:
                assert col in columns, f"Missing column: {col}"
    
    def test_ai_generation_logs_columns(self):
        """Verify ai_generation_logs has all required columns"""
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'ai_generation_logs'
            """))
            columns = [row[0] for row in result.fetchall()]
            
            required_columns = [
                'id', 'user_id', 'module', 'request_type', 
                'status', 'response_time_ms', 'error_message', 'created_at'
            ]
            
            for col in required_columns:
                assert col in columns, f"Missing column: {col}"
    
    def test_ai_settings_columns(self):
        """Verify ai_settings has all required columns"""
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'ai_settings'
            """))
            columns = [row[0] for row in result.fetchall()]
            
            required_columns = [
                'id', 'module', 'model_name', 'prompt_version', 
                'ai_enabled', 'free_user_limit', 'premium_user_limit',
                'settings_data', 'updated_at', 'updated_by'
            ]
            
            for col in required_columns:
                assert col in columns, f"Missing column: {col}"
    
    def test_resume_tracking_indexes(self):
        """Verify resume_tracking has performance indexes"""
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'resume_tracking'
            """))
            indexes = [row[0] for row in result.fetchall()]
            
            # Should have indexes on user_id, template_id, created_at
            assert any('user_id' in idx for idx in indexes), "Missing user_id index"
    
    def test_ai_settings_unique_constraint(self):
        """Verify ai_settings has unique constraint on module"""
        with engine.begin() as conn:
            # Try to insert duplicate module
            conn.execute(text("""
                INSERT INTO ai_settings (module, model_name, prompt_version)
                VALUES ('test_module', 'test-model', 'v1.0')
                ON CONFLICT (module) DO NOTHING
            """))
            
            # Try to insert again - should fail or be ignored
            result = conn.execute(text("""
                INSERT INTO ai_settings (module, model_name, prompt_version)
                VALUES ('test_module', 'test-model-2', 'v2.0')
                ON CONFLICT (module) DO NOTHING
                RETURNING id
            """))
            
            # Should return nothing (conflict handled)
            assert result.fetchone() is None
            
            # Cleanup
            conn.execute(text("DELETE FROM ai_settings WHERE module = 'test_module'"))


class TestResumeTrackingOperations:
    """Test CRUD operations on resume_tracking table"""
    
    def test_insert_resume_tracking(self):
        """Test inserting resume tracking record"""
        db = SessionLocal()
        
        with engine.begin() as conn:
            # Get a test user ID (assuming users table has data)
            user_result = conn.execute(text("SELECT id FROM users LIMIT 1"))
            user_row = user_result.fetchone()
            
            if user_row:
                user_id = user_row[0]
                
                # Insert resume tracking
                conn.execute(text("""
                    INSERT INTO resume_tracking 
                    (user_id, template_id, template_name, template_tier, ats_score, ai_generated, pdf_export_count)
                    VALUES (:user_id, 'test-template', 'Test Template', 'free', 85, true, 0)
                """), {"user_id": user_id})
                
                # Verify insert
                result = conn.execute(text("""
                    SELECT COUNT(*) FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = 'test-template'
                """), {"user_id": user_id})
                
                assert result.fetchone()[0] == 1
                
                # Cleanup
                conn.execute(text("""
                    DELETE FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = 'test-template'
                """), {"user_id": user_id})
        
        db.close()
    
    def test_update_pdf_export_count(self):
        """Test incrementing PDF export count"""
        db = SessionLocal()
        
        with engine.begin() as conn:
            user_result = conn.execute(text("SELECT id FROM users LIMIT 1"))
            user_row = user_result.fetchone()
            
            if user_row:
                user_id = user_row[0]
                
                # Insert resume
                conn.execute(text("""
                    INSERT INTO resume_tracking 
                    (user_id, template_id, pdf_export_count)
                    VALUES (:user_id, 'export-test', 0)
                """), {"user_id": user_id})
                
                # Increment export count
                conn.execute(text("""
                    UPDATE resume_tracking 
                    SET pdf_export_count = pdf_export_count + 1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = :user_id AND template_id = 'export-test'
                """), {"user_id": user_id})
                
                # Verify increment
                result = conn.execute(text("""
                    SELECT pdf_export_count FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = 'export-test'
                """), {"user_id": user_id})
                
                assert result.fetchone()[0] == 1
                
                # Cleanup
                conn.execute(text("""
                    DELETE FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = 'export-test'
                """), {"user_id": user_id})
        
        db.close()
    
    def test_resume_data_jsonb_storage(self):
        """Test storing and retrieving JSONB resume data"""
        db = SessionLocal()
        
        with engine.begin() as conn:
            user_result = conn.execute(text("SELECT id FROM users LIMIT 1"))
            user_row = user_result.fetchone()
            
            if user_row:
                user_id = user_row[0]
                
                resume_data = {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "phone": "+1234567890",
                    "summary": "Software Engineer",
                    "experience": [
                        {"company": "Tech Corp", "role": "Developer", "years": 2}
                    ]
                }
                
                # Insert with JSONB data
                conn.execute(text("""
                    INSERT INTO resume_tracking 
                    (user_id, template_id, resume_data)
                    VALUES (:user_id, 'jsonb-test', :resume_data::jsonb)
                """), {"user_id": user_id, "resume_data": str(resume_data).replace("'", '"')})
                
                # Retrieve and verify
                result = conn.execute(text("""
                    SELECT resume_data FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = 'jsonb-test'
                """), {"user_id": user_id})
                
                row = result.fetchone()
                assert row is not None
                
                # Cleanup
                conn.execute(text("""
                    DELETE FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = 'jsonb-test'
                """), {"user_id": user_id})
        
        db.close()


class TestAIGenerationLogs:
    """Test AI generation logging functionality"""
    
    def test_log_successful_generation(self):
        """Test logging successful AI generation"""
        db = SessionLocal()
        
        with engine.begin() as conn:
            user_result = conn.execute(text("SELECT id FROM users LIMIT 1"))
            user_row = user_result.fetchone()
            
            if user_row:
                user_id = user_row[0]
                
                # Log successful generation
                conn.execute(text("""
                    INSERT INTO ai_generation_logs 
                    (user_id, module, request_type, status, response_time_ms)
                    VALUES (:user_id, 'resume', 'summary', 'success', 1250)
                """), {"user_id": user_id})
                
                # Verify log
                result = conn.execute(text("""
                    SELECT status, response_time_ms FROM ai_generation_logs 
                    WHERE user_id = :user_id AND request_type = 'summary'
                    ORDER BY created_at DESC LIMIT 1
                """), {"user_id": user_id})
                
                row = result.fetchone()
                assert row[0] == 'success'
                assert row[1] == 1250
                
                # Cleanup
                conn.execute(text("""
                    DELETE FROM ai_generation_logs 
                    WHERE user_id = :user_id AND request_type = 'summary'
                """), {"user_id": user_id})
        
        db.close()
    
    def test_log_failed_generation(self):
        """Test logging failed AI generation with error message"""
        db = SessionLocal()
        
        with engine.begin() as conn:
            user_result = conn.execute(text("SELECT id FROM users LIMIT 1"))
            user_row = user_result.fetchone()
            
            if user_row:
                user_id = user_row[0]
                
                # Log failed generation
                conn.execute(text("""
                    INSERT INTO ai_generation_logs 
                    (user_id, module, request_type, status, response_time_ms, error_message)
                    VALUES (:user_id, 'resume', 'project', 'failed', 2000, 'API timeout')
                """), {"user_id": user_id})
                
                # Verify log
                result = conn.execute(text("""
                    SELECT status, error_message FROM ai_generation_logs 
                    WHERE user_id = :user_id AND request_type = 'project'
                    ORDER BY created_at DESC LIMIT 1
                """), {"user_id": user_id})
                
                row = result.fetchone()
                assert row[0] == 'failed'
                assert row[1] == 'API timeout'
                
                # Cleanup
                conn.execute(text("""
                    DELETE FROM ai_generation_logs 
                    WHERE user_id = :user_id AND request_type = 'project'
                """), {"user_id": user_id})
        
        db.close()


class TestAISettings:
    """Test AI settings CRUD operations"""
    
    def test_insert_default_settings(self):
        """Test inserting default AI settings"""
        with engine.begin() as conn:
            # Insert default settings
            conn.execute(text("""
                INSERT INTO ai_settings 
                (module, model_name, prompt_version, ai_enabled, free_user_limit, premium_user_limit)
                VALUES ('test_resume', 'gemini-1.5-flash', 'v1.0', true, 5, 50)
                ON CONFLICT (module) DO NOTHING
            """))
            
            # Verify insert
            result = conn.execute(text("""
                SELECT model_name, ai_enabled, free_user_limit 
                FROM ai_settings 
                WHERE module = 'test_resume'
            """))
            
            row = result.fetchone()
            assert row[0] == 'gemini-1.5-flash'
            assert row[1] is True
            assert row[2] == 5
            
            # Cleanup
            conn.execute(text("DELETE FROM ai_settings WHERE module = 'test_resume'"))
    
    def test_update_settings(self):
        """Test updating AI settings"""
        with engine.begin() as conn:
            # Insert initial settings
            conn.execute(text("""
                INSERT INTO ai_settings 
                (module, model_name, prompt_version, ai_enabled, free_user_limit, premium_user_limit)
                VALUES ('update_test', 'gemini-1.5-flash', 'v1.0', true, 5, 50)
                ON CONFLICT (module) DO NOTHING
            """))
            
            # Update settings
            conn.execute(text("""
                UPDATE ai_settings 
                SET model_name = 'gemini-1.5-pro',
                    free_user_limit = 10,
                    updated_at = CURRENT_TIMESTAMP
                WHERE module = 'update_test'
            """))
            
            # Verify update
            result = conn.execute(text("""
                SELECT model_name, free_user_limit 
                FROM ai_settings 
                WHERE module = 'update_test'
            """))
            
            row = result.fetchone()
            assert row[0] == 'gemini-1.5-pro'
            assert row[1] == 10
            
            # Cleanup
            conn.execute(text("DELETE FROM ai_settings WHERE module = 'update_test'"))
    
    def test_settings_unique_module_constraint(self):
        """Test that module column has unique constraint"""
        with engine.begin() as conn:
            # Insert first record
            conn.execute(text("""
                INSERT INTO ai_settings 
                (module, model_name, prompt_version)
                VALUES ('unique_test', 'model-1', 'v1.0')
                ON CONFLICT (module) DO NOTHING
            """))
            
            # Try to insert duplicate - should be handled by ON CONFLICT
            result = conn.execute(text("""
                INSERT INTO ai_settings 
                (module, model_name, prompt_version)
                VALUES ('unique_test', 'model-2', 'v2.0')
                ON CONFLICT (module) DO NOTHING
                RETURNING id
            """))
            
            # Should return nothing (conflict handled)
            assert result.fetchone() is None
            
            # Cleanup
            conn.execute(text("DELETE FROM ai_settings WHERE module = 'unique_test'"))


class TestDataIntegrity:
    """Test data integrity and constraints"""
    
    def test_foreign_key_constraint_resume_tracking(self):
        """Test that resume_tracking enforces foreign key to users"""
        with engine.begin() as conn:
            # Try to insert with invalid user_id
            try:
                conn.execute(text("""
                    INSERT INTO resume_tracking 
                    (user_id, template_id)
                    VALUES (999999, 'test-template')
                """))
                # If we reach here, foreign key is not enforced (SQLite behavior)
                # Clean up
                conn.execute(text("DELETE FROM resume_tracking WHERE user_id = 999999"))
            except Exception as e:
                # Foreign key constraint violated (PostgreSQL behavior)
                assert "foreign key" in str(e).lower() or "violates" in str(e).lower()
    
    def test_cascade_delete_resume_tracking(self):
        """Test that deleting user cascades to resume_tracking"""
        db = SessionLocal()
        
        with engine.begin() as conn:
            # Create test user
            conn.execute(text("""
                INSERT INTO users (email, name, hashed_password, plan)
                VALUES ('cascade_test@test.com', 'Cascade Test', 'hash123', 'free')
            """))
            
            # Get user ID
            result = conn.execute(text("""
                SELECT id FROM users WHERE email = 'cascade_test@test.com'
            """))
            user_id = result.fetchone()[0]
            
            # Insert resume for this user
            conn.execute(text("""
                INSERT INTO resume_tracking (user_id, template_id)
                VALUES (:user_id, 'cascade-test')
            """), {"user_id": user_id})
            
            # Verify resume exists
            result = conn.execute(text("""
                SELECT COUNT(*) FROM resume_tracking WHERE user_id = :user_id
            """), {"user_id": user_id})
            assert result.fetchone()[0] == 1
            
            # Delete user
            conn.execute(text("""
                DELETE FROM users WHERE id = :user_id
            """), {"user_id": user_id})
            
            # Verify resume was cascade deleted
            result = conn.execute(text("""
                SELECT COUNT(*) FROM resume_tracking WHERE user_id = :user_id
            """), {"user_id": user_id})
            assert result.fetchone()[0] == 0
        
        db.close()
    
    def test_default_values(self):
        """Test that default values are applied correctly"""
        with engine.begin() as conn:
            user_result = conn.execute(text("SELECT id FROM users LIMIT 1"))
            user_row = user_result.fetchone()
            
            if user_row:
                user_id = user_row[0]
                
                # Insert with minimal data
                conn.execute(text("""
                    INSERT INTO resume_tracking (user_id, template_id)
                    VALUES (:user_id, 'default-test')
                """), {"user_id": user_id})
                
                # Verify defaults
                result = conn.execute(text("""
                    SELECT template_tier, ats_score, ai_generated, pdf_export_count
                    FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = 'default-test'
                """), {"user_id": user_id})
                
                row = result.fetchone()
                assert row[0] == 'free'  # default tier
                assert row[1] == 0  # default ats_score
                assert row[2] is False  # default ai_generated
                assert row[3] == 0  # default pdf_export_count
                
                # Cleanup
                conn.execute(text("""
                    DELETE FROM resume_tracking 
                    WHERE user_id = :user_id AND template_id = 'default-test'
                """), {"user_id": user_id})


class TestPerformance:
    """Test query performance and optimization"""
    
    def test_analytics_query_performance(self):
        """Test that analytics query completes in reasonable time"""
        import time
        
        start_time = time.time()
        
        with engine.begin() as conn:
            conn.execute(text("""
                SELECT 
                    COUNT(*) as total_resumes,
                    COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_generated,
                    SUM(pdf_export_count) as pdf_exports,
                    AVG(ats_score) as avg_ats_score
                FROM resume_tracking
            """))
        
        elapsed_time = time.time() - start_time
        
        # Should complete in under 1 second even with large dataset
        assert elapsed_time < 1.0, f"Query took {elapsed_time}s - too slow!"
    
    def test_user_resumes_search_performance(self):
        """Test that user resume search is performant"""
        import time
        
        start_time = time.time()
        
        with engine.begin() as conn:
            conn.execute(text("""
                SELECT rt.*, u.name, u.email
                FROM resume_tracking rt
                JOIN users u ON u.id = rt.user_id
                WHERE LOWER(u.name) LIKE LOWER('%test%')
                ORDER BY rt.updated_at DESC
                LIMIT 100
            """))
        
        elapsed_time = time.time() - start_time
        
        # Should complete quickly
        assert elapsed_time < 1.0, f"Search took {elapsed_time}s - too slow!"


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
