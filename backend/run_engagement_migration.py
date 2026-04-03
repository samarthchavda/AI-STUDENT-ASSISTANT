#!/usr/bin/env python3
"""Run engagement and monetization system migration"""

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
        'create_engagement_system.sql'
    )
    
    print(f"Reading migration from: {migration_file}")
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    try:
        with engine.connect() as conn:
            print("Running engagement system migration...")
            conn.execute(text(sql))
            conn.commit()
            print("✅ Engagement system tables created successfully!")
            
            # Verify tables
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN (
                    'daily_challenges', 
                    'company_sheets', 
                    'learning_roadmaps',
                    'user_subscriptions',
                    'user_notifications',
                    'resume_ats_history'
                )
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            print(f"\n✅ Verified tables: {', '.join(tables)}")
            
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()
