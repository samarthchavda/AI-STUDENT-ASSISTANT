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
    
    # Profile fields
    phone = Column(String, nullable=True)
    phone_verified = Column(Boolean, default=False)
    college = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    cgpa = Column(String, nullable=True)
    graduation_year = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    
    # DSA Solution tracking
    solutions_viewed = Column(Integer, default=0)
    
    # Subscription tracking
    subscription_source = Column(String, default='free')  # 'free', 'payment', 'admin_grant', 'promo'
    plan_updated_by = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    plan_updated_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    user_progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    practice_history = relationship("UserPractice", back_populates="user", cascade="all, delete-orphan")
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
    similar_questions = Column(String)  # Problem references
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


class UserUsage(Base):
    """Track AI usage and token consumption per user"""
    __tablename__ = "user_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    query_count = Column(Integer, default=0)
    total_input_tokens = Column(Integer, default=0)
    total_output_tokens = Column(Integer, default=0)
    last_query_date = Column(DateTime, default=datetime.utcnow)
    month = Column(String, index=True)  # Format: "2024-03"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    """Store platform-wide notifications and broadcasts"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Broadcast(Base):
    """Store broadcast history for admin tracking"""
    __tablename__ = "broadcasts"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    target_audience = Column(String, nullable=False)  # 'all', 'pro', 'basic', 'free'
    users_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class EngineeringStudyMaterial(Base):
    """Store comprehensive study materials for all engineering branches"""
    __tablename__ = "engineering_study_material"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_name = Column(String, nullable=False, index=True)  # "Python Basics", "Arduino Programming", "Circuit Analysis"
    branch = Column(String, nullable=False, index=True)  # "CE", "IT", "ICT", "EC", "IOT", "ALL"
    category = Column(String, nullable=False)  # "Programming", "Theory", "Hardware", "Project"
    concept_explanation = Column(Text, nullable=False)  # Detailed concept explanation
    practical_application = Column(Text)  # How to use in real projects
    code_example = Column(Text)  # Code snippets or circuit diagrams
    step_by_step_guide = Column(Text)  # How to run/implement
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.MEDIUM)
    keywords = Column(String)  # Comma-separated: "python,programming,loops,functions"
    related_topics = Column(String)  # Comma-separated related topic names
    companies_asking = Column(String)  # Companies that ask about this topic
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)




# ============================================================================
# DSA PRACTICE MODULE MODELS
# ============================================================================

class DSATopic(str, enum.Enum):
    ARRAYS = "arrays"
    STRINGS = "strings"
    LINKED_LISTS = "linked_lists"
    STACKS = "stacks"
    QUEUES = "queues"
    TREES = "trees"
    GRAPHS = "graphs"
    DYNAMIC_PROGRAMMING = "dynamic_programming"
    GREEDY = "greedy"
    BACKTRACKING = "backtracking"
    SORTING = "sorting"
    SEARCHING = "searching"
    HASHING = "hashing"
    HEAPS = "heaps"
    TRIES = "tries"
    BIT_MANIPULATION = "bit_manipulation"


