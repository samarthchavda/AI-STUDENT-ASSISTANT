"""
DSA Admin Routes - Management and Statistics for DSA Module
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.database import get_db
from app.models import User, DSAProblem, DSAProgress, DSASubmission
from app.core.auth import get_current_user

router = APIRouter(prefix="/dsa-admin", tags=["DSA Admin"])


# Dependency to check if user is admin
async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Not authorized. Admin access required."
        )
    return current_user


# Response Models
class DSAStatsResponse(BaseModel):
    total_questions: int
    total_submissions: int
    success_rate: float
    cache_coverage: float
    questions_by_topic: Dict[str, int]
    questions_by_difficulty: Dict[str, int]
    recent_submissions: int
    avg_attempts_per_problem: float


class DSAQuestionResponse(BaseModel):
    id: int
    title: str
    topic: str
    difficulty: str
    company: str
    has_cache: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class DSASubmissionResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    problem_id: int
    problem_title: str
    language: str
    status: str
    score: int
    attempts: int
    submitted_at: datetime


# ============================================================================
# DSA STATISTICS
# ============================================================================

@router.get("/stats", response_model=DSAStatsResponse)
async def get_dsa_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get comprehensive DSA module statistics"""
    
    # Total questions
    total_questions = db.query(DSAProblem).count()
    
    # Total submissions
    total_submissions = db.query(DSASubmission).count()
    
    # Success rate (accepted vs total)
    accepted_count = db.query(DSASubmission).filter(
        DSASubmission.status == 'accepted'
    ).count()
    success_rate = (accepted_count / total_submissions * 100) if total_submissions > 0 else 0
    
    # Cache coverage (questions with solutions_cache)
    cached_count = db.query(DSAProblem).filter(
        DSAProblem.solutions_cache.isnot(None),
        DSAProblem.solutions_cache != '{}'
    ).count()
    cache_coverage = (cached_count / total_questions * 100) if total_questions > 0 else 0
    
    # Questions by topic
    topic_counts = db.query(
        DSAProblem.topic,
        func.count(DSAProblem.id).label('count')
    ).group_by(DSAProblem.topic).all()
    questions_by_topic = {
        str(row.topic).replace('DSATopic.', ''): row.count 
        for row in topic_counts
    }
    
    # Questions by difficulty
    difficulty_counts = db.query(
        DSAProblem.difficulty,
        func.count(DSAProblem.id).label('count')
    ).group_by(DSAProblem.difficulty).all()
    questions_by_difficulty = {
        str(row.difficulty).replace('DifficultyLevel.', ''): row.count 
        for row in difficulty_counts
    }
    
    # Recent submissions (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_submissions = db.query(DSASubmission).filter(
        DSASubmission.created_at >= yesterday
    ).count()
    
    # Average attempts per problem
    avg_attempts = db.query(func.avg(DSAProgress.attempts)).scalar() or 0
    
    return {
        "total_questions": total_questions,
        "total_submissions": total_submissions,
        "success_rate": round(success_rate, 2),
        "cache_coverage": round(cache_coverage, 2),
        "questions_by_topic": questions_by_topic,
        "questions_by_difficulty": questions_by_difficulty,
        "recent_submissions": recent_submissions,
        "avg_attempts_per_problem": round(float(avg_attempts), 2)
    }


# ============================================================================
# QUESTION MANAGEMENT
# ============================================================================

