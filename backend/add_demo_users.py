"""Add demo users to the database"""
import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Base
import bcrypt

def hash_password(password: str) -> str:
    """Hash a password"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def add_demo_users():
    """Add demo users to the database"""
    db = SessionLocal()
    
    try:
        # Demo users data
        demo_users = [
            {
                "email": "demo.user@example.com",
                "name": "Demo User",
                "password": "demo123",
                "is_google_user": False,
                "plan": "free"
            },
            {
                "email": "john.doe@gmail.com",
                "name": "John Doe",
                "password": "GOOGLE_OAUTH_USER",
                "is_google_user": True,
                "plan": "basic"
            },
            {
                "email": "jane.smith@gmail.com",
                "name": "Jane Smith",
                "password": "GOOGLE_OAUTH_USER",
                "is_google_user": True,
                "plan": "pro"
            },
            {
                "email": "test.student@example.com",
                "name": "Test Student",
                "password": "student123",
                "is_google_user": False,
                "plan": "free"
            }
        ]
        
        added_count = 0
        skipped_count = 0
        
        for user_data in demo_users:
            # Check if user already exists
            existing_user = db.query(User).filter(
                User.email == user_data["email"]
            ).first()
            
            if existing_user:
                print(f"⏭️  Skipping {user_data['email']} (already exists)")
                skipped_count += 1
                continue
            
            # Hash password for non-Google users
            if not user_data["is_google_user"]:
                hashed_password = hash_password(user_data["password"])
            else:
                hashed_password = user_data["password"]  # Already "GOOGLE_OAUTH_USER"
            
            # Create new user
            new_user = User(
                email=user_data["email"],
                name=user_data["name"],
                hashed_password=hashed_password,
                is_google_user=user_data["is_google_user"],
                plan=user_data["plan"]
            )
            
            db.add(new_user)
            print(f"✅ Added {user_data['email']} ({user_data['plan'].upper()} plan)")
            added_count += 1
        
        db.commit()
        
        print(f"\n{'='*60}")
        print(f"📊 Summary:")
        print(f"   ✅ Added: {added_count} users")
        print(f"   ⏭️  Skipped: {skipped_count} users (already exist)")
        print(f"{'='*60}")
        
        # Show all users
        print(f"\n📋 All Users in Database:")
        print(f"{'='*60}")
        all_users = db.query(User).all()
        for user in all_users:
            auth_type = "🔐 Google OAuth" if user.is_google_user else "🔑 Password"
            plan_emoji = {"free": "🆓", "basic": "📘", "pro": "⭐"}.get(user.plan.value if hasattr(user.plan, 'value') else user.plan, "❓")
            print(f"{plan_emoji} {user.name} ({user.email})")
            print(f"   Auth: {auth_type}")
            print(f"   Plan: {user.plan.value.upper() if hasattr(user.plan, 'value') else user.plan.upper()}")
            print()
        
        print(f"{'='*60}")
        print(f"Total users: {len(all_users)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    print("Adding demo users to database...")
    print()
    add_demo_users()
