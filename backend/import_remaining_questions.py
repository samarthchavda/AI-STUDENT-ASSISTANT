"""
Fast import script for remaining aptitude questions
Resumes from where previous import stopped
"""
import json
import psycopg2
import os
from dotenv import load_dotenv
import hashlib

load_dotenv()

def generate_hash(question_text, answer):
    """Generate unique hash for question"""
    content = f"{question_text}{answer}"
    return hashlib.md5(content.encode()).hexdigest()

def main():
    print("=" * 60)
    print("IMPORTING REMAINING APTITUDE QUESTIONS")
    print("=" * 60)
    
    # Load questions
    print("\n1. Loading questions...")
    with open('aptitude_practice_questions_cleaned_same_format.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    print(f"✓ Loaded {len(questions)} questions")
    
    # Connect to database
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    
    # Check how many already imported
    print("\n2. Checking existing questions...")
    cur.execute("SELECT COUNT(*) FROM aptitude_practice_questions")
    existing_count = cur.fetchone()[0]
    print(f"✓ Found {existing_count} existing questions")
    
    # Get existing hashes to avoid duplicates
    print("\n3. Loading existing hashes...")
    cur.execute("SELECT hash FROM aptitude_practice_questions")
    existing_hashes = set(row[0] for row in cur.fetchall())
    print(f"✓ Loaded {len(existing_hashes)} hashes")
    
    # Filter out already imported questions
    new_questions = []
    for q in questions:
        q_hash = generate_hash(q['question'], q['answer'])
        if q_hash not in existing_hashes:
            new_questions.append(q)
    
    print(f"\n4. Found {len(new_questions)} new questions to import")
    
    if len(new_questions) == 0:
        print("✓ All questions already imported!")
        cur.close()
        conn.close()
        return
    
    # Import in smaller batches with commit after each
    print("\n5. Importing in small batches...")
    batch_size = 100
    imported = 0
    errors = 0
    
    for i in range(0, len(new_questions), batch_size):
        batch = new_questions[i:i+batch_size]
        
        try:
            for q in batch:
                try:
                    # Generate UUID
                    import uuid
                    q_id = str(uuid.uuid4())
                    
                    # Prepare data
                    q_hash = generate_hash(q['question'], q['answer'])
                    
                    cur.execute("""
                        INSERT INTO aptitude_practice_questions 
                        (id, question, image, has_image, options, answer, explanation, 
                         category, subcategory, difficulty, tags, source, hash)
                        VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s, %s, %s::jsonb, %s, %s)
                        ON CONFLICT (hash) DO NOTHING
                    """, (
                        q_id,
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
                    imported += 1
                except Exception as e:
                    errors += 1
                    if errors < 5:
                        print(f"  Error on question: {str(e)[:100]}")
            
            # Commit after each batch
            conn.commit()
            print(f"  Progress: {min(i+batch_size, len(new_questions))}/{len(new_questions)} ({int(min(i+batch_size, len(new_questions))/len(new_questions)*100)}%)")
            
        except Exception as e:
            print(f"  Batch error: {str(e)}")
            conn.rollback()
            continue
    
    # Final count
    cur.execute("SELECT COUNT(*) FROM aptitude_practice_questions")
    final_count = cur.fetchone()[0]
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)
    print(f"✓ Imported: {imported} new questions")
    print(f"✓ Errors: {errors}")
    print(f"✓ Total in database: {final_count}")
    print(f"✓ Expected total: {len(questions)}")
    
    if final_count < len(questions):
        print(f"\n⚠ Missing {len(questions) - final_count} questions (likely duplicates)")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
