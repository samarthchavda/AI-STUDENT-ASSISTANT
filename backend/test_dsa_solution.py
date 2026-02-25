"""Test DSA complete solution feature"""
from ai_service import ai_service

problem = "Given a matrix if an element in the matrix is 0 then you will have to set its entire column and row to 0 and then return the matrix"

print("Testing DSA Complete Solution...")
print(f"Problem: {problem}\n")

try:
    result = ai_service.dsa_hint(problem)
    
    print("✅ Success!")
    print(f"\nResult type: {result.get('type')}")
    print(f"\nSolution preview (first 500 chars):")
    print("="*60)
    print(result['solution'][:500])
    print("="*60)
    print("\n[Full solution generated successfully]")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
