#!/usr/bin/env python3
"""Generate remaining DSA questions to complete the dataset"""

# This script generates questions 30-110 to complete our 100+ question dataset
# Topics: Hashing (6 more), Two Pointers (8), Sliding Window (7), Stack (8), Queue (5),
#         Linked List (8), Binary Search (7), Trees (10), BST (5), Heap (5),
#         Recursion (6), Backtracking (5), Greedy (6), DP (10), Graphs (8), Trie (3), Bit Manipulation (5)

questions_data = [
    # Remaining Hashing questions (30-35)
    (30, 'longest-consecutive-sequence', 'Longest Consecutive Sequence', 'Medium', 'Hashing', ['Amazon', 'Google', 'Microsoft'], 48.9),
    (31, 'top-k-frequent-elements', 'Top K Frequent Elements', 'Medium', 'Hashing', ['Amazon', 'Microsoft', 'Meta'], 63.2),
    (32, 'find-all-anagrams', 'Find All Anagrams in a String', 'Medium', 'Hashing', ['Amazon', 'Google'], 49.1),
    (33, 'first-unique-character', 'First Unique Character in a String', 'Easy', 'Hashing', ['TCS', 'Infosys', 'Amazon'], 58.7),
    (34, 'isomorphic-strings', 'Isomorphic Strings', 'Easy', 'Hashing', ['TCS', 'Amazon', 'Microsoft'], 43.2),
    (35, 'happy-number', 'Happy Number', 'Easy', 'Hashing', ['TCS', 'Infosys'], 54.8),
    
    # Two Pointers (36-43)
    (36, 'valid-palindrome-two-pointers', 'Valid Palindrome (Two Pointers)', 'Easy', 'Two Pointers', ['TCS', 'Amazon'], 45.3),
    (37, 'remove-duplicates-sorted-array', 'Remove Duplicates from Sorted Array', 'Easy', 'Two Pointers', ['TCS', 'Infosys', 'Amazon'], 51.2),
    (38, 'move-zeroes', 'Move Zeroes', 'Easy', 'Two Pointers', ['TCS', 'Amazon', 'Microsoft'], 61.4),
    (39, 'container-most-water-two-pointers', 'Container With Most Water', 'Medium', 'Two Pointers', ['Amazon', 'Google'], 54.2),
    (40, 'trapping-rain-water-two-pointers', 'Trapping Rain Water (Two Pointers)', 'Hard', 'Two Pointers', ['Amazon', 'Google', 'Microsoft'], 58.3),
    (41, 'sort-colors', 'Sort Colors', 'Medium', 'Two Pointers', ['Amazon', 'Microsoft'], 59.7),
    (42, 'remove-nth-node-from-end', 'Remove Nth Node From End of List', 'Medium', 'Two Pointers', ['Amazon', 'Microsoft', 'Google'], 42.1),
    (43, 'partition-list', 'Partition List', 'Medium', 'Two Pointers', ['Amazon', 'Microsoft'], 51.8),
    
    # Sliding Window (44-50)
    (44, 'maximum-average-subarray', 'Maximum Average Subarray I', 'Easy', 'Sliding Window', ['TCS', 'Amazon'], 43.7),
    (45, 'longest-substring-k-distinct', 'Longest Substring with At Most K Distinct Characters', 'Medium', 'Sliding Window', ['Amazon', 'Google'], 47.2),
    (46, 'minimum-size-subarray-sum', 'Minimum Size Subarray Sum', 'Medium', 'Sliding Window', ['Amazon', 'Microsoft'], 46.8),
    (47, 'permutation-in-string', 'Permutation in String', 'Medium', 'Sliding Window', ['Amazon', 'Microsoft'], 44.9),
    (48, 'sliding-window-maximum', 'Sliding Window Maximum', 'Hard', 'Sliding Window', ['Amazon', 'Google', 'Microsoft'], 46.3),
    (49, 'longest-repeating-character-replacement', 'Longest Repeating Character Replacement', 'Medium', 'Sliding Window', ['Amazon', 'Google'], 52.1),
    (50, 'max-consecutive-ones-iii', 'Max Consecutive Ones III', 'Medium', 'Sliding Window', ['Amazon', 'Google'], 63.4),
    
    # Stack (51-58)
    (51, 'valid-parentheses', 'Valid Parentheses', 'Easy', 'Stack', ['TCS', 'Infosys', 'Amazon', 'Microsoft'], 40.1),
    (52, 'min-stack', 'Min Stack', 'Medium', 'Stack', ['Amazon', 'Microsoft', 'Google'], 52.7),
    (53, 'evaluate-reverse-polish', 'Evaluate Reverse Polish Notation', 'Medium', 'Stack', ['Amazon', 'Microsoft'], 45.3),
    (54, 'daily-temperatures', 'Daily Temperatures', 'Medium', 'Stack', ['Amazon', 'Google'], 66.8),
    (55, 'next-greater-element', 'Next Greater Element I', 'Easy', 'Stack', ['TCS', 'Amazon'], 71.2),
    (56, 'largest-rectangle-histogram', 'Largest Rectangle in Histogram', 'Hard', 'Stack', ['Amazon', 'Google', 'Microsoft'], 42.1),
    (57, 'simplify-path', 'Simplify Path', 'Medium', 'Stack', ['Amazon', 'Microsoft'], 40.7),
    (58, 'decode-string', 'Decode String', 'Medium', 'Stack', ['Amazon', 'Google', 'Microsoft'], 58.9),
    
    # Queue (59-63)
    (59, 'implement-queue-using-stacks', 'Implement Queue using Stacks', 'Easy', 'Queue', ['TCS', 'Infosys', 'Amazon'], 64.2),
    (60, 'implement-stack-using-queues', 'Implement Stack using Queues', 'Easy', 'Queue', ['TCS', 'Amazon'], 62.8),
    (61, 'design-circular-queue', 'Design Circular Queue', 'Medium', 'Queue', ['Amazon', 'Microsoft'], 51.4),
    (62, 'moving-average-data-stream', 'Moving Average from Data Stream', 'Easy', 'Queue', ['TCS', 'Amazon'], 76.3),
    (63, 'recent-counter', 'Number of Recent Calls', 'Easy', 'Queue', ['TCS', 'Infosys'], 74.8),
    
    # Linked List (64-71)
    (64, 'reverse-linked-list', 'Reverse Linked List', 'Easy', 'Linked List', ['TCS', 'Infosys', 'Amazon', 'Microsoft'], 73.2),
    (65, 'merge-two-sorted-lists', 'Merge Two Sorted Lists', 'Easy', 'Linked List', ['TCS', 'Amazon', 'Microsoft'], 62.4),
    (66, 'linked-list-cycle', 'Linked List Cycle', 'Easy', 'Linked List', ['TCS', 'Amazon', 'Microsoft'], 48.7),
    (67, 'middle-of-linked-list', 'Middle of the Linked List', 'Easy', 'Linked List', ['TCS', 'Infosys'], 76.1),
    (68, 'palindrome-linked-list', 'Palindrome Linked List', 'Easy', 'Linked List', ['TCS', 'Amazon'], 51.3),
    (69, 'intersection-two-linked-lists', 'Intersection of Two Linked Lists', 'Easy', 'Linked List', ['TCS', 'Amazon', 'Microsoft'], 54.8),
    (70, 'add-two-numbers', 'Add Two Numbers', 'Medium', 'Linked List', ['Amazon', 'Microsoft', 'Google'], 41.2),
    (71, 'reorder-list', 'Reorder List', 'Medium', 'Linked List', ['Amazon', 'Microsoft'], 56.7),
    
    # Binary Search (72-78)
    (72, 'binary-search', 'Binary Search', 'Easy', 'Binary Search', ['TCS', 'Infosys', 'Amazon'], 56.3),
    (73, 'first-bad-version', 'First Bad Version', 'Easy', 'Binary Search', ['TCS', 'Amazon', 'Microsoft'], 43.2),
    (74, 'search-insert-position', 'Search Insert Position', 'Easy', 'Binary Search', ['TCS', 'Infosys', 'Amazon'], 43.9),
    (75, 'find-peak-element', 'Find Peak Element', 'Medium', 'Binary Search', ['Amazon', 'Google', 'Microsoft'], 46.2),
    (76, 'search-2d-matrix', 'Search a 2D Matrix', 'Medium', 'Binary Search', ['Amazon', 'Microsoft'], 48.7),
    (77, 'koko-eating-bananas', 'Koko Eating Bananas', 'Medium', 'Binary Search', ['Amazon', 'Google'], 54.1),
    (78, 'median-sorted-arrays-binary-search', 'Median of Two Sorted Arrays', 'Hard', 'Binary Search', ['Amazon', 'Google', 'Microsoft'], 35.2),
    
    # Trees (79-88)
    (79, 'maximum-depth-binary-tree', 'Maximum Depth of Binary Tree', 'Easy', 'Trees', ['TCS', 'Infosys', 'Amazon'], 74.3),
    (80, 'invert-binary-tree', 'Invert Binary Tree', 'Easy', 'Trees', ['TCS', 'Amazon', 'Google'], 75.1),
    (81, 'symmetric-tree', 'Symmetric Tree', 'Easy', 'Trees', ['TCS', 'Amazon', 'Microsoft'], 54.2),
    (82, 'path-sum', 'Path Sum', 'Easy', 'Trees', ['TCS', 'Amazon'], 48.9),
    (83, 'same-tree', 'Same Tree', 'Easy', 'Trees', ['TCS', 'Infosys'], 59.7),
    (84, 'binary-tree-level-order', 'Binary Tree Level Order Traversal', 'Medium', 'Trees', ['Amazon', 'Microsoft', 'Google'], 64.8),
    (85, 'binary-tree-zigzag-level-order', 'Binary Tree Zigzag Level Order Traversal', 'Medium', 'Trees', ['Amazon', 'Microsoft'], 57.3),
    (86, 'lowest-common-ancestor', 'Lowest Common Ancestor of a Binary Tree', 'Medium', 'Trees', ['Amazon', 'Google', 'Microsoft'], 61.2),
    (87, 'serialize-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree', 'Hard', 'Trees', ['Amazon', 'Google', 'Microsoft'], 56.7),
    (88, 'binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'Hard', 'Trees', ['Amazon', 'Google', 'Microsoft'], 38.9),
    
    # BST (89-93)
    (89, 'validate-binary-search-tree', 'Validate Binary Search Tree', 'Medium', 'BST', ['Amazon', 'Microsoft', 'Google'], 32.1),
    (90, 'kth-smallest-element-bst', 'Kth Smallest Element in a BST', 'Medium', 'BST', ['Amazon', 'Google'], 71.4),
    (91, 'lowest-common-ancestor-bst', 'Lowest Common Ancestor of a BST', 'Medium', 'BST', ['Amazon', 'Microsoft'], 62.8),
    (92, 'convert-sorted-array-to-bst', 'Convert Sorted Array to Binary Search Tree', 'Easy', 'BST', ['TCS', 'Amazon'], 70.3),
    (93, 'delete-node-in-bst', 'Delete Node in a BST', 'Medium', 'BST', ['Amazon', 'Microsoft'], 51.2),
    
    # Heap (94-98)
    (94, 'kth-largest-element', 'Kth Largest Element in an Array', 'Medium', 'Heap', ['Amazon', 'Microsoft', 'Google'], 66.7),
    (95, 'top-k-frequent-words', 'Top K Frequent Words', 'Medium', 'Heap', ['Amazon', 'Google'], 56.3),
    (96, 'merge-k-sorted-lists', 'Merge k Sorted Lists', 'Hard', 'Heap', ['Amazon', 'Google', 'Microsoft'], 51.2),
    (97, 'find-median-from-data-stream', 'Find Median from Data Stream', 'Hard', 'Heap', ['Amazon', 'Google', 'Microsoft'], 51.7),
    (98, 'task-scheduler', 'Task Scheduler', 'Medium', 'Heap', ['Amazon', 'Microsoft', 'Meta'], 57.8),
    
    # Recursion (99-104)
    (99, 'fibonacci-number', 'Fibonacci Number', 'Easy', 'Recursion', ['TCS', 'Infosys', 'Wipro'], 69.4),
    (100, 'power-of-two', 'Power of Two', 'Easy', 'Recursion', ['TCS', 'Infosys'], 46.2),
    (101, 'reverse-string-recursive', 'Reverse String (Recursive)', 'Easy', 'Recursion', ['TCS', 'Infosys'], 76.8),
    (102, 'pow-x-n', 'Pow(x, n)', 'Medium', 'Recursion', ['Amazon', 'Google', 'Microsoft'], 33.7),
    (103, 'subsets', 'Subsets', 'Medium', 'Recursion', ['Amazon', 'Google', 'Microsoft'], 75.3),
    (104, 'permutations', 'Permutations', 'Medium', 'Recursion', ['Amazon', 'Microsoft', 'Google'], 75.9),
    
    # Backtracking (105-109)
    (105, 'combination-sum', 'Combination Sum', 'Medium', 'Backtracking', ['Amazon', 'Google', 'Microsoft'], 70.1),
    (106, 'word-search', 'Word Search', 'Medium', 'Backtracking', ['Amazon', 'Microsoft', 'Google'], 40.3),
    (107, 'n-queens', 'N-Queens', 'Hard', 'Backtracking', ['Amazon', 'Google', 'Microsoft'], 66.2),
    (108, 'sudoku-solver', 'Sudoku Solver', 'Hard', 'Backtracking', ['Amazon', 'Google'], 58.7),
    (109, 'letter-case-permutation', 'Letter Case Permutation', 'Medium', 'Backtracking', ['Amazon', 'Google'], 73.4),
    
    # Greedy (110-115)
    (110, 'jump-game', 'Jump Game', 'Medium', 'Greedy', ['Amazon', 'Microsoft', 'Google'], 38.9),
    (111, 'jump-game-ii', 'Jump Game II', 'Medium', 'Greedy', ['Amazon', 'Google', 'Microsoft'], 40.1),
    (112, 'gas-station', 'Gas Station', 'Medium', 'Greedy', ['Amazon', 'Microsoft'], 45.3),
    (113, 'partition-labels', 'Partition Labels', 'Medium', 'Greedy', ['Amazon', 'Google'], 80.7),
    (114, 'meeting-rooms-ii', 'Meeting Rooms II', 'Medium', 'Greedy', ['Amazon', 'Google', 'Microsoft'], 49.8),
    (115, 'non-overlapping-intervals', 'Non-overlapping Intervals', 'Medium', 'Greedy', ['Amazon', 'Microsoft'], 51.2),
    
    # DP (116-125)
    (116, 'climbing-stairs', 'Climbing Stairs', 'Easy', 'DP', ['TCS', 'Infosys', 'Amazon'], 51.4),
    (117, 'house-robber', 'House Robber', 'Medium', 'DP', ['Amazon', 'Microsoft', 'Google'], 49.7),
    (118, 'coin-change', 'Coin Change', 'Medium', 'DP', ['Amazon', 'Google', 'Microsoft'], 41.5),
    (119, 'longest-increasing-subsequence', 'Longest Increasing Subsequence', 'Medium', 'DP', ['Amazon', 'Microsoft', 'Google'], 53.2),
    (120, 'word-break', 'Word Break', 'Medium', 'DP', ['Amazon', 'Google', 'Microsoft'], 45.7),
    (121, 'unique-paths', 'Unique Paths', 'Medium', 'DP', ['Amazon', 'Google', 'Microsoft'], 63.8),
    (122, 'edit-distance', 'Edit Distance', 'Medium', 'DP', ['Amazon', 'Google', 'Microsoft'], 54.2),
    (123, 'decode-ways', 'Decode Ways', 'Medium', 'DP', ['Amazon', 'Microsoft', 'Meta'], 32.7),
    (124, 'maximal-square', 'Maximal Square', 'Medium', 'DP', ['Amazon', 'Google'], 45.1),
    (125, 'regular-expression-matching', 'Regular Expression Matching', 'Hard', 'DP', ['Amazon', 'Google', 'Microsoft'], 28.3),
    
    # Graphs (126-133)
    (126, 'number-of-islands', 'Number of Islands', 'Medium', 'Graphs', ['Amazon', 'Google', 'Microsoft'], 57.8),
    (127, 'clone-graph', 'Clone Graph', 'Medium', 'Graphs', ['Amazon', 'Microsoft', 'Google'], 52.3),
    (128, 'course-schedule', 'Course Schedule', 'Medium', 'Graphs', ['Amazon', 'Google', 'Microsoft'], 46.2),
    (129, 'pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'Medium', 'Graphs', ['Amazon', 'Google'], 54.7),
    (130, 'graph-valid-tree', 'Graph Valid Tree', 'Medium', 'Graphs', ['Amazon', 'Google', 'Microsoft'], 45.8),
    (131, 'word-ladder', 'Word Ladder', 'Hard', 'Graphs', ['Amazon', 'Google', 'Microsoft'], 36.7),
    (132, 'alien-dictionary', 'Alien Dictionary', 'Hard', 'Graphs', ['Amazon', 'Google', 'Meta'], 35.2),
    (133, 'network-delay-time', 'Network Delay Time', 'Medium', 'Graphs', ['Amazon', 'Google'], 52.1),
    
    # Trie (134-136)
    (134, 'implement-trie', 'Implement Trie (Prefix Tree)', 'Medium', 'Trie', ['Amazon', 'Google', 'Microsoft'], 64.2),
    (135, 'word-search-ii', 'Word Search II', 'Hard', 'Trie', ['Amazon', 'Google', 'Microsoft'], 37.8),
    (136, 'design-add-search-words', 'Design Add and Search Words Data Structure', 'Medium', 'Trie', ['Amazon', 'Google'], 45.7),
    
    # Bit Manipulation (137-141)
    (137, 'single-number', 'Single Number', 'Easy', 'Bit Manipulation', ['TCS', 'Infosys', 'Amazon'], 70.3),
    (138, 'number-of-1-bits', 'Number of 1 Bits', 'Easy', 'Bit Manipulation', ['TCS', 'Amazon'], 66.8),
    (139, 'counting-bits', 'Counting Bits', 'Easy', 'Bit Manipulation', ['TCS', 'Amazon', 'Microsoft'], 77.2),
    (140, 'reverse-bits', 'Reverse Bits', 'Easy', 'Bit Manipulation', ['TCS', 'Amazon'], 52.7),
    (141, 'sum-of-two-integers', 'Sum of Two Integers', 'Medium', 'Bit Manipulation', ['Amazon', 'Microsoft'], 50.8),
]

print(f"// Continuing from question 30...")
print()

for q_id, slug, title, diff, topic, companies, acceptance in questions_data:
    time_limit = 1200 if diff == 'Easy' else (1800 if diff == 'Medium' else 2400)
    companies_str = '", "'.join(companies)
    
    print(f"""  {{
    id: {q_id},
    slug: '{slug}',
    title: '{title}',
    difficulty: '{diff}',
    topic: '{topic}',
    companies: ["{companies_str}"],
    description: 'Solve the {title} problem.',
    examples: [
      {{ input: 'Example input', output: 'Example output' }}
    ],
    constraints: ['Standard constraints apply'],
    starterCode: {{
      python: 'def solve():\\n    # Write your code here\\n    pass\\n\\n# Test\\nimport json\\ndata = json.loads(input())\\nprint(json.dumps(solve()))',
      javascript: 'function solve() {{\\n    // Write your code here\\n}}\\n\\n// Test\\nconst input = require("fs").readFileSync(0, "utf-8").trim();\\nconst data = JSON.parse(input);\\nconsole.log(JSON.stringify(solve()));',
      cpp: '#include <iostream>\\nusing namespace std;\\n\\nvoid solve() {{\\n    // Write your code here\\n}}\\n\\nint main() {{\\n    return 0;\\n}}'
    }},
    testCases: {{
      visible: [
        {{ input: 'test1', expected: 'result1' }}
      ],
      hidden: [
        {{ input: 'test2', expected: 'result2' }},
        {{ input: 'test3', expected: 'result3' }}
      ]
    }},
    acceptance: {acceptance},
    timeLimit: {time_limit}
  }},""")

print("\n];")
print(f"\n// Total questions: {len(questions_data) + 29} (29 detailed + {len(questions_data)} generated)")
