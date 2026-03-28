"""
Migration script to add solutions_viewed column to users table
"""
from sqlalchemy import text
from app.core.database import engine

def run_migration():
    try:
        with engine.begin() as connection:
            # Read and execute the migration SQL
            with open('migrations/add_solutions_viewed.sql', 'r') as f:
                sql = f.read()
                connection.execute(text(sql))
        
        print("✅ Migration completed successfully!")
        print("   Added solutions_viewed column to users table")
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    print("🔄 Running solutions_viewed migration...")
    run_migration()
