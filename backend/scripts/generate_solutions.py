"""
Pre-computation Script: Generate and Cache Solutions for All DSA Problems
This script eliminates AI latency by pre-generating solutions for all languages
"""
import sys
import os
import json
import time
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import DSAProblem
import google.generativeai as genai
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-2.5-flash')


def generate_multi_language_solution(problem: DSAProblem) -> dict:
    """
    Generate solutions for Python, JavaScript, and C++ in a single API call
    """
    try:
        # Build comprehensive prompt
        prompt = f"""You are an expert DSA instructor. Generate highly optimized, clean, and heavily commented solutions for this problem in Python, JavaScript, and C++.

**Problem Title:** {problem.title}

**Description:**
{problem.description}

**Constraints:**
{problem.constraints or 'Standard constraints apply'}

**Expected Complexity:**
- Time: {problem.time_complexity or 'O(n)'}
- Space: {problem.space_complexity or 'O(1)'}

**Requirements for EACH language:**
1. Production-quality code with best practices
2. Detailed inline comments explaining EVERY step
3. Same function signature as starter code
4. Optimized for the target complexity
5. Clean, readable, and educational

**CRITICAL: Return ONLY a valid JSON object with this EXACT structure (no markdown, no extra text):**
{{
    "python": "# Python solution with detailed comments\\ndef functionName(params):\\n    # Step 1: ...\\n    pass",
    "javascript": "// JavaScript solution with detailed comments\\nfunction functionName(params) {{\\n    // Step 1: ...\\n}}",
    "cpp": "// C++ solution with detailed comments\\n#include <vector>\\nusing namespace std;\\n\\nclass Solution {{\\npublic:\\n    // Step 1: ...\\n}};"
}}

Generate the solutions now:"""

        # Call Gemini API
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Parse JSON
        solutions = json.loads(response_text)
        
        # Validate structure
        required_keys = ['python', 'javascript', 'cpp']
        if not all(key in solutions for key in required_keys):
            raise ValueError(f"Missing required keys. Got: {list(solutions.keys())}")
        
        return solutions
        
    except json.JSONDecodeError as e:
        print(f"   ❌ JSON parsing error: {e}")
        print(f"   Response: {response_text[:200]}...")
        return None
    except Exception as e:
        print(f"   ❌ Generation error: {e}")
        return None


def generate_all_solutions(batch_size: int = 5, delay: float = 2.0):
    """
    Generate solutions for all problems in the database
    
    Args:
        batch_size: Number of problems to process before showing progress
        delay: Delay in seconds between API calls to avoid rate limits
    """
    db = SessionLocal()
    
    try:
        # Get all problems
        problems = db.query(DSAProblem).all()
        total = len(problems)
        
        if total == 0:
            print("❌ No problems found in database")
            return
        
        print("=" * 70)
        print("🚀 DSA Solution Cache Generator")
        print("=" * 70)
        print(f"📊 Total problems to process: {total}")
        print(f"⚙️  Batch size: {batch_size}")
        print(f"⏱️  Delay between calls: {delay}s")
        print("=" * 70)
        print()
        
        success_count = 0
        skip_count = 0
        error_count = 0
        
        for idx, problem in enumerate(problems, 1):
            print(f"[{idx}/{total}] Processing: {problem.title}")
            print(f"   Topic: {problem.topic.value}, Difficulty: {problem.difficulty.value}")
            
            # Check if already cached
            if problem.solutions_cache:
                try:
                    cached = json.loads(problem.solutions_cache)
                    if all(cached.get(lang) for lang in ['python', 'javascript', 'cpp']):
                        print(f"   ✅ Already cached (skipping)")
                        skip_count += 1
                        continue
                except:
                    pass
            
            # Generate solutions
            print(f"   🤖 Generating solutions...")
            solutions = generate_multi_language_solution(problem)
            
            if solutions:
                # Save to database
                problem.solutions_cache = json.dumps(solutions)
                db.commit()
                
                success_count += 1
                print(f"   ✅ Generated and cached!")
                print(f"      - Python: {len(solutions['python'])} chars")
                print(f"      - JavaScript: {len(solutions['javascript'])} chars")
                print(f"      - C++: {len(solutions['cpp'])} chars")
            else:
                error_count += 1
                print(f"   ❌ Failed to generate")
            
            print()
            
            # Progress update
            if idx % batch_size == 0:
                print("-" * 70)
                print(f"📈 Progress: {idx}/{total} ({int(idx/total*100)}%)")
                print(f"   ✅ Success: {success_count}")
                print(f"   ⏭️  Skipped: {skip_count}")
                print(f"   ❌ Errors: {error_count}")
                print("-" * 70)
                print()
            
            # Rate limiting delay
            if idx < total:
                time.sleep(delay)
        
        # Final summary
        print("=" * 70)
        print("🎉 Solution Generation Complete!")
        print("=" * 70)
        print(f"📊 Final Statistics:")
        print(f"   Total Problems: {total}")
        print(f"   ✅ Successfully Generated: {success_count}")
        print(f"   ⏭️  Already Cached: {skip_count}")
        print(f"   ❌ Failed: {error_count}")
        print(f"   📈 Success Rate: {int((success_count + skip_count) / total * 100)}%")
        print("=" * 70)
        
        if error_count > 0:
            print(f"\n⚠️  {error_count} problems failed. You can re-run this script to retry.")
        
    except Exception as e:
        print(f"\n❌ Script failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def regenerate_single_problem(problem_id: int):
    """
    Regenerate solution cache for a single problem
    Useful for fixing individual problems
    """
    db = SessionLocal()
    
    try:
        problem = db.query(DSAProblem).filter(DSAProblem.id == problem_id).first()
        
        if not problem:
            print(f"❌ Problem with ID {problem_id} not found")
            return
        
        print(f"🔄 Regenerating solution for: {problem.title}")
        
        solutions = generate_multi_language_solution(problem)
        
        if solutions:
            problem.solutions_cache = json.dumps(solutions)
            db.commit()
            print(f"✅ Successfully regenerated and cached!")
        else:
            print(f"❌ Failed to generate solution")
            
    finally:
        db.close()


def clear_all_caches():
    """
    Clear all solution caches (useful for testing)
    """
    db = SessionLocal()
    
    try:
        count = db.query(DSAProblem).update({DSAProblem.solutions_cache: None})
        db.commit()
        print(f"✅ Cleared {count} solution caches")
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate and cache DSA solutions')
    parser.add_argument('--batch-size', type=int, default=5, help='Batch size for progress updates')
    parser.add_argument('--delay', type=float, default=2.0, help='Delay between API calls (seconds)')
    parser.add_argument('--problem-id', type=int, help='Regenerate single problem by ID')
    parser.add_argument('--clear', action='store_true', help='Clear all caches')
    
    args = parser.parse_args()
    
    if args.clear:
        print("⚠️  This will clear all solution caches. Continue? (y/n): ", end='')
        if input().lower() == 'y':
            clear_all_caches()
    elif args.problem_id:
        regenerate_single_problem(args.problem_id)
    else:
        generate_all_solutions(batch_size=args.batch_size, delay=args.delay)
