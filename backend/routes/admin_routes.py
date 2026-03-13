"""Admin routes for managing application data"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
import csv
import io

from database import get_db
from models import User, ChatHistory, UserProgress, Payment, PlanType, CompanyQuestion, QuestionCategory, DifficultyLevel
from auth import get_current_user

router = APIRouter()

# Response models
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    plan: str
    is_google_user: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    role: str
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class UserProgressResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    subject: str
    topic: str
    score: int
    completed_at: datetime
    
    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    plan: str
    amount: int
    currency: str
    status: str
    payment_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminStatsResponse(BaseModel):
    total_users: int
    free_users: int
    basic_users: int
    pro_users: int
    google_users: int
    regular_users: int
    total_chats: int
    total_payments: int
    total_revenue: int
    total_company_questions: int
    questions_by_company: Dict[str, int]
    total_languages_used: Dict[str, int]
    
class CompanyQuestionResponse(BaseModel):
    id: int
    company_name: str
    question_text: str
    category: str
    difficulty: str
    frequency: int
    topic: Optional[str] = None
    year_asked: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
    
# Dependency to check if user is admin
async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admin access required."
        )
    return current_user

# Admin stats endpoint
@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get overall application statistics"""
    
    total_users = db.query(User).count()
    free_users = db.query(User).filter(User.plan == PlanType.FREE).count()
    basic_users = db.query(User).filter(User.plan == PlanType.BASIC).count()
    pro_users = db.query(User).filter(User.plan == PlanType.PRO).count()
    google_users = db.query(User).filter(User.is_google_user == True).count()
    regular_users = db.query(User).filter(User.is_google_user == False).count()
    total_chats = db.query(ChatHistory).count()
    total_payments = db.query(Payment).filter(Payment.status == "completed").count()
    
    # Calculate total revenue
    payments = db.query(Payment).filter(Payment.status == "completed").all()
    total_revenue = sum(p.amount for p in payments)
    
    # Company Questions Statistics
    total_company_questions = db.query(CompanyQuestion).count()
    
    # Questions by company (with count)
    questions_by_company_rows = db.query(
        CompanyQuestion.company_name, 
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.company_name).all()
    questions_by_company = {row[0]: row[1] for row in questions_by_company_rows}
    
    # Languages used in chat (english, hindi, gujarati)
    language_rows = db.query(
        ChatHistory.language,
        func.count(ChatHistory.id).label('count')
    ).group_by(ChatHistory.language).all()
    total_languages_used = {row[0]: row[1] for row in language_rows}
    
    return {
        "total_users": total_users,
        "free_users": free_users,
        "basic_users": basic_users,
        "pro_users": pro_users,
        "google_users": google_users,
        "regular_users": regular_users,
        "total_chats": total_chats,
        "total_payments": total_payments,
        "total_revenue": total_revenue,
        "total_company_questions": total_company_questions,
        "questions_by_company": questions_by_company,
        "total_languages_used": total_languages_used
    }

# Get all users with pagination count and search
@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all users with pagination count and optional search by email"""
    query = db.query(User)
    
    # Apply search filter if provided
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    
    # Get total count
    total = query.count()
    
    # Get paginated users
    users = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "plan": user.plan.value if hasattr(user.plan, 'value') else user.plan,
                "is_google_user": user.is_google_user,
                "is_admin": user.is_admin,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
            for user in users
        ]
    }

# Get all chat history
@router.get("/chats", response_model=List[ChatHistoryResponse])
async def get_all_chats(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all chat history"""
    chats = db.query(ChatHistory).offset(skip).limit(limit).all()
    
    result = []
    for chat in chats:
        result.append({
            "id": chat.id,
            "user_id": chat.user_id,
            "user_name": chat.user.name,
            "user_email": chat.user.email,
            "role": chat.role,
            "content": chat.content,
            "timestamp": chat.timestamp
        })
    
    return result

