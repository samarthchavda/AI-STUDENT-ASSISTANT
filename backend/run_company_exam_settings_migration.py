#!/usr/bin/env python3
"""
Run company exam settings migration
"""
from sqlalchemy import text
from app.core.database import engine

def run_migration():
    """Run the company exam settings migration"""
    try:
        with open('migrations/create_company_exam_settings.sql', 'r') as f:
            sql = f.read()
        
        with engine.begin() as connection:
            print("Running company exam settings migration...")
            connection.execute(text(sql))
            print("✅ Migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    print("=" * 60)
    print("Company Exam Settings Migration")
    print("=" * 60)
    run_migration()
