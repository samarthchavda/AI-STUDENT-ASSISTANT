from fastapi import APIRouter
from schemas import ResumeAnalyzeRequest, InterviewPrepRequest
from ai_service import ai_service

router = APIRouter(prefix="/api/career", tags=["Career & Placement"])

@router.post("/resume-analyze")
def analyze_resume(request: ResumeAnalyzeRequest):
    """Analyze resume for ATS compatibility and improvements"""
    result = ai_service.analyze_resume(request.resumeText)
    return result

@router.post("/interview-prep")
def interview_preparation(request: InterviewPrepRequest):
    """Get company-specific interview preparation"""
    result = ai_service.interview_prep(request.company, request.role)
    return result

@router.post("/resume-generate")
def generate_resume(details: dict):
    """Generate professional resume (placeholder)"""
    return {
        "status": "success",
        "message": "Resume generation feature coming soon!",
        "note": "Demo mode - Would generate ATS-friendly resume"
    }
