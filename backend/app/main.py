from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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
from app.routes import auth_routes, chat_routes, exam_routes, coding_routes, career_routes, payment_routes, admin_routes, company_routes, company_prep_routes, public_routes

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
# --- AA PASTE KARO ---

# 1. CORS Middleware (Must be FIRST to handle pre-flight requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# 2. Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# 3. IP Blocking & Validation
app.add_middleware(IPBlockingMiddleware)
app.add_middleware(RequestValidationMiddleware)

# 4. Request Logging
app.add_middleware(RequestLoggingMiddleware)

# 5. Rate Limiting (Last)
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)

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
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
