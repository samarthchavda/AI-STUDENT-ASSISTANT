"""
DSA Practice Routes
API endpoints for DSA practice module
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models import User
from app.services.dsa_service import DSAService

router = APIRouter(prefix="/dsa", tags=["DSA Practice"])

# Optional auth for public endpoints
security = HTTPBearer(auto_error=False)

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    if not credentials:
        return None
    try:
        # Extract token
        token = credentials.credentials
        
        # Verify token
        from app.core.auth import verify_token
        payload = verify_token(token)
        
        if not payload:
            return None
        
        # Get user
        user_id = payload.get("user_id")
        if not user_id:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except Exception as e:
        print(f"Auth error (optional): {e}")
        return None


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class GenerateQuestionRequest(BaseModel):
    topic: str
    difficulty: str
    company: Optional[str] = None


class RunCodeRequest(BaseModel):
    problem_id: int
    code: str
    language: str


class GetHintRequest(BaseModel):
    problem_id: int
    hint_level: int = 1


class ReviewCodeRequest(BaseModel):
    problem_id: int
    code: str
    language: str


# ============================================================================
# QUESTION ENDPOINTS
# ============================================================================

@router.get("/questions")
async def get_questions(
    topic: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    company: Optional[str] = Query(None),
    limit: int = Query(20, le=100, description="Number of questions per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get DSA questions with pagination support for 1000+ questions
    
    Pagination:
    - limit: Number of questions per page (default: 20, max: 100)
    - offset: Starting position (default: 0)
    
    Example:
    - Page 1: offset=0, limit=20
    - Page 2: offset=20, limit=20
    - Page 3: offset=40, limit=20
    """
    try:
        result = DSAService.get_questions(
            db=db,
            topic=topic,
            difficulty=difficulty,
            company=company,
            limit=limit,
            offset=offset,
            user_id=current_user.id if current_user else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/questions/{question_id}")
async def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full question details by ID"""
    question = DSAService.get_question_by_id(db, question_id, current_user.id)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return question


@router.post("/generate")
async def generate_question(
    request: GenerateQuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate new question using AI and save to database
    """
    problem = DSAService.generate_question_with_ai(
        db=db,
        topic=request.topic,
        difficulty=request.difficulty,
        company=request.company
    )
    
    if not problem:
        raise HTTPException(status_code=500, detail="Failed to generate question")
    
    return DSAService.get_question_by_id(db, problem.id, current_user.id)


# ============================================================================
# CODE EXECUTION
# ============================================================================

@router.post("/run")
async def run_code(
    request: RunCodeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run code against test cases
    TODO: Integrate Judge0 API
    """
    result = DSAService.run_code(
        db=db,
        user_id=current_user.id,
        problem_id=request.problem_id,
        code=request.code,
        language=request.language
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


# ============================================================================
# AI FEATURES
# ============================================================================

@router.post("/hint")
async def get_hint(
    request: GetHintRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progressive hint from AI"""
    hint = DSAService.get_hint(
        db=db,
        user_id=current_user.id,
        problem_id=request.problem_id,
        hint_level=request.hint_level
    )
    
    if "error" in hint:
        raise HTTPException(status_code=404, detail=hint["error"])
    
    return hint


@router.get("/solution/{problem_id}")
async def get_solution(
    problem_id: int,
    language: str = Query("python"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed solution with AI explanation and usage tracking"""
    solution = DSAService.get_solution(
        db=db,
        problem_id=problem_id,
        user_id=current_user.id,
        language=language
    )
    
    if "error" in solution:
        # Handle limit exceeded error specially
        if solution.get("error") == "limit_exceeded":
            raise HTTPException(status_code=403, detail=solution)
        raise HTTPException(status_code=404, detail=solution["error"])
    
    return solution


@router.post("/review")
async def review_code(
    request: ReviewCodeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI code review"""
    review = DSAService.review_code(
        db=db,
        user_id=current_user.id,
        problem_id=request.problem_id,
        code=request.code,
        language=request.language
    )
    
    if "error" in review:
        raise HTTPException(status_code=400, detail=review["error"])
    
    return review


# ============================================================================
# PROGRESS & STATS
# ============================================================================

@router.get("/dashboard")
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get user dashboard statistics"""
    try:
        if not current_user:
            # Return default stats for non-authenticated users
            return {
                "total_solved": 0,
                "easy_solved": 0,
                "medium_solved": 0,
                "hard_solved": 0,
                "accuracy": 0,
                "streak_days": 0,
                "weak_topics": []
            }
        return DSAService.get_user_dashboard(db, current_user.id)
    except Exception as e:
        print(f"Error in get_dashboard: {e}")
        # Return default stats on error
        return {
            "total_solved": 0,
            "easy_solved": 0,
            "medium_solved": 0,
            "hard_solved": 0,
            "accuracy": 0,
            "streak_days": 0,
            "weak_topics": []
        }


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get leaderboard rankings"""
    return DSAService.get_leaderboard(db, limit)


@router.get("/daily-challenge")
async def get_daily_challenge(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get today's daily challenge"""
    try:
        challenge = DSAService.get_daily_challenge(db)
        
        if not challenge:
            # If no challenge, return None instead of 404
            return None
        
        return challenge
    except Exception as e:
        print(f"Error in get_daily_challenge: {e}")
        # Return None instead of raising error
        return None


# ============================================================================
# TOPICS & METADATA
# ============================================================================

@router.get("/topics")
async def get_topics():
    """Get available DSA topics"""
    try:
        from app.models import DSATopic
        topics = [
            {
                "value": topic.value,
                "label": topic.value.replace("_", " ").title()
            }
            for topic in DSATopic
        ]
        return {"topics": topics}
    except Exception as e:
        print(f"Error in get_topics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/difficulties")
async def get_difficulties():
    """Get difficulty levels"""
    try:
        from app.models import DifficultyLevel
        difficulties = [
            {
                "value": level.value,
                "label": level.value.title()
            }
            for level in DifficultyLevel
        ]
        return {"difficulties": difficulties}
    except Exception as e:
        print(f"Error in get_difficulties: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/languages")
async def get_languages():
    """Get supported programming languages"""
    from app.models import DSALanguage
    return {
        "languages": [
            {
                "value": lang.value,
                "label": lang.value.upper() if lang.value == "cpp" else lang.value.title()
            }
            for lang in DSALanguage
        ]
    }


# ============================================================================
# GRAPH VISUALIZATION & EXPLANATION
# ============================================================================

class ExplainGraphRequest(BaseModel):
    graph_data: str
    problem_title: str
    language: str = "english"
    is_directed: bool = False


@router.post("/explain-graph")
async def explain_graph(
    request: ExplainGraphRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI explanation of graph structure in English"""
    
    try:
        from app.services.ai_service import AIService
        
        # Build prompt in English only
        prompt = f"""You are a helpful tutor. Explain the structure of this graph in simple English:

Problem: {request.problem_title}
Graph Type: {"Directed" if request.is_directed else "Undirected"}
Graph Data: {request.graph_data}

Please explain:
1. How many nodes (vertices) are in this graph?
2. How many edges are in this graph?
3. Which nodes are connected to each other?
4. Does this graph have any special structure? (e.g., tree, cycle, etc.)
5. How does this graph structure help solve the problem?

Provide a clear and simple explanation."""

        # Get AI explanation
        ai_service = AIService()
        explanation = ai_service.generate_response(prompt)
        
        return {
            "explanation": explanation,
            "language": "english"
        }
        
    except Exception as e:
        print(f"Error explaining graph: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate graph explanation"
        )


# ============================================================================
# EDITORIAL & ALGORITHM BREAKDOWN
# ============================================================================

@router.get("/editorial/{problem_id}")
async def get_editorial(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get step-by-step editorial and algorithm breakdown for a problem"""
    
    try:
        from app.models import DSAProblem
        from app.services.ai_service import AIService
        
        # Get problem
        problem = db.query(DSAProblem).filter(DSAProblem.id == problem_id).first()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
        
        # Build editorial prompt
        prompt = f"""You are an expert algorithm tutor. Provide a comprehensive editorial for this DSA problem:

Problem: {problem.title}
Topic: {problem.topic}
Difficulty: {problem.difficulty}
Description: {problem.description}

Please provide a detailed step-by-step breakdown including:

1. PROBLEM UNDERSTANDING
   - What is the problem asking?
   - What are the key constraints?
   - What makes this problem challenging?

2. INTUITION
   - What is the core insight needed to solve this?
   - How should we think about this problem?
   - What patterns or techniques apply here?

3. APPROACH
   - What algorithm/data structure should we use?
   - Why is this the optimal approach?
   - What are the key steps?

4. ALGORITHM STEPS
   - Step 1: [Detailed explanation]
   - Step 2: [Detailed explanation]
   - Step 3: [Detailed explanation]
   - Continue with all necessary steps...

5. COMPLEXITY ANALYSIS
   - Time Complexity: [Explain why]
   - Space Complexity: [Explain why]

6. EDGE CASES TO CONSIDER
   - List important edge cases
   - How to handle them

7. OPTIMIZATION TIPS
   - How to optimize further if needed
   - Common mistakes to avoid

Make the explanation clear, educational, and easy to understand. Use examples where helpful."""

        # Get AI explanation
        ai_service = AIService()
        editorial = ai_service.generate_response(prompt)
        
        return {
            "editorial": editorial,
            "problem_id": problem_id,
            "problem_title": problem.title
        }
        
    except Exception as e:
        print(f"Error generating editorial: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate editorial"
        )
