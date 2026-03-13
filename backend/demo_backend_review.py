# ============================================================================
# 📁 COMBINED BACKEND CODE FOR REVIEW
# ============================================================================
# This file contains all backend Python code combined for easy code review.
# DO NOT RUN THIS FILE - it's for review purposes only.
# The actual code is in separate files in the backend directory.
# ============================================================================


# ============================================================================
# 📁 FILE: main.py
# ============================================================================
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import settings
from ai_service import ai_service
from middleware import (
    SecurityHeadersMiddleware,
    RequestValidationMiddleware,
    RequestLoggingMiddleware,
    IPBlockingMiddleware,
    RateLimitMiddleware,
    limiter,
    rate_limit
)
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Import routes
from routes import auth_routes, chat_routes, exam_routes, coding_routes, career_routes, payment_routes, admin_routes, company_routes, company_prep_routes, public_routes

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered placement preparation assistant for engineering students"
)

# Add rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Middleware (order matters!)
# 1. Rate Limiting (100 requests per minute)
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)

# 2. IP Blocking (first line of defense)
app.add_middleware(IPBlockingMiddleware)

# 3. Request Validation (check for malicious patterns)
app.add_middleware(RequestValidationMiddleware)

# 4. Security Headers (add security headers to responses)
app.add_middleware(SecurityHeadersMiddleware)

# 5. Request Logging (log requests for monitoring)
app.add_middleware(RequestLoggingMiddleware)

# 6. CORS middleware (must be last)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "https://accounts.google.com",  # Google OAuth
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(chat_routes.router)
app.include_router(exam_routes.router)
app.include_router(coding_routes.router)
app.include_router(career_routes.router)
app.include_router(payment_routes.router)
app.include_router(company_routes.router)  # SEO feature: company question database
app.include_router(company_prep_routes.router)
app.include_router(admin_routes.router, prefix="/api/admin", tags=["admin"])
app.include_router(public_routes.router, prefix="/api", tags=["public"])  # Public company questions API

@app.get("/")
@rate_limit("10/minute")  # Rate limit: 10 requests per minute
async def root(request: Request):
    ai_status = "configured" if ai_service.use_ai else "demo mode"

    return {
        "message": "Welcome to CodeCampus AI API",
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
        "features": [
            "Chat & Learning",
            "Exam Preparation", 
            "Coding Help",
            "Career Guidance",
            "Payment Integration"
        ],
        "security": {
            "rate_limiting": "enabled",
            "security_headers": "enabled",
            "request_validation": "enabled"
        },
        "ai_service": ai_status,
        "note": "Gemini API is configured." if ai_service.use_ai else "API is in demo mode. Configure real API keys for full functionality."
    }

@app.get("/api/health")
@rate_limit("20/minute")  # Rate limit: 20 requests per minute
async def health_check(request: Request):
    ai_status = "configured" if ai_service.use_ai else "demo mode"

    return {
        "status": "healthy",
        "environment": settings.environment,
        "database": "connected",
        "ai_service": ai_status,
        "security": "enabled"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)



# ============================================================================
# 📁 FILE: database.py
# ============================================================================
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# ============================================================================
# 📁 FILE: config.py
# ============================================================================
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    app_name: str = "AI Student Assistant"
    app_version: str = "1.0.0"
    environment: str = "development"
    
    # Database
    database_url: str
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Google OAuth
    google_client_id: str = ""
    
    # AI APIs (Only Gemini is used)
    gemini_api_key: str = ""
    
    # Payment
    stripe_api_key: str = ""
    stripe_webhook_secret: str = ""
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()



# ============================================================================
# 📁 FILE: models.py
# ============================================================================
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class PlanType(str, enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"

class DifficultyLevel(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class QuestionCategory(str, enum.Enum):
    DSA = "dsa"
    SYSTEM_DESIGN = "system_design"
    HR = "hr"
    CODING = "coding"
    APTITUDE = "aptitude"
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    plan = Column(Enum(PlanType), default=PlanType.FREE)
    is_google_user = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    auth_provider = Column(String, default="local")  # 'local', 'google'
    failed_login_attempts = Column(Integer, default=0)
    account_locked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chat_history = relationship("ChatHistory", back_populates="user")
    user_progress = relationship("UserProgress", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    practice_history = relationship("UserPractice", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    """Store refresh tokens for JWT authentication"""
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="refresh_tokens")


class TokenBlacklist(Base):
    """Store blacklisted JWT tokens for logout functionality"""
    __tablename__ = "token_blacklist"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    blacklisted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)


class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)  # 'user' or 'assistant'
    content = Column(Text)
    language = Column(String, default="english")  # 'english', 'hindi', 'gujarati'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="chat_history")

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    topic = Column(String)
    score = Column(Integer)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="user_progress")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan = Column(Enum(PlanType))
    amount = Column(Integer)  # in cents/paise
    currency = Column(String, default="INR")
    status = Column(String)  # 'pending', 'completed', 'failed'
    payment_id = Column(String)  # from payment provider
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="payments")

class CompanyQuestion(Base):
    """Store interview questions for different companies - SEO goldmine"""
    __tablename__ = "company_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True, nullable=False)  # TCS, Amazon, Microsoft, etc.
    question_text = Column(Text, nullable=False)
    category = Column(Enum(QuestionCategory), default=QuestionCategory.DSA)
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.MEDIUM)
    frequency = Column(Integer, default=1)  # How many times asked (helps rank top questions)
    year_asked = Column(String)  # "2024", "2023-24"
    solution_outline = Column(Text)  # Brief solution hint
    similar_questions = Column(String)  # LeetCode IDs or references
    topic = Column(String)  # "Binary Search", "Dynamic Programming", etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes for fast querying
    __table_args__ = (
        # Composite index for company + difficulty for top-X queries
        # and for company + category for filtering
    )


class UserPractice(Base):
    __tablename__ = "user_practice"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company_name = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)
    round_name = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=False)
    ai_feedback = Column(Text)
    sample_answer = Column(Text)
    score = Column(Integer, default=0)
    practice_date = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="practice_history")



# ============================================================================
# 📁 FILE: schemas.py
# ============================================================================
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

class ResumeGenerateRequest(BaseModel):
    resumeText: str
    templateType: str = "classic"

class InterviewPrepRequest(BaseModel):
    company: str
    role: str

# Payment Schemas
class PaymentCheckoutRequest(BaseModel):
    plan: str
    paymentMethod: str

class PaymentVerifyRequest(BaseModel):
    sessionId: str

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



# ============================================================================
# 📁 FILE: auth.py
# ============================================================================
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from config import settings
import re
import secrets

security = HTTPBearer()

# Password validation regex
PASSWORD_REGEX = re.compile(
    r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
)

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength
    Requirements:
    - Minimum 8 characters
    - At least 1 letter
    - At least 1 number
    - At least 1 special character (@$!%*#?&)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[@$!%*#?&]', password):
        return False, "Password must contain at least one special character (@$!%*#?&)"
    
    return True, "Password is strong"


def normalize_email(email: str) -> str:
    """Normalize email to lowercase and strip whitespace"""
    return email.lower().strip()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password (bcrypt has 72 byte limit)"""
    # Truncate password to 72 bytes for bcrypt compatibility
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token (short-lived: 15 minutes)"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def create_refresh_token(data: dict) -> tuple[str, datetime]:
    """Create JWT refresh token (long-lived: 7 days)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt, expire


def decode_token(token: str):
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None


def is_token_blacklisted(token: str, db: Session) -> bool:
    """Check if token is blacklisted"""
    from models import TokenBlacklist
    
    blacklisted = db.query(TokenBlacklist).filter(
        TokenBlacklist.token == token,
        TokenBlacklist.expires_at > datetime.utcnow()
    ).first()
    
    return blacklisted is not None


def blacklist_token(token: str, expires_at: datetime, db: Session):
    """Add token to blacklist"""
    from models import TokenBlacklist
    
    blacklisted_token = TokenBlacklist(
        token=token,
        expires_at=expires_at
    )
    db.add(blacklisted_token)
    db.commit()


def is_account_locked(user) -> tuple[bool, Optional[str]]:
    """Check if user account is locked due to failed login attempts"""
    if user.account_locked_until and user.account_locked_until > datetime.utcnow():
        remaining = (user.account_locked_until - datetime.utcnow()).total_seconds() / 60
        return True, f"Account locked. Try again in {int(remaining)} minutes"
    return False, None


def handle_failed_login(user, db: Session):
    """Handle failed login attempt - lock account after 5 failures"""
    user.failed_login_attempts += 1
    
    if user.failed_login_attempts >= 5:
        # Lock account for 15 minutes
        user.account_locked_until = datetime.utcnow() + timedelta(minutes=15)
        user.failed_login_attempts = 0  # Reset counter
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account locked due to too many failed login attempts. Try again in 15 minutes."
        )
    
    db.commit()


def reset_failed_login_attempts(user, db: Session):
    """Reset failed login attempts on successful login"""
    user.failed_login_attempts = 0
    user.account_locked_until = None
    db.commit()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current user from JWT token"""
    from database import SessionLocal
    from models import User
    
    db = SessionLocal()
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        
        # Check if token is blacklisted
        if is_token_blacklisted(token, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        
        # Verify token type
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    db.close()
    return user



# ============================================================================
# 📁 FILE: middleware.py
# ============================================================================
"""
Security Middleware for CodeCampus AI
Includes rate limiting, security headers, and request validation
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
from typing import Callable
import re

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"  # Changed from DENY to allow Google OAuth
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Don't set restrictive COOP for auth endpoints (breaks Google OAuth)
        if "/auth/google" not in request.url.path:
            response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
        
        # Remove server header
        if "server" in response.headers:
            del response.headers["server"]
        
        return response


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Validate and sanitize incoming requests"""
    
    # Suspicious patterns that might indicate attacks
    SUSPICIOUS_PATTERNS = [
        r"<script[^>]*>.*?</script>",  # XSS
        r"javascript:",  # XSS
        r"on\w+\s*=",  # Event handlers
        r"union.*select",  # SQL injection
        r"drop\s+table",  # SQL injection
        r"insert\s+into",  # SQL injection
        r"\.\./",  # Path traversal
        r"\.\.\\",  # Path traversal
    ]
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Check request size (prevent large payload attacks)
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10_000_000:  # 10MB limit
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "Request payload too large"}
            )
        
        # Validate content type for POST/PUT requests
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if not any(ct in content_type for ct in ["application/json", "multipart/form-data", "application/x-www-form-urlencoded"]):
                if content_type:  # Only check if content-type is provided
                    return JSONResponse(
                        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                        content={"detail": "Unsupported media type"}
                    )
        
        # Check for suspicious patterns in URL
        url_path = str(request.url.path)
        for pattern in self.SUSPICIOUS_PATTERNS:
            if re.search(pattern, url_path, re.IGNORECASE):
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"detail": "Invalid request"}
                )
        
        response = await call_next(request)
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log requests for monitoring (without sensitive data)"""
    
    SENSITIVE_HEADERS = ["authorization", "cookie", "x-api-key"]
    SENSITIVE_PATHS = ["/api/auth/login", "/api/auth/register"]
    
    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()
        
        # Log request (without sensitive data)
        method = request.method
        path = request.url.path
        client_ip = get_remote_address(request)
        
        # Don't log sensitive endpoints in detail
        if path not in self.SENSITIVE_PATHS:
            print(f"[REQUEST] {method} {path} from {client_ip}")
        else:
            print(f"[REQUEST] {method} {path} from {client_ip} (auth endpoint)")
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            print(f"[RESPONSE] {path} - Status: {response.status_code} - Time: {process_time:.3f}s")
            
            # Add processing time header
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            print(f"[ERROR] {path} - Error: {type(e).__name__} - Time: {process_time:.3f}s")
            raise


class IPBlockingMiddleware(BaseHTTPMiddleware):
    """Block suspicious IPs (can be extended with database)"""
    
    # In production, load this from database or config
    BLOCKED_IPS = set()
    
    async def dispatch(self, request: Request, call_next: Callable):
        client_ip = get_remote_address(request)
        
        if client_ip in self.BLOCKED_IPS:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Access denied"}
            )
        
        response = await call_next(request)
        return response


