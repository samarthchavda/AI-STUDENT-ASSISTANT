import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Run the learning behavior tracking migration"""
    
    # Database connection
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    print("=" * 60)
    print("LEARNING BEHAVIOR TRACKING MIGRATION")
    print("=" * 60)
    
    try:
        # Read migration file
        print("\n1. Reading migration file...")
        with open('migrations/create_learning_behavior_tracking.sql', 'r') as f:
            migration_sql = f.read()
        print("✓ Migration file loaded")
        
        # Execute migration
        print("\n2. Executing migration...")
        cur.execute(migration_sql)
        conn.commit()
        print("✓ Migration executed successfully")
        
        # Verify tables
        print("\n3. Verifying tables...")
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'learning_behavior_logs'
        """)
        tables = cur.fetchall()
        for table in tables:
            print(f"   ✓ Table created: {table[0]}")
        
        # Verify materialized view
        cur.execute("""
            SELECT matviewname 
            FROM pg_matviews 
            WHERE schemaname = 'public' 
            AND matviewname = 'learning_behavior_summary'
        """)
        views = cur.fetchall()
        for view in views:
            print(f"   ✓ Materialized view created: {view[0]}")
        
        # Verify indexes
        print("\n4. Verifying indexes...")
        cur.execute("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'learning_behavior_logs' 
            OR tablename = 'learning_behavior_summary'
        """)
        indexes = cur.fetchall()
        print(f"   ✓ Created {len(indexes)} indexes")
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print("\nCreated:")
        print("  • learning_behavior_logs table")
        print("  • learning_behavior_summary materialized view")
        print("  • 6 indexes for performance")
        print("  • refresh_learning_behavior_summary() function")
        print()
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
