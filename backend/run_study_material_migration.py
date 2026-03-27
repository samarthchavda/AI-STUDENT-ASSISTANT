"""
Run engineering_study_material table migration
Creates table and inserts sample data for testing
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env file")
    exit(1)

# Create engine
engine = create_engine(DATABASE_URL)

print("🚀 Starting engineering_study_material migration...")

try:
    with engine.connect() as conn:
        # Read migration file
        with open("migrations/create_engineering_study_material.sql", "r") as f:
            sql_script = f.read()
        
        # Execute migration
        conn.execute(text(sql_script))
        conn.commit()
        
        print("✅ Migration completed successfully!")
        
        # Verify table creation
        result = conn.execute(text("""
            SELECT COUNT(*) as count FROM engineering_study_material
        """))
        count = result.fetchone()[0]
        
        print(f"✅ Table created with {count} sample records")
        
        # Show sample data
        result = conn.execute(text("""
            SELECT topic_name, branch, category, difficulty 
            FROM engineering_study_material 
            LIMIT 5
        """))
        
        print("\n📚 Sample Study Materials:")
        for row in result:
            print(f"  • {row[0]} ({row[1]} - {row[2]}) - {row[3]}")
        
        print("\n✅ Migration complete! AI is now study-material-aware.")
        print("💡 Test it: Ask 'What is Python?' or 'Explain Arduino' in the chat")

except Exception as e:
    print(f"❌ Migration failed: {e}")
    exit(1)