# Rate limit configurations for different endpoints
def get_rate_limit_key(request: Request) -> str:
    """Get rate limit key based on user or IP"""
    # Try to get user from token
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        # Use token as key for authenticated users
        return f"user:{auth_header}"
    
    # Use IP for unauthenticated users
    return f"ip:{get_remote_address(request)}"


# Rate limit decorator for routes
def rate_limit(limit: str):
    """
    Rate limit decorator
    Usage: @rate_limit("5/minute")
    """
    return limiter.limit(limit, key_func=get_rate_limit_key)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Global rate limiting middleware
    100 requests per minute per IP/user
    """
    
    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_counts = {}  # {key: [(timestamp, count)]}
        self.window_size = 60  # 60 seconds
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Get client identifier (IP or user token)
        client_key = get_rate_limit_key(request)
        current_time = time.time()
        
        # Clean old entries
        if client_key in self.request_counts:
            self.request_counts[client_key] = [
                (ts, count) for ts, count in self.request_counts[client_key]
                if current_time - ts < self.window_size
            ]
        
        # Count requests in current window
        if client_key not in self.request_counts:
            self.request_counts[client_key] = []
        
        total_requests = sum(count for _, count in self.request_counts[client_key])
        
        # Check rate limit
        if total_requests >= self.requests_per_minute:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute.",
                    "retry_after": 60
                }
            )
        
        # Add current request
        self.request_counts[client_key].append((current_time, 1))
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(self.requests_per_minute - total_requests - 1)
        response.headers["X-RateLimit-Reset"] = str(int(current_time + self.window_size))
        
        return response




# ============================================================================
# 📁 FILE: ai_service.py
# ============================================================================
"""
AI Service - Handles all AI-related functionality using Google Gemini API
"""

from typing import List, Dict, Optional
from functools import lru_cache
import json
import re
import tiktoken
import google.generativeai as genai
from config import settings
from sqlalchemy.orm import Session
from models import CompanyQuestion

class AIService:
    def __init__(self):
        # Initialize Gemini API
        if settings.gemini_api_key and settings.gemini_api_key != "your-gemini-api-key-here":
            genai.configure(api_key=settings.gemini_api_key)
            # Use gemini-2.5-flash for fastest responses
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.use_ai = True
            print("✅ Gemini AI initialized successfully")
        else:
            self.use_ai = False
            print("⚠️ Gemini API key not configured, using demo mode")
        
        # Initialize tiktoken for token counting
        try:
            self.enc = tiktoken.get_encoding("cl100k_base")
        except Exception as e:
            print(f"⚠️ Tiktoken not available: {e}, using character count estimation")
            self.enc = None
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken (or estimate if unavailable)"""
        if self.enc:
            return len(self.enc.encode(text))
        # Fallback: estimate ~1 token per 4 characters
        return len(text) // 4
    
    def _detect_prompt_injection(self, prompt: str) -> bool:
        """Detect common prompt injection attempts"""
        dangerous_patterns = [
            "ignore previous instructions",
            "ignore all previous",
            "forget everything",
            "bypass system",
            "override",
            "disregard",
            "system prompt",
            "secret instruction",
            "hidden instruction",
            "reveal the prompt",
            "show me the prompt",
            "what's your system prompt",
            "you are actually",
            "act as if",
            "pretend you are",
        ]
        
        prompt_lower = prompt.lower()
        for pattern in dangerous_patterns:
            if pattern in prompt_lower:
                return True
        return False
    
    def get_cache_stats(self) -> Dict:
        """Get cache hit/miss statistics to show API savings"""
        return {
            "topic_explanations": {
                "hits": self._cached_explain_topic.cache_info().hits,
                "misses": self._cached_explain_topic.cache_info().misses,
                "size": self._cached_explain_topic.cache_info().currsize,
                "max": self._cached_explain_topic.cache_info().maxsize
            },
            "doubt_solutions": {
                "hits": self._cached_solve_doubt.cache_info().hits,
                "misses": self._cached_solve_doubt.cache_info().misses,
                "size": self._cached_solve_doubt.cache_info().currsize,
                "max": self._cached_solve_doubt.cache_info().maxsize
            },
            "estimated_savings": f"~{(self._cached_explain_topic.cache_info().hits + self._cached_solve_doubt.cache_info().hits) * 100} API calls saved"
        }
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using Gemini AI"""
        if not self.use_ai:
            return "[Demo Mode] Configure GEMINI_API_KEY in .env file to enable AI responses."
        
        # Check for prompt injection attempts
        if self._detect_prompt_injection(prompt):
            return "❌ Invalid request: Suspicious prompt pattern detected. Please rephrase your question."
        
        # Count tokens before truncation
        token_count = self._count_tokens(prompt)
        print(f"📊 Prompt tokens: {token_count}")
        
        # Protect against extremely long prompts (truncate to 4000 chars)
        if len(prompt) > 4000:
            prompt = prompt[:4000] + "\n\n[Context truncated for token limit]"
        
        try:
            # Set generation config for fast, concise responses
            # 800 tokens sufficient for bullet-point format, prevents incomplete answers
            generation_config = {
                "temperature": 0.8,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 800,
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            extracted = self._extract_text_from_gemini_response(response)
            cleaned = self._sanitize_chat_output(extracted)
            return cleaned or "I’m here to help. Please share a bit more context so I can give a precise answer."
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating AI response: {error_msg}")
            lower_error = error_msg.lower()
            if "429" in error_msg or "quota" in lower_error or "rate limit" in lower_error:
                return "⚠️ AI daily limit reached right now. Please try again after some time, or update Gemini billing/quota settings."
            # Return a helpful error message instead of crashing
            return f"⚠️ AI service temporarily unavailable. Error: {error_msg[:100]}\n\nPlease try again in a moment."

    def _extract_json_object(self, raw_text: str) -> Optional[Dict]:
        """Extract a JSON object from a model response if present."""
        if not raw_text:
            return None

        try:
            return json.loads(raw_text)
        except Exception:
            pass

        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if not match:
            return None

        try:
            return json.loads(match.group(0))
        except Exception:
            return None
    
    def _generate_response_stream(self, prompt: str):
        """Generate streaming response using Gemini AI (word by word like ChatGPT)"""
        if not self.use_ai:
            yield "[Demo Mode] Configure GEMINI_API_KEY in .env file to enable AI responses."
            return
        
        # Check for prompt injection attempts
        if self._detect_prompt_injection(prompt):
            yield "❌ Invalid request: Suspicious prompt pattern detected. Please rephrase your question."
            return
        
        # Count tokens before truncation
        token_count = self._count_tokens(prompt)
        print(f"📊 Streaming prompt tokens: {token_count}")
        
        # Protect against extremely long prompts (truncate to 4000 chars)
        if len(prompt) > 4000:
            prompt = prompt[:4000] + "\n\n[Context truncated for token limit]"
        
        try:
            # Set generation config for fast, concise streaming
            # 800 tokens sufficient for bullet-point format, prevents incomplete answers
            generation_config = {
                "temperature": 0.8,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 800,
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config,
                stream=True
            )
            
            for chunk in response:
                chunk_text = self._extract_text_from_gemini_response(chunk)
                if chunk_text:
                    yield self._sanitize_chat_output(chunk_text)
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating streaming AI response: {error_msg}")
            lower_error = error_msg.lower()
            if "429" in error_msg or "quota" in lower_error or "rate limit" in lower_error:
                yield "⚠️ AI daily limit reached right now. Please try again after some time, or update Gemini billing/quota settings."
                return
            yield f"⚠️ AI service temporarily unavailable. Error: {error_msg[:100]}\n\nPlease try again in a moment."

    def _generate_response_long(self, prompt: str) -> str:
        """Generate longer-form response (used for resume generation)."""
        if not self.use_ai:
            return "[Demo Mode] Configure GEMINI_API_KEY in .env file to enable AI responses."

        # Protect against extremely long prompts (truncate to 8000 chars for long responses)
        if len(prompt) > 8000:
            prompt = prompt[:8000] + "\n\n[Context truncated for token limit]"

        try:
            generation_config = {
                "temperature": 0.5,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 4096,
            }

            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            extracted = self._extract_text_from_gemini_response(response)
            return extracted or "Could not generate full resume content right now. Please try again."
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating long AI response: {error_msg}")
            return f"⚠️ AI service temporarily unavailable. Error: {error_msg[:100]}\n\nPlease try again in a moment."

    def _extract_text_from_gemini_response(self, response_obj) -> str:
        """Safely extract text from Gemini response/chunk, including multipart responses."""
        if response_obj is None:
            return ""

        try:
            direct_text = getattr(response_obj, "text", None)
            if isinstance(direct_text, str) and direct_text.strip():
                return direct_text
        except Exception:
            pass

        texts = []
        candidates = getattr(response_obj, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            if not content:
                continue
            parts = getattr(content, "parts", None) or []
            for part in parts:
                part_text = getattr(part, "text", None)
                if part_text:
                    texts.append(part_text)

        return "\n".join(texts).strip()

    def _sanitize_chat_output(self, text: str) -> str:
        """Remove markdown-heavy symbols and keep output clean/professional."""
        if not text:
            return ""

        cleaned = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
        cleaned = re.sub(r"^\s*#{1,6}\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = cleaned.replace("#", "")
        cleaned = re.sub(r"\*{2,}", "", cleaned)
        cleaned = re.sub(r"(^|\s)\*(?=\S)", " ", cleaned)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()

    def _build_resume_fallback(self, resume_text: str) -> str:
        """Build a structured resume output directly from extracted source text when AI output is too short."""
        lines = [line.strip() for line in resume_text.split('\n') if line.strip()]
        source_preview = lines[:40]

        email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", resume_text)
        phone_match = re.search(r"(\+?\d[\d\s\-]{8,}\d)", resume_text)
        linkedin_match = re.search(r"(https?://)?(www\.)?linkedin\.com/[^\s]+", resume_text, re.IGNORECASE)
        github_match = re.search(r"(https?://)?(www\.)?github\.com/[^\s]+", resume_text, re.IGNORECASE)

        first_line = source_preview[0] if source_preview else "[Your Name]"
        contact_line_parts = []
        if email_match:
            contact_line_parts.append(email_match.group(0))
        if phone_match:
            contact_line_parts.append(phone_match.group(0))
        if linkedin_match:
            contact_line_parts.append(linkedin_match.group(0))
        if github_match:
            contact_line_parts.append(github_match.group(0))

        contact_line = " | ".join(contact_line_parts) if contact_line_parts else "[Add email] | [Add phone] | [Add LinkedIn] | [Add GitHub]"

        keywords = [
            "python", "java", "javascript", "typescript", "react", "node", "sql", "mongodb", "aws", "docker", "git", "dsa"
        ]
        found_skills = []
        normalized = resume_text.lower()
        for keyword in keywords:
            if keyword in normalized:
                found_skills.append(keyword.upper() if keyword == "aws" else keyword.capitalize())

        skills_line = ", ".join(found_skills[:10]) if found_skills else "[Add technical skills relevant to target role]"

        highlights = source_preview[1:12] if len(source_preview) > 1 else []
        bullet_highlights = "\n".join([f"- {line}" for line in highlights]) if highlights else "- [Add project, internship, and achievement highlights from your resume]"

        return (
            f"{first_line}\n"
            f"{contact_line}\n\n"
            "PROFESSIONAL SUMMARY\n"
            "Engineering student/fresher preparing for IT placements. Strong problem-solving mindset and practical project exposure.\n\n"
            "TECHNICAL SKILLS\n"
            f"{skills_line}\n\n"
            "EXTRACTED HIGHLIGHTS (VERIFY & EDIT)\n"
            f"{bullet_highlights}\n\n"
            "PROJECTS\n"
            "- [Project Name] - Built using [Tech Stack], achieved [quantified impact].\n"
            "- [Project Name] - Implemented [feature], improved [metric].\n\n"
            "EDUCATION\n"
            "[Degree], [College], [Year], [CGPA/Percentage]\n\n"
            "CERTIFICATIONS\n"
            "[Add relevant certifications]\n\n"
            "ACHIEVEMENTS\n"
            "[Add coding ranks, awards, leadership, or responsibilities]"
        )

    def generate_updated_resume(self, resume_text: str) -> str:
        """Generate an improved ATS-friendly resume from provided resume text"""
        prompt = f"""You are an expert resume writer for Indian engineering placements.

Rewrite and improve this resume into a strong ATS-friendly version.

SOURCE RESUME:
{resume_text}

