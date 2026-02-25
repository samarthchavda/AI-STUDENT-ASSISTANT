"""Admin routes for managing application data"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel

from database import get_db
from models import User, ChatHistory, UserProgress, Payment, PlanType
from auth import get_current_user

router = APIRouter()

# Response models
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    plan: str
    is_google_user: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    role: str
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class UserProgressResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    subject: str
    topic: str
    score: int
    completed_at: datetime
    
    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    plan: str
    amount: int
    currency: str
    status: str
    payment_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminStatsResponse(BaseModel):
    total_users: int
    free_users: int
    basic_users: int
    pro_users: int
    google_users: int
    regular_users: int
    total_chats: int
    total_payments: int
    total_revenue: int
    
# Dependency to check if user is admin
async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin access required."
        )
    return current_user

# Admin stats endpoint
@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get overall application statistics"""
    
    total_users = db.query(User).count()
    free_users = db.query(User).filter(User.plan == PlanType.FREE).count()
    basic_users = db.query(User).filter(User.plan == PlanType.BASIC).count()
    pro_users = db.query(User).filter(User.plan == PlanType.PRO).count()
    google_users = db.query(User).filter(User.is_google_user == True).count()
    regular_users = db.query(User).filter(User.is_google_user == False).count()
    total_chats = db.query(ChatHistory).count()
    total_payments = db.query(Payment).filter(Payment.status == "completed").count()
    
    # Calculate total revenue
    payments = db.query(Payment).filter(Payment.status == "completed").all()
    total_revenue = sum(p.amount for p in payments)
    
    return {
        "total_users": total_users,
        "free_users": free_users,
        "basic_users": basic_users,
        "pro_users": pro_users,
        "google_users": google_users,
        "regular_users": regular_users,
        "total_chats": total_chats,
        "total_payments": total_payments,
        "total_revenue": total_revenue
    }

# Get all users
@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all users"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# Get all chat history
@router.get("/chats", response_model=List[ChatHistoryResponse])
async def get_all_chats(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all chat history"""
    chats = db.query(ChatHistory).offset(skip).limit(limit).all()
    
    result = []
    for chat in chats:
        result.append({
            "id": chat.id,
            "user_id": chat.user_id,
            "user_name": chat.user.name,
            "user_email": chat.user.email,
            "role": chat.role,
            "content": chat.content,
            "timestamp": chat.timestamp
        })
    
    return result

# Get all user progress
@router.get("/progress", response_model=List[UserProgressResponse])
async def get_all_progress(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all user progress"""
    progress = db.query(UserProgress).offset(skip).limit(limit).all()
    
    result = []
    for p in progress:
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "user_name": p.user.name,
            "user_email": p.user.email,
            "subject": p.subject,
            "topic": p.topic,
            "score": p.score,
            "completed_at": p.completed_at
        })
    
    return result

# Get all payments
@router.get("/payments", response_model=List[PaymentResponse])
async def get_all_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all payments"""
    payments = db.query(Payment).offset(skip).limit(limit).all()
    
    result = []
    for payment in payments:
        result.append({
            "id": payment.id,
            "user_id": payment.user_id,
            "user_name": payment.user.name,
            "user_email": payment.user.email,
            "plan": payment.plan.value if hasattr(payment.plan, 'value') else payment.plan,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status,
            "payment_id": payment.payment_id,
            "created_at": payment.created_at
        })
    
    return result

# Update user plan
@router.put("/users/{user_id}/plan")
async def update_user_plan(
    user_id: int,
    plan: PlanType,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Update a user's subscription plan"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.plan = plan
    db.commit()
    
    return {"message": f"User {user.name} plan updated to {plan.value}"}

# Delete user
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Delete a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin users")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.name} deleted successfully"}
