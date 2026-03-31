"""
Run admin enhancements migration
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found")
        return
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("🔄 Running admin enhancements migration...")
        
        with open('migrations/create_admin_enhancements.sql', 'r') as f:
            migration_sql = f.read()
        
        cursor.execute(migration_sql)
        conn.commit()
        
        print("✅ Migration completed successfully!")
        print("\n📊 Created tables:")
        print("   - system_health_logs")
        print("   - admin_audit_logs")
        print("   - user_sessions")
        print("   - Updated broadcasts table")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if conn:
            conn.rollback()

if __name__ == "__main__":
    run_migration()
