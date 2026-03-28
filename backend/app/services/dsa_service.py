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
        """
        Execute Python code in isolated environment with proper output validation
        """
        import subprocess
        import tempfile
        import os
        
        passed = 0
        total = len(test_cases)
        test_results = []
        error_message = None
        
        try:
            # Clean the code - remove example usage at the bottom
            code_lines = code.split('\n')
            cleaned_lines = []
            skip_rest = False
            
            for line in code_lines:
                # Stop at common example usage markers
                if any(marker in line.lower() for marker in [
                    '# example usage', '# test', '# example', 
                    'if __name__', '# usage:', '# demo'
                ]):
                    skip_rest = True
                    continue
                
                if not skip_rest:
                    cleaned_lines.append(line)
            
            cleaned_code = '\n'.join(cleaned_lines)
            
            # Extract function name from code
            function_name = None
            for line in cleaned_lines:
                if line.strip().startswith('def '):
                    function_name = line.strip().split('def ')[1].split('(')[0].strip()
                    break
            
            if not function_name:
                return {
                    'passed': 0,
                    'total': total,
                    'error_message': 'No function definition found in code',
                    'test_results': []
                }
            
            # Run each test case in isolated environment
            for idx, test_case in enumerate(test_cases):
                try:
                    # Create temporary file for this test case
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                        # Write the user's code
                        f.write(cleaned_code)
                        f.write('\n\n')
                        
                        # Write test execution code
                        f.write('import json\n')
                        f.write('import sys\n\n')
                        
                        # Parse input and call function
                        test_input = test_case.get('input', '')
                        expected_output = test_case.get('expected_output', '')
                        
                        # Parse the input string to extract actual values
                        # Handle formats like: "n = 1", "[2,7,11,15], 9", "nums = [1,2,3]"
                        parsed_args = DSAService._parse_test_input(test_input)
                        
                        # Write execution code that captures only the return value
                        f.write(f'try:\n')
                        f.write(f'    # Execute function with parsed input\n')
                        f.write(f'    result = {function_name}({parsed_args})\n')
                        f.write(f'    \n')
                        f.write(f'    # Print only the result as JSON\n')
                        f.write(f'    print(json.dumps({{"result": result, "success": True}}))\n')
                        f.write(f'except Exception as e:\n')
                        f.write(f'    print(json.dumps({{"error": str(e), "success": False}}))\n')
                        
                        temp_file = f.name
                    
                    # Execute in isolated subprocess with timeout
                    result = subprocess.run(
                        ['python3', temp_file],
                        capture_output=True,
                        text=True,
                        timeout=5  # 5 second timeout
                    )
                    
                    # Clean up temp file
                    os.unlink(temp_file)
                    
                    # Parse output
                    if result.returncode != 0:
                        test_results.append({
                            'test_case': idx + 1,
                            'passed': False,
                            'input': test_input,
                            'expected': expected_output,
                            'actual': None,
                            'error': result.stderr or 'Runtime error'
                        })
                        continue
                    
                    # Extract only the JSON output (ignore print statements)
                    output_lines = result.stdout.strip().split('\n')
                    json_output = None
                    
                    for line in reversed(output_lines):  # Start from last line
                        try:
                            json_output = json.loads(line)
                            break
                        except:
                            continue
                    
                    if not json_output or not json_output.get('success'):
                        test_results.append({
                            'test_case': idx + 1,
                            'passed': False,
                            'input': test_input,
                            'expected': expected_output,
                            'actual': None,
                            'error': json_output.get('error', 'Execution failed') if json_output else 'No output'
                        })
                        continue
                    
                    actual_result = json_output.get('result')
                    
                    # Strict comparison - normalize both values
                    expected_normalized = DSAService._normalize_output(expected_output)
                    actual_normalized = DSAService._normalize_output(actual_result)
                    
                    is_passed = expected_normalized == actual_normalized
                    
                    if is_passed:
                        passed += 1
                    
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': is_passed,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': actual_result,
                        'error': None
                    })
                    
                except subprocess.TimeoutExpired:
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': False,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': None,
                        'error': 'Time Limit Exceeded (5s)'
                    })
                except Exception as e:
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': False,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': None,
                        'error': str(e)
                    })
            
            message = f"Passed {passed}/{total} test cases"
            if passed == total:
                message = "✅ All test cases passed!"
            elif passed == 0:
                message = "❌ No test cases passed"
            
            return {
                'passed': passed,
                'total': total,
                'message': message,
                'test_results': test_results,
                'error_message': error_message
            }
            
        except Exception as e:
            logger.error(f"Code execution failed: {e}")
            return {
                'passed': 0,
                'total': total,
                'error_message': str(e),
                'test_results': []
            }
    
    @staticmethod
    def _parse_test_input(input_str: str) -> str:
        """
        Parse test input string into valid Python function arguments
        
        Examples:
            "n = 1" -> "1"
            "[2,7,11,15], 9" -> "[2,7,11,15], 9"
            "nums = [1,2,3], target = 5" -> "[1,2,3], 5"
            "s = 'hello'" -> "'hello'"
        """
        if not input_str:
            return ""
        
        # Remove quotes around the entire string if present
        input_str = input_str.strip()
        if (input_str.startswith('"') and input_str.endswith('"')) or \
           (input_str.startswith("'") and input_str.endswith("'")):
            input_str = input_str[1:-1]
        
        # Check if it contains '=' (parameter assignment format)
        if '=' in input_str:
            # Split by comma to handle multiple parameters
            parts = []
            current = ""
            bracket_depth = 0
            in_string = False
            string_char = None
            
            for char in input_str:
                if char in ['"', "'"]:
                    if not in_string:
                        in_string = True
                        string_char = char
                    elif char == string_char:
                        in_string = False
                        string_char = None
                
                if not in_string:
                    if char in ['[', '(', '{']:
                        bracket_depth += 1
                    elif char in [']', ')', '}']:
                        bracket_depth -= 1
                    elif char == ',' and bracket_depth == 0:
                        parts.append(current.strip())
                        current = ""
                        continue
                
                current += char
            
            if current:
                parts.append(current.strip())
            
            # Extract values from "param = value" format
            values = []
            for part in parts:
                if '=' in part:
                    # Extract value after '='
                    value = part.split('=', 1)[1].strip()
                    values.append(value)
                else:
                    values.append(part)
            
            return ', '.join(values)
        else:
            # No '=' sign, use as-is
            return input_str
    
    @staticmethod
    def _normalize_output(value: Any) -> str:
        """
        Normalize output for strict comparison
        Handles lists, strings, numbers, etc.
        """
        if value is None:
            return 'null'
        
        # Convert to string and normalize
        if isinstance(value, str):
            # Try to parse as JSON first
            try:
                parsed = json.loads(value)
                return json.dumps(parsed, sort_keys=True)
            except:
                return value.strip()
        
        # For lists, dicts, etc., use JSON serialization
        try:
            return json.dumps(value, sort_keys=True)
        except:
            return str(value).strip()
    
    @staticmethod
    def _execute_javascript_code(code: str, test_cases: List[Dict]) -> Dict[str, Any]:
        """
        Execute JavaScript code with Node.js
        """
        import subprocess
        import tempfile
        import os
        
        passed = 0
        total = len(test_cases)
        test_results = []
        
        try:
            # Clean code - remove example usage
            code_lines = code.split('\n')
            cleaned_lines = []
            skip_rest = False
            
            for line in code_lines:
                if any(marker in line.lower() for marker in [
                    '// example', '// test', '// usage', '// demo'
                ]):
                    skip_rest = True
                    continue
                if not skip_rest:
                    cleaned_lines.append(line)
            
            cleaned_code = '\n'.join(cleaned_lines)
            
            # Extract function name
            function_name = None
            for line in cleaned_lines:
                if 'function ' in line:
                    parts = line.split('function ')[1].split('(')[0].strip()
                    function_name = parts
                    break
            
            if not function_name:
                return {
                    'passed': 0,
                    'total': total,
                    'error_message': 'No function definition found',
                    'test_results': []
                }
            
            # Run each test case
            for idx, test_case in enumerate(test_cases):
                try:
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                        # Write user code
                        f.write(cleaned_code)
                        f.write('\n\n')
                        
                        # Write test execution
                        test_input = test_case.get('input', '')
                        expected_output = test_case.get('expected_output', '')
                        
                        parsed_args = DSAService._parse_test_input(test_input)
                        
                        f.write('try {\n')
                        f.write(f'    const result = {function_name}({parsed_args});\n')
                        f.write('    console.log(JSON.stringify({result: result, success: true}));\n')
                        f.write('} catch (e) {\n')
                        f.write('    console.log(JSON.stringify({error: e.message, success: false}));\n')
                        f.write('}\n')
                        
                        temp_file = f.name
                    
                    # Execute with Node.js
                    result = subprocess.run(
                        ['node', temp_file],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    
                    os.unlink(temp_file)
                    
                    if result.returncode != 0:
                        test_results.append({
                            'test_case': idx + 1,
                            'passed': False,
                            'input': test_input,
                            'expected': expected_output,
                            'actual': None,
                            'error': result.stderr or 'Runtime error'
                        })
                        continue
                    
                    # Parse output
                    output_lines = result.stdout.strip().split('\n')
                    json_output = None
                    
                    for line in reversed(output_lines):
                        try:
                            json_output = json.loads(line)
                            break
                        except:
                            continue
                    
                    if not json_output or not json_output.get('success'):
                        test_results.append({
                            'test_case': idx + 1,
                            'passed': False,
                            'input': test_input,
                            'expected': expected_output,
                            'actual': None,
                            'error': json_output.get('error', 'Execution failed') if json_output else 'No output'
                        })
                        continue
                    
                    actual_result = json_output.get('result')
                    expected_normalized = DSAService._normalize_output(expected_output)
                    actual_normalized = DSAService._normalize_output(actual_result)
                    
                    is_passed = expected_normalized == actual_normalized
                    
                    if is_passed:
                        passed += 1
                    
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': is_passed,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': actual_result,
                        'error': None
                    })
                    
                except subprocess.TimeoutExpired:
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': False,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': None,
                        'error': 'Time Limit Exceeded (5s)'
                    })
                except Exception as e:
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': False,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': None,
                        'error': str(e)
                    })
            
            message = f"Passed {passed}/{total} test cases"
            if passed == total:
                message = "✅ All test cases passed!"
            elif passed == 0:
                message = "❌ No test cases passed"
            
            return {
                'passed': passed,
                'total': total,
                'message': message,
                'test_results': test_results
            }
            
        except Exception as e:
            return {
                'passed': 0,
                'total': total,
                'error_message': str(e),
                'test_results': []
            }
    
    @staticmethod
    def _execute_cpp_code(code: str, test_cases: List[Dict]) -> Dict[str, Any]:
        """
        Execute C++ code with g++
        """
        import subprocess
        import tempfile
        import os
        import re
        
        passed = 0
        total = len(test_cases)
        test_results = []
        
        try:
            # Clean code
            code_lines = code.split('\n')
            cleaned_lines = []
            skip_rest = False
            
            for line in code_lines:
                if any(marker in line.lower() for marker in [
                    '// example', '// test', '// usage', '// demo', '// main'
                ]):
                    skip_rest = True
                    continue
                if not skip_rest:
                    cleaned_lines.append(line)
            
            cleaned_code = '\n'.join(cleaned_lines)
            
            # Detect if code uses class or standalone function
            is_class_based = 'class Solution' in cleaned_code or 'class solution' in cleaned_code.lower()
            
            # Extract function name
            function_name = None
            if is_class_based:
                # Look for method inside class
                for line in cleaned_lines:
                    if 'vector<int>' in line or 'int ' in line or 'bool ' in line or 'string ' in line:
                        match = re.search(r'\s+(\w+)\s*\(', line)
                        if match and match.group(1) not in ['class', 'public', 'private', 'protected']:
                            function_name = match.group(1)
                            break
            else:
                # Standalone function
                for line in cleaned_lines:
                    if 'vector<int>' in line or 'int ' in line or 'bool ' in line or 'string ' in line:
                        match = re.search(r'(\w+)\s*\(', line)
                        if match:
                            function_name = match.group(1)
                            break
            
            if not function_name:
                return {
                    'passed': 0,
                    'total': total,
                    'error_message': 'No function definition found',
                    'test_results': []
                }
            
            # Run each test case
            for idx, test_case in enumerate(test_cases):
                try:
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
                        # Write includes
                        f.write('#include <iostream>\n')
                        f.write('#include <vector>\n')
                        f.write('#include <string>\n')
                        f.write('#include <sstream>\n')
                        f.write('#include <unordered_map>\n')
                        f.write('using namespace std;\n\n')
                        
                        # Write user code
                        f.write(cleaned_code)
                        f.write('\n\n')
                        
                        # Write main function for testing
                        test_input = test_case.get('input', '')
                        expected_output = test_case.get('expected_output', '')
                        
                        # Parse input for C++ (convert Python lists to C++ vectors)
                        parsed_args = DSAService._parse_test_input(test_input)
                        
                        # Smart split arguments (handle nested brackets)
                        args = []
                        current = ""
                        bracket_depth = 0
                        for char in parsed_args:
                            if char in ['[', '(', '{']:
                                bracket_depth += 1
                            elif char in [']', ')', '}']:
                                bracket_depth -= 1
                            elif char == ',' and bracket_depth == 0:
                                args.append(current.strip())
                                current = ""
                                continue
                            current += char
                        if current:
                            args.append(current.strip())
                        
                        f.write('int main() {\n')
                        f.write('    try {\n')
                        
                        # Create variables for vector arguments
                        cpp_call_args = []
                        for i, arg in enumerate(args):
                            if arg.startswith('[') and arg.endswith(']'):
                                # Convert list to vector
                                vector_content = arg[1:-1]  # Remove [ ]
                                f.write(f'        vector<int> arg{i} = {{{vector_content}}};\n')
                                cpp_call_args.append(f'arg{i}')
                            else:
                                cpp_call_args.append(arg)
                        
                        call_args = ', '.join(cpp_call_args)
                        
                        if is_class_based:
                            f.write('        Solution sol;\n')
                            f.write(f'        auto result = sol.{function_name}({call_args});\n')
                        else:
                            f.write(f'        auto result = {function_name}({call_args});\n')
                        
                        # Print result based on type
                        f.write('        // Print result\n')
                        f.write('        cout << "[";\n')
                        f.write('        for (size_t i = 0; i < result.size(); i++) {\n')
                        f.write('            if (i > 0) cout << ",";\n')
                        f.write('            cout << result[i];\n')
                        f.write('        }\n')
                        f.write('        cout << "]" << endl;\n')
                        f.write('        return 0;\n')
                        f.write('    } catch (exception& e) {\n')
                        f.write('        cerr << "Error: " << e.what() << endl;\n')
                        f.write('        return 1;\n')
                        f.write('    }\n')
                        f.write('}\n')
                        
                        cpp_file = f.name
                    
                    # Compile
                    exe_file = cpp_file.replace('.cpp', '')
                    compile_result = subprocess.run(
                        ['g++', '-std=c++17', cpp_file, '-o', exe_file],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    
                    if compile_result.returncode != 0:
                        os.unlink(cpp_file)
                        test_results.append({
                            'test_case': idx + 1,
                            'passed': False,
                            'input': test_input,
                            'expected': expected_output,
                            'actual': None,
                            'error': f'Compilation error: {compile_result.stderr[:200]}'
                        })
                        continue
                    
                    # Execute
                    run_result = subprocess.run(
                        [exe_file],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    
                    # Cleanup
                    os.unlink(cpp_file)
                    if os.path.exists(exe_file):
                        os.unlink(exe_file)
                    
                    if run_result.returncode != 0:
                        test_results.append({
                            'test_case': idx + 1,
                            'passed': False,
                            'input': test_input,
                            'expected': expected_output,
                            'actual': None,
                            'error': run_result.stderr or 'Runtime error'
                        })
                        continue
                    
                    actual_result = run_result.stdout.strip()
                    expected_normalized = DSAService._normalize_output(expected_output)
                    actual_normalized = DSAService._normalize_output(actual_result)
                    
                    is_passed = expected_normalized == actual_normalized
                    
                    if is_passed:
                        passed += 1
                    
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': is_passed,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': actual_result,
                        'error': None
                    })
                    
                except subprocess.TimeoutExpired:
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': False,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': None,
                        'error': 'Time Limit Exceeded'
                    })
                except Exception as e:
                    test_results.append({
                        'test_case': idx + 1,
                        'passed': False,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': None,
                        'error': str(e)
                    })
            
            message = f"Passed {passed}/{total} test cases"
            if passed == total:
                message = "✅ All test cases passed!"
            elif passed == 0:
                message = "❌ No test cases passed"
            
            return {
                'passed': passed,
                'total': total,
                'message': message,
                'test_results': test_results
            }
            
        except Exception as e:
            return {
                'passed': 0,
                'total': total,
                'error_message': str(e),
                'test_results': []
            }
    
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
