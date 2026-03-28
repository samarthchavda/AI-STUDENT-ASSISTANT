"""
Update DSA questions with high-quality commented solution code
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models import DSAProblem

def update_solutions():
    """Update solutions with commented code"""
    db = SessionLocal()
    
    try:
        # Two Sum - Python solution with comments
        two_sum = db.query(DSAProblem).filter(DSAProblem.title == "Two Sum").first()
        if two_sum:
            two_sum.solution = """**Approach: Hash Map for O(n) Solution**

We can solve this problem efficiently using a hash map to store numbers we've seen and their indices.

**Algorithm:**
1. Create a hash map to store number -> index mapping
2. For each number, calculate the complement (target - current number)
3. Check if complement exists in hash map
4. If yes, return the indices; if no, add current number to hash map

**Time Complexity:** O(n) - Single pass through array
**Space Complexity:** O(n) - Hash map storage

```python
def twoSum(nums, target):
    # Hash map to store number -> index mapping
    seen = {}
    
    # Iterate through the array with index
    for i, num in enumerate(nums):
        # Calculate the complement we need to find
        complement = target - num
        
        # Check if complement exists in our hash map
        if complement in seen:
            # Found the pair! Return both indices
            return [seen[complement], i]
        
        # Store current number and its index for future lookups
        seen[num] = i
    
    # No solution found (shouldn't happen per problem constraints)
    return []
```

**Example Walkthrough:**
- Input: nums = [2,7,11,15], target = 9
- i=0, num=2: complement=7, seen={}, add 2->0
- i=1, num=7: complement=2, found in seen! return [0,1]
"""
            print(f"✅ Updated: {two_sum.title}")
        
        # Valid Parentheses - Python solution
        valid_parens = db.query(DSAProblem).filter(DSAProblem.title == "Valid Parentheses").first()
        if valid_parens:
            valid_parens.solution = """**Approach: Stack-Based Matching**

Use a stack to track opening brackets and match them with closing brackets.

**Algorithm:**
1. Use a stack to store opening brackets
2. For each character, if it's opening bracket, push to stack
3. If it's closing bracket, check if it matches the top of stack
4. At the end, stack should be empty for valid string

**Time Complexity:** O(n) - Single pass
**Space Complexity:** O(n) - Stack storage

```python
def isValid(s):
    # Stack to store opening brackets
    stack = []
    
    # Mapping of closing to opening brackets
    closing_to_opening = {
        ')': '(',
        '}': '{',
        ']': '['
    }
    
    # Process each character in the string
    for char in s:
        # If it's a closing bracket
        if char in closing_to_opening:
            # Check if stack is empty or top doesn't match
            if not stack or stack[-1] != closing_to_opening[char]:
                return False
            # Pop the matching opening bracket
            stack.pop()
        else:
            # It's an opening bracket, push to stack
            stack.append(char)
    
    # Valid only if all brackets are matched (stack is empty)
    return len(stack) == 0
```

