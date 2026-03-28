"""
Fix Graph Problems with Proper Examples and Test Cases
"""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import DSAProblem

# Proper graph problem examples
GRAPH_EXAMPLES = {
    "Number of Islands": {
        "examples": [
            {
                "input": 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]',
                "output": "2",
                "explanation": "There are 2 islands: one in top-left and one in bottom-right"
            },
            {
                "input": 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]',
                "output": "1",
                "explanation": "All 1s are connected, forming a single island"
            }
        ],
        "test_cases": [
            {"input": '[[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]', "expected_output": "2"},
            {"input": '[[\"1\",\"1\",\"1\"],[\"0\",\"1\",\"0\"],[\"1\",\"1\",\"1\"]]', "expected_output": "1"}
        ]
    },
    
    "Clone Graph": {
        "examples": [
            {
                "input": "adjList = [[2,4],[1,3],[2,4],[1,3]]",
                "output": "[[2,4],[1,3],[2,4],[1,3]]",
                "explanation": "Graph with 4 nodes connected in a square pattern"
            },
            {
                "input": "adjList = [[]]",
                "output": "[[]]",
                "explanation": "Single node with no neighbors"
            }
        ],
        "test_cases": [
            {"input": "[[2,4],[1,3],[2,4],[1,3]]", "expected_output": "[[2,4],[1,3],[2,4],[1,3]]"},
            {"input": "[[]]", "expected_output": "[[]]"}
        ]
    },
    
    "Course Schedule": {
        "examples": [
            {
                "input": "numCourses = 2, prerequisites = [[1,0]]",
                "output": "true",
                "explanation": "Take course 0 first, then course 1"
            },
            {
                "input": "numCourses = 2, prerequisites = [[1,0],[0,1]]",
                "output": "false",
                "explanation": "Circular dependency - impossible to complete"
            }
        ],
        "test_cases": [
            {"input": "2, [[1,0]]", "expected_output": "true"},
            {"input": "2, [[1,0],[0,1]]", "expected_output": "false"},
            {"input": "3, [[1,0],[2,1]]", "expected_output": "true"}
        ]
    },
    
    "Course Schedule II": {
        "examples": [
            {
                "input": "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
                "output": "[0,1,2,3]",
                "explanation": "Valid order: 0 → 1 → 2 → 3"
            },
            {
                "input": "numCourses = 2, prerequisites = [[1,0]]",
                "output": "[0,1]",
                "explanation": "Take course 0 first, then course 1"
            }
        ],
        "test_cases": [
            {"input": "4, [[1,0],[2,0],[3,1],[3,2]]", "expected_output": "[0,1,2,3]"},
            {"input": "2, [[1,0]]", "expected_output": "[0,1]"}
        ]
    },
    
    "Find Center of Star Graph": {
        "examples": [
            {
                "input": "edges = [[1,2],[2,3],[4,2]]",
                "output": "2",
                "explanation": "Node 2 is connected to all other nodes"
            },
            {
                "input": "edges = [[1,2],[5,1],[1,3],[1,4]]",
                "output": "1",
                "explanation": "Node 1 is the center of the star"
            }
        ],
        "test_cases": [
            {"input": "[[1,2],[2,3],[4,2]]", "expected_output": "2"},
            {"input": "[[1,2],[5,1],[1,3],[1,4]]", "expected_output": "1"}
        ]
    },
    
    "Find if Path Exists in Graph": {
        "examples": [
            {
                "input": "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2",
                "output": "true",
                "explanation": "Path exists: 0 → 1 → 2"
            },
            {
                "input": "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5",
                "output": "false",
                "explanation": "No path from 0 to 5"
            }
        ],
        "test_cases": [
            {"input": "3, [[0,1],[1,2],[2,0]], 0, 2", "expected_output": "true"},
            {"input": "6, [[0,1],[0,2],[3,5],[5,4],[4,3]], 0, 5", "expected_output": "false"}
        ]
    },
    
    "Find Town Judge": {
        "examples": [
            {
                "input": "n = 2, trust = [[1,2]]",
                "output": "2",
                "explanation": "Person 2 is trusted by person 1"
            },
            {
                "input": "n = 3, trust = [[1,3],[2,3]]",
                "output": "3",
                "explanation": "Person 3 is trusted by everyone"
            }
        ],
        "test_cases": [
            {"input": "2, [[1,2]]", "expected_output": "2"},
            {"input": "3, [[1,3],[2,3]]", "expected_output": "3"},
            {"input": "3, [[1,3],[2,3],[3,1]]", "expected_output": "-1"}
        ]
    },
    
    "Minimum Height Trees": {
        "examples": [
            {
                "input": "n = 4, edges = [[1,0],[1,2],[1,3]]",
                "output": "[1]",
                "explanation": "Node 1 is the center, giving minimum height of 1"
            },
            {
                "input": "n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]",
                "output": "[3,4]",
                "explanation": "Nodes 3 and 4 both give minimum height of 2"
            }
        ],
        "test_cases": [
            {"input": "4, [[1,0],[1,2],[1,3]]", "expected_output": "[1]"},
            {"input": "6, [[3,0],[3,1],[3,2],[3,4],[5,4]]", "expected_output": "[3,4]"},
            {"input": "1, []", "expected_output": "[0]"}
        ]
    },
    
    "Graph Valid Tree": {
        "examples": [
            {
                "input": "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]",
                "output": "true",
                "explanation": "Connected graph with no cycles"
            },
            {
                "input": "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]",
                "output": "false",
                "explanation": "Contains a cycle: 1-2-3-1"
            }
        ],
        "test_cases": [
            {"input": "5, [[0,1],[0,2],[0,3],[1,4]]", "expected_output": "true"},
            {"input": "5, [[0,1],[1,2],[2,3],[1,3],[1,4]]", "expected_output": "false"}
        ]
    },
    
    "Pacific Atlantic Water Flow": {
        "examples": [
            {
                "input": "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
                "output": "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
                "explanation": "Cells where water can flow to both oceans"
            }
        ],
        "test_cases": [
            {"input": "[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]", "expected_output": "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]"}
        ]
    },
    
    "Redundant Connection": {
        "examples": [
            {
                "input": "edges = [[1,2],[1,3],[2,3]]",
                "output": "[2,3]",
                "explanation": "Removing edge [2,3] breaks the cycle"
            },
            {
                "input": "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]",
                "output": "[1,4]",
                "explanation": "Removing edge [1,4] breaks the cycle"
            }
        ],
        "test_cases": [
            {"input": "[[1,2],[1,3],[2,3]]", "expected_output": "[2,3]"},
            {"input": "[[1,2],[2,3],[3,4],[1,4],[1,5]]", "expected_output": "[1,4]"}
        ]
    },
    
    "Keys and Rooms": {
        "examples": [
            {
                "input": "rooms = [[1],[2],[3],[]]",
                "output": "true",
                "explanation": "Start in room 0, get key to room 1, then 2, then 3"
            },
            {
                "input": "rooms = [[1,3],[3,0,1],[2],[0]]",
                "output": "false",
                "explanation": "Cannot reach room 2"
            }
        ],
        "test_cases": [
            {"input": "[[1],[2],[3],[]]", "expected_output": "true"},
            {"input": "[[1,3],[3,0,1],[2],[0]]", "expected_output": "false"}
        ]
    }
}


