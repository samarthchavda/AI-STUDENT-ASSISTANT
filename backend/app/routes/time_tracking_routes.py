"""
Time Tracking Routes
API endpoints for tracking user activity and time spent
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.database import get_db, engine
from app.core.auth import get_current_user
from app.models import User

router = APIRouter()

# Request/Response Models
class ActivityLogRequest(BaseModel):
    page_url: Optional[str] = None
    feature_name: Optional[str] = None
    action_type: str  # page_view, feature_use, button_click, session_start, session_end
    duration_seconds: int = 0
    session_id: str
    metadata: Optional[dict] = None

class TimeTrackingSummary(BaseModel):
    avg_daily_time_minutes: float
    total_time_hours: float
    active_users_count: int
    peak_hour: str
    total_sessions: int

# ============================================================================
# USER TRACKING ENDPOINTS (For Frontend)
# ============================================================================

@router.post("/activity")
async def log_activity(
    activity: ActivityLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log user activity (called by frontend)"""
    try:
        import json
        
        query = text("""
            INSERT INTO user_activity_logs 
            (user_id, page_url, feature_name, action_type, duration_seconds, session_id, metadata)
            VALUES (:user_id, :page_url, :feature_name, :action_type, :duration_seconds, :session_id, :metadata::jsonb)
        """)
        
        # Convert metadata to JSON string if it exists
        metadata_json = json.dumps(activity.metadata) if activity.metadata else None
        
        with engine.connect() as conn:
            conn.execute(query, {
                "user_id": current_user.id,
                "page_url": activity.page_url,
                "feature_name": activity.feature_name,
                "action_type": activity.action_type,
                "duration_seconds": activity.duration_seconds,
                "session_id": activity.session_id,
                "metadata": metadata_json
            })
            conn.commit()
        
        return {"status": "success", "message": "Activity logged"}
    except Exception as e:
        # Log error but don't fail - tracking should be silent
        print(f"Activity logging error: {str(e)}")
        return {"status": "error", "message": str(e)}

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

