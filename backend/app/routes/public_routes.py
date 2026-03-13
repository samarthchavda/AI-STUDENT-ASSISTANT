"""Public routes - no authentication required"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models import CompanyQuestion, QuestionCategory, DifficultyLevel

router = APIRouter()

class PublicQuestionResponse(BaseModel):
    id: int
    company_name: str
    question_text: str
    category: str
    difficulty: str
    topic: Optional[str] = None
    year_asked: Optional[str] = None
    frequency: int
    
    class Config:
        from_attributes = True


@router.get("/questions", response_model=List[PublicQuestionResponse])
async def search_company_questions(
    company: str = Query(..., description="Company name to search (e.g., Amazon, Microsoft, TCS)"),
    category: Optional[str] = Query(None, description="Filter by category (technical, coding, hr, etc.)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (easy, medium, hard)"),
    limit: int = Query(20, ge=1, le=100, description="Number of questions to return (max 100)"),
    db: Session = Depends(get_db)
):
    """
    Search top interview questions for a specific company.
    
    This is a powerful public API that helps users prepare for company interviews.
    
    Examples:
    - /questions?company=amazon
    - /questions?company=microsoft&category=coding
    - /questions?company=tcs&difficulty=easy
    - /questions?company=infosys&category=hr&limit=10
    """
    
    # Build query
    query = db.query(CompanyQuestion).filter(
        CompanyQuestion.company_name.ilike(f"%{company}%")
    )
    
    # Apply filters
    if category:
        try:
            cat_enum = QuestionCategory(category.lower())
            query = query.filter(CompanyQuestion.category == cat_enum)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category. Valid options: {', '.join([c.value for c in QuestionCategory])}"
            )
    
    if difficulty:
        try:
            diff_enum = DifficultyLevel(difficulty.lower())
            query = query.filter(CompanyQuestion.difficulty == diff_enum)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty. Valid options: {', '.join([d.value for d in DifficultyLevel])}"
            )
    
    # Order by frequency (most asked first) and limit
    questions = query.order_by(
        CompanyQuestion.frequency.desc(),
        CompanyQuestion.created_at.desc()
    ).limit(limit).all()
    
    if not questions:
        raise HTTPException(
            status_code=404,
            detail=f"No questions found for company: {company}"
        )
    
    return [
        {
            "id": q.id,
            "company_name": q.company_name,
            "question_text": q.question_text,
            "category": q.category.value if hasattr(q.category, 'value') else q.category,
            "difficulty": q.difficulty.value if hasattr(q.difficulty, 'value') else q.difficulty,
            "topic": q.topic,
            "year_asked": q.year_asked,
            "frequency": q.frequency or 1
        }
        for q in questions
    ]


@router.get("/companies")
async def get_available_companies(db: Session = Depends(get_db)):
    """
    Get list of all companies with interview questions in database.
    
    Returns company names with question counts.
    """
    
    companies = db.query(
        CompanyQuestion.company_name,
        func.count(CompanyQuestion.id).label('question_count')
    ).group_by(CompanyQuestion.company_name).order_by(
        func.count(CompanyQuestion.id).desc()
    ).all()
    
    return {
        "total_companies": len(companies),
        "companies": [
            {
                "name": company[0],
                "question_count": company[1]
            }
            for company in companies
        ]
    }


@router.get("/categories")
async def get_question_categories():
    """Get all available question categories"""
    return {
        "categories": [
            {
                "value": cat.value,
                "name": cat.value.replace('_', ' ').title()
            }
            for cat in QuestionCategory
        ]
    }


@router.get("/difficulties")
async def get_difficulty_levels():
    """Get all available difficulty levels"""
    return {
        "difficulties": [
            {
                "value": diff.value,
                "name": diff.value.capitalize()
            }
            for diff in DifficultyLevel
        ]
    }