Instructions:
1. Keep all details truthful to the source content. Do not invent companies, internships, projects, dates, or achievements.
2. Improve wording, structure, and bullet quality.
3. Use action verbs and concise impact-focused bullets.
4. Include sections in this order when possible:
   - Name and Contact
   - Professional Summary
   - Education
   - Technical Skills
   - Projects
   - Experience/Internships (if present)
   - Certifications
   - Achievements/Leadership
5. If a section is missing in source data, add a placeholder line like: "[Add your X details]".
6. Output plain text only, no markdown symbols like **, ##, or ```.
7. Keep it clean, one-page style.

Return only the improved resume text."""

        updated_resume = self._generate_response_long(prompt)

        if updated_resume.startswith("[Demo Mode]"):
            return (
                "UPDATED RESUME (DEMO MODE)\n\n"
                "To generate a true AI-updated resume PDF, configure GEMINI_API_KEY in backend/.env.\n\n"
                "Suggested structure:\n"
                "Name | Phone | Email | LinkedIn | GitHub\n\n"
                "Professional Summary\n"
                "2-3 lines tailored for target role.\n\n"
                "Education\n"
                "Degree, college, year, CGPA.\n\n"
                "Technical Skills\n"
                "Languages, frameworks, tools, databases.\n\n"
                "Projects\n"
                "Project title + 2-3 impact bullets with numbers.\n\n"
                "Experience/Internships\n"
                "Role, company, duration, quantified impact.\n\n"
                "Certifications and Achievements\n"
                "Relevant credentials and accomplishments."
            )

        cleaned = updated_resume.replace('```', '').replace('**', '').strip()
        if len(cleaned) < 500:
            return self._build_resume_fallback(resume_text)

        return cleaned
    
    def calculate_ats_score(self, resume_text: str) -> Dict:
        """
        Calculate detailed ATS score breakdown
        Returns comprehensive scoring with specific metrics
        """
        prompt = f"""Analyze this resume and provide a detailed ATS (Applicant Tracking System) score breakdown.

RESUME:
{resume_text}

Provide scores (0-100) for each category and overall:

1. OVERALL ATS SCORE (0-100)
2. KEYWORDS SCORE (0-100) - Technical keywords, skills, tools
3. FORMATTING SCORE (0-100) - Structure, sections, readability
4. SKILLS SCORE (0-100) - Technical skills relevance and depth
5. EXPERIENCE SCORE (0-100) - Projects, internships, quantifiable impact

For each score, provide:
- The numeric score
- Brief explanation (1-2 sentences)
- Specific improvements needed

Also provide:
- Top 5 strengths
- Top 5 weaknesses
- Missing keywords (10-15 important ones)
- Recommended actions (5-7 specific steps)

Format your response clearly with scores at the top."""

        analysis = self._generate_response(prompt)
        
        # Parse scores from response
        scores = {
            "overall": 70,
            "keywords": 65,
            "formatting": 75,
            "skills": 70,
            "experience": 65
        }
        
        # Try to extract scores
        lines = analysis.lower().split('\n')
        for line in lines:
            if 'overall' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["overall"] = score
                except:
                    pass
            elif 'keyword' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["keywords"] = score
                except:
                    pass
            elif 'format' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["formatting"] = score
                except:
                    pass
            elif 'skill' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["skills"] = score
                except:
                    pass
            elif 'experience' in line and 'score' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        scores["experience"] = score
                except:
                    pass
        
        # Calculate grade
        overall = scores["overall"]
        if overall >= 90:
            grade = "Excellent"
            color = "green"
        elif overall >= 75:
            grade = "Good"
            color = "blue"
        elif overall >= 60:
            grade = "Average"
            color = "yellow"
        else:
            grade = "Needs Improvement"
            color = "red"
        
        return {
            "overallScore": scores["overall"],
            "grade": grade,
            "color": color,
            "breakdown": {
                "keywords": {
                    "score": scores["keywords"],
                    "label": "Keywords & Technical Terms"
                },
                "formatting": {
                    "score": scores["formatting"],
                    "label": "Formatting & Structure"
                },
                "skills": {
                    "score": scores["skills"],
                    "label": "Technical Skills"
                },
                "experience": {
                    "score": scores["experience"],
                    "label": "Experience & Impact"
                }
            },
            "detailedAnalysis": analysis,
            "recommendation": "Your resume is ATS-friendly" if overall >= 75 else "Improve your resume for better ATS compatibility"
        }
    
    def match_resume_to_job(self, resume_text: str, job_description: str) -> Dict:
        """
        Match resume against job description
        Returns match score and gap analysis
        """
        prompt = f"""Analyze how well this resume matches the job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Provide:

1. MATCH SCORE (0-100) - Overall compatibility
2. MATCHING SKILLS - Skills present in both resume and JD
3. MISSING SKILLS - Required skills not in resume
4. EXPERIENCE MATCH - How experience aligns
5. EDUCATION MATCH - Education requirements met?
6. GAP ANALYSIS - What's missing or weak
7. RECOMMENDATIONS - Specific actions to improve match
8. INTERVIEW READINESS - Ready to apply? (Yes/No/Maybe)

Be specific and actionable. Focus on technical skills, tools, and experience."""

        analysis = self._generate_response(prompt)
        
        # Parse match score
        match_score = 65  # Default
        for line in analysis.lower().split('\n'):
            if 'match score' in line or 'match:' in line:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        match_score = score
                        break
                except:
                    pass
        
        # Extract skills (basic parsing)
        matching_skills = []
        missing_skills = []
        
        # Common technical skills to check
        common_skills = [
            "python", "java", "javascript", "react", "node", "sql", "aws",
            "docker", "kubernetes", "git", "rest api", "mongodb", "postgresql",
            "typescript", "angular", "vue", "spring boot", "django", "flask",
            "machine learning", "data structures", "algorithms", "system design"
        ]
        
        resume_lower = resume_text.lower()
        jd_lower = job_description.lower()
        
        for skill in common_skills:
            if skill in jd_lower:
                if skill in resume_lower:
                    matching_skills.append(skill.title())
                else:
                    missing_skills.append(skill.title())
        
        # Determine readiness
        if match_score >= 75:
            readiness = "Yes - Strong match"
            readiness_color = "green"
        elif match_score >= 60:
            readiness = "Maybe - Moderate match"
            readiness_color = "yellow"
        else:
            readiness = "No - Weak match"
            readiness_color = "red"
        
        return {
            "matchScore": match_score,
            "matchingSkills": matching_skills[:10],
            "missingSkills": missing_skills[:10],
            "interviewReadiness": readiness,
            "readinessColor": readiness_color,
            "detailedAnalysis": analysis,
            "recommendations": [
                f"Add missing skills: {', '.join(missing_skills[:5])}" if missing_skills else "Skills look good",
                "Tailor your resume to match job description keywords",
                "Highlight relevant projects and experience",
                "Quantify your achievements with numbers",
                "Update your skills section to match requirements"
            ],
            "gapAnalysis": {
                "technicalSkills": f"{len(matching_skills)} matching, {len(missing_skills)} missing",
                "overallFit": f"{match_score}% match",
                "action": "Apply now" if match_score >= 75 else "Improve resume first"
            }
        }
    
    def chat_completion(self, messages: List[Dict]) -> str:
        """Generate chat completion response for engineering students with conversation context"""
        
        # Build context-aware prompt with conversation history
        system_context = """You are CodeCampus AI - engineering placement assistant for TCS, Microsoft, Amazon, Google, Infosys, Wipro.

RESPONSE RULES:
1. BULLET POINTS ONLY - no paragraphs, no prose
2. MAX 8 BULLETS TOTAL per response - prefer 5-6
3. Each bullet: MAX 1 line (10 words or less)
4. Emojis on section headers only: 1️⃣2️⃣3️⃣4️⃣✅💡🎯📚🔧🏢
5. End with: ✅ If you want, I can also show you: + 3 short bullet suggestions

LANGUAGE:
- Detect question language → respond in SAME language
- English: ✅ If you want, I can also show you:
- Gujarati: ✅ જો તમે ઇચ્છો તો, હું આને પણ બતાવી શકું:
- Hindi: ✅ अगर आप चाहें तो, मैं आपको यह भी दिखा सकता हूँ:

EXAMPLE (interview process question):
Amazon Interview Process
1️⃣ Online Assessment - Coding + MCQ
2️⃣ Technical Round 1 - DSA problems
3️⃣ Technical Round 2 - System Design
4️⃣ Bar Raiser Round - Behavioral
✅ If you want, I can also show you:
• Amazon top DSA questions
• Leadership Principles prep
• Resume tips for Amazon
    """
        
        # Build conversation history (skip the initial assistant greeting if present)
        # Limit to last 6 messages to save tokens (avoids 4000+ token bloat from long histories)
        messages = messages[-6:]
        conversation_history = ""
        for msg in messages:
            if msg['role'] == 'user':
                conversation_history += f"\n\nStudent: {msg['content']}"
            elif msg['role'] == 'assistant' and not msg['content'].startswith("Hello! I'm your AI"):
                conversation_history += f"\n\nAssistant: {msg['content']}"
        
        full_prompt = f"{system_context}\n\nConversation History:{conversation_history}\n\nProvide a helpful, contextual response:"
        
        return self._generate_response(full_prompt)
    
    def chat_completion_stream(self, messages: List[Dict]):
        """Generate streaming chat completion response with conversation context (word by word like ChatGPT)"""
        
        # Build context-aware prompt with conversation history
        system_context = """You are CodeCampus AI - engineering placement assistant for TCS, Microsoft, Amazon, Google, Infosys, Wipro.

RESPONSE RULES:
1. BULLET POINTS ONLY - no paragraphs, no prose
2. MAX 8 BULLETS TOTAL per response - prefer 5-6
3. Each bullet: MAX 1 line (10 words or less)
4. Emojis on section headers only: 1️⃣2️⃣3️⃣4️⃣✅💡🎯📚🔧🏢
5. End with: ✅ If you want, I can also show you: + 3 short bullet suggestions

LANGUAGE:
- Detect question language → respond in SAME language
- English: ✅ If you want, I can also show you:
- Gujarati: ✅ જો તમે ઇચ્છો તો, હું આને પણ બતાવી શકું:
- Hindi: ✅ अगर आप चाहें तो, मैं आपको यह भी दिखा सकता हूँ:

EXAMPLE (interview process question):
Amazon Interview Process
1️⃣ Online Assessment - Coding + MCQ
2️⃣ Technical Round 1 - DSA problems
3️⃣ Technical Round 2 - System Design
4️⃣ Bar Raiser Round - Behavioral
✅ If you want, I can also show you:
• Amazon top DSA questions
• Leadership Principles prep
• Resume tips for Amazon
    """
        
        # Build conversation history (skip the initial assistant greeting if present)
        # Limit to last 6 messages to save tokens (avoids 4000+ token bloat from long histories)
        messages = messages[-6:]
        conversation_history = ""
        for msg in messages:
            if msg['role'] == 'user':
                conversation_history += f"\n\nStudent: {msg['content']}"
            elif msg['role'] == 'assistant' and not msg['content'].startswith("Hello! I'm your AI"):
                conversation_history += f"\n\nAssistant: {msg['content']}"
        
        full_prompt = f"{system_context}\n\nConversation History:{conversation_history}\n\nProvide a helpful, contextual response:"
        
        return self._generate_response_stream(full_prompt)

    
    def explain_topic(self, topic: str, subject: str, level: str) -> Dict:
        """Generate topic explanation for placement preparation"""
        explanation = self._cached_explain_topic(topic, subject, level)
        
        return {
            "explanation": explanation,
            "difficulty": level,
            "estimatedTime": "15-20 minutes"
        }
    
    @lru_cache(maxsize=500)  # Cache up to 500 unique topics (saves 70% on repeated questions)
    def _cached_explain_topic(self, topic: str, subject: str, level: str) -> str:
        """Cached topic explanation generation"""
        prompt = f"""Explain the topic "{topic}" from {subject} for engineering students preparing for campus placements.

Difficulty Level: {level}
Target Audience: Engineering students preparing for interviews

Include:
1. Clear concept explanation
2. Why it's important for placements
3. Which companies ask about this
4. Common interview questions
5. Key points to remember

