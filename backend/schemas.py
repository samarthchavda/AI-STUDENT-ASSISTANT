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
    token_type: str
    user: Optional[UserInfo] = None

# Chat Schemas
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

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

# Career Schemas
class ResumeAnalyzeRequest(BaseModel):
    resumeText: str

class InterviewPrepRequest(BaseModel):
    company: str
    role: str

# Payment Schemas
class PaymentCheckoutRequest(BaseModel):
    plan: str
    paymentMethod: str

class PaymentVerifyRequest(BaseModel):
    sessionId: str
