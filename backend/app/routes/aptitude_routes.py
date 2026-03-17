from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict
from pydantic import BaseModel
from sqlalchemy import text
from app.core.database import engine
import uuid

router = APIRouter(prefix="/api/aptitude", tags=["aptitude"])


# Response model WITHOUT sensitive data (for initial test fetch)
class AptitudeQuestionSecure(BaseModel):
    id: int
    company: str
    category: str
    difficulty: str
    question: str
    options: List[str]
    year_asked: Optional[str] = None


# Response model WITH sensitive data (for results after submission)
class AptitudeQuestionWithAnswer(BaseModel):
    id: int
    company: str
    category: str
    difficulty: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    year_asked: Optional[str] = None
    user_answer: Optional[str] = None
    is_correct: Optional[bool] = None


class AptitudeTestResponse(BaseModel):
    questions: List[AptitudeQuestionSecure]
    total_count: int
    session_id: str  # To track the test session


class SubmitAnswerRequest(BaseModel):
    session_id: str
    answers: Dict[int, str]  # question_id -> selected_answer (the actual answer text)


class SubmitAnswerResponse(BaseModel):
    score: int
    total_questions: int
    correct: int
    wrong: int
    skipped: int
    score_percent: float
    questions: List[AptitudeQuestionWithAnswer]


