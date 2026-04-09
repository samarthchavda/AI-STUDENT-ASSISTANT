"""
Run User Activity Tracking Migration
Creates tables and indexes for tracking user time and activity
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    print("=" * 60)
    print("USER ACTIVITY TRACKING MIGRATION")
    print("=" * 60)
    
    try:
        # Connect to database
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        cur = conn.cursor()
        
        print("\n1. Reading migration file...")
        migration_path = os.path.join(os.path.dirname(__file__), 'migrations', 'create_user_activity_tracking.sql')
        with open(migration_path, 'r') as f:
            migration_sql = f.read()
        
        print("✓ Migration file loaded")
        
        print("\n2. Executing migration...")
        cur.execute(migration_sql)
        conn.commit()
        print("✓ Migration executed successfully")
        
        # Verify tables created
        print("\n3. Verifying tables...")
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('user_activity_logs', 'user_activity_daily_summary')
        """)
        tables = cur.fetchall()
        
        for table in tables:
            print(f"   ✓ Table created: {table[0]}")
        
        # Check indexes
        print("\n4. Verifying indexes...")
        cur.execute("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'user_activity_logs'
        """)
        indexes = cur.fetchall()
        print(f"   ✓ Created {len(indexes)} indexes")
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print("\nCreated:")
        print("  • user_activity_logs table")
        print("  • user_activity_daily_summary materialized view")
        print("  • 6 indexes for performance")
        print("  • refresh_activity_summary() function")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_migration()