Format the response for easy understanding."""

        return self._generate_response(prompt)
    
    def generate_notes(self, topic: str, format: str) -> Dict:
        """Generate study notes"""
        prompt = f"""Create comprehensive study notes on "{topic}" for engineering students.

Format: {format}
Include:
- Summary
- Key concepts
- Important formulas/algorithms
- Examples
- Practice questions
- Interview tips

Make it placement-focused and easy to revise."""

        notes = self._generate_response(prompt)
        
        return {
            "notes": notes,
            "format": format,
            "wordCount": len(notes.split())
        }
    
    def solve_doubt(self, question: str, subject: str = None) -> Dict:
        """Solve student doubt with detailed explanation"""
        answer = self._cached_solve_doubt(question, subject or 'General')
        
        return {
            "answer": answer,
            "subject": subject,
            "confidence": 0.95
        }
    
    @lru_cache(maxsize=500)  # Cache up to 500 unique doubts (saves 70% on repeated questions)
    def _cached_solve_doubt(self, question: str, subject: str = 'General') -> str:
        """Cached doubt solution generation"""
        prompt = f"""Answer this engineering student's question in detail:

Question: {question}
Subject: {subject}

Provide:
1. Clear, step-by-step answer
2. Multiple approaches if applicable
3. Visual explanation if needed
4. Related concepts
5. Practice problems

Make it easy to understand for placement preparation."""

        return self._generate_response(prompt)
    
    def generate_mock_test(self, subject: str, topic: str, difficulty: str, num_questions: int) -> Dict:
        """Generate mock test questions for placement preparation"""
        prompt = f"""Generate EXACTLY {num_questions} multiple choice questions for campus placement aptitude test.

Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}

IMPORTANT: Generate ALL {num_questions} questions. Do not generate less.

For each question provide:
1. Clear question text
2. Four options (A, B, C, D)
3. Correct answer index (0-3)
4. Detailed explanation

Focus on aptitude questions commonly asked in placement exams.

Return in JSON format with ALL {num_questions} questions:
{{
  "questions": [
    {{
      "id": 1,
      "question": "...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "..."
    }},
    ... (continue for all {num_questions} questions)
  ]
}}

CRITICAL: The questions array MUST contain exactly {num_questions} questions."""

        response = self._generate_response(prompt)
        
        # Try to parse JSON response
        try:
            # Extract JSON from response if it's wrapped in markdown
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response
            
            data = json.loads(json_str)
            questions = data.get("questions", [])
            
            # If we didn't get enough questions, generate more
            if len(questions) < num_questions:
                print(f"Warning: Only got {len(questions)} questions, expected {num_questions}")
                # Generate additional questions to reach the target
                for i in range(len(questions), num_questions):
                    questions.append({
                        "id": i+1,
                        "question": f"Sample {topic} question {i+1}",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": 0,
                        "explanation": "This is a sample question."
                    })
        except Exception as e:
            print(f"Error parsing mock test response: {e}")
            # Fallback to demo questions
            questions = [
                {
                    "id": i+1,
                    "question": f"Sample question {i+1} on {topic}",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0,
                    "explanation": "This is a sample question."
                }
                for i in range(num_questions)
            ]
        
        return {
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions[:num_questions],  # Ensure we don't exceed requested number
            "totalQuestions": len(questions[:num_questions]),
            "timeLimit": num_questions * 2,
            "companies": ["TCS", "Infosys", "Amazon", "Microsoft", "Wipro"]
        }
    
    def solve_previous_year(self, question: str, subject: str) -> Dict:
        """Solve previous year placement question"""
        prompt = f"""Solve this previous year placement question:

Subject: {subject}
Question: {question}

Provide:
1. Step-by-step solution
2. Key formulas/concepts used
3. Common mistakes to avoid
4. Time-saving tips
5. Similar questions for practice

Make it detailed and easy to understand."""

        solution = self._generate_response(prompt)
        
        return {
            "question": question,
            "solution": solution,
            "difficulty": "medium",
            "timeToSolve": "5-10 minutes"
        }

    
    def generate_study_plan(self, exam_date: str, subjects: List[str]) -> Dict:
        """Generate personalized placement preparation roadmap"""
        prompt = f"""Create a detailed 3-month placement preparation roadmap for an engineering student.

Target Date: {exam_date}
Subjects to Cover: {', '.join(subjects)}

Create a comprehensive plan including:
1. Month-wise breakdown
2. Week-wise topics
3. Daily schedule (hours per topic)
4. DSA practice plan
5. Project recommendations
6. Mock interview schedule
7. Company-specific preparation
8. Resume building timeline

Focus on:
- Service-based companies (TCS, Infosys, Wipro)
- Product-based companies (Amazon, Microsoft, Google)
- Core CS subjects
- Coding practice

Make it realistic and achievable for engineering students."""

        plan = self._generate_response(prompt)
        
        return {
            "examDate": exam_date,
            "subjects": subjects,
            "plan": plan,
            "totalWeeks": 12,
            "dailyHours": 8,
            "targetCompanies": ["TCS", "Infosys", "Amazon", "Microsoft"]
        }
    
    def explain_code(self, code: str, language: str, task: str) -> Dict:
        """Explain, debug, or optimize code"""
        persona = """You are a senior software engineer and coding mentor with 10+ years of experience at top tech companies (Amazon, Microsoft, Google).
Your role: explain programming problems step-by-step, provide optimized solutions, and explain time and space complexity in simple terms.
Always use clear bullet points, numbered steps, and short sentences. Avoid long paragraphs.
"""
        prompts = {
            "explain": f"""{persona}
Explain this {language} code step-by-step:

```{language}
{code}
```

Provide:
1️⃣ What this code does (1-2 lines)
2️⃣ Line-by-line explanation (short bullets)
3️⃣ Time complexity — with simple reason
4️⃣ Space complexity — with simple reason
5️⃣ Best practices used / missing
6️⃣ Interview tip — what to say if asked about this code""",
            
            "debug": f"""{persona}
Debug this {language} code and fix all errors:

```{language}
{code}
```

Provide:
1️⃣ Errors found (each on one line)
2️⃣ Why each error occurs
3️⃣ Fixed code (clean, working)
4️⃣ Edge cases to test
5️⃣ Interview tip — common bugs interviewers test""",
            
            "optimize": f"""{persona}
Optimize this {language} code for best performance:

```{language}
{code}
```

Provide:
1️⃣ Current time & space complexity
2️⃣ Bottlenecks identified
3️⃣ Optimized code
4️⃣ New time & space complexity
5️⃣ Trade-offs (if any)
6️⃣ Interview tip — Amazon/Microsoft optimization questions"""
        }
        
        prompt = prompts.get(task, prompts["explain"])
        result = self._generate_response(prompt)
        
        return {
            "original": code,
            "language": language,
            "task": task,
            "result": result,
            "suggestions": ["Review the analysis above for detailed suggestions"]
        }
    
    def dsa_hint(self, problem: str) -> Dict:
        """Provide complete DSA problem solution with code and explanation"""
        
        # Check if AI is available
        if not self.use_ai:
            return self._get_demo_dsa_solution(problem)
        
        prompt = f"""You are a senior software engineer and coding mentor at a top tech company (Amazon/Microsoft/Google).
Your goal: solve DSA problems step-by-step, explain clearly, and prepare students for placement interviews.
Use bullet points, numbered steps, and short sentences. No long paragraphs.

Solve this DSA problem completely:

Problem: {problem}

Provide:

1. **Optimal Python Solution**
   - Clean, commented code
   - Function signature + example

2. **Simple Explanation** (how it works in plain words)
   - Strategy in 3-4 bullets
   - Why this approach is best

3. **Step-by-Step Walkthrough**
   - Walk through 1 example

4. **Complexity**
   - ⏱ Time: O(?) — why
   - 💾 Space: O(?) — why

5. **Interview Tips**
   - What to say first
   - Common mistakes to avoid
   - Which companies (Amazon/Microsoft/Google) ask this

6. **Similar Problems** (3 LeetCode problems)

Format with markdown headers and code blocks."""

        response = self._generate_response(prompt)
        
        # If API quota exceeded, return demo solution
        if "exceeded your current quota" in response.lower() or "429" in response:
            return self._get_demo_dsa_solution(problem)
        
        return {
            "problem": problem,
            "solution": response,
            "type": "complete_solution"
        }
    
    def _get_demo_dsa_solution(self, problem: str) -> Dict:
        """Return demo DSA solution when API is unavailable"""
        
        problem_lower = problem.lower()
        
        # Pascal's Triangle
        if "pascal" in problem_lower:
            solution = """# 🔺 Pascal's Triangle - Complete Solution

## 1. Python Code Solution

```python
def generate_pascals_triangle(numRows):
    \"\"\"
    Generate Pascal's Triangle with numRows rows
    Time: O(numRows²), Space: O(numRows²)
    \"\"\"
    if numRows == 0:
        return []
    
    triangle = [[1]]  # First row is always [1]
    
    for i in range(1, numRows):
        row = [1]  # Every row starts with 1
        
        # Calculate middle elements
        for j in range(1, i):
            # Sum of two elements from previous row
            row.append(triangle[i-1][j-1] + triangle[i-1][j])
        
        row.append(1)  # Every row ends with 1
        triangle.append(row)
    
    return triangle


# Test Examples
print(generate_pascals_triangle(5))
# Output:
# [
#   [1],
#   [1, 1],
#   [1, 2, 1],
#   [1, 3, 3, 1],
#   [1, 4, 6, 4, 1]
# ]
```

## 2. Why This Code Works - Simple Explanation

### The Pattern 🔺
```
Row 0:           1
Row 1:         1   1
Row 2:       1   2   1
Row 3:     1   3   3   1
Row 4:   1   4   6   4   1
```

### Key Observations:
1. **First and last elements** are always `1`
2. **Middle elements** = sum of two numbers above it
3. **Row i** has `i+1` elements

### The Algorithm:
**Step 1:** Start with first row `[1]`

**Step 2:** For each new row:
- Start with `1`
- Calculate middle: `previous[j-1] + previous[j]`
- End with `1`

**Step 3:** Add row to triangle

## 3. Step-by-Step Example

Building 4 rows:

```
Row 0: [1]
       ↓
Row 1: [1, 1]
       ↓  ↓
Row 2: [1, 2, 1]
          ↓ ↓
       (1+1=2)

Row 3: [1, 3, 3, 1]
          ↓ ↓ ↓
       (1+2=3)(2+1=3)
```

## 4. Code Breakdown

```python
triangle = [[1]]  # Base case
```
- Start with first row

```python
for i in range(1, numRows):
    row = [1]  # Every row starts with 1
```
- Build each row starting with 1

```python
for j in range(1, i):
    row.append(triangle[i-1][j-1] + triangle[i-1][j])
```
- Calculate middle elements
- `triangle[i-1]` = previous row
- Sum adjacent elements

```python
row.append(1)  # Every row ends with 1
triangle.append(row)
```
- End row with 1
- Add to triangle

## 5. Complexity Analysis

| Metric | Value | Explanation |
|--------|-------|-------------|
| **Time** | O(numRows²) | Generate numRows rows, each row has i elements |
| **Space** | O(numRows²) | Store entire triangle |

**Why O(numRows²)?**
- Row 0: 1 element
- Row 1: 2 elements
- Row 2: 3 elements
- ...
- Row n: n+1 elements
- Total: 1+2+3+...+n = n(n+1)/2 = O(n²)

## 6. Interview Tips 💡

### What to Say:
✅ "Each element is the sum of two elements from the previous row"
✅ "I handle edge cases: first and last elements are always 1"
✅ "Time complexity is O(n²) because we generate n² elements"

### Common Mistakes to Avoid:
❌ Forgetting to add 1 at start and end of each row
❌ Wrong indexing when accessing previous row
❌ Not handling numRows = 0 or 1

### Companies That Ask This:
- **Amazon** ⭐⭐⭐⭐
- **Microsoft** ⭐⭐⭐
- **Google** ⭐⭐⭐
- **Apple** ⭐⭐⭐
- **TCS/Infosys** ⭐⭐⭐⭐⭐ (Very Common)

## 7. Variations & Follow-ups

### Variation 1: Get Specific Row
```python
def getRow(rowIndex):
    \"\"\"Get only the rowIndex-th row\"\"\"
    row = [1]
    for i in range(1, rowIndex + 1):
        # Build from right to left to use O(1) space
        row.append(1)
        for j in range(i - 1, 0, -1):
            row[j] = row[j] + row[j - 1]
    return row
```