class DSALanguage(str, enum.Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    CPP = "cpp"
    JAVA = "java"


class DSASubmissionStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    RUNTIME_ERROR = "runtime_error"
    COMPILATION_ERROR = "compilation_error"


class DSAProblem(Base):
    """Store generated DSA problems"""
    __tablename__ = "dsa_problems"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    topic = Column(Enum(DSATopic), nullable=False, index=True)
    difficulty = Column(Enum(DifficultyLevel), nullable=False, index=True)
    company = Column(String, nullable=True, index=True)
    constraints = Column(Text, nullable=True)
    examples = Column(Text, nullable=True)  # JSON string
    starter_code_python = Column(Text, nullable=True)
    starter_code_javascript = Column(Text, nullable=True)
    starter_code_cpp = Column(Text, nullable=True)
    test_cases = Column(Text, nullable=True)  # JSON string
    solution = Column(Text, nullable=True)
    hints = Column(Text, nullable=True)  # JSON array
    solutions_cache = Column(Text, nullable=True)  # JSON: {"python": "...", "javascript": "...", "cpp": "..."}
    time_complexity = Column(String, nullable=True)
    space_complexity = Column(String, nullable=True)
    is_daily_challenge = Column(Boolean, default=False)
    daily_challenge_date = Column(Date, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    submissions = relationship("DSASubmission", back_populates="problem", cascade="all, delete-orphan")
    progress = relationship("DSAProgress", back_populates="problem", cascade="all, delete-orphan")


class DSASubmission(Base):
    """Track user code submissions"""
    __tablename__ = "dsa_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("dsa_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(Text, nullable=False)
    language = Column(Enum(DSALanguage), nullable=False)
    status = Column(Enum(DSASubmissionStatus), nullable=False)
    execution_time = Column(Integer, nullable=True)  # milliseconds
    memory_used = Column(Integer, nullable=True)  # KB
    test_cases_passed = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    score = Column(Integer, default=0)  # 0-100
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User")
    problem = relationship("DSAProblem", back_populates="submissions")


class DSAProgress(Base):
    """Track user progress per problem"""
    __tablename__ = "dsa_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("dsa_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(Enum(DSATopic), nullable=False, index=True)
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    status = Column(String, default="attempted")  # attempted, solved, mastered
    attempts = Column(Integer, default=0)
    best_score = Column(Integer, default=0)
    hints_used = Column(Integer, default=0)
    time_spent = Column(Integer, default=0)  # seconds
    first_attempted_at = Column(DateTime, default=datetime.utcnow)
    last_attempted_at = Column(DateTime, default=datetime.utcnow)
    solved_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User")
    problem = relationship("DSAProblem", back_populates="progress")


class DSAUserStats(Base):
    """Aggregate user statistics for leaderboard"""
    __tablename__ = "dsa_user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    total_solved = Column(Integer, default=0)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    total_attempts = Column(Integer, default=0)
    accuracy = Column(Integer, default=0)  # percentage
    total_score = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_solved_date = Column(Date, nullable=True)
    rank = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")


class DSAHint(Base):
    """Track hints requested by users"""
    __tablename__ = "dsa_hints"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("dsa_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    hint_level = Column(Integer, default=1)  # 1, 2, 3 (progressive)
    hint_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    problem = relationship("DSAProblem")


# ============================================================================
# ADMIN PANEL ENHANCEMENTS
# ============================================================================

class SystemHealthLog(Base):
    """Track system health metrics for monitoring"""
    __tablename__ = "system_health_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_type = Column(String, nullable=False, index=True)  # 'gemini_api', 'database_query', 'api_endpoint'
    endpoint = Column(String, nullable=True)
    response_time_ms = Column(Integer, nullable=False)
    status = Column(String, nullable=False)  # 'success', 'error', 'timeout'
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class AdminAuditLog(Base):
    """Track all admin actions for audit trail"""
    __tablename__ = "admin_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String, nullable=False, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action_details = Column(Text, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    admin = relationship("User", foreign_keys=[admin_id])
    target_user = relationship("User", foreign_keys=[target_user_id])


class UserSession(Base):
    """Track active user sessions for online/offline status"""
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token = Column(String, unique=True, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    last_activity = Column(DateTime, default=datetime.utcnow, index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")



# ============================================================================
# GROWTH & STARTUP FEATURES
# ============================================================================

class Referral(Base):
    """Track user referrals for growth"""
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True, index=True)
    referrer_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    referred_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    referral_code = Column(String, nullable=False, index=True)
    status = Column(String, default="pending")  # pending, completed, rewarded
    reward_given = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_user_id])
    referred = relationship("User", foreign_keys=[referred_user_id])


class UserEngagementLog(Base):
    """Track user engagement for analytics"""
    __tablename__ = "user_engagement_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String, nullable=False, index=True)
    action_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User")


class LeaderboardHistory(Base):
    """Track leaderboard rank changes over time"""
    __tablename__ = "leaderboard_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rank = Column(Integer, nullable=False)
    total_solved = Column(Integer, nullable=False)
    accuracy = Column(Integer, nullable=False)
    total_score = Column(Integer, nullable=False)
    snapshot_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")


class EmailCampaign(Base):
    """Track email campaigns for marketing"""
    __tablename__ = "email_campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_name = Column(String, nullable=False)
    campaign_type = Column(String, nullable=False)  # nudge, promotion, announcement, welcome
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    target_audience = Column(String, nullable=True)
    sent_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    clicked_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class EmailLog(Base):
    """Track individual email sends"""
    __tablename__ = "email_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("email_campaigns.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String, nullable=False)
    status = Column(String, nullable=False, index=True)  # sent, delivered, opened, clicked, bounced, failed
    sent_at = Column(DateTime, default=datetime.utcnow)
    opened_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    campaign = relationship("EmailCampaign")
    user = relationship("User")


class RevenueAnalytics(Base):
    """Daily revenue analytics for business metrics"""
    __tablename__ = "revenue_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, index=True)
    total_revenue = Column(Integer, default=0)
    total_transactions = Column(Integer, default=0)
    new_pro_users = Column(Integer, default=0)
    new_basic_users = Column(Integer, default=0)
    churned_users = Column(Integer, default=0)
    refund_amount = Column(Integer, default=0)
    mrr = Column(Integer, default=0)  # Monthly Recurring Revenue
    arr = Column(Integer, default=0)  # Annual Recurring Revenue
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
