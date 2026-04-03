from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from sqlalchemy import text
from app.core.auth import get_current_user, require_admin
from app.core.database import engine

router = APIRouter()

# ============= USER DASHBOARD MODELS =============

class DashboardStats(BaseModel):
    total_solved: int
    total_attempted: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    total_score: int
    current_streak: int
    longest_streak: int
    total_submissions: int
    ai_assisted_submissions: int
    acceptance_rate: float
    recent_solved: List[Dict[str, Any]]
    topic_progress: List[Dict[str, Any]]

class StreakData(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: Optional[date]
    is_active_today: bool

# ============= LEADERBOARD MODELS =============

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    email: str
    score: int
    solved_count: int
    current_streak: int
    total_submissions: int
    ai_usage_count: int

class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]
    user_rank: Optional[int]
    total_users: int

# ============= ADMIN ANALYTICS MODELS =============

class DSAAnalytics(BaseModel):
    total_submissions: int
    accepted_submissions: int
    failed_submissions: int
    acceptance_rate: float
    total_users: int
    active_users_today: int
    active_users_week: int
    most_attempted_questions: List[Dict[str, Any]]
    most_solved_questions: List[Dict[str, Any]]
    topic_usage: List[Dict[str, Any]]
    difficulty_success_rate: List[Dict[str, Any]]
    top_performers: List[Dict[str, Any]]

class AIAnalytics(BaseModel):
    total_ai_requests: int
    hint_requests: int
    explain_requests: int
    solution_requests: int
    explain_code_requests: int
    fix_code_requests: int
    ai_usage_by_question: List[Dict[str, Any]]
    ai_usage_by_user: List[Dict[str, Any]]
    most_common_action: str

# ============= USER DASHBOARD ENDPOINTS =============

