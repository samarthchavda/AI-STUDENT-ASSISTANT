"""Simple test to verify Gemini is working"""
from ai_service import ai_service

print("Testing simple code explanation...")

code = """
def add(a, b):
    return a + b
"""

try:
    result = ai_service.explain_code(code, "python", "explain")
    print("\n✅ Success!")
    print(f"Result keys: {result.keys()}")
    print(f"\nExplanation preview: {result['result'][:200]}...")
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
