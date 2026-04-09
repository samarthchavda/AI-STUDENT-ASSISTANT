from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from app.core.auth import get_current_user, get_current_admin_user
from app.core.database import get_db_connection
import psycopg2.extras

router = APIRouter(prefix="/tracking", tags=["Learning Behavior Tracking"])

# Request Models
class LearningBehaviorLog(BaseModel):
    topic: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    company: Optional[str] = None
    action_type: str  # start_practice, complete_question, skip_question, view_solution
    time_of_day: Optional[str] = None

# Response Models
class LearningBehaviorSummary(BaseModel):
    most_practiced_topic: str
    most_practiced_category: str
    preferred_difficulty: str
    favorite_company: str
    peak_study_time: str
    total_actions: int
    completed_count: int
    skipped_count: int
    solutions_viewed: int

class UserBehaviorDetail(BaseModel):
    id: int
    name: str
    email: str
    plan: str
    most_practiced_topic: Optional[str]
    preferred_difficulty: Optional[str]
    favorite_company: Optional[str]
    peak_study_time: Optional[str]
    total_actions: int
    completed_count: int
    skipped_count: int
    completion_rate: float

# Helper function to determine time of day
def get_time_of_day() -> str:
    hour = datetime.now().hour
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 21:
        return "evening"
    else:
        return "night"

# User Endpoints
@router.post("/learning-behavior")
async def log_learning_behavior(
    log: LearningBehaviorLog,
    current_user: dict = Depends(get_current_user)
):
    """Log user learning behavior"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Auto-detect time of day if not provided
        time_of_day = log.time_of_day or get_time_of_day()
        
        cur.execute("""
            INSERT INTO learning_behavior_logs 
            (user_id, topic, category, difficulty, company, action_type, time_of_day)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            current_user['id'],
            log.topic,
            log.category,
            log.difficulty,
            log.company,
            log.action_type,
            time_of_day
        ))
        
        log_id = cur.fetchone()[0]
        conn.commit()
        
        return {"success": True, "log_id": log_id}
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

