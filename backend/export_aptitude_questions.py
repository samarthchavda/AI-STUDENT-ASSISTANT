"""
Export all aptitude practice questions from database to JSON file
"""
import json
import sys
from app.core.database import engine

def export_aptitude_questions():
    """Fetch all aptitude practice questions and export to JSON"""
    
    try:
        from sqlalchemy import text
        
        print("Connecting to database...")
        
        with engine.connect() as connection:
            # Fetch all questions
            query = text("""
                SELECT 
                    id::text,
                    question,
                    image,
                    has_image,
                    options,
                    answer,
                    explanation,
                    category,
                    subcategory,
                    difficulty,
                    tags,
                    source,
                    created_at,
                    updated_at
                FROM aptitude_practice_questions
                ORDER BY id
            """)
            
            result = connection.execute(query)
            rows = result.fetchall()
            
            print(f"Found {len(rows)} questions")
            
            # Convert to list of dictionaries
            questions = []
            for row in rows:
                question_dict = {
                    "id": row[0],
                    "question": row[1],
                    "image": row[2],
                    "has_image": row[3],
                    "options": row[4],  # Already JSON
                    "answer": row[5],
                    "explanation": row[6],
                    "category": row[7],
                    "subcategory": row[8],
                    "difficulty": row[9],
                    "tags": row[10] if row[10] else [],  # Already JSON
                    "source": row[11],
                    "created_at": row[12].isoformat() if row[12] else None,
                    "updated_at": row[13].isoformat() if row[13] else None
                }
                questions.append(question_dict)
            
            # Save to JSON file
            output_file = "aptitude_practice_questions_export.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(questions, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Successfully exported {len(questions)} questions to {output_file}")
            
            # Print statistics
            categories = {}
            subcategories = {}
            difficulties = {}
            
            for q in questions:
                cat = q['category']
                subcat = q['subcategory']
                diff = q['difficulty']
                
                categories[cat] = categories.get(cat, 0) + 1
                subcategories[subcat] = subcategories.get(subcat, 0) + 1
                difficulties[diff] = difficulties.get(diff, 0) + 1
            
            print("\n📊 Statistics:")
            print(f"Total Questions: {len(questions)}")
            print(f"\nBy Category:")
            for cat, count in sorted(categories.items()):
                print(f"  {cat}: {count}")
            print(f"\nBy Difficulty:")
            for diff, count in sorted(difficulties.items()):
                print(f"  {diff}: {count}")
            print(f"\nTotal Subcategories: {len(subcategories)}")
            
            return True
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = export_aptitude_questions()
    sys.exit(0 if success else 1)
