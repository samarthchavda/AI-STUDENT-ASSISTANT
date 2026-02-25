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