# Admin Endpoints
@router.get("/admin/learning-behavior/summary")
async def get_learning_behavior_summary(
    days: int = 30,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get overall learning behavior summary"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Refresh materialized view first
        cur.execute("SELECT refresh_learning_behavior_summary()")
        
        # Get summary stats
        cur.execute("""
            SELECT 
                MODE() WITHIN GROUP (ORDER BY most_practiced_topic) as most_practiced_topic,
                MODE() WITHIN GROUP (ORDER BY most_practiced_category) as most_practiced_category,
                MODE() WITHIN GROUP (ORDER BY preferred_difficulty) as preferred_difficulty,
                MODE() WITHIN GROUP (ORDER BY favorite_company) as favorite_company,
                MODE() WITHIN GROUP (ORDER BY peak_study_time) as peak_study_time,
                SUM(total_actions) as total_actions,
                SUM(completed_count) as completed_count,
                SUM(skipped_count) as skipped_count,
                SUM(solutions_viewed) as solutions_viewed
            FROM learning_behavior_summary
            WHERE last_activity >= NOW() - INTERVAL '%s days'
        """, (days,))
        
        result = cur.fetchone()
        
        if not result or not result['total_actions']:
            return {
                "most_practiced_topic": "N/A",
                "most_practiced_category": "N/A",
                "preferred_difficulty": "N/A",
                "favorite_company": "N/A",
                "peak_study_time": "N/A",
                "total_actions": 0,
                "completed_count": 0,
                "skipped_count": 0,
                "solutions_viewed": 0
            }
        
        return dict(result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/admin/learning-behavior/topic-distribution")
async def get_topic_distribution(
    days: int = 30,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get topic distribution for charts"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        cur.execute("""
            SELECT 
                topic,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
            FROM learning_behavior_logs
            WHERE created_at >= NOW() - INTERVAL '%s days'
            AND topic IS NOT NULL
            GROUP BY topic
            ORDER BY count DESC
            LIMIT 10
        """, (days,))
        
        return {"data": cur.fetchall()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/admin/learning-behavior/difficulty-distribution")
async def get_difficulty_distribution(
    days: int = 30,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get difficulty preference distribution"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        cur.execute("""
            SELECT 
                difficulty,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
            FROM learning_behavior_logs
            WHERE created_at >= NOW() - INTERVAL '%s days'
            AND difficulty IS NOT NULL
            GROUP BY difficulty
            ORDER BY 
                CASE difficulty
                    WHEN 'easy' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'hard' THEN 3
                    ELSE 4
                END
        """, (days,))
        
        return {"data": cur.fetchall()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/admin/learning-behavior/company-preference")
async def get_company_preference(
    days: int = 30,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get company preference distribution"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        cur.execute("""
            SELECT 
                company,
                COUNT(*) as count
            FROM learning_behavior_logs
            WHERE created_at >= NOW() - INTERVAL '%s days'
            AND company IS NOT NULL
            GROUP BY company
            ORDER BY count DESC
            LIMIT 10
        """, (days,))
        
        return {"data": cur.fetchall()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/admin/learning-behavior/study-time-heatmap")
async def get_study_time_heatmap(
    days: int = 30,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get study time heatmap data"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        cur.execute("""
            SELECT 
                time_of_day,
                COUNT(*) as count
            FROM learning_behavior_logs
            WHERE created_at >= NOW() - INTERVAL '%s days'
            AND time_of_day IS NOT NULL
            GROUP BY time_of_day
            ORDER BY 
                CASE time_of_day
                    WHEN 'morning' THEN 1
                    WHEN 'afternoon' THEN 2
                    WHEN 'evening' THEN 3
                    WHEN 'night' THEN 4
                END
        """, (days,))
        
        return {"data": cur.fetchall()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/admin/learning-behavior/users-table")
async def get_users_behavior_table(
    days: int = 30,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get user behavior breakdown table"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Refresh materialized view
        cur.execute("SELECT refresh_learning_behavior_summary()")
        
        cur.execute("""
            SELECT 
                u.id,
                u.name,
                u.email,
                u.plan,
                lbs.most_practiced_topic,
                lbs.preferred_difficulty,
                lbs.favorite_company,
                lbs.peak_study_time,
                lbs.total_actions,
                lbs.completed_count,
                lbs.skipped_count,
                lbs.solutions_viewed,
                CASE 
                    WHEN (lbs.completed_count + lbs.skipped_count) > 0 
                    THEN ROUND(lbs.completed_count * 100.0 / (lbs.completed_count + lbs.skipped_count), 2)
                    ELSE 0 
                END as completion_rate
            FROM users u
            INNER JOIN learning_behavior_summary lbs ON u.id = lbs.user_id
            WHERE lbs.last_activity >= NOW() - INTERVAL '%s days'
            ORDER BY lbs.total_actions DESC
            LIMIT 100
        """, (days,))
        
        return {"users": cur.fetchall()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("/admin/learning-behavior/user/{user_id}")
async def get_user_learning_behavior(
    user_id: int,
    days: int = 30,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get specific user's learning behavior"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Get user summary
        cur.execute("""
            SELECT * FROM learning_behavior_summary
            WHERE user_id = %s
        """, (user_id,))
        
        summary = cur.fetchone()
        
        # Get recent activity
        cur.execute("""
            SELECT 
                topic,
                category,
                difficulty,
                company,
                action_type,
                time_of_day,
                created_at
            FROM learning_behavior_logs
            WHERE user_id = %s
            AND created_at >= NOW() - INTERVAL '%s days'
            ORDER BY created_at DESC
            LIMIT 50
        """, (user_id, days))
        
        activity = cur.fetchall()
        
        return {
            "summary": summary,
            "recent_activity": activity
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
