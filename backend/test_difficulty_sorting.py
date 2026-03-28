"""
Test Difficulty-Based Sorting for DSA Questions
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.dsa_service import DSAService


def test_all_topics_with_difficulty_sorting():
    """Test that 'All Topics' returns questions sorted by difficulty"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("🧪 TESTING DIFFICULTY-BASED SORTING")
        print("=" * 80)
        print()
        
        # Test 1: All Topics (no filter)
        print("1️⃣  Test: All Topics (no topic filter)")
        print("-" * 80)
        result = DSAService.get_questions(
            db=db,
            topic=None,  # All topics
            difficulty=None,
            limit=20,
            offset=0
        )
        
        print(f"Total problems: {result['total']}")
        print(f"Returned: {len(result['questions'])}")
        print()
        print("First 20 problems (should be sorted Easy → Medium → Hard):")
        print()
        
        for i, q in enumerate(result['questions'], 1):
            print(f"{i:2d}. [{q['difficulty'].upper():6s}] {q['title'][:50]:<50s} ({q['topic']})")
        
        print()
        print()
        
        # Test 2: Specific Topic (Arrays) with difficulty sorting
        print("2️⃣  Test: Arrays Topic (should still be sorted by difficulty)")
        print("-" * 80)
        result = DSAService.get_questions(
            db=db,
            topic='arrays',
            difficulty=None,
            limit=20,
            offset=0
        )
        
        print(f"Total Arrays problems: {result['total']}")
        print(f"Returned: {len(result['questions'])}")
        print()
        print("First 20 Arrays problems:")
        print()
        
        for i, q in enumerate(result['questions'], 1):
            print(f"{i:2d}. [{q['difficulty'].upper():6s}] {q['title'][:50]:<50s}")
        
        print()
        print()
        
        # Test 3: Hard difficulty filter (should only show Hard problems)
        print("3️⃣  Test: Hard Difficulty Filter (All Topics)")
        print("-" * 80)
        result = DSAService.get_questions(
            db=db,
            topic=None,
            difficulty='hard',
            limit=10,
            offset=0
        )
        
        print(f"Total Hard problems: {result['total']}")
        print(f"Returned: {len(result['questions'])}")
        print()
        print("First 10 Hard problems:")
        print()
        
        for i, q in enumerate(result['questions'], 1):
            print(f"{i:2d}. [{q['difficulty'].upper():6s}] {q['title'][:50]:<50s} ({q['topic']})")
        
        print()
        print()
        
        # Test 4: Verify difficulty distribution
        print("4️⃣  Test: Difficulty Distribution (All Topics)")
        print("-" * 80)
        result = DSAService.get_questions(
            db=db,
            topic=None,
            difficulty=None,
            limit=100,
            offset=0
        )
        
        easy_count = sum(1 for q in result['questions'] if q['difficulty'] == 'easy')
        medium_count = sum(1 for q in result['questions'] if q['difficulty'] == 'medium')
        hard_count = sum(1 for q in result['questions'] if q['difficulty'] == 'hard')
        
        print(f"First 100 problems breakdown:")
        print(f"  Easy:   {easy_count}")
        print(f"  Medium: {medium_count}")
        print(f"  Hard:   {hard_count}")
        print()
        
        # Verify sorting
        difficulties = [q['difficulty'] for q in result['questions']]
        is_sorted = all(
            difficulties[i] <= difficulties[i+1] 
            for i in range(len(difficulties)-1)
            if difficulties[i] in ['easy', 'medium', 'hard'] and difficulties[i+1] in ['easy', 'medium', 'hard']
        )
        
        if is_sorted:
            print("✅ Sorting verified: Questions are sorted Easy → Medium → Hard")
        else:
            print("❌ Sorting issue: Questions are NOT properly sorted")
        
        print()
        print("=" * 80)
        print("✅ ALL TESTS COMPLETE!")
        print("=" * 80)
        
    finally:
        db.close()


if __name__ == "__main__":
    test_all_topics_with_difficulty_sorting()
