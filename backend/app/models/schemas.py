from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    plan: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserInfo(BaseModel):
    id: int
    email: str
    name: str
    plan_type: str
    is_admin: bool = False

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str
    user: Optional[UserInfo] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# Chat Schemas
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    language: Optional[str] = "english"  # 'english', 'hindi', 'gujarati'

class ChatResponse(BaseModel):
    response: str

# Learning Schemas
class ExplainTopicRequest(BaseModel):
    topic: str
    subject: str
    level: str

class GenerateNotesRequest(BaseModel):
    topic: str
    format: str  # 'summary', 'detailed', 'mindmap'

class SolveDoubtRequest(BaseModel):
    question: str
    subject: Optional[str] = None

# Exam Schemas
class MockTestRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str
    numQuestions: int
    company: Optional[str] = None

class SolvePYQRequest(BaseModel):
    question: str
    subject: str

class StudyPlanRequest(BaseModel):
    examDate: str
    subjects: List[str]

# Coding Schemas
class CodeHelpRequest(BaseModel):
    code: str
    language: str
    task: str  # 'explain', 'debug', 'optimize'

class DSARequest(BaseModel):
    problem: str

class ProjectGuideRequest(BaseModel):
    projectType: str
    techStack: List[str]


class ChallengeSubmitRequest(BaseModel):
    problem_id: int
    code: str
    language: str = "python"
    submission_reason: Optional[str] = "manual"  # manual | timeout | disqualified
    time_left_seconds: Optional[int] = 0
    disqualified: Optional[bool] = False


class ChallengeRewardRequest(BaseModel):
    solved_count: int

# Career Schemas
class ResumeAnalyzeRequest(BaseModel):
    resumeText: str
    target_role: Optional[str] = None
    job_description: Optional[str] = None

class ResumeGenerateRequest(BaseModel):
    resumeText: str
    templateType: str = "classic"


class ResumeSectionEnhanceRequest(BaseModel):
    section: str
    content: str

class ResumeAIActionRequest(BaseModel):
    action: str  # "suggest_skills" | "enhance_bullets" | "generate_summary"
    context: dict  # flexible key-value context

class InterviewPrepRequest(BaseModel):
    company: str
    role: str


class PersonalizedRoadmapRequest(BaseModel):
    tech_stack: str
    level: Optional[str] = "beginner"
    timeline_weeks: Optional[int] = 12

# Payment Schemas
class PaymentCheckoutRequest(BaseModel):
    plan: str
    paymentMethod: str

class PaymentVerifyRequest(BaseModel):
    sessionId: str


class UpgradePlanRequest(BaseModel):
    plan_type: str

# Company Questions Schemas (SEO Feature)
class CompanyQuestionRequest(BaseModel):
    question_text: str
    category: Optional[str] = "dsa"
    difficulty: Optional[str] = "medium"
    topic: Optional[str] = None
    year_asked: Optional[str] = None
    solution_outline: Optional[str] = None
    similar_questions: Optional[str] = None

class CompanyQuestion(BaseModel):
    id: int
    company_name: str
    question_text: str
    category: str
    difficulty: str
    frequency: int
    topic: Optional[str]
    year_asked: Optional[str]
    
    class Config:
        from_attributes = True

class CompanyInsightsRequest(BaseModel):
    company: str
    include_ai_analysis: bool = True


class CompanyPrepStartRequest(BaseModel):
    company: str
    role: str
    question_count: int = 6


class CompanyQuestionExplainRequest(BaseModel):
    question: str
    company: Optional[str] = None
    role: Optional[str] = None


class CompanyAnswerEvaluationRequest(BaseModel):
    company: str
    role: str
    question: str
    answer: str
    round_name: str


class PracticeHistoryItem(BaseModel):
    id: int
    company_name: str
    role: str
    round_name: str
    question_text: str
    user_answer: str
    ai_feedback: Optional[str] = None
    sample_answer: Optional[str] = None
    score: int
    practice_date: datetime

    class Config:
        from_attributes = True
