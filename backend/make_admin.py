"""Make a user an admin"""
import sys
from database import SessionLocal
from models import User

def make_admin(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email {email} not found")
            sys.exit(1)
        
        user.is_admin = True
        db.commit()
        print(f"✅ {user.name} ({user.email}) is now an admin!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        print("\nExample: python make_admin.py samarthkumar.chavda119328@marwadiuniversity.ac.in")
        sys.exit(1)
    
    email = sys.argv[1]
    make_admin(email)
