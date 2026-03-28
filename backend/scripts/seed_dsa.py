"""
DSA Questions Seed Script
Populates the database with classic DSA problems for placement preparation
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models import DSAProblem, DSATopic, DifficultyLevel

def create_seed_questions():
    """Create classic DSA questions for each topic"""
    
    questions = [
        # ARRAYS - 5 questions
        {
            "title": "Two Sum",
            "description": """Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.""",
            "topic": DSATopic.ARRAYS,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, TCS, Google",
            "constraints": """- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.""",
            "examples": json.dumps([
                {
                    "input": "nums = [2,7,11,15], target = 9",
                    "output": "[0,1]",
                    "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
                },
                {
                    "input": "nums = [3,2,4], target = 6",
                    "output": "[1,2]",
                    "explanation": "nums[1] + nums[2] = 6"
                }
            ]),
            "starter_code_python": """def twoSum(nums, target):
    # Write your code here
    pass""",
            "starter_code_javascript": """function twoSum(nums, target) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[2,7,11,15], 9", "expected_output": "[0,1]"},
                {"input": "[3,2,4], 6", "expected_output": "[1,2]"},
                {"input": "[3,3], 6", "expected_output": "[0,1]"}
            ]),
            "solution": "Use a hash map to store numbers and their indices. For each number, check if target - num exists in the map.",
            "hints": json.dumps([
                "Think about using a hash map to store values you've seen",
                "For each number, calculate what number you need to reach the target",
                "Check if that needed number already exists in your hash map"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(n)"
        },
        {
            "title": "Best Time to Buy and Sell Stock",
            "description": """You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.""",
            "topic": DSATopic.ARRAYS,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, TCS, Odoo",
            "constraints": """- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4""",
            "examples": json.dumps([
                {
                    "input": "prices = [7,1,5,3,6,4]",
                    "output": "5",
                    "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
                }
            ]),
            "starter_code_python": """def maxProfit(prices):
    # Write your code here
    pass""",
            "starter_code_javascript": """function maxProfit(prices) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

int maxProfit(vector<int>& prices) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[7,1,5,3,6,4]", "expected_output": "5"},
                {"input": "[7,6,4,3,1]", "expected_output": "0"}
            ]),
            "solution": "Track minimum price seen so far and maximum profit at each step.",
            "hints": json.dumps([
                "Keep track of the minimum price you've seen so far",
                "At each price, calculate profit if you sold at current price",
                "Update maximum profit as you go"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Contains Duplicate",
            "description": """Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.""",
            "topic": DSATopic.ARRAYS,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, Google, TCS",
            "constraints": """- 1 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9""",
            "examples": json.dumps([
                {"input": "nums = [1,2,3,1]", "output": "true", "explanation": ""},
                {"input": "nums = [1,2,3,4]", "output": "false", "explanation": ""}
            ]),
            "starter_code_python": """def containsDuplicate(nums):
    # Write your code here
    pass""",
            "starter_code_javascript": """function containsDuplicate(nums) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

bool containsDuplicate(vector<int>& nums) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[1,2,3,1]", "expected_output": "true"},
                {"input": "[1,2,3,4]", "expected_output": "false"}
            ]),
            "solution": "Use a hash set to track seen numbers.",
            "hints": json.dumps([
                "Use a set to store numbers you've seen",
                "If you encounter a number already in the set, return true",
                "If you finish the loop without finding duplicates, return false"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(n)"
        },
        {
            "title": "Maximum Subarray",
            "description": """Given an integer array nums, find the subarray with the largest sum, and return its sum.""",
            "topic": DSATopic.ARRAYS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, TCS, Odoo",
            "constraints": """- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4""",
            "examples": json.dumps([
                {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "[4,-1,2,1] has the largest sum = 6."}
            ]),
            "starter_code_python": """def maxSubArray(nums):
    # Write your code here
    pass""",
            "starter_code_javascript": """function maxSubArray(nums) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[-2,1,-3,4,-1,2,1,-5,4]", "expected_output": "6"},
                {"input": "[1]", "expected_output": "1"}
            ]),
            "solution": "Use Kadane's algorithm: track current sum and maximum sum.",
            "hints": json.dumps([
                "This is a classic dynamic programming problem (Kadane's Algorithm)",
                "Keep track of the current sum and maximum sum seen so far",
                "If current sum becomes negative, reset it to 0"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Product of Array Except Self",
            "description": """Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

You must write an algorithm that runs in O(n) time and without using the division operation.""",
            "topic": DSATopic.ARRAYS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, Google, Odoo",
            "constraints": """- 2 <= nums.length <= 10^5
- -30 <= nums[i] <= 30
- The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.""",
            "examples": json.dumps([
                {"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]", "explanation": ""}
            ]),
            "starter_code_python": """def productExceptSelf(nums):
    # Write your code here
    pass""",
            "starter_code_javascript": """function productExceptSelf(nums) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

vector<int> productExceptSelf(vector<int>& nums) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[1,2,3,4]", "expected_output": "[24,12,8,6]"},
                {"input": "[-1,1,0,-3,3]", "expected_output": "[0,0,9,0,0]"}
            ]),
            "solution": "Use prefix and suffix products. Build result array with left products, then multiply by right products.",
            "hints": json.dumps([
                "Think about prefix and suffix products",
                "First pass: calculate product of all elements to the left",
                "Second pass: multiply by product of all elements to the right"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        # STRINGS - 5 questions
        {
            "title": "Valid Anagram",
            "description": """Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.""",
            "topic": DSATopic.STRINGS,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, TCS, Google",
            "constraints": """- 1 <= s.length, t.length <= 5 * 10^4
- s and t consist of lowercase English letters.""",
            "examples": json.dumps([
                {"input": "s = 'anagram', t = 'nagaram'", "output": "true", "explanation": ""},
                {"input": "s = 'rat', t = 'car'", "output": "false", "explanation": ""}
            ]),
            "starter_code_python": """def isAnagram(s, t):
    # Write your code here
    pass""",
            "starter_code_javascript": """function isAnagram(s, t) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <string>
using namespace std;

bool isAnagram(string s, string t) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "'anagram', 'nagaram'", "expected_output": "true"},
                {"input": "'rat', 'car'", "expected_output": "false"}
            ]),
            "solution": "Count character frequencies using hash map or sort both strings.",
            "hints": json.dumps([
                "Count the frequency of each character in both strings",
                "Compare the frequency maps",
                "Alternative: Sort both strings and compare"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Valid Parentheses",
            "description": """Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.""",
            "topic": DSATopic.STRINGS,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, TCS, Odoo",
            "constraints": """- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.""",
            "examples": json.dumps([
                {"input": "s = '()'", "output": "true", "explanation": ""},
                {"input": "s = '()[]{}'", "output": "true", "explanation": ""},
                {"input": "s = '(]'", "output": "false", "explanation": ""}
            ]),
            "starter_code_python": """def isValid(s):
    # Write your code here
    pass""",
            "starter_code_javascript": """function isValid(s) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <string>
using namespace std;

bool isValid(string s) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "'()'", "expected_output": "true"},
                {"input": "'()[]{}'", "expected_output": "true"},
                {"input": "'(]'", "expected_output": "false"}
            ]),
            "solution": "Use a stack. Push opening brackets, pop and match closing brackets.",
            "hints": json.dumps([
                "Use a stack data structure",
                "Push opening brackets onto the stack",
                "When you see a closing bracket, check if it matches the top of the stack"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(n)"
        },
        {
            "title": "Longest Substring Without Repeating Characters",
            "description": """Given a string s, find the length of the longest substring without repeating characters.""",
            "topic": DSATopic.STRINGS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, Google, Odoo",
            "constraints": """- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.""",
            "examples": json.dumps([
                {"input": "s = 'abcabcbb'", "output": "3", "explanation": "The answer is 'abc', with the length of 3."},
                {"input": "s = 'bbbbb'", "output": "1", "explanation": "The answer is 'b', with the length of 1."}
            ]),
            "starter_code_python": """def lengthOfLongestSubstring(s):
    # Write your code here
    pass""",
            "starter_code_javascript": """function lengthOfLongestSubstring(s) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <string>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "'abcabcbb'", "expected_output": "3"},
                {"input": "'bbbbb'", "expected_output": "1"}
            ]),
            "solution": "Use sliding window with hash set to track characters in current window.",
            "hints": json.dumps([
                "Use the sliding window technique",
                "Keep a set of characters in the current window",
                "When you find a duplicate, shrink the window from the left"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(min(n, m))"
        },
        {
            "title": "Longest Palindromic Substring",
            "description": """Given a string s, return the longest palindromic substring in s.""",
            "topic": DSATopic.STRINGS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, TCS, Google",
            "constraints": """- 1 <= s.length <= 1000
- s consist of only digits and English letters.""",
            "examples": json.dumps([
                {"input": "s = 'babad'", "output": "'bab' or 'aba'", "explanation": "Both are valid answers."},
                {"input": "s = 'cbbd'", "output": "'bb'", "explanation": ""}
            ]),
            "starter_code_python": """def longestPalindrome(s):
    # Write your code here
    pass""",
            "starter_code_javascript": """function longestPalindrome(s) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <string>
using namespace std;

string longestPalindrome(string s) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "'babad'", "expected_output": "'bab'"},
                {"input": "'cbbd'", "expected_output": "'bb'"}
            ]),
            "solution": "Expand around center for each possible center (odd and even length palindromes).",
            "hints": json.dumps([
                "A palindrome mirrors around its center",
                "Expand around each possible center",
                "Consider both odd and even length palindromes"
            ]),
            "time_complexity": "O(n^2)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Group Anagrams",
            "description": """Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.""",
            "topic": DSATopic.STRINGS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, Odoo, TCS",
            "constraints": """- 1 <= strs.length <= 10^4
- 0 <= strs[i].length <= 100
- strs[i] consists of lowercase English letters.""",
            "examples": json.dumps([
                {"input": "strs = ['eat','tea','tan','ate','nat','bat']", "output": "[['bat'],['nat','tan'],['ate','eat','tea']]", "explanation": ""}
            ]),
            "starter_code_python": """def groupAnagrams(strs):
    # Write your code here
    pass""",
            "starter_code_javascript": """function groupAnagrams(strs) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
#include <string>
using namespace std;

vector<vector<string>> groupAnagrams(vector<string>& strs) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "['eat','tea','tan','ate','nat','bat']", "expected_output": "[['bat'],['nat','tan'],['ate','eat','tea']]"}
            ]),
            "solution": "Use hash map with sorted string as key to group anagrams.",
            "hints": json.dumps([
                "Sort each string and use it as a key",
                "Group strings with the same sorted version together",
                "Use a hash map to store groups"
            ]),
            "time_complexity": "O(n * k log k)",
            "space_complexity": "O(n * k)"
        },
        # LINKED LISTS - 5 questions
        {
            "title": "Reverse Linked List",
            "description": """Given the head of a singly linked list, reverse the list, and return the reversed list.""",
            "topic": DSATopic.LINKED_LISTS,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, TCS, Odoo",
            "constraints": """- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000""",
            "examples": json.dumps([
                {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]", "explanation": ""}
            ]),
            "starter_code_python": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    # Write your code here
    pass""",
            "starter_code_javascript": """function reverseList(head) {
    // Write your code here
}""",
            "starter_code_cpp": """struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

ListNode* reverseList(ListNode* head) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[1,2,3,4,5]", "expected_output": "[5,4,3,2,1]"},
                {"input": "[1,2]", "expected_output": "[2,1]"}
            ]),
            "solution": "Use three pointers: prev, current, next. Iterate and reverse links.",
            "hints": json.dumps([
                "Use three pointers: previous, current, and next",
                "Iterate through the list reversing the next pointer",
                "Don't forget to handle the edge case of an empty list"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Merge Two Sorted Lists",
            "description": """You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.""",
            "topic": DSATopic.LINKED_LISTS,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, Google, TCS",
            "constraints": """- The number of nodes in both lists is in the range [0, 50].
