from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from sqlalchemy import text
from app.core.auth import get_current_user, require_admin
from app.core.database import engine

router = APIRouter()

class DailyChallengeCreate(BaseModel):
    challenge_date: date
    question_slug: str
    question_title: str
    difficulty: str
    topic: str
    bonus_points: int = 10

class DailyChallenge(BaseModel):
    id: int
    challenge_date: date
    question_slug: str
    question_title: str
    difficulty: str
    topic: str
    bonus_points: int
    is_completed: bool = False
    completion_time: Optional[datetime] = None

@router.get("/today", response_model=Optional[DailyChallenge])
async def get_today_challenge(current_user: dict = Depends(get_current_user)):
    """Get today's daily challenge"""
    user_id = current_user["id"]
    today = date.today()
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT 
                        dc.id, dc.challenge_date, dc.question_slug, dc.question_title,
                        dc.difficulty, dc.topic, dc.bonus_points,
                        CASE WHEN dcc.id IS NOT NULL THEN TRUE ELSE FALSE END as is_completed,
                        dcc.completed_at
                    FROM daily_challenges dc
                    LEFT JOIN daily_challenge_completions dcc 
                        ON dc.id = dcc.challenge_id AND dcc.user_id = :user_id
                    WHERE dc.challenge_date = :today AND dc.is_active = TRUE
                    LIMIT 1
                """),
                {"user_id": user_id, "today": today}
            ).fetchone()
            
            if not result:
                return None
            
            return DailyChallenge(
                id=result[0],
                challenge_date=result[1],
                question_slug=result[2],
                question_title=result[3],
                difficulty=result[4],
                topic=result[5],
                bonus_points=result[6],
                is_completed=result[7],
                completion_time=result[8]
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch daily challenge: {str(e)}")

@router.post("/complete/{challenge_id}")
async def complete_daily_challenge(
    challenge_id: int,
    time_taken: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    """Mark daily challenge as completed"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            # Check if challenge exists and is for today
            challenge = conn.execute(
                text("""
                    SELECT id, bonus_points, challenge_date
                    FROM daily_challenges
                    WHERE id = :challenge_id AND is_active = TRUE
                """),
                {"challenge_id": challenge_id}
            ).fetchone()
            
            if not challenge:
                raise HTTPException(status_code=404, detail="Challenge not found")
            
            # Check if already completed
            existing = conn.execute(
                text("""
                    SELECT id FROM daily_challenge_completions
                    WHERE user_id = :user_id AND challenge_id = :challenge_id
                """),
                {"user_id": user_id, "challenge_id": challenge_id}
            ).fetchone()
            
            if existing:
                return {"message": "Challenge already completed", "bonus_earned": 0}
            
            # Mark as completed
            bonus_points = challenge[1]
            conn.execute(
                text("""
                    INSERT INTO daily_challenge_completions 
                    (user_id, challenge_id, time_taken, bonus_earned)
                    VALUES (:user_id, :challenge_id, :time_taken, :bonus_points)
                """),
                {
                    "user_id": user_id,
                    "challenge_id": challenge_id,
                    "time_taken": time_taken,
                    "bonus_points": bonus_points
                }
            )
            
            # Add bonus to user score
            conn.execute(
                text("""
                    UPDATE dsa_user_progress
                    SET score = score + :bonus_points
                    WHERE user_id = :user_id
                    LIMIT 1
                """),
                {"user_id": user_id, "bonus_points": bonus_points}
            )
            
            # Create notification
            conn.execute(
                text("""
                    INSERT INTO user_notifications 
                    (user_id, notification_type, title, message, action_url)
                    VALUES (
                        :user_id, 
                        'daily_challenge', 
                        'Daily Challenge Completed!',
                        :message,
                        '/dsa/dashboard'
                    )
                """),
                {
                    "user_id": user_id,
                    "message": f"You earned {bonus_points} bonus points for completing today's challenge!"
                }
            )
            
            conn.commit()
            
            return {
                "message": "Challenge completed successfully",
                "bonus_earned": bonus_points
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete challenge: {str(e)}")

@router.get("/history")
async def get_challenge_history(
    limit: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get user's daily challenge completion history"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT 
                        dc.challenge_date,
                        dc.question_title,
                        dc.difficulty,
                        dcc.completed_at,
                        dcc.bonus_earned
                    FROM daily_challenge_completions dcc
                    JOIN daily_challenges dc ON dcc.challenge_id = dc.id
                    WHERE dcc.user_id = :user_id
                    ORDER BY dc.challenge_date DESC
                    LIMIT :limit
                """),
                {"user_id": user_id, "limit": limit}
            )
            
            history = []
            for row in result:
                history.append({
                    "date": row[0].isoformat(),
                    "question": row[1],
                    "difficulty": row[2],
                    "completed_at": row[3].isoformat() if row[3] else None,
                    "bonus_earned": row[4]
                })
            
            return {"history": history, "total": len(history)}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

# Admin endpoints
@router.post("/admin/create", response_model=dict)
async def create_daily_challenge(
    challenge: DailyChallengeCreate,
    current_user: dict = Depends(require_admin)
):
    """Admin: Create a daily challenge"""
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    INSERT INTO daily_challenges 
                    (challenge_date, question_slug, question_title, difficulty, topic, bonus_points, created_by)
                    VALUES (:date, :slug, :title, :difficulty, :topic, :bonus, :created_by)
                    RETURNING id
                """),
                {
                    "date": challenge.challenge_date,
                    "slug": challenge.question_slug,
                    "title": challenge.question_title,
                    "difficulty": challenge.difficulty,
                    "topic": challenge.topic,
                    "bonus": challenge.bonus_points,
                    "created_by": current_user["id"]
                }
            )
            challenge_id = result.fetchone()[0]
            conn.commit()
            
            return {"id": challenge_id, "message": "Daily challenge created successfully"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create challenge: {str(e)}")

@router.get("/admin/list")
async def list_all_challenges(
    limit: int = 30,
    current_user: dict = Depends(require_admin)
):
    """Admin: List all daily challenges"""
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT 
                        dc.id, dc.challenge_date, dc.question_title, dc.difficulty,
                        COUNT(dcc.id) as completions
                    FROM daily_challenges dc
                    LEFT JOIN daily_challenge_completions dcc ON dc.id = dcc.challenge_id
                    GROUP BY dc.id, dc.challenge_date, dc.question_title, dc.difficulty
                    ORDER BY dc.challenge_date DESC
                    LIMIT :limit
                """),
                {"limit": limit}
            )
            
            challenges = []
            for row in result:
                challenges.append({
                    "id": row[0],
                    "date": row[1].isoformat(),
                    "question": row[2],
                    "difficulty": row[3],
                    "completions": row[4]
                })
            
            return {"challenges": challenges}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch challenges: {str(e)}")
