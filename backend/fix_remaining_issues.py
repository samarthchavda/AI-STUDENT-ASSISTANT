"""
Fix remaining naming issues:
1. Merge 'Time and Work' and 'Time And Work'
2. Convert 'sql' to 'SQL'
3. Convert 'networking' to 'Networking'
"""
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def fix_remaining_issues():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    try:
        print("=== FIXING REMAINING ISSUES ===\n")
        
        # 1. Merge 'Time And Work' into 'Time and Work'
        print("1. Merging 'Time And Work' → 'Time and Work'")
        cur.execute("""
            UPDATE aptitude_practice_questions
            SET subcategory = 'Time and Work'
            WHERE subcategory = 'Time And Work'
        """)
        print(f"   ✅ Updated {cur.rowcount} records\n")
        
        # 2. Convert 'sql' to 'SQL'
        print("2. Converting 'sql' → 'SQL'")
        cur.execute("""
            UPDATE aptitude_practice_questions
            SET subcategory = 'SQL'
            WHERE subcategory = 'sql'
        """)
        print(f"   ✅ Updated {cur.rowcount} records\n")
        
        # 3. Convert 'networking' to 'Networking'
        print("3. Converting 'networking' → 'Networking'")
        cur.execute("""
            UPDATE aptitude_practice_questions
            SET subcategory = 'Networking'
            WHERE subcategory = 'networking'
        """)
        print(f"   ✅ Updated {cur.rowcount} records\n")
        
        # Commit the changes
        conn.commit()
        
        # Show the final state
        print("=== FINAL DATABASE STATE ===\n")
        cur.execute("""
            SELECT category, subcategory, COUNT(*) as count
            FROM aptitude_practice_questions
            GROUP BY category, subcategory
            ORDER BY category, subcategory
        """)
        
        results = cur.fetchall()
        current_category = None
        total_questions = 0
        
        for category, subcategory, count in results:
            if category != current_category:
                print(f"\n{category}:")
                current_category = category
            print(f"  - {subcategory}: {count} questions")
            total_questions += count
        
        print(f"\n\n📊 Total: {total_questions} questions across {len(results)} subcategories")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    fix_remaining_issues()
