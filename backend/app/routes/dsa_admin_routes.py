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
from app.models import User, DSAProblem, DSAProgress, DSAHistory
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
    
    # Total submissions (from history)
    total_submissions = db.query(DSAHistory).count()
    
    # Success rate (accepted vs total)
    accepted_count = db.query(DSAHistory).filter(
        DSAHistory.status == 'accepted'
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
    recent_submissions = db.query(DSAHistory).filter(
        DSAHistory.submitted_at >= yesterday
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
    total_attempts = db.query(DSAHistory).filter(
        DSAHistory.problem_id == question_id
    ).count()
    
    accepted_attempts = db.query(DSAHistory).filter(
        DSAHistory.problem_id == question_id,
        DSAHistory.status == 'accepted'
    ).count()
    
    unique_users = db.query(func.count(func.distinct(DSAHistory.user_id))).filter(
        DSAHistory.problem_id == question_id
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
    
    query = db.query(DSAHistory).join(User).join(DSAProblem)
    
    # Filter by status if provided
    if status:
        query = query.filter(DSAHistory.status == status)
    
    # Get recent submissions
    submissions = query.order_by(DSAHistory.submitted_at.desc()).limit(limit).all()
    
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
                "submitted_at": s.submitted_at
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