@router.get("/dashboard", response_model=DashboardStats)
async def get_user_dashboard(current_user = Depends(get_current_user)):
    """Get comprehensive DSA dashboard stats for user"""
    user_id = current_user.id
    
    try:
        with engine.connect() as conn:
            # Get progress summary
            progress = conn.execute(
                text("""
                    SELECT 
                        COUNT(*) FILTER (WHERE status = 'solved') as total_solved,
                        COUNT(*) FILTER (WHERE status IN ('solved', 'attempted')) as total_attempted,
                        COUNT(*) FILTER (WHERE status = 'solved' AND difficulty = 'Easy') as easy_solved,
                        COUNT(*) FILTER (WHERE status = 'solved' AND difficulty = 'Medium') as medium_solved,
                        COUNT(*) FILTER (WHERE status = 'solved' AND difficulty = 'Hard') as hard_solved,
                        COALESCE(SUM(score), 0) as total_score,
                        COALESCE(MAX(current_streak), 0) as current_streak,
                        COALESCE(MAX(longest_streak), 0) as longest_streak
                    FROM dsa_user_progress
                    WHERE user_id = :user_id
                """),
                {"user_id": user_id}
            ).fetchone()
            
            # Get submission stats
            submissions = conn.execute(
                text("""
                    SELECT 
                        COUNT(*) as total_submissions,
                        COUNT(*) FILTER (WHERE ai_used = true) as ai_assisted,
                        COUNT(*) FILTER (WHERE verdict = 'Accepted' AND action_type = 'submit') as accepted
                    FROM dsa_submissions
                    WHERE user_id = :user_id
                """),
                {"user_id": user_id}
            ).fetchone()
            
            # Get recently solved
            recent = conn.execute(
                text("""
                    SELECT question_slug, question_title, difficulty, solved_at
                    FROM dsa_user_progress
                    WHERE user_id = :user_id AND status = 'solved'
                    ORDER BY solved_at DESC
                    LIMIT 5
                """),
                {"user_id": user_id}
            )
            
            recent_solved = []
            for row in recent:
                recent_solved.append({
                    "slug": row[0],
                    "title": row[1],
                    "difficulty": row[2],
                    "solved_at": row[3].isoformat() if row[3] else None
                })
            
            # Get topic progress
            topics = conn.execute(
                text("""
                    SELECT 
                        topic,
                        COUNT(*) FILTER (WHERE status = 'solved') as solved,
                        COUNT(*) as total
                    FROM dsa_user_progress
                    WHERE user_id = :user_id
                    GROUP BY topic
                    ORDER BY solved DESC
                """),
                {"user_id": user_id}
            )
            
            topic_progress = []
            for row in topics:
                topic_progress.append({
                    "topic": row[0],
                    "solved": row[1],
                    "total": row[2]
                })
            
            # Calculate acceptance rate
            total_subs = submissions[0] or 0
            accepted = submissions[2] or 0
            acceptance_rate = (accepted / total_subs * 100) if total_subs > 0 else 0
            
            return DashboardStats(
                total_solved=progress[0] or 0,
                total_attempted=progress[1] or 0,
                easy_solved=progress[2] or 0,
                medium_solved=progress[3] or 0,
                hard_solved=progress[4] or 0,
                total_score=progress[5] or 0,
                current_streak=progress[6] or 0,
                longest_streak=progress[7] or 0,
                total_submissions=total_subs,
                ai_assisted_submissions=submissions[1] or 0,
                acceptance_rate=round(acceptance_rate, 1),
                recent_solved=recent_solved,
                topic_progress=topic_progress
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard: {str(e)}")

@router.get("/streak", response_model=StreakData)
async def get_user_streak(current_user = Depends(get_current_user)):
    """Get user's streak data"""
    user_id = current_user.id
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT 
                        COALESCE(MAX(current_streak), 0) as current_streak,
                        COALESCE(MAX(longest_streak), 0) as longest_streak,
                        MAX(last_active_date) as last_active_date
                    FROM dsa_user_progress
                    WHERE user_id = :user_id
                """),
                {"user_id": user_id}
            ).fetchone()
            
            today = date.today()
            last_active = result[2]
            is_active_today = last_active == today if last_active else False
            
            return StreakData(
                current_streak=result[0],
                longest_streak=result[1],
                last_active_date=last_active,
                is_active_today=is_active_today
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch streak: {str(e)}")

# ============= LEADERBOARD ENDPOINTS =============

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    period: str = "all",  # all, week, month
    limit: int = 100,
    current_user = Depends(get_current_user)
):
    """Get DSA leaderboard"""
    user_id = current_user.id
    
    try:
        with engine.connect() as conn:
            # Build date filter
            date_filter = ""
            if period == "week":
                date_filter = "AND p.last_active_date >= CURRENT_DATE - INTERVAL '7 days'"
            elif period == "month":
                date_filter = "AND p.last_active_date >= CURRENT_DATE - INTERVAL '30 days'"
            
            # Get leaderboard
            query = text(f"""
                WITH user_stats AS (
                    SELECT 
                        p.user_id,
                        u.username,
                        u.email,
                        COALESCE(SUM(p.score), 0) as total_score,
                        COUNT(*) FILTER (WHERE p.status = 'solved') as solved_count,
                        COALESCE(MAX(p.current_streak), 0) as current_streak,
                        COUNT(DISTINCT s.id) as total_submissions,
                        COUNT(DISTINCT CASE WHEN s.ai_used THEN s.id END) as ai_usage_count
                    FROM dsa_user_progress p
                    JOIN users u ON p.user_id = u.id
                    LEFT JOIN dsa_submissions s ON p.user_id = s.user_id AND p.question_slug = s.question_slug
                    WHERE 1=1 {date_filter}
                    GROUP BY p.user_id, u.username, u.email
                    HAVING COUNT(*) FILTER (WHERE p.status = 'solved') > 0
                ),
                ranked_users AS (
                    SELECT 
                        *,
                        ROW_NUMBER() OVER (ORDER BY total_score DESC, solved_count DESC, current_streak DESC) as rank
                    FROM user_stats
                )
                SELECT * FROM ranked_users
                ORDER BY rank
                LIMIT :limit
            """)
            
            result = conn.execute(query, {"limit": limit})
            
            leaderboard = []
            user_rank = None
            
            for row in result:
                entry = LeaderboardEntry(
                    rank=row[8],
                    user_id=row[0],
                    username=row[1],
                    email=row[2],
                    score=row[3],
                    solved_count=row[4],
                    current_streak=row[5],
                    total_submissions=row[6],
                    ai_usage_count=row[7]
                )
                leaderboard.append(entry)
                
                if row[0] == user_id:
                    user_rank = row[8]
            
            # Get total users count
            total = conn.execute(
                text("""
                    SELECT COUNT(DISTINCT user_id)
                    FROM dsa_user_progress
                    WHERE status = 'solved'
                """)
            ).scalar()
            
            return LeaderboardResponse(
                leaderboard=leaderboard,
                user_rank=user_rank,
                total_users=total or 0
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard: {str(e)}")

# ============= ADMIN ANALYTICS ENDPOINTS =============

@router.get("/admin/analytics", response_model=DSAAnalytics)
async def get_dsa_analytics(current_user = Depends(require_admin)):
    """Get comprehensive DSA analytics for admin"""
    
    try:
        with engine.connect() as conn:
            # Submission stats
            sub_stats = conn.execute(
                text("""
                    SELECT 
                        COUNT(*) as total,
                        COUNT(*) FILTER (WHERE verdict = 'Accepted' AND action_type = 'submit') as accepted,
                        COUNT(*) FILTER (WHERE verdict != 'Accepted' OR action_type = 'run') as failed
                    FROM dsa_submissions
                """)
            ).fetchone()
            
            total_subs = sub_stats[0] or 0
            accepted = sub_stats[1] or 0
            failed = sub_stats[2] or 0
            acceptance_rate = (accepted / total_subs * 100) if total_subs > 0 else 0
            
            # User stats
            user_stats = conn.execute(
                text("""
                    SELECT 
                        COUNT(DISTINCT user_id) as total_users,
                        COUNT(DISTINCT user_id) FILTER (WHERE last_active_date = CURRENT_DATE) as active_today,
                        COUNT(DISTINCT user_id) FILTER (WHERE last_active_date >= CURRENT_DATE - INTERVAL '7 days') as active_week
                    FROM dsa_user_progress
                """)
            ).fetchone()
            
            # Most attempted questions
            attempted = conn.execute(
                text("""
                    SELECT question_slug, question_title, COUNT(*) as attempts
                    FROM dsa_submissions
                    GROUP BY question_slug, question_title
                    ORDER BY attempts DESC
                    LIMIT 10
                """)
            )
            
            most_attempted = []
            for row in attempted:
                most_attempted.append({
                    "slug": row[0],
                    "title": row[1],
                    "attempts": row[2]
                })
            
            # Most solved questions
            solved = conn.execute(
                text("""
                    SELECT question_slug, question_title, COUNT(*) as solved_count
                    FROM dsa_user_progress
                    WHERE status = 'solved'
                    GROUP BY question_slug, question_title
                    ORDER BY solved_count DESC
                    LIMIT 10
                """)
            )
            
            most_solved = []
            for row in solved:
                most_solved.append({
                    "slug": row[0],
                    "title": row[1],
                    "solved_count": row[2]
                })
            
            # Topic usage
            topics = conn.execute(
                text("""
                    SELECT 
                        topic,
                        COUNT(*) as total_attempts,
                        COUNT(*) FILTER (WHERE status = 'solved') as solved
                    FROM dsa_user_progress
                    GROUP BY topic
                    ORDER BY total_attempts DESC
                """)
            )
            
            topic_usage = []
            for row in topics:
                topic_usage.append({
                    "topic": row[0],
                    "attempts": row[1],
                    "solved": row[2]
                })
            
            # Difficulty success rate
            difficulty = conn.execute(
                text("""
                    SELECT 
                        difficulty,
                        COUNT(*) as total,
                        COUNT(*) FILTER (WHERE status = 'solved') as solved
                    FROM dsa_user_progress
                    GROUP BY difficulty
                """)
            )
            
            difficulty_success = []
            for row in difficulty:
                total = row[1]
                solved = row[2]
                success_rate = (solved / total * 100) if total > 0 else 0
                difficulty_success.append({
                    "difficulty": row[0],
                    "total": total,
                    "solved": solved,
                    "success_rate": round(success_rate, 1)
                })
            
            # Top performers
            performers = conn.execute(
                text("""
                    SELECT 
                        u.username,
                        u.email,
                        COALESCE(SUM(p.score), 0) as score,
                        COUNT(*) FILTER (WHERE p.status = 'solved') as solved
                    FROM dsa_user_progress p
                    JOIN users u ON p.user_id = u.id
                    GROUP BY u.username, u.email
                    ORDER BY score DESC, solved DESC
                    LIMIT 10
                """)
            )
            
            top_performers = []
            for row in performers:
                top_performers.append({
                    "username": row[0],
                    "email": row[1],
                    "score": row[2],
                    "solved": row[3]
                })
            
            return DSAAnalytics(
                total_submissions=total_subs,
                accepted_submissions=accepted,
                failed_submissions=failed,
                acceptance_rate=round(acceptance_rate, 1),
                total_users=user_stats[0] or 0,
                active_users_today=user_stats[1] or 0,
                active_users_week=user_stats[2] or 0,
                most_attempted_questions=most_attempted,
                most_solved_questions=most_solved,
                topic_usage=topic_usage,
                difficulty_success_rate=difficulty_success,
                top_performers=top_performers
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

@router.get("/admin/ai-analytics", response_model=AIAnalytics)
async def get_ai_analytics(current_user = Depends(require_admin)):
    """Get AI usage analytics for admin"""
    
    try:
        with engine.connect() as conn:
            # Overall AI stats
            ai_stats = conn.execute(
                text("""
                    SELECT 
                        COUNT(*) as total,
                        COUNT(*) FILTER (WHERE action_type = 'hint') as hints,
                        COUNT(*) FILTER (WHERE action_type = 'explain') as explains,
                        COUNT(*) FILTER (WHERE action_type = 'solution') as solutions,
                        COUNT(*) FILTER (WHERE action_type = 'explain-code') as explain_code,
                        COUNT(*) FILTER (WHERE action_type = 'fix-code') as fix_code
                    FROM dsa_ai_usage
                """)
            ).fetchone()
            
            # Most common action
            most_common = conn.execute(
                text("""
                    SELECT action_type, COUNT(*) as count
                    FROM dsa_ai_usage
                    GROUP BY action_type
                    ORDER BY count DESC
                    LIMIT 1
                """)
            ).fetchone()
            
            # AI usage by question
            by_question = conn.execute(
                text("""
                    SELECT question_slug, action_type, COUNT(*) as count
                    FROM dsa_ai_usage
                    GROUP BY question_slug, action_type
                    ORDER BY count DESC
                    LIMIT 20
                """)
            )
            
            ai_by_question = []
            for row in by_question:
                ai_by_question.append({
                    "question_slug": row[0],
                    "action_type": row[1],
                    "count": row[2]
                })
            
            # AI usage by user
            by_user = conn.execute(
                text("""
                    SELECT u.username, COUNT(*) as ai_requests
                    FROM dsa_ai_usage a
                    JOIN users u ON a.user_id = u.id
                    GROUP BY u.username
                    ORDER BY ai_requests DESC
                    LIMIT 20
                """)
            )
            
            ai_by_user = []
            for row in by_user:
                ai_by_user.append({
                    "username": row[0],
                    "requests": row[1]
                })
            
            return AIAnalytics(
                total_ai_requests=ai_stats[0] or 0,
                hint_requests=ai_stats[1] or 0,
                explain_requests=ai_stats[2] or 0,
                solution_requests=ai_stats[3] or 0,
                explain_code_requests=ai_stats[4] or 0,
                fix_code_requests=ai_stats[5] or 0,
                ai_usage_by_question=ai_by_question,
                ai_usage_by_user=ai_by_user,
                most_common_action=most_common[0] if most_common else "none"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch AI analytics: {str(e)}")
