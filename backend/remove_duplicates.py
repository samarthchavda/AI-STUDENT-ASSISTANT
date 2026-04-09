"""
Remove duplicate questions from database
Keeps the first occurrence of each unique question
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def main():
    print("=" * 60)
    print("REMOVING DUPLICATE QUESTIONS")
    print("=" * 60)
    
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    # Get initial count
    print("\n1. Checking current state...")
    cur.execute("SELECT COUNT(*) FROM aptitude_practice_questions")
    initial_count = cur.fetchone()[0]
    print(f"✓ Current total: {initial_count:,} questions")
    
    # Find duplicates
    print("\n2. Finding duplicates...")
    cur.execute("""
        SELECT question, COUNT(*) as cnt
        FROM aptitude_practice_questions 
        GROUP BY question 
        HAVING COUNT(*) > 1
    """)
    duplicate_groups = cur.fetchall()
    print(f"✓ Found {len(duplicate_groups)} duplicate question texts")
    
    # Calculate total duplicates to remove
    total_to_remove = sum(cnt - 1 for _, cnt in duplicate_groups)
    print(f"✓ Will remove {total_to_remove:,} duplicate records")
    
    # Remove duplicates - keep the one with lowest id (first inserted)
    print("\n3. Removing duplicates...")
    cur.execute("""
        DELETE FROM aptitude_practice_questions
        WHERE id IN (
            SELECT id
            FROM (
                SELECT id,
                       ROW_NUMBER() OVER (PARTITION BY question ORDER BY id) as rn
                FROM aptitude_practice_questions
            ) t
            WHERE rn > 1
        )
    """)
    
    deleted_count = cur.rowcount
    conn.commit()
    print(f"✓ Deleted {deleted_count:,} duplicate records")
    
    # Get final count
    print("\n4. Verifying results...")
    cur.execute("SELECT COUNT(*) FROM aptitude_practice_questions")
    final_count = cur.fetchone()[0]
    print(f"✓ Final total: {final_count:,} questions")
    
    # Check for remaining duplicates
    cur.execute("""
        SELECT COUNT(*)
        FROM (
            SELECT question, COUNT(*) as cnt
            FROM aptitude_practice_questions 
            GROUP BY question 
            HAVING COUNT(*) > 1
        ) subq
    """)
    remaining_dupes = cur.fetchone()[0]
    
    if remaining_dupes == 0:
        print("✓ No duplicates remaining!")
    else:
        print(f"⚠️  Still {remaining_dupes} duplicate groups found")
    
    # Show final distribution
    print("\n5. Final distribution by category:")
    cur.execute("""
        SELECT category, COUNT(*) 
        FROM aptitude_practice_questions 
        GROUP BY category 
        ORDER BY COUNT(*) DESC
    """)
    for cat, cnt in cur.fetchall():
        print(f"   {cat}: {cnt:,}")
    
    print("\n" + "=" * 60)
    print("✅ DUPLICATE REMOVAL COMPLETE")
    print("=" * 60)
    print(f"Removed: {deleted_count:,} duplicates")
    print(f"Remaining: {final_count:,} unique questions")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
