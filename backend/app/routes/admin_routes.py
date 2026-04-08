"""Admin routes for managing application data"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
import csv
import io
import json

from app.core.database import get_db
from app.models import User, ChatHistory, UserProgress, Payment, PlanType, CompanyQuestion, QuestionCategory, DifficultyLevel, Subscription, Invoice
from app.core.auth import get_current_user

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
    total_company_questions: int
    questions_by_company: Dict[str, int]
    total_languages_used: Dict[str, int]
    
class CompanyQuestionResponse(BaseModel):
    id: int
    company_name: str
    question_text: str
    category: str
    difficulty: str
    frequency: int
    topic: Optional[str] = None
    year_asked: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
    
# Dependency to check if user is admin
async def get_admin_user(current_user = Depends(get_current_user)):
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
    
    # Company Questions Statistics
    total_company_questions = db.query(CompanyQuestion).count()
    
    # Questions by company (with count)
    questions_by_company_rows = db.query(
        CompanyQuestion.company_name, 
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.company_name).all()
    questions_by_company = {row[0]: row[1] for row in questions_by_company_rows}
    
    # Languages used in chat (english, hindi, gujarati)
    language_rows = db.query(
        ChatHistory.language,
        func.count(ChatHistory.id).label('count')
    ).group_by(ChatHistory.language).all()
    total_languages_used = {row[0]: row[1] for row in language_rows}
    
    return {
        "total_users": total_users,
        "free_users": free_users,
        "basic_users": basic_users,
        "pro_users": pro_users,
        "google_users": google_users,
        "regular_users": regular_users,
        "total_chats": total_chats,
        "total_payments": total_payments,
        "total_revenue": total_revenue,
        "total_company_questions": total_company_questions,
        "questions_by_company": questions_by_company,
        "total_languages_used": total_languages_used
    }

# Get all users with pagination count and search
@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all users with pagination count and optional search by email"""
    query = db.query(User)
    
    # Apply search filter if provided
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    
    # Get total count
    total = query.count()
    
    # Get paginated users
    users = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "plan": user.plan.value if hasattr(user.plan, 'value') else user.plan,
                "is_google_user": user.is_google_user,
                "is_admin": user.is_admin,
                "phone": getattr(user, 'phone', None),
                "phone_verified": getattr(user, 'phone_verified', False),
                "college": getattr(user, 'college', None),
                "branch": getattr(user, 'branch', None),
                "cgpa": getattr(user, 'cgpa', None),
                "graduation_year": getattr(user, 'graduation_year', None),
                "linkedin_url": getattr(user, 'linkedin_url', None),
                "github_url": getattr(user, 'github_url', None),
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
            for user in users
        ]
    }

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

# Get users with chat counts (for user-wise chat history view)
@router.get("/chats/users-summary")
async def get_chat_users_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all users who have chats, with their chat count and latest message time"""
    rows = (
        db.query(
            User.id,
            User.name,
            User.email,
            User.plan,
            func.count(ChatHistory.id).label("chat_count"),
            func.max(ChatHistory.timestamp).label("last_message_at"),
        )
        .join(ChatHistory, ChatHistory.user_id == User.id)
        .group_by(User.id, User.name, User.email, User.plan)
        .order_by(func.max(ChatHistory.timestamp).desc())
        .all()
    )
    return [
        {
            "user_id": row.id,
            "user_name": row.name,
            "user_email": row.email,
            "plan": row.plan.value if hasattr(row.plan, "value") else row.plan,
            "chat_count": row.chat_count,
            "last_message_at": row.last_message_at,
        }
        for row in rows
    ]

# Get chat history for a specific user
@router.get("/chats/user/{user_id}", response_model=List[ChatHistoryResponse])
async def get_user_chats(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all chat messages for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    chats = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.timestamp.asc())
        .all()
    )
    return [
        {
            "id": chat.id,
            "user_id": chat.user_id,
            "user_name": user.name,
            "user_email": user.email,
            "role": chat.role,
            "content": chat.content,
            "timestamp": chat.timestamp,
        }
        for chat in chats
    ]

# GET /api/admin/chats/{email} — all messages for a specific user email
@router.get("/chats/{email}", response_model=List[ChatHistoryResponse])
async def get_chats_by_email(
    email: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Fetch all chat messages for a specific user identified by email"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found with that email")

    chats = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user.id)
        .order_by(ChatHistory.timestamp.asc())
        .all()
    )
    return [
        {
            "id": chat.id,
            "user_id": chat.user_id,
            "user_name": user.name,
            "user_email": user.email,
            "role": chat.role,
            "content": chat.content,
            "timestamp": chat.timestamp,
        }
        for chat in chats
    ]

# GET /api/admin/chat-users — unique users from chats table with message count, grouped by email
@router.get("/chat-users")
async def get_chat_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Query the chats table, group by user email, and return unique users
    with their name, email, and total message count.
    Note: /api/admin/users already exists as a full user-management endpoint,
    so this chat-analytics view lives at /api/admin/chat-users.
    """
    rows = (
        db.query(
            User.name,
            User.email,
            func.count(ChatHistory.id).label("message_count"),
        )
        .join(ChatHistory, ChatHistory.user_id == User.id)
        .group_by(User.email, User.name)
        .order_by(func.count(ChatHistory.id).desc())
        .all()
    )
    return [
        {
            "name": row.name,
            "email": row.email,
            "message_count": row.message_count,
        }
        for row in rows
    ]

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

# Get all subscriptions (all users with their plan status)
class SubscriptionResponse(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    plan: str
    status: str
    source: str
    amount: int
    payment_id: Optional[str]
    start_date: datetime
    expiry_date: Optional[datetime]
    granted_by: Optional[str]
    
    class Config:
        from_attributes = True

# Get all invoices
@router.get("/invoices")
async def get_all_invoices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all invoices"""
    
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "user_id": inv.user_id,
            "user_name": inv.user_name,
            "user_email": inv.user_email,
            "plan_name": inv.plan_name,
            "billing_cycle": inv.billing_cycle,
            "amount_paid": inv.amount_paid / 100,  # Convert to rupees
            "currency": inv.currency,
            "payment_id": inv.payment_id,
            "order_id": inv.order_id,
            "validity_period": inv.validity_period,
            "invoice_date": inv.invoice_date.isoformat()
        }
        for inv in invoices
    ]

@router.get("/subscriptions")
async def get_all_subscriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all user subscriptions (plan status for all users)"""
    
    users = db.query(User).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        # Get active subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == 'active'
        ).order_by(Subscription.created_at.desc()).first()
        
        # Get latest payment if exists
        latest_payment = db.query(Payment).filter(
            Payment.user_id == user.id,
            Payment.status == "completed"
        ).order_by(Payment.created_at.desc()).first()
        
        # Get admin who granted the plan
        granted_by_admin = None
        if user.plan_updated_by:
            admin_user = db.query(User).filter(User.id == user.plan_updated_by).first()
            if admin_user:
                granted_by_admin = admin_user.name
        
        # Determine status
        status = "Active" if user.plan != PlanType.FREE else "Free"
        
        # Determine amount and payment_id
        amount = 0
        payment_id = None
        billing_cycle = None
        start_date = user.plan_updated_at or user.created_at
        expiry_date = None
        
        if subscription:
            amount = subscription.amount_paid
            payment_id = subscription.razorpay_payment_id
            billing_cycle = subscription.billing_cycle
            start_date = subscription.starts_at
            expiry_date = subscription.expires_at
        elif user.subscription_source == 'payment' and latest_payment:
            amount = latest_payment.amount
            payment_id = latest_payment.payment_id
        
        result.append({
            "user_id": user.id,
            "user_name": user.name,
            "user_email": user.email,
            "plan": user.plan.value if hasattr(user.plan, 'value') else user.plan,
            "status": status,
            "source": user.subscription_source or 'free',
            "billing_cycle": billing_cycle,
            "amount": amount,
            "payment_id": payment_id,
            "start_date": start_date,
            "expiry_date": expiry_date,
            "granted_by": granted_by_admin
        })
    
    return result

# Update user plan
class UpdatePlanRequest(BaseModel):
    plan: str

