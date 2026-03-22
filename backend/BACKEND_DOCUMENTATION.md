# CodeCampus AI - Backend Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [API Routes](#api-routes)
5. [Database Models](#database-models)
6. [Security & Middleware](#security--middleware)
7. [AI Service](#ai-service)
8. [Setup & Deployment](#setup--deployment)

---

## 🎯 Overview

CodeCampus AI is a FastAPI-based backend for an AI-powered placement preparation platform for engineering students. It provides:

- **Authentication**: JWT-based auth with Google OAuth support
- **AI Chat**: Multi-language chat with Gemini AI (English, Hindi, Gujarati)
- **Aptitude Tests**: Company-specific mock tests (TCS, Infosys, Amazon, etc.)
- **Coding Help**: DSA hints, code explanation, debugging
- **Career Tools**: Resume analysis, interview prep, company questions
- **Admin Panel**: Manage questions, users, and content

**Tech Stack:**
- FastAPI 0.115.6
- PostgreSQL (SQLAlchemy 2.0.36)
- Google Gemini AI
- JWT Authentication
- Rate Limiting & Security Middleware

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── core/                   # Core functionality
│   │   ├── auth.py            # JWT, password hashing, user auth
│   │   ├── config.py          # Environment settings
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── email.py           # OTP & welcome emails
│   │   └── middleware.py      # Security, rate limiting, logging
│   ├── models/                # Database models
│   │   ├── __init__.py        # SQLAlchemy models
│   │   └── schemas.py         # Pydantic request/response schemas
│   ├── routes/                # API endpoints
│   │   ├── auth_routes.py     # Login, register, Google OAuth
│   │   ├── chat_routes.py     # AI chat, streaming
│   │   ├── aptitude_routes.py # Aptitude tests
│   │   ├── coding_routes.py   # DSA challenges
│   │   ├── career_routes.py   # Resume, interview prep
│   │   ├── company_prep_routes.py  # Company-specific prep
│   │   ├── admin_routes.py    # Admin panel
│   │   └── ...
│   └── services/
│       └── ai_service.py      # Gemini AI integration
├── migrations/                # SQL migration scripts
├── .env                       # Environment variables
├── requirements.txt           # Python dependencies
├── runtime.txt               # Python version (3.11.9)
└── start.sh                  # Startup script
```

---


## 🔧 Core Components

### 1. `main.py` - Application Entry Point

**Purpose**: Initialize FastAPI app, configure middleware, include routers

**Key Features:**
- Creates database tables on startup
- Configures CORS for frontend origins (localhost + Vercel)
- Adds security middleware (headers, rate limiting, validation)
- Includes all API routers
- Health check endpoints

**Important Code:**
```python
# CORS Configuration
allow_origins = [
    "http://localhost:5173",  # Local dev
    "https://ai-student-assistant-xi.vercel.app"  # Production
]

# Middleware Order (IMPORTANT!)
1. SecurityHeadersMiddleware  # Add security headers
2. IPBlockingMiddleware       # Block suspicious IPs
3. RequestValidationMiddleware # Validate requests
4. RequestLoggingMiddleware   # Log requests
5. RateLimitMiddleware        # Rate limiting (100 req/min)
6. CORSMiddleware            # CORS (must be last!)
```

**Endpoints:**
- `GET /` - API info and status
- `GET /api/health` - Health check

**Database Auto-Migration:**
```python
# Creates aptitude_exam_history table if not exists
# Adds queries_today and last_query_date columns to users table
```

---

### 2. `core/config.py` - Configuration Management

**Purpose**: Load environment variables using Pydantic Settings

**Environment Variables:**
```python
# App
APP_NAME = "AI Student Assistant"
ENVIRONMENT = "development" | "production"

# Database
DATABASE_URL = "postgresql://user:pass@host:port/dbname"

# Security
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth
GOOGLE_CLIENT_ID = "your-google-client-id"

# Frontend CORS
FRONTEND_URLS = "http://localhost:5173,https://your-app.vercel.app"

# AI
GEMINI_API_KEY = "your-gemini-api-key"

# Email (SMTP)
MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 587
MAIL_USERNAME = "your-email@gmail.com"
MAIL_PASSWORD = "your-app-password"
MAIL_FROM = "noreply@codecampus.ai"
```

**Usage:**
```python
from app.core.config import settings
print(settings.database_url)
```

---

### 3. `core/database.py` - Database Connection

**Purpose**: SQLAlchemy engine and session management

**Key Components:**
```python
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for route handlers"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Usage in Routes:**
```python
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
```

---

### 4. `core/auth.py` - Authentication & Security

**Purpose**: JWT tokens, password hashing, user authentication

**Key Functions:**

#### Password Management
```python
# Hash password (PBKDF2-SHA256 + Bcrypt)
hashed = get_password_hash("mypassword123")

# Verify password
is_valid = verify_password("mypassword123", hashed)

# Validate password strength
is_valid, message = validate_password_strength("weak")
# Requirements: 8+ chars, 1 letter, 1 number, 1 special char
```

#### JWT Tokens
```python
# Create access token (15 minutes)
access_token = create_access_token(
    data={"sub": user.email, "user_id": user.id},
    expires_delta=timedelta(minutes=15)
)

# Create refresh token (7 days)
refresh_token, expires = create_refresh_token(
    data={"sub": user.email, "user_id": user.id}
)

# Decode token
payload = decode_token(token)
```

#### User Authentication
```python
# Get current user from JWT
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
```

#### Security Features
- **Account Locking**: 5 failed login attempts → 15 min lock
- **Token Blacklisting**: Logout revokes tokens
- **Email Normalization**: Lowercase + trim
- **Password Strength Validation**: Enforced on registration

---

### 5. `core/email.py` - Email Service

**Purpose**: Send OTP and welcome emails via SMTP

**Functions:**

#### Send OTP Email
```python
send_otp_email(email="user@example.com", otp="123456")
# Sends 6-digit OTP for password reset
# Valid for 10 minutes
```

#### Send Welcome Email
```python
send_welcome_email(email="user@example.com", name="John")
# Sends HTML welcome email to new users
# Includes feature overview and dashboard link
```

**Mock Mode:**
If SMTP credentials not configured, emails are logged to console for development.

---

### 6. `core/middleware.py` - Security Middleware

**Purpose**: Security headers, rate limiting, request validation, logging

**Middleware Classes:**

#### 1. SecurityHeadersMiddleware
```python
# Adds security headers to all responses
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Cross-Origin-Opener-Policy: same-origin-allow-popups  # For Google OAuth
Cross-Origin-Embedder-Policy: unsafe-none
```

#### 2. RequestValidationMiddleware
```python
# Validates incoming requests
- Blocks payloads > 10MB
- Checks content-type for POST/PUT
- Detects XSS, SQL injection, path traversal patterns
```

#### 3. RequestLoggingMiddleware
```python
# Logs all requests (without sensitive data)
[REQUEST] GET /api/chat from 192.168.1.1
[RESPONSE] /api/chat - Status: 200 - Time: 0.523s
```

#### 4. RateLimitMiddleware
```python
# Global rate limiting: 100 requests/minute per IP/user
# Returns 429 Too Many Requests if exceeded
```

#### 5. IPBlockingMiddleware
```python
# Blocks suspicious IPs (configurable)
BLOCKED_IPS = set()  # Can be loaded from database
```

**Rate Limit Decorator:**
```python
@router.post("/chat")
@rate_limit("30/minute")  # 30 requests per minute
async def chat(request: Request):
    pass
```

---


## 🛣️ API Routes

### Authentication Routes (`auth_routes.py`)

**Base Path:** `/api/auth`

#### POST `/register`
Register new user with email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "plan_type": "free",
    "is_admin": false
  }
}
```

**Features:**
- Password strength validation (8+ chars, letter, number, special char)
- Email normalization (lowercase, trim)
- Sends welcome email
- Returns JWT tokens

---

#### POST `/login`
Login with email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as register

**Features:**
- Account locking after 5 failed attempts (15 min)
- Resets failed attempts on success
- Validates Google OAuth users separately

---

#### POST `/google`
Google OAuth authentication

**Request:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response:** Same as register

**Features:**
- Verifies Google ID token
- Creates user if not exists
- No password required for OAuth users

---

#### POST `/refresh`
Refresh access token using refresh token

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "same_refresh_token",
  "token_type": "bearer"
}
```

---

#### POST `/logout`
Logout user (blacklist tokens)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Successfully logged out",
  "detail": "All tokens have been revoked"
}
```

---

#### POST `/forgot-password`
Request password reset OTP

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If this email is registered, you will receive an OTP shortly."
}
```

**Features:**
- Generates 6-digit OTP
- Stores HMAC-hashed OTP in database
- Valid for 10 minutes
- Sends email with OTP

---

#### POST `/reset-password`
Reset password using OTP

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "message": "Password updated successfully."
}
```

---

#### GET `/me`
Get current user info

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "plan_type": "free",
  "is_admin": false,
  "auth_provider": "local",
  "created_at": "2024-01-15T10:30:00"
}
```

