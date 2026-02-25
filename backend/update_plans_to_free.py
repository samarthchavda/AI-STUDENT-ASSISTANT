#!/usr/bin/env python3
"""Update specific users' plans to free"""
from database import SessionLocal
from models import User, PlanType

def update_users_to_free():
    db = SessionLocal()
    try:
        # Get users with basic and pro plans
        users_to_update = db.query(User).filter(
            User.plan.in_([PlanType.BASIC, PlanType.PRO])
        ).all()
        
        if not users_to_update:
            print("No users found with basic or pro plans.")
            return
        
        print(f"Found {len(users_to_update)} user(s) to update:")
        for user in users_to_update:
            print(f"  - {user.name} ({user.email}): {user.plan} -> free")
        
        # Update their plans
        for user in users_to_update:
            user.plan = PlanType.FREE
        
        db.commit()
        print("\n✓ Successfully updated all users to FREE plan!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_users_to_free()
