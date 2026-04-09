# Aptitude Practice Questions Export

## Overview
This file contains the complete export of all aptitude practice questions from the CodeCampus AI database.

**Export Date:** April 9, 2026  
**Total Questions:** 5,852  
**File Size:** 5.4 MB  
**Format:** JSON

## Statistics

### Total Questions by Category

| Category | Count |
|----------|-------|
| Aptitude | 1,832 |
| Database | 1,049 |
| Digital Electronics | 692 |
| C Programming | 669 |
| General Knowledge | 664 |
| Logical Reasoning | 533 |
| Networking | 236 |
| Java Programming | 176 |
| Verbal Ability | 1 |

### Questions by Difficulty

| Difficulty | Count |
|------------|-------|
| Easy | 4,469 |
| Medium | 1,168 |
| Hard | 215 |

### Subcategories
Total unique subcategories: **31**

## Data Structure

Each question in the JSON file has the following structure:

```json
{
  "id": "uuid-string",
  "question": "Question text",
  "image": "image-url or null",
  "has_image": false,
  "options": [
    {
      "key": "A",
      "text": "Option A text"
    },
    {
      "key": "B",
      "text": "Option B text"
    },
    {
      "key": "C",
      "text": "Option C text"
    },
    {
      "key": "D",
      "text": "Option D text"
    }
  ],
  "answer": "A",
  "explanation": "Explanation text",
  "category": "Category name",
  "subcategory": "subcategory-slug",
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"],
  "source": "Source name",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

## Fields Description

- **id**: Unique UUID identifier for the question
- **question**: The question text
- **image**: URL to question image (if any)
- **has_image**: Boolean indicating if question has an image
- **options**: Array of answer options with key (A, B, C, D) and text
- **answer**: The correct answer key (A, B, C, or D)
- **explanation**: Detailed explanation of the answer
- **category**: Main category (Aptitude, Database, Programming, etc.)
- **subcategory**: Specific subcategory slug
- **difficulty**: Question difficulty level (easy, medium, hard)
- **tags**: Array of tags for categorization
- **source**: Original source of the question (e.g., IndiaBix)
- **created_at**: Timestamp when question was added
- **updated_at**: Timestamp when question was last updated

## Usage

### Import in Python
```python
import json

with open('aptitude_practice_questions_export.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions")
```

### Import in JavaScript/Node.js
```javascript
const fs = require('fs');

const questions = JSON.parse(
  fs.readFileSync('aptitude_practice_questions_export.json', 'utf-8')
);

console.log(`Loaded ${questions.length} questions`);
```

### Filter by Category
```python
# Python example
aptitude_questions = [q for q in questions if q['category'] == 'Aptitude']
print(f"Found {len(aptitude_questions)} aptitude questions")
```

### Filter by Difficulty
```python
# Python example
hard_questions = [q for q in questions if q['difficulty'] == 'hard']
print(f"Found {len(hard_questions)} hard questions")
```

## Export Script

The export was generated using `backend/export_aptitude_questions.py`:

```bash
cd backend
python3 export_aptitude_questions.py
```

This script:
1. Connects to the PostgreSQL database
2. Fetches all questions from `aptitude_practice_questions` table
3. Converts to JSON format
4. Saves to `aptitude_practice_questions_export.json`
5. Displays statistics

## Notes

- All questions include proper mathematical symbol formatting
- Questions are ordered by ID
- Timestamps are in ISO 8601 format
- Options are always in A, B, C, D format
- Some questions may have "No answer description is available" as explanation
- Source attribution is preserved for all questions

## File Location

**Main Export File:** `aptitude_practice_questions_export.json`  
**This README:** `APTITUDE_QUESTIONS_EXPORT_README.md`  
**Export Script:** `backend/export_aptitude_questions.py`