---

### Chat Routes (`chat_routes.py`)

**Base Path:** `/api`

#### POST `/chat`
Send message to AI (authenticated)

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Explain binary search"}
  ],
  "language": "english"
}
```

**Response:**
```json
{
  "response": "Binary search is an efficient algorithm..."
}
```

**Features:**
- Multi-language support (English, Hindi, Gujarati)
- Auto-detects language from user message
- Saves chat history to database
- Tracks token usage
- Daily limits: Free (25), Basic (100), Pro (500)

---

#### POST `/chat/public`
Send message to AI (guest users, no auth)

**Request:** Same as `/chat`

**Response:** Same as `/chat`

**Features:**
- No authentication required
- No history saved
- Rate limited: 20 req/min

---

#### POST `/chat/stream`
Streaming chat (word-by-word like ChatGPT)

**Request:** Same as `/chat`

**Response:** Server-Sent Events (SSE)
```
data: {"chunk": "Binary"}
data: {"chunk": " search"}
data: {"chunk": " is"}
data: {"done": true}
```

**Features:**
- Real-time streaming
- Saves complete response after streaming
- Tracks token usage

---

#### GET `/chat/history`
Get user's chat history

**Query Params:** `limit=50` (default)

**Response:**
```json
{
  "history": [
    {
      "role": "user",
      "content": "Explain binary search",
      "language": "english",
      "timestamp": "2024-01-15T10:30:00"
    },
    {
      "role": "assistant",
      "content": "Binary search is...",
      "language": "english",
      "timestamp": "2024-01-15T10:30:05"
    }
  ]
}
```

---

#### DELETE `/chat/history`
Clear user's chat history

**Response:**
```json
{
  "message": "Chat history cleared"
}
```

---

#### POST `/upgrade-plan`
Upgrade user's plan after payment

**Request:**
```json
{
  "plan_type": "pro"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Plan upgraded to pro",
  "plan_type": "pro",
  "user_id": 1
}
```

---

### Aptitude Routes (`aptitude_routes.py`)

**Base Path:** `/api/aptitude`

#### GET `/test`
Fetch aptitude test questions (without answers)

**Query Params:**
- `company` (required): "TCS", "Infosys", "Amazon", etc.
- `difficulty` (required): "Easy", "Medium", "Hard"
- `limit` (optional): 1-50 (default: 5)

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "company": "TCS",
      "category": "Quantitative Aptitude",
      "difficulty": "Medium",
      "question": "If x + y = 10 and x - y = 2, find x?",
      "options": ["4", "5", "6", "7"],
      "year_asked": "2023"
    }
  ],
  "total_count": 5,
  "session_id": "uuid-here"
}
```

**Features:**
- No-repeat logic: Excludes answered questions
- Subscription limits: Free users (2 exams/category)
- Answers hidden until submission

---

#### POST `/submit`
Submit answers and get results

**Request:**
```json
{
  "session_id": "uuid-here",
  "answers": {
    "1": "6",
    "2": "Option B",
    "3": null
  }
}
```

**Response:**
```json
{
  "score": 2,
  "total_questions": 3,
  "correct": 2,
  "wrong": 0,
  "skipped": 1,
  "score_percent": 66.67,
  "questions": [
    {
      "id": 1,
      "question": "...",
      "correct_answer": "6",
      "user_answer": "6",
      "is_correct": true,
      "explanation": "x = (10+2)/2 = 6"
    }
  ]
}
```

**Features:**
- Reveals correct answers and explanations
- Saves exam history to database
- Calculates score percentage

---

#### GET `/history`
Get user's exam history

**Response:**
```json
[
  {
    "id": 1,
    "company": "TCS",
    "category": "Quantitative Aptitude",
    "difficulty": "Medium",
    "score": 4,
    "total_questions": 5,
    "correct": 4,
    "wrong": 1,
    "skipped": 0,
    "score_percent": 80.0,
    "exam_date": "2024-01-15T10:30:00"
  }
]
```

---

#### GET `/history/{exam_id}`
Get detailed exam results

**Response:**
```json
{
  "exam": {
    "id": 1,
    "company": "TCS",
    "score": 4,
    "total_questions": 5
  },
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "C",
      "user_answer": "C",
      "is_correct": true,
      "explanation": "..."
    }
  ]
}
```

---

#### GET `/companies`
Get list of all companies

**Response:**
```json
["TCS", "Infosys", "Amazon", "Google", "Microsoft"]
```

---

#### GET `/categories`
Get list of categories (optionally filtered by company)

**Query Params:** `company` (optional)

**Response:**
```json
["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"]
```

---

#### GET `/stats`
Get question statistics

**Query Params:** `company` (optional)

**Response:**
```json
{
  "total_questions": 500,
  "companies": 10,
  "categories": 5,
  "easy": 150,
  "medium": 250,
  "hard": 100
}
```

---

#### GET `/usage-stats`
Get user's exam usage statistics

**Response:**
```json
{
  "total_exams": 5,
  "usage_by_category": {
    "Quantitative Aptitude": 2,
    "Logical Reasoning": 3
  },
  "plan": "free",
  "limit_per_category": 2
}
```

---


### Coding Routes (`coding_routes.py`)

**Base Path:** `/api/coding`

#### POST `/help`
Get code explanation, debugging, or optimization

**Request:**
```json
{
  "code": "def factorial(n): return 1 if n == 0 else n * factorial(n-1)",
  "language": "python",
  "task": "explain"
}
```

**Response:**
```json
{
  "explanation": "This is a recursive function that calculates factorial..."
}
```

**Tasks:** `explain`, `debug`, `optimize`

---

#### POST `/dsa-hint`
Get hints for DSA problems (without spoiling solution)

**Request:**
```json
{
  "problem": "Find the longest palindromic substring"
}
```

**Response:**
```json
{
  "hint": "Consider using dynamic programming or expand around center approach..."
}
```

---

#### POST `/project-guide`
Get project guidance and roadmap

**Request:**
```json
{
  "projectType": "E-commerce Website",
  "techStack": ["React", "Node.js", "MongoDB"]
}
```

**Response:**
```json
{
  "roadmap": "Step 1: Setup...",
  "features": ["User auth", "Product catalog", "Cart"],
  "timeline": "8-10 weeks"
}
```

---

#### GET `/challenge/problem`
Get active DSA challenge problem

**Response:**
```json
{
  "id": 1,
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "constraints": "1 <= nums.length <= 10^4",
  "test_cases": "[{\"input\": [2,7,11,15], \"output\": [0,1]}]",
  "starter_code": "def twoSum(nums, target):\n    pass",
  "language": "python",
  "difficulty": "easy",
  "time_limit_seconds": 1800
}
```

---

#### GET `/challenge/questions`
List all active challenge questions

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "title": "Two Sum",
      "difficulty": "easy",
      "time_limit_seconds": 1800
    }
  ]
}
```

---

#### POST `/challenge/submit`
Submit challenge solution

**Request:**
```json
{
  "problem_id": 1,
  "code": "def twoSum(nums, target):\n    ...",
  "language": "python",
  "submission_reason": "manual",
  "time_left_seconds": 300,
  "disqualified": false
}
```

**Response:**
```json
{
  "passed": true,
  "success": true,
  "message": "Challenge solved successfully",
  "feedback": "Great job! Your submission has been accepted."
}
```

**Auto-Fail Conditions:**
- `disqualified: true` → Tab switching detected
- `time_left_seconds <= 0` → Timeout
- `code.length < 20` → Incomplete solution

---

#### POST `/challenge/reward`
Grant 15-day plan extension after 5 successful solves

**Request:**
```json
{
  "solved_count": 5
}
```

**Response:**
```json
{
  "message": "Reward granted. Plan expiry extended by 15 days.",
  "plan_expiry": "2024-02-15T10:30:00"
}
```

---

### Admin Routes (`admin_routes.py`)

**Base Path:** `/api/admin`

**Note:** All routes require admin authentication

#### GET `/tcs-aptitude-questions`
Get TCS aptitude questions with answers (admin only)

**Query Params:**
- `category` (optional): Filter by category
- `limit` (optional): Default 50

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "company": "TCS",
      "category": "Quantitative Aptitude",
      "difficulty": "Medium",
      "question": "If x + y = 10...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "C",
      "explanation": "x = (10+2)/2 = 6",
      "year_asked": "2023"
    }
  ],
  "total_count": 50
}
```

---

## 🗄️ Database Models

### User Model
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String)  # Null for OAuth users
    plan = Column(Enum(PlanType), default=PlanType.FREE)
    is_admin = Column(Boolean, default=False)
    auth_provider = Column(String, default="local")  # "local" or "google"
    
    # Usage tracking
    queries_today = Column(Integer, default=0)
    last_query_date = Column(Date)
    
    # Security
    failed_login_attempts = Column(Integer, default=0)
    account_locked_until = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Plan Types:**
- `FREE`: 25 queries/day, 2 exams/category
- `BASIC`: 100 queries/day, unlimited exams
- `PRO`: 500 queries/day, unlimited exams, priority support

---

### ChatHistory Model
```python
class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)  # "user" or "assistant"
    content = Column(Text)
    language = Column(String, default="english")
    timestamp = Column(DateTime, default=datetime.utcnow)
```

---

### RefreshToken Model
```python
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True)
    expires_at = Column(DateTime)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

### TokenBlacklist Model
```python
class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    
    id = Column(Integer, primary_key=True)
    token = Column(String, unique=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

### PasswordResetOTP Model
```python
class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False)
    otp_hash = Column(String, nullable=False)  # HMAC-SHA256 hash
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

### AptitudeExamHistory Model
```python
class AptitudeExamHistory(Base):
    __tablename__ = "aptitude_exam_history"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company = Column(String, nullable=False)
    category = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct = Column(Integer, nullable=False)
    wrong = Column(Integer, nullable=False)
    skipped = Column(Integer, nullable=False)
    score_percent = Column(Float, nullable=False)
    exam_date = Column(DateTime, default=datetime.utcnow)
    questions_data = Column(Text)  # JSON string
```

---

### UserUsage Model
```python
class UserUsage(Base):
    __tablename__ = "user_usage"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query_count = Column(Integer, default=0)
    total_input_tokens = Column(Integer, default=0)
    total_output_tokens = Column(Integer, default=0)
    month = Column(String)  # "2024-01"
    last_query_date = Column(DateTime)
```

---

### DSAChallengeProblem Model
```python
class DSAChallengeProblem(Base):
    __tablename__ = "dsa_challenge_problems"
    
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    constraints = Column(Text)
    test_cases = Column(Text)  # JSON string
    starter_code = Column(Text)
    language = Column(String, default="python")
    difficulty = Column(Enum(DifficultyLevel))
    time_limit_seconds = Column(Integer, default=1800)
    is_active = Column(Boolean, default=True)
```

---


## 🤖 AI Service (`ai_service.py`)

### Overview
Integrates Google Gemini AI for chat, code help, and content generation.

### Key Features
- **Multi-language Support**: English, Hindi, Gujarati
- **Streaming Responses**: Word-by-word output
- **Response Caching**: Reduces API costs
- **Token Tracking**: Monitors usage and costs
- **Retry Logic**: Handles transient errors (3 retries with exponential backoff)
- **Markdown Formatting**: Preserves bold, headings, code blocks

### Configuration
```python
class AIService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.use_ai = bool(self.api_key)
```

### Main Methods

#### 1. `chat_completion(messages)`
Standard chat completion (non-streaming)

```python
messages = [
    {"role": "user", "content": "Explain binary search"}
]
response = ai_service.chat_completion(messages)
# Returns: "Binary search is an efficient algorithm..."
```

**Features:**
- System context with persona rules
- No-repeat question enforcement
- Subscription limit awareness
- Markdown formatting

---

#### 2. `chat_completion_stream(messages)`
Streaming chat completion (word-by-word)

```python
for chunk in ai_service.chat_completion_stream(messages):
    print(chunk, end="", flush=True)
```

**Features:**
- Real-time streaming
- Same system context as non-streaming
- Yields text chunks as they arrive

---

#### 3. `explain_topic(topic, subject, level)`
Explain educational topics

```python
result = ai_service.explain_topic(
    topic="Binary Search",
    subject="Data Structures",
    level="beginner"
)
```

---

#### 4. `generate_notes(topic, format)`
Generate study notes

```python
result = ai_service.generate_notes(
    topic="Operating Systems",
    format="summary"  # or "detailed", "mindmap"
)
```

---

#### 5. `solve_doubt(question, subject)`
Solve student doubts

```python
result = ai_service.solve_doubt(
    question="What is the difference between stack and queue?",
    subject="Data Structures"
)
```

---

#### 6. `explain_code(code, language, task)`
Code explanation, debugging, optimization

```python
result = ai_service.explain_code(
    code="def factorial(n): return 1 if n == 0 else n * factorial(n-1)",
    language="python",
    task="explain"  # or "debug", "optimize"
)
```

---

#### 7. `dsa_hint(problem)`
Get DSA problem hints (without spoiling solution)

```python
result = ai_service.dsa_hint(
    problem="Find the longest palindromic substring"
)
```

---

#### 8. `calculate_ats_score(resume_text, target_role, job_description)`
Analyze resume and calculate ATS score

```python
result = ai_service.calculate_ats_score(
    resume_text="John Doe\nSoftware Engineer...",
    target_role="Full Stack Developer",
    job_description="Looking for React + Node.js developer..."
)
```

**Returns:**
```json
{
  "ats_score": 75,
  "strengths": ["Strong technical skills", "Relevant experience"],
  "improvements": ["Add more keywords", "Quantify achievements"],
  "keyword_match": ["React", "Node.js", "MongoDB"],
  "missing_keywords": ["Docker", "AWS"],
  "formatting_issues": ["Use bullet points", "Add section headers"]
}
```

---

### System Context (Persona)

The AI is configured with a specific persona:

```python
system_context = """
You are CodeCampus AI, an expert placement preparation assistant for engineering students.

CORE RULES:
1. NO REPEAT QUESTIONS: Never ask the same question twice in a conversation
2. SUBSCRIPTION LIMITS: Remind users about plan limits when appropriate
3. MARKDOWN: Use **bold** for emphasis, # for headings, ``` for code
4. CONCISE: Keep responses focused and actionable
5. MULTI-LANGUAGE: Respond in user's language (English/Hindi/Gujarati)

CAPABILITIES:
- Aptitude test preparation (TCS, Infosys, Amazon, etc.)
- DSA & coding help (hints, explanations, debugging)
- Resume analysis & ATS scoring
- Interview preparation
- Career guidance & roadmaps

TONE: Friendly, supportive, professional
"""
```

---

### Response Caching

Caches responses to reduce API costs:

```python
# Cache key: hash of (prompt + model)
cache_key = hashlib.md5(f"{prompt}{model}".encode()).hexdigest()

# Check cache before API call
if cache_key in self.response_cache:
    return self.response_cache[cache_key]

# Store in cache after API call
self.response_cache[cache_key] = response
```

**Cache Stats:**
```python
stats = ai_service.get_cache_stats()
# Returns: {
#   "cache_size": 150,
#   "cache_hits": 450,
#   "cache_misses": 200,
#   "hit_rate": 69.23,
#   "estimated_savings": "$12.50"
# }
```

---

### Token Tracking & Cost Estimation

Tracks token usage and estimates costs:

```python
# Gemini Pricing (as of 2024)
INPUT_COST_PER_1K = 0.00025   # $0.00025 per 1K input tokens
OUTPUT_COST_PER_1K = 0.00075  # $0.00075 per 1K output tokens

# Calculate cost
input_tokens = len(self.enc.encode(prompt))
output_tokens = len(self.enc.encode(response))

input_cost = (input_tokens / 1000) * INPUT_COST_PER_1K
output_cost = (output_tokens / 1000) * OUTPUT_COST_PER_1K
total_cost = input_cost + output_cost

print(f"💰 Cost: ${total_cost:.6f} (Input: {input_tokens}, Output: {output_tokens})")
```

---

### Retry Logic (Tenacity)

Handles transient errors with exponential backoff:

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((
        ServiceUnavailable,
        DeadlineExceeded,
        InternalServerError
    ))
)
def _generate_response(self, prompt):
    return self.model.generate_content(prompt)
```

**Retry Strategy:**
- Max 3 attempts
- Wait: 2s, 4s, 8s (exponential backoff)
- Only retry on transient errors

---

### Markdown Sanitization

Preserves markdown formatting while removing excessive newlines:

```python
def _sanitize_chat_output(self, text: str) -> str:
    """
    Clean up AI response while preserving markdown formatting
    - Keeps **bold** and # headings
    - Removes excessive newlines (3+ → 2)
    - Preserves code blocks
    """
    # Remove excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Trim whitespace
    text = text.strip()
    
    return text
```

---

## 🔒 Security Features

### 1. Password Security
- **Hashing**: PBKDF2-SHA256 + Bcrypt
- **Strength Validation**: 8+ chars, letter, number, special char
- **Account Locking**: 5 failed attempts → 15 min lock

### 2. JWT Security
- **Access Token**: 15 minutes (short-lived)
- **Refresh Token**: 7 days (long-lived)
- **Token Blacklisting**: Logout revokes tokens
- **Token Type Validation**: Prevents token misuse

### 3. Rate Limiting
- **Global**: 100 requests/minute per IP/user
- **Endpoint-specific**: Custom limits per route
- **Response Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### 4. Request Validation
- **Payload Size**: Max 10MB
- **Content-Type**: Validates POST/PUT requests
- **Pattern Detection**: Blocks XSS, SQL injection, path traversal

### 5. Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

### 6. CORS Configuration
- **Allowed Origins**: Localhost + Vercel domains
- **Credentials**: Enabled for cookies/auth
- **Methods**: All HTTP methods
- **Headers**: All headers allowed

### 7. OTP Security
- **Hashing**: HMAC-SHA256 (not stored in plaintext)
- **Expiry**: 10 minutes
- **One-time Use**: Marked as used after verification
- **Constant-time Comparison**: Prevents timing attacks

---

## 🚀 Setup & Deployment

### Local Development

#### 1. Install Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Configure Environment
Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Security
SECRET_KEY=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Frontend
FRONTEND_URLS=http://localhost:5173

# AI
GEMINI_API_KEY=your-gemini-api-key

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

#### 3. Run Server
```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using start script
./start.sh
```

#### 4. Access API
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

---

### Production Deployment (Render)

#### 1. Create Render Account
Sign up at https://render.com

#### 2. Create PostgreSQL Database
- Go to Dashboard → New → PostgreSQL
- Copy `DATABASE_URL` (Internal URL)

#### 3. Create Web Service
- Go to Dashboard → New → Web Service
- Connect GitHub repository
- Configure:
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - **Environment**: Python 3.11.9

#### 4. Add Environment Variables
Add all variables from `.env` to Render dashboard

#### 5. Deploy
- Click "Create Web Service"
- Render will auto-deploy on every git push

---

### Database Migrations

#### Manual Migrations
```bash
cd backend/migrations

# Run migration
psql $DATABASE_URL < create_aptitude_exam_history.sql
```

#### Auto-Migration (on startup)
The app automatically creates tables and adds columns on startup:
```python
# In main.py
Base.metadata.create_all(bind=engine)

# Add missing columns
connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS queries_today INTEGER"))
```

---

## 📊 Monitoring & Logging

### Request Logging
```python
[REQUEST] POST /api/chat from 192.168.1.1
[RESPONSE] /api/chat - Status: 200 - Time: 0.523s
```

### Error Logging
```python
[ERROR] /api/chat - Error: ValueError - Time: 0.123s
```

### Token Usage Logging
```python
💰 Cost: $0.001250 (Input: 500 tokens, Output: 1000 tokens)
```

### Cache Stats
```python
📊 Cache Stats:
- Size: 150 entries
- Hits: 450 (69.23%)
- Misses: 200
- Savings: $12.50
```

---

## 🧪 Testing

### Manual Testing (Swagger UI)
Visit http://localhost:8000/docs for interactive API testing

### cURL Examples

#### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

#### Chat (Authenticated)
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain binary search"}
    ]
  }'