### Variation 2: Print Triangle Format
```python
def print_triangle(numRows):
    triangle = generate_pascals_triangle(numRows)
    for i, row in enumerate(triangle):
        spaces = ' ' * (numRows - i - 1)
        print(spaces + ' '.join(map(str, row)))
```

## 8. Similar Problems

1. **Pascal's Triangle II** (LeetCode 119)
   - Get specific row with O(k) space
   - Difficulty: Easy

2. **Triangle** (LeetCode 120)
   - Minimum path sum in triangle
   - Difficulty: Medium

3. **Combination Sum** (LeetCode 39)
   - Uses combinatorics like Pascal's
   - Difficulty: Medium

4. **Unique Paths** (LeetCode 62)
   - Related to Pascal's triangle values
   - Difficulty: Medium

---

**🎯 This is a common interview question for service-based companies!**

*Note: This is a demo solution. Get Gemini API key for AI-generated solutions.*
"""
        
        # Matrix Zeroes
        elif "matrix" in problem_lower and "0" in problem:
            solution = """# 🚀 Set Matrix Zeroes - Complete Solution

## 1. Python Code Solution (Optimal O(1) Space)

```python
def setZeroes(matrix):
    \"\"\"
    Set entire row and column to 0 if element is 0
    Time: O(M×N), Space: O(1)
    \"\"\"
    if not matrix:
        return
    
    rows = len(matrix)
    cols = len(matrix[0])
    
    # Step 1: Check if first row and column need zeroing
    first_row_has_zero = False
    first_col_has_zero = False
    
    for j in range(cols):
        if matrix[0][j] == 0:
            first_row_has_zero = True
            break
    
    for i in range(rows):
        if matrix[i][0] == 0:
            first_col_has_zero = True
            break
    
    # Step 2: Use first row/column as markers
    for i in range(1, rows):
        for j in range(1, cols):
            if matrix[i][j] == 0:
                matrix[i][0] = 0
                matrix[0][j] = 0
    
    # Step 3: Zero out based on markers
    for i in range(1, rows):
        for j in range(1, cols):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    
    # Step 4: Handle first row and column
    if first_row_has_zero:
        for j in range(cols):
            matrix[0][j] = 0
    
    if first_col_has_zero:
        for i in range(rows):
            matrix[i][0] = 0
```

[Full solution continues...]

**Companies:** Amazon ⭐⭐⭐⭐⭐, Microsoft ⭐⭐⭐⭐, Google ⭐⭐⭐⭐

*Get Gemini API key for complete solution with detailed explanation.*
"""
        
        # Two Sum
        elif "two sum" in problem_lower:
            solution = """# 🎯 Two Sum - Complete Solution

## 1. Python Code Solution (Optimal O(n) Time)

```python
def twoSum(nums, target):
    \"\"\"
    Find two numbers that add up to target
    Time: O(n), Space: O(n)
    \"\"\"
    seen = {}  # Dictionary to store {value: index}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in seen:
            return [seen[complement], i]
        
        seen[num] = i
    
    return []  # No solution found


# Test
print(twoSum([2, 7, 11, 15], 9))  # Output: [0, 1]
print(twoSum([3, 2, 4], 6))       # Output: [1, 2]
```

## 2. Why This Works

**The Insight:** For each number, check if its complement exists

```
Target = 9
nums = [2, 7, 11, 15]

i=0: num=2, complement=7, seen={} → Add 2
i=1: num=7, complement=2, seen={2:0} → Found! Return [0,1]
```

## 3. Complexity

- **Time:** O(n) - Single pass
- **Space:** O(n) - Hash map storage

## 4. Interview Tips

✅ "I use a hash map for O(1) lookups"
✅ "One pass solution is optimal"

**Companies:** Amazon ⭐⭐⭐⭐⭐, Google ⭐⭐⭐⭐⭐, Microsoft ⭐⭐⭐⭐⭐

*Get Gemini API key for complete solution.*
"""
        
        # Valid Parentheses
        elif "parenthes" in problem_lower or "bracket" in problem_lower:
            solution = """# 🔤 Valid Parentheses - Complete Solution

## 1. Python Code Solution

```python
def isValid(s):
    \"\"\"
    Check if parentheses are valid
    Time: O(n), Space: O(n)
    \"\"\"
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            # Closing bracket
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            # Opening bracket
            stack.append(char)
    
    return len(stack) == 0


# Test
print(isValid("()"))      # True
print(isValid("()[]{}"))  # True
print(isValid("(]"))      # False
```

## 2. Why Stack?

**Opening brackets** → Push to stack
**Closing brackets** → Must match top of stack

```
Input: "({[]})"

Step 1: '(' → stack = ['(']
Step 2: '{' → stack = ['(', '{']
Step 3: '[' → stack = ['(', '{', '[']
Step 4: ']' → matches '[' → stack = ['(', '{']
Step 5: '}' → matches '{' → stack = ['(']
Step 6: ')' → matches '(' → stack = []
Result: Valid ✓
```

**Companies:** Amazon ⭐⭐⭐⭐, Microsoft ⭐⭐⭐⭐, TCS ⭐⭐⭐⭐⭐

*Get Gemini API key for complete solution.*
"""
        
        # Generic fallback
        else:
            solution = f"""# 💡 DSA Problem Solution

**Problem:** {problem}

## Demo Mode Active

⚠️ **Gemini API quota exceeded.** 

### To Get AI-Powered Solutions:

1. **Get New API Key:**
   - Visit: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

2. **Update Backend:**
   ```bash
   # Edit backend/.env
   GEMINI_API_KEY=your-new-api-key-here
   ```

3. **Restart Backend:**
   ```bash
   cd backend
   npm run dev
   ```

### Popular Demo Solutions Available:

Try these problems to see complete solutions:
- ✅ **Pascal's Triangle** - Full solution with code
- ✅ **Set Matrix Zeroes** - O(1) space solution
- ✅ **Two Sum** - Hash map approach
- ✅ **Valid Parentheses** - Stack solution

### General DSA Approach:

1. **Understand the Problem**
   - Read carefully
   - Identify inputs/outputs
   - Check constraints

2. **Think of Approaches**
   - Brute force first
   - Optimize with data structures
   - Consider time/space tradeoffs

3. **Write Clean Code**
   - Meaningful variable names
   - Add comments
   - Handle edge cases

4. **Analyze Complexity**
   - Time: O(?)
   - Space: O(?)

5. **Test Thoroughly**
   - Normal cases
   - Edge cases (empty, single element)
   - Large inputs

### Interview Tips 💡

- **Think out loud** - Explain your thought process
- **Start simple** - Brute force first, then optimize
- **Ask questions** - Clarify requirements
- **Test your code** - Walk through examples
- **Discuss tradeoffs** - Time vs space

### Common Data Structures:

| Problem Type | Data Structure |
|--------------|----------------|
| Fast lookup | Hash Map/Set |
| LIFO order | Stack |
| FIFO order | Queue |
| Sorted data | Heap/BST |
| Graph problems | DFS/BFS |

---

**Configure Gemini API for AI-generated solutions for ANY problem!**
"""
        
        return {
            "problem": problem,
            "solution": solution,
            "type": "demo_solution"
        }
    
    def project_guidance(self, project_type: str, tech_stack: List[str]) -> Dict:
        """Provide placement-worthy project guidance"""
        prompt = f"""Create a detailed project guide for engineering students preparing for placements.

Project Type: {project_type}
Tech Stack: {', '.join(tech_stack)}

Provide:
1. Why this project is good for placements
2. Project structure and architecture
3. Core features to implement (phase-wise)
4. Database schema design
5. API endpoints needed
6. Deployment checklist
7. GitHub best practices
8. Resume bullet points
9. Interview talking points
10. Companies that value this project

Make it actionable with clear steps and timeline (6-8 weeks)."""

        guidance = self._generate_response(prompt)
        
        return {
            "projectType": project_type,
            "techStack": tech_stack,
            "guidance": guidance,
            "estimatedTime": "6-8 weeks",
            "difficulty": "intermediate",
            "placementValue": "High",
            "companiesThatAsk": ["Amazon", "Microsoft", "Flipkart", "Startups"]
        }

    
    def analyze_resume(self, resume_text: str) -> Dict:
        """Analyze resume for ATS and placement readiness"""
        prompt = f"""Analyze this engineering student's resume for campus placements:

RESUME:
{resume_text}

Provide detailed analysis:

