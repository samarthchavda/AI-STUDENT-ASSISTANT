#!/usr/bin/env python3
"""
Script to view all users in the database
Run: python view_users.py
"""

from database import SessionLocal
from models import User

def view_users():
    db = SessionLocal()
    users = db.query(User).order_by(User.created_at.desc()).all()
    
    print('\n' + '='*60)
    print('           ALL USERS IN DATABASE')
    print('='*60 + '\n')
    
    if users:
        for idx, user in enumerate(users, 1):
            print(f'User #{idx}')
            print(f'  ID:           {user.id}')
            print(f'  Name:         {user.name}')
            print(f'  Email:        {user.email}')
            print(f'  Admin:        {"🔐 YES" if user.is_admin else "👤 No"}')
            print(f'  Google User:  {"✓ Yes" if user.is_google_user else "✗ No (Email/Password)"}')
            print(f'  Plan Type:    {user.plan.value}')
            print(f'  Created:      {user.created_at.strftime("%Y-%m-%d %H:%M:%S")}')
            print('-' * 60)
        
        print(f'\n📊 Total Users: {len(users)}')
        admin_users = sum(1 for u in users if u.is_admin)
        google_users = sum(1 for u in users if u.is_google_user)
        print(f'   - Admin Users: {admin_users}')
        print(f'   - Google OAuth: {google_users}')
        print(f'   - Email/Password: {len(users) - google_users}')
    else:
        print('📭 No users found in database yet.')
        print('\n💡 Try one of these to create users:')
        print('   1. Sign up with Google OAuth at http://localhost:3000/auth')
        print('   2. Sign up with email/password at http://localhost:3000/auth')
    
    print('\n' + '='*60 + '\n')
    db.close()

if __name__ == '__main__':
    view_users()
