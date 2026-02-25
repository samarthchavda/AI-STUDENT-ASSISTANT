#!/usr/bin/env python3
"""
Script to create an admin user or make an existing user admin
"""
import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
from auth import get_password_hash

def create_admin_user(email: str, password: str, name: str):
    """Create a new admin user"""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            print(f"❌ User with email {email} already exists!")
            print(f"   Use make_admin.py to make them an admin instead.")
            return False
        
        # Create new admin user
        hashed_password = get_password_hash(password)
        admin_user = User(
            email=email,
            name=name,
            hashed_password=hashed_password,
            is_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Admin user created successfully!")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print(f"   Admin: Yes")
        print(f"\n🔐 You can now login with these credentials")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    print("=" * 60)
    print("🔐 Create Admin User")
    print("=" * 60)
    print()
    
    # Get user input
    email = input("Enter admin email: ").strip()
    if not email:
        print("❌ Email is required!")
        return
    
    name = input("Enter admin name: ").strip()
    if not name:
        print("❌ Name is required!")
        return
    
    password = input("Enter admin password (min 6 characters): ").strip()
    if not password or len(password) < 6:
        print("❌ Password must be at least 6 characters!")
        return
    
    confirm_password = input("Confirm password: ").strip()
    if password != confirm_password:
        print("❌ Passwords do not match!")
        return
    
    print()
    print("Creating admin user...")
    create_admin_user(email, password, name)

if __name__ == "__main__":
    main()