1. ATS Score (0-100)
2. Overall Placement Readiness Score (0-100)
3. Strengths (what's good)
4. Areas for Improvement (what's missing/weak)
5. Keywords found
6. Missing important keywords
7. Section-wise analysis (Contact, Education, Skills, Projects, Experience, Achievements)
8. Company fit analysis (Service-based vs Product-based)
9. Specific recommendations

Focus on:
- ATS compatibility
- Keyword optimization
- Format and structure
- Content quality
- Quantifiable achievements
- Technical skills relevance
- Project descriptions

Return analysis in a structured format."""

        analysis = self._generate_response(prompt)

        normalized_resume = resume_text.lower()

        required_sections = {
            "Professional summary/objective": ["summary", "objective", "profile"],
            "Education details": ["education", "bachelor", "b.tech", "btech", "cgpa", "gpa"],
            "Technical skills section": ["skills", "technical skills", "technologies", "tools"],
            "Projects section": ["project", "projects"],
            "Experience or internship section": ["experience", "internship", "work experience"],
            "Certifications section": ["certification", "certifications", "certificate"],
            "Achievements or positions of responsibility": ["achievement", "awards", "position of responsibility", "leadership"],
            "LinkedIn profile": ["linkedin.com"],
            "GitHub profile": ["github.com"]
        }

        missing_in_resume = [
            section
            for section, keywords in required_sections.items()
            if not any(keyword in normalized_resume for keyword in keywords)
        ]

        has_quantified_impact = bool(re.search(r"\b\d+(%|\+|x|k|\b)", resume_text.lower()))
        has_action_verbs = bool(re.search(r"\b(built|developed|implemented|optimized|designed|led|created|improved|automated)\b", normalized_resume))

        suggested_changes = []
        if not has_quantified_impact:
            suggested_changes.append("Add measurable impact in project/experience bullets (%, time saved, users, scale).")
        if not has_action_verbs:
            suggested_changes.append("Start each bullet with strong action verbs (Built, Developed, Implemented, Optimized).")
        if len(resume_text.split()) < 180:
            suggested_changes.append("Resume content is too short. Add stronger project depth, tools used, and outcomes.")
        if "skills" in normalized_resume and not re.search(r"\b(python|java|javascript|sql|react|node|aws|dsa|oop)\b", normalized_resume):
            suggested_changes.append("Add role-relevant technical keywords in Skills for better ATS matching.")

        for section in missing_in_resume[:4]:
            suggested_changes.append(f"Add missing section: {section}.")

        if not suggested_changes:
            suggested_changes.append("Your resume structure is decent. Improve clarity by tightening weak or repetitive bullets.")
        
        # Parse the analysis to extract scores (basic parsing)
        ats_score = 75  # Default
        overall_score = 75  # Default
        
        # Try to extract scores from response
        for line in analysis.split('\n'):
            if 'ats score' in line.lower() or 'ats:' in line.lower():
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        ats_score = score
                except:
                    pass
            if 'overall' in line.lower() and 'score' in line.lower():
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                    if 0 <= score <= 100:
                        overall_score = score
                except:
                    pass
        
        return {
            "atsScore": ats_score,
            "overallScore": overall_score,
            "analysis": analysis,
            "missingInResume": missing_in_resume,
            "suggestedChanges": suggested_changes[:8],
            "placementReadiness": "Good" if overall_score >= 70 else "Needs Improvement",
            "companyFit": {
                "Service-based (TCS/Infosys)": f"{min(overall_score + 10, 95)}% - Analyze from report",
                "Product-based (Amazon/Microsoft)": f"{max(overall_score - 15, 50)}% - Analyze from report",
                "Startups": f"{overall_score}% - Analyze from report"
            }
        }
    
    def interview_prep(self, company: str, role: str) -> Dict:
        """Generate company-specific interview preparation"""
        prompt = f"""Create a comprehensive interview preparation guide for:

Company: {company}
Role: {role}

Provide:

1. Company Overview
   - Package range
   - Interview difficulty
   - Selection process

2. Interview Rounds
   - Detailed breakdown of each round
   - What to expect
   - Preparation strategy

3. Common Questions
   - Technical questions (10-15)
   - HR questions (5-7)
   - Behavioral questions (5)

4. Technical Topics to Prepare
   - DSA topics
   - Core CS subjects
   - System design (if applicable)

5. Coding Questions Pattern
   - Easy/Medium/Hard distribution
   - Common problem types

6. Company-Specific Tips
   - What they value
   - Red flags to avoid
   - Unique aspects of their process

7. Preparation Timeline
   - 1 month before
   - 1 week before
   - 1 day before

8. Resources
   - Practice platforms
   - Company-specific prep

Make it specific to Indian campus placements and engineering students."""

        preparation = self._generate_response(prompt)
        
        # Extract common questions from the response
        common_questions = []
        in_questions_section = False
        for line in preparation.split('\n'):
            if 'question' in line.lower() and ':' not in line:
                in_questions_section = True
            if in_questions_section and line.strip() and (line.strip()[0].isdigit() or line.startswith('-') or line.startswith('•')):
                question = line.strip().lstrip('0123456789.-•) ').strip()
                if question and len(question) > 10:
                    common_questions.append(question)
                if len(common_questions) >= 10:
                    break
        
        if not common_questions:
            common_questions = [
                f"Why do you want to join {company}?",
                f"Tell me about yourself",
                f"Explain your most challenging project",
                f"What interests you about {role}?",
                "What are your strengths and weaknesses?",
                "Where do you see yourself in 5 years?",
                "Why should we hire you?",
                "Tell me about a time you faced a challenge",
                "How do you handle pressure and deadlines?",
                "Do you have any questions for us?"
            ]
        
        return {
            "company": company,
            "role": role,
            "preparation": preparation,
            "commonQuestions": common_questions[:10],
            "technicalTopics": [
                "Data Structures & Algorithms",
                "Operating Systems",
                "Database Management Systems",
                "Computer Networks",
                "Object-Oriented Programming",
                "System Design (for senior roles)"
            ]
        }

    def explain_interview_question(self, question: str, company: str = "", role: str = "") -> Dict:
        """Explain an interview question in simple, structured language."""
        prompt = f"""Explain this interview question in a simple way for a student preparing for placements.

Company: {company or 'General'}
Role: {role or 'General'}
Question: {question}

Return strict JSON with this shape:
{{
  "concepts": ["concept 1", "concept 2", "concept 3"],
  "simple_explanation": "short paragraph",
  "answer_framework": ["step 1", "step 2", "step 3"],
  "sample_answer": "sample answer in simple language"
}}"""

        response = self._generate_response(prompt)
        parsed = self._extract_json_object(response)
        if parsed:
            return parsed

        cleaned_question = question.strip().rstrip("?")

        return {
            "concepts": [
                "Start with a simple definition",
                "Break the answer into 3-4 key points",
                "Use one interview-friendly example"
            ],
            "simple_explanation": f"The interviewer wants to check whether you understand the core idea behind '{cleaned_question}' and whether you can explain it clearly without overcomplicating it.",
            "answer_framework": [
                "Start with the definition",
                "Mention 2-3 important parts",
                "Give one practical example"
            ],
            "sample_answer": f"A strong answer to '{cleaned_question}' should begin with a clear definition, then cover the main concepts involved, and finally connect the idea to a real software example or project use case."
        }

    def evaluate_interview_answer(self, question: str, answer: str, company: str = "", role: str = "", round_name: str = "Technical") -> Dict:
        """Evaluate a mock interview answer and return structured feedback."""
        if not answer.strip():
            return {
                "score": 0,
                "verdict": "No answer provided",
                "strengths": [],
                "improvements": ["Write an answer before requesting evaluation."],
                "sample_answer": "",
                "follow_up_question": ""
            }

        prompt = f"""You are evaluating a placement interview answer.

Company: {company or 'General'}
Role: {role or 'General'}
Round: {round_name}
Question: {question}
Candidate Answer: {answer}

Return strict JSON with this shape:
{{
  "score": 78,
  "verdict": "short 1-line verdict",
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2", "point 3"],
  "sample_answer": "improved sample answer",
  "follow_up_question": "one likely next interviewer question"
}}

Score must be 0-100."""

        response = self._generate_response(prompt)
        parsed = self._extract_json_object(response)
        if parsed and isinstance(parsed.get("score"), int):
            parsed["score"] = max(0, min(100, parsed["score"]))
            return parsed

        answer_length = len(answer.split())
        base_score = 55
        if answer_length > 40:
            base_score += 10
        if answer_length > 80:
            base_score += 10
        if any(keyword in answer.lower() for keyword in ["example", "because", "used", "built", "implemented"]):
            base_score += 10

        return {
            "score": min(base_score, 90),
            "verdict": "Decent structure, but the answer can be sharper and more interview-ready.",
            "strengths": ["You attempted the question directly."],
            "improvements": [
                "Add a more structured explanation.",
                "Include one concrete example.",
                "End with the impact or use case."
            ],
            "sample_answer": f"A stronger answer would define the concept clearly, explain the main parts in logical order, and include one short real-world or project example to show practical understanding. For '{question}', you should aim for a crisp explanation followed by why it matters in software development.",
            "follow_up_question": "Can you explain this with a real example from a project or daily life?"
        }
    
    def get_company_insights(self, company: str, db: Session = None) -> Dict:
        """Generate AI insights about top interview questions for a company (SEO feature)"""
        
        company_clean = company.strip().lower()
        
        # Query database for company questions if db session provided
        questions_data = []
        if db:
            try:
                db_questions = db.query(CompanyQuestion).filter(
                    CompanyQuestion.company_name.ilike(f"%{company}%")
                ).order_by(CompanyQuestion.frequency.desc()).limit(30).all()
                
                questions_data = [
                    {
                        'question_text': q.question_text,
                        'category': q.category,
                        'difficulty': q.difficulty,
                        'frequency': q.frequency,
                        'topic': q.topic,
                        'year_asked': q.year_asked
                    }
                    for q in db_questions
                ]
            except Exception as e:
                print(f"⚠️ Error querying company questions: {e}")
        
        # Build context from actual questions if available
        questions_context = ""
        if questions_data and len(questions_data) > 0:
            questions_list = "\n".join([f"- {q.get('question_text', '')}" for q in questions_data[:20]])
            category_breakdown = {}
            for q in questions_data:
                cat = q.get('category', 'other')
                category_breakdown[cat] = category_breakdown.get(cat, 0) + 1
            
            questions_context = f"\n\nTop {len(questions_data)} questions from database:\n{questions_list}"
            questions_context += f"\n\nQuestion distribution:\n" + "\n".join([f"- {cat}: {count}" for cat, count in category_breakdown.items()])
        
        prompt = f"""Generate SEO-friendly insights about {company} interview questions that will rank in Google searches.

Company: {company}
{questions_context}

Create content that answers: "Top interview questions asked in {company} interviews"

Provide:

1. **Introduction** (100 words)
   - Why {company} is important for engineering students
   - Package and role information
   - Why this company asks specific types of questions

2. **Category Breakdown**
   - DSA Questions (with 3-4 examples)
   - System Design Questions (with 2-3 examples)
   - HR & Behavioral Questions (with 3 examples)
   - Aptitude Questions (with 2 examples)

3. **Preparation Strategy**
   - Week-by-week prep plan specifically for {company}
   - Which companies have similar interview patterns
   - Time to prepare (realistic estimate)

4. **Success Tips**
   - What {company} specifically looks for
   - Common mistakes candidates make
   - Unique interview patterns at {company}

5. **Resources**
   - Best platforms to practice
   - Company-specific question banks
   - Mock interview tips

Make it comprehensive, detailed, and optimized for SEO (use keywords like "{company} interview questions", "Top {company} questions", etc.)"""

        insights = self._generate_response(prompt)
        
        return {
            "company": company,
            "insights": insights,
            "total_questions_in_db": len(questions_data),
            "seo_keywords": [
                f"Top {company} interview questions",
                f"{company} placement questions",
                f"{company} interview questions 2024",
                f"Most asked questions in {company}",
                f"How to crack {company} interview"
            ],
            "content_type": "seo_article",
            "target_students": "Engineering freshers preparing for placements",
            "data_source": "live_database" if questions_data else "ai_generated"
        }
    
    def generate_company_questions_summary(self, company: str, db: Session = None, questions_list: list = None) -> Dict:
        """Generate a beautiful summary of company questions for the web page"""
        
        # Query database if db session provided and no explicit questions_list
        if db and questions_list is None:
            try:
                db_questions = db.query(CompanyQuestion).filter(
                    CompanyQuestion.company_name.ilike(f"%{company}%")
                ).order_by(CompanyQuestion.frequency.desc()).all()
                
                questions_list = [
                    {
                        'question_text': q.question_text,
                        'category': q.category,
                        'difficulty': q.difficulty,
                        'frequency': q.frequency,
                        'topic': q.topic,
                        'year_asked': q.year_asked
                    }
                    for q in db_questions
                ]
            except Exception as e:
                print(f"⚠️ Error querying company questions: {e}")
                questions_list = []
        
        if not questions_list:
            return {
                "error": f"No questions found for {company}",
                "company": company,
                "total_questions": 0,
                "data_source": "empty"
            }
        
        # Group questions by category
        by_category = {}
        for q in questions_list:
            cat = q.get('category', 'other')
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(q)
        
        # Sort by frequency within each category
        for cat in by_category:
            by_category[cat] = sorted(by_category[cat], key=lambda x: x.get('frequency', 0), reverse=True)
        
        # Build summary with token counting
        summary = f"# {company} Interview Questions Database\n\n"
        summary += f"**Total Questions: {len(questions_list)}**\n"
        summary += f"**Database Source: Live - Updated in real-time**\n\n"
        
        for category, questions in by_category.items():
            summary += f"## {category.upper()} Questions ({len(questions)})\n\n"
            for i, q in enumerate(questions[:10], 1):  # Show top 10 per category
                difficulty = q.get('difficulty', 'medium')
                frequency = q.get('frequency', 0)
                topic = q.get('topic', 'General')
                summary += f"{i}. **{q.get('question_text', '')}**\n"
                summary += f"   - Difficulty: ⭐ {difficulty.upper()} | Topic: {topic}\n"
                if frequency > 0:
                    summary += f"   - Asked {frequency} times by users\n"
                summary += "\n"
        
        # Count tokens for SEO analysis
        summary_tokens = self._count_tokens(summary)
        
        return {
            "company": company,
            "total_questions": len(questions_list),
            "by_category": {k: len(v) for k, v in by_category.items()},
            "summary": summary,
            "summary_token_count": summary_tokens,
            "most_popular_category": max(by_category.items(), key=lambda x: len(x[1]))[0] if by_category else "unknown",
            "average_frequency": sum(q.get('frequency', 1) for q in questions_list) // len(questions_list) if questions_list else 0,
            "data_source": "live_database"
        }

# Singleton instance
ai_service = AIService()



# ============================================================================
# 📁 FILE: routes/__init__.py
# ============================================================================
# Empty file to make routes a package



# ============================================================================
# 📁 FILE: routes/auth_routes.py
# ============================================================================
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from google.oauth2 import id_token
from google.auth.transport import requests
from database import get_db
from models import User as UserModel, RefreshToken, TokenBlacklist
from schemas import UserCreate, UserLogin, User, Token, RefreshTokenRequest
from auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_password_strength,
    normalize_email,
    is_account_locked,
    handle_failed_login,
    reset_failed_login_attempts,
    blacklist_token,
    get_current_user
)
from config import settings
from pydantic import BaseModel
from middleware import rate_limit
import secrets

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class GoogleAuthRequest(BaseModel):
    credential: str


@router.post("/register", response_model=Token)
@rate_limit("5/minute")  # Strict rate limit for registration
async def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with password strength validation"""
    
    # Normalize email
    normalized_email = normalize_email(user.email)
    
    # Check if user exists
    db_user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate password strength
    is_valid, message = validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=normalized_email,
        name=user.name,
        hashed_password=hashed_password,
        auth_provider="local"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate tokens
    access_token = create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id},
        expires_delta=timedelta(minutes=15)
    )
    
    refresh_token_str, refresh_expires = create_refresh_token(
        data={"sub": db_user.email, "user_id": db_user.id}
    )
    
    # Store refresh token in database
    refresh_token_obj = RefreshToken(
        user_id=db_user.id,
        token=refresh_token_str,
        expires_at=refresh_expires
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
            "plan_type": db_user.plan.value,
            "is_admin": db_user.is_admin
        }
    }


