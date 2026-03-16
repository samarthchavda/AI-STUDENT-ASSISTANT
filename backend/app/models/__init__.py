from sqlalchemy import Column, Integer, String, DateTime, Date, Text, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

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
    queries_today = Column(Integer, default=0)
    last_query_date = Column(Date, nullable=True)
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


class PasswordResetOTP(Base):
    """Store HMAC-SHA256-hashed OTPs for password reset (10-minute expiry)"""
    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp_hash = Column(String, nullable=False)  # HMAC-SHA256 of the 6-digit OTP
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


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


class DSAChallengeProblem(Base):
    __tablename__ = "dsa_challenge_problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    constraints = Column(Text, nullable=True)
    test_cases = Column(Text, nullable=True)
    starter_code = Column(Text, nullable=True)
    language = Column(String, default="python")
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.MEDIUM)
    time_limit_seconds = Column(Integer, default=1800)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
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
