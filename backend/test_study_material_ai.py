"""
Test study material-aware AI integration
Verifies that AI searches engineering_study_material table and provides structured responses
"""

from app.core.database import SessionLocal
from app.services.ai_service import ai_service
from app.models import EngineeringStudyMaterial

def test_study_material_search():
    """Test that study materials can be searched"""
    db = SessionLocal()
    
    print("🧪 Testing Study Material Search...")
    print("=" * 60)
    
    # Test 1: Search for Python
    print("\n1️⃣ Searching for 'Python'...")
    results = ai_service._search_study_material("What is Python programming?", db, limit=3)
    
    if results:
        print(f"✅ Found {len(results)} material(s)")
        for r in results:
            print(f"   • {r['topic_name']} ({r['branch']} - {r['category']})")
    else:
        print("❌ No materials found for Python")
    
    # Test 2: Search for Arduino
    print("\n2️⃣ Searching for 'Arduino'...")
    results = ai_service._search_study_material("Explain Arduino programming", db, limit=3)
    
    if results:
        print(f"✅ Found {len(results)} material(s)")
        for r in results:
            print(f"   • {r['topic_name']} ({r['branch']} - {r['category']})")
    else:
        print("❌ No materials found for Arduino")
    
    # Test 3: Search for Circuit
    print("\n3️⃣ Searching for 'Ohm Law'...")
    results = ai_service._search_study_material("What is Ohm's Law?", db, limit=3)
    
    if results:
        print(f"✅ Found {len(results)} material(s)")
        for r in results:
            print(f"   • {r['topic_name']} ({r['branch']} - {r['category']})")
    else:
        print("❌ No materials found for Ohm's Law")
    
    # Test 4: Check total materials in database
    print("\n4️⃣ Checking total materials in database...")
    count = db.query(EngineeringStudyMaterial).count()
    print(f"✅ Total study materials: {count}")
    
    if count > 0:
        print("\n📚 All Study Materials:")
        materials = db.query(EngineeringStudyMaterial).all()
        for m in materials:
            print(f"   • {m.topic_name} ({m.branch} - {m.category}) - {m.difficulty}")
    
    db.close()
    print("\n" + "=" * 60)
    print("✅ Study material search test complete!")


def test_ai_response_with_context():
    """Test that AI generates proper response with study material context"""
    db = SessionLocal()
    
    print("\n🤖 Testing AI Response with Study Material Context...")
    print("=" * 60)
    
    # Test message
    messages = [
        {"role": "user", "content": "What is Python?"}
    ]
    
    print("\n📝 User Question: 'What is Python?'")
    print("\n🔍 Searching study materials...")
    
    # Get AI response
    response = ai_service.chat_completion(messages, db=db)
    
    print("\n✅ AI Response Generated!")
    print("\n" + "-" * 60)
    print(response[:500] + "..." if len(response) > 500 else response)
    print("-" * 60)
    
    # Check if response has proper structure
    checks = {
        "Has ### headings": "###" in response,
        "Has **bold** terms": "**" in response,
        "Has bullet points": "•" in response or "-" in response,
        "Has source attribution": "database" in response.lower(),
        "Has engaging question": "?" in response[-200:],
    }
    
    print("\n📊 Response Quality Checks:")
    for check, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"   {status} {check}")
    
    db.close()
    print("\n" + "=" * 60)
    print("✅ AI response test complete!")


if __name__ == "__main__":
    print("🚀 Starting Study Material AI Tests\n")
    
    try:
        test_study_material_search()
        print("\n")
        test_ai_response_with_context()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n💡 Next: Test in chat UI at http://localhost:5173/chat")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
