"""
Company Interview Questions Routes
SEO-optimized endpoints for top interview questions by company
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import CompanyQuestion, DifficultyLevel, QuestionCategory
from app.services.ai_service import ai_service
from app.models.schemas import CompanyQuestionRequest, CompanyInsightsRequest
from sqlalchemy import desc, func
from app.core.middleware import rate_limit

router = APIRouter(prefix="/api/companies", tags=["Company Questions - SEO"])

# Pre-defined list of target companies (for SEO)
FEATURED_COMPANIES = [
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Amazon",
    "Microsoft",
    "Google",
    "Apple",
    "Flipkart",
    "Myntra",
    "PayPal",
    "DE Shaw"
]

@router.get("")
def list_companies():
    """Get list of featured companies - great for internal linking (SEO)"""
    return {
        "companies": FEATURED_COMPANIES,
        "total": len(FEATURED_COMPANIES),
        "description": "Top IT companies for engineering campus placements"
    }

@router.get("/{company}/questions")
def get_company_questions(
    company: str,
    difficulty: str = None,
    category: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all interview questions for a specific company
    
    SEO Keywords:
    - TCS interview questions
    - Amazon interview questions
    - Microsoft interview questions
    """
    
    company_normalized = company.strip()
    
    # Build query
    query = db.query(CompanyQuestion).filter(
        func.lower(CompanyQuestion.company_name) == func.lower(company_normalized)
    )
    
    # Apply filters
    if difficulty:
        try:
            diff_enum = DifficultyLevel[difficulty.upper()]
            query = query.filter(CompanyQuestion.difficulty == diff_enum)
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid difficulty: {difficulty}")
    
    if category:
        try:
            cat_enum = QuestionCategory[category.upper()]
            query = query.filter(CompanyQuestion.category == cat_enum)
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    # Sort by frequency (most asked first) then by difficulty
    questions = query.order_by(
        desc(CompanyQuestion.frequency),
        CompanyQuestion.difficulty
    ).limit(limit).all()
    
    if not questions:
        return {
            "company": company_normalized,
            "questions": [],
            "total": 0,
            "message": f"No questions found for {company_normalized}. Be the first to add one!"
        }
    
    return {
        "company": company_normalized,
        "questions": [
            {
                "id": q.id,
                "question": q.question_text,
                "category": q.category,
                "difficulty": q.difficulty,
                "frequency": q.frequency,
                "topic": q.topic,
                "year": q.year_asked
            }
            for q in questions
        ],
        "total": len(questions),
        "filtered_by": {
            "difficulty": difficulty,
            "category": category
        }
    }

