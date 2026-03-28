"""
Test the input parsing logic
"""
import sys
from app.services.dsa_service import DSAService

# Test cases
test_inputs = [
    ("n = 1", "1"),
    ("n = 16", "16"),
    ("[2,7,11,15], 9", "[2,7,11,15], 9"),
    ("nums = [1,2,3], target = 5", "[1,2,3], 5"),
    ("s = 'hello'", "'hello'"),
    ("s = \"hello world\"", "\"hello world\""),
    ("matrix = [[1,2],[3,4]]", "[[1,2],[3,4]]"),
]

print("🧪 Testing Input Parsing\n")
print("=" * 70)

all_passed = True

for input_str, expected in test_inputs:
    result = DSAService._parse_test_input(input_str)
    passed = result == expected
    
    if passed:
        print(f"✅ PASS")
    else:
        print(f"❌ FAIL")
        all_passed = False
    
    print(f"   Input:    {repr(input_str)}")
    print(f"   Expected: {repr(expected)}")
    print(f"   Got:      {repr(result)}")
    print()

print("=" * 70)
if all_passed:
    print("✅ All tests passed!")
else:
    print("❌ Some tests failed")

sys.exit(0 if all_passed else 1)
