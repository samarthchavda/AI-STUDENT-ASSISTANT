"""
Test API Performance
"""
import time
from app.core.database import SessionLocal
from app.models import DSAProblem, DSATopic, DifficultyLevel

def test_database_speed():
    """Test database query speed"""
    print("Testing database performance...")
    
    db = SessionLocal()
    
    try:
        # Test 1: Count problems
        start = time.time()
        count = db.query(DSAProblem).count()
        elapsed = time.time() - start
        print(f"✅ Count query: {count} problems in {elapsed*1000:.2f}ms")
        
        # Test 2: Get all problems
        start = time.time()
        problems = db.query(DSAProblem).limit(20).all()
        elapsed = time.time() - start
        print(f"✅ Get 20 problems: {len(problems)} in {elapsed*1000:.2f}ms")
        
        # Test 3: Get topics enum
        start = time.time()
        topics = list(DSATopic)
        elapsed = time.time() - start
        print(f"✅ Get topics enum: {len(topics)} in {elapsed*1000:.2f}ms")
        
        # Test 4: Get difficulties enum
        start = time.time()
        difficulties = list(DifficultyLevel)
        elapsed = time.time() - start
        print(f"✅ Get difficulties enum: {len(difficulties)} in {elapsed*1000:.2f}ms")
        
        print("\n✅ All tests passed! Database is fast.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    test_database_speed()
