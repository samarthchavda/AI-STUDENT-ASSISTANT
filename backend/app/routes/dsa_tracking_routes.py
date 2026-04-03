from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy import text
from app.core.auth import get_current_user
from app.core.database import engine

router = APIRouter()

class SubmissionCreate(BaseModel):
    question_slug: str
    question_title: str
    difficulty: str
    topic: str
    language: str
    code: str
    action_type: str  # 'run' or 'submit'
    verdict: str
    passed_testcases: int
    total_testcases: int
    runtime: Optional[float] = None
    memory: Optional[int] = None
    ai_used: bool = False
    ai_actions: Optional[List[str]] = None

class Submission(BaseModel):
    id: int
    question_slug: str
    question_title: str
    language: str
    action_type: str
    verdict: str
    passed_testcases: int
    total_testcases: int
    runtime: Optional[float]
    memory: Optional[int]
    ai_used: bool
    created_at: datetime

class ProgressSummary(BaseModel):
    total_solved: int
    total_attempted: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    easy_attempted: int
    medium_attempted: int
    hard_attempted: int
    recent_activity: List[dict]

class QuestionStatus(BaseModel):
    question_slug: str
    status: str  # 'solved', 'attempted', 'unsolved'
    latest_verdict: Optional[str]
    latest_language: Optional[str]
    attempts: int
    solved_at: Optional[datetime]

