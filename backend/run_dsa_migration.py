#!/usr/bin/env python3
"""
Migration script to create DSA Practice Module tables
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    """Run the DSA tables migration"""
    print("🔄 Starting DSA Practice Module migration...")
    
    engine = create_engine(settings.database_url)
    migration_file = Path(__file__).parent / "migrations" / "create_dsa_tables.sql"
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        return False
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    try:
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
            print("✅ Migration completed successfully!")
            print("   Created tables:")
            print("   - dsa_problems")
            print("   - dsa_submissions")
            print("   - dsa_progress")
            print("   - dsa_user_stats")
            print("   - dsa_hints")
            return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
