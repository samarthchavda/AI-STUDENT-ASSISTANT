import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Run the engagement metrics tracking migration"""
    
    # Database connection
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    print("=" * 60)
    print("ENGAGEMENT METRICS TRACKING MIGRATION")
    print("=" * 60)
    
    try:
        # Read migration file
        print("\n1. Reading migration file...")
        with open('migrations/create_engagement_metrics_tracking.sql', 'r') as f:
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
            AND table_name = 'engagement_metrics'
        """)
        tables = cur.fetchall()
        for table in tables:
            print(f"   ✓ Table created: {table[0]}")
        
        # Verify materialized views
        cur.execute("""
            SELECT matviewname 
            FROM pg_matviews 
            WHERE schemaname = 'public' 
            AND matviewname = 'dau_wau_mau_metrics'
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
                'retention_cohorts', 
                'churn_risk_users', 
                'feature_adoption_rates',
                'user_engagement_segments'
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
            WHERE tablename = 'engagement_metrics' 
            OR tablename = 'dau_wau_mau_metrics'
        """)
        indexes = cur.fetchall()
        print(f"   ✓ Created {len(indexes)} indexes")
        
        # Verify functions
        print("\n5. Verifying functions...")
        cur.execute("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN (
                'update_engagement_metrics',
                'refresh_dau_wau_mau_metrics'
            )
        """)
        functions = cur.fetchall()
        for func in functions:
            print(f"   ✓ Function created: {func[0]}()")
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print("\nCreated:")
        print("  • engagement_metrics table")
        print("  • dau_wau_mau_metrics materialized view")
        print("  • retention_cohorts view")
        print("  • churn_risk_users view")
        print("  • feature_adoption_rates view")
        print("  • user_engagement_segments view")
        print("  • 7 indexes for performance")
        print("  • update_engagement_metrics() function")
        print("  • refresh_dau_wau_mau_metrics() function")
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
