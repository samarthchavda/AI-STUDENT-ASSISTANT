"""
Fix user_usage cascade delete constraint
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from sqlalchemy import text

def run_migration():
    db = SessionLocal()
    try:
        print("🔧 Fixing user_usage cascade delete constraint...")
        
        # Read migration file
        with open('migrations/fix_user_usage_cascade.sql', 'r') as f:
            sql = f.read()
        
        # Split by semicolon and execute each statement
        statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]
        
        for statement in statements:
            if statement:
                print(f"\n📝 Executing: {statement[:100]}...")
                db.execute(text(statement))
        
        db.commit()
        print("\n✅ Migration completed successfully!")
        
        # Verify the fix
        print("\n🔍 Verifying foreign key constraints:")
        result = db.execute(text("""
            SELECT 
                tc.constraint_name,
                rc.delete_rule
            FROM information_schema.table_constraints AS tc
            LEFT JOIN information_schema.referential_constraints AS rc
                ON tc.constraint_name = rc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = 'user_usage'
        """)).fetchall()
        
        for row in result:
            print(f"   - {row[0]}: {row[1]}")
        
        # Check if CASCADE is present
        has_cascade = any(row[1] == 'CASCADE' for row in result)
        has_no_action = any(row[1] == 'NO ACTION' for row in result)
        
        if has_cascade and not has_no_action:
            print("\n✅ Fix verified: CASCADE constraint active, NO ACTION removed")
        elif has_no_action:
            print("\n⚠️  Warning: NO ACTION constraint still exists")
        else:
            print("\n⚠️  Warning: No CASCADE constraint found")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
