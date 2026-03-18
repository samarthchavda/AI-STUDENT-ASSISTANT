from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import List, Optional, Dict
from pydantic import BaseModel
from sqlalchemy import text
from app.core.database import engine
from app.core.auth import get_current_user
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
async def submit_answers(
    request: SubmitAnswerRequest = Body(...),
    current_user = Depends(get_current_user)
):
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
            
            # Store company, category, difficulty from first question
            company = rows[0].company if rows else "Unknown"
            category = rows[0].category if rows else "Unknown"
            difficulty = rows[0].difficulty if rows else "Medium"
            
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
            
            # Save exam history to database
            import json
            from datetime import datetime
            
            questions_json = json.dumps([{
                "id": q.id,
                "question": q.question,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "user_answer": q.user_answer,
                "is_correct": q.is_correct,
                "explanation": q.explanation
            } for q in questions_with_answers])
            
            insert_query = """
                INSERT INTO aptitude_exam_history 
                (user_id, company, category, difficulty, score, total_questions, correct, wrong, skipped, score_percent, exam_date, questions_data)
                VALUES (:user_id, :company, :category, :difficulty, :score, :total_questions, :correct, :wrong, :skipped, :score_percent, :exam_date, :questions_data)
            """
            
            insert_params = {
                "user_id": current_user.id,
                "company": company,
                "category": category,
                "difficulty": difficulty,
                "score": correct_count,
                "total_questions": total_questions,
                "correct": correct_count,
                "wrong": wrong_count,
                "skipped": skipped_count,
                "score_percent": score_percent,
                "exam_date": datetime.now(),
                "questions_data": questions_json
            }
            
            try:
                conn.execute(text(insert_query), insert_params)
                conn.commit()
            except Exception as e:
                print(f"Failed to save exam history: {str(e)}")
                # Continue even if history save fails
            
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


@router.get("/history")
async def get_exam_history(current_user = Depends(get_current_user)):
    """Get user's exam history"""
    try:
        # First check if table exists
        check_table_query = """
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'aptitude_exam_history'
            )
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(check_table_query))
            table_exists = result.scalar()
            
            if not table_exists:
                print("⚠️ aptitude_exam_history table does not exist")
                return []
            
            query = """
                SELECT 
                    id,
                    company,
                    category,
                    difficulty,
                    score,
                    total_questions,
                    correct,
                    wrong,
                    skipped,
                    score_percent,
                    exam_date
                FROM aptitude_exam_history
                WHERE user_id = :user_id
                ORDER BY exam_date DESC
                LIMIT 50
            """
            
            result = conn.execute(text(query), {"user_id": current_user.id})
            rows = result.fetchall()
            
            history = []
            for row in rows:
                history.append({
                    "id": row.id,
                    "company": row.company,
                    "category": row.category,
                    "difficulty": row.difficulty,
                    "score": row.score,
                    "total_questions": row.total_questions,
                    "correct": row.correct,
                    "wrong": row.wrong,
                    "skipped": row.skipped,
                    "score_percent": float(row.score_percent),
                    "exam_date": row.exam_date.isoformat() if hasattr(row.exam_date, 'isoformat') else str(row.exam_date)
                })
            
            return history
            
    except Exception as e:
        print(f"Error fetching exam history: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


@router.get("/history/{exam_id}")
async def get_exam_details(exam_id: int, current_user = Depends(get_current_user)):
    """Get detailed results for a specific exam including all questions and answers"""
    try:
        # Get exam details
        exam_query = """
            SELECT 
                id,
                company,
                category,
                difficulty,
                score,
                total_questions,
                correct,
                wrong,
                skipped,
                score_percent,
                exam_date,
                questions_data
            FROM aptitude_exam_history
            WHERE id = :exam_id AND user_id = :user_id
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(exam_query), {"exam_id": exam_id, "user_id": current_user.id})
            exam_row = result.fetchone()
            
            if not exam_row:
                raise HTTPException(
                    status_code=404,
                    detail="Exam not found"
                )
            
            # Parse questions data (stored as JSON)
            import json
            questions_data = json.loads(exam_row.questions_data) if exam_row.questions_data else []
            
            return {
                "exam": {
                    "id": exam_row.id,
                    "company": exam_row.company,
                    "category": exam_row.category,
                    "difficulty": exam_row.difficulty,
                    "score": exam_row.score,
                    "total_questions": exam_row.total_questions,
                    "correct": exam_row.correct,
                    "wrong": exam_row.wrong,
                    "skipped": exam_row.skipped,
                    "score_percent": exam_row.score_percent,
                    "exam_date": exam_row.exam_date.isoformat() if hasattr(exam_row.exam_date, 'isoformat') else str(exam_row.exam_date)
                },
                "questions": questions_data
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

