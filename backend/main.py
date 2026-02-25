from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import settings

# Import routes
from routes import auth_routes, chat_routes, exam_routes, coding_routes, career_routes, payment_routes, admin_routes

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered learning assistant for students"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(chat_routes.router)
app.include_router(exam_routes.router)
app.include_router(coding_routes.router)
app.include_router(career_routes.router)
app.include_router(payment_routes.router)
app.include_router(admin_routes.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def root():
    return {
        "message": "Welcome to AI Student Assistant API",
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
        "note": "API is in demo mode. Configure real API keys for full functionality."
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment,
        "database": "connected",
        "ai_service": "demo mode"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