# Get all user progress
@router.get("/progress", response_model=List[UserProgressResponse])
async def get_all_progress(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all user progress"""
    progress = db.query(UserProgress).offset(skip).limit(limit).all()
    
    result = []
    for p in progress:
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "user_name": p.user.name,
            "user_email": p.user.email,
            "subject": p.subject,
            "topic": p.topic,
            "score": p.score,
            "completed_at": p.completed_at
        })
    
    return result

# Get all payments
@router.get("/payments", response_model=List[PaymentResponse])
async def get_all_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all payments"""
    payments = db.query(Payment).offset(skip).limit(limit).all()
    
    result = []
    for payment in payments:
        result.append({
            "id": payment.id,
            "user_id": payment.user_id,
            "user_name": payment.user.name,
            "user_email": payment.user.email,
            "plan": payment.plan.value if hasattr(payment.plan, 'value') else payment.plan,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status,
            "payment_id": payment.payment_id,
            "created_at": payment.created_at
        })
    
    return result

# Update user plan
@router.put("/users/{user_id}/plan")
async def update_user_plan(
    user_id: int,
    plan: PlanType,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Update a user's subscription plan"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.plan = plan
    db.commit()
    
    return {"message": f"User {user.name} plan updated to {plan.value}"}

# Delete user
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Delete a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin users")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.name} deleted successfully"}

# Get all company questions (SEO Feature)
@router.get("/company-questions", response_model=List[CompanyQuestionResponse])
async def get_all_company_questions(
    skip: int = 0,
    limit: int = 100,
    company: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get all interview questions in database (with optional company filter)"""
    query = db.query(CompanyQuestion)
    
    if company:
        query = query.filter(CompanyQuestion.company_name.ilike(f"%{company}%"))
    
    questions = query.order_by(CompanyQuestion.frequency.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": question.id,
            "company_name": question.company_name,
            "question_text": question.question_text,
            "category": question.category.value if hasattr(question.category, "value") else question.category,
            "difficulty": question.difficulty.value if hasattr(question.difficulty, "value") else question.difficulty,
            "frequency": question.frequency or 0,
            "topic": question.topic,
            "year_asked": question.year_asked,
            "created_at": question.created_at,
        }
        for question in questions
    ]

# Get company questions statistics
@router.get("/company-questions/stats")
async def get_company_questions_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get statistics about company questions database"""
    
    total_questions = db.query(CompanyQuestion).count()
    
    # Questions by company
    by_company = db.query(
        CompanyQuestion.company_name,
        func.count(CompanyQuestion.id).label('count'),
        func.sum(CompanyQuestion.frequency).label('total_frequency')
    ).group_by(CompanyQuestion.company_name).all()
    
    # Questions by difficulty
    by_difficulty = db.query(
        CompanyQuestion.difficulty,
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.difficulty).all()
    
    # Questions by category
    by_category = db.query(
        CompanyQuestion.category,
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.category).all()
    
    # Top topics
    top_topics = db.query(
        CompanyQuestion.topic,
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.topic).order_by(
        func.count(CompanyQuestion.id).desc()
    ).limit(10).all()
    
    return {
        "total_questions": total_questions,
        "by_company": [{"company": row[0], "count": row[1], "total_frequency": row[2]} for row in by_company],
        "by_difficulty": [{"difficulty": row[0], "count": row[1]} for row in by_difficulty],
        "by_category": [{"category": row[0], "count": row[1]} for row in by_category],
        "top_topics": [{"topic": row[0], "count": row[1]} for row in top_topics]
    }

# Get detailed dashboard
@router.get("/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get comprehensive admin dashboard with all data"""
    
    # User stats
    total_users = db.query(User).count()
    new_users_today = db.query(User).filter(
        func.date(User.created_at) == func.date(func.now())
    ).count()
    
    # Plan distribution
    plan_dist = db.query(
        User.plan,
        func.count(User.id).label('count')
    ).group_by(User.plan).all()
    
    # Chat activity
    total_chats = db.query(ChatHistory).count()
    chats_today = db.query(ChatHistory).filter(
        func.date(ChatHistory.timestamp) == func.date(func.now())
    ).count()
    
    # Revenue
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed"
    ).scalar() or 0
    
    pending_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "pending"
    ).scalar() or 0
    
    # Company Questions
    total_questions = db.query(CompanyQuestion).count()
    top_companies = db.query(
        CompanyQuestion.company_name,
        func.count(CompanyQuestion.id).label('count')
    ).group_by(CompanyQuestion.company_name).order_by(
        func.count(CompanyQuestion.id).desc()
    ).limit(5).all()
    
    return {
        "timestamp": datetime.utcnow(),
        "users": {
            "total": total_users,
            "new_today": new_users_today,
            "by_plan": [{"plan": row[0].value if hasattr(row[0], 'value') else row[0], "count": row[1]} for row in plan_dist]
        },
        "chat": {
            "total_messages": total_chats,
            "messages_today": chats_today
        },
        "revenue": {
            "total_completed": total_revenue,
            "pending": pending_revenue,
            "currency": "INR"
        },
        "company_questions": {
            "total": total_questions,
            "top_companies": [{"company": row[0], "questions": row[1]} for row in top_companies]
        }
    }


# Bulk upload company questions from CSV file
@router.post("/company-questions/bulk-upload")
async def bulk_upload_company_questions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Bulk upload company interview questions from CSV file."""
    
    try:
        if not file.filename or not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="Please upload a CSV file")

        content = await file.read()
        text = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))

        added_count = 0
        updated_count = 0
        skipped_count = 0
        errors = []

        def normalize_category(value: str):
            if not value:
                return QuestionCategory.TECHNICAL
            normalized = value.strip().lower().replace(' ', '_')
            mapping = {
                'type': QuestionCategory.TECHNICAL,
                'technical': QuestionCategory.TECHNICAL,
                'coding': QuestionCategory.CODING,
                'hr': QuestionCategory.HR,
                'behavioral': QuestionCategory.BEHAVIORAL,
                'aptitude': QuestionCategory.APTITUDE,
                'system_design': QuestionCategory.SYSTEM_DESIGN,
                'system design': QuestionCategory.SYSTEM_DESIGN,
                'dsa': QuestionCategory.DSA,
            }
            return mapping.get(normalized, QuestionCategory.TECHNICAL)

        def normalize_difficulty(value: str):
            if not value:
                return DifficultyLevel.MEDIUM
            normalized = value.strip().lower()
            if normalized == 'easy':
                return DifficultyLevel.EASY
            if normalized == 'hard':
                return DifficultyLevel.HARD
            return DifficultyLevel.MEDIUM

        for index, row in enumerate(reader, start=2):
            try:
                company_name = (row.get('company') or row.get('COMPANY') or '').strip()
                question_text = (row.get('question') or row.get('QUESTION') or '').strip()
                category_raw = (row.get('category') or row.get('type') or row.get('CATEGORY') or row.get('TYPE') or '').strip()
                difficulty_raw = (row.get('difficulty') or row.get('DIFFICULTY') or '').strip()
                topic = (row.get('topic') or row.get('TOPIC') or row.get('role') or row.get('ROLE') or 'General').strip()
                year_asked = (row.get('year') or row.get('year_asked') or row.get('YEAR') or '').strip() or None

                if not company_name or not question_text:
                    skipped_count += 1
                    errors.append(f"Row {index}: Missing company or question")
                    continue

                existing = db.query(CompanyQuestion).filter(
                    CompanyQuestion.company_name.ilike(company_name),
                    CompanyQuestion.question_text.ilike(question_text)
                ).first()

                if existing:
                    existing.frequency = (existing.frequency or 0) + 1
                    if topic and existing.topic != topic:
                        existing.topic = topic
                    if year_asked and not existing.year_asked:
                        existing.year_asked = year_asked
                    updated_count += 1
                else:
                    new_question = CompanyQuestion(
                        company_name=company_name,
                        question_text=question_text,
                        category=normalize_category(category_raw),
                        difficulty=normalize_difficulty(difficulty_raw),
                        frequency=1,
                        topic=topic or 'General',
                        year_asked=year_asked
                    )
                    db.add(new_question)
                    added_count += 1

            except Exception as e:
                skipped_count += 1
                errors.append(f"Row {index}: {str(e)}")

        db.commit()

        return {
            "status": "success",
            "total_processed": added_count + updated_count + skipped_count,
            "added_new": added_count,
            "updated_existing": updated_count,
            "skipped": skipped_count,
            "errors": errors if errors else None,
            "message": f"Processed {added_count + updated_count} questions successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing file: {str(e)}"
        )


# Delete a company question
@router.delete("/company-questions/{question_id}")
async def delete_company_question(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Delete a specific company question"""
    question = db.query(CompanyQuestion).filter(CompanyQuestion.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(question)
    db.commit()
    
    return {"message": f"Question deleted successfully", "id": question_id}


# Add a new company question manually
class CompanyQuestionCreate(BaseModel):
    company_name: str
    question_text: str
    category: QuestionCategory = QuestionCategory.TECHNICAL
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    topic: str = "General"
    year_asked: Optional[str] = None
    frequency: int = 1

@router.post("/company-questions", response_model=CompanyQuestionResponse)
async def add_company_question(
    question: CompanyQuestionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Add a new company question manually"""
    
    # Check if question already exists
    existing = db.query(CompanyQuestion).filter(
        CompanyQuestion.company_name.ilike(question.company_name),
        CompanyQuestion.question_text.ilike(question.question_text)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Question already exists for this company"
        )
    
    new_question = CompanyQuestion(
        company_name=question.company_name,
        question_text=question.question_text,
        category=question.category,
        difficulty=question.difficulty,
        topic=question.topic,
        year_asked=question.year_asked,
        frequency=question.frequency
    )
    
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    return {
        "id": new_question.id,
        "company_name": new_question.company_name,
        "question_text": new_question.question_text,
        "category": new_question.category.value,
        "difficulty": new_question.difficulty.value,
        "frequency": new_question.frequency,
        "topic": new_question.topic,
        "year_asked": new_question.year_asked,
        "created_at": new_question.created_at
    }


# Get sample CSV template for bulk upload
@router.get("/company-questions/sample-template")
async def get_sample_template(admin: User = Depends(get_admin_user)):
    """Get sample CSV template for bulk uploading questions."""
    
    sample = """company,role,question,category,difficulty,topic,year
Microsoft,Software Engineer,Explain Object Oriented Programming concepts,technical,medium,OOP,2024
Microsoft,Software Engineer,Reverse a linked list,coding,medium,Linked Lists,2024
Amazon,SDE,Explain Amazon leadership principles,hr,easy,Leadership,2024
Amazon,SDE,What is load balancing,technical,hard,System Design,2024
TCS,Fresher,What is SDLC,technical,easy,Software Development,2024
Infosys,Fresher,Explain ACID properties,technical,medium,Databases,2024
"""
    
    return {
        "template": sample,
        "instructions": [
            "1. Keep the first row as CSV headers",
            "2. Required columns: company, question",
            "3. Supported optional columns: role, category, type, difficulty, topic, year",
            "4. If category is missing, type will be used",
            "5. Valid difficulties: easy, medium, hard",
            "6. Valid categories: dsa, system_design, hr, coding, aptitude, behavioral, technical",
            "7. Duplicate company + question rows increase frequency",
            "8. Upload the CSV file through the admin panel"
        ],
        "format_guide": {
            "company": "Company name, e.g. Amazon or Microsoft",
            "role": "Optional role label, used as topic fallback if topic is empty",
            "question": "Interview question text",
            "category_or_type": "technical, coding, hr, dsa, system_design, aptitude, behavioral",
            "difficulty": "easy, medium, or hard",
            "topic": "Topic area such as Arrays, OOP, Databases",
            "year": "Year asked, e.g. 2024"
        }
    }

