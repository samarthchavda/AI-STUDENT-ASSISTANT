from fastapi import APIRouter, Depends
from schemas import ChatRequest, ChatResponse, ExplainTopicRequest, GenerateNotesRequest, SolveDoubtRequest
from ai_service import ai_service

router = APIRouter(prefix="/api", tags=["Chat & Learning"])

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Main chat endpoint for general Q&A"""
    messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    response = ai_service.chat_completion(messages)
    return {"response": response}

@router.post("/learning/explain")
def explain_topic(request: ExplainTopicRequest):
    """Explain any topic in simple terms"""
    result = ai_service.explain_topic(request.topic, request.subject, request.level)
    return result

@router.post("/learning/notes")
def generate_notes(request: GenerateNotesRequest):
    """Generate study notes from topic/syllabus"""
    result = ai_service.generate_notes(request.topic, request.format)
    return result

@router.post("/learning/doubt")
def solve_doubt(request: SolveDoubtRequest):
    """Solve student doubts 24/7"""
    result = ai_service.solve_doubt(request.question, request.subject)
    return result
