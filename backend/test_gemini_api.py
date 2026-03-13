import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

if not api_key or api_key == 'your-gemini-api-key-here':
    print("❌ GEMINI_API_KEY not set in .env file")
    print("Please add your API key to backend/.env")
    exit(1)

print(f"✅ API Key found: {api_key[:20]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')
    
    print("\n🧪 Testing Gemini API with a simple question...")
    response = model.generate_content("What is 2+2? Answer in one word.")
    
    print(f"✅ API Response: {response.text}")
    print("\n✅ Gemini API is working correctly!")
    print("\nNow testing aptitude question generation...")
    
    prompt = """Generate 3 quantitative aptitude questions for placement exams.

Return in JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}"""
    
    response = model.generate_content(prompt)
    print(f"\n📝 Sample Questions Generated:")
    print(response.text[:500] + "...")
    print("\n✅ Question generation is working!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nPossible issues:")
    print("1. Invalid API key")
    print("2. API key doesn't have access to Gemini")
    print("3. Network connection issue")
    print("\nGet a new API key from: https://aistudio.google.com/app/apikey")