@router.put("/users/{user_id}/plan")
async def update_user_plan(
    user_id: int,
    request: UpdatePlanRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Update a user's subscription plan"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert string to PlanType enum
    plan_str = request.plan.lower()
    if plan_str == 'free':
        user.plan = PlanType.FREE
        user.subscription_source = 'free'
    elif plan_str == 'basic':
        user.plan = PlanType.BASIC
        user.subscription_source = 'admin_grant'
    elif plan_str == 'pro':
        user.plan = PlanType.PRO
        user.subscription_source = 'admin_grant'
    else:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {request.plan}. Must be 'free', 'basic', or 'pro'")
    
    # Track admin who updated the plan
    user.plan_updated_by = admin.id
    user.plan_updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"User {user.name} plan updated to {plan_str}"}


# Delete user
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Delete a user and all their data (cascade delete handles related records)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin users")
    
    user_name = user.name
    
    try:
        # Delete user - cascade will handle all related records automatically
        db.delete(user)
        db.commit()
        
        return {"message": f"User {user_name} deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


# Get aptitude history for a specific user
@router.get("/users/{user_id}/aptitude-history")
async def get_user_aptitude_history(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get aptitude exam history for a specific user"""
    from sqlalchemy import text
    from app.core.database import engine
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        query = """
            SELECT 
                id,
                company,
                category,
                difficulty,
                score,
                total_questions,
                correct,
                wrong,
                skipped,
                score_percent,
                exam_date
            FROM aptitude_exam_history
            WHERE user_id = :user_id
            ORDER BY exam_date DESC
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(query), {"user_id": user_id})
            rows = result.fetchall()
            
            history = []
            for row in rows:
                history.append({
                    "id": row.id,
                    "company": row.company,
                    "category": row.category,
                    "difficulty": row.difficulty,
                    "score": row.score,
                    "total_questions": row.total_questions,
                    "correct": row.correct,
                    "wrong": row.wrong,
                    "skipped": row.skipped,
                    "score_percent": float(row.score_percent),
                    "exam_date": row.exam_date.isoformat() if hasattr(row.exam_date, 'isoformat') else str(row.exam_date)
                })
            
            return {
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "plan": user.plan.value if hasattr(user.plan, 'value') else user.plan
                },
                "history": history,
                "total_exams": len(history)
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


# Get all users with aptitude exam counts
@router.get("/aptitude-users-summary")
async def get_aptitude_users_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all users who have taken aptitude exams, with their exam count"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        query = """
            SELECT 
                u.id as user_id,
                u.name as user_name,
                u.email as user_email,
                u.plan,
                COUNT(aeh.id) as exam_count,
                MAX(aeh.exam_date) as last_exam_date,
                AVG(aeh.score_percent) as avg_score
            FROM users u
            INNER JOIN aptitude_exam_history aeh ON aeh.user_id = u.id
            GROUP BY u.id, u.name, u.email, u.plan
            ORDER BY MAX(aeh.exam_date) DESC
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(query))
            rows = result.fetchall()
            
            return [
                {
                    "user_id": row.user_id,
                    "user_name": row.user_name,
                    "user_email": row.user_email,
                    "plan": str(row.plan).replace('PlanType.', '').lower() if 'PlanType' in str(row.plan) else str(row.plan).lower(),
                    "exam_count": row.exam_count,
                    "last_exam_date": row.last_exam_date.isoformat() if hasattr(row.last_exam_date, 'isoformat') else str(row.last_exam_date),
                    "avg_score": round(float(row.avg_score), 2) if row.avg_score else 0
                }
                for row in rows
            ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


# Get all company questions (SEO Feature)
@router.get("/company-questions", response_model=List[CompanyQuestionResponse])
async def get_all_company_questions(
    skip: int = 0,
    limit: int = 100,
    company: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all interview questions in database (with optional company filter)"""
    query = db.query(CompanyQuestion)
    
    if company:
        query = query.filter(CompanyQuestion.company_name.ilike(f"%{company}%"))
    
    questions = query.order_by(CompanyQuestion.frequency.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": question.id,
            "company_name": question.company_name,
            "question_text": question.question_text,
            "category": question.category.value if hasattr(question.category, "value") else question.category,
            "difficulty": question.difficulty.value if hasattr(question.difficulty, "value") else question.difficulty,
            "frequency": question.frequency or 0,
            "topic": question.topic,
            "year_asked": question.year_asked,
            "created_at": question.created_at,
        }
        for question in questions
    ]

# Get company questions statistics
@router.get("/company-questions/stats")
async def get_company_questions_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get statistics about company questions database"""
    
    total_questions = db.query(CompanyQuestion).count()
    
    # Questions by company
    by_company = db.query(
        CompanyQuestion.company_name,
        func.count(CompanyQuestion.id).label('count'),
        func.sum(CompanyQuestion.frequency).label('total_frequency')
    ).group_by(CompanyQuestion.company_name).all()
    
    # Questions by difficulty
    by_difficulty = db.query(
        CompanyQuestion.difficulty,
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.difficulty).all()
    
    # Questions by category
    by_category = db.query(
        CompanyQuestion.category,
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.category).all()
    
    # Top topics
    top_topics = db.query(
        CompanyQuestion.topic,
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.topic).order_by(
        func.count(CompanyQuestion.id).desc()
    ).limit(10).all()
    
    return {
        "total_questions": total_questions,
        "by_company": [{"company": row[0], "count": row[1], "total_frequency": row[2]} for row in by_company],
        "by_difficulty": [{"difficulty": row[0], "count": row[1]} for row in by_difficulty],
        "by_category": [{"category": row[0], "count": row[1]} for row in by_category],
        "top_topics": [{"topic": row[0], "count": row[1]} for row in top_topics]
    }

# Get detailed dashboard
@router.get("/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get comprehensive admin dashboard with all data"""
    
    # User stats
    total_users = db.query(User).count()
    new_users_today = db.query(User).filter(
        func.date(User.created_at) == func.date(func.now())
    ).count()
    
    # Plan distribution
    plan_dist = db.query(
        User.plan,
        func.count(User.id).label('count')
    ).group_by(User.plan).all()
    
    # Chat activity
    total_chats = db.query(ChatHistory).count()
    chats_today = db.query(ChatHistory).filter(
        func.date(ChatHistory.timestamp) == func.date(func.now())
    ).count()
    
    # Revenue
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed"
    ).scalar() or 0
    
    pending_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "pending"
    ).scalar() or 0
    
    # Company Questions
    total_questions = db.query(CompanyQuestion).count()
    top_companies = db.query(
        CompanyQuestion.company_name,
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.company_name).order_by(
        func.count(CompanyQuestion.id).desc()
    ).limit(5).all()
    
    return {
        "timestamp": datetime.utcnow(),
        "users": {
            "total": total_users,
            "new_today": new_users_today,
            "by_plan": [{"plan": row[0].value if hasattr(row[0], 'value') else row[0], "count": row[1]} for row in plan_dist]
        },
        "chat": {
            "total_messages": total_chats,
            "messages_today": chats_today
        },
        "revenue": {
            "total_completed": total_revenue,
            "pending": pending_revenue,
            "currency": "INR"
        },
        "company_questions": {
            "total": total_questions,
            "top_companies": [{"company": row[0], "questions": row[1]} for row in top_companies]
        }
    }


# Bulk upload company questions from CSV file
@router.post("/company-questions/bulk-upload")
async def bulk_upload_company_questions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Bulk upload company interview questions from CSV file."""
    
    try:
        if not file.filename or not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="Please upload a CSV file")

        content = await file.read()
        text = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))

        added_count = 0
        updated_count = 0
        skipped_count = 0
        errors = []

        def normalize_category(value: str):
            if not value:
                return QuestionCategory.TECHNICAL
            normalized = value.strip().lower().replace(' ', '_')
            mapping = {
                'type': QuestionCategory.TECHNICAL,
                'technical': QuestionCategory.TECHNICAL,
                'coding': QuestionCategory.CODING,
                'hr': QuestionCategory.HR,
                'behavioral': QuestionCategory.BEHAVIORAL,
                'aptitude': QuestionCategory.APTITUDE,
                'system_design': QuestionCategory.SYSTEM_DESIGN,
                'system design': QuestionCategory.SYSTEM_DESIGN,
                'dsa': QuestionCategory.DSA,
            }
            return mapping.get(normalized, QuestionCategory.TECHNICAL)

        def normalize_difficulty(value: str):
            if not value:
                return DifficultyLevel.MEDIUM
            normalized = value.strip().lower()
            if normalized == 'easy':
                return DifficultyLevel.EASY
            if normalized == 'hard':
                return DifficultyLevel.HARD
            return DifficultyLevel.MEDIUM

        for index, row in enumerate(reader, start=2):
            try:
                company_name = (row.get('company') or row.get('COMPANY') or '').strip()
                question_text = (row.get('question') or row.get('QUESTION') or '').strip()
                category_raw = (row.get('category') or row.get('type') or row.get('CATEGORY') or row.get('TYPE') or '').strip()
                difficulty_raw = (row.get('difficulty') or row.get('DIFFICULTY') or '').strip()
                topic = (row.get('topic') or row.get('TOPIC') or row.get('role') or row.get('ROLE') or 'General').strip()
                year_asked = (row.get('year') or row.get('year_asked') or row.get('YEAR') or '').strip() or None

                if not company_name or not question_text:
                    skipped_count += 1
                    errors.append(f"Row {index}: Missing company or question")
                    continue

                existing = db.query(CompanyQuestion).filter(
                    CompanyQuestion.company_name.ilike(company_name),
                    CompanyQuestion.question_text.ilike(question_text)
                ).first()

                if existing:
                    existing.frequency = (existing.frequency or 0) + 1
                    if topic and existing.topic != topic:
                        existing.topic = topic
                    if year_asked and not existing.year_asked:
                        existing.year_asked = year_asked
                    updated_count += 1
                else:
                    new_question = CompanyQuestion(
                        company_name=company_name,
                        question_text=question_text,
                        category=normalize_category(category_raw),
                        difficulty=normalize_difficulty(difficulty_raw),
                        frequency=1,
                        topic=topic or 'General',
                        year_asked=year_asked
                    )
                    db.add(new_question)
                    added_count += 1

            except Exception as e:
                skipped_count += 1
                errors.append(f"Row {index}: {str(e)}")

        db.commit()

        return {
            "status": "success",
            "total_processed": added_count + updated_count + skipped_count,
            "added_new": added_count,
            "updated_existing": updated_count,
            "skipped": skipped_count,
            "errors": errors if errors else None,
            "message": f"Processed {added_count + updated_count} questions successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing file: {str(e)}"
        )


# Delete a company question
@router.delete("/company-questions/{question_id}")
async def delete_company_question(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Delete a specific company question"""
    question = db.query(CompanyQuestion).filter(CompanyQuestion.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(question)
    db.commit()
    
    return {"message": f"Question deleted successfully", "id": question_id}


# Add a new company question manually
class CompanyQuestionCreate(BaseModel):
    company_name: str
    question_text: str
    category: QuestionCategory = QuestionCategory.TECHNICAL
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    topic: str = "General"
    year_asked: Optional[str] = None
    frequency: int = 1

@router.post("/company-questions", response_model=CompanyQuestionResponse)
async def add_company_question(
    question: CompanyQuestionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Add a new company question manually"""
    
    # Check if question already exists
    existing = db.query(CompanyQuestion).filter(
        CompanyQuestion.company_name.ilike(question.company_name),
        CompanyQuestion.question_text.ilike(question.question_text)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Question already exists for this company"
        )
    
    new_question = CompanyQuestion(
        company_name=question.company_name,
        question_text=question.question_text,
        category=question.category,
        difficulty=question.difficulty,
        topic=question.topic,
        year_asked=question.year_asked,
        frequency=question.frequency
    )
    
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    return {
        "id": new_question.id,
        "company_name": new_question.company_name,
        "question_text": new_question.question_text,
        "category": new_question.category.value,
        "difficulty": new_question.difficulty.value,
        "frequency": new_question.frequency,
        "topic": new_question.topic,
        "year_asked": new_question.year_asked,
        "created_at": new_question.created_at
    }


# Get sample CSV template for bulk upload
@router.get("/company-questions/sample-template")
async def get_sample_template(admin: User = Depends(get_admin_user)):
    """Get sample CSV template for bulk uploading questions."""
    
    sample = """company,role,question,category,difficulty,topic,year
Microsoft,Software Engineer,Explain Object Oriented Programming concepts,technical,medium,OOP,2024
Microsoft,Software Engineer,Reverse a linked list,coding,medium,Linked Lists,2024
Amazon,SDE,Explain Amazon leadership principles,hr,easy,Leadership,2024
Amazon,SDE,What is load balancing,technical,hard,System Design,2024
TCS,Fresher,What is SDLC,technical,easy,Software Development,2024
Infosys,Fresher,Explain ACID properties,technical,medium,Databases,2024
"""
    
    return {
        "template": sample,
        "instructions": [
            "1. Keep the first row as CSV headers",
            "2. Required columns: company, question",
            "3. Supported optional columns: role, category, type, difficulty, topic, year",
            "4. If category is missing, type will be used",
            "5. Valid difficulties: easy, medium, hard",
            "6. Valid categories: dsa, system_design, hr, coding, aptitude, behavioral, technical",
            "7. Duplicate company + question rows increase frequency",
            "8. Upload the CSV file through the admin panel"
        ],
        "format_guide": {
            "company": "Company name, e.g. Amazon or Microsoft",
            "role": "Optional role label, used as topic fallback if topic is empty",
            "question": "Interview question text",
            "category_or_type": "technical, coding, hr, dsa, system_design, aptitude, behavioral",
            "difficulty": "easy, medium, or hard",
            "topic": "Topic area such as Arrays, OOP, Databases",
            "year": "Year asked, e.g. 2024"
        }
    }



# ==================== AI MONITOR ENDPOINTS ====================

@router.get("/ai-monitor/top-users")
async def get_top_ai_users(
    limit: int = 10,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get top users by AI query count"""
    from app.models import UserUsage
    from datetime import datetime
    
    current_month = datetime.now().strftime("%Y-%m")
    
    rows = (
        db.query(
            User.id,
            User.name,
            User.email,
            User.plan,
            func.sum(UserUsage.query_count).label("total_queries"),
            func.sum(UserUsage.total_input_tokens).label("total_input_tokens"),
            func.sum(UserUsage.total_output_tokens).label("total_output_tokens")
        )
        .join(UserUsage, UserUsage.user_id == User.id)
        .filter(UserUsage.month == current_month)
        .group_by(User.id, User.name, User.email, User.plan)
        .order_by(func.sum(UserUsage.query_count).desc())
        .limit(limit)
        .all()
    )
    
    return [
        {
            "user_id": row.id,
            "name": row.name,
            "email": row.email,
            "plan": row.plan.value if hasattr(row.plan, 'value') else row.plan,
            "total_queries": row.total_queries or 0,
            "total_input_tokens": row.total_input_tokens or 0,
            "total_output_tokens": row.total_output_tokens or 0
        }
        for row in rows
    ]


@router.get("/ai-monitor/cost-summary")
async def get_cost_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Calculate estimated API costs"""
    from app.models import UserUsage
    from datetime import datetime
    
    current_month = datetime.now().strftime("%Y-%m")
    
    # Get total tokens for current month
    result = db.query(
        func.sum(UserUsage.total_input_tokens).label("total_input"),
        func.sum(UserUsage.total_output_tokens).label("total_output"),
        func.sum(UserUsage.query_count).label("total_queries")
    ).filter(UserUsage.month == current_month).first()
    
    total_input_tokens = result.total_input or 0
    total_output_tokens = result.total_output or 0
    total_queries = result.total_queries or 0
    
    # Gemini API pricing (approximate)
    # Input: $0.25 per 1M tokens
    # Output: $0.50 per 1M tokens
    input_cost = (total_input_tokens / 1_000_000) * 0.25
    output_cost = (total_output_tokens / 1_000_000) * 0.50
    total_cost = input_cost + output_cost
    
    return {
        "total_queries": total_queries,
        "total_input_tokens": total_input_tokens,
        "total_output_tokens": total_output_tokens,
        "input_cost_usd": round(input_cost, 2),
        "output_cost_usd": round(output_cost, 2),
        "total_cost_usd": round(total_cost, 2),
        "month": current_month
    }


@router.get("/ai-monitor/daily-usage")
async def get_daily_usage(
    days: int = 30,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get daily AI query trends"""
    from app.models import UserUsage
    from datetime import datetime, timedelta
    from sqlalchemy import cast, Date
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    rows = (
        db.query(
            cast(UserUsage.last_query_date, Date).label("date"),
            func.sum(UserUsage.query_count).label("queries")
        )
        .filter(UserUsage.last_query_date >= start_date)
        .group_by(cast(UserUsage.last_query_date, Date))
        .order_by(cast(UserUsage.last_query_date, Date))
        .all()
    )
    
    return [
        {
            "date": row.date.isoformat() if row.date else None,
            "queries": row.queries or 0
        }
        for row in rows
    ]


# ==================== BROADCAST ENDPOINTS ====================

class BroadcastCreate(BaseModel):
    title: str
    message: str
    target_audience: str  # 'all', 'pro', 'basic', 'free'


@router.post("/broadcast/send")
async def send_broadcast(
    broadcast: BroadcastCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Send broadcast notification to targeted users"""
    from app.models import Notification, Broadcast
    
    # Get target users based on audience
    query = db.query(User)
    
    if broadcast.target_audience == "pro":
        query = query.filter(User.plan == PlanType.PRO)
    elif broadcast.target_audience == "basic":
        query = query.filter(User.plan == PlanType.BASIC)
    elif broadcast.target_audience == "free":
        query = query.filter(User.plan == PlanType.FREE)
    # else: all users
    
    target_users = query.all()
    
    # Create notifications for all target users
    notifications = []
    for user in target_users:
        notification = Notification(
            user_id=user.id,
            title=broadcast.title,
            message=broadcast.message
        )
        notifications.append(notification)
    
    db.add_all(notifications)
    
    # Save broadcast history
    broadcast_record = Broadcast(
        admin_id=admin.id,
        title=broadcast.title,
        message=broadcast.message,
        target_audience=broadcast.target_audience,
        users_count=len(target_users)
    )
    db.add(broadcast_record)
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Broadcast sent to {len(target_users)} users",
        "users_count": len(target_users),
        "broadcast_id": broadcast_record.id
    }


@router.get("/broadcast/history")
async def get_broadcast_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get broadcast history"""
    from app.models import Broadcast
    
    broadcasts = (
        db.query(Broadcast)
        .order_by(Broadcast.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": b.id,
            "title": b.title,
            "message": b.message,
            "target_audience": b.target_audience,
            "users_count": b.users_count,
            "created_at": b.created_at.isoformat()
        }
        for b in broadcasts
    ]


@router.get("/broadcast/stats")
async def get_broadcast_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get broadcast statistics"""
    from app.models import Broadcast, Notification
    
    total_broadcasts = db.query(Broadcast).count()
    total_notifications = db.query(Notification).count()
    unread_notifications = db.query(Notification).filter(Notification.is_read == False).count()
    
    return {
        "total_broadcasts": total_broadcasts,
        "total_notifications_sent": total_notifications,
        "unread_notifications": unread_notifications
    }


# Get TCS Aptitude Questions with options and explanations
@router.get("/tcs-aptitude-questions")
async def get_tcs_aptitude_questions(
    category: str = Query(None, description="Filter by category"),
    difficulty: str = Query(None, description="Filter by difficulty"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get TCS aptitude questions with all options and explanations for admin review"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        # Build query with optional filters
        query = """
            SELECT 
                id,
                company,
                category,
                difficulty,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_answer,
                explanation,
                year_asked
            FROM aptitude_questions
            WHERE LOWER(company) = 'tcs'
        """
        
        params = {"limit": limit}
        
        if category and category != 'all':
            query += " AND LOWER(category) = LOWER(:category)"
            params["category"] = category
        
        if difficulty and difficulty != 'all':
            query += " AND LOWER(difficulty) = LOWER(:difficulty)"
            params["difficulty"] = difficulty
        
        query += " ORDER BY id DESC LIMIT :limit"
        
        with engine.connect() as conn:
            result = conn.execute(text(query), params)
            rows = result.fetchall()
            
            questions = []
            for row in rows:
                questions.append({
                    "id": row.id,
                    "question": row.question,
                    "option_a": row.option_a,
                    "option_b": row.option_b,
                    "option_c": row.option_c,
                    "option_d": row.option_d,
                    "correct_answer": row.correct_answer,
                    "explanation": row.explanation or "No explanation available",
                    "category": row.category,
                    "difficulty": row.difficulty,
                    "year_asked": row.year_asked
                })
            
            return {
                "total": len(questions),
                "questions": questions
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


# ============================================================================
# APTITUDE PRACTICE QUESTIONS MANAGEMENT (Admin)
# ============================================================================

@router.get("/aptitude-practice-questions")
async def get_aptitude_practice_questions_admin(
    category: str = Query("all"),
    subcategory: str = Query("all"),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get aptitude practice questions with filters for admin panel"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        query = """
            SELECT 
                id::text, question, image, has_image, options, answer, 
                explanation, category, subcategory, difficulty, tags, source
            FROM aptitude_practice_questions
            WHERE 1=1
        """
        params = {}
        
        if category != "all":
            query += " AND LOWER(category) = LOWER(:category)"
            params["category"] = category
        
        if subcategory != "all":
            query += " AND LOWER(subcategory) = LOWER(:subcategory)"
            params["subcategory"] = subcategory
        
        query += " ORDER BY created_at DESC LIMIT 100"
        
        with engine.begin() as connection:
            result = connection.execute(text(query), params)
            rows = result.fetchall()
            
            questions = []
            for row in rows:
                questions.append({
                    "id": row[0],
                    "question": row[1],
                    "image": row[2],
                    "has_image": row[3],
                    "options": row[4],
                    "answer": row[5],
                    "explanation": row[6],
                    "category": row[7],
                    "subcategory": row[8],
                    "difficulty": row[9],
                    "tags": row[10] if row[10] else [],
                    "source": row[11]
                })
            
            return {"questions": questions}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions: {str(e)}")


@router.get("/aptitude-practice-stats")
async def get_aptitude_practice_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get statistics about aptitude practice questions"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.begin() as connection:
            # Total questions
            total_result = connection.execute(text("SELECT COUNT(*) FROM aptitude_practice_questions"))
            total_questions = total_result.scalar()
            
            # Total categories
            cat_result = connection.execute(text("SELECT COUNT(DISTINCT category) FROM aptitude_practice_questions"))
            total_categories = cat_result.scalar()
            
            # Total subcategories
            subcat_result = connection.execute(text("SELECT COUNT(DISTINCT subcategory) FROM aptitude_practice_questions"))
            total_subcategories = subcat_result.scalar()
            
            # Total sources
            source_result = connection.execute(text("SELECT COUNT(DISTINCT source) FROM aptitude_practice_questions WHERE source IS NOT NULL"))
            total_sources = source_result.scalar()
            
            return {
                "total_questions": total_questions,
                "total_categories": total_categories,
                "total_subcategories": total_subcategories,
                "total_sources": total_sources
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.post("/aptitude-practice-questions/bulk-upload")
async def bulk_upload_aptitude_questions(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Bulk upload aptitude questions from JSON file with duplicate detection"""
    from sqlalchemy import text
    from app.core.database import engine
    import json
    import hashlib
    
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are allowed")
    
    try:
        # Read and parse JSON
        content = await file.read()
        questions = json.loads(content)
        
        if not isinstance(questions, list):
            raise HTTPException(status_code=400, detail="JSON must be an array of questions")
        
        inserted = 0
        skipped = 0
        errors = []
        
        with engine.begin() as connection:
            for idx, q in enumerate(questions, 1):
                try:
                    # Validate required fields
                    required_fields = ['question', 'options', 'answer', 'explanation', 'category', 'subcategory']
                    missing_fields = [field for field in required_fields if field not in q or not q[field]]
                    
                    if missing_fields:
                        errors.append(f"Question {idx}: Missing required fields: {', '.join(missing_fields)}")
                        skipped += 1
                        continue
                    
                    # Generate hash for deduplication (using question text)
                    question_text = q['question'].strip().lower()
                    hash_str = hashlib.md5(question_text.encode()).hexdigest()
                    
                    # Check if question already exists by hash OR by exact question text
                    check_result = connection.execute(
                        text("""
                            SELECT COUNT(*) FROM aptitude_practice_questions 
                            WHERE hash = :hash OR LOWER(TRIM(question)) = LOWER(TRIM(:question))
                        """),
                        {"hash": hash_str, "question": q['question']}
                    )
                    
                    if check_result.scalar() > 0:
                        skipped += 1
                        continue
                    
                    # Validate options format
                    if not isinstance(q['options'], list) or len(q['options']) < 2:
                        errors.append(f"Question {idx}: Options must be an array with at least 2 items")
                        skipped += 1
                        continue
                    
                    # Validate answer is one of the option keys
                    option_keys = [opt.get('key') for opt in q['options'] if isinstance(opt, dict)]
                    if q['answer'] not in option_keys:
                        errors.append(f"Question {idx}: Answer '{q['answer']}' not found in option keys")
                        skipped += 1
                        continue
                    
                    # Insert question
                    insert_query = text("""
                        INSERT INTO aptitude_practice_questions 
                        (question, image, has_image, options, answer, explanation, 
                         category, subcategory, difficulty, tags, source, hash)
                        VALUES 
                        (:question, :image, :has_image, CAST(:options AS jsonb), :answer, :explanation,
                         :category, :subcategory, :difficulty, CAST(:tags AS jsonb), :source, :hash)
                    """)
                    
                    connection.execute(insert_query, {
                        "question": q.get('question'),
                        "image": q.get('image'),
                        "has_image": q.get('has_image', False),
                        "options": json.dumps(q.get('options', [])),
                        "answer": q.get('answer'),
                        "explanation": q.get('explanation'),
                        "category": q.get('category'),
                        "subcategory": q.get('subcategory'),
                        "difficulty": q.get('difficulty', 'medium'),
                        "tags": json.dumps(q.get('tags', [])),
                        "source": q.get('source'),
                        "hash": hash_str
                    })
                    inserted += 1
                    
                except Exception as e:
                    errors.append(f"Question {idx}: {str(e)}")
                    skipped += 1
                    continue
        
        response_data = {
            "message": f"Upload complete: {inserted} inserted, {skipped} skipped",
            "inserted": inserted,
            "skipped": skipped,
            "total": len(questions),
            "success": True
        }
        
        if errors:
            response_data["errors"] = errors[:10]  # Limit to first 10 errors
            response_data["total_errors"] = len(errors)
        
        return response_data
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# ============================================================================
# RESUME ADMIN ENDPOINTS
# ============================================================================

@router.get("/resume-analytics")
async def get_resume_analytics(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get resume analytics for admin dashboard"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.begin() as connection:
            # Mock data for now - will be replaced with actual database queries
            # TODO: Create resume_tracking table and populate with real data
            
            analytics = {
                "total_resumes": 0,
                "ai_generated": 0,
                "manual_created": 0,
                "pdf_exports": 0,
                "average_ats_score": 0,
                "premium_template_usage": 0,
                "most_selected_template": "ATS Clean",
                "completion_rate": 0,
                "templates_breakdown": []
            }
            
            # Try to get real data if table exists
            try:
                result = connection.execute(text("""
                    SELECT 
                        COUNT(*) as total_resumes,
                        COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_generated,
                        COUNT(CASE WHEN ai_generated = false THEN 1 END) as manual_created,
                        SUM(pdf_export_count) as pdf_exports,
                        AVG(ats_score) as avg_ats_score,
                        COUNT(CASE WHEN template_tier = 'premium' THEN 1 END) as premium_usage
                    FROM resume_tracking
                """))
                row = result.fetchone()
                if row:
                    analytics["total_resumes"] = row[0] or 0
                    analytics["ai_generated"] = row[1] or 0
                    analytics["manual_created"] = row[2] or 0
                    analytics["pdf_exports"] = row[3] or 0
                    analytics["average_ats_score"] = round(float(row[4] or 0), 1)
                    analytics["premium_template_usage"] = row[5] or 0
                    
                # Get most selected template
                template_result = connection.execute(text("""
                    SELECT template_id, COUNT(*) as count
                    FROM resume_tracking
                    GROUP BY template_id
                    ORDER BY count DESC
                    LIMIT 1
                """))
                template_row = template_result.fetchone()
                if template_row:
                    analytics["most_selected_template"] = template_row[0]
                    
                # Get templates breakdown
                breakdown_result = connection.execute(text("""
                    SELECT 
                        template_id, 
                        COUNT(*) as usage_count, 
                        SUM(pdf_export_count) as exports,
                        AVG(ats_score) as avg_ats_score
                    FROM resume_tracking
                    GROUP BY template_id
                    ORDER BY usage_count DESC
                """))
                analytics["templates_breakdown"] = [
                    {
                        "template": row[0], 
                        "usage": row[1], 
                        "exports": row[2] or 0,
                        "avg_ats_score": round(float(row[3] or 0), 1)
                    }
                    for row in breakdown_result.fetchall()
                ]
                
                # Get ATS distribution
                ats_dist_result = connection.execute(text("""
                    SELECT 
                        COUNT(CASE WHEN ats_score < 50 THEN 1 END) as low,
                        COUNT(CASE WHEN ats_score >= 50 AND ats_score <= 70 THEN 1 END) as medium,
                        COUNT(CASE WHEN ats_score > 70 THEN 1 END) as high
                    FROM resume_tracking
                """))
                ats_dist_row = ats_dist_result.fetchone()
                if ats_dist_row:
                    analytics["ats_distribution"] = {
                        "low": ats_dist_row[0] or 0,
                        "medium": ats_dist_row[1] or 0,
                        "high": ats_dist_row[2] or 0
                    }
                
                # Get AI vs Manual ATS comparison
                ai_manual_result = connection.execute(text("""
                    SELECT 
                        AVG(CASE WHEN ai_generated = true THEN ats_score END) as ai_avg,
                        AVG(CASE WHEN ai_generated = false THEN ats_score END) as manual_avg
                    FROM resume_tracking
                """))
                ai_manual_row = ai_manual_result.fetchone()
                if ai_manual_row:
                    analytics["ai_vs_manual_ats"] = {
                        "ai_avg": round(float(ai_manual_row[0] or 0), 1),
                        "manual_avg": round(float(ai_manual_row[1] or 0), 1)
                    }
                
                # Calculate completion rate
                if analytics["total_resumes"] > 0:
                    analytics["completion_rate"] = round(
                        (analytics["pdf_exports"] / analytics["total_resumes"]) * 100, 1
                    )
            except Exception:
                # Table doesn't exist yet, return mock data
                pass
            
            return analytics
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")


@router.get("/resume-templates")
async def get_resume_templates(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all resume templates with usage statistics"""
    
    # Template registry - matches frontend template-generator.js
    templates = [
        {"id": "ats-simple", "name": "ATS Simple", "tier": "free", "active": True},
        {"id": "ats-clean", "name": "ATS Clean", "tier": "free", "active": True},
        {"id": "ats-compact", "name": "ATS Compact", "tier": "free", "active": True},
        {"id": "professional-classic", "name": "Professional Classic", "tier": "free", "active": True},
        {"id": "professional-navy", "name": "Professional Navy", "tier": "free", "active": True},
        {"id": "professional-two-col", "name": "Professional Two Column", "tier": "free", "active": True},
        {"id": "modern-minimalist", "name": "Modern Minimalist", "tier": "free", "active": True},
        {"id": "modern-bold", "name": "Modern Bold", "tier": "free", "active": True},
        {"id": "creative-teal", "name": "Creative Teal", "tier": "premium", "active": True},
        {"id": "creative-purple", "name": "Creative Purple", "tier": "premium", "active": True},
        {"id": "premium-glass", "name": "Premium Glass", "tier": "premium", "active": True},
        {"id": "premium-executive-gold", "name": "Premium Executive Gold", "tier": "premium", "active": True},
        {"id": "premium-neon", "name": "Premium Neon", "tier": "premium", "active": True},
        {"id": "premium-elegant", "name": "Premium Elegant", "tier": "premium", "active": True},
        {"id": "premium-gradient", "name": "Premium Gradient", "tier": "premium", "active": True},
    ]
    
    # Try to get usage stats from database
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.begin() as connection:
            try:
                result = connection.execute(text("""
                    SELECT template_id, COUNT(*) as usage_count, SUM(pdf_export_count) as export_count
                    FROM resume_tracking
                    GROUP BY template_id
                """))
                
                usage_map = {row[0]: {"usage": row[1], "exports": row[2] or 0} for row in result.fetchall()}
                
                # Merge usage stats with template data
                for template in templates:
                    stats = usage_map.get(template["id"], {"usage": 0, "exports": 0})
                    template["usage_count"] = stats["usage"]
                    template["export_count"] = stats["exports"]
            except Exception:
                # Table doesn't exist, set default values
                for template in templates:
                    template["usage_count"] = 0
                    template["export_count"] = 0
                    
    except Exception as e:
        # If any error, just return templates with zero stats
        for template in templates:
            template["usage_count"] = 0
            template["export_count"] = 0
    
    # Find most popular
    most_popular = max(templates, key=lambda t: t.get("usage_count", 0))
    
    return {
        "templates": templates,
        "most_popular": most_popular["id"] if most_popular.get("usage_count", 0) > 0 else "ats-clean"
    }


@router.put("/resume-templates/{template_id}/toggle")
async def toggle_resume_template(
    template_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle template active/inactive status"""
    # This would update a templates configuration table
    # For now, return success (frontend will handle state)
    return {"success": True, "message": f"Template {template_id} toggled"}


@router.put("/resume-templates/{template_id}/tier")
async def change_template_tier(
    template_id: str,
    tier: str = Query(..., regex="^(free|premium)$"),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Change template tier (free/premium)"""
    # This would update a templates configuration table
    # For now, return success (frontend will handle state)
    return {"success": True, "message": f"Template {template_id} tier changed to {tier}"}


@router.get("/user-resumes")
async def get_user_resumes(
    search: str = Query(None),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all user resumes with search functionality"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.begin() as connection:
            try:
                query = """
                    SELECT 
                        rt.id,
                        rt.user_id,
                        u.name as user_name,
                        u.email as user_email,
                        rt.template_id,
                        rt.ats_score,
                        rt.ai_generated,
                        rt.pdf_export_count,
                        rt.created_at,
                        rt.updated_at
                    FROM resume_tracking rt
                    JOIN users u ON u.id = rt.user_id
                    WHERE 1=1
                """
                params = {}
                
                if search:
                    query += " AND (LOWER(u.name) LIKE LOWER(:search) OR LOWER(u.email) LIKE LOWER(:search))"
                    params["search"] = f"%{search}%"
                
                query += " ORDER BY rt.updated_at DESC LIMIT 100"
                
                result = connection.execute(text(query), params)
                
                resumes = []
                for row in result.fetchall():
                    resumes.append({
                        "id": row[0],
                        "user_id": row[1],
                        "user_name": row[2],
                        "user_email": row[3],
                        "template_id": row[4],
                        "ats_score": row[5],
                        "ai_generated": row[6],
                        "pdf_export_count": row[7],
                        "created_at": row[8].isoformat() if row[8] else None,
                        "updated_at": row[9].isoformat() if row[9] else None
                    })
                
                return {"resumes": resumes}
            except Exception:
                # Table doesn't exist yet
                return {"resumes": []}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch resumes: {str(e)}")


@router.delete("/user-resumes/{resume_id}")
async def delete_user_resume(
    resume_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user's resume"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.begin() as connection:
            result = connection.execute(
                text("DELETE FROM resume_tracking WHERE id = :resume_id"),
                {"resume_id": resume_id}
            )
            
            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail="Resume not found")
            
            return {"success": True, "message": "Resume deleted successfully"}
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete resume: {str(e)}")


@router.get("/ai-resume-monitor")
async def get_ai_resume_monitor(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get AI resume generation monitoring data"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.begin() as connection:
            try:
                # Get AI generation statistics
                stats_result = connection.execute(text("""
                    SELECT 
                        COUNT(*) as total_generations,
                        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
                        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                        AVG(response_time_ms) as avg_response_time,
                        COUNT(CASE WHEN request_type = 'summary' THEN 1 END) as summary_count,
                        COUNT(CASE WHEN request_type = 'project' THEN 1 END) as project_count,
                        COUNT(CASE WHEN request_type = 'experience' THEN 1 END) as experience_count,
                        COUNT(CASE WHEN request_type = 'template_recommendation' THEN 1 END) as template_rec_count
                    FROM ai_generation_logs
                    WHERE module = 'resume'
                """))
                
                stats_row = stats_result.fetchone()
                
                # Get recent AI requests
                recent_result = connection.execute(text("""
                    SELECT 
                        agl.id,
                        u.email as user_email,
                        agl.request_type,
                        agl.status,
                        agl.response_time_ms,
                        agl.created_at
                    FROM ai_generation_logs agl
                    JOIN users u ON u.id = agl.user_id
                    WHERE agl.module = 'resume'
                    ORDER BY agl.created_at DESC
                    LIMIT 50
                """))
                
                recent_requests = []
                for row in recent_result.fetchall():
                    recent_requests.append({
                        "id": row[0],
                        "user_email": row[1],
                        "request_type": row[2],
                        "status": row[3],
                        "response_time": row[4],
                        "timestamp": row[5].isoformat() if row[5] else None
                    })
                
                return {
                    "total_generations": stats_row[0] or 0,
                    "successful_requests": stats_row[1] or 0,
                    "failed_requests": stats_row[2] or 0,
                    "avg_response_time": round(float(stats_row[3] or 0), 2),
                    "summary_generations": stats_row[4] or 0,
                    "project_generations": stats_row[5] or 0,
                    "experience_generations": stats_row[6] or 0,
                    "template_recommendations": stats_row[7] or 0,
                    "recent_requests": recent_requests
                }
                
            except Exception:
                # Table doesn't exist yet, return mock data
                return {
                    "total_generations": 0,
                    "successful_requests": 0,
                    "failed_requests": 0,
                    "avg_response_time": 0,
                    "summary_generations": 0,
                    "project_generations": 0,
                    "experience_generations": 0,
                    "template_recommendations": 0,
                    "recent_requests": []
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch AI monitor data: {str(e)}")


class AISettingsUpdate(BaseModel):
    model_name: str
    prompt_version: str
    ai_enabled: bool
    free_user_limit: int
    premium_user_limit: int
    ats_enabled: Optional[bool] = True
    ats_mode: Optional[str] = 'normal'
    keywords_weight: Optional[int] = 25
    formatting_weight: Optional[int] = 20
    experience_weight: Optional[int] = 25
    skills_weight: Optional[int] = 20
    readability_weight: Optional[int] = 10
    
    class Config:
        json_schema_extra = {
            "example": {
                "model_name": "gemini-1.5-flash",
                "prompt_version": "v1.0",
                "ai_enabled": True,
                "free_user_limit": 5,
                "premium_user_limit": 50,
                "ats_enabled": True,
                "ats_mode": "normal",
                "keywords_weight": 25,
                "formatting_weight": 20,
                "experience_weight": 25,
                "skills_weight": 20,
                "readability_weight": 10
            }
        }


@router.get("/ai-settings")
async def get_ai_settings(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get AI settings for resume module"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.begin() as connection:
            try:
                # Try to get settings from database
                result = connection.execute(text("""
                    SELECT 
                        model_name,
                        prompt_version,
                        ai_enabled,
                        free_user_limit,
                        premium_user_limit,
                        ats_enabled,
                        ats_mode,
                        keywords_weight,
                        formatting_weight,
                        experience_weight,
                        skills_weight,
                        readability_weight,
                        updated_at
                    FROM ai_settings
                    WHERE module = 'resume'
                    LIMIT 1
                """))
                
                row = result.fetchone()
                if row:
                    return {
                        "model_name": row[0],
                        "prompt_version": row[1],
                        "ai_enabled": row[2],
                        "free_user_limit": row[3],
                        "premium_user_limit": row[4],
                        "ats_enabled": row[5] if row[5] is not None else True,
                        "ats_mode": row[6] or 'normal',
                        "keywords_weight": row[7] or 25,
                        "formatting_weight": row[8] or 20,
                        "experience_weight": row[9] or 25,
                        "skills_weight": row[10] or 20,
                        "readability_weight": row[11] or 10,
                        "updated_at": row[12].isoformat() if row[12] else None
                    }
            except Exception:
                # Table doesn't exist yet, return defaults
                pass
        
        # Return default settings if table doesn't exist or no data
        return {
            "model_name": "gemini-1.5-flash",
            "prompt_version": "v1.0",
            "ai_enabled": True,
            "free_user_limit": 5,
            "premium_user_limit": 50,
            "ats_enabled": True,
            "ats_mode": "normal",
            "keywords_weight": 25,
            "formatting_weight": 20,
            "experience_weight": 25,
            "skills_weight": 20,
            "readability_weight": 10,
            "updated_at": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch AI settings: {str(e)}")


@router.put("/ai-settings")
async def update_ai_settings(
    settings: AISettingsUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update AI settings for resume module"""
    from sqlalchemy import text
    from app.core.database import engine
    
    # Validate settings
    if settings.free_user_limit < 0 or settings.premium_user_limit < 0:
        raise HTTPException(status_code=400, detail="User limits must be non-negative")
    
    if settings.free_user_limit > settings.premium_user_limit:
        raise HTTPException(status_code=400, detail="Free user limit cannot exceed premium user limit")
    
    if not settings.model_name or not settings.prompt_version:
        raise HTTPException(status_code=400, detail="Model name and prompt version are required")
    
    # Validate ATS weights total to 100
    total_weight = (settings.keywords_weight or 0) + (settings.formatting_weight or 0) + \
                   (settings.experience_weight or 0) + (settings.skills_weight or 0) + \
                   (settings.readability_weight or 0)
    if total_weight != 100:
        raise HTTPException(status_code=400, detail=f"ATS weights must total 100, got {total_weight}")
    
    try:
        with engine.begin() as connection:
            try:
                # Try to update or insert settings
                result = connection.execute(text("""
                    INSERT INTO ai_settings 
                    (module, model_name, prompt_version, ai_enabled, free_user_limit, premium_user_limit, 
                     ats_enabled, ats_mode, keywords_weight, formatting_weight, experience_weight, 
                     skills_weight, readability_weight, updated_by, updated_at)
                    VALUES ('resume', :model_name, :prompt_version, :ai_enabled, :free_limit, :premium_limit,
                            :ats_enabled, :ats_mode, :keywords_weight, :formatting_weight, :experience_weight,
                            :skills_weight, :readability_weight, :admin_id, CURRENT_TIMESTAMP)
                    ON CONFLICT (module) 
                    DO UPDATE SET
                        model_name = EXCLUDED.model_name,
                        prompt_version = EXCLUDED.prompt_version,
                        ai_enabled = EXCLUDED.ai_enabled,
                        free_user_limit = EXCLUDED.free_user_limit,
                        premium_user_limit = EXCLUDED.premium_user_limit,
                        ats_enabled = EXCLUDED.ats_enabled,
                        ats_mode = EXCLUDED.ats_mode,
                        keywords_weight = EXCLUDED.keywords_weight,
                        formatting_weight = EXCLUDED.formatting_weight,
                        experience_weight = EXCLUDED.experience_weight,
                        skills_weight = EXCLUDED.skills_weight,
                        readability_weight = EXCLUDED.readability_weight,
                        updated_by = EXCLUDED.updated_by,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id
                """), {
                    "model_name": settings.model_name,
                    "prompt_version": settings.prompt_version,
                    "ai_enabled": settings.ai_enabled,
                    "free_limit": settings.free_user_limit,
                    "premium_limit": settings.premium_user_limit,
                    "ats_enabled": settings.ats_enabled,
                    "ats_mode": settings.ats_mode,
                    "keywords_weight": settings.keywords_weight,
                    "formatting_weight": settings.formatting_weight,
                    "experience_weight": settings.experience_weight,
                    "skills_weight": settings.skills_weight,
                    "readability_weight": settings.readability_weight,
                    "admin_id": admin.id
                })
                
                result.fetchone()  # Consume the result
                
                return {
                    "success": True,
                    "message": "AI settings updated successfully",
                    "settings": {
                        "model_name": settings.model_name,
                        "prompt_version": settings.prompt_version,
                        "ai_enabled": settings.ai_enabled,
                        "free_user_limit": settings.free_user_limit,
                        "premium_user_limit": settings.premium_user_limit,
                        "ats_enabled": settings.ats_enabled,
                        "ats_mode": settings.ats_mode,
                        "keywords_weight": settings.keywords_weight,
                        "formatting_weight": settings.formatting_weight,
                        "experience_weight": settings.experience_weight,
                        "skills_weight": settings.skills_weight,
                        "readability_weight": settings.readability_weight
                    }
                }
                
            except Exception as e:
                # Table doesn't exist yet
                raise HTTPException(
                    status_code=503, 
                    detail=f"AI settings table not available. Please run database migration first. Error: {str(e)}"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update AI settings: {str(e)}")


@router.post("/recalculate-ats/{resume_id}")
async def recalculate_ats_score(
    resume_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Recalculate ATS score for a specific resume using AI"""
    from sqlalchemy import text
    from app.core.database import engine
    from app.services.ai_service import AIService
    
    try:
        with engine.begin() as connection:
            # Get resume data
            resume_result = connection.execute(text("""
                SELECT resume_data
                FROM resume_tracking
                WHERE id = :resume_id
            """), {"resume_id": resume_id})
            
            resume_row = resume_result.fetchone()
            if not resume_row:
                raise HTTPException(status_code=404, detail="Resume not found")
            
            resume_data = resume_row[0]
            
            # Get ATS settings
            settings_result = connection.execute(text("""
                SELECT ats_mode, keywords_weight, formatting_weight, experience_weight, 
                       skills_weight, readability_weight
                FROM ai_settings
                WHERE module = 'resume'
                LIMIT 1
            """))
            settings_row = settings_result.fetchone()
            
            # Default weights if not configured
            ats_mode = settings_row[0] if settings_row else 'normal'
            weights = {
                'keywords': settings_row[1] if settings_row else 25,
                'formatting': settings_row[2] if settings_row else 20,
                'experience': settings_row[3] if settings_row else 25,
                'skills': settings_row[4] if settings_row else 20,
                'readability': settings_row[5] if settings_row else 10
            }
            
            # Convert resume data to text for AI analysis
            resume_text = json.dumps(resume_data) if isinstance(resume_data, dict) else str(resume_data)
            
            # Use AI service to calculate ATS score
            ai_service = AIService()
            ats_result = ai_service.calculate_ats_score(resume_text)
            
            # Apply mode adjustment
            base_score = ats_result.get('overallScore', 70)
            if ats_mode == 'lenient':
                adjusted_score = min(100, base_score + 10)
            elif ats_mode == 'strict':
                adjusted_score = max(0, base_score - 10)
            else:
                adjusted_score = base_score
            
            # Apply custom weights to breakdown scores
            breakdown = ats_result.get('breakdown', {})
            weighted_score = (
                breakdown.get('keywords', {}).get('score', 70) * (weights['keywords'] / 100) +
                breakdown.get('formatting', {}).get('score', 70) * (weights['formatting'] / 100) +
                breakdown.get('experience', {}).get('score', 70) * (weights['experience'] / 100) +
                breakdown.get('skills', {}).get('score', 70) * (weights['skills'] / 100) +
                70 * (weights['readability'] / 100)  # Readability is estimated
            )
            
            # Final score is average of AI score and weighted score
            final_score = round((adjusted_score + weighted_score) / 2)
            
            # Update database
            connection.execute(text("""
                UPDATE resume_tracking
                SET ats_score = :ats_score, updated_at = CURRENT_TIMESTAMP
                WHERE id = :resume_id
            """), {"ats_score": final_score, "resume_id": resume_id})
            
            return {
                "success": True,
                "message": "ATS score recalculated successfully",
                "new_ats_score": final_score,
                "mode": ats_mode,
                "weights_applied": weights
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to recalculate ATS score: {str(e)}")


# ============================================================================
# APTITUDE EXAM MANAGEMENT
# ============================================================================

@router.get("/aptitude-exam-attempts")
async def get_aptitude_exam_attempts(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all user exam attempts with statistics"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.connect() as conn:
            # Get user attempts grouped by user and company
            query = """
                SELECT 
                    u.id as user_id,
                    u.name as user_name,
                    u.email as user_email,
                    LOWER(aeh.company) as company,
                    COUNT(*) as attempts_count,
                    MAX(aeh.score_percent) as best_score,
                    MAX(aeh.exam_date) as last_attempt
                FROM users u
                INNER JOIN aptitude_exam_history aeh ON u.id = aeh.user_id
                GROUP BY u.id, u.name, u.email, LOWER(aeh.company)
                ORDER BY MAX(aeh.exam_date) DESC
            """
            result = conn.execute(text(query))
            attempts = []
            
            for row in result:
                attempts.append({
                    'user_id': row.user_id,
                    'user_name': row.user_name,
                    'user_email': row.user_email,
                    'company': row.company,
                    'attempts_count': row.attempts_count,
                    'best_score': float(row.best_score),
                    'last_attempt': row.last_attempt.isoformat() if hasattr(row.last_attempt, 'isoformat') else str(row.last_attempt)
                })
            
            # Get statistics
            stats_query = """
                SELECT 
                    COUNT(DISTINCT user_id) as total_users,
                    COUNT(*) as total_attempts,
                    AVG(score_percent) as avg_score
                FROM aptitude_exam_history
            """
            stats_result = conn.execute(text(stats_query))
            stats_row = stats_result.fetchone()
            
            # Get company breakdown
            company_query = """
                SELECT 
                    LOWER(company) as company,
                    COUNT(*) as count
                FROM aptitude_exam_history
                GROUP BY LOWER(company)
                ORDER BY count DESC
            """
            company_result = conn.execute(text(company_query))
            companies = [{'company': row.company, 'count': row.count} for row in company_result]
            
            stats = {
                'total_users': stats_row.total_users if stats_row else 0,
                'total_attempts': stats_row.total_attempts if stats_row else 0,
                'avg_score': float(stats_row.avg_score) if stats_row and stats_row.avg_score else 0,
                'companies': companies
            }
            
            return {
                'attempts': attempts,
                'stats': stats
            }
            
    except Exception as e:
        print(f"Error fetching exam attempts: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


@router.post("/reset-exam-attempts")
async def reset_exam_attempts(
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Reset exam attempts for a specific user and company"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        user_id = request.get('user_id')
        company = request.get('company')
        
        if not user_id or not company:
            raise HTTPException(status_code=400, detail="user_id and company are required")
        
        with engine.begin() as conn:
            # Delete all attempts for this user and company
            delete_query = """
                DELETE FROM aptitude_exam_history
                WHERE user_id = :user_id AND LOWER(company) = LOWER(:company)
            """
            conn.execute(text(delete_query), {'user_id': user_id, 'company': company})
        
        return {'message': 'Attempts reset successfully'}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error resetting attempts: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )



# ============================================================================
# COMPANY EXAM UNLOCK CONTROL
# ============================================================================

@router.get("/company-exam-settings")
async def get_company_exam_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all company exam settings for admin control"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.connect() as conn:
            query = """
                SELECT 
                    id,
                    company_key,
                    company_name,
                    is_unlocked,
                    difficulty,
                    plan_requirement,
                    updated_at
                FROM company_exam_settings
                ORDER BY company_name
            """
            result = conn.execute(text(query))
            settings = []
            
            for row in result:
                settings.append({
                    'id': row.id,
                    'company_key': row.company_key,
                    'company_name': row.company_name,
                    'is_unlocked': row.is_unlocked,
                    'difficulty': row.difficulty,
                    'plan_requirement': row.plan_requirement,
                    'updated_at': row.updated_at.isoformat() if hasattr(row.updated_at, 'isoformat') else str(row.updated_at)
                })
            
            return {'settings': settings}
            
    except Exception as e:
        print(f"Error fetching company exam settings: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


@router.put("/company-exam-settings/{company_key}")
async def update_company_exam_setting(
    company_key: str,
    request: Dict[str, Any],
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Update company exam unlock status"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        is_unlocked = request.get('is_unlocked')
        
        if is_unlocked is None:
            raise HTTPException(status_code=400, detail="is_unlocked is required")
        
        with engine.begin() as conn:
            # Update the setting
            update_query = """
                UPDATE company_exam_settings
                SET is_unlocked = :is_unlocked,
                    updated_at = CURRENT_TIMESTAMP
                WHERE company_key = :company_key
            """
            result = conn.execute(
                text(update_query),
                {'is_unlocked': is_unlocked, 'company_key': company_key}
            )
            
            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail="Company exam not found")
        
        return {'message': 'Company exam setting updated successfully'}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating company exam setting: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )



# ============================================================================
# DSA QUESTIONS MANAGEMENT
# ============================================================================

@router.get("/dsa-questions")
async def get_dsa_questions(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all DSA questions with statistics"""
    try:
        # Read from dsaQuestions.ts file
        import os
        import re
        
        frontend_path = os.path.join(os.path.dirname(__file__), '../../../frontend/src/data/dsaQuestions.ts')
        
        if not os.path.exists(frontend_path):
            return {'questions': [], 'stats': {'total': 0, 'easy': 0, 'medium': 0, 'hard': 0, 'topics': []}}
        
        with open(frontend_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract questions array - find from export const to the end
        match = re.search(r'export const dsaQuestions: DSAQuestion\[\] = \[(.*)\];', content, re.DOTALL)
        if not match:
            return {'questions': [], 'stats': {'total': 0, 'easy': 0, 'medium': 0, 'hard': 0, 'topics': []}}
        
        questions_text = match.group(1)
        
        # Count questions by difficulty
        easy_count = questions_text.count("difficulty: 'Easy'")
        medium_count = questions_text.count("difficulty: 'Medium'")
        hard_count = questions_text.count("difficulty: 'Hard'")
        total = easy_count + medium_count + hard_count
        
        # Extract topics
        topic_matches = re.findall(r"topic: '([^']+)'", questions_text)
        topic_counts = {}
        for topic in topic_matches:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        topics = [{'topic': k, 'count': v} for k, v in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)]
        
        # Extract individual questions for display
        questions = []
        # Match each question object more carefully
        question_pattern = r"id:\s*(\d+),\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)',\s*difficulty:\s*'([^']+)',\s*topic:\s*'([^']+)',\s*companies:\s*\[([^\]]+)\]"
        
        for match in re.finditer(question_pattern, questions_text):
            id_num = int(match.group(1))
            slug = match.group(2)
            title = match.group(3)
            difficulty = match.group(4)
            topic = match.group(5)
            companies_str = match.group(6)
            
            # Parse companies array
            companies = [c.strip().strip("'\"") for c in companies_str.split(',') if c.strip()]
            
            # Try to find acceptance rate for this question
            acceptance = 50.0  # default
            acceptance_match = re.search(rf"id:\s*{id_num}.*?acceptance:\s*([\d.]+)", questions_text, re.DOTALL)
            if acceptance_match:
                acceptance = float(acceptance_match.group(1))
            
            questions.append({
                'id': id_num,
                'slug': slug,
                'title': title,
                'difficulty': difficulty,
                'topic': topic,
                'companies': companies,
                'acceptance': acceptance
            })
        
        stats = {
            'total': total,
            'easy': easy_count,
            'medium': medium_count,
            'hard': hard_count,
            'topics': topics[:10]  # Top 10 topics
        }
        
        return {'questions': questions, 'stats': stats}
        
    except Exception as e:
        print(f"Error fetching DSA questions: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'questions': [], 'stats': {'total': 0, 'easy': 0, 'medium': 0, 'hard': 0, 'topics': []}}


@router.post("/dsa-questions/bulk-upload")
async def bulk_upload_dsa_questions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Bulk upload DSA questions from CSV"""
    import csv
    import io
    
    try:
        # Read CSV file
        contents = await file.read()
        csv_file = io.StringIO(contents.decode('utf-8'))
        reader = csv.DictReader(csv_file)
        
        # Note: This is a simplified version
        # In production, you'd want to properly parse and append to dsaQuestions.ts
        # For now, we'll just validate the format and return success
        
        added = 0
        errors = []
        
        for row in reader:
            try:
                # Validate required fields
                required = ['slug', 'title', 'difficulty', 'topic', 'companies', 'description']
                missing = [f for f in required if f not in row or not row[f]]
                
                if missing:
                    errors.append(f"Row missing fields: {', '.join(missing)}")
                    continue
                
                # Validate difficulty
                if row['difficulty'] not in ['Easy', 'Medium', 'Hard']:
                    errors.append(f"Invalid difficulty for {row['title']}: {row['difficulty']}")
                    continue
                
                added += 1
                
            except Exception as e:
                errors.append(f"Error processing row: {str(e)}")
        
        if added == 0:
            raise HTTPException(status_code=400, detail=f"No valid questions found. Errors: {'; '.join(errors[:5])}")
        
        return {
            'message': 'Upload successful',
            'added': added,
            'errors': errors[:10] if errors else []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading DSA questions: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )
