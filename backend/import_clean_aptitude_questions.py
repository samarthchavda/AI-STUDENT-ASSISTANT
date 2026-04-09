"""
Import cleaned aptitude questions into database
Safely backs up, deletes old data, and imports cleaned questions
"""
import json
import sys
from datetime import datetime
from sqlalchemy import text
from app.core.database import engine

def backup_existing_questions():
    """Backup existing questions before deletion"""
    print("="*60)
    print("STEP 1: BACKING UP EXISTING QUESTIONS")
    print("="*60)
    
    try:
        with engine.connect() as connection:
            # Count existing questions
            count_result = connection.execute(
                text("SELECT COUNT(*) FROM aptitude_practice_questions")
            )
            existing_count = count_result.scalar()
            
            print(f"Found {existing_count} existing questions to backup")
            
            if existing_count == 0:
                print("No existing questions to backup")
                return 0
            
            # Fetch all existing questions
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
            
            # Convert to list of dictionaries
            backup_data = []
            for row in rows:
                backup_data.append({
                    "id": row[0],
                    "question": row[1],
                    "image": row[2],
                    "has_image": row[3],
                    "options": row[4],
                    "answer": row[5],
                    "explanation": row[6],
                    "category": row[7],
                    "subcategory": row[8],
                    "difficulty": row[9],
                    "tags": row[10] if row[10] else [],
                    "source": row[11],
                    "created_at": row[12].isoformat() if row[12] else None,
                    "updated_at": row[13].isoformat() if row[13] else None
                })
            
            # Save backup
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"aptitude_questions_backup_before_clean_import_{timestamp}.json"
            
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Backup saved to: {backup_file}")
            print(f"✓ Backed up {len(backup_data)} questions")
            
            return existing_count
            
    except Exception as e:
        print(f"❌ Backup failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def delete_old_questions():
    """Delete all existing aptitude practice questions"""
    print("\n" + "="*60)
    print("STEP 2: DELETING OLD QUESTIONS")
    print("="*60)
    
    try:
        with engine.begin() as connection:
            # Delete all questions
            result = connection.execute(
                text("DELETE FROM aptitude_practice_questions")
            )
            deleted_count = result.rowcount
            
            print(f"✓ Deleted {deleted_count} old questions")
            
            # Verify deletion
            verify_result = connection.execute(
                text("SELECT COUNT(*) FROM aptitude_practice_questions")
            )
            remaining = verify_result.scalar()
            
            if remaining > 0:
                print(f"⚠ Warning: {remaining} questions still remain!")
                return None
            
            print("✓ Table cleared successfully")
            return deleted_count
            
    except Exception as e:
        print(f"❌ Deletion failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def import_cleaned_questions(cleaned_file: str):
    """Import cleaned questions into database"""
    print("\n" + "="*60)
    print("STEP 3: IMPORTING CLEANED QUESTIONS")
    print("="*60)
    
    try:
        # Load cleaned questions
        print(f"Loading cleaned questions from {cleaned_file}...")
        with open(cleaned_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        print(f"Loaded {len(questions)} cleaned questions")
        
        # Import questions in batches
        imported_count = 0
        duplicate_count = 0
        batch_size = 100
        
        with engine.begin() as connection:
            for i in range(0, len(questions), batch_size):
                batch = questions[i:i+batch_size]
                print(f"Importing batch {i//batch_size + 1}/{(len(questions) + batch_size - 1)//batch_size}...")
                
                for question in batch:
                    try:
                        # Generate hash for deduplication
                        import hashlib
                        question_text = question['question'].strip().lower()
                        hash_str = hashlib.md5(question_text.encode()).hexdigest()
                        
                        # Insert question with ON CONFLICT DO NOTHING
                        insert_query = text("""
                            INSERT INTO aptitude_practice_questions 
                            (id, question, image, has_image, options, answer, explanation, 
                             category, subcategory, difficulty, tags, hash)
                            VALUES 
                            (:id, :question, :image, :has_image, CAST(:options AS jsonb), 
                             :answer, :explanation, :category, :subcategory, :difficulty, 
                             CAST(:tags AS jsonb), :hash)
                            ON CONFLICT (hash) DO NOTHING
                        """)
                        
                        result = connection.execute(insert_query, {
                            "id": question['id'],
                            "question": question['question'],
                            "image": question.get('image'),
                            "has_image": question.get('has_image', False),
                            "options": json.dumps(question.get('options', [])),
                            "answer": question['answer'],
                            "explanation": question.get('explanation', ''),
                            "category": question['category'],
                            "subcategory": question['subcategory'],
                            "difficulty": question.get('difficulty', 'medium'),
                            "tags": json.dumps(question.get('tags', [])),
                            "hash": hash_str
                        })
                        
                        if result.rowcount > 0:
                            imported_count += 1
                        else:
                            duplicate_count += 1
                            
                    except Exception as e:
                        print(f"  ⚠ Error with question {question.get('id', 'unknown')}: {str(e)[:80]}")
        
        print(f"\n✓ Successfully imported {imported_count} questions")
        if duplicate_count > 0:
            print(f"⚠ Skipped {duplicate_count} duplicate questions")
        
        return imported_count
        
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def validate_import():
    """Validate the imported data"""
    print("\n" + "="*60)
    print("STEP 4: VALIDATING IMPORT")
    print("="*60)
    
    try:
        with engine.connect() as connection:
            # Count total questions
            count_result = connection.execute(
                text("SELECT COUNT(*) FROM aptitude_practice_questions")
            )
            total_count = count_result.scalar()
            
            print(f"Total questions in database: {total_count}")
            
            # Count by category
            category_result = connection.execute(
                text("""
                    SELECT category, COUNT(*) as count
                    FROM aptitude_practice_questions
                    GROUP BY category
                    ORDER BY count DESC
                """)
            )
            
            print("\nQuestions by category:")
            for row in category_result:
                print(f"  {row[0]}: {row[1]}")
            
            # Count by difficulty
            difficulty_result = connection.execute(
                text("""
                    SELECT difficulty, COUNT(*) as count
                    FROM aptitude_practice_questions
                    GROUP BY difficulty
                    ORDER BY count DESC
                """)
            )
            
            print("\nQuestions by difficulty:")
            for row in difficulty_result:
                print(f"  {row[0]}: {row[1]}")
            
            # Check for duplicates
            duplicate_result = connection.execute(
                text("""
                    SELECT hash, COUNT(*) as count
                    FROM aptitude_practice_questions
                    GROUP BY hash
                    HAVING COUNT(*) > 1
                """)
            )
            
            duplicates = duplicate_result.fetchall()
            if duplicates:
                print(f"\n⚠ Warning: Found {len(duplicates)} duplicate question hashes")
            else:
                print("\n✓ No duplicate questions found")
            
            # Sample questions
            sample_result = connection.execute(
                text("""
                    SELECT id::text, question, category, difficulty
                    FROM aptitude_practice_questions
                    ORDER BY RANDOM()
                    LIMIT 3
                """)
            )
            
            print("\nSample questions:")
            for row in sample_result:
                print(f"  [{row[2]} - {row[3]}] {row[1][:60]}...")
            
            return total_count
            
    except Exception as e:
        print(f"❌ Validation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("APTITUDE QUESTIONS DATABASE UPDATE")
    print("="*60)
    print("This will:")
    print("1. Backup existing questions")
    print("2. Delete old questions")
    print("3. Import cleaned questions")
    print("4. Validate import")
    print("="*60)
    
    # Confirm
    response = input("\nProceed with database update? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("❌ Operation cancelled")
        return
    
    # Step 1: Backup
    existing_count = backup_existing_questions()
    if existing_count is None:
        print("\n❌ Backup failed. Aborting.")
        return
    
    # Step 2: Delete old data
    deleted_count = delete_old_questions()
    if deleted_count is None:
        print("\n❌ Deletion failed. Aborting.")
        print("⚠ Backup file was created, but old data was not deleted.")
        return
    
    # Step 3: Import cleaned data
    cleaned_file = 'aptitude_practice_questions_cleaned.json'
    imported_count = import_cleaned_questions(cleaned_file)
    if imported_count is None:
        print("\n❌ Import failed.")
        print("⚠ Old data was deleted but new data was not imported!")
        print("⚠ You may need to restore from backup.")
        return
    
    # Step 4: Validate
    final_count = validate_import()
    
    # Summary
    print("\n" + "="*60)
    print("IMPORT SUMMARY")
    print("="*60)
    print(f"Old records deleted:     {deleted_count}")
    print(f"New records imported:    {imported_count}")
    print(f"Final database count:    {final_count}")
    print(f"Expected count:          5827")
    
    if final_count == 5827:
        print("\n✓ Import completed successfully!")
        print("✓ Database now contains cleaned questions")
    else:
        print(f"\n⚠ Warning: Expected 5827 questions but got {final_count}")
    
    print("="*60)

if __name__ == "__main__":
    main()
