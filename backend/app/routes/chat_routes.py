from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.models.schemas import ChatRequest, ChatResponse, ExplainTopicRequest, GenerateNotesRequest, SolveDoubtRequest
from app.services.ai_service import ai_service
from app.core.database import get_db
from app.models import ChatHistory, User
from app.core.auth import get_current_user
from app.core.middleware import rate_limit
import json

router = APIRouter(prefix="/api", tags=["Chat & Learning"])


def detect_message_language(text: str) -> str:
    """Infer the response language from the user's message text."""
    if any('\u0A80' <= char <= '\u0AFF' for char in text):
        return "gujarati"
    if any('\u0900' <= char <= '\u097F' for char in text):
        return "hindi"
    return "english"


def resolve_chat_language(chat_request: ChatRequest) -> str:
    requested_language = (chat_request.language or "").strip().lower()
    if requested_language and requested_language not in {"auto", "english"}:
        return requested_language

    last_user_message = next(
        (msg.content for msg in reversed(chat_request.messages) if msg.role == "user"),
        ""
    )
    return detect_message_language(last_user_message)

@router.post("/chat", response_model=ChatResponse)
@rate_limit("30/minute")  # 30 chat messages per minute
async def chat(request: Request, chat_request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Main chat endpoint with streaming, history saving and multi-language support"""
    
    language = resolve_chat_language(chat_request)
    
    # Build messages with language instruction
    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
    
    # Add language instruction if not English
    if language.lower() in ["hindi", "gujarati"]:
        language_instruction = f"\n\nIMPORTANT: Respond in {language.upper()} language. Translate your entire response to {language}."
        messages[-1]["content"] += language_instruction
    
    # Get AI response
    response = ai_service.chat_completion(messages)
    
    # Save user message to history
    try:
        user_message = ChatHistory(
            user_id=current_user.id,
            role="user",
            content=chat_request.messages[-1].content,
            language=language
        )
        db.add(user_message)
        
        # Save assistant response to history
        assistant_message = ChatHistory(
            user_id=current_user.id,
            role="assistant",
            content=response,
            language=language
        )
        db.add(assistant_message)
        db.commit()
    except Exception as e:
        print(f"Error saving chat history: {e}")
        db.rollback()
    
    return {"response": response}


@router.post("/chat/public", response_model=ChatResponse)
@rate_limit("20/minute")
async def public_chat(request: Request, chat_request: ChatRequest):
    """Public chat endpoint for guest users (no auth, no history persistence)."""

    language = resolve_chat_language(chat_request)
    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]

    if language.lower() in ["hindi", "gujarati"]:
        language_instruction = f"\n\nIMPORTANT: Respond in {language.upper()} language. Translate your entire response to {language}."
        messages[-1]["content"] += language_instruction

    response = ai_service.chat_completion(messages)
    return {"response": response}

@router.post("/chat/stream")
@rate_limit("30/minute")  # 30 streaming requests per minute
async def chat_stream(request: Request, chat_request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Streaming chat endpoint - responses appear word by word like ChatGPT"""
    
    language = resolve_chat_language(chat_request)
    
    # Build messages with language instruction
    messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
    
    # Add language instruction if not English
    if language.lower() in ["hindi", "gujarati"]:
        language_instruction = f"\n\nIMPORTANT: Respond in {language.upper()} language. Translate your entire response to {language}."
        messages[-1]["content"] += language_instruction
    
    # Save user message to history
    try:
        user_message = ChatHistory(
            user_id=current_user.id,
            role="user",
            content=chat_request.messages[-1].content,
            language=language
        )
        db.add(user_message)
        db.commit()
    except Exception as e:
        print(f"Error saving user message: {e}")
        db.rollback()
    
    # Stream response
    async def generate():
        full_response = ""
        try:
            for chunk in ai_service.chat_completion_stream(messages):
                full_response += chunk
                # Send chunk as SSE (Server-Sent Events)
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            # Send completion signal
            yield f"data: {json.dumps({'done': True})}\n\n"
            
            # Save complete response to history
            try:
                assistant_message = ChatHistory(
                    user_id=current_user.id,
                    role="assistant",
                    content=full_response,
                    language=language
                )
                db.add(assistant_message)
                db.commit()
            except Exception as e:
                print(f"Error saving assistant message: {e}")
                db.rollback()
                
        except Exception as e:
            error_msg = f"⚠️ Error: {str(e)[:100]}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.get("/chat/history")
def get_chat_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's chat history"""
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.timestamp.desc()).limit(limit).all()
    
    return {
        "history": [
            {
                "role": msg.role,
                "content": msg.content,
                "language": msg.language,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in reversed(history)
        ]
    }

@router.delete("/chat/history")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear user's chat history"""
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}

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

@router.get("/cache/stats")
def get_cache_stats():
    """Get response cache statistics and estimated cost savings"""
    return ai_service.get_cache_stats()
