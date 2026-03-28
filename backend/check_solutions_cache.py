"""
Quick script to check if solutions are being cached
"""
import sys
import json
from app.core.database import SessionLocal
from app.models import DSAProblem

db = SessionLocal()

try:
    # Get all problems
    problems = db.query(DSAProblem).all()
    
    cached_count = 0
    total_count = len(problems)
    
    print(f"📊 Total problems: {total_count}\n")
    
    for problem in problems[:10]:  # Show first 10
        has_cache = bool(problem.solutions_cache)
        
        if has_cache:
            try:
                cache = json.loads(problem.solutions_cache)
                langs = [k for k in ['python', 'javascript', 'cpp'] if cache.get(k)]
                cached_count += 1
                print(f"✅ {problem.title}")
                print(f"   Languages: {', '.join(langs)}")
            except:
                print(f"⚠️  {problem.title} - Invalid cache")
        else:
            print(f"❌ {problem.title} - No cache")
        print()
    
    print(f"\n📈 Summary: {cached_count}/{total_count} problems have cached solutions")
    
finally:
    db.close()
