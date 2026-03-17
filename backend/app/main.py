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
    limiter,
    rate_limit
)
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Import routes
from app.routes import auth_routes, chat_routes, exam_routes, coding_routes, career_routes, payment_routes, admin_routes, company_routes, company_prep_routes, public_routes, aptitude_routes


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
except Exception as migration_error:
    print(f"⚠️ Could not run startup schema sync for usage limits: {migration_error}")

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
# --- AA PASTE KARO ---

# 1. Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# 2. IP Blocking & Validation
app.add_middleware(IPBlockingMiddleware)
app.add_middleware(RequestValidationMiddleware)

# 3. Request Logging
app.add_middleware(RequestLoggingMiddleware)

# 4. Rate Limiting
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)

# 5. CORS Middleware (Added LAST so it wraps all middleware and handles preflight early)
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
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
