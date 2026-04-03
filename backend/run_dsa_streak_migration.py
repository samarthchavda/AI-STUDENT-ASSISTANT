#!/usr/bin/env python3
"""Run DSA streak and score migration"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

# Create engine
engine = create_engine(DATABASE_URL)

def run_migration():
    """Run the migration"""
    migration_file = os.path.join(
        os.path.dirname(__file__),
        'migrations',
        'add_dsa_streak_and_score.sql'
    )
    
    print(f"Reading migration from: {migration_file}")
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    try:
        with engine.connect() as conn:
            print("Running DSA streak migration...")
            conn.execute(text(sql))
            conn.commit()
            print("✅ DSA streak columns and functions added successfully!")
            
            # Verify columns
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'dsa_user_progress' 
                AND column_name IN ('score', 'current_streak', 'longest_streak', 'last_active_date')
            """))
            columns = [row[0] for row in result]
            print(f"\n✅ Verified columns: {', '.join(columns)}")
            
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()
