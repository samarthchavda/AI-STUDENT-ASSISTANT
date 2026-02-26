"""Quick test script for all backend features"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_feature(name, url, method="GET", data=None):
    """Test a feature and print result"""
    try:
        if method == "POST":
            response = requests.post(url, json=data, timeout=30)
        else:
            response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ {name}: WORKING")
            return True
        else:
            print(f"❌ {name}: FAILED (Status {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ {name}: ERROR - {str(e)[:50]}")
        return False

print("🧪 Testing CodeCampus AI Backend\n")
print("="*50)

# Test 1: Health Check
print("\n1. Backend Health Check")
test_feature("API Server", f"{BASE_URL}/docs")

# Test 2: Chat
print("\n2. Chat Feature")
test_feature(
    "Chat Completion",
    f"{BASE_URL}/api/chat/message",
    "POST",
    {"messages": [{"role": "user", "content": "Hello"}]}
)

# Test 3: Coding Help
print("\n3. Coding Help Features")
test_feature(
    "Code Explanation",
    f"{BASE_URL}/api/coding/help",
    "POST",
    {
        "code": "def hello(): print('hi')",
        "language": "python",
        "task": "explain"
    }
)

test_feature(
    "DSA Hints",
    f"{BASE_URL}/api/coding/dsa-hint",
    "POST",
    {"problem": "Two Sum"}
)

# Test 4: Career
print("\n4. Career Features")
test_feature(
    "Resume Analysis",
    f"{BASE_URL}/api/career/resume-analyze",
    "POST",
    {"resumeText": "Sample resume"}
)

test_feature(
    "Interview Prep",
    f"{BASE_URL}/api/career/interview-prep",
    "POST",
    {"company": "Amazon", "role": "SDE"}
)

# Test 5: Exam Prep
print("\n5. Exam Prep Features")
test_feature(
    "Mock Test",
    f"{BASE_URL}/api/exam/mock-test",
    "POST",
    {
        "subject": "DSA",
        "topic": "Arrays",
        "difficulty": "medium",
        "numQuestions": 5
    }
)

print("\n" + "="*50)
print("\n✅ Testing Complete!")
print("\nNext: Open http://localhost:3000 and test frontend")
