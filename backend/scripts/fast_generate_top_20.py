"""
Fast Generate Solutions for Top 20 Problems
Pre-cache solutions for instant loading
"""
import sys
import json
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import DSAProblem
import google.generativeai as genai
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# Top 20 most popular problems
TOP_20_TITLES = [
    "Two Sum",
    "Best Time to Buy and Sell Stock",
    "Contains Duplicate",
    "Maximum Subarray",
    "Product of Array Except Self",
    "Valid Anagram",
    "Valid Parentheses",
    "Longest Substring Without Repeating Characters",
    "Longest Palindromic Substring",
    "Group Anagrams",
    "Reverse Linked List",
    "Merge Two Sorted Lists",
    "Linked List Cycle",
    "Maximum Depth of Binary Tree",
    "Invert Binary Tree",
    "Binary Tree Level Order Traversal",
    "Validate Binary Search Tree",
    "Climbing Stairs",
    "House Robber",
    "Coin Change"
]


def generate_solutions(problem: DSAProblem) -> dict:
    """Generate solutions for all 3 languages"""
    try:
        prompt = f"""Generate optimized solutions for: {problem.title}

Description: {problem.description[:200]}...

Return ONLY valid JSON (no markdown):
{{
    "python": "def solution():\\n    pass",
    "javascript": "function solution() {{}}",
    "cpp": "class Solution {{}};"
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2000,
            )
        )
        
        text = response.text.strip()
        
        # Extract JSON
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        return json.loads(text)
        
    except Exception as e:
        print(f"   ⚠️  Error: {str(e)[:50]}")
        return None


def fast_generate_top_20(db: Session):
    """Generate solutions for top 20 problems"""
    print("=" * 80)
    print("⚡ FAST GENERATE: TOP 20 PROBLEMS")
    print("=" * 80)
    print()
    
    generated = 0
    skipped = 0
    failed = 0
    
    start_time = time.time()
    
    for idx, title in enumerate(TOP_20_TITLES, 1):
        print(f"[{idx}/20] {title}")
        
        # Find problem
        problem = db.query(DSAProblem).filter(DSAProblem.title == title).first()
        
        if not problem:
            print(f"   ⚠️  Not found in database")
            skipped += 1
            continue
        
        # Check if already cached
        if problem.solutions_cache:
            try:
                cached = json.loads(problem.solutions_cache)
                if all(k in cached for k in ['python', 'javascript', 'cpp']):
                    print(f"   ✅ Already cached")
                    skipped += 1
                    continue
            except:
                pass
        
        # Generate solutions
        solutions = generate_solutions(problem)
        
        if solutions and all(k in solutions for k in ['python', 'javascript', 'cpp']):
            problem.solutions_cache = json.dumps(solutions)
            db.commit()
            generated += 1
            print(f"   ✅ Generated & cached")
        else:
            failed += 1
            print(f"   ❌ Failed")
        
        # Rate limiting
        time.sleep(1.5)
    
    elapsed = time.time() - start_time
    
    print()
    print("=" * 80)
    print("🎉 GENERATION COMPLETE!")
    print("=" * 80)
    print(f"⏱️  Time: {elapsed:.1f}s")
    print(f"✅ Generated: {generated}")
    print(f"⏭️  Skipped: {skipped}")
    print(f"❌ Failed: {failed}")
    print("=" * 80)


if __name__ == "__main__":
    db = SessionLocal()
    try:
        fast_generate_top_20(db)
    finally:
        db.close()
