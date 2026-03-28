"""
Migration script to add solutions_cache column to dsa_problems table
"""
import psycopg2
from app.core.config import settings

def run_migration():
    """Run the solutions_cache migration"""
    try:
        # Connect to database
        conn = psycopg2.connect(settings.database_url)
        cursor = conn.cursor()
        
        print("🔄 Running solutions_cache migration...")
        
        # Read and execute migration SQL
        with open('migrations/add_solutions_cache.sql', 'r') as f:
            sql = f.read()
            cursor.execute(sql)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Migration completed successfully!")
        print("   Added solutions_cache column to dsa_problems table")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()
