"""
Admin Panel Enhancements Routes
- System Health Monitoring
- Broadcast System
- Audit Logs
- User Sessions
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models import (
    User, SystemHealthLog, AdminAuditLog, UserSession, Broadcast, Notification
)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/api/admin", tags=["admin-enhancements"])


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class BroadcastCreate(BaseModel):
    title: str
    message: str
    target_audience: str  # 'all', 'pro', 'basic', 'free'


class AuditLogResponse(BaseModel):
    id: int
    admin_name: str
    admin_email: str
    action_type: str
    target_user_name: Optional[str]
    action_details: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SystemHealthResponse(BaseModel):
    metric_type: str
    avg_response_time: float
    success_rate: float
    total_requests: int
    last_24h_avg: float


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def log_admin_action(
    db: Session,
    admin_id: int,
    action_type: str,
    action_details: str,
    target_user_id: Optional[int] = None,
    request: Optional[Request] = None
):
    """Log admin action to audit trail"""
    ip_address = None
    user_agent = None
    
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
    
    audit_log = AdminAuditLog(
        admin_id=admin_id,
        action_type=action_type,
        target_user_id=target_user_id,
        action_details=action_details,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(audit_log)
    db.commit()


def is_user_online(user_id: int, db: Session) -> bool:
    """Check if user is online (active in last 5 minutes)"""
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
    
    active_session = db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.is_active == True,
        UserSession.last_activity >= five_minutes_ago
    ).first()
    
    return active_session is not None


# ============================================================================
# SYSTEM HEALTH MONITORING
# ============================================================================

@router.get("/system-health")
async def get_system_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get system health metrics"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get metrics for last 24 hours
    last_24h = datetime.utcnow() - timedelta(hours=24)
    
    # Gemini API metrics
    gemini_metrics = db.query(
        func.avg(SystemHealthLog.response_time_ms).label('avg_time'),
        func.count(SystemHealthLog.id).label('total'),
        func.sum(func.cast(SystemHealthLog.status == 'success', Integer)).label('success_count')
    ).filter(
        SystemHealthLog.metric_type == 'gemini_api',
        SystemHealthLog.created_at >= last_24h
    ).first()
    
    # Database query metrics
    db_metrics = db.query(
        func.avg(SystemHealthLog.response_time_ms).label('avg_time'),
        func.count(SystemHealthLog.id).label('total'),
        func.sum(func.cast(SystemHealthLog.status == 'success', Integer)).label('success_count')
    ).filter(
        SystemHealthLog.metric_type == 'database_query',
        SystemHealthLog.created_at >= last_24h
    ).first()
    
    # API endpoint metrics
    api_metrics = db.query(
        func.avg(SystemHealthLog.response_time_ms).label('avg_time'),
        func.count(SystemHealthLog.id).label('total'),
        func.sum(func.cast(SystemHealthLog.status == 'success', Integer)).label('success_count')
    ).filter(
        SystemHealthLog.metric_type == 'api_endpoint',
        SystemHealthLog.created_at >= last_24h
    ).first()
    
    def format_metrics(metrics, metric_type):
        if not metrics or metrics.total == 0:
            return {
                "metric_type": metric_type,
                "avg_response_time": 0,
                "success_rate": 100,
                "total_requests": 0,
                "status": "healthy"
            }
        
        avg_time = float(metrics.avg_time or 0)
        success_rate = (metrics.success_count / metrics.total * 100) if metrics.total > 0 else 100
        
        # Determine status
        status = "healthy"
        if metric_type == "gemini_api":
            if avg_time > 3000 or success_rate < 90:
                status = "warning"
            if avg_time > 5000 or success_rate < 80:
                status = "critical"
        elif metric_type == "database_query":
            if avg_time > 500 or success_rate < 95:
                status = "warning"
            if avg_time > 1000 or success_rate < 90:
                status = "critical"
        
        return {
            "metric_type": metric_type,
            "avg_response_time": round(avg_time, 2),
            "success_rate": round(success_rate, 2),
            "total_requests": metrics.total,
            "status": status
        }
    
    return {
        "gemini_api": format_metrics(gemini_metrics, "gemini_api"),
        "database": format_metrics(db_metrics, "database_query"),
        "api_endpoints": format_metrics(api_metrics, "api_endpoint"),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/system-health/history")
async def get_system_health_history(
    metric_type: str,
    hours: int = 24,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get historical system health data"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    logs = db.query(SystemHealthLog).filter(
        SystemHealthLog.metric_type == metric_type,
        SystemHealthLog.created_at >= start_time
    ).order_by(SystemHealthLog.created_at).all()
    
    return {
        "metric_type": metric_type,
        "data": [
            {
                "timestamp": log.created_at.isoformat(),
                "response_time": log.response_time_ms,
                "status": log.status
            }
            for log in logs
        ]
    }


# ============================================================================
# BROADCAST SYSTEM
# ============================================================================

@router.post("/broadcast")
async def create_broadcast(
    broadcast: BroadcastCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create and send broadcast to users"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get target users based on audience
    if broadcast.target_audience == "all":
        target_users = db.query(User).all()
    else:
        target_users = db.query(User).filter(
            User.plan == broadcast.target_audience.upper()
        ).all()
    
    # Create broadcast record
    broadcast_record = Broadcast(
        admin_id=current_user.id,
        title=broadcast.title,
        message=broadcast.message,
        target_audience=broadcast.target_audience,
        users_count=len(target_users),
        is_active=True
    )
    db.add(broadcast_record)
    db.flush()
    
    # Create notifications for each user
    for user in target_users:
        notification = Notification(
            user_id=user.id,
            title=broadcast.title,
            message=broadcast.message,
            is_read=False
        )
        db.add(notification)
    
    db.commit()
    
    # Log admin action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type="broadcast_sent",
        action_details=f"Sent broadcast '{broadcast.title}' to {len(target_users)} users ({broadcast.target_audience})",
        request=request
    )
    
    return {
        "success": True,
        "broadcast_id": broadcast_record.id,
        "users_notified": len(target_users),
        "message": f"Broadcast sent to {len(target_users)} users"
    }


@router.get("/broadcasts")
async def get_broadcasts(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get broadcast history"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    broadcasts = db.query(Broadcast).order_by(
        desc(Broadcast.created_at)
    ).limit(limit).all()
    
    return {
        "broadcasts": [
            {
                "id": b.id,
                "title": b.title,
                "message": b.message,
                "target_audience": b.target_audience,
                "users_count": b.users_count,
                "is_active": b.is_active,
                "created_at": b.created_at.isoformat()
            }
            for b in broadcasts
        ]
    }


@router.delete("/broadcast/{broadcast_id}")
async def deactivate_broadcast(
    broadcast_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deactivate a broadcast banner"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    broadcast = db.query(Broadcast).filter(Broadcast.id == broadcast_id).first()
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")
    
    broadcast.is_active = False
    db.commit()
    
    # Log admin action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type="broadcast_deactivated",
        action_details=f"Deactivated broadcast '{broadcast.title}'",
        request=request
    )
    
    return {"success": True, "message": "Broadcast deactivated"}


# ============================================================================
# AUDIT LOGS
# ============================================================================

@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    action_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get admin audit logs"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(AdminAuditLog).join(
        User, AdminAuditLog.admin_id == User.id
    )
    
    if action_type:
        query = query.filter(AdminAuditLog.action_type == action_type)
    
    logs = query.order_by(desc(AdminAuditLog.created_at)).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "admin_name": log.admin.name,
                "admin_email": log.admin.email,
                "action_type": log.action_type,
                "target_user_name": log.target_user.name if log.target_user else None,
                "action_details": log.action_details,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ]
    }


@router.get("/audit-logs/stats")
async def get_audit_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get audit log statistics"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get action counts by type
    action_counts = db.query(
        AdminAuditLog.action_type,
        func.count(AdminAuditLog.id).label('count')
    ).group_by(AdminAuditLog.action_type).all()
    
    # Get recent activity (last 24 hours)
    last_24h = datetime.utcnow() - timedelta(hours=24)
    recent_count = db.query(AdminAuditLog).filter(
        AdminAuditLog.created_at >= last_24h
    ).count()
    
    return {
        "action_counts": {action: count for action, count in action_counts},
        "recent_activity_24h": recent_count,
        "total_logs": sum(count for _, count in action_counts)
    }


# ============================================================================
# USER SESSIONS
# ============================================================================

@router.get("/users/sessions")
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users with their online/offline status"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = db.query(User).all()
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
    
    user_list = []
    for user in users:
        # Check if user has active session
        active_session = db.query(UserSession).filter(
            UserSession.user_id == user.id,
            UserSession.is_active == True,
            UserSession.last_activity >= five_minutes_ago
        ).first()
        
        user_list.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan.value,
            "is_admin": user.is_admin,
            "is_online": active_session is not None,
            "last_activity": active_session.last_activity.isoformat() if active_session else None,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    
    # Sort by online status first, then by name
    user_list.sort(key=lambda x: (not x["is_online"], x["name"]))
    
    return {
        "users": user_list,
        "total_users": len(user_list),
        "online_users": sum(1 for u in user_list if u["is_online"])
    }


@router.post("/users/{user_id}/session")
async def update_user_session(
    user_id: int,
    session_token: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update user session activity (called by frontend)"""
    # Find or create session
    session = db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.session_token == session_token
    ).first()
    
    if session:
        session.last_activity = datetime.utcnow()
        session.is_active = True
    else:
        session = UserSession(
            user_id=user_id,
            session_token=session_token,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            last_activity=datetime.utcnow(),
            is_active=True
        )
        db.add(session)
    
    db.commit()
    
    return {"success": True}