@router.get("/questions")
async def get_dsa_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    topic: str = Query(None),
    company: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all DSA questions with filters"""
    
    query = db.query(DSAProblem)
    
    # Apply filters
    if topic:
        query = query.filter(DSAProblem.topic == topic)
    
    if company:
        query = query.filter(DSAProblem.company.ilike(f"%{company}%"))
    
    if search:
        query = query.filter(DSAProblem.title.ilike(f"%{search}%"))
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    questions = query.order_by(DSAProblem.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "questions": [
            {
                "id": q.id,
                "title": q.title,
                "topic": str(q.topic).replace('DSATopic.', ''),
                "difficulty": str(q.difficulty).replace('DifficultyLevel.', ''),
                "company": q.company,
                "has_cache": bool(q.solutions_cache and q.solutions_cache != '{}'),
                "created_at": q.created_at
            }
            for q in questions
        ]
    }


@router.get("/questions/{question_id}")
async def get_dsa_question_detail(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get detailed information about a specific question"""
    
    question = db.query(DSAProblem).filter(DSAProblem.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Get submission stats for this question
    total_attempts = db.query(DSASubmission).filter(
        DSASubmission.problem_id == question_id
    ).count()
    
    accepted_attempts = db.query(DSASubmission).filter(
        DSASubmission.problem_id == question_id,
        DSASubmission.status == 'accepted'
    ).count()
    
    unique_users = db.query(func.count(func.distinct(DSASubmission.user_id))).filter(
        DSASubmission.problem_id == question_id
    ).scalar()
    
    return {
        "id": question.id,
        "title": question.title,
        "description": question.description,
        "topic": str(question.topic).replace('DSATopic.', ''),
        "difficulty": str(question.difficulty).replace('DifficultyLevel.', ''),
        "company": question.company,
        "constraints": question.constraints,
        "examples": question.examples,
        "hints": question.hints,
        "has_cache": bool(question.solutions_cache and question.solutions_cache != '{}'),
        "created_at": question.created_at,
        "stats": {
            "total_attempts": total_attempts,
            "accepted_attempts": accepted_attempts,
            "success_rate": round((accepted_attempts / total_attempts * 100) if total_attempts > 0 else 0, 2),
            "unique_users": unique_users
        }
    }


@router.put("/questions/{question_id}")
async def update_dsa_question(
    question_id: int,
    title: str = None,
    description: str = None,
    constraints: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Quick edit a DSA question"""
    
    question = db.query(DSAProblem).filter(DSAProblem.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Update fields if provided
    if title:
        question.title = title
    if description:
        question.description = description
    if constraints:
        question.constraints = constraints
    
    db.commit()
    
    return {"message": "Question updated successfully", "id": question_id}


# ============================================================================
# SUBMISSION LOGS
# ============================================================================

@router.get("/submissions")
async def get_recent_submissions(
    limit: int = Query(50, le=200),
    status: str = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get recent code submissions"""
    
    query = db.query(DSASubmission).join(User).join(DSAProblem)
    
    # Filter by status if provided
    if status:
        query = query.filter(DSASubmission.status == status)
    
    # Get recent submissions
    submissions = query.order_by(DSASubmission.created_at.desc()).limit(limit).all()
    
    return {
        "total": len(submissions),
        "submissions": [
            {
                "id": s.id,
                "user_id": s.user_id,
                "user_name": s.user.name,
                "user_email": s.user.email,
                "problem_id": s.problem_id,
                "problem_title": s.problem.title,
                "language": s.language,
                "status": s.status,
                "score": s.score,
                "submitted_at": s.created_at
            }
            for s in submissions
        ]
    }


# ============================================================================
# BATCH AI ACTIONS
# ============================================================================

@router.post("/generate-missing-solutions")
async def generate_missing_solutions(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Find questions with empty solutions_cache and trigger AI generation"""
    
    # Find questions without cache
    questions_without_cache = db.query(DSAProblem).filter(
        (DSAProblem.solutions_cache.is_(None)) | (DSAProblem.solutions_cache == '{}')
    ).all()
    
    if not questions_without_cache:
        return {
            "message": "All questions already have cached solutions",
            "missing_count": 0
        }
    
    return {
        "message": f"Found {len(questions_without_cache)} questions without cached solutions",
        "missing_count": len(questions_without_cache),
        "question_ids": [q.id for q in questions_without_cache],
        "note": "Run the generate_solutions.py script to fill these caches"
    }


@router.get("/cache-status")
async def get_cache_status(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get detailed cache status for all questions"""
    
    total_questions = db.query(DSAProblem).count()
    
    # Questions with cache
    with_cache = db.query(DSAProblem).filter(
        DSAProblem.solutions_cache.isnot(None),
        DSAProblem.solutions_cache != '{}'
    ).count()
    
    # Questions without cache
    without_cache = total_questions - with_cache
    
    # Get list of questions without cache
    missing_questions = db.query(DSAProblem.id, DSAProblem.title).filter(
        (DSAProblem.solutions_cache.is_(None)) | (DSAProblem.solutions_cache == '{}')
    ).limit(20).all()
    
    return {
        "total_questions": total_questions,
        "with_cache": with_cache,
        "without_cache": without_cache,
        "cache_percentage": round((with_cache / total_questions * 100) if total_questions > 0 else 0, 2),
        "missing_questions_sample": [
            {"id": q.id, "title": q.title}
            for q in missing_questions
        ]
    }


# ============================================================================
# USER PERFORMANCE ANALYTICS
# ============================================================================

@router.get("/user-performance")
async def get_user_performance(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get performance analytics for all users who have attempted DSA problems"""
    
    # Get all users who have submissions
    users_with_submissions = db.query(
        User.id,
        User.name,
        User.email,
        func.count(func.distinct(
            case(
                (DSASubmission.status == 'accepted', DSAProgress.problem_id),
                else_=None
            )
        )).label('total_solved'),
        func.count(DSASubmission.id).label('total_submissions'),
        func.sum(
            case(
                (DSASubmission.status == 'accepted', 1),
                else_=0
            )
        ).label('accepted_submissions'),
        func.max(DSASubmission.created_at).label('last_active')
    ).join(
        DSASubmission, User.id == DSASubmission.user_id
    ).outerjoin(
        DSAProgress, 
        (DSAProgress.user_id == User.id) & (DSAProgress.problem_id == DSASubmission.problem_id)
    ).group_by(
        User.id, User.name, User.email
    ).all()
    
    # Build user performance list
    user_performance = []
    now = datetime.utcnow()
    
    for user_data in users_with_submissions:
        user_id = user_data.id
        
        # Get difficulty breakdown
        difficulty_breakdown = db.query(
            DSAProblem.difficulty,
            func.count(func.distinct(DSAProgress.problem_id)).label('count')
        ).join(
            DSAProgress, DSAProblem.id == DSAProgress.problem_id
        ).filter(
            DSAProgress.user_id == user_id,
            DSAProgress.status == 'solved'
        ).group_by(
            DSAProblem.difficulty
        ).all()
        
        easy_solved = 0
        medium_solved = 0
        hard_solved = 0
        
        for diff in difficulty_breakdown:
            diff_str = str(diff.difficulty).replace('DifficultyLevel.', '').lower()
            if diff_str == 'easy':
                easy_solved = diff.count
            elif diff_str == 'medium':
                medium_solved = diff.count
            elif diff_str == 'hard':
                hard_solved = diff.count
        
        # Calculate accuracy rate
        total_subs = user_data.total_submissions or 0
        accepted_subs = user_data.accepted_submissions or 0
        accuracy_rate = (accepted_subs / total_subs * 100) if total_subs > 0 else 0
        
        # Check if active in last 24 hours
        is_active_24h = False
        if user_data.last_active:
            time_diff = now - user_data.last_active
            is_active_24h = time_diff.total_seconds() < 86400  # 24 hours
        
        user_performance.append({
            "user_id": user_id,
            "user_name": user_data.name,
            "user_email": user_data.email,
            "easy_solved": easy_solved,
            "medium_solved": medium_solved,
            "hard_solved": hard_solved,
            "total_solved": user_data.total_solved or 0,
            "total_submissions": total_subs,
            "accepted_submissions": accepted_subs,
            "accuracy_rate": round(accuracy_rate, 2),
            "last_active": user_data.last_active.isoformat() if user_data.last_active else None,
            "is_active_24h": is_active_24h
        })
    
    # Sort by total solved (descending)
    user_performance.sort(key=lambda x: x['total_solved'], reverse=True)
    
    return {
        "users": user_performance,
        "total_users": len(user_performance)
    }


@router.get("/user-performance/{user_id}")
async def get_user_performance_detail(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get detailed performance data for a specific user"""
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all submissions for this user
    submissions = db.query(
        DSASubmission,
        DSAProblem.title,
        DSAProblem.difficulty,
        DSAProblem.topic
    ).join(
        DSAProblem, DSASubmission.problem_id == DSAProblem.id
    ).filter(
        DSASubmission.user_id == user_id
    ).order_by(
        DSASubmission.created_at.desc()
    ).all()
    
    # Get progress data
    progress = db.query(DSAProgress).filter(
        DSAProgress.user_id == user_id
    ).all()
    
    return {
        "user_id": user_id,
        "user_name": user.name,
        "user_email": user.email,
        "submissions": [
            {
                "id": sub.DSASubmission.id,
                "problem_id": sub.DSASubmission.problem_id,
                "problem_title": sub.title,
                "difficulty": str(sub.difficulty).replace('DifficultyLevel.', ''),
                "topic": str(sub.topic).replace('DSATopic.', ''),
                "language": sub.DSASubmission.language,
                "status": sub.DSASubmission.status,
                "score": sub.DSASubmission.score,
                "test_cases_passed": sub.DSASubmission.test_cases_passed,
                "total_test_cases": sub.DSASubmission.total_test_cases,
                "execution_time": sub.DSASubmission.execution_time,
                "created_at": sub.DSASubmission.created_at.isoformat()
            }
            for sub in submissions
        ],
        "progress": [
            {
                "problem_id": p.problem_id,
                "topic": str(p.topic).replace('DSATopic.', ''),
                "difficulty": str(p.difficulty).replace('DifficultyLevel.', ''),
                "status": p.status,
                "attempts": p.attempts,
                "best_score": p.best_score,
                "hints_used": p.hints_used,
                "time_spent": p.time_spent,
                "solved_at": p.solved_at.isoformat() if p.solved_at else None
            }
            for p in progress
        ]
    }
