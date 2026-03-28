"""
Test Solution Loading Speed
"""
import time
from app.core.database import SessionLocal
from app.services.dsa_service import DSAService

def test_solution_speed():
    """Test how fast solutions load"""
    db = SessionLocal()
    
    try:
        # Test 5 random problems
        test_problems = [587, 588, 589, 592, 2]
        
        print("=" * 80)
        print("⚡ TESTING SOLUTION LOADING SPEED")
        print("=" * 80)
        print()
        
        total_time = 0
        
        for problem_id in test_problems:
            start = time.time()
            result = DSAService.get_solution(db, problem_id, user_id=None, language='python')
            elapsed = (time.time() - start) * 1000  # Convert to ms
            
            total_time += elapsed
            
            cached = result.get('cached', False)
            status = "✅ INSTANT" if cached else "⚠️  AI Generated"
            
            print(f"Problem {problem_id}: {elapsed:.2f}ms - {status}")
        
        avg_time = total_time / len(test_problems)
        
        print()
        print("=" * 80)
        print(f"📊 Average load time: {avg_time:.2f}ms")
        
        if avg_time < 100:
            print("🎉 EXCELLENT! Solutions load instantly!")
        elif avg_time < 500:
            print("✅ GOOD! Solutions load quickly")
        else:
            print("⚠️  SLOW! Solutions need optimization")
        
        print("=" * 80)
        
    finally:
        db.close()


if __name__ == "__main__":
    test_solution_speed()