- -100 <= Node.val <= 100
- Both list1 and list2 are sorted in non-decreasing order.""",
            "examples": json.dumps([
                {"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]", "explanation": ""}
            ]),
            "starter_code_python": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeTwoLists(list1, list2):
    # Write your code here
    pass""",
            "starter_code_javascript": """function mergeTwoLists(list1, list2) {
    // Write your code here
}""",
            "starter_code_cpp": """struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[1,2,4], [1,3,4]", "expected_output": "[1,1,2,3,4,4]"}
            ]),
            "solution": "Use dummy node and two pointers to merge lists.",
            "hints": json.dumps([
                "Create a dummy node to simplify edge cases",
                "Compare values from both lists and attach the smaller one",
                "Don't forget to attach remaining nodes from the non-empty list"
            ]),
            "time_complexity": "O(n + m)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Linked List Cycle",
            "description": """Given head, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.""",
            "topic": DSATopic.LINKED_LISTS,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, TCS, Odoo",
            "constraints": """- The number of the nodes in the list is in the range [0, 10^4].
- -10^5 <= Node.val <= 10^5""",
            "examples": json.dumps([
                {"input": "head = [3,2,0,-4], pos = 1", "output": "true", "explanation": "There is a cycle, tail connects to node index 1."}
            ]),
            "starter_code_python": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def hasCycle(head):
    # Write your code here
    pass""",
            "starter_code_javascript": """function hasCycle(head) {
    // Write your code here
}""",
            "starter_code_cpp": """struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

bool hasCycle(ListNode *head) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[3,2,0,-4], pos=1", "expected_output": "true"},
                {"input": "[1], pos=-1", "expected_output": "false"}
            ]),
            "solution": "Use Floyd's cycle detection (slow and fast pointers).",
            "hints": json.dumps([
                "Use two pointers: slow and fast",
                "Slow moves one step, fast moves two steps",
                "If they meet, there's a cycle"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Remove Nth Node From End of List",
            "description": """Given the head of a linked list, remove the nth node from the end of the list and return its head.""",
            "topic": DSATopic.LINKED_LISTS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, Google, Odoo",
            "constraints": """- The number of nodes in the list is sz.
