"""
Super fast import using execute_values for bulk insert
"""
import json
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv
import hashlib
import uuid

load_dotenv()

def generate_hash(question_text, answer):
    """Generate unique hash for question"""
    content = f"{question_text}{answer}"
    return hashlib.md5(content.encode()).hexdigest()

def main():
    print("=" * 60)
    print("SUPER FAST IMPORT - REMAINING QUESTIONS")
    print("=" * 60)
    
    # Load questions
    print("\n1. Loading questions...")
    with open('aptitude_practice_questions_cleaned_same_format.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    print(f"✓ Loaded {len(questions)} questions")
    
    # Connect to database
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    # Check existing
    print("\n2. Checking existing questions...")
    cur.execute("SELECT hash FROM aptitude_practice_questions")
    existing_hashes = set(row[0] for row in cur.fetchall())
    print(f"✓ Found {len(existing_hashes)} existing questions")
    
    # Prepare new questions
    print("\n3. Preparing new questions...")
    values_list = []
    
    for q in questions:
        q_hash = generate_hash(q['question'], q['answer'])
        if q_hash not in existing_hashes:
            values_list.append((
                str(uuid.uuid4()),
                q['question'],
                q.get('image'),
                q.get('has_image', False),
                json.dumps(q['options']),
                q['answer'],
                q['explanation'],
                q['category'],
                q['subcategory'],
                q['difficulty'],
                json.dumps(q.get('tags', [])),
                q.get('source'),
                q_hash
            ))
    
    print(f"✓ Prepared {len(values_list)} new questions")
    
    if len(values_list) == 0:
        print("\n✓ All questions already imported!")
        cur.close()
        conn.close()
        return
    
    # Bulk insert in chunks
    print("\n4. Bulk inserting...")
    chunk_size = 500
    imported = 0
    
    for i in range(0, len(values_list), chunk_size):
        chunk = values_list[i:i+chunk_size]
        
        try:
            execute_values(
                cur,
                """
                INSERT INTO aptitude_practice_questions 
                (id, question, image, has_image, options, answer, explanation, 
                 category, subcategory, difficulty, tags, source, hash)
                VALUES %s
                ON CONFLICT (hash) DO NOTHING
                """,
                chunk,
                template="(%s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s, %s, %s::jsonb, %s, %s)"
            )
            conn.commit()
            imported += len(chunk)
            print(f"  Progress: {min(i+chunk_size, len(values_list))}/{len(values_list)} ({int(min(i+chunk_size, len(values_list))/len(values_list)*100)}%)")
        except Exception as e:
            print(f"  Error: {str(e)[:200]}")
            conn.rollback()
    
    # Final count
    cur.execute("SELECT COUNT(*) FROM aptitude_practice_questions")
    final_count = cur.fetchone()[0]
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)
    print(f"✓ Total in database: {final_count}")
    print(f"✓ Expected: {len(questions)}")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
