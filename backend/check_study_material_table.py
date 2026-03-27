"""Check if engineering_study_material table exists and show its structure"""

import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        # Check if table exists
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'engineering_study_material'
            );
        """))
        exists = result.fetchone()[0]
        
        if exists:
            print("✅ Table 'engineering_study_material' exists")
            
            # Get column info
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'engineering_study_material'
                ORDER BY ordinal_position;
            """))
            
            print("\n📋 Current Columns:")
            for row in result:
                nullable = "NULL" if row[2] == 'YES' else "NOT NULL"
                print(f"  • {row[0]} ({row[1]}) {nullable}")
            
            # Check row count
            result = conn.execute(text("SELECT COUNT(*) FROM engineering_study_material"))
            count = result.fetchone()[0]
            print(f"\n📊 Total rows: {count}")
            
            # Drop table
            print("\n🗑️ Dropping table to recreate with correct schema...")
            conn.execute(text("DROP TABLE IF EXISTS engineering_study_material CASCADE"))
            conn.commit()
            print("✅ Table dropped successfully")
        else:
            print("❌ Table 'engineering_study_material' does not exist")
            
except Exception as e:
    print(f"❌ Error: {e}")
