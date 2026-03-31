"""
Run growth features migration
"""
import psycopg2
import os
from dotenv import load_dotenv
import random
import string

load_dotenv()

def generate_referral_code(length=8):
    """Generate a unique referral code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def run_migration():
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found")
        return
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("🔄 Running growth features migration...")
        
        # Run migration SQL
        with open('migrations/create_growth_features.sql', 'r') as f:
            migration_sql = f.read()
        
        cursor.execute(migration_sql)
        conn.commit()
        
        print("✅ Migration completed successfully!")
        
        # Generate referral codes for existing users
        print("\n🔄 Generating referral codes for existing users...")
        cursor.execute("SELECT id, email FROM users WHERE referral_code IS NULL")
        users = cursor.fetchall()
        
        for user_id, email in users:
            # Generate unique referral code
            while True:
                code = generate_referral_code()
                cursor.execute("SELECT id FROM users WHERE referral_code = %s", (code,))
                if not cursor.fetchone():
                    break
            
            cursor.execute("UPDATE users SET referral_code = %s WHERE id = %s", (code, user_id))
        
        conn.commit()
        print(f"✅ Generated referral codes for {len(users)} users")
        
        print("\n📊 Created tables:")
        print("   - referrals")
        print("   - user_engagement_logs")
        print("   - leaderboard_history")
        print("   - email_campaigns")
        print("   - email_logs")
        print("   - revenue_analytics")
        
        print("\n📊 Updated tables:")
        print("   - users (referral tracking, engagement)")
        print("   - payments (transaction details)")
        print("   - dsa_user_stats (leaderboard management)")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if conn:
            conn.rollback()

if __name__ == "__main__":
    run_migration()
