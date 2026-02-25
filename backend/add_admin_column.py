"""Add is_admin column to users table"""
from sqlalchemy import text
from database import engine

def add_admin_column():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE"))
        conn.commit()
        print("✅ Added is_admin column to users table")

if __name__ == "__main__":
    add_admin_column()
