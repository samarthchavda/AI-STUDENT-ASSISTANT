#!/usr/bin/env python3
"""Run subscription tracking migration"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment")
    exit(1)

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("🔄 Running subscription tracking migration...")
    
    with open("migrations/add_subscription_tracking.sql", "r") as f:
        migration_sql = f.read()
    
    cur.execute(migration_sql)
    conn.commit()
    
    print("✅ Subscription tracking migration completed successfully!")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    exit(1)
