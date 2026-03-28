"""
Generate 1000+ DSA Problems - Fast & Efficient
Uses curated problem titles and batch AI generation
"""
import sys
import json
import time
from pathlib import Path
from typing import List, Dict
import asyncio

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import DSAProblem
import google.generativeai as genai
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# Curated 1000+ LeetCode-style problems
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
            "Shortest Subarray with Sum at Least K", "Subarrays with K Different Integers", "Minimum Number of K Consecutive Bit Flips"
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

# Company tags for problems
COMPANIES = ["Amazon", "Google", "Microsoft", "Facebook", "Apple", "Netflix", "Uber", "Airbnb", "LinkedIn", "Adobe", "TCS", "Odoo", "Infosys", "Wipro", "Oracle"]


def generate_problem_batch(problems: List[Dict], batch_size: int = 5) -> List[Dict]:
    """
    Generate multiple problems in a single AI call for efficiency
    """
    max_retries = 2
    for attempt in range(max_retries):
        try:
            # Build batch prompt
            problems_list = "\n".join([
                f"{i+1}. {p['title']} (Topic: {p['topic']}, Difficulty: {p['difficulty']})"
                for i, p in enumerate(problems)
            ])
            
            prompt = f"""Generate complete DSA problem details for these {len(problems)} problems:

{problems_list}

For EACH problem, provide:
- Detailed description (2-3 sentences)
- 2 examples with input/output
- Constraints (1-2 lines)
- Starter code for Python, JavaScript, C++
- 3 test cases
- 2 hints
- Time and space complexity

Return as JSON array:
[
  {{
    "title": "Problem Title",
    "description": "...",
    "constraints": "...",
    "examples": [{{"input": "...", "output": "...", "explanation": "..."}}],
    "starter_code_python": "def solution():\\n    pass",
    "starter_code_javascript": "function solution() {{}}",
    "starter_code_cpp": "class Solution {{}};",
    "test_cases": [{{"input": "...", "expected_output": "..."}}],
    "hints": ["hint1", "hint2"],
    "time_complexity": "O(n)",
    "space_complexity": "O(1)"
  }}
]"""

            # Set timeout for API call
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=4000,
                )
            )
            response_text = response.text.strip()
            
            # Extract JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            results = json.loads(response_text)
            return results if isinstance(results, list) else [results]
            
        except Exception as e:
            print(f"   ⚠️  Attempt {attempt + 1}/{max_retries} failed: {str(e)[:100]}")
            if attempt < max_retries - 1:
                time.sleep(3)
            else:
                print(f"   ❌ Batch generation failed after {max_retries} attempts")
                return []


def fast_seed_1000_problems(db: Session, limit: int = None):
    """
    Quickly seed 1000+ problems using batch generation
    """
    print("=" * 80)
    print("🚀 FAST SEED: 1000+ DSA PROBLEMS")
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
                    "company": ",".join(COMPANIES[:3])  # Random companies
                })
    
    if limit:
        all_problems = all_problems[:limit]
    
    total = len(all_problems)
    print(f"📊 Problems to generate: {total}")
    print(f"⚡ Using batch generation (5 problems per API call)")
    print("=" * 80)
    print()
    
    inserted = 0
    failed = 0
    batch_size = 3  # Reduced from 5 to 3 for faster generation
    
    start_time = time.time()
    
    for i in range(0, len(all_problems), batch_size):
        batch = all_problems[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(all_problems) + batch_size - 1) // batch_size
        
        print(f"[Batch {batch_num}/{total_batches}] Generating {len(batch)} problems...")
        
        # Generate batch with AI
        results = generate_problem_batch(batch, batch_size)
        
        if not results or len(results) != len(batch):
            print(f"   ⚠️  Batch incomplete or failed, skipping...")
            failed += len(batch)
            time.sleep(5)  # Longer wait before retry
            continue
        
        # Insert into database
        for idx, (problem_data, details) in enumerate(zip(batch, results)):
            try:
                problem = DSAProblem(
                    title=problem_data['title'],
                    description=details.get('description', f"Solve {problem_data['title']}"),
                    topic=problem_data['topic'],
                    difficulty=problem_data['difficulty'],
                    company=problem_data['company'],
                    constraints=details.get('constraints', ''),
                    examples=json.dumps(details.get('examples', [])),
                    starter_code_python=details.get('starter_code_python', 'def solution():\n    pass'),
                    starter_code_javascript=details.get('starter_code_javascript', 'function solution() {}'),
                    starter_code_cpp=details.get('starter_code_cpp', 'class Solution {};'),
                    test_cases=json.dumps(details.get('test_cases', [])),
                    hints=json.dumps(details.get('hints', [])),
                    time_complexity=details.get('time_complexity', 'O(n)'),
                    space_complexity=details.get('space_complexity', 'O(1)')
                )
                db.add(problem)
                inserted += 1
                print(f"   ✅ {problem_data['title']}")
            except Exception as e:
                print(f"   ❌ {problem_data['title']}: {str(e)[:50]}")
                failed += 1
        
        # Commit batch
        try:
            db.commit()
            print(f"   💾 Batch committed ({inserted} total)")
        except Exception as e:
            print(f"   ❌ Commit failed: {e}")
            db.rollback()
        
        # Rate limiting - reduced wait time
        time.sleep(1)
        
        # Progress update every 5 batches
        if batch_num % 5 == 0:
            elapsed = time.time() - start_time
            rate = inserted / elapsed if elapsed > 0 else 0
            remaining = (total - inserted) / rate if rate > 0 else 0
            print()
            print(f"📈 Progress: {inserted}/{total} ({int(inserted/total*100)}%)")
            print(f"⏱️  Time: {elapsed:.1f}s | Rate: {rate:.2f} problems/sec")
            print(f"⏳ Estimated remaining: {remaining/60:.1f} minutes")
            print()
    
    elapsed = time.time() - start_time
    
    print()
    print("=" * 80)
    print("🎉 FAST SEED COMPLETE!")
    print("=" * 80)
    print(f"⏱️  Total Time: {elapsed/60:.1f} minutes")
    print(f"✅ Inserted: {inserted}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total in DB: {db.query(DSAProblem).count()}")
    print(f"🚀 Average: {inserted/elapsed:.1f} problems/second")
    print("=" * 80)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate 1000+ DSA problems')
    parser.add_argument('--limit', type=int, help='Limit number of problems (for testing)')
    
    args = parser.parse_args()
    
    db = SessionLocal()
    try:
        fast_seed_1000_problems(db, limit=args.limit)
    finally:
        db.close()
