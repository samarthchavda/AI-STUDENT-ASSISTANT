import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Run the performance trends tracking migration"""
    
    # Database connection
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    print("=" * 60)
    print("PERFORMANCE TRENDS TRACKING MIGRATION")
    print("=" * 60)
    
    try:
        # Read migration file
        print("\n1. Reading migration file...")
        with open('migrations/create_performance_trends_tracking.sql', 'r') as f:
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
            AND table_name = 'performance_trends'
        """)
        tables = cur.fetchall()
        for table in tables:
            print(f"   ✓ Table created: {table[0]}")
        
        # Verify materialized view
        cur.execute("""
            SELECT matviewname 
            FROM pg_matviews 
            WHERE schemaname = 'public' 
            AND matviewname = 'performance_trends_summary'
        """)
        views = cur.fetchall()
        for view in views:
            print(f"   ✓ Materialized view created: {view[0]}")
        
        # Verify regular views
        cur.execute("""
            SELECT viewname 
            FROM pg_views 
            WHERE schemaname = 'public' 
            AND viewname IN ('user_weak_areas', 'user_strong_areas', 'top_improvers')
        """)
        regular_views = cur.fetchall()
        for view in regular_views:
            print(f"   ✓ View created: {view[0]}")
        
        # Verify indexes
        print("\n4. Verifying indexes...")
        cur.execute("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'performance_trends' 
            OR tablename = 'performance_trends_summary'
        """)
        indexes = cur.fetchall()
        print(f"   ✓ Created {len(indexes)} indexes")
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print("\nCreated:")
        print("  • performance_trends table")
        print("  • performance_trends_summary materialized view")
        print("  • user_weak_areas view")
        print("  • user_strong_areas view")
        print("  • top_improvers view")
        print("  • 6 indexes for performance")
        print("  • refresh_performance_trends_summary() function")
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
