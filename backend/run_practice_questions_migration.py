#!/usr/bin/env python3
"""
Create aptitude practice questions table
"""

from app.core.database import engine
from sqlalchemy import text

def run_migration():
    print("=" * 60)
    print("Creating Aptitude Practice Questions Table")
    print("=" * 60)
    
    try:
        with open('migrations/create_aptitude_practice_questions.sql', 'r') as f:
            migration_sql = f.read()
        
        # Replace PostgreSQL-specific UUID function if needed
        migration_sql = migration_sql.replace('gen_random_uuid()', 'uuid_generate_v4()')
        
        with engine.begin() as connection:
            print("\n📝 Executing migration...")
            connection.execute(text(migration_sql))
            
            # Check if table was created
            result = connection.execute(text("""
                SELECT COUNT(*) FROM aptitude_practice_questions
            """))
            count = result.scalar()
            
            print(f"\n✅ Migration completed successfully!")
            print(f"📊 Total questions in database: {count}")
            print("\nTable created with columns:")
            print("  - id (UUID)")
            print("  - question (TEXT)")
            print("  - image (TEXT, nullable)")
            print("  - has_image (BOOLEAN)")
            print("  - options (JSONB)")
            print("  - answer (VARCHAR)")
            print("  - explanation (TEXT)")
            print("  - category, subcategory, difficulty")
            print("  - tags (JSONB)")
            print("  - source, hash")
            print("\n✨ Sample question inserted!")
            
    except FileNotFoundError:
        print("❌ Migration file not found")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_migration()
