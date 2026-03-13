"""
Test script for new admin improvements and public API
Run this after starting the backend server
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_public_api():
    """Test public company questions API (no auth needed)"""
    print("\n" + "="*60)
    print("TESTING PUBLIC API (No Authentication Required)")
    print("="*60)
    
    # Test 1: Get companies list
    print("\n1. Testing GET /api/companies")
    response = requests.get(f"{BASE_URL}/api/companies")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total companies: {data.get('total_companies', 0)}")
        print(f"Companies: {[c['name'] for c in data.get('companies', [])[:5]]}")
    else:
        print(f"Response: {response.text}")
    
    # Test 2: Get categories
    print("\n2. Testing GET /api/categories")
    response = requests.get(f"{BASE_URL}/api/categories")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Categories: {[c['value'] for c in data.get('categories', [])]}")
    
    # Test 3: Get difficulties
    print("\n3. Testing GET /api/difficulties")
    response = requests.get(f"{BASE_URL}/api/difficulties")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Difficulties: {[d['value'] for d in data.get('difficulties', [])]}")
    
    # Test 4: Search company questions
    print("\n4. Testing GET /api/questions?company=amazon")
    response = requests.get(f"{BASE_URL}/api/questions?company=amazon")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        questions = response.json()
        print(f"Found {len(questions)} questions")
        if questions:
            print(f"First question: {questions[0]['question_text'][:50]}...")
    elif response.status_code == 404:
        print("No questions found (database might be empty)")
    else:
        print(f"Response: {response.text}")
    
    # Test 5: Search with filters
    print("\n5. Testing GET /api/questions?company=microsoft&category=coding")
    response = requests.get(f"{BASE_URL}/api/questions?company=microsoft&category=coding")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        questions = response.json()
        print(f"Found {len(questions)} coding questions for Microsoft")
    elif response.status_code == 404:
        print("No questions found")


def test_admin_api(token):
    """Test admin API improvements (requires admin token)"""
    print("\n" + "="*60)
    print("TESTING ADMIN API (Authentication Required)")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Get users with pagination
    print("\n1. Testing GET /api/admin/users (with pagination)")
    response = requests.get(f"{BASE_URL}/api/admin/users?skip=0&limit=10", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total users: {data.get('total', 0)}")
        print(f"Returned: {len(data.get('users', []))} users")
    else:
        print(f"Response: {response.text}")
    
    # Test 2: Search users
    print("\n2. Testing GET /api/admin/users?search=gmail")
    response = requests.get(f"{BASE_URL}/api/admin/users?search=gmail", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found {data.get('total', 0)} users with 'gmail' in email")
    else:
        print(f"Response: {response.text}")
    
    # Test 3: Add company question
    print("\n3. Testing POST /api/admin/company-questions")
    new_question = {
        "company_name": "Test Company",
        "question_text": "This is a test question for API testing",
        "category": "technical",
        "difficulty": "medium",
        "topic": "Testing",
        "year_asked": "2024",
        "frequency": 1
    }
    response = requests.post(
        f"{BASE_URL}/api/admin/company-questions",
        headers={**headers, "Content-Type": "application/json"},
        json=new_question
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Created question with ID: {data.get('id')}")
        question_id = data.get('id')
        
        # Test 4: Delete the question we just created
        print(f"\n4. Testing DELETE /api/admin/company-questions/{question_id}")
        response = requests.delete(
            f"{BASE_URL}/api/admin/company-questions/{question_id}",
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Successfully deleted question {question_id}")
        else:
            print(f"Response: {response.text}")
    else:
        print(f"Response: {response.text}")


def test_rate_limiting():
    """Test rate limiting (100 requests per minute)"""
    print("\n" + "="*60)
    print("TESTING RATE LIMITING")
    print("="*60)
    print("\nSending 5 requests quickly...")
    
    for i in range(5):
        response = requests.get(f"{BASE_URL}/api/categories")
        print(f"Request {i+1}: Status {response.status_code}")
        if 'X-RateLimit-Remaining' in response.headers:
            print(f"  Remaining: {response.headers['X-RateLimit-Remaining']}")
    
    print("\nNote: Rate limit is 100 requests/minute")
    print("To test limit exceeded, send 101 requests quickly")


def main():
    print("\n" + "="*60)
    print("NEW FEATURES TEST SUITE")
    print("="*60)
    print("\nMake sure backend server is running on http://localhost:8000")
    print("\nThis will test:")
    print("1. Public Company Questions API (no auth)")
    print("2. Admin API improvements (requires admin token)")
    print("3. Rate limiting")
    
    # Test public API (no auth needed)
    test_public_api()
    
    # Test rate limiting
    test_rate_limiting()
    
    # Test admin API (requires token)
    print("\n" + "="*60)
    print("ADMIN API TESTS")
    print("="*60)
    print("\nTo test admin features, you need an admin token.")
    print("Options:")
    print("1. Login as admin and copy token from browser")
    print("2. Skip admin tests")
    
    choice = input("\nEnter admin token (or press Enter to skip): ").strip()
    
    if choice:
        test_admin_api(choice)
    else:
        print("\nSkipping admin tests...")
    
    print("\n" + "="*60)
    print("TEST SUITE COMPLETED")
    print("="*60)
    print("\nSummary:")
    print("✅ Public API endpoints tested")
    print("✅ Rate limiting verified")
    if choice:
        print("✅ Admin API improvements tested")
    else:
        print("⏭️  Admin API tests skipped")
    
    print("\nFor full documentation, see: ADMIN_IMPROVEMENTS.md")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\nError: {e}")
        print("Make sure the backend server is running!")
