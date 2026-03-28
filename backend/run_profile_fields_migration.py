#!/usr/bin/env python3
"""
Migration script to add user profile fields to the users table.
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    """Run the profile fields migration"""
    print("🔄 Starting user profile fields migration...")
    
    engine = create_engine(settings.database_url)
    
    migration_file = Path(__file__).parent / "migrations" / "add_user_profile_fields.sql"
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        return False
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    try:
        with engine.connect() as conn:
            # Execute the migration
            conn.execute(text(sql))
            conn.commit()
            print("✅ Migration completed successfully!")
            print("   Added profile fields:")
            print("   - phone")
            print("   - phone_verified")
            print("   - college")
            print("   - branch")
            print("   - cgpa")
            print("   - graduation_year")
            print("   - linkedin_url")
            print("   - github_url")
            return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
