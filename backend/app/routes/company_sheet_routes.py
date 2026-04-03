from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import text
from app.core.auth import get_current_user, require_admin
from app.core.database import engine

router = APIRouter()

class CompanySheet(BaseModel):
    id: int
    company_name: str
    display_name: str
    description: Optional[str]
    logo_url: Optional[str]
    difficulty_level: Optional[str]
    total_questions: int
    is_premium: bool
    completed_questions: int = 0
    progress_percentage: float = 0.0

class CompanySheetQuestion(BaseModel):
    id: int
    question_slug: str
    question_title: str
    question_type: str
    difficulty: str
    topic: str
    is_completed: bool = False
    is_premium: bool = False

@router.get("/list", response_model=List[CompanySheet])
async def get_company_sheets(current_user: dict = Depends(get_current_user)):
    """Get all company sheets with user progress"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            # Get user subscription
            subscription = conn.execute(
                text("SELECT plan_type FROM user_subscriptions WHERE user_id = :user_id"),
                {"user_id": user_id}
            ).fetchone()
            
            is_premium = subscription and subscription[0] in ['premium', 'enterprise']
            
            result = conn.execute(
                text("""
                    SELECT 
                        cs.id, cs.company_name, cs.display_name, cs.description,
                        cs.logo_url, cs.difficulty_level, cs.total_questions, cs.is_premium,
                        COUNT(csp.id) FILTER (WHERE csp.is_completed = TRUE) as completed
                    FROM company_sheets cs
                    LEFT JOIN company_sheet_progress csp 
                        ON cs.id = csp.company_sheet_id AND csp.user_id = :user_id
                    WHERE cs.is_active = TRUE
                    GROUP BY cs.id
                    ORDER BY cs.display_order, cs.company_name
                """),
                {"user_id": user_id}
            )
            
            sheets = []
            for row in result:
                # Hide premium sheets for free users
                if row[7] and not is_premium:
                    continue
                
                completed = row[8] or 0
                total = row[6] or 1
                progress = (completed / total * 100) if total > 0 else 0
                
                sheets.append(CompanySheet(
                    id=row[0],
                    company_name=row[1],
                    display_name=row[2],
                    description=row[3],
                    logo_url=row[4],
                    difficulty_level=row[5],
                    total_questions=total,
                    is_premium=row[7],
                    completed_questions=completed,
                    progress_percentage=round(progress, 1)
                ))
            
            return sheets
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch company sheets: {str(e)}")

@router.get("/{sheet_id}/questions", response_model=List[CompanySheetQuestion])
async def get_sheet_questions(
    sheet_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get questions for a specific company sheet"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            # Check if sheet exists and user has access
            sheet = conn.execute(
                text("""
                    SELECT cs.is_premium, us.plan_type
                    FROM company_sheets cs
                    CROSS JOIN user_subscriptions us
                    WHERE cs.id = :sheet_id AND us.user_id = :user_id
                """),
                {"sheet_id": sheet_id, "user_id": user_id}
            ).fetchone()
            
            if not sheet:
                raise HTTPException(status_code=404, detail="Sheet not found")
            
            is_premium_sheet = sheet[0]
            user_plan = sheet[1]
            has_access = not is_premium_sheet or user_plan in ['premium', 'enterprise']
            
            if not has_access:
                raise HTTPException(status_code=403, detail="Premium subscription required")
            
            # Get questions
            result = conn.execute(
                text("""
                    SELECT 
                        csq.id, csq.question_slug, csq.question_title, csq.question_type,
                        csq.difficulty, csq.topic, csq.is_premium,
                        CASE WHEN csp.is_completed THEN TRUE ELSE FALSE END as is_completed
                    FROM company_sheet_questions csq
                    LEFT JOIN company_sheet_progress csp 
                        ON csq.company_sheet_id = csp.company_sheet_id 
                        AND csq.question_slug = csp.question_slug
                        AND csp.user_id = :user_id
                    WHERE csq.company_sheet_id = :sheet_id
                    ORDER BY csq.display_order, csq.id
                """),
                {"sheet_id": sheet_id, "user_id": user_id}
            )
            
            questions = []
            for row in result:
                questions.append(CompanySheetQuestion(
                    id=row[0],
                    question_slug=row[1],
                    question_title=row[2],
                    question_type=row[3],
                    difficulty=row[4],
                    topic=row[5],
                    is_premium=row[6],
                    is_completed=row[7]
                ))
            
            return questions
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions: {str(e)}")

@router.post("/{sheet_id}/questions/{question_slug}/complete")
async def mark_question_complete(
    sheet_id: int,
    question_slug: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a question as completed"""
    user_id = current_user["id"]
    
    try:
        with engine.connect() as conn:
            # Insert or update progress
            conn.execute(
                text("""
                    INSERT INTO company_sheet_progress 
                    (user_id, company_sheet_id, question_slug, is_completed, completed_at)
                    VALUES (:user_id, :sheet_id, :slug, TRUE, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, company_sheet_id, question_slug)
                    DO UPDATE SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP
                """),
                {"user_id": user_id, "sheet_id": sheet_id, "slug": question_slug}
            )
            conn.commit()
            
            return {"message": "Question marked as completed"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")

# Admin endpoints
@router.post("/admin/create")
async def create_company_sheet(
    company_name: str,
    display_name: str,
    description: Optional[str] = None,
    difficulty_level: Optional[str] = None,
    is_premium: bool = False,
    current_user: dict = Depends(require_admin)
):
    """Admin: Create a new company sheet"""
    
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    INSERT INTO company_sheets 
                    (company_name, display_name, description, difficulty_level, is_premium)
                    VALUES (:name, :display, :desc, :level, :premium)
                    RETURNING id
                """),
                {
                    "name": company_name,
                    "display": display_name,
                    "desc": description,
                    "level": difficulty_level,
                    "premium": is_premium
                }
            )
            sheet_id = result.fetchone()[0]
            conn.commit()
            
            return {"id": sheet_id, "message": "Company sheet created successfully"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create sheet: {str(e)}")

@router.post("/admin/{sheet_id}/add-question")
async def add_question_to_sheet(
    sheet_id: int,
    question_slug: str,
    question_title: str,
    question_type: str,
    difficulty: str,
    topic: str,
    is_premium: bool = False,
    current_user: dict = Depends(require_admin)
):
    """Admin: Add a question to a company sheet"""
    
    try:
        with engine.connect() as conn:
            # Add question
            conn.execute(
                text("""
                    INSERT INTO company_sheet_questions 
                    (company_sheet_id, question_slug, question_title, question_type, difficulty, topic, is_premium)
                    VALUES (:sheet_id, :slug, :title, :type, :difficulty, :topic, :premium)
                """),
                {
                    "sheet_id": sheet_id,
                    "slug": question_slug,
                    "title": question_title,
                    "type": question_type,
                    "difficulty": difficulty,
                    "topic": topic,
                    "premium": is_premium
                }
            )
            
            # Update total count
            conn.execute(
                text("""
                    UPDATE company_sheets
                    SET total_questions = (
                        SELECT COUNT(*) FROM company_sheet_questions WHERE company_sheet_id = :sheet_id
                    )
                    WHERE id = :sheet_id
                """),
                {"sheet_id": sheet_id}
            )
            
            conn.commit()
            
            return {"message": "Question added successfully"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add question: {str(e)}")
