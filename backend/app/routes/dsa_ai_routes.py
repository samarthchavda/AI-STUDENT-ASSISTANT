from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.auth import get_current_user
import google.generativeai as genai
import os

router = APIRouter()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class ProblemExample(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class DSAProblemContext(BaseModel):
    title: str
    description: str
    examples: List[ProblemExample]
    constraints: List[str]
    language: str

class CodeRequest(BaseModel):
    code: str
    language: str
    problem_title: str
    error: Optional[str] = None

class AIResponse(BaseModel):
    content: str
    type: str

@router.post("/hint", response_model=AIResponse)
async def get_hint(problem: DSAProblemContext, current_user: dict = Depends(get_current_user)):
    """Get a hint for the DSA problem"""
    
    examples_text = "\n\n".join([
        f"Example {i+1}:\nInput: {ex.input}\nOutput: {ex.output}" + 
        (f"\nExplanation: {ex.explanation}" if ex.explanation else "")
        for i, ex in enumerate(problem.examples)
    ])
    
    prompt = f"""You are a coding interview tutor helping a student solve a DSA problem.

Problem: {problem.title}
Description: {problem.description}

Examples:
{examples_text}

Constraints:
{chr(10).join(problem.constraints)}

Language: {problem.language}

IMPORTANT: Do NOT provide the full solution. Give a helpful hint that guides the student toward the right approach.

Your hint should:
1. Identify the key pattern or data structure needed
2. Suggest the general approach without giving away the implementation
3. Point out any edge cases to consider
4. Be encouraging and educational

Provide a concise hint (3-5 sentences max)."""

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return AIResponse(
            content=response.text,
            type="hint"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/explain", response_model=AIResponse)
async def explain_problem(problem: DSAProblemContext, current_user: dict = Depends(get_current_user)):
    """Explain the problem in simpler terms"""
    
    examples_text = "\n\n".join([
        f"Example {i+1}:\nInput: {ex.input}\nOutput: {ex.output}" + 
        (f"\nExplanation: {ex.explanation}" if ex.explanation else "")
        for i, ex in enumerate(problem.examples)
    ])
    
    prompt = f"""You are a coding interview tutor explaining a DSA problem to a beginner.

Problem: {problem.title}
Description: {problem.description}

Examples:
{examples_text}

Constraints:
{chr(10).join(problem.constraints)}

Explain this problem in simple, beginner-friendly language:
1. What is the problem asking for?
2. What are the inputs and outputs?
3. What pattern or approach is most relevant?
4. Any important edge cases to watch for?

Keep it clear and concise (5-7 sentences)."""

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return AIResponse(
            content=response.text,
            type="explanation"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/solution", response_model=AIResponse)
async def generate_solution(problem: DSAProblemContext, current_user: dict = Depends(get_current_user)):
    """Generate a complete solution"""
    
    examples_text = "\n\n".join([
        f"Example {i+1}:\nInput: {ex.input}\nOutput: {ex.output}" + 
        (f"\nExplanation: {ex.explanation}" if ex.explanation else "")
        for i, ex in enumerate(problem.examples)
    ])
    
    prompt = f"""You are an expert coding interview tutor. Generate a complete, optimized solution for this DSA problem.

Problem: {problem.title}
Description: {problem.description}

Examples:
{examples_text}

Constraints:
{chr(10).join(problem.constraints)}

Language: {problem.language}

Generate a complete, working solution in {problem.language} that:
1. Is optimized for time and space complexity
2. Handles all edge cases
3. Includes brief inline comments explaining key steps
4. Follows best practices for {problem.language}
5. Is interview-appropriate and production-ready

IMPORTANT: Return ONLY the code, no explanations before or after. The code should be ready to paste into an editor."""

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return AIResponse(
            content=response.text,
            type="solution"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/explain-code", response_model=AIResponse)
async def explain_user_code(request: CodeRequest, current_user: dict = Depends(get_current_user)):
    """Explain user's code"""
    
    prompt = f"""You are a coding interview tutor analyzing a student's code.

Problem: {request.problem_title}
Language: {request.language}

Student's Code:
```{request.language}
{request.code}
```

Analyze this code and provide:
1. What the code is doing (step by step)
2. Time complexity: O(?)
3. Space complexity: O(?)
4. Any potential issues or bugs
5. Suggestions for improvement (if any)

Be constructive and educational. Keep it concise (6-8 sentences)."""

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return AIResponse(
            content=response.text,
            type="code-explanation"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/fix-code", response_model=AIResponse)
async def fix_user_code(request: CodeRequest, current_user: dict = Depends(get_current_user)):
    """Fix user's code"""
    
    error_section = f"\n\nError encountered:\n{request.error}" if request.error else ""
    
    prompt = f"""You are a coding interview tutor helping debug a student's code.

Problem: {request.problem_title}
Language: {request.language}

Student's Code:
```{request.language}
{request.code}
```{error_section}

Provide:
1. Brief explanation of the bug or issue (2-3 sentences)
2. Corrected code in {request.language}

IMPORTANT: Return the explanation first, then the corrected code in a code block."""

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return AIResponse(
            content=response.text,
            type="code-fix"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
