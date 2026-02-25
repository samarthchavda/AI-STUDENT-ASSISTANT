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
