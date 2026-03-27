"""
Check user count mismatch between admin panel and database
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models import User

def check_user_counts():
    db = SessionLocal()
    try:
        # Total users in database
        total_users = db.query(User).count()
        print(f"📊 Total users in database: {total_users}")
        
        # Users by auth provider
        google_users = db.query(User).filter(User.auth_provider == "google").count()
        local_users = db.query(User).filter(User.auth_provider == "local").count()
        print(f"   - Google users: {google_users}")
        print(f"   - Local users: {local_users}")
        
        # Admin users
        admin_users = db.query(User).filter(User.is_admin == True).count()
        print(f"   - Admin users: {admin_users}")
        
        # Users with/without password
        users_with_password = db.query(User).filter(User.hashed_password != None).count()
        users_without_password = db.query(User).filter(User.hashed_password == None).count()
        print(f"   - Users with password: {users_with_password}")
        print(f"   - Users without password: {users_without_password}")
        
        print("\n📋 All users in database:")
        users = db.query(User).order_by(User.id).all()
        for user in users:
            print(f"   ID: {user.id:3d} | Email: {user.email:40s} | Name: {user.name:25s} | Provider: {user.auth_provider:8s} | Admin: {user.is_admin}")
        
        print("\n🔍 Checking for potential issues:")
        
        # Check for duplicate emails
        from sqlalchemy import func
        duplicates = db.query(User.email, func.count(User.id)).group_by(User.email).having(func.count(User.id) > 1).all()
        if duplicates:
            print(f"   ⚠️  Found {len(duplicates)} duplicate emails:")
            for email, count in duplicates:
                print(f"      - {email}: {count} accounts")
        else:
            print("   ✅ No duplicate emails found")
        
        # Check for users with NULL/empty names
        null_names = db.query(User).filter((User.name == None) | (User.name == '')).count()
        if null_names > 0:
            print(f"   ⚠️  Found {null_names} users with NULL/empty names")
        else:
            print("   ✅ All users have names")
        
        # Check for soft-deleted users (if column exists)
        try:
            soft_deleted = db.query(User).filter(User.deleted_at != None).count()
            if soft_deleted > 0:
                print(f"   ⚠️  Found {soft_deleted} soft-deleted users (not shown in admin panel)")
            else:
                print("   ✅ No soft-deleted users")
        except:
            print("   ℹ️  No soft-delete column (using hard delete)")
        
        print("\n💡 Admin Panel Query Simulation:")
        print("   Endpoint: GET /api/admin/users")
        print("   Query: db.query(User).offset(0).limit(100).all()")
        
        # Simulate admin panel query
        admin_panel_users = db.query(User).offset(0).limit(100).all()
        print(f"   Result: {len(admin_panel_users)} users returned")
        
        if len(admin_panel_users) != total_users:
            print(f"\n   ⚠️  MISMATCH DETECTED!")
            print(f"   Database total: {total_users}")
            print(f"   Admin panel shows: {len(admin_panel_users)}")
            print(f"   Difference: {total_users - len(admin_panel_users)} users hidden")
        else:
            print(f"\n   ✅ No mismatch - Admin panel should show all {total_users} users")
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🔍 Checking user count mismatch...\n")
    check_user_counts()
