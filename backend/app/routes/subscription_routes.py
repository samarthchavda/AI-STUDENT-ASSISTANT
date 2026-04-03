from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.auth import get_current_user, require_admin
from app.core.database import engine

router = APIRouter()

class SubscriptionInfo(BaseModel):
    plan_type: str
    status: str
    started_at: datetime
    expires_at: Optional[datetime]
    ai_requests_limit: int
    ai_requests_used: int
    ai_requests_remaining: int
    features: dict

class FeatureLimits(BaseModel):
    ai_requests_per_day: int
    company_sheets_access: str
    resume_templates_access: str
    daily_challenges: bool
    advanced_analytics: bool
    priority_support: bool

@router.get("/status", response_model=SubscriptionInfo)
async def get_subscription_status(current_user: dict = Depends(get_current_user)):
    """Get user's subscription status and limits"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            # Reset daily usage if needed
            conn.execute(text("SELECT reset_daily_ai_usage()"))
            
            # Get subscription
            result = conn.execute(
                text("""
                    SELECT 
                        us.plan_type, us.status, us.started_at, us.expires_at,
                        us.ai_requests_limit, us.ai_requests_used,
                        fl.ai_requests_per_day, fl.company_sheets_access,
                        fl.resume_templates_access, fl.daily_challenges,
                        fl.advanced_analytics, fl.priority_support
                    FROM user_subscriptions us
                    JOIN feature_usage_limits fl ON us.plan_type = fl.plan_type
                    WHERE us.user_id = :user_id
                """),
                {"user_id": user_id}
            ).fetchone()
            
            if not result:
                raise HTTPException(status_code=404, detail="Subscription not found")
            
            ai_limit = result[4]
            ai_used = result[5]
            ai_remaining = -1 if ai_limit == -1 else max(0, ai_limit - ai_used)
            
            return SubscriptionInfo(
                plan_type=result[0],
                status=result[1],
                started_at=result[2],
                expires_at=result[3],
                ai_requests_limit=ai_limit,
                ai_requests_used=ai_used,
                ai_requests_remaining=ai_remaining,
                features={
                    "ai_requests_per_day": result[6],
                    "company_sheets_access": result[7],
                    "resume_templates_access": result[8],
                    "daily_challenges": result[9],
                    "advanced_analytics": result[10],
                    "priority_support": result[11]
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch subscription: {str(e)}")

@router.post("/check-ai-access")
async def check_ai_access(current_user: dict = Depends(get_current_user)):
    """Check if user can use AI features"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT can_use_ai(:user_id)"),
                {"user_id": user_id}
            ).scalar()
            
            if not result:
                # Get remaining info
                sub = conn.execute(
                    text("""
                        SELECT ai_requests_limit, ai_requests_used
                        FROM user_subscriptions
                        WHERE user_id = :user_id
                    """),
                    {"user_id": user_id}
                ).fetchone()
                
                return {
                    "can_use": False,
                    "reason": "Daily AI limit reached",
                    "limit": sub[0] if sub else 10,
                    "used": sub[1] if sub else 0,
                    "upgrade_required": True
                }
            
            return {"can_use": True}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check AI access: {str(e)}")

