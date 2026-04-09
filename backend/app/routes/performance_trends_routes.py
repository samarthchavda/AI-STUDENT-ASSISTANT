from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from app.core.auth import get_current_user, require_admin
from app.core.database import get_db

router = APIRouter(prefix="/tracking", tags=["Performance Trends"])

# Request Models
class PerformanceTrendLog(BaseModel):
    topic: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    score_percent: float
    accuracy_percent: float
    time_taken_seconds: int
    questions_attempted: int
    questions_correct: int

# User Endpoints
@router.post("/performance")
async def log_performance(
    log: PerformanceTrendLog,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log user performance data"""
    try:
        query = text("""
            INSERT INTO performance_trends 
            (user_id, topic, category, difficulty, score_percent, accuracy_percent, 
             time_taken_seconds, questions_attempted, questions_correct)
            VALUES (:user_id, :topic, :category, :difficulty, :score_percent, :accuracy_percent,
                    :time_taken_seconds, :questions_attempted, :questions_correct)
            RETURNING id
        """)
        
        result = db.execute(query, {
            'user_id': current_user.id,
            'topic': log.topic,
            'category': log.category,
            'difficulty': log.difficulty,
            'score_percent': log.score_percent,
            'accuracy_percent': log.accuracy_percent,
            'time_taken_seconds': log.time_taken_seconds,
            'questions_attempted': log.questions_attempted,
            'questions_correct': log.questions_correct
        })
        
        log_id = result.fetchone()[0]
        db.commit()
        
        return {"success": True, "log_id": log_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Admin Endpoints
@router.get("/admin/performance/summary")
async def get_performance_summary(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get overall performance summary"""
    try:
        # Refresh materialized view
        db.execute(text("SELECT refresh_performance_trends_summary()"))
        
        query = text("""
            SELECT 
                ROUND(AVG(avg_score), 2) as overall_avg_score,
                ROUND(AVG(avg_accuracy), 2) as overall_avg_accuracy,
                COUNT(DISTINCT user_id) as total_users,
                SUM(total_attempts) as total_attempts,
                MAX(best_score) as highest_score,
                MIN(worst_score) as lowest_score
            FROM performance_trends_summary
            WHERE last_attempt >= NOW() - INTERVAL ':days days'
        """)
        
        result = db.execute(query, {'days': days}).fetchone()
        
        if not result:
            return {
                "overall_avg_score": 0,
                "overall_avg_accuracy": 0,
                "total_users": 0,
                "total_attempts": 0,
                "highest_score": 0,
                "lowest_score": 0
            }
        
        return {
            "overall_avg_score": float(result[0]) if result[0] else 0,
            "overall_avg_accuracy": float(result[1]) if result[1] else 0,
            "total_users": int(result[2]) if result[2] else 0,
            "total_attempts": int(result[3]) if result[3] else 0,
            "highest_score": float(result[4]) if result[4] else 0,
            "lowest_score": float(result[5]) if result[5] else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/performance/score-trends")
async def get_score_trends(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get score improvement trends over time"""
    try:
        query = text("""
            SELECT 
                DATE(created_at) as date,
                ROUND(AVG(score_percent), 2) as avg_score,
                ROUND(AVG(accuracy_percent), 2) as avg_accuracy,
                COUNT(*) as attempts,
                COUNT(DISTINCT user_id) as unique_users
            FROM performance_trends
            WHERE created_at >= NOW() - INTERVAL ':days days'
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        
        results = db.execute(query, {'days': days}).fetchall()
        
        data = [
            {
                "date": row[0].isoformat(),
                "avg_score": float(row[1]),
                "avg_accuracy": float(row[2]),
                "attempts": int(row[3]),
                "unique_users": int(row[4])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/performance/weak-areas")
async def get_weak_areas(
    limit: int = 10,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get topics where users struggle most"""
    try:
        query = text("""
            SELECT 
                topic,
                category,
                attempts,
                avg_score,
                avg_accuracy
            FROM user_weak_areas
            ORDER BY avg_score ASC
            LIMIT :limit
        """)
        
        results = db.execute(query, {'limit': limit}).fetchall()
        
        data = [
            {
                "topic": row[0],
                "category": row[1],
                "attempts": int(row[2]),
                "avg_score": float(row[3]),
                "avg_accuracy": float(row[4])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/performance/strong-areas")
async def get_strong_areas(
    limit: int = 10,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get topics where users excel"""
    try:
        query = text("""
            SELECT 
                topic,
                category,
                attempts,
                avg_score,
                avg_accuracy
            FROM user_strong_areas
            ORDER BY avg_score DESC
            LIMIT :limit
        """)
        
        results = db.execute(query, {'limit': limit}).fetchall()
        
        data = [
            {
                "topic": row[0],
                "category": row[1],
                "attempts": int(row[2]),
                "avg_score": float(row[3]),
                "avg_accuracy": float(row[4])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/performance/top-improvers")
async def get_top_improvers(
    limit: int = 10,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get users with highest score improvements"""
    try:
        query = text("""
            SELECT 
                user_id,
                user_name,
                user_email,
                plan,
                initial_score,
                current_score,
                improvement,
                improvement_percent
            FROM top_improvers
            ORDER BY improvement DESC
            LIMIT :limit
        """)
        
        results = db.execute(query, {'limit': limit}).fetchall()
        
        data = [
            {
                "user_id": int(row[0]),
                "user_name": row[1],
                "user_email": row[2],
                "plan": row[3],
                "initial_score": float(row[4]),
                "current_score": float(row[5]),
                "improvement": float(row[6]),
                "improvement_percent": float(row[7])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/performance/difficulty-breakdown")
async def get_difficulty_breakdown(
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get performance breakdown by difficulty level"""
    try:
        query = text("""
            SELECT 
                difficulty,
                COUNT(*) as attempts,
                ROUND(AVG(score_percent), 2) as avg_score,
                ROUND(AVG(accuracy_percent), 2) as avg_accuracy,
                COUNT(DISTINCT user_id) as unique_users
            FROM performance_trends
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
                "attempts": int(row[1]),
                "avg_score": float(row[2]),
                "avg_accuracy": float(row[3]),
                "unique_users": int(row[4])
            }
            for row in results
        ]
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/performance/users-table")
async def get_users_performance_table(
    days: int = 30,
    limit: int = 50,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user performance breakdown table"""
    try:
        # Refresh materialized view
        db.execute(text("SELECT refresh_performance_trends_summary()"))
        
        query = text("""
            SELECT 
                u.id,
                u.name,
                u.email,
                u.plan,
                pts.total_attempts,
                pts.avg_score,
                pts.avg_accuracy,
                pts.best_score,
                pts.worst_score,
                pts.most_practiced_topic,
                pts.last_attempt
            FROM users u
            INNER JOIN performance_trends_summary pts ON u.id = pts.user_id
            WHERE pts.last_attempt >= NOW() - INTERVAL ':days days'
            ORDER BY pts.avg_score DESC
            LIMIT :limit
        """)
        
        results = db.execute(query, {'days': days, 'limit': limit}).fetchall()
        
        users = [
            {
                "id": int(row[0]),
                "name": row[1],
                "email": row[2],
                "plan": row[3],
                "total_attempts": int(row[4]),
                "avg_score": float(row[5]),
                "avg_accuracy": float(row[6]),
                "best_score": float(row[7]),
                "worst_score": float(row[8]),
                "most_practiced_topic": row[9],
                "last_attempt": row[10].isoformat() if row[10] else None
            }
            for row in results
        ]
        
        return {"users": users}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/performance/user/{user_id}")
async def get_user_performance(
    user_id: int,
    days: int = 30,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get specific user's performance history"""
    try:
        # Get user summary
        summary_query = text("""
            SELECT * FROM performance_trends_summary
            WHERE user_id = :user_id
        """)
        
        summary = db.execute(summary_query, {'user_id': user_id}).fetchone()
        
        # Get recent performance
        history_query = text("""
            SELECT 
                topic,
                category,
                difficulty,
                score_percent,
                accuracy_percent,
                time_taken_seconds,
                questions_attempted,
                questions_correct,
                created_at
            FROM performance_trends
            WHERE user_id = :user_id
            AND created_at >= NOW() - INTERVAL ':days days'
            ORDER BY created_at DESC
            LIMIT 50
        """)
        
        history_results = db.execute(history_query, {'user_id': user_id, 'days': days}).fetchall()
        
        history = [
            {
                "topic": row[0],
                "category": row[1],
                "difficulty": row[2],
                "score_percent": float(row[3]),
                "accuracy_percent": float(row[4]),
                "time_taken_seconds": int(row[5]),
                "questions_attempted": int(row[6]),
                "questions_correct": int(row[7]),
                "created_at": row[8].isoformat() if row[8] else None
            }
            for row in history_results
        ]
        
        return {
            "summary": dict(summary._mapping) if summary else None,
            "history": history
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
