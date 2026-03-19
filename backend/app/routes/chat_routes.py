from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.models.schemas import ChatRequest, ChatResponse, ExplainTopicRequest, GenerateNotesRequest, SolveDoubtRequest, UpgradePlanRequest
from app.services.ai_service import ai_service
from app.core.database import get_db
from app.models import ChatHistory, User, PlanType
from app.core.auth import get_current_user
from app.core.middleware import rate_limit
from datetime import date
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


def check_user_limit(user_id: int, db: Session) -> None:
    """
    Enforce daily query limits by plan and increment usage if allowed.

    - free: 25/day
    - basic: 100/day
    - pro: effectively unlimited (configured high at 500/day)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    today = date.today()

    if user.last_query_date != today:
        user.queries_today = 0
        user.last_query_date = today

    plan_value = user.plan.value if hasattr(user.plan, "value") else str(user.plan)
    plan_value = plan_value.lower()

    if plan_value == "free" and user.queries_today >= 25:
        raise HTTPException(status_code=403, detail="Daily limit reached")

    if plan_value == "basic" and user.queries_today >= 100:
        raise HTTPException(status_code=403, detail="Basic limit reached")

    if plan_value == "pro" and user.queries_today >= 500:
        raise HTTPException(status_code=403, detail="Pro plan limit reached")

    user.queries_today += 1
    db.commit()
    db.refresh(user)

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

    # Enforce usage limits before Gemini call
    check_user_limit(current_user.id, db)
    
    # Get AI response
    response = ai_service.chat_completion(messages)
    
    # Track token usage
    try:
        from app.models import UserUsage
        from datetime import datetime
        import tiktoken
        
        # Estimate tokens (approximate)
        encoding = tiktoken.get_encoding("cl100k_base")
        input_text = " ".join([msg["content"] for msg in messages])
        input_tokens = len(encoding.encode(input_text))
        output_tokens = len(encoding.encode(response))
        
        current_month = datetime.now().strftime("%Y-%m")
        
        # Get or create usage record
        usage = db.query(UserUsage).filter(
            UserUsage.user_id == current_user.id,
            UserUsage.month == current_month
        ).first()
        
        if usage:
            usage.query_count += 1
            usage.total_input_tokens += input_tokens
            usage.total_output_tokens += output_tokens
            usage.last_query_date = datetime.now()
        else:
            usage = UserUsage(
                user_id=current_user.id,
                query_count=1,
                total_input_tokens=input_tokens,
                total_output_tokens=output_tokens,
                month=current_month,
                last_query_date=datetime.now()
            )
            db.add(usage)
        
        db.commit()
    except Exception as e:
        print(f"Error tracking token usage: {e}")
        db.rollback()
    
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

    # Enforce usage limits before Gemini call
    check_user_limit(current_user.id, db)
    
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
            
            # Track token usage after streaming completes
            try:
                from app.models import UserUsage
                from datetime import datetime
                import tiktoken
                
                encoding = tiktoken.get_encoding("cl100k_base")
                input_text = " ".join([msg["content"] for msg in messages])
                input_tokens = len(encoding.encode(input_text))
                output_tokens = len(encoding.encode(full_response))
                
                current_month = datetime.now().strftime("%Y-%m")
                
                usage = db.query(UserUsage).filter(
                    UserUsage.user_id == current_user.id,
                    UserUsage.month == current_month
                ).first()
                
                if usage:
                    usage.query_count += 1
                    usage.total_input_tokens += input_tokens
                    usage.total_output_tokens += output_tokens
                    usage.last_query_date = datetime.now()
                else:
                    usage = UserUsage(
                        user_id=current_user.id,
                        query_count=1,
                        total_input_tokens=input_tokens,
                        total_output_tokens=output_tokens,
                        month=current_month,
                        last_query_date=datetime.now()
                    )
                    db.add(usage)
                
                db.commit()
            except Exception as e:
                print(f"Error tracking token usage: {e}")
                db.rollback()
            
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


@router.post("/upgrade-plan")
def upgrade_plan(
    request: UpgradePlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upgrade current user's plan type in database after successful payment."""
    requested_plan = (request.plan_type or "").strip().lower()

    allowed_plans = {
        "free": PlanType.FREE,
        "basic": PlanType.BASIC,
        "pro": PlanType.PRO,
    }

    if requested_plan not in allowed_plans:
        raise HTTPException(status_code=400, detail="Invalid plan_type")

    current_user.plan = allowed_plans[requested_plan]
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    plan_value = current_user.plan.value if hasattr(current_user.plan, "value") else str(current_user.plan)

    return {
        "status": "success",
        "message": f"Plan upgraded to {plan_value}",
        "plan_type": plan_value,
        "user_id": current_user.id,
    }