- 1 <= sz <= 30
- 0 <= Node.val <= 100
- 1 <= n <= sz""",
            "examples": json.dumps([
                {"input": "head = [1,2,3,4,5], n = 2", "output": "[1,2,3,5]", "explanation": ""}
            ]),
            "starter_code_python": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def removeNthFromEnd(head, n):
    # Write your code here
    pass""",
            "starter_code_javascript": """function removeNthFromEnd(head, n) {
    // Write your code here
}""",
            "starter_code_cpp": """struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

ListNode* removeNthFromEnd(ListNode* head, int n) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[1,2,3,4,5], 2", "expected_output": "[1,2,3,5]"}
            ]),
            "solution": "Use two pointers with n gap between them.",
            "hints": json.dumps([
                "Use two pointers with a gap of n nodes",
                "Move both pointers until the fast one reaches the end",
                "The slow pointer will be at the node before the one to remove"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Add Two Numbers",
            "description": """You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.""",
            "topic": DSATopic.LINKED_LISTS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, TCS, Google",
            "constraints": """- The number of nodes in each linked list is in the range [1, 100].
- 0 <= Node.val <= 9
- It is guaranteed that the list represents a number that does not have leading zeros.""",
            "examples": json.dumps([
                {"input": "l1 = [2,4,3], l2 = [5,6,4]", "output": "[7,0,8]", "explanation": "342 + 465 = 807."}
            ]),
            "starter_code_python": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def addTwoNumbers(l1, l2):
    # Write your code here
    pass""",
            "starter_code_javascript": """function addTwoNumbers(l1, l2) {
    // Write your code here
}""",
            "starter_code_cpp": """struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[2,4,3], [5,6,4]", "expected_output": "[7,0,8]"}
            ]),
            "solution": "Traverse both lists, add digits with carry.",
            "hints": json.dumps([
                "Keep track of the carry",
                "Add corresponding digits from both lists",
                "Don't forget to handle different length lists and final carry"
            ]),
            "time_complexity": "O(max(m, n))",
            "space_complexity": "O(max(m, n))"
        },
        # TREES - 5 questions
        {
            "title": "Maximum Depth of Binary Tree",
            "description": """Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.""",
            "topic": DSATopic.TREES,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, TCS, Odoo",
            "constraints": """- The number of nodes in the tree is in the range [0, 10^4].