**Example:**
- Input: s = "()[]{}"
- Process: ( -> stack=[( ], ) -> match, pop -> stack=[]
- Continue: [ -> stack=[ ], ] -> match, pop -> stack=[]
- Result: stack empty, return True
"""
            print(f"✅ Updated: {valid_parens.title}")
        
        # Reverse Linked List - Python solution
        reverse_list = db.query(DSAProblem).filter(DSAProblem.title == "Reverse Linked List").first()
        if reverse_list:
            reverse_list.solution = """**Approach: Iterative Three-Pointer Technique**

Use three pointers to reverse the links between nodes iteratively.

**Algorithm:**
1. Initialize prev=None, current=head
2. For each node, save next node
3. Reverse the link: current.next = prev
4. Move pointers forward: prev=current, current=next
5. Return prev (new head)

**Time Complexity:** O(n) - Visit each node once
**Space Complexity:** O(1) - Only three pointers

```python
def reverseList(head):
    # Previous node (starts as None for new tail)
    prev = None
    # Current node being processed
    current = head
    
    # Traverse the list
    while current:
        # Save the next node before we change the link
        next_node = current.next
        
        # Reverse the link: point current to previous
        current.next = prev
        
        # Move prev and current one step forward
        prev = current
        current = next_node
    
    # prev is now the new head of reversed list
    return prev
```

**Visualization:**
```
Original: 1 -> 2 -> 3 -> None
Step 1:   None <- 1    2 -> 3 -> None
Step 2:   None <- 1 <- 2    3 -> None
Step 3:   None <- 1 <- 2 <- 3
Result:   3 -> 2 -> 1 -> None
```
"""
            print(f"✅ Updated: {reverse_list.title}")
        
        # Maximum Subarray (Kadane's Algorithm)
        max_subarray = db.query(DSAProblem).filter(DSAProblem.title == "Maximum Subarray").first()
        if max_subarray:
            max_subarray.solution = """**Approach: Kadane's Algorithm**

Dynamic programming approach to find maximum sum subarray in O(n) time.

**Key Insight:** At each position, decide whether to extend the current subarray or start a new one.

**Algorithm:**
1. Track current_sum (sum ending at current position)
2. Track max_sum (maximum sum seen so far)
3. For each element, add to current_sum
4. Update max_sum if current_sum is larger
5. If current_sum becomes negative, reset to 0

**Time Complexity:** O(n) - Single pass
**Space Complexity:** O(1) - Only two variables

```python
def maxSubArray(nums):
    # Initialize with first element
    max_sum = nums[0]
    current_sum = nums[0]
    
    # Process remaining elements
    for i in range(1, len(nums)):
        # Decision: extend current subarray or start new one
        # If current_sum is negative, better to start fresh
        current_sum = max(nums[i], current_sum + nums[i])
        
        # Update maximum sum seen so far
        max_sum = max(max_sum, current_sum)
    
    return max_sum
```

**Example Walkthrough:**
```
nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

i=0: current=-2, max=-2
i=1: current=max(1, -2+1)=1, max=1
i=2: current=max(-3, 1-3)=-2, max=1
i=3: current=max(4, -2+4)=4, max=4
i=4: current=max(-1, 4-1)=3, max=4
i=5: current=max(2, 3+2)=5, max=5
i=6: current=max(1, 5+1)=6, max=6  ← Answer
```
"""
            print(f"✅ Updated: {max_subarray.title}")
        
        # Climbing Stairs - Python solution
        climbing_stairs = db.query(DSAProblem).filter(DSAProblem.title == "Climbing Stairs").first()
        if climbing_stairs:
            climbing_stairs.solution = """**Approach: Dynamic Programming (Fibonacci Pattern)**

This is essentially a Fibonacci sequence problem.

**Key Insight:** To reach step n, you can come from step (n-1) or step (n-2).
Therefore: ways(n) = ways(n-1) + ways(n-2)

**Algorithm:**
1. Base cases: 1 way for step 1, 2 ways for step 2
2. For each step, sum the ways from previous two steps
3. Use two variables to optimize space to O(1)

**Time Complexity:** O(n) - Linear iteration
**Space Complexity:** O(1) - Only two variables

```python
def climbStairs(n):
    # Base cases
    if n <= 2:
        return n
    
    # Initialize for first two steps
    # prev2 represents ways to reach (i-2)th step
    # prev1 represents ways to reach (i-1)th step
    prev2 = 1  # ways to reach step 1
    prev1 = 2  # ways to reach step 2
    
    # Calculate for steps 3 to n
    for i in range(3, n + 1):
        # Current step = sum of previous two
        current = prev1 + prev2
        
        # Shift the window forward
        prev2 = prev1
        prev1 = current
    
    return prev1
```

**Example:**
```
n = 5
Step 1: 1 way (1)
Step 2: 2 ways (1+1, 2)
Step 3: 3 ways (1+1+1, 1+2, 2+1)
Step 4: 5 ways (prev3 + prev2 = 3+2)
Step 5: 8 ways (prev4 + prev3 = 5+3)
```
"""
            print(f"✅ Updated: {climbing_stairs.title}")
        
        db.commit()
        print(f"\n🎉 Successfully updated solutions with commented code!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Update DSA Solutions with Commented Code")
    print("=" * 60)
    update_solutions()
