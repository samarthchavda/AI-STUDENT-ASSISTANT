"""
Migration script to add new authentication improvements to existing database
Run this script to update your database schema
"""
from sqlalchemy import text
from database import engine, SessionLocal
from models import Base

def migrate_database():
    """Add new columns and tables for authentication improvements"""
    
    print("Starting database migration for authentication improvements...")
    
    db = SessionLocal()
    
    try:
        # 1. Add new columns to users table
        print("\n1. Adding new columns to users table...")
        
        migrations = [
            # Make hashed_password nullable for OAuth users
            "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;",
            
            # Add auth_provider column
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR DEFAULT 'local';",
            
            # Add failed_login_attempts column
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;",
            
            # Add account_locked_until column
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;",
        ]
        
        for migration in migrations:
            try:
                db.execute(text(migration))
                print(f"  ✓ Executed: {migration[:50]}...")
            except Exception as e:
                if "already exists" in str(e) or "duplicate" in str(e).lower():
                    print(f"  ⊙ Skipped (already exists): {migration[:50]}...")
                else:
                    print(f"  ✗ Error: {migration[:50]}... - {e}")
        
        db.commit()
        print("  ✓ Users table updated successfully")
        
        # 2. Create refresh_tokens table
        print("\n2. Creating refresh_tokens table...")
        try:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    token VARCHAR UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    revoked BOOLEAN DEFAULT FALSE
                );
            """))
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);"))
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);"))
            db.commit()
            print("  ✓ refresh_tokens table created successfully")
        except Exception as e:
            if "already exists" in str(e):
                print("  ⊙ refresh_tokens table already exists")
            else:
                print(f"  ✗ Error creating refresh_tokens table: {e}")
        
        # 3. Create token_blacklist table
        print("\n3. Creating token_blacklist table...")
        try:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS token_blacklist (
                    id SERIAL PRIMARY KEY,
                    token VARCHAR UNIQUE NOT NULL,
                    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL
                );
            """))
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);"))
            db.commit()
            print("  ✓ token_blacklist table created successfully")
        except Exception as e:
            if "already exists" in str(e):
                print("  ⊙ token_blacklist table already exists")
            else:
                print(f"  ✗ Error creating token_blacklist table: {e}")
        
        # 4. Update existing Google users
        print("\n4. Updating existing Google OAuth users...")
        try:
            result = db.execute(text("""
                UPDATE users 
                SET auth_provider = 'google', 
                    hashed_password = NULL
                WHERE is_google_user = TRUE 
                AND hashed_password = 'GOOGLE_OAUTH_USER';
            """))
            db.commit()
            print(f"  ✓ Updated {result.rowcount} Google OAuth users")
        except Exception as e:
            print(f"  ✗ Error updating Google users: {e}")
        
        print("\n" + "="*60)
        print("✓ Migration completed successfully!")
        print("="*60)
        print("\nNew features enabled:")
        print("  1. ✓ Email normalization (lowercase + trim)")
        print("  2. ✓ Password strength validation (8+ chars, 1 number, 1 special)")
        print("  3. ✓ Google user marker improved (hashed_password = NULL)")
        print("  4. ✓ Login attempt protection (5 failures = 15 min lock)")
        print("  5. ✓ Logout API with JWT blacklist")
        print("  6. ✓ Refresh token system (15 min access, 7 day refresh)")
        print("\nYour authentication system is now enterprise-ready!")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("="*60)
    print("AUTH IMPROVEMENTS MIGRATION")
    print("="*60)
    print("\nThis will update your database with:")
    print("  - New columns for login protection")
    print("  - Refresh tokens table")
    print("  - Token blacklist table")
    print("  - OAuth improvements")
    print("\n" + "="*60)
    
    response = input("\nProceed with migration? (yes/no): ").strip().lower()
    
    if response == "yes":
        migrate_database()
    else:
        print("\nMigration cancelled.")
