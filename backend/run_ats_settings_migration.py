#!/usr/bin/env python3
"""
Run ATS Settings Migration
Adds ATS scoring configuration columns to ai_settings table
"""

import sys
from pathlib import Path
from sqlalchemy import text
from app.core.database import engine

def run_migration():
    """Execute the ATS settings migration"""
    migration_file = Path(__file__).parent / "migrations" / "add_ats_settings_columns.sql"
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        sys.exit(1)
    
    print("🚀 Running ATS Settings Migration...")
    print(f"📄 Reading: {migration_file}")
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    try:
        with engine.begin() as connection:
            print("⚙️  Executing SQL...")
            connection.execute(text(sql))
            print("✅ Migration completed successfully!")
            
            # Verify the columns were added
            result = connection.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'ai_settings' 
                AND column_name IN ('ats_enabled', 'ats_mode', 'keywords_weight', 
                                   'formatting_weight', 'experience_weight', 
                                   'skills_weight', 'readability_weight')
                ORDER BY column_name
            """))
            
            columns = [row[0] for row in result.fetchall()]
            print(f"\n📊 Verified columns added: {len(columns)}/7")
            for col in columns:
                print(f"   ✓ {col}")
            
            # Show current settings
            settings_result = connection.execute(text("""
                SELECT module, ats_enabled, ats_mode, keywords_weight, formatting_weight,
                       experience_weight, skills_weight, readability_weight
                FROM ai_settings
                WHERE module = 'resume'
            """))
            
            settings_row = settings_result.fetchone()
            if settings_row:
                print(f"\n⚙️  Current ATS Settings for 'resume' module:")
                print(f"   ATS Enabled: {settings_row[1]}")
                print(f"   ATS Mode: {settings_row[2]}")
                print(f"   Weights: Keywords={settings_row[3]}%, Formatting={settings_row[4]}%, "
                      f"Experience={settings_row[5]}%, Skills={settings_row[6]}%, Readability={settings_row[7]}%")
                print(f"   Total: {settings_row[3] + settings_row[4] + settings_row[5] + settings_row[6] + settings_row[7]}%")
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
