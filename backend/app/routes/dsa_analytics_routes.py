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
                        COALESCE(COUNT(*) FILTER (WHERE status = 'solved'), 0) as total_solved,
                        COALESCE(COUNT(*) FILTER (WHERE status IN ('solved', 'attempted')), 0) as total_attempted,
                        COALESCE(COUNT(*) FILTER (WHERE status = 'solved' AND difficulty = 'Easy'), 0) as easy_solved,
                        COALESCE(COUNT(*) FILTER (WHERE status = 'solved' AND difficulty = 'Medium'), 0) as medium_solved,
                        COALESCE(COUNT(*) FILTER (WHERE status = 'solved' AND difficulty = 'Hard'), 0) as hard_solved,
                        COALESCE(SUM(score), 0) as total_score,
                        COALESCE(MAX(current_streak), 0) as current_streak,
                        COALESCE(MAX(longest_streak), 0) as longest_streak
                    FROM dsa_user_progress
                    WHERE user_id = :user_id
                """),
                {"user_id": user_id}
            ).fetchone()
            
            # Get submission stats - handle multiple verdict formats
            submissions = conn.execute(
                text("""
                    SELECT 
                        COALESCE(COUNT(*), 0) as total_submissions,
                        COALESCE(COUNT(*) FILTER (WHERE ai_used = true), 0) as ai_assisted,
                        COALESCE(COUNT(*) FILTER (WHERE 
                            (LOWER(verdict) = 'accepted' OR LOWER(verdict) = 'ac' OR passed_testcases = total_testcases)
                            AND action_type = 'submit'
                        ), 0) as accepted
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
                        COALESCE(COUNT(*) FILTER (WHERE status = 'solved'), 0) as solved,
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
                    "solved": int(row[1]),
                    "total": int(row[2])
                })
            
            # Calculate acceptance rate
            total_subs = int(submissions[0] or 0)
            accepted = int(submissions[2] or 0)
            acceptance_rate = (accepted / total_subs * 100) if total_subs > 0 else 0.0
            
            return DashboardStats(
                total_solved=int(progress[0] or 0),
                total_attempted=int(progress[1] or 0),
                easy_solved=int(progress[2] or 0),
                medium_solved=int(progress[3] or 0),
                hard_solved=int(progress[4] or 0),
                total_score=int(progress[5] or 0),
                current_streak=int(progress[6] or 0),
                longest_streak=int(progress[7] or 0),
                total_submissions=total_subs,
                ai_assisted_submissions=int(submissions[1] or 0),
                acceptance_rate=round(acceptance_rate, 1),
                recent_solved=recent_solved,
                topic_progress=topic_progress
            )
            
    except Exception as e:
        import traceback
        print(f"❌ Dashboard Error: {str(e)}")
        traceback.print_exc()
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
            
            # Get leaderboard - use 'name' instead of 'username'
            query = text(f"""
                WITH user_stats AS (
                    SELECT 
                        p.user_id,
                        u.name,
                        u.email,
                        COALESCE(SUM(p.score), 0) as total_score,
                        COALESCE(COUNT(*) FILTER (WHERE p.status = 'solved'), 0) as solved_count,
                        COALESCE(MAX(p.current_streak), 0) as current_streak,
                        COUNT(DISTINCT s.id) as total_submissions,
                        COALESCE(COUNT(DISTINCT CASE WHEN s.ai_used THEN s.id END), 0) as ai_usage_count
                    FROM dsa_user_progress p
                    JOIN users u ON p.user_id = u.id
                    LEFT JOIN dsa_submissions s ON p.user_id = s.user_id AND p.question_slug = s.question_slug
                    WHERE 1=1 {date_filter}
                    GROUP BY p.user_id, u.name, u.email
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
                    rank=int(row[8]),
                    user_id=int(row[0]),
                    username=row[1] or "Unknown",  # Use name as username
                    email=row[2],
                    score=int(row[3]),
                    solved_count=int(row[4]),
                    current_streak=int(row[5]),
                    total_submissions=int(row[6]),
                    ai_usage_count=int(row[7])
                )
                leaderboard.append(entry)
                
                if row[0] == user_id:
                    user_rank = int(row[8])
            
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
                total_users=int(total or 0)
            )
            
    except Exception as e:
        import traceback
        print(f"❌ Leaderboard Error: {str(e)}")
        traceback.print_exc()
        # Return empty leaderboard instead of crashing
        return LeaderboardResponse(
            leaderboard=[],
            user_rank=None,
            total_users=0
        )

# ============= ADMIN ANALYTICS ENDPOINTS =============

@router.get("/admin/analytics", response_model=DSAAnalytics)
async def get_dsa_analytics(current_user = Depends(require_admin)):
    """Get comprehensive DSA analytics for admin"""
    
    try:
        with engine.connect() as conn:
            # Submission stats - handle multiple verdict formats
            sub_stats = conn.execute(
                text("""
                    SELECT 
                        COALESCE(COUNT(*), 0) as total,
                        COALESCE(COUNT(*) FILTER (WHERE 
                            (LOWER(verdict) = 'accepted' OR LOWER(verdict) = 'ac' OR passed_testcases = total_testcases)
                            AND action_type = 'submit'
                        ), 0) as accepted,
                        COALESCE(COUNT(*) FILTER (WHERE 
                            (LOWER(verdict) != 'accepted' AND LOWER(verdict) != 'ac' AND passed_testcases < total_testcases)
                            OR action_type = 'run'
                        ), 0) as failed
                    FROM dsa_submissions
                """)
            ).fetchone()
            
            total_subs = int(sub_stats[0] or 0)
            accepted = int(sub_stats[1] or 0)
            failed = int(sub_stats[2] or 0)
            acceptance_rate = (accepted / total_subs * 100) if total_subs > 0 else 0.0
            
            print(f"📊 DSA Analytics - Total: {total_subs}, Accepted: {accepted}, Failed: {failed}, Rate: {acceptance_rate}%")
            
            # User stats
            user_stats = conn.execute(
                text("""
                    SELECT 
                        COALESCE(COUNT(DISTINCT user_id), 0) as total_users,
                        COALESCE(COUNT(DISTINCT user_id) FILTER (WHERE last_active_date = CURRENT_DATE), 0) as active_today,
                        COALESCE(COUNT(DISTINCT user_id) FILTER (WHERE last_active_date >= CURRENT_DATE - INTERVAL '7 days'), 0) as active_week
                    FROM dsa_user_progress
                """)
            ).fetchone()
            
            # Most attempted questions (all submissions)
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
                    "attempts": int(row[2])
                })
            
            print(f"📈 Most attempted: {len(most_attempted)} questions")
            
            # Most solved questions (from user_progress where status = 'solved')
            solved = conn.execute(
                text("""
                    SELECT question_slug, question_title, COUNT(DISTINCT user_id) as solved_count
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
                    "solved_count": int(row[2])
                })
            
            print(f"✅ Most solved: {len(most_solved)} questions")
            
            # Topic usage (from user_progress)
            topics = conn.execute(
                text("""
                    SELECT 
                        topic,
                        COUNT(DISTINCT user_id) as total_attempts,
                        COALESCE(COUNT(DISTINCT user_id) FILTER (WHERE status = 'solved'), 0) as solved
                    FROM dsa_user_progress
                    GROUP BY topic
                    ORDER BY total_attempts DESC
                """)
            )
            
            topic_usage = []
            for row in topics:
                topic_usage.append({
                    "topic": row[0],
                    "attempts": int(row[1]),
                    "solved": int(row[2])
                })
            
            # Difficulty success rate (from submissions)
            difficulty = conn.execute(
                text("""
                    SELECT 
                        p.difficulty,
                        COUNT(DISTINCT s.id) as total_submissions,
                        COALESCE(COUNT(DISTINCT s.id) FILTER (WHERE 
                            (LOWER(s.verdict) = 'accepted' OR LOWER(s.verdict) = 'ac' OR s.passed_testcases = s.total_testcases)
                            AND s.action_type = 'submit'
                        ), 0) as accepted_submissions
                    FROM dsa_submissions s
                    JOIN dsa_user_progress p ON s.question_slug = p.question_slug AND s.user_id = p.user_id
                    WHERE s.action_type = 'submit'
                    GROUP BY p.difficulty
                """)
            )
            
            difficulty_success = []
            for row in difficulty:
                total = int(row[1])
                solved = int(row[2])
                success_rate = (solved / total * 100) if total > 0 else 0.0
                difficulty_success.append({
                    "difficulty": row[0],
                    "total": total,
                    "solved": solved,
                    "success_rate": round(success_rate, 1)
                })
            
            print(f"📊 Difficulty stats: {len(difficulty_success)} levels")
            
            # Top performers (from user_progress where status = 'solved')
            performers = conn.execute(
                text("""
                    SELECT 
                        u.name,
                        u.email,
                        COALESCE(SUM(p.score), 0) as total_score,
                        COALESCE(COUNT(*) FILTER (WHERE p.status = 'solved'), 0) as solved_count
                    FROM dsa_user_progress p
                    JOIN users u ON p.user_id = u.id
                    GROUP BY u.name, u.email
                    HAVING COUNT(*) FILTER (WHERE p.status = 'solved') > 0
                    ORDER BY total_score DESC, solved_count DESC
                    LIMIT 10
                """)
            )
            
            top_performers = []
            for row in performers:
                top_performers.append({
                    "username": row[0] or "Unknown",
                    "email": row[1],
                    "score": int(row[2]),
                    "solved": int(row[3])
                })
            
            print(f"🏆 Top performers: {len(top_performers)} users")
            
            return DSAAnalytics(
                total_submissions=total_subs,
                accepted_submissions=accepted,
                failed_submissions=failed,
                acceptance_rate=round(acceptance_rate, 1),
                total_users=int(user_stats[0] or 0),
                active_users_today=int(user_stats[1] or 0),
                active_users_week=int(user_stats[2] or 0),
                most_attempted_questions=most_attempted,
                most_solved_questions=most_solved,
                topic_usage=topic_usage,
                difficulty_success_rate=difficulty_success,
                top_performers=top_performers
            )
            
    except Exception as e:
        import traceback
        print(f"❌ DSA Analytics Error: {str(e)}")
        traceback.print_exc()
        # Return empty data instead of crashing
        return DSAAnalytics(
            total_submissions=0,
            accepted_submissions=0,
            failed_submissions=0,
            acceptance_rate=0.0,
            total_users=0,
            active_users_today=0,
            active_users_week=0,
            most_attempted_questions=[],
            most_solved_questions=[],
            topic_usage=[],
            difficulty_success_rate=[],
            top_performers=[]
        )