@router.post("/login", response_model=Token)
@rate_limit("10/minute")  # Strict rate limit for login to prevent brute force
async def login(request: Request, user_login: UserLogin, db: Session = Depends(get_db)):
    """Login user with account locking after 5 failed attempts"""
    
    # Normalize email
    normalized_email = normalize_email(user_login.email)
    
    user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
    
    if not user:
        # Security: Don't reveal whether email exists
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if account is locked
    is_locked, lock_message = is_account_locked(user)
    if is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=lock_message
        )
    
    # Verify password
    if not user.hashed_password or not verify_password(user_login.password, user.hashed_password):
        # Handle failed login attempt
        handle_failed_login(user, db)
        
        # Security: Don't reveal whether email exists or password is wrong
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Reset failed login attempts on successful login
    reset_failed_login_attempts(user, db)
    
    # Generate tokens
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=15)
    )
    
    refresh_token_str, refresh_expires = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    # Store refresh token in database
    refresh_token_obj = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=refresh_expires
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan_type": user.plan.value,
            "is_admin": user.is_admin
        }
    }


@router.post("/refresh", response_model=Token)
@rate_limit("20/minute")
async def refresh_access_token(
    request: Request,
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    Access Token: 15 minutes
    Refresh Token: 7 days
    """
    
    # Decode refresh token
    payload = decode_token(refresh_request.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Verify token type
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    # Check if refresh token exists and is not revoked
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_request.refresh_token,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or revoked"
        )
    
    # Get user
    user = db.query(UserModel).filter(UserModel.id == refresh_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=15)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_request.refresh_token,  # Return same refresh token
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan_type": user.plan.value,
            "is_admin": user.is_admin
        }
    }


@router.post("/logout")
@rate_limit("10/minute")
async def logout(
    request: Request,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout user by blacklisting access token and revoking refresh tokens
    """
    
    # Get access token from request
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    access_token = auth_header.split(" ")[1]
    
    # Decode token to get expiration
    payload = decode_token(access_token)
    if payload and "exp" in payload:
        expires_at = datetime.fromtimestamp(payload["exp"])
        
        # Blacklist access token
        blacklist_token(access_token, expires_at, db)
    
    # Revoke all refresh tokens for this user
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.revoked == False
    ).update({"revoked": True})
    
    db.commit()
    
    return {
        "message": "Successfully logged out",
        "detail": "All tokens have been revoked"
    }


@router.post("/google", response_model=Token)
@rate_limit("10/minute")  # Rate limit for Google OAuth
async def google_auth(request: Request, auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate user with Google OAuth"""
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            auth_data.credential, 
            requests.Request(), 
            settings.google_client_id
        )
        
        # Get user info from Google
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        google_id = idinfo.get('sub')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google account")
        
        # Normalize email
        normalized_email = normalize_email(email)
        
        # Check if user exists
        user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
        
        if not user:
            # Create new user with Google OAuth
            user = UserModel(
                email=normalized_email,
                name=name,
                hashed_password=None,  # No password for OAuth users
                is_google_user=True,
                auth_provider="google"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate tokens
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=timedelta(minutes=15)
        )
        
        refresh_token_str, refresh_expires = create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        # Store refresh token in database
        refresh_token_obj = RefreshToken(
            user_id=user.id,
            token=refresh_token_str,
            expires_at=refresh_expires
        )
        db.add(refresh_token_obj)
        db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "plan_type": user.plan.value,
                "is_admin": user.is_admin
            }
        }
        
    except ValueError as e:
        # Invalid token - don't expose internal error details
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        # Log error internally but don't expose details to user
        print(f"[SECURITY] Google auth error: {type(e).__name__}")  # Log error type only, not details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )


@router.get("/me")
async def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "plan_type": current_user.plan.value,
        "is_admin": current_user.is_admin,
        "auth_provider": current_user.auth_provider,
        "created_at": current_user.created_at
    }



# ============================================================================
# 📁 FILE: routes/chat_routes.py
# ============================================================================
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from schemas import ChatRequest, ChatResponse, ExplainTopicRequest, GenerateNotesRequest, SolveDoubtRequest
from ai_service import ai_service
from database import get_db
from models import ChatHistory, User
from auth import get_current_user
from middleware import rate_limit
import json

router = APIRouter(prefix="/api", tags=["Chat & Learning"])


def detect_message_language(text: str) -> str:
    """Infer the response language from the user's message text."""
    if any('\u0A80' <= char <= '\u0AFF' for char in text):
        return "gujarati"
    if any('\u0900' <= char <= '\u097F' for char in text):
        return "hindi"
    return "english"


def resolve_chat_language(chat_request: ChatRequest) -> str:
    requested_language = (chat_request.language or "").strip().lower()
    if requested_language and requested_language not in {"auto", "english"}:
        return requested_language

    last_user_message = next(
        (msg.content for msg in reversed(chat_request.messages) if msg.role == "user"),
        ""
    )
    return detect_message_language(last_user_message)

@router.post("/chat", response_model=ChatResponse)
@rate_limit("30/minute")  # 30 chat messages per minute
async def chat(request: Request, chat_request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Main chat endpoint with streaming, history saving and multi-language support"""
    
    language = resolve_chat_language(chat_request)
    
    # Build messages with language instruction
    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
    
    # Add language instruction if not English
    if language.lower() in ["hindi", "gujarati"]:
        language_instruction = f"\n\nIMPORTANT: Respond in {language.upper()} language. Translate your entire response to {language}."
        messages[-1]["content"] += language_instruction
    
    # Get AI response
    response = ai_service.chat_completion(messages)
    
    # Save user message to history
    try:
        user_message = ChatHistory(
            user_id=current_user.id,
            role="user",
            content=chat_request.messages[-1].content,
            language=language
        )
        db.add(user_message)
        
        # Save assistant response to history
        assistant_message = ChatHistory(
            user_id=current_user.id,
            role="assistant",
            content=response,
            language=language
        )
        db.add(assistant_message)
        db.commit()
    except Exception as e:
        print(f"Error saving chat history: {e}")
        db.rollback()
    
    return {"response": response}

@router.post("/chat/stream")
@rate_limit("30/minute")  # 30 streaming requests per minute
async def chat_stream(request: Request, chat_request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Streaming chat endpoint - responses appear word by word like ChatGPT"""
    
    language = resolve_chat_language(chat_request)
    
    # Build messages with language instruction
    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
    
    # Add language instruction if not English
    if language.lower() in ["hindi", "gujarati"]:
        language_instruction = f"\n\nIMPORTANT: Respond in {language.upper()} language. Translate your entire response to {language}."
        messages[-1]["content"] += language_instruction
    
    # Save user message to history
    try:
        user_message = ChatHistory(
            user_id=current_user.id,
            role="user",
            content=chat_request.messages[-1].content,
            language=language
        )
        db.add(user_message)
        db.commit()
    except Exception as e:
        print(f"Error saving user message: {e}")
        db.rollback()
    
    # Stream response
    async def generate():
        full_response = ""
        try:
            for chunk in ai_service.chat_completion_stream(messages):
                full_response += chunk
                # Send chunk as SSE (Server-Sent Events)
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            # Send completion signal
            yield f"data: {json.dumps({'done': True})}\n\n"
            
            # Save complete response to history
            try:
                assistant_message = ChatHistory(
                    user_id=current_user.id,
                    role="assistant",
                    content=full_response,
                    language=language
                )
                db.add(assistant_message)
                db.commit()
            except Exception as e:
                print(f"Error saving assistant message: {e}")
                db.rollback()
                
        except Exception as e:
            error_msg = f"⚠️ Error: {str(e)[:100]}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.get("/chat/history")
def get_chat_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's chat history"""
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.timestamp.desc()).limit(limit).all()
    
    return {
        "history": [
            {
                "role": msg.role,
                "content": msg.content,
                "language": msg.language,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in reversed(history)
        ]
    }

@router.delete("/chat/history")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear user's chat history"""
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}

@router.post("/learning/explain")
def explain_topic(request: ExplainTopicRequest):
    """Explain any topic in simple terms"""
    result = ai_service.explain_topic(request.topic, request.subject, request.level)
    return result

@router.post("/learning/notes")
def generate_notes(request: GenerateNotesRequest):
    """Generate study notes from topic/syllabus"""
    result = ai_service.generate_notes(request.topic, request.format)
    return result

@router.post("/learning/doubt")
def solve_doubt(request: SolveDoubtRequest):
    """Solve student doubts 24/7"""
    result = ai_service.solve_doubt(request.question, request.subject)
    return result

@router.get("/cache/stats")
def get_cache_stats():
    """Get response cache statistics and estimated cost savings"""
    return ai_service.get_cache_stats()



# ============================================================================
# 📁 FILE: routes/exam_routes.py
# ============================================================================
from fastapi import APIRouter
from schemas import MockTestRequest, SolvePYQRequest, StudyPlanRequest
from ai_service import ai_service

router = APIRouter(prefix="/api/exam", tags=["Exam Preparation"])

@router.post("/mock-test")
def generate_mock_test(request: MockTestRequest):
    """Generate mock test with questions"""
    result = ai_service.generate_mock_test(
        request.subject,
        request.topic,
        request.difficulty,
        request.numQuestions
    )
    return result

@router.post("/solve-pyq")
def solve_previous_year_question(request: SolvePYQRequest):
    """Solve previous year question with explanation"""
    result = ai_service.solve_previous_year(request.question, request.subject)
    return result

@router.post("/study-plan")
def generate_study_plan(request: StudyPlanRequest):
    """Generate personalized study plan"""
    result = ai_service.generate_study_plan(request.examDate, request.subjects)
    return result



# ============================================================================
# 📁 FILE: routes/coding_routes.py
# ============================================================================
from fastapi import APIRouter
from schemas import CodeHelpRequest, DSARequest, ProjectGuideRequest
from ai_service import ai_service

router = APIRouter(prefix="/api/coding", tags=["Coding Help"])

@router.post("/help")
def code_help(request: CodeHelpRequest):
    """Explain, debug, or optimize code"""
    result = ai_service.explain_code(request.code, request.language, request.task)
    return result

@router.post("/dsa-hint")
def dsa_hint(request: DSARequest):
    """Get hints for DSA problems without spoiling solution"""
    result = ai_service.dsa_hint(request.problem)
    return result

@router.post("/project-guide")
def project_guidance(request: ProjectGuideRequest):
    """Get project guidance and roadmap"""
    result = ai_service.project_guidance(request.projectType, request.techStack)
    return result



# ============================================================================
# 📁 FILE: routes/career_routes.py
# ============================================================================
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from schemas import ResumeAnalyzeRequest, InterviewPrepRequest, ResumeGenerateRequest
from ai_service import ai_service
from middleware import rate_limit
from database import get_db
import PyPDF2
import io
import os

# Try to import magic, but make it optional
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    print("⚠️  python-magic not available. File type detection will use basic checks only.")


def _create_resume_pdf_bytes(resume_content: str, template_type: str = "classic") -> io.BytesIO:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="PDF generator not available. Install reportlab in backend environment."
        )

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    page_width, page_height = A4

    template = (template_type or "classic").lower()

    left_margin = 48
    right_margin = 48
    top_margin = 48
    bottom_margin = 48
    max_width = page_width - left_margin - right_margin

    y = page_height - top_margin
    pdf.setFont("Helvetica", 11)

    if template == "modern":
        pdf.setFillColorRGB(0.11, 0.36, 0.55)
        pdf.rect(0, page_height - 72, page_width, 72, fill=1, stroke=0)
        pdf.setFillColorRGB(1, 1, 1)
        pdf.setFont("Helvetica-Bold", 16)
        first_line = resume_content.split('\n')[0].strip() if resume_content.strip() else "Updated Resume"
        pdf.drawString(left_margin, page_height - 42, first_line[:70])
        pdf.setFont("Helvetica", 10)
        second_line = resume_content.split('\n')[1].strip() if len(resume_content.split('\n')) > 1 else ""
        pdf.drawString(left_margin, page_height - 58, second_line[:100])
        pdf.setFillColorRGB(0, 0, 0)
        y = page_height - 90
    elif template == "minimal":
        left_margin = 40
        right_margin = 40
        top_margin = 36
        bottom_margin = 36
        y = page_height - top_margin
        pdf.setFont("Helvetica", 10)

    def wrap_line(text: str, max_chars: int = 105):
        words = text.split()
        if not words:
            return [""]
        lines = []
        current = words[0]
        for word in words[1:]:
            candidate = f"{current} {word}"
            if len(candidate) <= max_chars:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
        return lines

    for raw_line in resume_content.split('\n'):
        cleaned_line = raw_line.strip().replace('**', '').replace('##', '')
        output_lines = [""] if cleaned_line == "" else wrap_line(cleaned_line)

        for line in output_lines:
            if y <= bottom_margin:
                pdf.showPage()
                if template == "minimal":
                    pdf.setFont("Helvetica", 10)
                else:
                    pdf.setFont("Helvetica", 11)
                y = page_height - top_margin

            if len(line) > 0 and len(line) < 42 and line.upper() == line:
                if template == "modern":
                    pdf.setFillColorRGB(0.11, 0.36, 0.55)
                    pdf.setFont("Helvetica-Bold", 11)
                elif template == "minimal":
                    pdf.setFont("Helvetica-Bold", 10)
                else:
                    pdf.setFont("Helvetica-Bold", 11)
            else:
                pdf.setFillColorRGB(0, 0, 0)
                if template == "minimal":
                    pdf.setFont("Helvetica", 10)
                else:
                    pdf.setFont("Helvetica", 11)

            pdf.drawString(left_margin, y, line)
            y -= 14 if template == "minimal" else 16

    pdf.save()
    buffer.seek(0)
    return buffer


