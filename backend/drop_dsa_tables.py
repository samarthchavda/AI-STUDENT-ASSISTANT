#!/usr/bin/env python3
"""Drop existing DSA tracking tables"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

# Create engine
engine = create_engine(DATABASE_URL)

def drop_tables():
    """Drop DSA tracking tables"""
    try:
        with engine.connect() as conn:
            print("Dropping DSA tracking tables...")
            
            # Drop tables in reverse order (to handle dependencies)
            conn.execute(text("DROP TABLE IF EXISTS dsa_ai_usage CASCADE;"))
            print("✓ Dropped dsa_ai_usage")
            
            conn.execute(text("DROP TABLE IF EXISTS dsa_user_progress CASCADE;"))
            print("✓ Dropped dsa_user_progress")
            
            conn.execute(text("DROP TABLE IF EXISTS dsa_submissions CASCADE;"))
            print("✓ Dropped dsa_submissions")
            
            # Drop function if exists
            conn.execute(text("DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;"))
            print("✓ Dropped update_updated_at_column function")
            
            conn.commit()
            print("\n✅ All DSA tracking tables dropped successfully!")
            
    except Exception as e:
        print(f"\n❌ Failed to drop tables: {e}")
        raise

if __name__ == "__main__":
    drop_tables()
