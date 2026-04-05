from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import requests
import time
import os
import random

from app.core.auth import get_current_user

router = APIRouter()

# Judge0 Configuration
JUDGE0_API_URL = os.getenv('JUDGE0_API_URL', 'https://judge0-ce.p.rapidapi.com')
JUDGE0_API_KEY = os.getenv('JUDGE0_API_KEY', '')
USE_RAPIDAPI = os.getenv('USE_RAPIDAPI', 'false').lower() == 'true'
USE_MOCK_EXECUTION = os.getenv('USE_MOCK_EXECUTION', 'true').lower() == 'true'  # Default to mock if no API key

# Language IDs for Judge0
LANGUAGE_IDS = {
    'python': 71,      # Python 3
    'javascript': 63,  # JavaScript (Node.js)
    'cpp': 54,         # C++ (GCC 9.2.0)
    'java': 62         # Java (OpenJDK 13.0.1)
}

class CodeExecutionRequest(BaseModel):
    code: str
    language: str
    stdin: str = ""

class CodeExecutionResponse(BaseModel):
    stdout: Optional[str]
    stderr: Optional[str]
    compile_output: Optional[str]
    status: dict
    time: Optional[str]
    memory: Optional[int]

def mock_code_execution(code: str, language: str, stdin: str) -> CodeExecutionResponse:
    """Mock code execution for development/demo without Judge0"""
    print(f"⚠️ [BACKEND] Using MOCK execution (Judge0 not configured)")
    
    # Simulate execution delay
    time.sleep(0.5)
    
    # Simple mock logic
    has_error = 'error' in code.lower() or 'throw' in code.lower() or 'undefined' in code.lower()
    is_empty = len(code.strip()) < 20
    
    if has_error:
        return CodeExecutionResponse(
            stdout=None,
            stderr="Runtime Error: Mock execution detected error in code",
            compile_output=None,
            status={"id": 6, "description": "Runtime Error (NZEC)"},
            time="0.05",
            memory=2048
        )
    elif is_empty:
        return CodeExecutionResponse(
            stdout=None,
            stderr=None,
            compile_output="Error: Code appears incomplete",
            status={"id": 6, "description": "Compilation Error"},
            time=None,
            memory=None
        )
    else:
        # Mock successful execution
        output = f"Mock execution successful\nLanguage: {language}\nInput: {stdin[:50] if stdin else 'none'}"
        return CodeExecutionResponse(
            stdout=output,
            stderr=None,
            compile_output=None,
            status={"id": 3, "description": "Accepted"},
            time=str(round(random.uniform(0.1, 0.3), 2)),
            memory=random.randint(2048, 8192)
        )

@router.post("/execute", response_model=CodeExecutionResponse)
async def execute_code(
    request: CodeExecutionRequest,
    current_user = Depends(get_current_user)
):
    """Execute code using Judge0 API or mock execution"""
    
    print(f"🚀 [BACKEND] Code execution request - User: {current_user.email}, Language: {request.language}")
    
    if request.language not in LANGUAGE_IDS:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")
    
    # Use mock execution if Judge0 is not configured or explicitly enabled
    if USE_MOCK_EXECUTION or not JUDGE0_API_KEY:
        if not JUDGE0_API_KEY:
            print(f"⚠️ [BACKEND] Judge0 API key not configured, using mock execution")
        return mock_code_execution(request.code, request.language, request.stdin)
    
    language_id = LANGUAGE_IDS[request.language]
    
    try:
        # Prepare headers
        headers = {
            'Content-Type': 'application/json'
        }
        
        if USE_RAPIDAPI:
            headers['X-RapidAPI-Key'] = JUDGE0_API_KEY
            headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com'
        
        # Submit code for execution
        submit_url = f"{JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false"
        
        submission_data = {
            'source_code': request.code,
            'language_id': language_id,
            'stdin': request.stdin,
            'cpu_time_limit': 2,
            'memory_limit': 128000
        }
        
        print(f"📡 [BACKEND] Submitting to Judge0: {submit_url}")
        
        submit_response = requests.post(
            submit_url,
            json=submission_data,
            headers=headers,
            timeout=10
        )
        
        if submit_response.status_code != 201:
            print(f"❌ [BACKEND] Judge0 submission failed: {submit_response.status_code}")
            print(f"   Response: {submit_response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Code submission failed: {submit_response.text}"
            )
        
        submission = submit_response.json()
        token = submission.get('token')
        
        if not token:
            raise HTTPException(status_code=500, detail="No submission token received")
        
        print(f"✅ [BACKEND] Submission token: {token}")
        
        # Poll for result
        result_url = f"{JUDGE0_API_URL}/submissions/{token}?base64_encoded=false"
        max_attempts = 10
        attempt = 0
        
        while attempt < max_attempts:
            time.sleep(1)
            attempt += 1
            
            print(f"🔄 [BACKEND] Polling attempt {attempt}/{max_attempts}")
            
            result_response = requests.get(
                result_url,
                headers=headers,
                timeout=10
            )
            
            if result_response.status_code != 200:
                print(f"❌ [BACKEND] Failed to get result: {result_response.status_code}")
                continue
            
            result = result_response.json()
            status_id = result.get('status', {}).get('id', 0)
            
            # Status IDs: 1=In Queue, 2=Processing, 3+=Finished
            if status_id > 2:
                print(f"✅ [BACKEND] Execution complete - Status: {result.get('status', {}).get('description')}")
                return CodeExecutionResponse(
                    stdout=result.get('stdout'),
                    stderr=result.get('stderr'),
                    compile_output=result.get('compile_output'),
                    status=result.get('status', {}),
                    time=result.get('time'),
                    memory=result.get('memory')
                )
        
        # Timeout
        print(f"⏱️ [BACKEND] Execution timeout after {max_attempts} attempts")
        raise HTTPException(status_code=408, detail="Execution timeout")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ [BACKEND] Request error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Execution service error: {str(e)}")
    except Exception as e:
        print(f"❌ [BACKEND] Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")
