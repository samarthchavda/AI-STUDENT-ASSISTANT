#!/usr/bin/env python3
"""
Run the cascade delete migration
This adds ON DELETE CASCADE to foreign keys for faster user deletion
"""

from app.core.database import engine
from sqlalchemy import text

def run_migration():
    """Run the cascade delete migration"""
    print("=" * 60)
    print("Running CASCADE DELETE Migration")
    print("=" * 60)
    
    try:
        with open('migrations/add_cascade_delete.sql', 'r') as f:
            migration_sql = f.read()
        
        with engine.begin() as connection:
            print("\n📝 Executing migration as a single transaction...")
            
            # Execute the entire migration as one statement
            connection.execute(text(migration_sql))
            
            print("\n✅ Migration completed successfully!")
            print("\nForeign keys now have ON DELETE CASCADE:")
            print("  - aptitude_exam_history.user_id")
            print("  - notifications.user_id")
            print("  - user_usage.user_id")
            print("  - broadcasts.admin_id")
            print("\nUser deletion will now be much faster!")
            
    except FileNotFoundError:
        print("❌ Migration file not found: migrations/add_cascade_delete.sql")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()
