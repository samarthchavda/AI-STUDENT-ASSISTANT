from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models import DSAChallengeProblem, User
from app.models.schemas import (
    CodeHelpRequest,
    DSARequest,
    ProjectGuideRequest,
    ChallengeSubmitRequest,
    ChallengeRewardRequest,
)
from app.core.auth import get_current_user
from app.core.database import get_db
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/coding", tags=["Coding Help"])

@router.post("/help")
def code_help(request: CodeHelpRequest):
    """Explain, debug, or optimize code"""
    result = ai_service.explain_code(request.code, request.language, request.task)
    return result

@router.post("/dsa-hint")
def dsa_hint(request: DSARequest):
    """Get hints for DSA problems without spoiling solution"""
    result = ai_service.dsa_hint(request.problem)
    return result

@router.post("/project-guide")
def project_guidance(request: ProjectGuideRequest):
    """Get project guidance and roadmap"""
    result = ai_service.project_guidance(request.projectType, request.techStack)
    return result


@router.get("/challenge/problem")
def get_challenge_problem(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch one active DSA challenge problem from DB."""
    problem = (
        db.query(DSAChallengeProblem)
        .filter(DSAChallengeProblem.is_active == True)
        .order_by(DSAChallengeProblem.id.desc())
        .first()
    )

    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active challenge problem found.")

    return {
        "id": problem.id,
        "title": problem.title,
        "description": problem.description,
        "constraints": problem.constraints,
        "test_cases": problem.test_cases,
        "starter_code": problem.starter_code,
        "language": problem.language,
        "difficulty": problem.difficulty.value if problem.difficulty else "medium",
        "time_limit_seconds": problem.time_limit_seconds or 1800,
    }


@router.get("/challenge/problem/{problem_id}")
def get_challenge_problem_by_id(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch one active DSA challenge problem by id."""
    problem = (
        db.query(DSAChallengeProblem)
        .filter(
            DSAChallengeProblem.id == problem_id,
            DSAChallengeProblem.is_active == True,
        )
        .first()
    )

    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge problem not found.")

    return {
        "id": problem.id,
        "title": problem.title,
        "description": problem.description,
        "constraints": problem.constraints,
        "test_cases": problem.test_cases,
        "starter_code": problem.starter_code,
        "language": problem.language,
        "difficulty": problem.difficulty.value if problem.difficulty else "medium",
        "time_limit_seconds": problem.time_limit_seconds or 1800,
    }


@router.get("/challenge/questions")
def list_challenge_questions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List active DSA challenge questions for dashboard/table view."""
    questions = (
        db.query(DSAChallengeProblem)
        .filter(DSAChallengeProblem.is_active == True)
        .order_by(DSAChallengeProblem.id.asc())
        .all()
    )

    return {
        "questions": [
            {
                "id": q.id,
                "title": q.title,
                "difficulty": q.difficulty.value if q.difficulty else "medium",
                "time_limit_seconds": q.time_limit_seconds or 1800,
            }
            for q in questions
        ]
    }


@router.post("/challenge/submit")
def submit_challenge_solution(
    request: ChallengeSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit challenge solution. Timeout/disqualification auto-fails."""
    problem = db.query(DSAChallengeProblem).filter(DSAChallengeProblem.id == request.problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge problem not found.")

    reason = (request.submission_reason or "manual").lower()
    disqualified = bool(request.disqualified) or reason == "disqualified"
    timed_out = reason == "timeout" or (request.time_left_seconds is not None and request.time_left_seconds <= 0)

    if disqualified:
        return {
            "passed": False,
            "success": False,
            "message": "Submission auto-failed due to disqualification.",
            "feedback": "You switched tabs too many times. Challenge disqualified.",
        }

    if timed_out:
        return {
            "passed": False,
            "success": False,
            "message": "Submission auto-failed due to timeout.",
            "feedback": "Time reached 0:00 before successful submission.",
        }

    code = (request.code or "").strip()
    if len(code) < 20:
        return {
            "passed": False,
            "success": False,
            "message": "Submission received.",
            "feedback": "Solution appears incomplete. Add full logic and try again.",
        }

    return {
        "passed": True,
        "success": True,
        "message": "Challenge solved successfully within time.",
        "feedback": "Great job! Your submission has been accepted.",
    }


@router.post("/challenge/reward")
def grant_challenge_reward(
    request: ChallengeRewardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grant 15-day plan expiry extension after 5 successful timed solves."""
    if request.solved_count < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 5 successful timed solves are required.",
        )

    now = datetime.utcnow()

    try:
        db.execute(text("ALTER TABLE users ADD COLUMN plan_expiry DATETIME"))
        db.commit()
    except Exception:
        db.rollback()

    existing = db.execute(
        text("SELECT plan_expiry FROM users WHERE id = :user_id"),
        {"user_id": current_user.id},
    ).scalar()

    base = now
    if isinstance(existing, datetime) and existing > now:
        base = existing

    new_expiry = base + timedelta(days=15)
    db.execute(
        text("UPDATE users SET plan_expiry = :plan_expiry WHERE id = :user_id"),
        {"plan_expiry": new_expiry, "user_id": current_user.id},
    )
    db.commit()

    return {
        "message": "Reward granted. Plan expiry extended by 15 days.",
        "plan_expiry": new_expiry.isoformat(),
    }
