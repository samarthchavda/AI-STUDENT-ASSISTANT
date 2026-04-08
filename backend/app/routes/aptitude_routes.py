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
    answers: Dict[int, Optional[str]]  # question_id -> selected_answer (the actual answer text or None for skipped)


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
    limit: int = Query(5, ge=1, le=50, description="Number of questions"),
    current_user = Depends(get_current_user)
):
    """
    Fetch random aptitude questions WITHOUT answers (secure mode).
    
    Features:
    - No-repeat logic: Excludes questions user has already answered
    - Subscription limits: Free users limited to 2 exams per category
    - Answers are only revealed after submission via /submit endpoint.
    
    - **company**: Company name (e.g., "TCS", "Infosys")
    - **difficulty**: Difficulty level - Easy, Medium, Hard (case-insensitive)
    - **limit**: Number of questions to fetch (1-50, default: 5)
    """
    try:
        # Normalize difficulty to match database format (capitalize first letter)
        difficulty_normalized = difficulty.capitalize()
        
        # Check subscription limits for FREE users
        # Handle both enum and string plan types
        user_plan = 'free'  # default
        if hasattr(current_user, 'plan'):
            plan_attr = current_user.plan
            if hasattr(plan_attr, 'value'):
                user_plan = str(plan_attr.value).lower()
            else:
                user_plan = str(plan_attr).lower()
        
        print(f"🔍 User {current_user.id} plan: {user_plan} (type: {type(current_user.plan)})")
        
        if user_plan == 'free':
            # Count previous exams for this user and category
            count_query = """
                SELECT COUNT(*) as exam_count
                FROM aptitude_exam_history
                WHERE user_id = :user_id 
                AND category = (
                    SELECT DISTINCT category 
                    FROM aptitude_questions 
                    WHERE LOWER(company) = LOWER(:company) 
                    LIMIT 1
                )
            """
            
            with engine.connect() as conn:
                result = conn.execute(text(count_query), {
                    "user_id": current_user.id,
                    "company": company
                })
                row = result.fetchone()
                exam_count = row.exam_count if row else 0
                
                print(f"📊 User {current_user.id} has taken {exam_count} exams for company {company}")
                
                # Free users limited to 2 exams per category
                if exam_count >= 2:
                    print(f"🚫 BLOCKING: User {current_user.id} reached limit ({exam_count}/2)")
                    raise HTTPException(
                        status_code=403,
                        detail={
                            "error": "subscription_limit_reached",
                            "message": "Free users can only take 2 exams per category. Upgrade to Pro for unlimited access!",
                            "exams_taken": exam_count,
                            "limit": 2,
                            "plan": "FREE"
                        }
                    )
                else:
                    print(f"✅ ALLOWING: User {current_user.id} can take exam ({exam_count}/2)")
        
        # Get questions user has already answered (no-repeat logic)
        answered_query = """
            SELECT DISTINCT jsonb_array_elements_text(
                questions_data::jsonb
            )::jsonb->>'id' as question_id
            FROM aptitude_exam_history
            WHERE user_id = :user_id
            AND LOWER(company) = LOWER(:company)
        """
        
        answered_ids = []
        try:
            with engine.connect() as conn:
                result = conn.execute(text(answered_query), {
                    "user_id": current_user.id,
                    "company": company
                })
                answered_ids = [int(row.question_id) for row in result.fetchall() if row.question_id]
        except Exception as e:
            print(f"Warning: Could not fetch answered questions: {e}")
            # Continue without filtering if there's an error
        
        # Build query to fetch questions WITHOUT correct_answer and explanation
        # Exclude questions user has already answered
        if answered_ids:
            placeholders = ','.join([f':answered_id{i}' for i in range(len(answered_ids))])
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
                    year_asked
                FROM aptitude_questions
                WHERE LOWER(company) = LOWER(:company)
                AND difficulty = :difficulty
                AND id NOT IN ({placeholders})
                ORDER BY RANDOM() 
                LIMIT :limit
            """
            params = {
                "company": company,
                "difficulty": difficulty_normalized,
                "limit": limit,
                **{f'answered_id{i}': aid for i, aid in enumerate(answered_ids)}
            }
        else:
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
            
            # If no questions found (user answered all), reset and fetch from full pool
            if not rows and answered_ids:
                print(f"User {current_user.id} has answered all questions for {company}. Resetting pool.")
                reset_query = """
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
                result = conn.execute(text(reset_query), {
                    "company": company,
                    "difficulty": difficulty_normalized,
                    "limit": limit
                })
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
    - **answers**: Dictionary of question_id -> selected_answer_text (None for skipped questions)
    """
    try:
        # Validate answers field exists
        if request.answers is None:
            raise HTTPException(
                status_code=400,
                detail="Answers field is required"
            )
        
        # Get all question IDs (even if all are skipped)
        question_ids = list(request.answers.keys())
        
        if not question_ids:
            raise HTTPException(
                status_code=400,
                detail="No questions provided. Please include all question IDs."
            )
        
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


@router.get("/usage-stats")
async def get_usage_stats(current_user = Depends(get_current_user)):
    """Get user's exam usage statistics for all categories"""
    try:
        query = """
            SELECT 
                category,
                COUNT(*) as exam_count
            FROM aptitude_exam_history
            WHERE user_id = :user_id
            GROUP BY category
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(query), {"user_id": current_user.id})
            rows = result.fetchall()
            
            # Build usage stats per category
            usage_by_category = {}
            total_exams = 0
            for row in rows:
                usage_by_category[row.category] = row.exam_count
                total_exams += row.exam_count
            
            # Get user plan
            user_plan = 'free'
            if hasattr(current_user, 'plan'):
                plan_attr = current_user.plan
                if hasattr(plan_attr, 'value'):
                    user_plan = str(plan_attr.value).lower()
                else:
                    user_plan = str(plan_attr).lower()
            
            return {
                "total_exams": total_exams,
                "usage_by_category": usage_by_category,
                "plan": user_plan,
                "limit_per_category": 2 if user_plan == 'free' else None
            }
            
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


@router.get("/attempts-by-company")
async def get_attempts_by_company(current_user = Depends(get_current_user)):
    """Get exam attempt counts by company for the current user"""
    try:
        query = """
            SELECT 
                LOWER(company) as company,
                COUNT(*) as attempt_count
            FROM aptitude_exam_history
            WHERE user_id = :user_id
            GROUP BY LOWER(company)
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(query), {"user_id": current_user.id})
            rows = result.fetchall()
            
            attempts = {}
            for row in rows:
                attempts[row.company] = row.attempt_count
            
            return attempts
            
    except Exception as e:
        print(f"Error fetching attempts by company: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )



# ============================================================================
# FREE UNLIMITED APTITUDE PRACTICE - Fetch questions from database
# ============================================================================

class PracticeQuestionResponse(BaseModel):
    id: str
    question: str
    image: Optional[str]
    has_image: bool
    options: List[Dict[str, str]]  # [{"key": "A", "text": "option text"}]
    answer: str
    explanation: str
    category: str
    subcategory: str
    difficulty: str
    tags: List[str]
    source: Optional[str]


@router.get("/practice-questions")
async def get_practice_questions(
    subcategory: Optional[str] = Query(None, description="Filter by subcategory"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
    limit: int = Query(15, ge=1, le=50, description="Number of questions to fetch"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch aptitude practice questions from database for unlimited free practice.
    No AI generation - questions are pre-loaded in the database.
    """
    try:
        # Build query with filters
        query = """
            SELECT 
                id::text,
                question,
                image,
                has_image,
                options,
                answer,
                explanation,
                category,
                subcategory,
                difficulty,
                tags,
                source
            FROM aptitude_practice_questions
            WHERE 1=1
        """
        params = {}
        
        if subcategory:
            query += " AND LOWER(subcategory) = LOWER(:subcategory)"
            params["subcategory"] = subcategory
        
        if difficulty:
            query += " AND LOWER(difficulty) = LOWER(:difficulty)"
            params["difficulty"] = difficulty
        
        query += " ORDER BY RANDOM() LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = offset
        
        # Get total count for pagination
        count_query = """
            SELECT COUNT(*) 
            FROM aptitude_practice_questions
            WHERE 1=1
        """
        count_params = {}
        
        if subcategory:
            count_query += " AND LOWER(subcategory) = LOWER(:subcategory)"
            count_params["subcategory"] = subcategory
        
        if difficulty:
            count_query += " AND LOWER(difficulty) = LOWER(:difficulty)"
            count_params["difficulty"] = difficulty
        
        with engine.begin() as connection:
            # Get total count
            count_result = connection.execute(text(count_query), count_params)
            total_count = count_result.scalar()
            
            # Get questions
            result = connection.execute(text(query), params)
            rows = result.fetchall()
            
            questions = []
            for row in rows:
                questions.append({
                    "id": row[0],
                    "question": row[1],
                    "image": row[2],
                    "has_image": row[3],
                    "options": row[4],  # Already JSONB
                    "answer": row[5],
                    "explanation": row[6],
                    "category": row[7],
                    "subcategory": row[8],
                    "difficulty": row[9],
                    "tags": row[10] if row[10] else [],
                    "source": row[11]
                })
            
            return {"questions": questions, "total": total_count}
    
    except Exception as e:
        print(f"Error fetching practice questions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch practice questions: {str(e)}")


@router.get("/practice-categories")
async def get_practice_categories(
    current_user: dict = Depends(get_current_user)
):
    """
    Get all available subcategories with question counts for the sidebar.
    """
    try:
        query = """
            SELECT 
                subcategory,
                COUNT(*) as total_questions,
                COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy_count,
                COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium_count,
                COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_count
            FROM aptitude_practice_questions
            GROUP BY subcategory
            ORDER BY subcategory
        """
        
        with engine.begin() as connection:
            result = connection.execute(text(query))
            rows = result.fetchall()
            
            categories = []
            for row in rows:
                categories.append({
                    "subcategory": row[0],
                    "total_questions": row[1],
                    "easy_count": row[2],
                    "medium_count": row[3],
                    "hard_count": row[4]
                })
            
            return {"categories": categories}
    
    except Exception as e:
        print(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")



@router.get("/company-exam-status")
async def get_company_exam_status(current_user = Depends(get_current_user)):
    """Get unlock status for all company exams"""
    from sqlalchemy import text
    from app.core.database import engine
    
    try:
        with engine.connect() as conn:
            query = """
                SELECT 
                    company_key,
                    company_name,
                    is_unlocked
                FROM company_exam_settings
                ORDER BY company_name
            """
            result = conn.execute(text(query))
            status = {}
            
            for row in result:
                status[row.company_key] = {
                    'company_name': row.company_name,
                    'is_unlocked': row.is_unlocked
                }
            
            return status
            
    except Exception as e:
        print(f"Error fetching company exam status: {str(e)}")
        # Return empty dict if table doesn't exist yet
        return {}
