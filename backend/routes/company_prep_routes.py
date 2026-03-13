"""Company preparation and mock interview routes."""

from random import shuffle
from typing import Dict, List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ai_service import ai_service
from auth import get_current_user
from database import get_db
from models import CompanyQuestion, QuestionCategory, User, UserPractice
from schemas import (
    CompanyAnswerEvaluationRequest,
    CompanyPrepStartRequest,
    CompanyQuestionExplainRequest,
    PracticeHistoryItem,
)

router = APIRouter(tags=["Company Prep"])

FEATURED_COMPANIES = [
    "Microsoft",
    "Amazon",
    "Google",
    "Tata Consultancy Services",
    "Infosys",
    "Wipro",
    "Accenture",
]

ROLE_OPTIONS = [
    "Software Engineer",
    "Data Analyst",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "System Engineer",
    "Cloud Engineer",
]

COMPANY_ALIASES = {
    "tata consultancy services": ["Tata Consultancy Services", "TCS"],
    "tcs": ["TCS", "Tata Consultancy Services"],
    "microsoft": ["Microsoft"],
    "amazon": ["Amazon"],
    "google": ["Google"],
    "infosys": ["Infosys"],
    "wipro": ["Wipro"],
    "accenture": ["Accenture"],
}

ROUND_CATEGORY_MAP = {
    "Aptitude": {QuestionCategory.APTITUDE},
    "Coding": {QuestionCategory.CODING, QuestionCategory.DSA},
    "Technical": {QuestionCategory.TECHNICAL, QuestionCategory.SYSTEM_DESIGN},
    "HR": {QuestionCategory.HR, QuestionCategory.BEHAVIORAL},
}


def resolve_company_names(company: str) -> List[str]:
    normalized = company.strip()
    if not normalized:
        return []
    aliases = COMPANY_ALIASES.get(normalized.lower(), [normalized])
    ordered = []
    for name in aliases + [normalized]:
        if name not in ordered:
            ordered.append(name)
    return ordered


def serialize_question(question: CompanyQuestion, round_name: str = "Technical") -> Dict:
    return {
        "id": question.id,
        "company_name": question.company_name,
        "question": question.question_text.strip(),
        "category": question.category.value if hasattr(question.category, "value") else question.category,
        "difficulty": question.difficulty.value if hasattr(question.difficulty, "value") else question.difficulty,
        "frequency": question.frequency or 0,
        "topic": question.topic,
        "year_asked": question.year_asked,
        "round_name": round_name,
    }


def load_company_questions(db: Session, company: str, limit: int = 40) -> List[CompanyQuestion]:
    aliases = resolve_company_names(company)
    if not aliases:
        return []

    filters = [func.lower(CompanyQuestion.company_name) == alias.lower() for alias in aliases]
    return db.query(CompanyQuestion).filter(or_(*filters)).order_by(
        CompanyQuestion.frequency.desc(),
        CompanyQuestion.created_at.desc()
    ).limit(limit).all()


def select_questions_for_rounds(questions: List[CompanyQuestion], question_count: int) -> List[Dict]:
    selected: List[Dict] = []
    used_ids = set()

    for round_name, categories in ROUND_CATEGORY_MAP.items():
        round_questions = [q for q in questions if q.id not in used_ids and q.category in categories]
        if round_questions:
            chosen = round_questions[0]
        else:
            fallback_questions = [q for q in questions if q.id not in used_ids]
            if not fallback_questions:
                continue
            chosen = fallback_questions[0]
        used_ids.add(chosen.id)
        selected.append(serialize_question(chosen, round_name))

    remaining = [q for q in questions if q.id not in used_ids]
    shuffle(remaining)
    for question in remaining:
        if len(selected) >= question_count:
            break
        selected.append(serialize_question(question, "Technical"))

    return selected[:question_count]


@router.get("/api/company-prep/metadata")
def get_company_prep_metadata():
    return {
        "companies": FEATURED_COMPANIES,
        "roles": ROLE_OPTIONS,
        "rounds": list(ROUND_CATEGORY_MAP.keys()),
    }


@router.get("/api/company-questions/{company}")
def get_company_questions_api(company: str, limit: int = 20, db: Session = Depends(get_db)):
    questions = load_company_questions(db, company, limit=limit)
    return {
        "company": company,
        "total": len(questions),
        "questions": [serialize_question(question) for question in questions[:limit]],
    }


@router.get("/api/company-prep/top-questions/{company}")
def get_top_questions_by_company(company: str, limit: int = 20, db: Session = Depends(get_db)):
    questions = load_company_questions(db, company, limit=limit)
    return {
        "company": company,
        "title": f"Top {min(limit, len(questions))} Questions asked in {company}",
        "questions": [serialize_question(question) for question in questions[:limit]],
    }


@router.post("/api/company-prep/session/start")
def start_company_prep_session(
    request: CompanyPrepStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    questions = load_company_questions(db, request.company, limit=max(request.question_count * 3, 20))
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No company questions found for {request.company}"
        )

    selected_questions = select_questions_for_rounds(questions, max(4, min(request.question_count, 10)))

    round_summary = []
    for round_name in ROUND_CATEGORY_MAP.keys():
        round_questions = [question for question in selected_questions if question["round_name"] == round_name]
        if round_questions:
            round_summary.append({
                "name": round_name,
                "question_count": len(round_questions),
            })

    return {
        "session_id": str(uuid4()),
        "company": request.company,
        "role": request.role,
        "user_id": current_user.id,
        "simulation_mode": "real_interview",
        "rounds": round_summary,
        "questions": selected_questions,
        "top_questions": [serialize_question(question) for question in questions[:20]],
    }


@router.post("/api/company-prep/question/explain")
def explain_company_question(request: CompanyQuestionExplainRequest):
    explanation = ai_service.explain_interview_question(
        question=request.question,
        company=request.company or "",
        role=request.role or "",
    )
    return {
        "question": request.question,
        "explanation": explanation,
    }


@router.post("/api/company-prep/answer/evaluate")
def evaluate_company_answer(
    request: CompanyAnswerEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    evaluation = ai_service.evaluate_interview_answer(
        question=request.question,
        answer=request.answer,
        company=request.company,
        role=request.role,
        round_name=request.round_name,
    )

    practice_entry = UserPractice(
        user_id=current_user.id,
        company_name=request.company,
        role=request.role,
        round_name=request.round_name,
        question_text=request.question,
        user_answer=request.answer,
        ai_feedback="\n".join(evaluation.get("improvements", [])) if isinstance(evaluation.get("improvements"), list) else evaluation.get("verdict", ""),
        sample_answer=evaluation.get("sample_answer", ""),
        score=evaluation.get("score", 0),
    )
    db.add(practice_entry)
    db.commit()
    db.refresh(practice_entry)

    average_score = db.query(func.avg(UserPractice.score)).filter(UserPractice.user_id == current_user.id).scalar() or 0

    return {
        "evaluation": evaluation,
        "practice_id": practice_entry.id,
        "average_score": round(float(average_score), 1),
    }


@router.get("/api/company-prep/history", response_model=List[PracticeHistoryItem])
def get_company_prep_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = db.query(UserPractice).filter(
        UserPractice.user_id == current_user.id
    ).order_by(UserPractice.practice_date.desc()).limit(limit).all()
    return history