def check_admin(current_user: User):
    """Helper to check if user is admin"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

@router.get("/admin/summary")
async def get_time_tracking_summary(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get time tracking summary for admin dashboard"""
    check_admin(current_user)
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        with engine.connect() as conn:
            # Get average daily time
            avg_query = text("""
                SELECT AVG(total_duration_seconds) / 60.0 as avg_minutes
                FROM user_activity_daily_summary
                WHERE activity_date >= :cutoff_date
            """)
            avg_result = conn.execute(avg_query, {"cutoff_date": cutoff_date.date()}).fetchone()
            avg_daily_time = round(avg_result[0] if avg_result[0] else 0, 2)
            
            # Get total time
            total_query = text("""
                SELECT SUM(duration_seconds) / 3600.0 as total_hours
                FROM user_activity_logs
                WHERE created_at >= :cutoff_date
            """)
            total_result = conn.execute(total_query, {"cutoff_date": cutoff_date}).fetchone()
            total_time = round(total_result[0] if total_result[0] else 0, 2)
            
            # Get active users count
            active_query = text("""
                SELECT COUNT(DISTINCT user_id) as active_users
                FROM user_activity_logs
                WHERE created_at >= :cutoff_date
            """)
            active_result = conn.execute(active_query, {"cutoff_date": cutoff_date}).fetchone()
            active_users = active_result[0] if active_result[0] else 0
            
            # Get peak hour
            peak_query = text("""
                SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
                FROM user_activity_logs
                WHERE created_at >= :cutoff_date
                GROUP BY EXTRACT(HOUR FROM created_at)
                ORDER BY count DESC
                LIMIT 1
            """)
            peak_result = conn.execute(peak_query, {"cutoff_date": cutoff_date}).fetchone()
            peak_hour = f"{int(peak_result[0])}:00" if peak_result else "N/A"
            
            # Get total sessions
            session_query = text("""
                SELECT COUNT(DISTINCT session_id) as total_sessions
                FROM user_activity_logs
                WHERE created_at >= :cutoff_date
            """)
            session_result = conn.execute(session_query, {"cutoff_date": cutoff_date}).fetchone()
            total_sessions = session_result[0] if session_result[0] else 0
        
        return {
            "avg_daily_time_minutes": avg_daily_time,
            "total_time_hours": total_time,
            "active_users_count": active_users,
            "peak_hour": peak_hour,
            "total_sessions": total_sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get summary: {str(e)}")

@router.get("/admin/daily-chart")
async def get_daily_time_chart(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily time spent data for chart"""
    check_admin(current_user)
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = text("""
            SELECT 
                DATE(created_at) as date,
                SUM(duration_seconds) / 60.0 as total_minutes,
                COUNT(DISTINCT user_id) as active_users,
                COUNT(DISTINCT session_id) as sessions
            FROM user_activity_logs
            WHERE created_at >= :cutoff_date
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
        """)
        
        with engine.connect() as conn:
            result = conn.execute(query, {"cutoff_date": cutoff_date})
            rows = result.fetchall()
        
        return {
            "data": [
                {
                    "date": row[0].isoformat(),
                    "total_minutes": round(row[1], 2),
                    "active_users": row[2],
                    "sessions": row[3]
                }
                for row in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get daily chart: {str(e)}")

@router.get("/admin/peak-hours")
async def get_peak_hours_heatmap(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get peak hours heatmap data"""
    check_admin(current_user)
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = text("""
            SELECT 
                EXTRACT(HOUR FROM created_at) as hour,
                EXTRACT(DOW FROM created_at) as day_of_week,
                COUNT(*) as activity_count
            FROM user_activity_logs
            WHERE created_at >= :cutoff_date
            GROUP BY EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at)
            ORDER BY hour, day_of_week
        """)
        
        with engine.connect() as conn:
            result = conn.execute(query, {"cutoff_date": cutoff_date})
            rows = result.fetchall()
        
        # Day names
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        return {
            "data": [
                {
                    "hour": int(row[0]),
                    "day": day_names[int(row[1])],
                    "day_index": int(row[1]),
                    "count": row[2]
                }
                for row in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get peak hours: {str(e)}")

@router.get("/admin/users-table")
async def get_users_time_table(
    days: int = 7,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user-wise time breakdown table"""
    check_admin(current_user)
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        
        query = text("""
            SELECT 
                u.id,
                u.name,
                u.email,
                u.plan,
                -- Today's time
                COALESCE(SUM(CASE 
                    WHEN DATE(ual.created_at) = :today 
                    THEN ual.duration_seconds 
                    ELSE 0 
                END) / 60.0, 0) as today_minutes,
                -- This week's time
                COALESCE(SUM(CASE 
                    WHEN DATE(ual.created_at) >= :week_ago 
                    THEN ual.duration_seconds 
                    ELSE 0 
                END) / 60.0, 0) as week_minutes,
                -- Average session duration
                COALESCE(AVG(ual.duration_seconds) / 60.0, 0) as avg_session_minutes,
                -- Last activity
                MAX(ual.created_at) as last_activity,
                -- Is online (active in last 5 minutes)
                CASE 
                    WHEN MAX(ual.created_at) >= NOW() - INTERVAL '5 minutes' 
                    THEN true 
                    ELSE false 
                END as is_online
            FROM users u
            LEFT JOIN user_activity_logs ual ON u.id = ual.user_id 
                AND ual.created_at >= :cutoff_date
            WHERE u.is_admin = false
            GROUP BY u.id, u.name, u.email, u.plan
            ORDER BY week_minutes DESC
            LIMIT :limit
        """)
        
        with engine.connect() as conn:
            result = conn.execute(query, {
                "cutoff_date": cutoff_date,
                "today": today,
                "week_ago": week_ago,
                "limit": limit
            })
            rows = result.fetchall()
        
        return {
            "users": [
                {
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "plan": str(row[3]).replace('PlanType.', '').lower() if 'PlanType' in str(row[3]) else str(row[3]).lower(),
                    "today_minutes": round(row[4], 2),
                    "week_minutes": round(row[5], 2),
                    "avg_session_minutes": round(row[6], 2),
                    "last_activity": row[7].isoformat() if row[7] else None,
                    "is_online": row[8]
                }
                for row in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users table: {str(e)}")

@router.get("/admin/user/{user_id}/timeline")
async def get_user_activity_timeline(
    user_id: int,
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed activity timeline for a specific user"""
    check_admin(current_user)
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = text("""
            SELECT 
                created_at,
                page_url,
                feature_name,
                action_type,
                duration_seconds,
                session_id
            FROM user_activity_logs
            WHERE user_id = :user_id
            AND created_at >= :cutoff_date
            ORDER BY created_at DESC
            LIMIT 100
        """)
        
        with engine.connect() as conn:
            result = conn.execute(query, {
                "user_id": user_id,
                "cutoff_date": cutoff_date
            })
            rows = result.fetchall()
        
        return {
            "activities": [
                {
                    "timestamp": row[0].isoformat(),
                    "page_url": row[1],
                    "feature_name": row[2],
                    "action_type": row[3],
                    "duration_seconds": row[4],
                    "session_id": row[5]
                }
                for row in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user timeline: {str(e)}")
