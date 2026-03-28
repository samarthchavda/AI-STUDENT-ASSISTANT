"""
Enhance Existing Problems with AI-Generated Content
Updates descriptions, examples, and constraints for better quality
"""
import sys
import json
import time
from pathlib import Path
from typing import List, Dict, Optional

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import DSAProblem
import google.generativeai as genai
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-2.5-flash')


def enhance_problem(problem: DSAProblem) -> Dict:
    """
    Enhance a single problem with AI-generated content
    """
    try:
        prompt = f"""Enhance this DSA problem with detailed, high-quality content:

Title: {problem.title}
Topic: {problem.topic}
Difficulty: {problem.difficulty}

Generate:
1. Detailed description (3-4 sentences explaining the problem clearly)
2. Two realistic examples with:
   - Input (actual values)
   - Output (actual result)
   - Explanation (why this output)
3. Specific constraints (based on problem type)
4. Three progressive hints (easy → medium → strong)

Return as JSON:
{{
  "description": "Clear problem description...",
  "examples": [
    {{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"}},
    {{"input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "nums[1] + nums[2] = 2 + 4 = 6"}}
  ],
  "constraints": "2 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9",
  "hints": ["Consider using a hash map", "Think about time complexity", "One-pass solution exists"]
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=1500,
            )
        )
        response_text = response.text.strip()
        
        # Extract JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(response_text)
        
    except Exception as e:
        print(f"   ⚠️  Enhancement failed: {str(e)[:100]}")
        return None


def enhance_problems(
    db: Session,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: Optional[int] = None
):
    """
    Enhance problems with AI-generated content
    """
    print("=" * 80)
    print("🎨 ENHANCE DSA PROBLEMS")
    print("=" * 80)
    
    # Build query
    query = db.query(DSAProblem)
    
    if topic:
        query = query.filter(DSAProblem.topic == topic)
    if difficulty:
        query = query.filter(DSAProblem.difficulty == difficulty)
    
    # Get problems that need enhancement (basic descriptions)
    problems = query.filter(
        DSAProblem.description.like('%solve the problem:%') |
        DSAProblem.description.like('%Given%')
    ).all()
    
    if limit:
        problems = problems[:limit]
    
    total = len(problems)
    print(f"📊 Problems to enhance: {total}")
    if topic:
        print(f"🏷️  Topic filter: {topic}")
    if difficulty:
        print(f"📈 Difficulty filter: {difficulty}")
    print("=" * 80)
    print()
    
    enhanced = 0
    failed = 0
    skipped = 0
    
    start_time = time.time()
    
    for idx, problem in enumerate(problems, 1):
        print(f"[{idx}/{total}] {problem.title} ({problem.topic}, {problem.difficulty})")
        
        # Enhance with AI
        result = enhance_problem(problem)
        
        if not result:
            print(f"   ❌ Failed")
            failed += 1
            time.sleep(2)
            continue
        
        # Update problem
        try:
            problem.description = result.get('description', problem.description)
            problem.examples = json.dumps(result.get('examples', []))
            problem.constraints = result.get('constraints', problem.constraints)
            problem.hints = json.dumps(result.get('hints', []))
            
            db.commit()
            enhanced += 1
            print(f"   ✅ Enhanced")
            
        except Exception as e:
            print(f"   ❌ Update failed: {str(e)[:50]}")
            db.rollback()
            failed += 1
        
        # Rate limiting
        time.sleep(1.5)
        
        # Progress update every 10 problems
        if idx % 10 == 0:
            elapsed = time.time() - start_time
            rate = enhanced / elapsed if elapsed > 0 else 0
            remaining = (total - idx) / rate if rate > 0 else 0
            print()
            print(f"📈 Progress: {idx}/{total} ({int(idx/total*100)}%)")
            print(f"⏱️  Time: {elapsed:.1f}s | Rate: {rate:.2f} problems/min")
            print(f"⏳ Estimated remaining: {remaining/60:.1f} minutes")
            print()
    
    elapsed = time.time() - start_time
    
    print()
    print("=" * 80)
    print("🎉 ENHANCEMENT COMPLETE!")
    print("=" * 80)
    print(f"⏱️  Total Time: {elapsed/60:.1f} minutes")
    print(f"✅ Enhanced: {enhanced}")
    print(f"❌ Failed: {failed}")
    print(f"⏭️  Skipped: {skipped}")
    print(f"🚀 Average: {enhanced/(elapsed/60):.1f} problems/minute")
    print("=" * 80)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Enhance DSA problems with AI')
    parser.add_argument('--topic', type=str, help='Filter by topic (arrays, strings, etc.)')
    parser.add_argument('--difficulty', type=str, help='Filter by difficulty (easy, medium, hard)')
    parser.add_argument('--limit', type=int, help='Limit number of problems')
    
    args = parser.parse_args()
    
    db = SessionLocal()
    try:
        enhance_problems(
            db,
            topic=args.topic,
            difficulty=args.difficulty,
            limit=args.limit
        )
    finally:
        db.close()
