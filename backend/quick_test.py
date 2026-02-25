"""Quick test for Gemini AI"""
import google.generativeai as genai
from config import settings

print("Testing Gemini API...")
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-flash-latest')

try:
    response = model.generate_content("Say 'Hello from Gemini!' in one sentence")
    print(f"✅ Success! Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
