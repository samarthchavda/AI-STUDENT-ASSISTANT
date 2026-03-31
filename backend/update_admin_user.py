"""
Update admin user - Remove old admin and create new one
"""
import psycopg2
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

# Password hashing with bcrypt 72-byte limit handling
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    deprecated="auto",
    bcrypt__truncate_error=False,
)

def get_password_hash(password: str) -> str:
    """Hash password with safety check for bcrypt 72-byte limit"""
    pw_bytes = password.encode('utf-8')
    if len(pw_bytes) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def update_admin():
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        print("🔄 Updating admin user...")
        
        # 1. Remove old admin@gmail.com
        print("\n1️⃣ Removing old admin@gmail.com...")
        
        # First, delete all related data for admin@gmail.com
        cursor.execute("SELECT id FROM users WHERE email = 'admin@gmail.com'")
        old_admin = cursor.fetchone()
        
        if old_admin:
            old_admin_id = old_admin[0]
            print(f"   Found old admin with ID: {old_admin_id}")
            
            # Delete all related data
            cursor.execute("DELETE FROM refresh_tokens WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} refresh tokens")
            
            cursor.execute("DELETE FROM notifications WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} notifications")
            
            cursor.execute("DELETE FROM chat_history WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} chat history records")
            
            cursor.execute("DELETE FROM user_progress WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} user progress records")
            
            cursor.execute("DELETE FROM payments WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} payment records")
            
            cursor.execute("DELETE FROM user_practice WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} practice records")
            
            cursor.execute("DELETE FROM user_usage WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} usage records")
            
            # DSA related tables
            cursor.execute("DELETE FROM dsa_submissions WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} DSA submissions")
            
            cursor.execute("DELETE FROM dsa_progress WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} DSA progress records")
            
            cursor.execute("DELETE FROM dsa_user_stats WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} DSA stats records")
            
            cursor.execute("DELETE FROM dsa_hints WHERE user_id = %s", (old_admin_id,))
            print(f"   ✅ Deleted {cursor.rowcount} DSA hints")
            
            # Delete user
            cursor.execute("DELETE FROM users WHERE id = %s", (old_admin_id,))
            print(f"   ✅ Deleted admin@gmail.com user")
        else:
            print("   ℹ️  No user found with email admin@gmail.com")
        
        # 2. Check if chavdasamarth007@gmail.com exists
        print("\n2️⃣ Checking for chavdasamarth007@gmail.com...")
        cursor.execute("SELECT id, is_admin, plan FROM users WHERE email = 'chavdasamarth007@gmail.com'")
        existing_user = cursor.fetchone()
        
        if existing_user:
            user_id, is_admin, plan = existing_user
            print(f"   ℹ️  User already exists (ID: {user_id})")
            
            # Update to admin and PRO plan
            print("\n3️⃣ Updating user to admin with PRO plan...")
            hashed_password = get_password_hash("Samarth@3025")
            cursor.execute("""
                UPDATE users 
                SET is_admin = TRUE, 
                    plan = 'PRO',
                    hashed_password = %s,
                    name = 'Chavda Samarth'
                WHERE email = 'chavdasamarth007@gmail.com'
            """, (hashed_password,))
            print("   ✅ User updated to admin with PRO plan")
            print("   ✅ Password set to: Samarth@3025")
            print("   ✅ Name set to: Chavda Samarth")
        else:
            # Create new user
            print("\n3️⃣ Creating new admin user...")
            hashed_password = get_password_hash("Samarth@3025")
            cursor.execute("""
                INSERT INTO users (
                    email, 
                    name, 
                    hashed_password, 
                    is_admin, 
                    plan,
                    is_google_user,
                    auth_provider,
                    solutions_viewed
                ) VALUES (
                    'chavdasamarth007@gmail.com',
                    'Chavda Samarth',
                    %s,
                    TRUE,
                    'PRO',
                    FALSE,
                    'local',
                    0
                )
            """, (hashed_password,))
            print("   ✅ New admin user created")
            print("   ✅ Email: chavdasamarth007@gmail.com")
            print("   ✅ Password: Samarth@3025")
            print("   ✅ Name: Chavda Samarth")
            print("   ✅ Plan: PRO")
            print("   ✅ Admin: YES")
        
        conn.commit()
        
        print("\n" + "="*60)
        print("✅ Admin user update completed successfully!")
        print("="*60)
        print("\n📋 Login Credentials:")
        print("   Email: chavdasamarth007@gmail.com")
        print("   Password: Samarth@3025")
        print("   Role: Admin")
        print("   Plan: PRO")
        print("\n🔐 You can now login to the admin panel with these credentials")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Update failed: {e}")
        if conn:
            conn.rollback()

if __name__ == "__main__":
    update_admin()
