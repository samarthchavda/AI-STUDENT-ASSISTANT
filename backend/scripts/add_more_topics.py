"""
Add questions for additional DSA topics
Run this to expand the question bank beyond the initial 20 questions
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from app.core.database import SessionLocal
from app.models import DSAProblem, DSATopic, DifficultyLevel

def create_additional_questions():
    """Create questions for graphs, dynamic programming, and other topics"""
    
    questions = [
        # GRAPHS - 3 questions
        {
            "title": "Number of Islands",
            "description": """Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.""",
            "topic": DSATopic.GRAPHS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, TCS, Google",
            "constraints": """- m == grid.length
- n == grid[i].length
- 1 <= m, n <= 300
- grid[i][j] is '0' or '1'.""",
            "examples": json.dumps([
                {"input": "grid = [['1','1','0'],['1','1','0'],['0','0','1']]", "output": "2", "explanation": ""}
            ]),
            "starter_code_python": """def numIslands(grid):
    # Write your code here
    pass""",
            "starter_code_javascript": """function numIslands(grid) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

int numIslands(vector<vector<char>>& grid) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[['1','1','0'],['1','1','0'],['0','0','1']]", "expected_output": "2"}
            ]),
            "solution": "Use DFS or BFS to mark visited islands.",
            "hints": json.dumps([
                "Use DFS or BFS to explore each island",
                "Mark visited cells to avoid counting them again",
                "Count how many times you start a new DFS/BFS"
            ]),
            "time_complexity": "O(m * n)",
            "space_complexity": "O(m * n)"
        },
        {
            "title": "Clone Graph",
            "description": """Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.""",
            "topic": DSATopic.GRAPHS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, Odoo, TCS",
            "constraints": """- The number of nodes in the graph is in the range [0, 100].
- 1 <= Node.val <= 100""",
            "examples": json.dumps([
                {"input": "adjList = [[2,4],[1,3],[2,4],[1,3]]", "output": "[[2,4],[1,3],[2,4],[1,3]]", "explanation": ""}
            ]),
            "starter_code_python": """class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def cloneGraph(node):
    # Write your code here
    pass""",
            "starter_code_javascript": """function cloneGraph(node) {
    // Write your code here
}""",
            "starter_code_cpp": """class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node(int _val) : val(_val) {}
};

Node* cloneGraph(Node* node) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[[2,4],[1,3],[2,4],[1,3]]", "expected_output": "[[2,4],[1,3],[2,4],[1,3]]"}
            ]),
            "solution": "Use DFS/BFS with a hash map to track cloned nodes.",
            "hints": json.dumps([
                "Use a hash map to store original -> clone mapping",
                "Use DFS or BFS to traverse the graph",
                "Clone each node and its neighbors recursively"
            ]),
            "time_complexity": "O(N + E)",
            "space_complexity": "O(N)"
        },
        {
            "title": "Course Schedule",
            "description": """There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.

Return true if you can finish all courses. Otherwise, return false.""",
            "topic": DSATopic.GRAPHS,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, Google, TCS",
            "constraints": """- 1 <= numCourses <= 2000
- 0 <= prerequisites.length <= 5000""",
            "examples": json.dumps([
                {"input": "numCourses = 2, prerequisites = [[1,0]]", "output": "true", "explanation": "Take course 0, then course 1."}
            ]),
            "starter_code_python": """def canFinish(numCourses, prerequisites):
    # Write your code here
    pass""",
            "starter_code_javascript": """function canFinish(numCourses, prerequisites) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "2, [[1,0]]", "expected_output": "true"},
                {"input": "2, [[1,0],[0,1]]", "expected_output": "false"}
            ]),
            "solution": "Detect cycle in directed graph using DFS or topological sort.",
            "hints": json.dumps([
                "This is a cycle detection problem in a directed graph",
                "Use DFS with three states: unvisited, visiting, visited",
                "If you encounter a node in 'visiting' state, there's a cycle"
            ]),
            "time_complexity": "O(V + E)",
            "space_complexity": "O(V + E)"
        },
        # DYNAMIC PROGRAMMING - 3 questions
        {
            "title": "Climbing Stairs",
            "description": """You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?""",
            "topic": DSATopic.DYNAMIC_PROGRAMMING,
            "difficulty": DifficultyLevel.EASY,
            "company": "Amazon, TCS, Odoo",
            "constraints": """- 1 <= n <= 45""",
            "examples": json.dumps([
                {"input": "n = 2", "output": "2", "explanation": "1+1 or 2"},
                {"input": "n = 3", "output": "3", "explanation": "1+1+1, 1+2, or 2+1"}
            ]),
            "starter_code_python": """def climbStairs(n):
    # Write your code here
    pass""",
            "starter_code_javascript": """function climbStairs(n) {
    // Write your code here
}""",
            "starter_code_cpp": """int climbStairs(int n) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "2", "expected_output": "2"},
                {"input": "3", "expected_output": "3"}
            ]),
            "solution": "Use dynamic programming: dp[i] = dp[i-1] + dp[i-2]",
            "hints": json.dumps([
                "This is similar to Fibonacci sequence",
                "To reach step i, you can come from step i-1 or i-2",
                "Use dynamic programming or optimize to O(1) space"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        {
            "title": "House Robber",
            "description": """You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.

Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.""",
            "topic": DSATopic.DYNAMIC_PROGRAMMING,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, Google, Odoo",
            "constraints": """- 1 <= nums.length <= 100
- 0 <= nums[i] <= 400""",
            "examples": json.dumps([
                {"input": "nums = [1,2,3,1]", "output": "4", "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4."}
            ]),
            "starter_code_python": """def rob(nums):
    # Write your code here
    pass""",
            "starter_code_javascript": """function rob(nums) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

int rob(vector<int>& nums) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[1,2,3,1]", "expected_output": "4"},
                {"input": "[2,7,9,3,1]", "expected_output": "12"}
            ]),
            "solution": "Use DP: max(rob current + dp[i-2], skip current = dp[i-1])",
            "hints": json.dumps([
                "For each house, you have two choices: rob it or skip it",
                "If you rob current house, you can't rob previous house",
                "Use dynamic programming to track maximum at each position"
            ]),
            "time_complexity": "O(n)",
            "space_complexity": "O(1)"
        },
        {
            "title": "Coin Change",
            "description": """You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.""",
            "topic": DSATopic.DYNAMIC_PROGRAMMING,
            "difficulty": DifficultyLevel.MEDIUM,
            "company": "Amazon, TCS, Google",
            "constraints": """- 1 <= coins.length <= 12
- 1 <= coins[i] <= 2^31 - 1
- 0 <= amount <= 10^4""",
            "examples": json.dumps([
                {"input": "coins = [1,2,5], amount = 11", "output": "3", "explanation": "11 = 5 + 5 + 1"}
            ]),
            "starter_code_python": """def coinChange(coins, amount):
    # Write your code here
    pass""",
            "starter_code_javascript": """function coinChange(coins, amount) {
    // Write your code here
}""",
            "starter_code_cpp": """#include <vector>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    // Write your code here
}""",
            "test_cases": json.dumps([
                {"input": "[1,2,5], 11", "expected_output": "3"},
                {"input": "[2], 3", "expected_output": "-1"}
            ]),
            "solution": "Use DP: dp[i] = min(dp[i], dp[i-coin] + 1) for each coin",
            "hints": json.dumps([
                "Use dynamic programming with bottom-up approach",
                "dp[i] represents minimum coins needed for amount i",
                "For each amount, try using each coin and take minimum"
            ]),
            "time_complexity": "O(amount * coins)",
            "space_complexity": "O(amount)"
        }
    ]
    
    return questions


def seed_additional_topics():
    """Add questions for graphs and dynamic programming"""
    db = SessionLocal()
    
    try:
        questions = create_additional_questions()
        added_count = 0
        
        print(f"\n🌱 Adding {len(questions)} questions for Graphs and Dynamic Programming...")
        
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
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Add More DSA Topics")
    print("=" * 60)
    seed_additional_topics()
