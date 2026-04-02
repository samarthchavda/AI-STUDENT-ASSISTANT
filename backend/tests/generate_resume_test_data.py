"""
Generate test data for Resume Admin module
Usage: python3 generate_resume_test_data.py
"""
from sqlalchemy import create_engine, text
import random
from datetime import datetime, timedelta
import os

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/codecampus")
engine = create_engine(DATABASE_URL)

# Test data constants
templates = [
    'ats-simple', 'ats-clean', 'ats-compact',
    'professional-classic', 'professional-navy', 'professional-two-col',
    'modern-minimalist', 'modern-bold',
    'creative-teal', 'creative-purple',
    'premium-glass', 'premium-executive-gold', 'premium-neon'
]

request_types = ['summary', 'project', 'experience', 'template_recommendation']
statuses = ['success', 'failed']

def generate_resume_tracking(user_ids, count=100):
    """Generate resume tracking records"""
    print(f"📝 Generating {count} resume tracking records...")
    
    with engine.begin() as conn:
        for i in range(count):
            user_id = random.choice(user_ids)
            template_id = random.choice(templates)
            template_tier = 'premium' if 'premium' in template_id or 'creative' in template_id else 'free'
            ai_generated = random.choice([True, False])
            ats_score = random.randint(60, 95)
            pdf_exports = random.randint(0, 10)
            
            # Random date in last 30 days
            days_ago = random.randint(0, 30)
            created_at = datetime.now() - timedelta(days=days_ago)
            
            conn.execute(text("""
                INSERT INTO resume_tracking 
                (user_id, template_id, template_name, template_tier, ats_score, ai_generated, pdf_export_count, created_at, updated_at)
                VALUES (:user_id, :template_id, :template_name, :tier, :ats_score, :ai_gen, :exports, :created, :updated)
            """), {
                "user_id": user_id,
                "template_id": template_id,
                "template_name": template_id.replace('-', ' ').title(),
                "tier": template_tier,
                "ats_score": ats_score,
                "ai_gen": ai_generated,
                "exports": pdf_exports,
                "created": created_at,
                "updated": created_at
            })
            
            if (i + 1) % 20 == 0:
                print(f"  Generated {i + 1}/{count} records...")
    
    print(f"✅ Generated {count} resume tracking records")


def generate_ai_logs(user_ids, count=200):
    """Generate AI generation logs"""
    print(f"🤖 Generating {count} AI generation logs...")
    
    with engine.begin() as conn:
        for i in range(count):
            user_id = random.choice(user_ids)
            request_type = random.choice(request_types)
            status = random.choices(statuses, weights=[0.9, 0.1])[0]  # 90% success rate
            response_time = random.randint(500, 3000)
            error_msg = random.choice([
                "API timeout", 
                "Rate limit exceeded", 
                "Invalid input",
                None
            ]) if status == 'failed' else None
            
            # Random timestamp in last 7 days
            days_ago = random.randint(0, 7)
            hours_ago = random.randint(0, 23)
            created_at = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
            
            conn.execute(text("""
                INSERT INTO ai_generation_logs 
                (user_id, module, request_type, status, response_time_ms, error_message, created_at)
                VALUES (:user_id, 'resume', :req_type, :status, :resp_time, :error, :created)
            """), {
                "user_id": user_id,
                "req_type": request_type,
                "status": status,
                "resp_time": response_time,
                "error": error_msg,
                "created": created_at
            })
            
            if (i + 1) % 50 == 0:
                print(f"  Generated {i + 1}/{count} logs...")
    
    print(f"✅ Generated {count} AI generation logs")


def verify_data():
    """Verify generated data"""
    print("\n📊 Verifying generated data...")
    
    with engine.begin() as conn:
        # Count resumes
        result = conn.execute(text("SELECT COUNT(*) FROM resume_tracking"))
        resume_count = result.fetchone()[0]
        print(f"  Resume tracking records: {resume_count}")
        
        # Count AI logs
        result = conn.execute(text("SELECT COUNT(*) FROM ai_generation_logs WHERE module = 'resume'"))
        log_count = result.fetchone()[0]
        print(f"  AI generation logs: {log_count}")
        
        # Get analytics summary
        result = conn.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_gen,
                SUM(pdf_export_count) as exports,
                AVG(ats_score) as avg_score
            FROM resume_tracking
        """))
        row = result.fetchone()
        print(f"  Total resumes: {row[0]}")
        print(f"  AI generated: {row[1]}")
        print(f"  PDF exports: {row[2]}")
        print(f"  Avg ATS score: {round(float(row[3] or 0), 1)}")
        
        # Get AI stats
        result = conn.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'success' THEN 1 END) as success,
                AVG(response_time_ms) as avg_time
            FROM ai_generation_logs
            WHERE module = 'resume'
        """))
        row = result.fetchone()
        print(f"  AI requests: {row[0]}")
        print(f"  Successful: {row[1]}")
        print(f"  Avg response time: {round(float(row[2] or 0), 1)}ms")


if __name__ == "__main__":
    print("🚀 Resume Admin Test Data Generator")
    print("====================================\n")
    
    # Get user IDs from database
    print("📥 Fetching user IDs from database...")
    with engine.begin() as conn:
        result = conn.execute(text("SELECT id FROM users LIMIT 20"))
        user_ids = [row[0] for row in result.fetchall()]
    
    if not user_ids:
        print("❌ No users found in database. Create users first.")
        print("\nTo create test users:")
        print("1. Register users via frontend")
        print("2. Or insert via SQL: INSERT INTO users (email, name, hashed_password, plan) VALUES (...)")
        exit(1)
    
    print(f"✅ Found {len(user_ids)} users\n")
    
    # Generate data
    generate_resume_tracking(user_ids, 100)
    generate_ai_logs(user_ids, 200)
    
    # Verify
    verify_data()
    
    print("\n====================================")
    print("✅ Test data generation complete!")
    print("\nNext steps:")
    print("1. Run API tests: ./tests/test_resume_admin_api.sh <token>")
    print("2. Run pytest: pytest tests/test_resume_admin.py -v")
    print("3. Check admin dashboard in browser")