def fix_graph_problems(db: Session):
    """Fix graph problems with proper examples"""
    print("=" * 80)
    print("🔧 FIXING GRAPH PROBLEMS")
    print("=" * 80)
    print()
    
    graph_problems = db.query(DSAProblem).filter(DSAProblem.topic == 'graphs').all()
    
    print(f"Total graph problems: {len(graph_problems)}")
    print()
    
    fixed = 0
    skipped = 0
    
    for problem in graph_problems:
        title = problem.title
        
        if title in GRAPH_EXAMPLES:
            data = GRAPH_EXAMPLES[title]
            
            # Update examples
            problem.examples = json.dumps(data['examples'])
            
            # Update test cases
            problem.test_cases = json.dumps(data['test_cases'])
            
            fixed += 1
            print(f"✅ Fixed: {title}")
        else:
            skipped += 1
            print(f"⏭️  Skipped: {title} (no data)")
    
    db.commit()
    
    print()
    print("=" * 80)
    print("🎉 COMPLETE!")
    print("=" * 80)
    print(f"✅ Fixed: {fixed}")
    print(f"⏭️  Skipped: {skipped}")
    print(f"📊 Total: {len(graph_problems)}")
    print("=" * 80)


if __name__ == "__main__":
    db = SessionLocal()
    try:
        fix_graph_problems(db)
    finally:
        db.close()
