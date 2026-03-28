"""
Test the Power of Two problem execution
"""
import sys
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import DSAProblem, User
from app.services.dsa_service import DSAService

db = SessionLocal()

try:
    # Find Power of Two problem
    problem = db.query(DSAProblem).filter(
        DSAProblem.title.ilike('%power of two%')
    ).first()
    
    if not problem:
        print("❌ Power of Two problem not found")
        sys.exit(1)
    
    print(f"✅ Found problem: {problem.title}\n")
    
    # Get a test user
    user = db.query(User).first()
    if not user:
        print("❌ No users found")
        sys.exit(1)
    
    # Test with correct solution
    correct_code = """
def isPowerOfTwo(n):
    # A power of two has only one bit set
    # n & (n-1) removes the rightmost set bit
    # If n is a power of 2, this results in 0
    if n <= 0:
        return False
    return (n & (n - 1)) == 0
"""
    
    print("🧪 Testing with correct solution...")
    print("=" * 70)
    
    result = DSAService.run_code(
        db=db,
        user_id=user.id,
        problem_id=problem.id,
        code=correct_code,
        language='python'
    )
    
    print(f"Status: {result.get('status')}")
    print(f"Passed: {result.get('passed')}/{result.get('total')}")
    print(f"Score: {result.get('score')}%")
    print(f"Message: {result.get('message')}")
    
    if result.get('test_results'):
        print("\nTest Results:")
        for test in result['test_results'][:5]:  # Show first 5
            status_icon = "✅" if test['passed'] else "❌"
            print(f"  {status_icon} Test {test['test_case']}: {test['input']}")
            print(f"     Expected: {test['expected']}")
            print(f"     Got: {test['actual']}")
            if test.get('error'):
                print(f"     Error: {test['error']}")
    
    print("\n" + "=" * 70)
    
    if result.get('passed') == result.get('total'):
        print("✅ All tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed")
        sys.exit(1)
        
finally:
    db.close()
