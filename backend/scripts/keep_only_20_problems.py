"""
Keep Only 20 Best Problems - Clean Database
Removes all problems except the top 20 curated ones
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import DSAProblem

# Top 20 curated problems (most popular interview questions)
TOP_20_PROBLEMS = [
    "Two Sum",
    "Best Time to Buy and Sell Stock",
    "Contains Duplicate",
    "Maximum Subarray",
    "Product of Array Except Self",
    "Valid Anagram",
    "Valid Parentheses",
    "Longest Substring Without Repeating Characters",
    "Longest Palindromic Substring",
    "Group Anagrams",
    "Reverse Linked List",
    "Merge Two Sorted Lists",
    "Linked List Cycle",
    "Maximum Depth of Binary Tree",
    "Invert Binary Tree",
    "Binary Tree Level Order Traversal",
    "Validate Binary Search Tree",
    "Climbing Stairs",
    "House Robber",
    "Coin Change"
]


def keep_only_20(db: Session):
    """
    Delete all problems except the top 20
    """
    print("=" * 80)
    print("🧹 CLEANING DATABASE - KEEP ONLY 20 PROBLEMS")
    print("=" * 80)
    
    # Get current count
    total_before = db.query(DSAProblem).count()
    print(f"📊 Current problems in database: {total_before}")
    print()
    
    # Delete all problems NOT in the top 20 list
    deleted = db.query(DSAProblem).filter(
        ~DSAProblem.title.in_(TOP_20_PROBLEMS)
    ).delete(synchronize_session=False)
    
    db.commit()
    
    # Get new count
    total_after = db.query(DSAProblem).count()
    
    print(f"✅ Deleted: {deleted} problems")
    print(f"📊 Remaining: {total_after} problems")
    print()
    
    # Show remaining problems
    print("=" * 80)
    print("📝 REMAINING PROBLEMS:")
    print("=" * 80)
    
    problems = db.query(DSAProblem).order_by(DSAProblem.topic, DSAProblem.difficulty).all()
    
    for idx, problem in enumerate(problems, 1):
        difficulty_emoji = {"easy": "🟢", "medium": "🟡", "hard": "🔴"}.get(problem.difficulty, "⚪")
        print(f"{idx:2d}. {difficulty_emoji} {problem.title:45s} ({problem.topic})")
    
    print()
    print("=" * 80)
    print("🎉 CLEANUP COMPLETE!")
    print("=" * 80)
    print(f"✅ Database now has exactly {total_after} problems")
    print("💡 All 20 problems will show in frontend (no pagination needed)")
    print("=" * 80)


if __name__ == "__main__":
    db = SessionLocal()
    try:
        # Confirm before deletion
        print("\n⚠️  WARNING: This will delete all problems except the top 20!")
        response = input("Continue? (yes/no): ")
        
        if response.lower() == 'yes':
            keep_only_20(db)
        else:
            print("❌ Cancelled")
    finally:
        db.close()
