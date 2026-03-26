"""
Fix subcategory naming inconsistencies in the database.
Converts all kebab-case subcategories to Title Case format.
"""
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def title_case_from_kebab(kebab_str):
    """Convert kebab-case to Title Case"""
    return ' '.join(word.capitalize() for word in kebab_str.split('-'))

def fix_subcategory_naming():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    try:
        # Get all unique subcategories
        cur.execute("""
            SELECT DISTINCT subcategory, COUNT(*) as count
            FROM aptitude_practice_questions
            GROUP BY subcategory
            ORDER BY subcategory
        """)
        
        subcategories = cur.fetchall()
        
        print("=== FIXING SUBCATEGORY NAMING ===\n")
        
        updates_made = 0
        
        for subcategory, count in subcategories:
            # Check if it's kebab-case (contains hyphens)
            if '-' in subcategory:
                new_name = title_case_from_kebab(subcategory)
                
                # Check if the Title Case version already exists
                cur.execute("""
                    SELECT COUNT(*) FROM aptitude_practice_questions
                    WHERE subcategory = %s
                """, (new_name,))
                
                existing_count = cur.fetchone()[0]
                
                if existing_count > 0:
                    print(f"⚠️  Merging: '{subcategory}' ({count}) → '{new_name}' (already has {existing_count})")
                else:
                    print(f"✅ Converting: '{subcategory}' ({count}) → '{new_name}'")
                
                # Update the subcategory name
                cur.execute("""
                    UPDATE aptitude_practice_questions
                    SET subcategory = %s
                    WHERE subcategory = %s
                """, (new_name, subcategory))
                
                updates_made += cur.rowcount
        
        # Commit the changes
        conn.commit()
        
        print(f"\n✅ Successfully updated {updates_made} records")
        
        # Show the new state
        print("\n=== UPDATED CATEGORIES ===\n")
        cur.execute("""
            SELECT category, subcategory, COUNT(*) as count
            FROM aptitude_practice_questions
            GROUP BY category, subcategory
            ORDER BY category, subcategory
        """)
        
        results = cur.fetchall()
        current_category = None
        
        for category, subcategory, count in results:
            if category != current_category:
                print(f"\n{category}:")
                current_category = category
            print(f"  - {subcategory}: {count} questions")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    fix_subcategory_naming()
