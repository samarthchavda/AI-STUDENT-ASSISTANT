#!/usr/bin/env python3
"""
Run Google Auth optimization migration
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

print("🔧 Running Google Auth optimization migration...")

try:
    engine = create_engine(DATABASE_URL)
    
    with open("migrations/optimize_google_auth.sql", "r") as f:
        migration_sql = f.read()
    
    with engine.begin() as connection:
        # Execute migration
        connection.execute(text(migration_sql))
    
    print("✅ Google Auth optimization completed successfully!")
    print("\nOptimizations applied:")
    print("  • Composite index on (email, auth_provider)")
    print("  • Partial index on is_google_user")
    print("  • Composite index on refresh_tokens")
    print("  • Index on token_blacklist expires_at")
    print("  • Table statistics updated")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    exit(1)
