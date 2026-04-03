#!/usr/bin/env python3
"""
Run DSA tracking tables migration
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from app.core.database import engine

def run_migration():
    """Run the DSA tracking migration"""
    migration_file = Path(__file__).parent / "migrations" / "create_dsa_tracking_tables.sql"
    
    print(f"Reading migration from: {migration_file}")
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    print("Running DSA tracking migration...")
    
    try:
        with engine.connect() as conn:
            # Execute the migration
            conn.execute(text(sql))
            conn.commit()
            print("✅ DSA tracking tables created successfully!")
            
            # Verify tables exist
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('dsa_submissions', 'dsa_user_progress', 'dsa_ai_usage')
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            print(f"\n✅ Verified tables: {', '.join(tables)}")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()
