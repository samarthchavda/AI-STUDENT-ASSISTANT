"""Add language column to chat_history table"""
from sqlalchemy import create_engine, text
from config import settings

engine = create_engine(settings.database_url)

with engine.connect() as conn:
    try:
        # Add language column
        conn.execute(text("""
            ALTER TABLE chat_history 
            ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'english'
        """))
        conn.commit()
        print("✅ Added language column to chat_history table")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Note: Column might already exist")
