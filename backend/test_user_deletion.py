"""
Test user deletion with cascade
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models import User
from sqlalchemy import text

def test_deletion():
    db = SessionLocal()
    try:
        # Find a test user (not admin)
        test_user = db.query(User).filter(
            User.email == "test@example.com",
            User.is_admin == False
        ).first()
        
        if not test_user:
            print("❌ Test user not found. Create a test user first.")
            return
        
        user_id = test_user.id
        user_name = test_user.name
        user_email = test_user.email
        
        print(f"🎯 Testing deletion of user: {user_name} ({user_email})")
        print(f"   User ID: {user_id}")
        
        # Check related data before deletion
        chat_count = db.execute(text(f"SELECT COUNT(*) FROM chat_history WHERE user_id = {user_id}")).fetchone()[0]
        usage_count = db.execute(text(f"SELECT COUNT(*) FROM user_usage WHERE user_id = {user_id}")).fetchone()[0]
        
        print(f"\n📊 Related data:")
        print(f"   - Chat messages: {chat_count}")
        print(f"   - Usage records: {usage_count}")
        
        # Attempt deletion
        print(f"\n🗑️  Attempting to delete user...")
        db.delete(test_user)
        db.commit()
        
        print(f"✅ User deleted successfully!")
        
        # Verify cascade deletion
        print(f"\n🔍 Verifying cascade deletion:")
        remaining_chats = db.execute(text(f"SELECT COUNT(*) FROM chat_history WHERE user_id = {user_id}")).fetchone()[0]
        remaining_usage = db.execute(text(f"SELECT COUNT(*) FROM user_usage WHERE user_id = {user_id}")).fetchone()[0]
        
        print(f"   - Chat messages remaining: {remaining_chats}")
        print(f"   - Usage records remaining: {remaining_usage}")
        
        if remaining_chats == 0 and remaining_usage == 0:
            print(f"\n✅ CASCADE DELETE WORKING CORRECTLY!")
        else:
            print(f"\n⚠️  Some data not deleted - cascade may not be working")
        
    except Exception as e:
        print(f"\n❌ Error during deletion: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🧪 Testing User Deletion with Cascade\n")
    test_deletion()
