from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc, case
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from app.core.auth import get_current_user, require_admin
from app.core.database import get_db, engine

router = APIRouter(prefix="/tracking", tags=["Learning Behavior Tracking"])

# Request Models
class LearningBehaviorLog(BaseModel):
    topic: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    company: Optional[str] = None
    action_type: str  # start_practice, complete_question, skip_question, view_solution
    time_of_day: Optional[str] = None

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
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log user learning behavior"""
    try:
        # Auto-detect time of day if not provided
        time_of_day = log.time_of_day or get_time_of_day()
        
        # Use raw SQL for insert
        query = text("""
            INSERT INTO learning_behavior_logs 
            (user_id, topic, category, difficulty, company, action_type, time_of_day)
            VALUES (:user_id, :topic, :category, :difficulty, :company, :action_type, :time_of_day)
            RETURNING id
        """)
        
        result = db.execute(query, {
            'user_id': current_user.id,
            'topic': log.topic,
            'category': log.category,
            'difficulty': log.difficulty,
            'company': log.company,
            'action_type': log.action_type,
            'time_of_day': time_of_day
        })
        
        log_id = result.fetchone()[0]
        db.commit()
        
        return {"success": True, "log_id": log_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Admin Endpoints
@router.get("/admin/learning-behavior/summary")
async def get_learning_behavior_summary(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get overall learning behavior summary"""
    try:
        # Refresh materialized view first
        db.execute(text("SELECT refresh_learning_behavior_summary()"))
        
        # Get summary stats
        query = text("""
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
            WHERE last_activity >= NOW() - INTERVAL ':days days'
        """)
        
        result = db.execute(query, {'days': days}).fetchone()
        
        if not result or not result[5]:  # total_actions is at index 5
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
        
        return {
            "most_practiced_topic": result[0] or "N/A",
            "most_practiced_category": result[1] or "N/A",
            "preferred_difficulty": result[2] or "N/A",
            "favorite_company": result[3] or "N/A",
            "peak_study_time": result[4] or "N/A",
            "total_actions": int(result[5]) if result[5] else 0,
            "completed_count": int(result[6]) if result[6] else 0,
            "skipped_count": int(result[7]) if result[7] else 0,
            "solutions_viewed": int(result[8]) if result[8] else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/learning-behavior/topic-distribution")
async def get_topic_distribution(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get topic distribution for charts"""
    try:
        query = text("""
            SELECT 
                topic,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
            FROM learning_behavior_logs
            WHERE created_at >= NOW() - INTERVAL ':days days'
            AND topic IS NOT NULL
            GROUP BY topic
            ORDER BY count DESC
            LIMIT 10
        """)
        
        results = db.execute(query, {'days': days}).fetchall()
        
        data = [
            {
                "topic": row[0],
                "count": int(row[1]),
                "percentage": float(row[2])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/learning-behavior/difficulty-distribution")
async def get_difficulty_distribution(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get difficulty preference distribution"""
    try:
        query = text("""
            SELECT 
                difficulty,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
            FROM learning_behavior_logs
            WHERE created_at >= NOW() - INTERVAL ':days days'
            AND difficulty IS NOT NULL
            GROUP BY difficulty
            ORDER BY 
                CASE difficulty
                    WHEN 'easy' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'hard' THEN 3
                    ELSE 4
                END
        """)
        
        results = db.execute(query, {'days': days}).fetchall()
        
        data = [
            {
                "difficulty": row[0],
                "count": int(row[1]),
                "percentage": float(row[2])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/learning-behavior/company-preference")
async def get_company_preference(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get company preference distribution"""
    try:
        query = text("""
            SELECT 
                company,
                COUNT(*) as count
            FROM learning_behavior_logs
            WHERE created_at >= NOW() - INTERVAL ':days days'
            AND company IS NOT NULL
            GROUP BY company
            ORDER BY count DESC
            LIMIT 10
        """)
        
        results = db.execute(query, {'days': days}).fetchall()
        
        data = [
            {
                "company": row[0],
                "count": int(row[1])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/learning-behavior/study-time-heatmap")
async def get_study_time_heatmap(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get study time heatmap data"""
    try:
        query = text("""
            SELECT 
                time_of_day,
                COUNT(*) as count
            FROM learning_behavior_logs
            WHERE created_at >= NOW() - INTERVAL ':days days'
            AND time_of_day IS NOT NULL
            GROUP BY time_of_day
            ORDER BY 
                CASE time_of_day
                    WHEN 'morning' THEN 1
                    WHEN 'afternoon' THEN 2
                    WHEN 'evening' THEN 3
                    WHEN 'night' THEN 4
                END
        """)
        
        results = db.execute(query, {'days': days}).fetchall()
        
        data = [
            {
                "time_of_day": row[0],
                "count": int(row[1])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/learning-behavior/users-table")
async def get_users_behavior_table(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user behavior breakdown table"""
    try:
        # Refresh materialized view
        db.execute(text("SELECT refresh_learning_behavior_summary()"))
        
        query = text("""
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
            WHERE lbs.last_activity >= NOW() - INTERVAL ':days days'
            ORDER BY lbs.total_actions DESC
            LIMIT 100
        """)
        
        results = db.execute(query, {'days': days}).fetchall()
        
        users = [
            {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "plan": row[3],
                "most_practiced_topic": row[4],
                "preferred_difficulty": row[5],
                "favorite_company": row[6],
                "peak_study_time": row[7],
                "total_actions": int(row[8]),
                "completed_count": int(row[9]),
                "skipped_count": int(row[10]),
                "solutions_viewed": int(row[11]),
                "completion_rate": float(row[12])
            }
            for row in results
        ]
        
        return {"users": users}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/learning-behavior/user/{user_id}")
async def get_user_learning_behavior(
    user_id: int,
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get specific user's learning behavior"""
    try:
        # Get user summary
        summary_query = text("""
            SELECT * FROM learning_behavior_summary
            WHERE user_id = :user_id
        """)
        
        summary = db.execute(summary_query, {'user_id': user_id}).fetchone()
        
        # Get recent activity
        activity_query = text("""
            SELECT 
                topic,
                category,
                difficulty,
                company,
                action_type,
                time_of_day,
                created_at
            FROM learning_behavior_logs
            WHERE user_id = :user_id
            AND created_at >= NOW() - INTERVAL ':days days'
            ORDER BY created_at DESC
            LIMIT 50
        """)
        
        activity_results = db.execute(activity_query, {'user_id': user_id, 'days': days}).fetchall()
        
        activity = [
            {
                "topic": row[0],
                "category": row[1],
                "difficulty": row[2],
                "company": row[3],
                "action_type": row[4],
                "time_of_day": row[5],
                "created_at": row[6].isoformat() if row[6] else None
            }
            for row in activity_results
        ]
        
        return {
            "summary": dict(summary._mapping) if summary else None,
            "recent_activity": activity
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