- -100 <= Node.val <= 100""",
            "examples": json.dumps([
                {"input": "root = [3,9,20,null,null,15,7]", "output": "3", "explanation": ""}
            ]),
            "starter_code_python": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def maxDepth(root):
    # Write your code here
    pass""",
            "starter_code_javascript": """function maxDepth(root) {
    // Write your code here
}""",
            "starter_code_cpp": """struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

int maxDepth(TreeNode* root) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[3,9,20,null,null,15,7]", "expected_output": "3"}
            ]),
            "solution": "Use recursion: max depth = 1 + max(left depth, right depth).",
            "hints": json.dumps([
                "Think recursively",
                "Base case: if root is null, return 0",
                "Recursive case: 1 + max(left subtree depth, right subtree depth)"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(h)"
        },
        {
            "title": "Invert Binary Tree",
            "description": """Given the root of a binary tree, invert the tree, and return its root.""",
            "topic": DSATopic.TREES,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, Google, TCS",
            "constraints": """- The number of nodes in the tree is in the range [0, 100].
- -100 <= Node.val <= 100""",
            "examples": json.dumps([
                {"input": "root = [4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]", "explanation": ""}
            ]),
            "starter_code_python": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def invertTree(root):
    # Write your code here
    pass""",
            "starter_code_javascript": """function invertTree(root) {
    // Write your code here
}""",
            "starter_code_cpp": """struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

TreeNode* invertTree(TreeNode* root) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[4,2,7,1,3,6,9]", "expected_output": "[4,7,2,9,6,3,1]"}
            ]),
            "solution": "Recursively swap left and right children.",
            "hints": json.dumps([
                "Think recursively",
                "Swap the left and right children",
                "Recursively invert the left and right subtrees"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(h)"
        },
        {
            "title": "Same Tree",
            "description": """Given the roots of two binary trees p and q, write a function to check if they are the same or not.

Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.""",
            "topic": DSATopic.TREES,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, Odoo, TCS",
            "constraints": """- The number of nodes in both trees is in the range [0, 100].
