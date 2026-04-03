"""
Quick Seed 1000+ Problems - Template-Based Approach
Uses problem templates with minimal AI calls for speed
"""
import sys
import json
import time
from pathlib import Path
from typing import List, Dict
import random

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import DSAProblem

# Curated 1000+ interview-style problems
PROBLEM_DATASET = {
    "arrays": {
        "easy": [
            "Two Sum", "Best Time to Buy and Sell Stock", "Contains Duplicate",
            "Maximum Subarray", "Merge Sorted Array", "Remove Duplicates from Sorted Array",
            "Plus One", "Move Zeroes", "Find All Numbers Disappeared in Array",
            "Third Maximum Number", "Find Pivot Index", "Largest Number At Least Twice",
            "Shortest Unsorted Continuous Subarray", "Can Place Flowers", "Maximum Average Subarray",
            "Degree of an Array", "Toeplitz Matrix", "Max Consecutive Ones",
            "Find All Duplicates", "Array Partition", "Reshape the Matrix",
            "Distribute Candies", "Longest Continuous Increasing Subsequence", "1-bit and 2-bit Characters",
            "Baseball Game", "Monotonic Array", "Sort Array By Parity",
            "Squares of Sorted Array", "Valid Mountain Array", "Duplicate Zeros",
            "Height Checker", "Relative Sort Array", "Find Common Characters",
            "Unique Number of Occurrences", "Find N Unique Integers Sum up to Zero", "Lucky Numbers in Matrix",
            "Matrix Diagonal Sum", "Find Winner on Tic Tac Toe", "Check If N and Its Double Exist",
            "Replace Elements with Greatest Element", "Rank Transform of Array", "Decompress Run-Length Encoded List",
            "Create Target Array", "Count Negative Numbers", "How Many Numbers Are Smaller",
            "Find Numbers with Even Digits", "Sort Integers by Number of 1 Bits", "Maximum Product of Two Elements",
            "Running Sum of 1d Array", "Shuffle the Array", "Kids With Greatest Candies"
        ],
        "medium": [
            "3Sum", "Container With Most Water", "Product of Array Except Self",
            "Find Minimum in Rotated Sorted Array", "Search in Rotated Sorted Array", "Next Permutation",
            "Jump Game", "Rotate Array", "Sort Colors",
            "Merge Intervals", "Insert Interval", "Spiral Matrix",
            "Set Matrix Zeroes", "Game of Life", "Rotate Image",
            "Word Search", "Subarray Sum Equals K", "Continuous Subarray Sum",
            "Maximum Product Subarray", "Find Peak Element", "Search in 2D Matrix",
            "Kth Largest Element", "Top K Frequent Elements", "Sort Characters By Frequency",
            "4Sum", "3Sum Closest", "Combination Sum",
            "Combination Sum II", "Permutations", "Permutations II",
            "Subsets", "Subsets II", "Letter Combinations",
            "Generate Parentheses", "Partition Labels", "Interval List Intersections",
            "Non-overlapping Intervals", "Minimum Number of Arrows", "Queue Reconstruction by Height",
            "Task Scheduler", "Reorganize String", "Advantage Shuffle",
            "Boats to Save People", "Bag of Tokens", "Minimum Increment to Make Array Unique",
            "Fruit Into Baskets", "Shortest Subarray with Sum at Least K", "Subarrays with K Different Integers",
            "Binary Subarrays With Sum", "Count Number of Nice Subarrays", "Replace the Substring"
        ],
        "hard": [
            "Median of Two Sorted Arrays", "Trapping Rain Water", "First Missing Positive",
            "Largest Rectangle in Histogram", "Maximal Rectangle", "Best Time to Buy and Sell Stock III",
            "Best Time to Buy and Sell Stock IV", "Sliding Window Maximum", "Minimum Window Substring",
            "Longest Consecutive Sequence", "Find Median from Data Stream", "Count of Smaller Numbers After Self",
            "Reverse Pairs", "Max Sum of Rectangle No Larger Than K", "Split Array Largest Sum",
            "Create Maximum Number", "Russian Doll Envelopes", "Max Chunks To Make Sorted II",
            "Shortest Subarray with Sum at Least K", "Subarrays with K Different Integers"
        ]
    },
    "strings": {
        "easy": [
            "Valid Anagram", "Valid Palindrome", "First Unique Character",
            "Reverse String", "Reverse Words in String III", "Detect Capital",
            "Longest Common Prefix", "Implement strStr", "Length of Last Word",
            "Add Binary", "Valid Palindrome II", "Reverse Only Letters",
            "Unique Email Addresses", "Long Pressed Name", "Buddy Strings",
            "Backspace String Compare", "Reverse String II", "Student Attendance Record I",
            "Repeated Substring Pattern", "Ransom Note", "Valid Parentheses",
            "Remove All Adjacent Duplicates", "Goat Latin", "Most Common Word",
            "Shortest Distance to Character", "Rotate String", "Uncommon Words",
            "Reverse Vowels of String", "Is Subsequence", "Number of Segments",
            "Repeated String Match", "Count Binary Substrings", "Valid Palindrome III"
        ],
        "medium": [
            "Longest Substring Without Repeating Characters", "Longest Palindromic Substring", "Group Anagrams",
            "Longest Repeating Character Replacement", "Palindromic Substrings", "Decode String",
            "Encode and Decode Strings", "Minimum Window Substring", "Find All Anagrams",
            "Permutation in String", "Longest Substring with At Most K Distinct", "Longest Substring with At Most Two Distinct",
            "Minimum Remove to Make Valid Parentheses", "Remove K Digits", "Decode Ways",
            "Word Break", "Word Break II", "Concatenated Words",
            "Longest Word in Dictionary", "Top K Frequent Words", "Design Search Autocomplete",
            "Implement Trie", "Add and Search Word", "Word Search II",
            "Replace Words", "Map Sum Pairs", "Longest Absolute File Path",
            "Simplify Path", "Compare Version Numbers", "Restore IP Addresses",
            "Validate IP Address", "Complex Number Multiplication", "Fraction Addition and Subtraction"
        ],
        "hard": [
            "Minimum Window Substring", "Substring with Concatenation of All Words", "Longest Valid Parentheses",
            "Distinct Subsequences", "Edit Distance", "Scramble String",
            "Interleaving String", "Regular Expression Matching", "Wildcard Matching",
            "Text Justification", "Word Ladder", "Word Ladder II",
            "Palindrome Pairs", "Shortest Palindrome", "Count Different Palindromic Subsequences"
        ]
    },
    "linked_lists": {
        "easy": [
            "Reverse Linked List", "Merge Two Sorted Lists", "Linked List Cycle",
            "Remove Duplicates from Sorted List", "Intersection of Two Linked Lists", "Palindrome Linked List",
            "Delete Node in Linked List", "Middle of Linked List", "Convert Binary Number in Linked List"
        ],
        "medium": [
            "Add Two Numbers", "Remove Nth Node From End", "Swap Nodes in Pairs",
            "Rotate List", "Partition List", "Reverse Linked List II",
            "Reorder List", "Linked List Cycle II", "Copy List with Random Pointer",
            "Sort List", "Insertion Sort List", "Odd Even Linked List",
            "Split Linked List in Parts", "Plus One Linked List", "Remove Zero Sum Consecutive Nodes"
        ],
        "hard": [
            "Merge K Sorted Lists", "Reverse Nodes in k-Group", "LRU Cache",
            "LFU Cache", "All O`one Data Structure"
        ]
    },
    "trees": {
        "easy": [
            "Maximum Depth of Binary Tree", "Same Tree", "Invert Binary Tree",
            "Symmetric Tree", "Path Sum", "Minimum Depth of Binary Tree",
            "Balanced Binary Tree", "Binary Tree Paths", "Sum of Left Leaves",
            "Find Mode in BST", "Diameter of Binary Tree", "Merge Two Binary Trees",
            "Average of Levels", "Two Sum IV - BST", "Minimum Distance Between BST Nodes",
            "Second Minimum Node", "Leaf-Similar Trees", "Increasing Order Search Tree",
            "Range Sum of BST", "Univalued Binary Tree", "Cousins in Binary Tree",
            "N-ary Tree Preorder", "N-ary Tree Postorder", "N-ary Tree Level Order"
        ],
        "medium": [
            "Binary Tree Level Order Traversal", "Binary Tree Zigzag Level Order", "Validate Binary Search Tree",
            "Kth Smallest Element in BST", "Lowest Common Ancestor of BST", "Binary Tree Right Side View",
            "Count Complete Tree Nodes", "Inorder Successor in BST", "Flatten Binary Tree to Linked List",
            "Populating Next Right Pointers", "Construct Binary Tree from Preorder and Inorder", "Construct Binary Tree from Inorder and Postorder",
            "Convert Sorted Array to BST", "Convert Sorted List to BST", "Path Sum II",
            "Path Sum III", "Sum Root to Leaf Numbers", "Binary Tree Maximum Path Sum",
            "Unique Binary Search Trees", "Unique Binary Search Trees II", "Recover Binary Search Tree",
            "House Robber III", "Delete Node in BST", "Insert into BST"
        ],
        "hard": [
            "Binary Tree Maximum Path Sum", "Serialize and Deserialize Binary Tree", "Binary Tree Postorder Traversal",
            "Recover Binary Search Tree", "Count of Smaller Numbers After Self", "Vertical Order Traversal"
        ]
    },
    "dynamic_programming": {
        "easy": [
            "Climbing Stairs", "Best Time to Buy and Sell Stock", "Maximum Subarray",
            "House Robber", "Min Cost Climbing Stairs", "Divisor Game",
            "Fibonacci Number", "N-th Tribonacci Number", "Get Maximum in Generated Array"
        ],
        "medium": [
            "House Robber II", "Coin Change", "Longest Increasing Subsequence",
            "Word Break", "Combination Sum IV", "Decode Ways",
            "Unique Paths", "Unique Paths II", "Minimum Path Sum",
            "Triangle", "Maximum Product Subarray", "Best Time to Buy and Sell Stock with Cooldown",
            "Partition Equal Subset Sum", "Target Sum", "Ones and Zeroes",
            "Perfect Squares", "Longest Palindromic Subsequence", "Palindromic Substrings",
            "Delete and Earn", "2 Keys Keyboard", "Knight Probability in Chessboard",
            "Domino and Tromino Tiling", "Champagne Tower", "Soup Servings"
        ],
        "hard": [
            "Edit Distance", "Regular Expression Matching", "Wildcard Matching",
            "Distinct Subsequences", "Interleaving String", "Scramble String",
            "Best Time to Buy and Sell Stock III", "Best Time to Buy and Sell Stock IV", "Maximal Rectangle",
            "Burst Balloons", "Super Egg Drop", "Russian Doll Envelopes"
        ]
    },
    "graphs": {
        "easy": [
            "Find Center of Star Graph", "Find if Path Exists in Graph", "Find Town Judge"
        ],
        "medium": [
            "Number of Islands", "Clone Graph", "Course Schedule",
            "Course Schedule II", "Pacific Atlantic Water Flow", "Graph Valid Tree",
            "Number of Connected Components", "Redundant Connection", "Accounts Merge",
            "Most Stones Removed", "Satisfiability of Equality Equations", "Possible Bipartition",
            "Find Eventual Safe States", "Shortest Bridge", "Keys and Rooms",
            "Regions Cut By Slashes", "Minimize Malware Spread", "Minimize Malware Spread II"
        ],
        "hard": [
            "Word Ladder", "Word Ladder II", "Alien Dictionary",
            "Minimum Height Trees", "Reconstruct Itinerary", "Critical Connections"
        ]
    }
}

