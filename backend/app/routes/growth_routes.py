"""
Growth & Startup Features Routes
- Leaderboard Management
- Transaction Logs
- Smart Notifications (Nudge System)
- Referral Tracking
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.email import send_email
from app.models import (
    User, DSAUserStats, Payment, Referral, UserEngagementLog,
    LeaderboardHistory, EmailCampaign, EmailLog, RevenueAnalytics
)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta, date
import json

router = APIRouter(prefix="/api/admin/growth", tags=["growth-features"])


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class LeaderboardUpdate(BaseModel):
    user_id: int
    custom_rank: Optional[int] = None
    is_visible: bool = True
    featured: bool = False


class NudgeEmail(BaseModel):
    user_ids: List[int]
    subject: str
    message: str


class ReferralStats(BaseModel):
    total_referrals: int
    completed_referrals: int
    pending_referrals: int
    top_referrers: List[dict]


# ============================================================================
# LEADERBOARD MANAGEMENT
# ============================================================================

@router.get("/leaderboard")
async def get_leaderboard_management(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get leaderboard with management options"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all users with stats
    leaderboard = db.query(
        DSAUserStats,
        User.name,
        User.email,
        User.plan
    ).join(
        User, DSAUserStats.user_id == User.id
    ).order_by(
        desc(DSAUserStats.total_solved),
        desc(DSAUserStats.accuracy)
    ).limit(limit).all()
    
    result = []
    for idx, (stats, name, email, plan) in enumerate(leaderboard, 1):
        # Use custom rank if set, otherwise use calculated rank
        display_rank = stats.custom_rank if stats.rank_override and stats.custom_rank else idx
        
        result.append({
            "rank": display_rank,
            "user_id": stats.user_id,
            "name": name,
            "email": email,
            "plan": plan.value,
            "total_solved": stats.total_solved,
            "easy_solved": stats.easy_solved,
            "medium_solved": stats.medium_solved,
            "hard_solved": stats.hard_solved,
            "accuracy": stats.accuracy,
            "total_score": stats.total_score,
            "streak_days": stats.streak_days,
            "is_visible": stats.is_visible,
            "featured": stats.featured,
            "custom_rank": stats.custom_rank,
            "rank_override": stats.rank_override
        })
    
    return {"leaderboard": result}


@router.put("/leaderboard/{user_id}")
async def update_leaderboard_entry(
    user_id: int,
    update: LeaderboardUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update leaderboard entry (visibility, custom rank, featured)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = db.query(DSAUserStats).filter(DSAUserStats.user_id == user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    
    # Update fields
    stats.is_visible = update.is_visible
    stats.featured = update.featured
    
    if update.custom_rank is not None:
        stats.custom_rank = update.custom_rank
        stats.rank_override = True
    else:
        stats.rank_override = False
    
    db.commit()
    
    # Log admin action
    from app.routes.admin_enhancements_routes import log_admin_action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type="leaderboard_updated",
        action_details=f"Updated leaderboard for user {user_id}: visible={update.is_visible}, featured={update.featured}, custom_rank={update.custom_rank}",
        target_user_id=user_id,
        request=request
    )
    
    return {"success": True, "message": "Leaderboard updated"}


@router.get("/leaderboard/history/{user_id}")
async def get_leaderboard_history(
    user_id: int,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get rank history for a user"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    start_date = date.today() - timedelta(days=days)
    
    history = db.query(LeaderboardHistory).filter(
        LeaderboardHistory.user_id == user_id,
        LeaderboardHistory.snapshot_date >= start_date
    ).order_by(LeaderboardHistory.snapshot_date).all()
    
    return {
        "user_id": user_id,
        "history": [
            {
                "date": h.snapshot_date.isoformat(),
                "rank": h.rank,
                "total_solved": h.total_solved,
                "accuracy": h.accuracy,
                "total_score": h.total_score
            }
            for h in history
        ]
    }


# ============================================================================
# TRANSACTION LOGS
# ============================================================================

@router.get("/transactions")
async def get_transaction_logs(
    limit: int = 100,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed transaction logs"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(
        Payment,
        User.name,
        User.email
    ).join(User, Payment.user_id == User.id)
    
    # Apply filters
    if status:
        query = query.filter(Payment.status == status)
    
    if start_date:
        query = query.filter(Payment.created_at >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(Payment.created_at <= datetime.fromisoformat(end_date))
    
    transactions = query.order_by(desc(Payment.created_at)).limit(limit).all()
    
    result = []
    for payment, name, email in transactions:
        result.append({
            "id": payment.id,
            "transaction_id": payment.transaction_id,
            "user_id": payment.user_id,
            "user_name": name,
            "user_email": email,
            "plan": payment.plan.value,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status,
            "payment_method": payment.payment_method,
            "payment_gateway": payment.payment_gateway,
            "payment_id": payment.payment_id,
            "customer_email": payment.customer_email,
            "customer_phone": payment.customer_phone,
            "refund_status": payment.refund_status,
            "refund_amount": payment.refund_amount,
            "created_at": payment.created_at.isoformat(),
            "notes": payment.notes
        })
    
    # Get summary stats
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == 'completed'
    ).scalar() or 0
    
    total_transactions = db.query(func.count(Payment.id)).filter(
        Payment.status == 'completed'
    ).scalar() or 0
    
    total_refunds = db.query(func.sum(Payment.refund_amount)).scalar() or 0
    
    return {
        "transactions": result,
        "summary": {
            "total_revenue": total_revenue,
            "total_transactions": total_transactions,
            "total_refunds": total_refunds,
            "net_revenue": total_revenue - total_refunds
        }
    }


@router.put("/transactions/{payment_id}")
async def update_transaction(
    payment_id: int,
    notes: Optional[str] = None,
    refund_status: Optional[str] = None,
    refund_amount: Optional[int] = None,
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update transaction details"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if notes is not None:
        payment.notes = notes
    
    if refund_status is not None:
        payment.refund_status = refund_status
        payment.refund_date = datetime.utcnow()
    
    if refund_amount is not None:
        payment.refund_amount = refund_amount
    
    payment.updated_at = datetime.utcnow()
    db.commit()
    
    # Log admin action
    from app.routes.admin_enhancements_routes import log_admin_action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type="transaction_updated",
        action_details=f"Updated transaction {payment_id}: refund_status={refund_status}, refund_amount={refund_amount}",
        target_user_id=payment.user_id,
        request=request
    )
    
    return {"success": True, "message": "Transaction updated"}


# ============================================================================
# SMART NOTIFICATIONS (NUDGE SYSTEM)
# ============================================================================

@router.get("/inactive-users")
async def get_inactive_users(
    days: int = 7,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of inactive users for nudging"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Find users who haven't logged in recently
    inactive_users = db.query(User).filter(
        or_(
            User.last_activity_at < cutoff_date,
            User.last_activity_at == None
        ),
        User.is_active == True
    ).limit(limit).all()
    
    result = []
    for user in inactive_users:
        # Get last activity
        last_activity = user.last_activity_at or user.created_at
        days_inactive = (datetime.utcnow() - last_activity).days
        
        # Get user stats
        stats = db.query(DSAUserStats).filter(DSAUserStats.user_id == user.id).first()
        
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan.value,
            "last_activity": last_activity.isoformat() if last_activity else None,
            "days_inactive": days_inactive,
            "problems_solved": stats.total_solved if stats else 0,
            "nudge_sent_at": user.nudge_sent_at.isoformat() if user.nudge_sent_at else None,
            "nudge_count": user.nudge_count or 0,
            "created_at": user.created_at.isoformat()
        })
    
    return {
        "inactive_users": result,
        "total_count": len(result)
    }


@router.post("/nudge")
async def send_nudge_email(
    nudge: NudgeEmail,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send personalized 'Come Back' email to inactive users"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Create email campaign
    campaign = EmailCampaign(
        campaign_name=f"Nudge Campaign - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        campaign_type="nudge",
        subject=nudge.subject,
        body=nudge.message,
        target_audience="inactive",
        created_by=current_user.id,
        sent_at=datetime.utcnow()
    )
    db.add(campaign)
    db.flush()
    
    sent_count = 0
    failed_count = 0
    
    for user_id in nudge.user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            continue
        
        try:
            # Personalize message
            personalized_message = nudge.message.replace("{name}", user.name)
            
            # Send email
            send_email(
                to_email=user.email,
                subject=nudge.subject,
                body=personalized_message
            )
            
            # Log email
            email_log = EmailLog(
                campaign_id=campaign.id,
                user_id=user.id,
                email=user.email,
                status="sent"
            )
            db.add(email_log)
            
            # Update user nudge tracking
            user.nudge_sent_at = datetime.utcnow()
            user.nudge_count = (user.nudge_count or 0) + 1
            
            sent_count += 1
            
        except Exception as e:
            # Log failed email
            email_log = EmailLog(
                campaign_id=campaign.id,
                user_id=user.id,
                email=user.email,
                status="failed",
                error_message=str(e)
            )
            db.add(email_log)
            failed_count += 1
    
    # Update campaign stats
    campaign.sent_count = sent_count
    db.commit()
    
    # Log admin action
    from app.routes.admin_enhancements_routes import log_admin_action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type="nudge_sent",
        action_details=f"Sent nudge emails to {sent_count} users. Failed: {failed_count}",
        request=request
    )
    
    return {
        "success": True,
        "sent_count": sent_count,
        "failed_count": failed_count,
        "campaign_id": campaign.id
    }


# ============================================================================
# REFERRAL TRACKING
# ============================================================================

@router.get("/referrals")
async def get_referral_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get referral tracking statistics"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Total referrals
    total_referrals = db.query(func.count(Referral.id)).scalar() or 0
    completed_referrals = db.query(func.count(Referral.id)).filter(
        Referral.status == 'completed'
    ).scalar() or 0
    pending_referrals = db.query(func.count(Referral.id)).filter(
        Referral.status == 'pending'
    ).scalar() or 0
    
    # Top referrers
    top_referrers = db.query(
        User.id,
        User.name,
        User.email,
        User.referral_code,
        User.referral_count
    ).filter(
        User.referral_count > 0
    ).order_by(desc(User.referral_count)).limit(10).all()
    
    top_referrers_list = [
        {
            "user_id": user_id,
            "name": name,
            "email": email,
            "referral_code": code,
            "referral_count": count
        }
        for user_id, name, email, code, count in top_referrers
    ]
    
    return {
        "total_referrals": total_referrals,
        "completed_referrals": completed_referrals,
        "pending_referrals": pending_referrals,
        "conversion_rate": (completed_referrals / total_referrals * 100) if total_referrals > 0 else 0,
        "top_referrers": top_referrers_list
    }


@router.get("/referrals/{user_id}")
async def get_user_referrals(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get referrals made by a specific user"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    referrals = db.query(
        Referral,
        User.name,
        User.email,
        User.plan
    ).join(
        User, Referral.referred_user_id == User.id
    ).filter(
        Referral.referrer_user_id == user_id
    ).all()
    
    result = []
    for referral, name, email, plan in referrals:
        result.append({
            "id": referral.id,
            "referred_user_id": referral.referred_user_id,
            "referred_user_name": name,
            "referred_user_email": email,
            "referred_user_plan": plan.value,
            "status": referral.status,
            "reward_given": referral.reward_given,
            "created_at": referral.created_at.isoformat(),
            "completed_at": referral.completed_at.isoformat() if referral.completed_at else None
        })
    
    return {"referrals": result}


@router.get("/users-with-referrals")
async def get_users_with_referral_info(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users with their referral information"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = db.query(User).limit(limit).all()
    
    result = []
    for user in users:
        # Get referrer info if exists
        referrer_info = None
        if user.referred_by_code:
            referrer = db.query(User).filter(User.referral_code == user.referred_by_code).first()
            if referrer:
                referrer_info = {
                    "id": referrer.id,
                    "name": referrer.name,
                    "email": referrer.email
                }
        
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan.value,
            "referral_code": user.referral_code,
            "referred_by_code": user.referred_by_code,
            "referrer_info": referrer_info,
            "referral_count": user.referral_count or 0,
            "created_at": user.created_at.isoformat()
        })
    
    return {"users": result}


# ============================================================================
# REVENUE ANALYTICS
# ============================================================================

@router.get("/revenue")
async def get_revenue_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get revenue analytics"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    start_date = date.today() - timedelta(days=days)
    
    analytics = db.query(RevenueAnalytics).filter(
        RevenueAnalytics.date >= start_date
    ).order_by(RevenueAnalytics.date).all()
    
    # Calculate totals
    total_revenue = sum(a.total_revenue for a in analytics)
    total_transactions = sum(a.total_transactions for a in analytics)
    total_refunds = sum(a.refund_amount for a in analytics)
    
    return {
        "daily_analytics": [
            {
                "date": a.date.isoformat(),
                "total_revenue": a.total_revenue,
                "total_transactions": a.total_transactions,
                "new_pro_users": a.new_pro_users,
                "new_basic_users": a.new_basic_users,
                "churned_users": a.churned_users,
                "refund_amount": a.refund_amount,
                "mrr": a.mrr,
                "arr": a.arr
            }
            for a in analytics
        ],
        "summary": {
            "total_revenue": total_revenue,
            "total_transactions": total_transactions,
            "total_refunds": total_refunds,
            "net_revenue": total_revenue - total_refunds,
            "avg_transaction_value": total_revenue / total_transactions if total_transactions > 0 else 0
        }
    }