@router.post("/use-ai")
async def record_ai_usage(current_user: dict = Depends(get_current_user)):
    """Record AI usage (called by AI services)"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            # Check if can use
            can_use = conn.execute(
                text("SELECT can_use_ai(:user_id)"),
                {"user_id": user_id}
            ).scalar()
            
            if not can_use:
                raise HTTPException(
                    status_code=403,
                    detail="AI usage limit reached. Please upgrade to premium."
                )
            
            # Increment usage
            conn.execute(
                text("SELECT increment_ai_usage(:user_id)"),
                {"user_id": user_id}
            )
            conn.commit()
            
            return {"message": "AI usage recorded"}
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record usage: {str(e)}")

@router.post("/upgrade-to-premium")
async def upgrade_to_premium(
    payment_id: Optional[str] = None,
    amount: Optional[float] = None,
    current_user: dict = Depends(get_current_user)
):
    """Upgrade user to premium (simplified - integrate with payment gateway)"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            # Update subscription
            expires_at = datetime.now() + timedelta(days=365)  # 1 year
            
            conn.execute(
                text("""
                    UPDATE user_subscriptions
                    SET plan_type = 'premium',
                        status = 'active',
                        expires_at = :expires_at,
                        ai_requests_limit = -1,
                        payment_id = :payment_id,
                        amount_paid = :amount
                    WHERE user_id = :user_id
                """),
                {
                    "user_id": user_id,
                    "expires_at": expires_at,
                    "payment_id": payment_id,
                    "amount": amount
                }
            )
            
            # Create notification
            conn.execute(
                text("""
                    INSERT INTO user_notifications 
                    (user_id, notification_type, title, message, action_url)
                    VALUES (
                        :user_id,
                        'subscription',
                        'Welcome to Premium!',
                        'You now have unlimited AI access, all company sheets, and premium templates!',
                        '/dashboard'
                    )
                """),
                {"user_id": user_id}
            )
            
            conn.commit()
            
            return {
                "message": "Successfully upgraded to premium",
                "expires_at": expires_at.isoformat()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upgrade: {str(e)}")

@router.get("/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT 
                        plan_type, ai_requests_per_day, company_sheets_access,
                        resume_templates_access, daily_challenges, advanced_analytics,
                        priority_support
                    FROM feature_usage_limits
                    ORDER BY 
                        CASE plan_type 
                            WHEN 'free' THEN 1 
                            WHEN 'premium' THEN 2 
                            WHEN 'enterprise' THEN 3 
                        END
                """)
            )
            
            plans = []
            for row in result:
                plans.append({
                    "plan_type": row[0],
                    "price": 0 if row[0] == 'free' else (999 if row[0] == 'premium' else 2999),
                    "features": {
                        "ai_requests_per_day": row[1],
                        "company_sheets_access": row[2],
                        "resume_templates_access": row[3],
                        "daily_challenges": row[4],
                        "advanced_analytics": row[5],
                        "priority_support": row[6]
                    }
                })
            
            return {"plans": plans}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch plans: {str(e)}")

# Admin endpoints
@router.get("/admin/subscriptions")
async def get_all_subscriptions(
    limit: int = 100,
    current_user: dict = Depends(require_admin)
):
    """Admin: Get all user subscriptions"""
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT 
                        u.username, u.email, us.plan_type, us.status,
                        us.started_at, us.expires_at, us.amount_paid
                    FROM user_subscriptions us
                    JOIN users u ON us.user_id = u.id
                    ORDER BY us.started_at DESC
                    LIMIT :limit
                """),
                {"limit": limit}
            )
            
            subscriptions = []
            for row in result:
                subscriptions.append({
                    "username": row[0],
                    "email": row[1],
                    "plan_type": row[2],
                    "status": row[3],
                    "started_at": row[4].isoformat() if row[4] else None,
                    "expires_at": row[5].isoformat() if row[5] else None,
                    "amount_paid": float(row[6]) if row[6] else 0
                })
            
            return {"subscriptions": subscriptions, "total": len(subscriptions)}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch subscriptions: {str(e)}")

@router.get("/admin/revenue")
async def get_revenue_stats(current_user: dict = Depends(require_admin)):
    """Admin: Get revenue statistics"""
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT 
                        COUNT(*) FILTER (WHERE plan_type = 'premium') as premium_users,
                        COUNT(*) FILTER (WHERE plan_type = 'enterprise') as enterprise_users,
                        COALESCE(SUM(amount_paid), 0) as total_revenue,
                        COALESCE(SUM(amount_paid) FILTER (WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as monthly_revenue
                    FROM user_subscriptions
                """)
            ).fetchone()
            
            return {
                "premium_users": result[0],
                "enterprise_users": result[1],
                "total_revenue": float(result[2]),
                "monthly_revenue": float(result[3])
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch revenue: {str(e)}")