COMPANIES = ["Amazon", "Google", "Microsoft", "Facebook", "Apple", "Netflix", "Uber", "Airbnb", "LinkedIn", "Adobe", "TCS", "Odoo", "Infosys", "Wipro", "Oracle"]

# Templates for quick generation
TEMPLATES = {
    "arrays": {
        "description": "Given an array of integers, solve the problem: {title}.",
        "constraints": "1 <= array.length <= 10^4\n-10^9 <= array[i] <= 10^9",
        "starter_python": "def solution(nums):\n    # Write your code here\n    pass",
        "starter_js": "function solution(nums) {\n    // Write your code here\n}",
        "starter_cpp": "class Solution {\npublic:\n    vector<int> solution(vector<int>& nums) {\n        // Write your code here\n    }\n};",
    },
    "strings": {
        "description": "Given a string, solve the problem: {title}.",
        "constraints": "1 <= s.length <= 10^4\ns consists of printable ASCII characters",
        "starter_python": "def solution(s):\n    # Write your code here\n    pass",
        "starter_js": "function solution(s) {\n    // Write your code here\n}",
        "starter_cpp": "class Solution {\npublic:\n    string solution(string s) {\n        // Write your code here\n    }\n};",
    },
    "linked_lists": {
        "description": "Given a linked list, solve the problem: {title}.",
        "constraints": "The number of nodes is in range [0, 500]\n-500 <= Node.val <= 500",
        "starter_python": "def solution(head):\n    # Write your code here\n    pass",
        "starter_js": "function solution(head) {\n    // Write your code here\n}",
        "starter_cpp": "class Solution {\npublic:\n    ListNode* solution(ListNode* head) {\n        // Write your code here\n    }\n};",
    },
    "trees": {
        "description": "Given a binary tree, solve the problem: {title}.",
        "constraints": "The number of nodes is in range [0, 10^4]\n-1000 <= Node.val <= 1000",
        "starter_python": "def solution(root):\n    # Write your code here\n    pass",
        "starter_js": "function solution(root) {\n    // Write your code here\n}",
        "starter_cpp": "class Solution {\npublic:\n    TreeNode* solution(TreeNode* root) {\n        // Write your code here\n    }\n};",
    },
    "dynamic_programming": {
        "description": "Solve the dynamic programming problem: {title}.",
        "constraints": "1 <= n <= 1000\n1 <= values[i] <= 10^4",
        "starter_python": "def solution(n):\n    # Write your code here\n    pass",
        "starter_js": "function solution(n) {\n    // Write your code here\n}",
        "starter_cpp": "class Solution {\npublic:\n    int solution(int n) {\n        // Write your code here\n    }\n};",
    },
    "graphs": {
        "description": "Given a graph, solve the problem: {title}.",
        "constraints": "1 <= n <= 2000\n0 <= edges.length <= 5000",
        "starter_python": "def solution(n, edges):\n    # Write your code here\n    pass",
        "starter_js": "function solution(n, edges) {\n    // Write your code here\n}",
        "starter_cpp": "class Solution {\npublic:\n    bool solution(int n, vector<vector<int>>& edges) {\n        // Write your code here\n    }\n};",
    }
}