@router.get("/test", response_model=AptitudeTestResponse)
async def get_aptitude_test(
    company: str = Query(..., description="Company name"),
    difficulty: str = Query(..., description="Difficulty level - Easy, Medium, Hard"),
    limit: int = Query(5, ge=1, le=50, description="Number of questions")
):
    """
    Fetch random aptitude questions WITHOUT answers (secure mode).
    Answers are only revealed after submission via /submit endpoint.
    
    - **company**: Company name (e.g., "TCS", "Infosys")
    - **difficulty**: Difficulty level - Easy, Medium, Hard (case-insensitive)
    - **limit**: Number of questions to fetch (1-50, default: 5)
    """
    try:
        # Normalize difficulty to match database format (capitalize first letter)
        difficulty_normalized = difficulty.capitalize()
        
        # Build query to fetch questions WITHOUT correct_answer and explanation
        query = """
            SELECT 
                id, 
                company, 
                category, 
                difficulty, 
                question,
                option_a, 
                option_b, 
                option_c, 
                option_d,
                year_asked
            FROM aptitude_questions
            WHERE LOWER(company) = LOWER(:company)
            AND difficulty = :difficulty
            ORDER BY RANDOM() 
            LIMIT :limit
        """
        
        params = {
            "company": company,
            "difficulty": difficulty_normalized,
            "limit": limit
        }
        
        with engine.connect() as conn:
            result = conn.execute(text(query), params)
            rows = result.fetchall()
            
            if not rows:
                raise HTTPException(
                    status_code=404,
                    detail=f"No questions found for company: {company} with difficulty: {difficulty}"
                )
            
            # Generate session ID for this test
            session_id = str(uuid.uuid4())
            
            # Transform data: group options into array WITHOUT correct answer
            questions = []
            for row in rows:
                question_data = AptitudeQuestionSecure(
                    id=row.id,
                    company=row.company,
                    category=row.category,
                    difficulty=row.difficulty,
                    question=row.question,
                    options=[
                        row.option_a,
                        row.option_b,
                        row.option_c,
                        row.option_d
                    ],
                    year_asked=row.year_asked
                )
                questions.append(question_data)
            
            return AptitudeTestResponse(
                questions=questions,
                total_count=len(questions),
                session_id=session_id
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


@router.post("/submit", response_model=SubmitAnswerResponse)
async def submit_answers(request: SubmitAnswerRequest = Body(...)):
    """
    Submit answers and get results with correct answers and explanations.
    This is the ONLY endpoint that reveals correct answers.
    
    - **session_id**: Session ID from the test fetch
    - **answers**: Dictionary of question_id -> selected_answer_text
    """
    try:
        if not request.answers:
            raise HTTPException(
                status_code=400,
                detail="No answers provided"
            )
        
        question_ids = list(request.answers.keys())
        
        # Fetch correct answers from database
        placeholders = ','.join([f':id{i}' for i in range(len(question_ids))])
        query = f"""
            SELECT 
                id, 
                company, 
                category, 
                difficulty, 
                question,
                option_a, 
                option_b, 
                option_c, 
                option_d,
                correct_answer,
                explanation,
                year_asked
            FROM aptitude_questions
            WHERE id IN ({placeholders})
        """
        
        params = {f'id{i}': qid for i, qid in enumerate(question_ids)}
        
        with engine.connect() as conn:
            result = conn.execute(text(query), params)
            rows = result.fetchall()
            
            if not rows:
                raise HTTPException(
                    status_code=404,
                    detail="Questions not found"
                )
            
            # Calculate score and build response
            correct_count = 0
            wrong_count = 0
            skipped_count = 0
            questions_with_answers = []
            
            for row in rows:
                user_answer = request.answers.get(row.id)
                is_correct = False
                
                if user_answer is None:
                    skipped_count += 1
                elif user_answer == row.correct_answer:
                    correct_count += 1
                    is_correct = True
                else:
                    wrong_count += 1
                
                question_data = AptitudeQuestionWithAnswer(
                    id=row.id,
                    company=row.company,
                    category=row.category,
                    difficulty=row.difficulty,
                    question=row.question,
                    options=[
                        row.option_a,
                        row.option_b,
                        row.option_c,
                        row.option_d
                    ],
                    correct_answer=row.correct_answer,
                    explanation=row.explanation or "No explanation available",
                    year_asked=row.year_asked,
                    user_answer=user_answer,
                    is_correct=is_correct
                )
                questions_with_answers.append(question_data)
            
            total_questions = len(rows)
            score_percent = round((correct_count / total_questions) * 100, 2) if total_questions > 0 else 0
            
            return SubmitAnswerResponse(
                score=correct_count,
                total_questions=total_questions,
                correct=correct_count,
                wrong=wrong_count,
                skipped=skipped_count,
                score_percent=score_percent,
                questions=questions_with_answers
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing submission: {str(e)}"
        )


@router.get("/companies", response_model=List[str])
async def get_companies():
    """Get list of all unique companies in the aptitude questions database"""
    try:
        query = "SELECT DISTINCT company FROM aptitude_questions ORDER BY company"
        
        with engine.connect() as conn:
            result = conn.execute(text(query))
            companies = [row.company for row in result.fetchall()]
            
            return companies
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


@router.get("/categories", response_model=List[str])
async def get_categories(company: Optional[str] = Query(None)):
    """Get list of all unique categories, optionally filtered by company"""
    try:
        if company:
            query = "SELECT DISTINCT category FROM aptitude_questions WHERE company = :company ORDER BY category"
            params = {"company": company}
        else:
            query = "SELECT DISTINCT category FROM aptitude_questions ORDER BY category"
            params = {}
        
        with engine.connect() as conn:
            result = conn.execute(text(query), params)
            categories = [row.category for row in result.fetchall()]
            
            return categories
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


@router.get("/stats")
async def get_stats(company: Optional[str] = Query(None)):
    """Get statistics about available questions"""
    try:
        if company:
            query = """
                SELECT 
                    COUNT(*) as total,
                    COUNT(DISTINCT category) as categories,
                    COUNT(CASE WHEN difficulty = 'Easy' THEN 1 END) as easy,
                    COUNT(CASE WHEN difficulty = 'Medium' THEN 1 END) as medium,
                    COUNT(CASE WHEN difficulty = 'Hard' THEN 1 END) as hard
                FROM aptitude_questions
                WHERE company = :company
            """
            params = {"company": company}
        else:
            query = """
                SELECT 
                    COUNT(*) as total,
                    COUNT(DISTINCT company) as companies,
                    COUNT(DISTINCT category) as categories,
                    COUNT(CASE WHEN difficulty = 'Easy' THEN 1 END) as easy,
                    COUNT(CASE WHEN difficulty = 'Medium' THEN 1 END) as medium,
                    COUNT(CASE WHEN difficulty = 'Hard' THEN 1 END) as hard
                FROM aptitude_questions
            """
            params = {}
        
        with engine.connect() as conn:
            result = conn.execute(text(query), params)
            row = result.fetchone()
            
            stats = {
                "total_questions": row.total,
                "easy": row.easy,
                "medium": row.medium,
                "hard": row.hard
            }
            
            if company:
                stats["categories"] = row.categories
            else:
                stats["companies"] = row.companies
                stats["categories"] = row.categories
            
            return stats
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )
