from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.database import engine, Base
from app.core.config import settings
from app.services.ai_service import ai_service
from app.core.middleware import (
    SecurityHeadersMiddleware,
    RequestValidationMiddleware,
    RequestLoggingMiddleware,
    IPBlockingMiddleware,
    RateLimitMiddleware,
    SystemHealthTrackingMiddleware,
    limiter,
    rate_limit
)
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import logging

# Import routes
from app.routes import auth_routes, chat_routes, exam_routes, coding_routes, career_routes, payment_routes, admin_routes, company_routes, company_prep_routes, public_routes, aptitude_routes, dsa_ai_routes

logger = logging.getLogger(__name__)


def _build_allowed_origins() -> list[str]:
    local_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ]

    configured_origins = [
        origin.strip()
        for origin in settings.frontend_urls.split(",")
        if origin.strip()
    ]

    default_prod_origins = [
        "https://ai-student-assistant-xi.vercel.app",
        "https://ai-student-assistant.vercel.app",
    ]

    all_origins = local_origins + configured_origins + default_prod_origins
    return list(dict.fromkeys(all_origins))

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure usage-limit columns exist for existing deployments (e.g., Supabase/Postgres)
try:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS queries_today INTEGER DEFAULT 0"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_query_date DATE"))
        
        # Create aptitude_exam_history table if it doesn't exist
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS aptitude_exam_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                company VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                difficulty VARCHAR(20) NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                correct INTEGER NOT NULL,
                wrong INTEGER NOT NULL,
                skipped INTEGER NOT NULL,
                score_percent DECIMAL(5,2) NOT NULL,
                exam_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                questions_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Create indexes for aptitude_exam_history
        connection.execute(text("CREATE INDEX IF NOT EXISTS idx_exam_history_date ON aptitude_exam_history(exam_date DESC)"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS idx_exam_history_company ON aptitude_exam_history(company)"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS idx_exam_history_user ON aptitude_exam_history(user_id)"))
        
        print("✅ Database schema synced successfully (including aptitude_exam_history)")
except Exception as migration_error:
    print(f"⚠️ Could not run startup schema sync: {migration_error}")

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered placement preparation assistant for engineering students"
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

# Add rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.on_event("startup")
async def startup_event():
    """
    Warm up database connection pool on startup.
    This ensures first requests are fast by pre-creating connections.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection pool warmed up")
    except Exception as e:
        logger.error(f"⚠️ Failed to warm up connection pool: {e}")


@app.on_event("startup")
async def log_startup_info():
    """Log important startup information"""
    logger.info(f"🚀 {settings.app_name} v{settings.app_version} starting...")
    logger.info(f"📊 Environment: {settings.environment}")
    logger.info(f"🔐 Google OAuth: {'Enabled' if settings.google_client_id else 'Disabled'}")
    logger.info(f"🤖 AI Service: {'Configured' if ai_service.use_ai else 'Demo Mode'}")
    logger.info(f"💾 Database pool: size=10, max_overflow=20")
    logger.info(f"⚡ Keep-alive endpoint: /ping (use for Render)")


# Security Middleware (order matters!)
# --- AA PASTE KARO ---

# 1. Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# 2. IP Blocking & Validation
app.add_middleware(IPBlockingMiddleware)
app.add_middleware(RequestValidationMiddleware)

# 3. Request Logging
app.add_middleware(RequestLoggingMiddleware)

# 4. System Health Tracking
app.add_middleware(SystemHealthTrackingMiddleware)

# 5. Rate Limiting
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)

# 6. CORS Middleware (Added LAST so it wraps all middleware and handles preflight early)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_allowed_origins(),
    allow_origin_regex=r"https://[a-z0-9-]+\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
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
app.include_router(aptitude_routes.router)  # Real aptitude questions from database
app.include_router(dsa_ai_routes.router, prefix="/api/dsa/ai", tags=["DSA AI"])  # DSA AI Assistant

# Import admin enhancements routes
from app.routes import admin_enhancements_routes
app.include_router(admin_enhancements_routes.router, tags=["Admin Enhancements"])

# Import growth features routes
from app.routes import growth_routes
app.include_router(growth_routes.router, tags=["Growth Features"])

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


@app.get("/ping")
@rate_limit("60/minute")  # Higher rate limit for keep-alive pings
async def ping(request: Request):
    """
    Lightweight keep-alive endpoint for preventing cold starts on Render.
    
    Use with cron-job services like:
    - cron-job.org
    - UptimeRobot
    - Render Cron Jobs
    
    Recommended: Ping every 10-14 minutes to keep instance warm
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Server is warm and ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