@router.get("/{company}/top-questions")
@rate_limit("20/minute")  # 20 requests per minute to prevent AI spam
def get_top_questions(
    request: Request,
    company: str,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get TOP 20 most frequently asked questions for a company
    
    Perfect for SEO: "Top 20 Amazon interview questions"
    """
    
    company_normalized = company.strip()
    
    # Get top questions sorted by frequency
    questions = db.query(CompanyQuestion).filter(
        func.lower(CompanyQuestion.company_name) == func.lower(company_normalized)
    ).order_by(
        desc(CompanyQuestion.frequency),
        CompanyQuestion.difficulty
    ).limit(limit).all()
    
    if not questions:
        return {
            "company": company_normalized,
            "top_questions": [],
            "message": f"Database building! No top questions yet for {company_normalized}"
        }
    
    # Generate AI insights about these questions
    insights = ai_service.get_company_insights(company_normalized, db=db)
    
    return {
        "company": company_normalized,
        "top_questions": [
            {
                "rank": i + 1,
                "question": q.question_text,
                "category": q.category,
                "difficulty": q.difficulty,
                "frequency": q.frequency,
                "topic": q.topic,
                "year": q.year_asked
            }
            for i, q in enumerate(questions[:limit])
        ],
        "total_questions_in_db": db.query(CompanyQuestion).filter(
            func.lower(CompanyQuestion.company_name) == func.lower(company_normalized)
        ).count(),
        "ai_insights": insights.get('insights', ''),
        "seo_keywords": insights.get('seo_keywords', [])
    }

@router.get("/{company}/insights")
@rate_limit("10/minute")  # 10 requests per minute for AI-heavy insights
def get_company_insights_endpoint(
    request: Request,
    company: str,
    db: Session = Depends(get_db)
):
    """
    Get AI-generated insights about interview patterns at a company
    Includes top topics, difficulty distribution, tips, etc.
    
    Great page for: "How to ace Amazon interviews" type searches
    """
    
    company_normalized = company.strip()
    
    # Get all questions for this company
    all_questions = db.query(CompanyQuestion).filter(
        func.lower(CompanyQuestion.company_name) == func.lower(company_normalized)
    ).all()
    
    if not all_questions:
        return {
            "company": company_normalized,
            "error": f"No data yet for {company_normalized}",
            "message": "Help build the database by adding questions!"
        }
    
    # Analyze distribution
    by_category = {}
    by_difficulty = {"easy": 0, "medium": 0, "hard": 0}
    
    for q in all_questions:
        cat = q.category or "other"
        if cat not in by_category:
            by_category[cat] = 0
        by_category[cat] += 1
        
        if q.difficulty:
            by_difficulty[str(q.difficulty).lower()] += 1
    
    # Get AI insights (pass db session for direct database queries)
    insights = ai_service.get_company_insights(company_normalized, db=db)
    
    return {
        "company": company_normalized,
        "total_questions": len(all_questions),
        "distribution": {
            "by_category": by_category,
            "by_difficulty": by_difficulty
        },
        "most_common_topic": max(
            set(q.topic for q in all_questions if q.topic),
            key=[q.topic for q in all_questions if q.topic].count
        ) if any(q.topic for q in all_questions) else "DSA",
        "insights": insights.get('insights', ''),
        "seo_keywords": insights.get('seo_keywords', []),
        "preparation_guide": f"""
## How to Crack {company_normalized} Interview

1. **Understand Their Pattern**: {len(all_questions)} questions analyzed
2. **Focus Areas**: {', '.join(list(by_category.keys())[:3])}
3. **Difficulty Mix**: {by_difficulty}
4. **Preparation Timeline**: 4-6 weeks focused prep
5. **Success Rate Boosters**:
   - Practice similar {company_normalized} questions
   - System design practice (if role requires)
   - Mock interviews specific to {company_normalized}
"""
    }

@router.post("/{company}/questions")
def add_company_question(
    company: str,
    question_data: CompanyQuestionRequest,
    db: Session = Depends(get_db)
):
    """Add a new interview question to the database (crowdsourced)
    
    Help build the largest question database for Indian placements!
    """
    
    company_normalized = company.strip()
    
    # Check if question already exists
    existing = db.query(CompanyQuestion).filter(
        func.lower(CompanyQuestion.company_name) == func.lower(company_normalized),
        func.lower(CompanyQuestion.question_text) == func.lower(question_data.question_text)
    ).first()
    
    if existing:
        # Just increment frequency
        existing.frequency += 1
        db.commit()
        return {
            "action": "updated",
            "message": "Question already exists. Frequency increased.",
            "frequency": existing.frequency
        }
    
    # Create new question
    new_question = CompanyQuestion(
        company_name=company_normalized,
        question_text=question_data.question_text,
        category=question_data.category or QuestionCategory.DSA,
        difficulty=question_data.difficulty or DifficultyLevel.MEDIUM,
        topic=question_data.topic,
        year_asked=question_data.year_asked,
        solution_outline=question_data.solution_outline,
        frequency=1
    )
    
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    return {
        "action": "created",
        "message": f"Question added for {company_normalized}",
        "question_id": new_question.id,
        "question": new_question.question_text
    }

@router.get("/{company}/stats")
def get_company_stats(
    company: str,
    db: Session = Depends(get_db)
):
    """Get statistics about questions for a company (for dashboard)"""
    
    company_normalized = company.strip()
    
    questions = db.query(CompanyQuestion).filter(
        func.lower(CompanyQuestion.company_name) == func.lower(company_normalized)
    ).all()
    
    if not questions:
        return {
            "company": company_normalized,
            "stats": {
                "total": 0,
                "categories": 0,
                "message": "No data yet"
            }
        }
    
    # Calculate stats
    categories = set(q.category for q in questions if q.category)
    difficulties = {"easy": 0, "medium": 0, "hard": 0}
    total_frequency = 0
    
    for q in questions:
        if q.difficulty:
            difficulties[str(q.difficulty).lower()] += 1
        total_frequency += q.frequency
    
    return {
        "company": company_normalized,
        "stats": {
            "total_questions": len(questions),
            "unique_categories": len(categories),
            "difficulty_distribution": difficulties,
            "total_times_asked": total_frequency,
            "average_frequency": total_frequency / len(questions) if questions else 0,
            "categories": list(categories)
        },
        "seo_value": "High - great for ranking on company interview keywords"
    }
