"""
Test Code Execution in All 3 Languages
"""
from app.core.database import SessionLocal
from app.services.dsa_service import DSAService

def test_all_languages():
    """Test Python, JavaScript, and C++ execution"""
    db = SessionLocal()
    
    try:
        # Get Two Sum problem (ID 1)
        problem_id = 1
        
        print("=" * 80)
        print("🧪 TESTING CODE EXECUTION IN ALL 3 LANGUAGES")
        print("=" * 80)
        print()
        
        # Test Python
        print("1️⃣  Testing Python...")
        python_code = """def twoSum(nums, target):
    # Hash map approach
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []"""
        
        result = DSAService.run_code(db, user_id=1, problem_id=problem_id, code=python_code, language='python')
        print(f"   Status: {result.get('status')}")
        print(f"   Passed: {result.get('passed')}/{result.get('total')}")
        print(f"   Message: {result.get('message')}")
        if result.get('error_message'):
            print(f"   Error: {result.get('error_message')}")
        print()
        
        # Test JavaScript
        print("2️⃣  Testing JavaScript...")
        js_code = """function twoSum(nums, target) {
    // Hash map approach
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}"""
        
        result = DSAService.run_code(db, user_id=1, problem_id=problem_id, code=js_code, language='javascript')
        print(f"   Status: {result.get('status')}")
        print(f"   Passed: {result.get('passed')}/{result.get('total')}")
        print(f"   Message: {result.get('message')}")
        if result.get('error_message'):
            print(f"   Error: {result.get('error_message')}")
        print()
        
        # Test C++
        print("3️⃣  Testing C++...")
        cpp_code = """#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Hash map approach
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}"""
        
        result = DSAService.run_code(db, user_id=1, problem_id=problem_id, code=cpp_code, language='cpp')
        print(f"   Status: {result.get('status')}")
        print(f"   Passed: {result.get('passed')}/{result.get('total')}")
        print(f"   Message: {result.get('message')}")
        if result.get('error_message'):
            print(f"   Error: {result.get('error_message')}")
        if result.get('test_results'):
            for test in result['test_results'][:2]:  # Show first 2 test results
                print(f"   Test {test['test_case']}: {test.get('error', 'No error')}")
        print()
        
        print("=" * 80)
        print("✅ ALL LANGUAGE TESTS COMPLETE!")
        print("=" * 80)
        
    finally:
        db.close()


if __name__ == "__main__":
    test_all_languages()