def validate_pdf_file(file: UploadFile, contents: bytes) -> tuple[bool, str]:
    """
    Secure file validation
    1. Check file extension
    2. Check MIME type
    3. Verify it's actually a PDF
    """
    # 1. Filename validation (secure)
    if not file.filename:
        return False, "Filename is required"
    
    # Extract extension securely
    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()
    
    if ext != '.pdf':
        return False, "Only PDF files are allowed"
    
    # 2. Check MIME type from content
    if MAGIC_AVAILABLE:
        try:
            mime = magic.from_buffer(contents, mime=True)
            if mime != 'application/pdf':
                return False, f"File is not a valid PDF (detected: {mime})"
        except Exception:
            # Fallback: Check PDF magic bytes
            if not contents.startswith(b'%PDF'):
                return False, "File is not a valid PDF"
    else:
        # Basic check: PDF magic bytes
        if not contents.startswith(b'%PDF'):
            return False, "File is not a valid PDF"
    
    # 3. Validate file size (max 5MB)
    if len(contents) > 5 * 1024 * 1024:
        return False, "File size must be less than 5MB"
    
    return True, "Valid PDF"


def extract_text_from_pdf(contents: bytes) -> tuple[str, int]:
    """
    Extract text from PDF with OCR fallback for scanned PDFs
    Returns: (text, page_count)
    """
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        page_count = len(pdf_reader.pages)
        resume_text = ""
        
        for page in pdf_reader.pages:
            resume_text += page.extract_text() or ""
        
        # If no text extracted, it might be a scanned PDF
        if not resume_text.strip():
            # Try OCR (if available)
            try:
                import pytesseract
                from pdf2image import convert_from_bytes
                from PIL import Image
                
                print("📄 Scanned PDF detected, using OCR...")
                
                # Convert PDF to images
                images = convert_from_bytes(contents)
                
                # Extract text from each image
                ocr_text = ""
                for i, image in enumerate(images):
                    print(f"  Processing page {i+1}/{len(images)}...")
                    page_text = pytesseract.image_to_string(image)
                    ocr_text += page_text + "\n"
                
                if ocr_text.strip():
                    print("✓ OCR extraction successful")
                    return ocr_text, page_count
                else:
                    return "", page_count
                    
            except ImportError:
                # OCR libraries not installed
                return "", page_count
            except Exception as e:
                print(f"OCR error: {e}")
                return "", page_count
        
        return resume_text, page_count
        
    except PyPDF2.errors.PdfReadError:
        raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


router = APIRouter(prefix="/api/career", tags=["Career & Placement"])


@router.post("/resume-upload")
@rate_limit("10/minute")  # Rate limit for heavy AI endpoint
async def upload_resume(request: Request, file: UploadFile = File(...)):
    """
    Upload and analyze resume PDF with security improvements
    - Secure file validation (extension + MIME type)
    - OCR support for scanned PDFs
    - Prompt length limiting
    """
    
    # Read file contents
    contents = await file.read()
    
    # Secure validation
    is_valid, message = validate_pdf_file(file, contents)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Extract text (with OCR fallback)
    resume_text, page_count = extract_text_from_pdf(contents)
    
    if not resume_text.strip():
        raise HTTPException(
            status_code=400, 
            detail="Could not extract text from PDF. This might be a scanned image without OCR support. Please install pytesseract and pdf2image for OCR support."
        )
    
    # Limit prompt length to prevent AI crashes
    original_length = len(resume_text)
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000]
        print(f"⚠️ Resume text truncated from {original_length} to 4000 chars")
    
    # Analyze the extracted text
    result = ai_service.analyze_resume(resume_text)
    result["filename"] = file.filename
    result["pages"] = page_count
    result["extractedText"] = resume_text
    result["truncated"] = original_length > 4000
    
    return result


@router.post("/resume-analyze")
@rate_limit("10/minute")  # Rate limit for heavy AI endpoint
async def analyze_resume(request: Request, req: ResumeAnalyzeRequest):
    """
    Analyze resume text for ATS compatibility and improvements
    - Prompt length limiting
    - Security validation
    """
    
    if not req.resumeText or len(req.resumeText.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short")
    
    # Limit prompt length
    resume_text = req.resumeText
    original_length = len(resume_text)
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000]
    
    result = ai_service.analyze_resume(resume_text)
    result["truncated"] = original_length > 4000
    
    return result


@router.post("/resume-ats-score")
@rate_limit("10/minute")
async def get_ats_score(request: Request, req: ResumeAnalyzeRequest, db: Session = Depends(get_db)):
    """
    Get detailed ATS score breakdown
    
    Returns:
    - Overall ATS Score (0-100)
    - Keywords Score (0-100)
    - Formatting Score (0-100)
    - Skills Score (0-100)
    - Experience Score (0-100)
    - Detailed recommendations
    """
    
    if not req.resumeText or len(req.resumeText.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short")
    
    # Limit prompt length
    resume_text = req.resumeText[:4000]
    
    result = ai_service.calculate_ats_score(resume_text)
    return result


@router.post("/job-match")
@rate_limit("10/minute")
async def match_job_description(
    request: Request,
    resume_text: str = Form(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Match resume against job description
    
    Returns:
    - Match Score (0-100)
    - Missing Skills
    - Matching Skills
    - Recommendations
    - Gap Analysis
    """
    
    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short")
    
    if not job_description or len(job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description is too short")
    
    # Limit prompt lengths
    resume_text = resume_text[:4000]
    job_description = job_description[:2000]
    
    result = ai_service.match_resume_to_job(resume_text, job_description)
    return result


@router.post("/interview-prep")
@rate_limit("10/minute")
async def interview_preparation(request: Request, req: InterviewPrepRequest):
    """Get company-specific interview preparation"""
    result = ai_service.interview_prep(req.company, req.role)
    return result


@router.post("/resume-generate")
@rate_limit("10/minute")  # Rate limit for heavy AI endpoint
async def generate_resume(request: Request, req: ResumeGenerateRequest):
    """
    Generate improved resume PDF from resume text
    - Prompt length limiting
    """
    
    if not req.resumeText or len(req.resumeText.strip()) < 40:
        raise HTTPException(status_code=400, detail="Resume text is too short to generate updated PDF")
    
    # Limit prompt length
    resume_text = req.resumeText[:4000]
    
    updated_resume = ai_service.generate_updated_resume(resume_text)
    pdf_buffer = _create_resume_pdf_bytes(updated_resume, req.templateType)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=updated_resume.pdf"}
    )


@router.post("/resume-generate-upload")
@rate_limit("10/minute")  # Rate limit for heavy AI endpoint
async def generate_resume_from_upload(
    request: Request,
    file: UploadFile = File(...),
    template_type: str = Form("classic")
):
    """
    Generate improved resume PDF directly from uploaded source resume PDF
    - Secure file validation
    - OCR support for scanned PDFs
    - Prompt length limiting
    """
    
    # Read file contents
    contents = await file.read()
    
    # Secure validation
    is_valid, message = validate_pdf_file(file, contents)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Extract text (with OCR fallback)
    resume_text, page_count = extract_text_from_pdf(contents)
    
    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF. This might be a scanned image without OCR support."
        )
    
    # Limit prompt length
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000]
    
    updated_resume = ai_service.generate_updated_resume(resume_text)
    pdf_buffer = _create_resume_pdf_bytes(updated_resume, template_type)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=updated_resume.pdf"}
    )



# ============================================================================
# 📁 FILE: routes/payment_routes.py
# ============================================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import PaymentCheckoutRequest, PaymentVerifyRequest
from config import settings
import json

router = APIRouter(prefix="/api/payment", tags=["Payment"])

# Demo payment plans
PLANS = {
    "free": {"name": "Free", "price": 0, "currency": "INR"},
    "basic": {"name": "Basic", "monthly": 299, "yearly": 2999, "currency": "INR"},
    "pro": {"name": "Pro", "monthly": 599, "yearly": 5999, "currency": "INR"}
}

@router.get("/plans")
def get_plans():
    """Get all available plans"""
    return {
        "plans": PLANS,
        "note": "Demo pricing - Configure Stripe/Razorpay in production"
    }

@router.post("/checkout")
def create_checkout(request: PaymentCheckoutRequest, db: Session = Depends(get_db)):
    """
    Create payment checkout session
    DEMO MODE - Using demo API keys
    """
    plan = PLANS.get(request.plan)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # In production, create actual Stripe/Razorpay session:
    # import stripe
    # stripe.api_key = settings.stripe_api_key
    # session = stripe.checkout.Session.create(...)
    
    # Demo response
    return {
        "status": "success",
        "sessionId": f"demo_session_{request.plan}_{request.paymentMethod}",
        "checkoutUrl": "https://demo-payment-url.com",
        "plan": request.plan,
        "amount": plan.get("monthly", 0) if "monthly" in plan else 0,
        "currency": plan.get("currency", "INR"),
        "note": "DEMO MODE - Using demo API keys. Configure real Stripe/Razorpay keys in .env",
        "demoKeys": {
            "stripe": settings.stripe_api_key,
            "razorpay": settings.razorpay_key_id
        }
    }

@router.post("/verify")
def verify_payment(request: PaymentVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify payment after completion
    DEMO MODE
    """
    # In production, verify with payment provider:
    # session = stripe.checkout.Session.retrieve(request.sessionId)
    
    # Demo response
    return {
        "status": "verified",
        "sessionId": request.sessionId,
        "paymentStatus": "completed",
        "note": "Demo verification - would check actual payment status in production"
    }

@router.post("/webhook")
async def payment_webhook(payload: dict):
    """
    Handle payment provider webhooks
    DEMO MODE
    """
    # In production:
    # Verify webhook signature
    # Update database based on payment status
    # Send confirmation emails
    
    return {
        "status": "received",
        "note": "Demo webhook handler"
    }



# ============================================================================
# 📁 FILE: routes/admin_routes.py
# ============================================================================
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




# ============================================================================
# 📁 FILE: routes/company_routes.py
# ============================================================================
"""
Company Interview Questions Routes
SEO-optimized endpoints for top interview questions by company
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import CompanyQuestion, DifficultyLevel, QuestionCategory
from ai_service import ai_service
from schemas import CompanyQuestionRequest, CompanyInsightsRequest
from sqlalchemy import desc, func
from middleware import rate_limit

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



# ============================================================================
# 📁 FILE: routes/company_prep_routes.py
# ============================================================================
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


# ============================================================================
# 📁 FILE: routes/public_routes.py
# ============================================================================
"""Public routes - no authentication required"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import CompanyQuestion, QuestionCategory, DifficultyLevel

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


