"""
Resume Admin Tables Migration Runner
Creates resume_tracking and ai_generation_logs tables
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in environment variables")
    exit(1)

print("🚀 Starting Resume Admin Tables Migration...")
print(f"📊 Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'localhost'}")

try:
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Read migration SQL
    with open("migrations/create_resume_admin_tables.sql", "r") as f:
        migration_sql = f.read()
    
    # Execute migration
    with engine.begin() as connection:
        # Split by semicolon and execute each statement
        statements = [s.strip() for s in migration_sql.split(';') if s.strip()]
        
        for statement in statements:
            if statement:
                connection.execute(text(statement))
        
        print("✅ Migration completed successfully!")
        print("\n📋 Created tables:")
        print("   - resume_tracking")
        print("   - ai_generation_logs")
        print("   - ai_settings")
        print("\n📊 Created indexes:")
        print("   - idx_resume_tracking_user")
        print("   - idx_resume_tracking_template")
        print("   - idx_resume_tracking_created")
        print("   - idx_ai_logs_user")
        print("   - idx_ai_logs_module")
        print("   - idx_ai_logs_type")
        print("   - idx_ai_logs_status")
        print("   - idx_ai_logs_created")
        print("   - idx_ai_settings_module")
        print("\n🎯 Default settings:")
        print("   - Resume module AI settings initialized")
        
except Exception as e:
    print(f"❌ Migration failed: {str(e)}")
    exit(1)

print("\n✨ Resume Admin system is ready!")
print("🎯 You can now:")
print("   - Track resume creation and usage")
print("   - Monitor AI generation requests")
print("   - View analytics in admin panel")
