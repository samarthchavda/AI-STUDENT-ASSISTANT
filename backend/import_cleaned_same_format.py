"""
Fast import of cleaned aptitude questions (same format version)
"""
import json
import hashlib
from sqlalchemy import text
from app.core.database import engine

def main():
    print("="*60)
    print("IMPORTING CLEANED APTITUDE QUESTIONS")
    print("="*60)
    
    # Load questions
    print("\n1. Loading questions...")
    with open('aptitude_practice_questions_cleaned_same_format.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    print(f"   ✓ Loaded {len(questions)} questions")
    
    # Clear existing questions
    print("\n2. Clearing existing questions...")
    with engine.begin() as conn:
        result = conn.execute(text("DELETE FROM aptitude_practice_questions"))
        deleted = result.rowcount
        print(f"   ✓ Deleted {deleted} old questions")
    
    # Import in batches
    print("\n3. Importing questions...")
    batch_size = 500
    imported = 0
    
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i+batch_size]
        
        # Prepare batch
        values = []
        for q in batch:
            hash_str = hashlib.md5(q['question'].strip().lower().encode()).hexdigest()
            values.append({
                'id': q['id'],
                'question': q['question'],
                'image': q.get('image'),
                'has_image': q.get('has_image', False),
                'options': json.dumps(q.get('options', [])),
                'answer': q['answer'],
                'explanation': q.get('explanation', ''),
                'category': q['category'],
                'subcategory': q['subcategory'],
                'difficulty': q.get('difficulty', 'medium'),
                'tags': json.dumps(q.get('tags', [])),
                'source': q.get('source', ''),
                'hash': hash_str
            })
        
        # Insert batch
        with engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO aptitude_practice_questions 
                (id, question, image, has_image, options, answer, explanation, 
                 category, subcategory, difficulty, tags, source, hash)
                VALUES 
                (:id, :question, :image, :has_image, CAST(:options AS jsonb), 
                 :answer, :explanation, :category, :subcategory, :difficulty, 
                 CAST(:tags AS jsonb), :source, :hash)
                ON CONFLICT (hash) DO NOTHING
            """), values)
        
        imported += len(batch)
        print(f"   Progress: {imported}/{len(questions)} ({imported*100//len(questions)}%)")
    
    # Verify
    print("\n4. Verifying import...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM aptitude_practice_questions"))
        final_count = result.scalar()
        
        # Get category breakdown
        cat_result = conn.execute(text("""
            SELECT category, COUNT(*) as count
            FROM aptitude_practice_questions
            GROUP BY category
            ORDER BY count DESC
        """))
        
        print(f"   ✓ Total questions in database: {final_count}")
        print(f"\n   Categories:")
        for row in cat_result:
            print(f"     • {row[0]}: {row[1]}")
    
    print("\n" + "="*60)
    print("✓ IMPORT COMPLETE!")
    print("="*60)

if __name__ == "__main__":
    main()
