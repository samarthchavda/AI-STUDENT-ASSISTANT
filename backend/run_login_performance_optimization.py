#!/usr/bin/env python3
"""
Add database indexes to improve login performance
Indexes on users table for common queries:
- email (already exists via unique=True)
- failed_login_attempts (for account lock checks)
- account_locked_until (for account lock checks)
"""

import sqlite3
import logging
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def add_login_performance_indexes():
    """Add indexes to optimize login queries"""
    
    # Determine if using SQLite or PostgreSQL
    if settings.database_url.startswith("sqlite"):
        logger.info("🔍 Adding performance indexes for SQLite...")
        db_path = settings.database_url.replace("sqlite:///", "")
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Check existing indexes
            cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='users'")
            existing_indexes = [row[0] for row in cursor.fetchall()]
            logger.info(f"Existing indexes on users table: {existing_indexes}")
            
            # Add indexes if they don't exist
            indexes = [
                ("idx_users_failed_login", "CREATE INDEX IF NOT EXISTS idx_users_failed_login ON users(failed_login_attempts)"),
                ("idx_users_account_locked", "CREATE INDEX IF NOT EXISTS idx_users_account_locked ON users(account_locked_until)"),
                ("idx_users_email_auth_provider", "CREATE INDEX IF NOT EXISTS idx_users_email_auth ON users(email, auth_provider)"),
            ]
            
            for idx_name, sql in indexes:
                cursor.execute(sql)
                logger.info(f"✅ Created index: {idx_name}")
            
            conn.commit()
            conn.close()
            logger.info("✅ SQLite indexes created successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error creating indexes: {e}")
            raise
    
    else:
        # PostgreSQL - using raw SQL
        logger.info("🔍 Adding performance indexes for PostgreSQL...")
        logger.info("Please run the following SQL commands on your PostgreSQL database:")
        logger.info("""
CREATE INDEX IF NOT EXISTS idx_users_failed_login ON users(failed_login_attempts);
CREATE INDEX IF NOT EXISTS idx_users_account_locked ON users(account_locked_until);
CREATE INDEX IF NOT EXISTS idx_users_email_auth ON users(email, auth_provider);
        """)


if __name__ == "__main__":
    logger.info("🚀 Starting login performance optimization...")
    add_login_performance_indexes()
    logger.info("✅ Performance optimization complete!")