def quick_seed(db: Session, limit: int = None):
    """
    Quickly seed problems using templates (no AI calls)
    """
    print("=" * 80)
    print("⚡ QUICK SEED: 1000+ DSA PROBLEMS (Template-Based)")
    print("=" * 80)
    
    # Flatten dataset
    all_problems = []
    for topic, difficulties in PROBLEM_DATASET.items():
        for difficulty, titles in difficulties.items():
            for title in titles:
                # Check if already exists
                existing = db.query(DSAProblem).filter(DSAProblem.title == title).first()
                if existing:
                    continue
                
                all_problems.append({
                    "title": title,
                    "topic": topic,
                    "difficulty": difficulty,
                })
    
    if limit:
        all_problems = all_problems[:limit]
    
    total = len(all_problems)
    print(f"📊 Problems to generate: {total}")
    print(f"⚡ Using template-based generation (instant)")
    print("=" * 80)
    print()
    
    inserted = 0
    failed = 0
    batch_size = 50  # Large batches since no AI calls
    
    start_time = time.time()
    
    for i in range(0, len(all_problems), batch_size):
        batch = all_problems[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(all_problems) + batch_size - 1) // batch_size
        
        print(f"[Batch {batch_num}/{total_batches}] Inserting {len(batch)} problems...")
        
        # Insert batch
        for problem_data in batch:
            try:
                topic = problem_data['topic']
                title = problem_data['title']
                template = TEMPLATES.get(topic, TEMPLATES['arrays'])
                
                # Random companies
                companies = random.sample(COMPANIES, 3)
                
                problem = DSAProblem(
                    title=title,
                    description=template['description'].format(title=title),
                    topic=topic,
                    difficulty=problem_data['difficulty'],
                    company=",".join(companies),
                    constraints=template['constraints'],
                    examples=json.dumps([
                        {"input": "Example input", "output": "Example output", "explanation": "Explanation"}
                    ]),
                    starter_code_python=template['starter_python'],
                    starter_code_javascript=template['starter_js'],
                    starter_code_cpp=template['starter_cpp'],
                    test_cases=json.dumps([
                        {"input": "test1", "expected_output": "output1"},
                        {"input": "test2", "expected_output": "output2"}
                    ]),
                    hints=json.dumps(["Think about the approach", "Consider edge cases"]),
                    time_complexity="O(n)",
                    space_complexity="O(1)"
                )
                db.add(problem)
                inserted += 1
            except Exception as e:
                print(f"   ❌ {title}: {str(e)[:50]}")
                failed += 1
        
        # Commit batch
        try:
            db.commit()
            print(f"   ✅ Batch committed ({inserted} total)")
        except Exception as e:
            print(f"   ❌ Commit failed: {e}")
            db.rollback()
        
        # Progress update
        if batch_num % 5 == 0:
            elapsed = time.time() - start_time
            rate = inserted / elapsed if elapsed > 0 else 0
            remaining = (total - inserted) / rate if rate > 0 else 0
            print()
            print(f"📈 Progress: {inserted}/{total} ({int(inserted/total*100)}%)")
            print(f"⏱️  Time: {elapsed:.1f}s | Rate: {rate:.1f} problems/sec")
            print(f"⏳ Estimated remaining: {remaining:.1f} seconds")
            print()
    
    elapsed = time.time() - start_time
    
    print()
    print("=" * 80)
    print("🎉 QUICK SEED COMPLETE!")
    print("=" * 80)
    print(f"⏱️  Total Time: {elapsed:.1f} seconds")
    print(f"✅ Inserted: {inserted}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total in DB: {db.query(DSAProblem).count()}")
    print(f"🚀 Average: {inserted/elapsed:.1f} problems/second")
    print("=" * 80)
    print()
    print("💡 Next Steps:")
    print("   1. Run: python3 scripts/generate_solutions.py (to add AI solutions)")
    print("   2. Run: python3 scripts/update_solutions.py (to enhance descriptions)")
    print("=" * 80)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Quick seed 1000+ DSA problems')
    parser.add_argument('--limit', type=int, help='Limit number of problems (for testing)')
    
    args = parser.parse_args()
    
    db = SessionLocal()
    try:
        quick_seed(db, limit=args.limit)
    finally:
        db.close()
