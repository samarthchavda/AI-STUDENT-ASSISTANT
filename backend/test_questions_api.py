"""
Test the questions API to see what's being returned
"""
import sys
from app.core.database import SessionLocal
from app.models import DSAProblem, User
from app.services.dsa_service import DSAService

db = SessionLocal()

try:
    # Check how many problems exist
    total_problems = db.query(DSAProblem).count()
    print(f"📊 Total problems in database: {total_problems}")
    
    if total_problems == 0:
        print("❌ No problems found! Run seed script first:")
        print("   python3 scripts/seed_dsa.py")
        sys.exit(1)
    
    # Test the get_questions service method
    print("\n🧪 Testing get_questions service...")
    result = DSAService.get_questions(
        db=db,
        topic=None,
        difficulty=None,
        company=None,
        limit=20,
        offset=0,
        user_id=None
    )
    
    print(f"\n✅ API Response:")
    print(f"   Total: {result['total']}")
    print(f"   Limit: {result['limit']}")
    print(f"   Offset: {result['offset']}")
    print(f"   Has More: {result['has_more']}")
    print(f"   Questions Returned: {len(result['questions'])}")
    
    if result['questions']:
        print(f"\n📝 First Question:")
        q = result['questions'][0]
        print(f"   ID: {q['id']}")
        print(f"   Title: {q['title']}")
        print(f"   Topic: {q['topic']}")
        print(f"   Difficulty: {q['difficulty']}")
        print(f"   Company: {q['company']}")
    
    print("\n✅ Questions API is working correctly!")
    
finally:
    db.close()
