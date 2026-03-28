"""
Run migration to fix notifications cascade delete
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("🔄 Running notifications cascade delete migration...")
        
        # Read and execute migration
        with open('migrations/fix_notifications_cascade.sql', 'r') as f:
            sql = f.read()
            cursor.execute(sql)
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print("✅ Notifications and broadcasts now cascade delete with users")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if conn:
            conn.rollback()

if __name__ == "__main__":
    run_migration()