- -10^4 <= Node.val <= 10^4""",
            "examples": json.dumps([
                {"input": "p = [1,2,3], q = [1,2,3]", "output": "true", "explanation": ""}
            ]),
            "starter_code_python": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def isSameTree(p, q):
    # Write your code here
    pass""",
            "starter_code_javascript": """function isSameTree(p, q) {
    // Write your code here
}""",
            "starter_code_cpp": """struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

bool isSameTree(TreeNode* p, TreeNode* q) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[1,2,3], [1,2,3]", "expected_output": "true"},
                {"input": "[1,2], [1,null,2]", "expected_output": "false"}
            ]),
            "solution": "Recursively compare nodes and their children.",
            "hints": json.dumps([
                "Check if both nodes are null (base case)",
                "Check if one is null and other isn't",
                "Check if values are equal and recursively check left and right subtrees"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(h)"
        },
        {
            "title": "Binary Tree Level Order Traversal",
            "description": """Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).""",
            "topic": DSATopic.TREES,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, Google, Odoo",
            "constraints": """- The number of nodes in the tree is in the range [0, 2000].
- -1000 <= Node.val <= 1000""",
            "examples": json.dumps([
                {"input": "root = [3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]", "explanation": ""}
            ]),
            "starter_code_python": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def levelOrder(root):
    # Write your code here
    pass""",
            "starter_code_javascript": """function levelOrder(root) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

vector<vector<int>> levelOrder(TreeNode* root) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[3,9,20,null,null,15,7]", "expected_output": "[[3],[9,20],[15,7]]"}
            ]),
            "solution": "Use BFS with a queue to traverse level by level.",
            "hints": json.dumps([
                "Use a queue for BFS traversal",
                "Process nodes level by level",
                "Keep track of the number of nodes at each level"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(n)"
        },
        {
            "title": "Validate Binary Search Tree",
            "description": """Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- Both the left and right subtrees must also be binary search trees.""",
            "topic": DSATopic.TREES,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, TCS, Google",
            "constraints": """- The number of nodes in the tree is in the range [1, 10^4].
