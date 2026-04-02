"""
DSA Practice Service - Hybrid Model (Database + AI)
Handles question generation, hints, solutions, and code review using Gemini AI
"""
import json
import logging
import re
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, date, timedelta
import google.generativeai as genai

from app.core.config import settings
from app.models import (
    DSAProblem, DSASubmission, DSAProgress, DSAUserStats, DSAHint,
    DSATopic, DifficultyLevel, DSALanguage, DSASubmissionStatus, User
)

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-2.5-flash')


class DSAService:
    """Service for DSA practice operations"""
    
    # ============================================================================
    # QUESTION FETCHING (PRIMARY - DATABASE)
    # ============================================================================
    
    @staticmethod
    def get_questions(
        db: Session,
        topic: Optional[str] = None,
        difficulty: Optional[str] = None,
        company: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Fetch questions from database with filters and pagination
        Optimized for 1000+ questions with user progress
        
        Sorting: Always sorted by difficulty (Easy → Medium → Hard) for smooth learning curve
        """
        query = db.query(DSAProblem)
        
        # Apply filters
        # Note: Empty string or None for topic means "All Topics"
        if topic and topic.lower() not in ['', 'all', 'all_topics']:
            query = query.filter(DSAProblem.topic == topic)
        
        if difficulty:
            query = query.filter(DSAProblem.difficulty == difficulty)
        
        if company:
            query = query.filter(DSAProblem.company.ilike(f"%{company}%"))
        
        # Get total count (for pagination)
        total = query.count()
        
        # ALWAYS sort by difficulty (Easy → Medium → Hard) for smooth learning curve
        # Use CASE statement to define custom sort order
        from sqlalchemy import case
        difficulty_order = case(
            (DSAProblem.difficulty == 'easy', 1),
            (DSAProblem.difficulty == 'medium', 2),
            (DSAProblem.difficulty == 'hard', 3),
            else_=4
        )
        
        # Get paginated results with difficulty-based sorting
        questions = query.order_by(difficulty_order, DSAProblem.created_at.desc()).offset(offset).limit(limit).all()
        
        # Get user progress if user_id provided
        user_progress_map = {}
        if user_id:
            progress_records = db.query(DSAProgress).filter(
                DSAProgress.user_id == user_id,
                DSAProgress.problem_id.in_([q.id for q in questions])
            ).all()
            
            user_progress_map = {
                p.problem_id: {
                    "status": p.status,
                    "attempts": p.attempts,
                    "best_score": p.best_score
                }
                for p in progress_records
            }
        
        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total,
            "questions": [
                {
                    "id": q.id,
                    "title": q.title,
                    "topic": q.topic.value if hasattr(q.topic, 'value') else q.topic,
                    "difficulty": q.difficulty.value if hasattr(q.difficulty, 'value') else q.difficulty,
                    "company": q.company,
                    "created_at": q.created_at.isoformat() if q.created_at else None,
                    "user_progress": user_progress_map.get(q.id, {
                        "status": "not_attempted",
                        "attempts": 0,
                        "best_score": 0
                    }) if user_id else None
                }
                for q in questions
            ]
        }
    
    @staticmethod
    def get_question_by_id(db: Session, question_id: int, user_id: Optional[int] = None) -> Optional[Dict]:
        """Get full question details by ID"""
        question = db.query(DSAProblem).filter(DSAProblem.id == question_id).first()
        
        if not question:
            return None
        
        # Get user progress if user_id provided
        user_progress = None
        if user_id:
            user_progress = db.query(DSAProgress).filter(
                and_(
                    DSAProgress.user_id == user_id,
                    DSAProgress.problem_id == question_id
                )
            ).first()
        
        return {
            "id": question.id,
            "title": question.title,
            "description": question.description,
            "topic": question.topic.value if hasattr(question.topic, 'value') else question.topic,
            "difficulty": question.difficulty.value if hasattr(question.difficulty, 'value') else question.difficulty,
            "company": question.company,
            "constraints": question.constraints,
            "examples": json.loads(question.examples) if question.examples else [],
            "starter_code": {
                "python": question.starter_code_python,
                "javascript": question.starter_code_javascript,
                "cpp": question.starter_code_cpp
            },
            "test_cases": json.loads(question.test_cases) if question.test_cases else [],
            "time_complexity": question.time_complexity,
            "space_complexity": question.space_complexity,
            "user_progress": {
                "status": user_progress.status if user_progress else "not_attempted",
                "attempts": user_progress.attempts if user_progress else 0,
                "best_score": user_progress.best_score if user_progress else 0,
                "hints_used": user_progress.hints_used if user_progress else 0
            } if user_id else None
        }
    
    # ============================================================================
    # AI QUESTION GENERATION (FALLBACK)
    # ============================================================================
    
    @staticmethod
    def generate_question_with_ai(
        db: Session,
        topic: str,
        difficulty: str,
        company: Optional[str] = None
    ) -> Optional[DSAProblem]:
        """
        Generate DSA question using Gemini AI and save to database
        """
        try:
            company_text = f"commonly asked at {company}" if company else "for technical interviews"
            
            prompt = f"""You are an expert DSA interviewer. Generate a {difficulty} level coding problem on {topic} {company_text}.

Return a JSON object with this EXACT structure:
{{
    "title": "Problem title",
    "description": "Detailed problem description",
    "constraints": "List of constraints",
    "examples": [
        {{"input": "example input", "output": "example output", "explanation": "why"}},
        {{"input": "example input 2", "output": "example output 2", "explanation": "why"}}
    ],
    "starter_code_python": "def solution():\\n    pass",
    "starter_code_javascript": "function solution() {{\\n    // code here\\n}}",
    "starter_code_cpp": "#include <iostream>\\nusing namespace std;\\n\\nint main() {{\\n    return 0;\\n}}",
    "test_cases": [
        {{"input": "test input", "expected_output": "expected output"}},
        {{"input": "test input 2", "expected_output": "expected output 2"}}
    ],
    "solution": "Optimal solution explanation",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "time_complexity": "O(n)",
    "space_complexity": "O(1)"
}}

Make it realistic, challenging, and interview-ready."""

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON from response
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            
            # Create problem in database
            problem = DSAProblem(
                title=data.get("title", f"{topic.title()} Problem"),
                description=data.get("description", ""),
                topic=topic,
                difficulty=difficulty,
                company=company,
                constraints=data.get("constraints", ""),
                examples=json.dumps(data.get("examples", [])),
                starter_code_python=data.get("starter_code_python", ""),
                starter_code_javascript=data.get("starter_code_javascript", ""),
                starter_code_cpp=data.get("starter_code_cpp", ""),
                test_cases=json.dumps(data.get("test_cases", [])),
                solution=data.get("solution", ""),
                hints=json.dumps(data.get("hints", [])),
                time_complexity=data.get("time_complexity", ""),
                space_complexity=data.get("space_complexity", "")
            )
            
            db.add(problem)
            db.commit()
            db.refresh(problem)
            
            logger.info(f"✅ Generated and saved question: {problem.title}")
            return problem
            
        except Exception as e:
            logger.error(f"❌ Failed to generate question: {e}")
            db.rollback()
            return None
    
    # ============================================================================
    # AI HINT SYSTEM
    # ============================================================================
    
    @staticmethod
    def get_hint(
        db: Session,
        user_id: int,
        problem_id: int,
        hint_level: int = 1
    ) -> Dict[str, Any]:
        """
        Get progressive hint using AI
        """
        problem = db.query(DSAProblem).filter(DSAProblem.id == problem_id).first()
        if not problem:
            return {"error": "Problem not found"}
        
        # Check if hints already exist in DB
        stored_hints = json.loads(problem.hints) if problem.hints else []
        
        if hint_level <= len(stored_hints):
            hint_text = stored_hints[hint_level - 1]
        else:
            # Generate new hint with AI
            try:
                prompt = f"""Problem: {problem.title}
Description: {problem.description}

Give hint level {hint_level} (progressive, don't reveal full solution):
- Level 1: General approach
- Level 2: Key insight
- Level 3: Algorithm/data structure to use

Return only the hint text, no extra formatting."""

                response = model.generate_content(prompt)
                hint_text = response.text.strip()
                
                # Save hint to database
                stored_hints.append(hint_text)
                problem.hints = json.dumps(stored_hints)
                db.commit()
                
            except Exception as e:
                logger.error(f"Failed to generate hint: {e}")
                hint_text = "Try breaking down the problem into smaller steps."
        
        # Track hint usage
        hint = DSAHint(
            user_id=user_id,
            problem_id=problem_id,
            hint_level=hint_level,
            hint_text=hint_text
        )
        db.add(hint)
        
        # Update progress
        progress = db.query(DSAProgress).filter(
            and_(DSAProgress.user_id == user_id, DSAProgress.problem_id == problem_id)
        ).first()
        
        if progress:
            progress.hints_used += 1
            progress.last_attempted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "hint": hint_text,
            "level": hint_level,
            "max_hints": 3
        }
    
    # ============================================================================
    # AI SOLUTION GENERATOR
    # ============================================================================
    
    @staticmethod
    def get_solution(db: Session, problem_id: int, user_id: Optional[int] = None, language: str = 'python') -> Dict[str, Any]:
        """
        Get detailed solution with explanation
        Uses high-performance cache for instant loading
        """
        problem = db.query(DSAProblem).filter(DSAProblem.id == problem_id).first()
        if not problem:
            return {"error": "Problem not found"}
        
        # Check user's solution view limit if user_id provided
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                # Check if user has exceeded free limit
                if user.plan == 'free' and user.solutions_viewed >= 2:
                    return {
                        "error": "limit_exceeded",
                        "message": "You've reached your free solution limit. Upgrade to PRO for unlimited access!",
                        "solutions_viewed": user.solutions_viewed,
                        "plan": user.plan
                    }
                
                # Increment solutions viewed counter
                user.solutions_viewed += 1
                db.commit()
        
        # Try to get from cache first (INSTANT - no AI latency)
        if problem.solutions_cache:
            try:
                cached_solutions = json.loads(problem.solutions_cache)
                
                # Check if requested language exists in cache
                if cached_solutions.get(language):
                    return {
                        "solution": problem.solution or "Optimized solution",
                        f"solution_{language}": cached_solutions[language],
                        "solutions_cache": cached_solutions,  # Send all languages to frontend
                        "time_complexity": problem.time_complexity,
                        "space_complexity": problem.space_complexity,
                        "cached": True
                    }
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON in solutions_cache for problem {problem_id}")
        
        # Fallback: Generate with AI if not in cache
        logger.info(f"Cache miss for problem {problem_id}, language {language}. Generating with AI...")
        
        try:
            # Generate all languages at once for future caching
            solutions = DSAService._generate_all_language_solutions(problem)
            
            if solutions:
                # Save to cache for next time
                problem.solutions_cache = json.dumps(solutions)
                db.commit()
                
                return {
                    "solution": problem.solution or "AI-generated solution",
                    f"solution_{language}": solutions.get(language, ""),
                    "solutions_cache": solutions,
                    "time_complexity": problem.time_complexity,
                    "space_complexity": problem.space_complexity,
                    "cached": False
                }
        except Exception as e:
            logger.error(f"Failed to generate AI solution: {e}")
        
        # Final fallback to old method
        return {
            "solution": problem.solution or "Solution not available",
            "time_complexity": problem.time_complexity,
            "space_complexity": problem.space_complexity,
            "cached": False
        }
    
    @staticmethod
    def _generate_all_language_solutions(problem: DSAProblem) -> Optional[Dict[str, str]]:
        """
        Generate solutions for all languages in a single API call
        More efficient than generating one at a time
        """
        try:
            prompt = f"""You are an expert DSA instructor. Generate highly optimized, clean, and heavily commented solutions for this problem in Python, JavaScript, and C++.

**Problem:** {problem.title}

**Description:**
{problem.description}

**Constraints:**
{problem.constraints or 'Standard constraints apply'}

**Target Complexity:**
- Time: {problem.time_complexity or 'O(n)'}
- Space: {problem.space_complexity or 'O(1)'}

**Requirements:**
1. Production-quality code with best practices
2. Detailed inline comments explaining EVERY step
3. Same function signature as starter code
4. Optimized for the target complexity

**Return ONLY a valid JSON object (no markdown):**
{{
    "python": "# Python solution\\ndef functionName(params):\\n    pass",
    "javascript": "// JavaScript solution\\nfunction functionName(params) {{}}",
    "cpp": "// C++ solution\\nclass Solution {{}};"
}}"""

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            solutions = json.loads(response_text)
            
            # Validate
            if all(key in solutions for key in ['python', 'javascript', 'cpp']):
                logger.info(f"✅ Generated all language solutions for {problem.title}")
                return solutions
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to generate multi-language solutions: {e}")
            return None
    
    @staticmethod
    def _generate_ai_solution(problem: DSAProblem, language: str) -> Optional[str]:
        """
        Generate AI solution using Gemini for specific language
        """
        try:
            # Map language to proper name
            lang_map = {
                'python': 'Python',
                'javascript': 'JavaScript',
                'cpp': 'C++',
                'java': 'Java'
            }
            lang_name = lang_map.get(language, language.title())
            
            # Build complexity hint
            complexity_hint = ""
            if problem.time_complexity or problem.space_complexity:
                complexity_hint = f"\nTarget Complexity: Time {problem.time_complexity or 'O(n)'}, Space {problem.space_complexity or 'O(1)'}"
            
            prompt = f"""You are a DSA expert and coding instructor. Provide a clean, optimized, and heavily commented {lang_name} solution for this problem:

**Problem:** {problem.title}

**Description:**
{problem.description}

**Constraints:**
{problem.constraints or 'Standard constraints apply'}
{complexity_hint}

**Requirements:**
1. Write production-quality {lang_name} code
2. Add detailed inline comments explaining EVERY step
3. Use the same function signature as the starter code
4. Ensure it passes all test cases
5. Follow best practices for {lang_name}
6. Include comments about time/space complexity

Return ONLY the code with comments, no markdown formatting, no explanations outside the code."""

            response = model.generate_content(prompt)
            solution_code = response.text.strip()
            
            # Clean up any markdown formatting
            if "```" in solution_code:
                # Extract code from markdown blocks
                match = re.search(r"```[\w]*\n([\s\S]*?)```", solution_code)
                if match:
                    solution_code = match.group(1).strip()
            
            logger.info(f"✅ Generated AI solution for {problem.title} in {lang_name}")
            return solution_code
            
        except Exception as e:
            logger.error(f"Failed to generate AI solution: {e}")
            return None
    
    # ============================================================================
    # AI CODE REVIEW
    # ============================================================================
    
    @staticmethod
    def review_code(
        db: Session,
        user_id: int,
        problem_id: int,
        code: str,
        language: str
    ) -> Dict[str, Any]:
        """
        AI-powered code review
        """
        problem = db.query(DSAProblem).filter(DSAProblem.id == problem_id).first()
        if not problem:
            return {"error": "Problem not found"}
        
        try:
            prompt = f"""Problem: {problem.title}

User's {language} code:
```{language}
{code}
```

Analyze this code and provide:
1. Correctness: Does it solve the problem?
2. Optimization: Can it be improved?
3. Readability: Code quality suggestions
4. Time/Space Complexity: Analysis
5. Score: 0-100

Format as JSON:
{{
    "correctness": "feedback",
    "optimization": "suggestions",
    "readability": "suggestions",
    "complexity": "analysis",
    "score": 85,
    "overall": "summary"
}}"""

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            review = json.loads(response_text)
            
            return review
            
        except Exception as e:
            logger.error(f"Failed to review code: {e}")
            return {
                "correctness": "Unable to analyze",
                "optimization": "Please try again",
                "readability": "N/A",
                "complexity": "N/A",
                "score": 0,
                "overall": "Review failed"
            }
    
    # ============================================================================
    # CODE EXECUTION (MOCK - Replace with Judge0 in production)
    # ============================================================================
    
    @staticmethod
    def run_code(
        db: Session,
        user_id: int,
        problem_id: int,
        code: str,
        language: str
    ) -> Dict[str, Any]:
        """
        Run code against test cases with proper execution and validation
        """
        problem = db.query(DSAProblem).filter(DSAProblem.id == problem_id).first()
        if not problem:
            return {"error": "Problem not found"}
        
        test_cases = json.loads(problem.test_cases) if problem.test_cases else []
        
        if not test_cases:
            return {"error": "No test cases available"}
        
        # Execute code based on language
        if language == 'python':
            result = DSAService._execute_python_code(code, test_cases)
        elif language == 'javascript':
            result = DSAService._execute_javascript_code(code, test_cases)
        elif language == 'cpp':
            result = DSAService._execute_cpp_code(code, test_cases)
        else:
            return {"error": f"Language {language} not supported"}
        
        passed = result['passed']
        total = result['total']
        status = DSASubmissionStatus.ACCEPTED if passed == total else DSASubmissionStatus.WRONG_ANSWER
        score = int((passed / total) * 100) if total > 0 else 0
        
        # Create submission
        submission = DSASubmission(
            user_id=user_id,
            problem_id=problem_id,
            code=code,
            language=language,
            status=status,
            test_cases_passed=passed,
            total_test_cases=total,
            score=score,
            error_message=result.get('error_message')
        )
        db.add(submission)
        
        # Update progress
        DSAService._update_progress(db, user_id, problem_id, status, score)
        
        db.commit()
        
        return {
            "status": status.value,
            "passed": passed,
            "total": total,
            "score": score,
            "message": result.get('message', f"Passed {passed}/{total} test cases"),
            "test_results": result.get('test_results', []),
            "error_message": result.get('error_message')
        }
    
    @staticmethod
    def _execute_python_code(code: str, test_cases: List[Dict]) -> Dict[str, Any]:
        import subprocess, tempfile, os
        passed = 0
        total = len(test_cases)
        test_results = []
        try:
            lines = code.split('\n')
            clean = []
            skip = False
            for l in lines:
                if any(m in l.lower() for m in ['# example usage','# test','# example','if __name__','# usage:','# demo']):
                    skip = True; continue
                if not skip: clean.append(l)
            cleaned = '\n'.join(clean)
            is_class = 'class Solution' in cleaned
            fn = None
            if is_class:
                for l in clean:
                    s = l.strip()
                    if s.startswith('def ') and 'self' in s:
                        fn = s.split('def ')[1].split('(')[0].strip(); break
            else:
                for l in clean:
                    s = l.strip()
                    if s.startswith('def '):
                        fn = s.split('def ')[1].split('(')[0].strip(); break
            if not fn:
                return {'passed':0,'total':total,'error_message':'No function definition found.','test_results':[]}
            for idx, tc in enumerate(test_cases):
                inp = tc.get('input',''); exp = tc.get('expected_output','')
                try:
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                        f.write(cleaned + '\n\nimport json\n')
                        args = DSAService._parse_test_input(inp)
                        if is_class:
                            f.write(f'try:\n    sol=Solution()\n    r=sol.{fn}({args})\n    print(json.dumps({{"result":r,"success":True}}))\nexcept Exception as e:\n    print(json.dumps({{"error":str(e),"success":False}}))\n')
                        else:
                            f.write(f'try:\n    r={fn}({args})\n    print(json.dumps({{"result":r,"success":True}}))\nexcept Exception as e:\n    print(json.dumps({{"error":str(e),"success":False}}))\n')
                        tmp = f.name
                    proc = subprocess.run(['python3', tmp], capture_output=True, text=True, timeout=5)
                    os.unlink(tmp)
                    jout = None
                    for line in reversed(proc.stdout.strip().split('\n')):
                        try: jout = json.loads(line); break
                        except: continue
                    if not jout or not jout.get('success'):
                        err = jout.get('error','Execution failed') if jout else proc.stderr.strip() or 'No output'
                        test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':err})
                        continue
                    actual = jout.get('result')
                    ok = DSAService._normalize_output(exp) == DSAService._normalize_output(actual)
                    if ok: passed += 1
                    test_results.append({'test_case':idx+1,'passed':ok,'input':inp,'expected':exp,'actual':actual,'error':None})
                except subprocess.TimeoutExpired:
                    test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':'Time Limit Exceeded (5s)'})
                except Exception as e:
                    test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':str(e)})
            msg = f"Passed {passed}/{total} test cases"
            if passed==total: msg="All test cases passed!"
            elif passed==0: msg="No test cases passed"
            return {'passed':passed,'total':total,'message':msg,'test_results':test_results,'error_message':None}
        except Exception as e:
            return {'passed':0,'total':total,'error_message':str(e),'test_results':[]}

    @staticmethod
    def _execute_javascript_code(code: str, test_cases: List[Dict]) -> Dict[str, Any]:
        import subprocess, tempfile, os, re as _re
        passed = 0; total = len(test_cases); test_results = []
        try:
            subprocess.run(['node','--version'], capture_output=True, timeout=3, check=True)
        except Exception:
            return {'passed':0,'total':total,'error_message':'Node.js is not installed on the server.','test_results':[]}
        try:
            lines = code.split('\n'); clean = []; skip = False
            for l in lines:
                if any(m in l.lower() for m in ['// example','// test','// usage','// demo']): skip=True; continue
                if not skip: clean.append(l)
            cleaned = '\n'.join(clean)
            is_class = 'class Solution' in cleaned
            fn = None
            if is_class:
                for l in clean:
                    m = _re.search(r'^\s+(\w+)\s*\(', l)
                    if m and m.group(1) not in ['constructor','class','static']: fn=m.group(1); break
            else:
                for l in clean:
                    m = _re.search(r'function\s+(\w+)\s*\(', l)
                    if m: fn=m.group(1); break
                    m = _re.search(r'(?:const|let|var)\s+(\w+)\s*=', l)
                    if m: fn=m.group(1); break
            if not fn:
                return {'passed':0,'total':total,'error_message':'No function definition found in JS code.','test_results':[]}
            for idx, tc in enumerate(test_cases):
                inp = tc.get('input',''); exp = tc.get('expected_output','')
                try:
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                        args = DSAService._parse_test_input(inp)
                        f.write(cleaned + '\n\n')
                        if is_class:
                            f.write(f'try{{const sol=new Solution();const r=sol.{fn}({args});console.log(JSON.stringify({{result:r,success:true}}));}}catch(e){{console.log(JSON.stringify({{error:e.message,success:false}}));}}\n')
                        else:
                            f.write(f'try{{const r={fn}({args});console.log(JSON.stringify({{result:r,success:true}}));}}catch(e){{console.log(JSON.stringify({{error:e.message,success:false}}));}}\n')
                        tmp = f.name
                    proc = subprocess.run(['node', tmp], capture_output=True, text=True, timeout=5)
                    os.unlink(tmp)
                    jout = None
                    for line in reversed(proc.stdout.strip().split('\n')):
                        try: jout = json.loads(line); break
                        except: continue
                    if not jout or not jout.get('success'):
                        err = jout.get('error','Execution failed') if jout else proc.stderr.strip() or 'No output'
                        test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':err})
                        continue
                    actual = jout.get('result')
                    ok = DSAService._normalize_output(exp) == DSAService._normalize_output(actual)
                    if ok: passed += 1
                    test_results.append({'test_case':idx+1,'passed':ok,'input':inp,'expected':exp,'actual':actual,'error':None})
                except subprocess.TimeoutExpired:
                    test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':'Time Limit Exceeded (5s)'})
                except Exception as e:
                    test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':str(e)})
            msg = f"Passed {passed}/{total} test cases"
            if passed==total: msg="All test cases passed!"
            elif passed==0: msg="No test cases passed"
            return {'passed':passed,'total':total,'message':msg,'test_results':test_results}
        except Exception as e:
            return {'passed':0,'total':total,'error_message':str(e),'test_results':[]}

    @staticmethod
    def _execute_cpp_code(code: str, test_cases: List[Dict]) -> Dict[str, Any]:
        import subprocess, tempfile, os, re as _re
        passed = 0; total = len(test_cases); test_results = []
        try:
            subprocess.run(['g++','--version'], capture_output=True, timeout=3, check=True)
        except Exception:
            return {'passed':0,'total':total,'error_message':'g++ compiler is not installed on the server.','test_results':[]}
        try:
            lines = code.split('\n'); clean = []; skip = False
            for l in lines:
                if any(m in l.lower() for m in ['// example','// test','// usage','// demo','int main']): skip=True; continue
                if not skip: clean.append(l)
            cleaned = '\n'.join(clean)
            is_class = 'class Solution' in cleaned
            fn = None; ret_type = 'auto'
            pat = r'(int|bool|string|long long|double|void|vector<[^>]+>)\s+(\w+)\s*\('
            if is_class:
                for l in clean:
                    m = _re.search(pat, l)
                    if m and m.group(2) not in ['Solution','main']: ret_type=m.group(1); fn=m.group(2); break
            else:
                for l in clean:
                    m = _re.search(r'^' + pat, l)
                    if m and m.group(2)!='main': ret_type=m.group(1); fn=m.group(2); break
            if not fn:
                return {'passed':0,'total':total,'error_message':'No function definition found in C++ code.','test_results':[]}
            for idx, tc in enumerate(test_cases):
                inp = tc.get('input',''); exp = tc.get('expected_output','')
                try:
                    args = DSAService._parse_test_input(inp)
                    if 'vector' in ret_type:
                        print_stmt = 'cout<<"[";for(int _i=0;_i<_r.size();_i++){if(_i>0)cout<<",";cout<<_r[_i];}cout<<"]"<<endl;'
                    elif ret_type=='bool':
                        print_stmt = 'cout<<(_r?"true":"false")<<endl;'
                    elif ret_type=='string':
                        print_stmt = 'cout<<"\\"" <<_r<<"\\"" <<endl;'
                    else:
                        print_stmt = 'cout<<_r<<endl;'
                    if is_class:
                        main_fn = f'\nint main(){{try{{Solution _s;auto _r=_s.{fn}({args});{print_stmt}}}catch(exception& e){{cerr<<"Error:"<<e.what()<<endl;return 1;}}return 0;}}\n'
                    else:
                        main_fn = f'\nint main(){{try{{auto _r={fn}({args});{print_stmt}}}catch(exception& e){{cerr<<"Error:"<<e.what()<<endl;return 1;}}return 0;}}\n'
                    full = '#include <bits/stdc++.h>\nusing namespace std;\n' + cleaned + main_fn
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
                        f.write(full); cpp_f = f.name
                    exe_f = cpp_f.replace('.cpp','')
                    comp = subprocess.run(['g++','-O2','-o',exe_f,cpp_f], capture_output=True, text=True, timeout=10)
                    os.unlink(cpp_f)
                    if comp.returncode != 0:
                        test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':f'Compile Error: {comp.stderr.strip()}'})
                        continue
                    run = subprocess.run([exe_f], capture_output=True, text=True, timeout=5)
                    os.unlink(exe_f)
                    if run.returncode != 0:
                        test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':run.stderr.strip() or 'Runtime error'})
                        continue
                    actual = run.stdout.strip()
                    ok = DSAService._normalize_output(exp) == DSAService._normalize_output(actual)
                    if ok: passed += 1
                    test_results.append({'test_case':idx+1,'passed':ok,'input':inp,'expected':exp,'actual':actual,'error':None})
                except subprocess.TimeoutExpired:
                    test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':'Time Limit Exceeded (5s)'})
                except Exception as e:
                    test_results.append({'test_case':idx+1,'passed':False,'input':inp,'expected':exp,'actual':None,'error':str(e)})
            msg = f"Passed {passed}/{total} test cases"
            if passed==total: msg="All test cases passed!"
            elif passed==0: msg="No test cases passed"
            return {'passed':passed,'total':total,'message':msg,'test_results':test_results}
        except Exception as e:
            return {'passed':0,'total':total,'error_message':str(e),'test_results':[]}

    @staticmethod
    def _parse_test_input(input_str: str) -> str:
        if not input_str: return ""
        s = input_str.strip()
        if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")): s=s[1:-1]
        if '=' not in s: return s
        parts=[]; cur=""; depth=0; in_s=False; sc=None
        for ch in s:
            if ch in ('"',"'"):
                if not in_s: in_s=True; sc=ch
                elif ch==sc: in_s=False; sc=None
            if not in_s:
                if ch in ('[','(','{'): depth+=1
                elif ch in (']',')','}'):depth-=1
                elif ch==',' and depth==0: parts.append(cur.strip()); cur=""; continue
            cur+=ch
        if cur: parts.append(cur.strip())
        vals=[]
        for p in parts:
            vals.append(p.split('=',1)[1].strip() if '=' in p else p)
        return ', '.join(vals)

    @staticmethod
    def _normalize_output(value) -> str:
        if value is None: return 'null'
        if isinstance(value, bool): return str(value).lower()
        if isinstance(value, list):
            try:
                if all(isinstance(x,(int,float)) for x in value): return json.dumps(sorted(value))
            except: pass
            return json.dumps(value)
        if isinstance(value, str):
            s = value.strip()
            try:
                p = json.loads(s)
                if isinstance(p, list):
                    try:
                        if all(isinstance(x,(int,float)) for x in p): return json.dumps(sorted(p))
                    except: pass
                    return json.dumps(p)
                return json.dumps(p)
            except: pass
            if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")): s=s[1:-1]
            return s.lower().replace(' ','')
        return str(value).strip().lower().replace(' ','')


        # ============================================================================
    # PROGRESS TRACKING
    # ============================================================================
    
    @staticmethod
    def _update_progress(
        db: Session,
        user_id: int,
        problem_id: int,
        status: DSASubmissionStatus,
        score: int
    ):
        """Update user progress"""
        problem = db.query(DSAProblem).filter(DSAProblem.id == problem_id).first()
        
        progress = db.query(DSAProgress).filter(
            and_(DSAProgress.user_id == user_id, DSAProgress.problem_id == problem_id)
        ).first()
        
        if not progress:
            progress = DSAProgress(
                user_id=user_id,
                problem_id=problem_id,
                topic=problem.topic,
                difficulty=problem.difficulty,
                attempts=1,
                best_score=score
            )
            db.add(progress)
        else:
            progress.attempts += 1
            progress.best_score = max(progress.best_score, score)
            progress.last_attempted_at = datetime.utcnow()
        
        if status == DSASubmissionStatus.ACCEPTED:
            progress.status = "solved"
            if not progress.solved_at:
                progress.solved_at = datetime.utcnow()
        
        # Update user stats
        DSAService._update_user_stats(db, user_id)
    
    @staticmethod
    def _update_user_stats(db: Session, user_id: int):
        """Update aggregate user statistics"""
        stats = db.query(DSAUserStats).filter(DSAUserStats.user_id == user_id).first()
        
        if not stats:
            stats = DSAUserStats(user_id=user_id)
            db.add(stats)
        
        # Calculate stats from progress
        solved = db.query(DSAProgress).filter(
            and_(DSAProgress.user_id == user_id, DSAProgress.status == "solved")
        ).count()
        
        easy_solved = db.query(DSAProgress).filter(
            and_(
                DSAProgress.user_id == user_id,
                DSAProgress.status == "solved",
                DSAProgress.difficulty == DifficultyLevel.EASY
            )
        ).count()
        
        medium_solved = db.query(DSAProgress).filter(
            and_(
                DSAProgress.user_id == user_id,
                DSAProgress.status == "solved",
                DSAProgress.difficulty == DifficultyLevel.MEDIUM
            )
        ).count()
        
        hard_solved = db.query(DSAProgress).filter(
            and_(
                DSAProgress.user_id == user_id,
                DSAProgress.status == "solved",
                DSAProgress.difficulty == DifficultyLevel.HARD
            )
        ).count()
        
        total_attempts = db.query(DSAProgress).filter(
            DSAProgress.user_id == user_id
        ).count()
        
        accuracy = int((solved / total_attempts) * 100) if total_attempts > 0 else 0
        
        # Update stats
        stats.total_solved = solved
        stats.easy_solved = easy_solved
        stats.medium_solved = medium_solved
        stats.hard_solved = hard_solved
        stats.total_attempts = total_attempts
        stats.accuracy = accuracy
        stats.last_solved_date = date.today()
        stats.updated_at = datetime.utcnow()
        
        db.commit()
    
    # ============================================================================
    # LEADERBOARD
    # ============================================================================
    
    @staticmethod
    def get_leaderboard(db: Session, limit: int = 100) -> List[Dict]:
        """Get top users by score"""
        stats = db.query(DSAUserStats, User).join(
            User, DSAUserStats.user_id == User.id
        ).order_by(
            DSAUserStats.total_solved.desc(),
            DSAUserStats.accuracy.desc()
        ).limit(limit).all()
        
        return [
            {
                "rank": idx + 1,
                "user_id": stat.user_id,
                "name": user.name,
                "total_solved": stat.total_solved,
                "accuracy": stat.accuracy,
                "easy_solved": stat.easy_solved,
                "medium_solved": stat.medium_solved,
                "hard_solved": stat.hard_solved
            }
            for idx, (stat, user) in enumerate(stats)
        ]
    
    # ============================================================================
    # DAILY CHALLENGE
    # ============================================================================
    
    @staticmethod
    def get_daily_challenge(db: Session) -> Optional[Dict]:
        """Get or select daily challenge from existing problems"""
        today = date.today()
        
        # Check if daily challenge exists for today
        challenge = db.query(DSAProblem).filter(
            and_(
                DSAProblem.is_daily_challenge == True,
                DSAProblem.daily_challenge_date == today
            )
        ).first()
        
        if challenge:
            return DSAService.get_question_by_id(db, challenge.id)
        
        # Select a random existing problem as daily challenge
        import random
        
        # Get all problems
        all_problems = db.query(DSAProblem).all()
        
        if not all_problems:
            return None
        
        # Select random problem
        challenge = random.choice(all_problems)
        
        # Mark as daily challenge
        challenge.is_daily_challenge = True
        challenge.daily_challenge_date = today
        db.commit()
        
        return DSAService.get_question_by_id(db, challenge.id)
    
    # ============================================================================
    # USER DASHBOARD DATA
    # ============================================================================
    
    @staticmethod
    def get_user_dashboard(db: Session, user_id: int) -> Dict[str, Any]:
        """Get user dashboard statistics"""
        stats = db.query(DSAUserStats).filter(DSAUserStats.user_id == user_id).first()
        
        if not stats:
            stats = DSAUserStats(user_id=user_id)
            db.add(stats)
            db.commit()
        
        # Get weak topics
        weak_topics = db.query(
            DSAProgress.topic,
            func.count(DSAProgress.id).label('attempts'),
            func.sum(func.cast(DSAProgress.status == 'solved', Integer)).label('solved')
        ).filter(
            DSAProgress.user_id == user_id
        ).group_by(
            DSAProgress.topic
        ).having(
            func.sum(func.cast(DSAProgress.status == 'solved', Integer)) < func.count(DSAProgress.id) / 2
        ).all()
        
        return {
            "total_solved": stats.total_solved,
            "easy_solved": stats.easy_solved,
            "medium_solved": stats.medium_solved,
            "hard_solved": stats.hard_solved,
            "accuracy": stats.accuracy,
            "streak_days": stats.streak_days,
            "weak_topics": [
                {
                    "topic": topic,
                    "attempts": attempts,
                    "solved": solved or 0
                }
                for topic, attempts, solved in weak_topics
            ]
        }
