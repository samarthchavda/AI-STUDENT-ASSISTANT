"""
Test script for Gemini AI integration
"""

import sys
from ai_service import ai_service

def test_chat():
    print("\n" + "="*60)
    print("TEST 1: Chat Completion")
    print("="*60)
    
    messages = [
        {"role": "user", "content": "How should I prepare for Amazon placement interview?"}
    ]
    
    response = ai_service.chat_completion(messages)
    print(f"\nQuestion: {messages[0]['content']}")
    print(f"\nResponse:\n{response}")
    print("\n✅ Chat test completed")

def test_resume_analysis():
    print("\n" + "="*60)
    print("TEST 2: Resume Analysis")
    print("="*60)
    
    sample_resume = """
    John Doe
    Email: john@example.com | Phone: 9876543210
    GitHub: github.com/johndoe | LinkedIn: linkedin.com/in/johndoe
    
    EDUCATION
    B.Tech in Computer Science Engineering
    XYZ Institute of Technology
    CGPA: 8.5/10 | 2020-2024
    
    TECHNICAL SKILLS
    Languages: Python, JavaScript, Java, C++
    Frameworks: React, Node.js, Express, Django
    Databases: MongoDB, MySQL, PostgreSQL
    Tools: Git, Docker, AWS
    
    PROJECTS
    1. E-commerce Platform
       - Built full-stack web app using MERN stack
       - Implemented JWT authentication and payment gateway
       - Deployed on AWS with 99% uptime
    
    2. Chat Application
       - Real-time messaging using Socket.io
       - Built with React and Node.js
       - Supports group chats and file sharing
    
    ACHIEVEMENTS
    - Solved 300+ problems on LeetCode
    - Winner of college hackathon 2023
    - AWS Certified Cloud Practitioner
    """
    
    result = ai_service.analyze_resume(sample_resume)
    print(f"\nATS Score: {result['atsScore']}/100")
    print(f"Overall Score: {result['overallScore']}/100")
    print(f"Placement Readiness: {result['placementReadiness']}")
    print(f"\nDetailed Analysis:\n{result['analysis'][:500]}...")
    print("\n✅ Resume analysis test completed")

def test_dsa_hint():
    print("\n" + "="*60)
    print("TEST 3: DSA Problem Hint")
    print("="*60)
    
    problem = "Find the longest substring without repeating characters"
    result = ai_service.dsa_hint(problem)
    
    print(f"\nProblem: {problem}")
    print(f"\nHints:")
    for i, hint in enumerate(result['hints'], 1):
        print(f"{i}. {hint}")
    print("\n✅ DSA hint test completed")

def test_interview_prep():
    print("\n" + "="*60)
    print("TEST 4: Interview Preparation")
    print("="*60)
    
    result = ai_service.interview_prep("Amazon", "Software Engineer")
    
    print(f"\nCompany: {result['company']}")
    print(f"Role: {result['role']}")
    print(f"\nCommon Questions:")
    for i, q in enumerate(result['commonQuestions'][:5], 1):
        print(f"{i}. {q}")
    print(f"\n{result['preparation'][:500]}...")
    print("\n✅ Interview prep test completed")

def test_code_explanation():
    print("\n" + "="*60)
    print("TEST 5: Code Explanation")
    print("="*60)
    
    code = """
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
"""
    
    result = ai_service.explain_code(code, "python", "explain")
    print(f"\nCode:\n{code}")
    print(f"\nExplanation:\n{result['result'][:500]}...")
    print("\n✅ Code explanation test completed")

if __name__ == "__main__":
    print("\n🚀 Starting Gemini AI Integration Tests")
    print("="*60)
    
    try:
        # Run all tests
        test_chat()
        test_resume_analysis()
        test_dsa_hint()
        test_interview_prep()
        test_code_explanation()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\n💡 Gemini AI is working correctly!")
        print("You can now use the chat and resume features with real AI responses.")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