- -2^31 <= Node.val <= 2^31 - 1""",
            "examples": json.dumps([
                {"input": "root = [2,1,3]", "output": "true", "explanation": ""},
                {"input": "root = [5,1,4,null,null,3,6]", "output": "false", "explanation": "The root node's value is 5 but its right child's value is 4."}
            ]),
            "starter_code_python": """class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def isValidBST(root):
    # Write your code here
    pass""",
            "starter_code_javascript": """function isValidBST(root) {
    // Write your code here
}""",
            "starter_code_cpp": """struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

bool isValidBST(TreeNode* root) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[2,1,3]", "expected_output": "true"},
                {"input": "[5,1,4,null,null,3,6]", "expected_output": "false"}
            ]),
            "solution": "Use recursion with min and max bounds for each node.",
            "hints": json.dumps([
                "Use recursion with valid range for each node",
                "Left subtree values must be less than current node",
                "Right subtree values must be greater than current node"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(h)"
        }
    ]
    
    return questions


def seed_database():
    """Seed the database with DSA questions"""
    db = SessionLocal()
    
    try:
        # Check if questions already exist
        existing_count = db.query(DSAProblem).count()
        
        if existing_count > 0:
            print(f"⚠️  Database already has {existing_count} questions.")
            response = input("Do you want to add more questions? (y/n): ")
            if response.lower() != 'y':
                print("❌ Seeding cancelled.")
                return
        
        questions = create_seed_questions()
        added_count = 0
        
        print(f"\n🌱 Starting to seed {len(questions)} DSA questions...")
        
        for q_data in questions:
            # Check if question already exists
            existing = db.query(DSAProblem).filter(
                DSAProblem.title == q_data["title"]
            ).first()
            
            if existing:
                print(f"⏭️  Skipping '{q_data['title']}' (already exists)")
                continue
            
            # Create new question
            question = DSAProblem(**q_data)
            db.add(question)
            added_count += 1
            print(f"✅ Added: {q_data['title']} ({q_data['topic'].value}, {q_data['difficulty'].value})")
        
        db.commit()
        
        print(f"\n🎉 Successfully added {added_count} new questions!")
        print(f"📊 Total questions in database: {db.query(DSAProblem).count()}")
        
        # Show breakdown by topic
        print("\n📈 Questions by topic:")
        for topic in DSATopic:
            count = db.query(DSAProblem).filter(DSAProblem.topic == topic).count()
            if count > 0:
                print(f"   {topic.value}: {count} questions")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("DSA Questions Seeder")
    print("=" * 60)
    seed_database()
