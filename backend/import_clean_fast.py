"""
Fast import of cleaned aptitude questions using bulk insert
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
    
    # Prepare data
    print("Preparing data...")
    values = []
    for q in questions:
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
    
    print(f"Importing {len(values)} questions...")
    
    # Bulk insert with executemany
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO aptitude_practice_questions 
            (id, question, image, has_image, options, answer, explanation, 
             category, subcategory, difficulty, tags, hash)
            VALUES 
            (:id, :question, :image, :has_image, CAST(:options AS jsonb), 
             :answer, :explanation, :category, :subcategory, :difficulty, 
             CAST(:tags AS jsonb), :hash)
            ON CONFLICT (hash) DO NOTHING
        """), values)
        
        # Get final count
        result = conn.execute(text("SELECT COUNT(*) FROM aptitude_practice_questions"))
        final_count = result.scalar()
        
        print(f"\n✓ Import complete!")
        print(f"✓ Total questions in database: {final_count}")

if __name__ == "__main__":
    main()