```

---

## 📝 Common Issues & Solutions

### Issue 1: Database Connection Error
**Error:** `could not connect to server`

**Solution:**
```bash
# Check DATABASE_URL format
DATABASE_URL=postgresql://user:password@host:port/database

# Test connection
psql $DATABASE_URL
```

---

### Issue 2: Google OAuth Not Working
**Error:** `Invalid Google authentication token`

**Solution:**
1. Verify `GOOGLE_CLIENT_ID` matches frontend
2. Add authorized origins in Google Cloud Console
3. Wait 5-10 minutes for changes to propagate

---

### Issue 3: Rate Limit Exceeded
**Error:** `429 Too Many Requests`

**Solution:**
```python
# Increase rate limit in middleware.py
app.add_middleware(RateLimitMiddleware, requests_per_minute=200)

# Or add custom limit to specific route
@router.post("/chat")
@rate_limit("50/minute")  # Increase from 30
```

---

### Issue 4: Email Not Sending
**Error:** `Could not deliver OTP email`

**Solution:**
1. Enable "Less secure app access" in Gmail (or use App Password)
2. Check SMTP credentials in `.env`
3. Test SMTP connection:
```python
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your-email@gmail.com', 'your-password')
```

---

### Issue 5: Gemini API Error
**Error:** `ServiceUnavailable` or `DeadlineExceeded`

**Solution:**
- Retry logic handles this automatically (3 retries)
- Check API key validity
- Verify API quota in Google Cloud Console

---

## 🔗 Useful Links

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org
- **Google Gemini API**: https://ai.google.dev/docs
- **Render Deployment**: https://render.com/docs
- **JWT.io**: https://jwt.io (decode tokens)

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API docs at `/docs`
3. Check logs in Render dashboard
4. Contact: support@codecampus.ai

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Python:** 3.11.9  
**FastAPI:** 0.115.6
