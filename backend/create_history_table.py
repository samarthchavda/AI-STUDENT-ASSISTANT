#!/usr/bin/env python3
"""
Script to create the aptitude_exam_history table
Run this script to set up the exam history feature
"""

from sqlalchemy import text
from app.core.database import engine

def create_history_table():
    """Create aptitude_exam_history table and indexes"""
    try:
        with engine.begin() as connection:
            # Create table
            print("Creating aptitude_exam_history table...")
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS aptitude_exam_history (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER,
                    company VARCHAR(100) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    difficulty VARCHAR(20) NOT NULL,
                    score INTEGER NOT NULL,
                    total_questions INTEGER NOT NULL,
                    correct INTEGER NOT NULL,
                    wrong INTEGER NOT NULL,
                    skipped INTEGER NOT NULL,
                    score_percent DECIMAL(5,2) NOT NULL,
                    exam_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    questions_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("✅ Table created successfully")
            
            # Create indexes
            print("Creating indexes...")
            connection.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_exam_history_date ON aptitude_exam_history(exam_date DESC)"
            ))
            connection.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_exam_history_company ON aptitude_exam_history(company)"
            ))
            connection.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_exam_history_user ON aptitude_exam_history(user_id)"
            ))
            print("✅ Indexes created successfully")
            
            # Verify table exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'aptitude_exam_history'
                )
            """))
            exists = result.scalar()
            
            if exists:
                print("✅ Verification successful - table exists")
                
                # Count existing records
                count_result = connection.execute(text(
                    "SELECT COUNT(*) FROM aptitude_exam_history"
                ))
                count = count_result.scalar()
                print(f"📊 Current records in table: {count}")
            else:
                print("❌ Verification failed - table does not exist")
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("Aptitude Exam History Table Setup")
    print("=" * 60)
    create_history_table()
    print("=" * 60)
    print("Setup complete!")
