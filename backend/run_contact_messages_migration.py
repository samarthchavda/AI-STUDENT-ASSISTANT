"""
Run contact messages table migration
"""
import psycopg2
from app.core.config import settings

def run_migration():
    """Execute the contact messages migration"""
    try:
        # Connect to database
        conn = psycopg2.connect(settings.DATABASE_URL)
        cursor = conn.cursor()
        
        print("Running contact messages migration...")
        
        # Read and execute migration file
        with open('migrations/create_contact_messages.sql', 'r') as f:
            migration_sql = f.read()
            cursor.execute(migration_sql)
        
        conn.commit()
        print("✅ Contact messages table created successfully!")
        
        # Verify table exists
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'contact_messages'
        """)
        
        if cursor.fetchone():
            print("✅ Verified: contact_messages table exists")
        else:
            print("❌ Warning: contact_messages table not found after migration")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    run_migration()