@router.get("/admin/ai-analytics", response_model=AIAnalytics)
async def get_ai_analytics(current_user = Depends(require_admin)):
    """Get AI usage analytics for admin"""
    
    try:
        with engine.connect() as conn:
            # Overall AI stats
            ai_stats = conn.execute(
                text("""
                    SELECT 
                        COALESCE(COUNT(*), 0) as total,
                        COALESCE(COUNT(*) FILTER (WHERE action_type = 'hint'), 0) as hints,
                        COALESCE(COUNT(*) FILTER (WHERE action_type = 'explain'), 0) as explains,
                        COALESCE(COUNT(*) FILTER (WHERE action_type = 'solution'), 0) as solutions,
                        COALESCE(COUNT(*) FILTER (WHERE action_type = 'explain-code'), 0) as explain_code,
                        COALESCE(COUNT(*) FILTER (WHERE action_type = 'fix-code'), 0) as fix_code
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
                    "count": int(row[2])
                })
            
            # AI usage by user - use 'name' instead of 'username'
            by_user = conn.execute(
                text("""
                    SELECT u.name, COUNT(*) as ai_requests
                    FROM dsa_ai_usage a
                    JOIN users u ON a.user_id = u.id
                    GROUP BY u.name
                    ORDER BY ai_requests DESC
                    LIMIT 20
                """)
            )
            
            ai_by_user = []
            for row in by_user:
                ai_by_user.append({
                    "username": row[0] or "Unknown",  # Use name as username
                    "requests": int(row[1])
                })
            
            return AIAnalytics(
                total_ai_requests=int(ai_stats[0] or 0),
                hint_requests=int(ai_stats[1] or 0),
                explain_requests=int(ai_stats[2] or 0),
                solution_requests=int(ai_stats[3] or 0),
                explain_code_requests=int(ai_stats[4] or 0),
                fix_code_requests=int(ai_stats[5] or 0),
                ai_usage_by_question=ai_by_question,
                ai_usage_by_user=ai_by_user,
                most_common_action=most_common[0] if most_common else "none"
            )
            
    except Exception as e:
        import traceback
        print(f"❌ AI Analytics Error: {str(e)}")
        traceback.print_exc()
        # Return empty data instead of crashing
        return AIAnalytics(
            total_ai_requests=0,
            hint_requests=0,
            explain_requests=0,
            solution_requests=0,
            explain_code_requests=0,
            fix_code_requests=0,
            ai_usage_by_question=[],
            ai_by_user=[],
            most_common_action="none"
        )
