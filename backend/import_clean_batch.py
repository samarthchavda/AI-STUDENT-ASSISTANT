"""
Import cleaned questions in small batches
"""
import json
import hashlib
from sqlalchemy import text
from app.core.database import engine

def main():
    print("Loading cleaned questions...")
    with open('aptitude_practice_questions_cleaned.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    print(f"Loaded {len(questions)} questions")
    
    batch_size = 50
    imported = 0
    skipped = 0
    
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(len(questions) + batch_size - 1)//batch_size}...", end=' ')
        
        # Prepare batch data
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
                'hash': hash_str
            })
        
        # Insert batch
        try:
            with engine.begin() as conn:
                result = conn.execute(text("""
                    INSERT INTO aptitude_practice_questions 
                    (id, question, image, has_image, options, answer, explanation, 
                     category, subcategory, difficulty, tags, hash)
                    VALUES 
                    (:id, :question, :image, :has_image, CAST(:options AS jsonb), 
                     :answer, :explanation, :category, :subcategory, :difficulty, 
                     CAST(:tags AS jsonb), :hash)
                    ON CONFLICT (hash) DO NOTHING
                """), values)
                
                batch_imported = sum(1 for v in values)
                imported += batch_imported
                print(f"✓ {batch_imported} questions")
                
        except Exception as e:
            print(f"✗ Error: {str(e)[:50]}")
            skipped += len(batch)
    
    # Get final count
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM aptitude_practice_questions"))
        final_count = result.scalar()
    
    print(f"\n{'='*60}")
    print(f"Import Summary:")
    print(f"  Processed: {len(questions)}")
    print(f"  Imported: {imported}")
    print(f"  Skipped: {skipped}")
    print(f"  Final DB count: {final_count}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
