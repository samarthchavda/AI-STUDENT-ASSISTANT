import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Run the device & browser tracking migration"""
    
    # Database connection
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    print("=" * 60)
    print("DEVICE & BROWSER TRACKING MIGRATION")
    print("=" * 60)
    
    try:
        # Read migration file
        print("\n1. Reading migration file...")
        with open('migrations/create_device_browser_tracking.sql', 'r') as f:
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
            AND table_name = 'device_browser_logs'
        """)
        tables = cur.fetchall()
        for table in tables:
            print(f"   ✓ Table created: {table[0]}")
        
        # Verify materialized views
        cur.execute("""
            SELECT matviewname 
            FROM pg_matviews 
            WHERE schemaname = 'public' 
            AND matviewname = 'device_browser_summary'
        """)
        mat_views = cur.fetchall()
        for view in mat_views:
            print(f"   ✓ Materialized view created: {view[0]}")
        
        # Verify regular views
        cur.execute("""
            SELECT viewname 
            FROM pg_views 
            WHERE schemaname = 'public' 
            AND viewname IN (
                'device_type_distribution',
                'browser_distribution',
                'os_distribution',
                'screen_resolution_distribution',
                'mobile_vs_desktop',
                'user_device_preferences',
                'geographic_distribution',
                'connection_type_distribution',
                'device_trends'
            )
        """)
        regular_views = cur.fetchall()
        for view in regular_views:
            print(f"   ✓ View created: {view[0]}")
        
        # Verify indexes
        print("\n4. Verifying indexes...")
        cur.execute("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'device_browser_logs' 
            OR tablename = 'device_browser_summary'
        """)
        indexes = cur.fetchall()
        print(f"   ✓ Created {len(indexes)} indexes")
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print("\nCreated:")
        print("  • device_browser_logs table")
        print("  • device_browser_summary materialized view")
        print("  • device_type_distribution view")
        print("  • browser_distribution view")
        print("  • os_distribution view")
        print("  • screen_resolution_distribution view")
        print("  • mobile_vs_desktop view")
        print("  • user_device_preferences view")
        print("  • geographic_distribution view")
        print("  • connection_type_distribution view")
        print("  • device_trends view")
        print("  • 7 indexes for performance")
        print("  • refresh_device_browser_summary() function")
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