@router.post("/submissions")
async def create_submission(
    submission: SubmissionCreate,
    current_user = Depends(get_current_user)
):
    """Save a code submission"""
    user_id = current_user.id
    
    try:
        with engine.connect() as conn:
            # Insert submission
            result = conn.execute(
                text("""
                    INSERT INTO dsa_submissions (
                        user_id, question_slug, question_title, language, code,
                        action_type, verdict, passed_testcases, total_testcases,
                        runtime, memory, ai_used, ai_actions
                    ) VALUES (
                        :user_id, :question_slug, :question_title, :language, :code,
                        :action_type, :verdict, :passed_testcases, :total_testcases,
                        :runtime, :memory, :ai_used, :ai_actions
                    )
                    RETURNING id
                """),
                {
                    "user_id": user_id,
                    "question_slug": submission.question_slug,
                    "question_title": submission.question_title,
                    "language": submission.language,
                    "code": submission.code,
                    "action_type": submission.action_type,
                    "verdict": submission.verdict,
                    "passed_testcases": submission.passed_testcases,
                    "total_testcases": submission.total_testcases,
                    "runtime": submission.runtime,
                    "memory": submission.memory,
                    "ai_used": submission.ai_used,
                    "ai_actions": submission.ai_actions or []
                }
            )
            submission_id = result.fetchone()[0]
            
            # Update user progress
            is_solved = submission.verdict == "Accepted" and submission.action_type == "submit"
            status = "solved" if is_solved else "attempted"
            
            # Calculate score based on difficulty
            score_map = {"Easy": 1, "Medium": 2, "Hard": 3}
            question_score = score_map.get(submission.difficulty, 0)
            
            # Check if progress record exists
            existing = conn.execute(
                text("""
                    SELECT id, status, best_runtime, attempts, score
                    FROM dsa_user_progress
                    WHERE user_id = :user_id AND question_slug = :question_slug
                """),
                {"user_id": user_id, "question_slug": submission.question_slug}
            ).fetchone()
            
            if existing:
                # Update existing progress
                current_status = existing[1]
                best_runtime = existing[2]
                attempts = existing[3]
                current_score = existing[4] or 0
                
                # Only update status if it's an improvement
                new_status = status if status == "solved" or current_status != "solved" else current_status
                new_best_runtime = min(best_runtime or float('inf'), submission.runtime or float('inf')) if submission.runtime else best_runtime
                
                # Update score only if newly solved
                new_score = question_score if (is_solved and current_status != "solved") else current_score
                
                conn.execute(
                    text("""
                        UPDATE dsa_user_progress
                        SET status = :status,
                            latest_verdict = :verdict,
                            latest_language = :language,
                            best_runtime = :best_runtime,
                            attempts = :attempts,
                            score = :score,
                            solved_at = CASE WHEN :is_solved AND solved_at IS NULL THEN CURRENT_TIMESTAMP ELSE solved_at END,
                            last_attempted_at = CURRENT_TIMESTAMP
                        WHERE user_id = :user_id AND question_slug = :question_slug
                    """),
                    {
                        "user_id": user_id,
                        "question_slug": submission.question_slug,
                        "status": new_status,
                        "verdict": submission.verdict,
                        "language": submission.language,
                        "best_runtime": new_best_runtime,
                        "attempts": attempts + 1,
                        "score": new_score,
                        "is_solved": is_solved
                    }
                )
            else:
                # Insert new progress record
                initial_score = question_score if is_solved else 0
                
                conn.execute(
                    text("""
                        INSERT INTO dsa_user_progress (
                            user_id, question_slug, question_title, difficulty, topic,
                            status, latest_verdict, latest_language, best_runtime, attempts,
                            score, solved_at, last_attempted_at
                        ) VALUES (
                            :user_id, :question_slug, :question_title, :difficulty, :topic,
                            :status, :verdict, :language, :runtime, 1,
                            :score, CASE WHEN :is_solved THEN CURRENT_TIMESTAMP ELSE NULL END,
                            CURRENT_TIMESTAMP
                        )
                    """),
                    {
                        "user_id": user_id,
                        "question_slug": submission.question_slug,
                        "question_title": submission.question_title,
                        "difficulty": submission.difficulty,
                        "topic": submission.topic,
                        "status": status,
                        "verdict": submission.verdict,
                        "language": submission.language,
                        "runtime": submission.runtime,
                        "score": initial_score,
                        "is_solved": is_solved
                    }
                )
            
            # Update streak if solved
            if is_solved:
                conn.execute(
                    text("SELECT update_dsa_streak(:user_id, CURRENT_DATE)"),
                    {"user_id": user_id}
                )
            
            conn.commit()
            
            return {
                "id": submission_id,
                "status": "success",
                "message": "Submission saved successfully"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save submission: {str(e)}")

@router.get("/submissions/{question_slug}", response_model=List[Submission])
async def get_submissions(
    question_slug: str,
    limit: int = 10,
    current_user = Depends(get_current_user)
):
    """Get submission history for a question"""
    user_id = current_user.id
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT id, question_slug, question_title, language, action_type,
                           verdict, passed_testcases, total_testcases, runtime, memory,
                           ai_used, created_at
                    FROM dsa_submissions
                    WHERE user_id = :user_id AND question_slug = :question_slug
                    ORDER BY created_at DESC
                    LIMIT :limit
                """),
                {"user_id": user_id, "question_slug": question_slug, "limit": limit}
            )
            
            submissions = []
            for row in result:
                submissions.append(Submission(
                    id=row[0],
                    question_slug=row[1],
                    question_title=row[2],
                    language=row[3],
                    action_type=row[4],
                    verdict=row[5],
                    passed_testcases=row[6],
                    total_testcases=row[7],
                    runtime=row[8],
                    memory=row[9],
                    ai_used=row[10],
                    created_at=row[11]
                ))
            
            return submissions
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch submissions: {str(e)}")

@router.get("/progress", response_model=ProgressSummary)
async def get_progress(current_user = Depends(get_current_user)):
    """Get user's overall DSA progress"""
    user_id = current_user.id
    
    try:
        with engine.connect() as conn:
            # Get counts by difficulty and status
            result = conn.execute(
                text("""
                    SELECT 
                        difficulty,
                        status,
                        COUNT(*) as count
                    FROM dsa_user_progress
                    WHERE user_id = :user_id
                    GROUP BY difficulty, status
                """),
                {"user_id": user_id}
            )
            
            stats = {}
            for row in result:
                key = f"{row[0].lower()}_{row[1]}"
                stats[key] = row[2]
            
            # Get recent activity
            recent = conn.execute(
                text("""
                    SELECT question_slug, question_title, difficulty, status, 
                           latest_verdict, last_attempted_at
                    FROM dsa_user_progress
                    WHERE user_id = :user_id
                    ORDER BY last_attempted_at DESC
                    LIMIT 5
                """),
                {"user_id": user_id}
            )
            
            recent_activity = []
            for row in recent:
                recent_activity.append({
                    "question_slug": row[0],
                    "question_title": row[1],
                    "difficulty": row[2],
                    "status": row[3],
                    "latest_verdict": row[4],
                    "last_attempted_at": row[5].isoformat() if row[5] else None
                })
            
            return ProgressSummary(
                total_solved=stats.get('easy_solved', 0) + stats.get('medium_solved', 0) + stats.get('hard_solved', 0),
                total_attempted=stats.get('easy_attempted', 0) + stats.get('medium_attempted', 0) + stats.get('hard_attempted', 0) + stats.get('easy_solved', 0) + stats.get('medium_solved', 0) + stats.get('hard_solved', 0),
                easy_solved=stats.get('easy_solved', 0),
                medium_solved=stats.get('medium_solved', 0),
                hard_solved=stats.get('hard_solved', 0),
                easy_attempted=stats.get('easy_attempted', 0),
                medium_attempted=stats.get('medium_attempted', 0),
                hard_attempted=stats.get('hard_attempted', 0),
                recent_activity=recent_activity
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress: {str(e)}")

@router.get("/status-map")
async def get_status_map(current_user = Depends(get_current_user)):
    """Get status map for all questions (for question list page)"""
    user_id = current_user.id
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT question_slug, status, latest_verdict, attempts
                    FROM dsa_user_progress
                    WHERE user_id = :user_id
                """),
                {"user_id": user_id}
            )
            
            status_map = {}
            for row in result:
                status_map[row[0]] = {
                    "status": row[1],
                    "latest_verdict": row[2],
                    "attempts": row[3]
                }
            
            return status_map
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch status map: {str(e)}")

@router.post("/ai-usage")
async def track_ai_usage(
    question_slug: str,
    action_type: str,
    language: str,
    response_time: Optional[float] = None,
    current_user = Depends(get_current_user)
):
    """Track AI usage for analytics"""
    user_id = current_user.id
    
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO dsa_ai_usage (
                        user_id, question_slug, action_type, language, response_time
                    ) VALUES (
                        :user_id, :question_slug, :action_type, :language, :response_time
                    )
                """),
                {
                    "user_id": user_id,
                    "question_slug": question_slug,
                    "action_type": action_type,
                    "language": language,
                    "response_time": response_time
                }
            )
            conn.commit()
            
            return {"status": "success"}
            
    except Exception as e:
        # Don't fail the request if AI tracking fails
        print(f"AI usage tracking failed: {e}")
        return {"status": "failed", "error": str(e)}
