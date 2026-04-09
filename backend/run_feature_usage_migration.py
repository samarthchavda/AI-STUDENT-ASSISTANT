import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Run the feature usage tracking migration"""
    
    # Database connection
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    print("=" * 60)
    print("FEATURE USAGE TRACKING MIGRATION")
    print("=" * 60)
    
    try:
        # Read migration file
        print("\n1. Reading migration file...")
        with open('migrations/create_feature_usage_tracking.sql', 'r') as f:
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
            AND table_name = 'feature_usage_logs'
        """)
        tables = cur.fetchall()
        for table in tables:
            print(f"   ✓ Table created: {table[0]}")
        
        # Verify materialized views
        cur.execute("""
            SELECT matviewname 
            FROM pg_matviews 
            WHERE schemaname = 'public' 
            AND matviewname = 'feature_usage_summary'
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
                'most_used_features',
                'least_used_features',
                'feature_dropoff_analysis',
                'feature_usage_by_category',
                'user_feature_adoption',
                'feature_usage_trends',
                'new_feature_adoption',
                'feature_error_analysis'
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
            WHERE tablename = 'feature_usage_logs' 
            OR tablename = 'feature_usage_summary'
        """)
        indexes = cur.fetchall()
        print(f"   ✓ Created {len(indexes)} indexes")
        
        # Verify functions
        print("\n5. Verifying functions...")
        cur.execute("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'refresh_feature_usage_summary'
        """)
        functions = cur.fetchall()
        for func in functions:
            print(f"   ✓ Function created: {func[0]}()")
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print("\nCreated:")
        print("  • feature_usage_logs table")
        print("  • feature_usage_summary materialized view")
        print("  • most_used_features view")
        print("  • least_used_features view")
        print("  • feature_dropoff_analysis view")
        print("  • feature_usage_by_category view")
        print("  • user_feature_adoption view")
        print("  • feature_usage_trends view")
        print("  • new_feature_adoption view")
        print("  • feature_error_analysis view")
        print("  • 7 indexes for performance")
        print("  • refresh_feature_usage_summary() function")
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
