# Aptitude Questions Cleaning Report

## Overview
Comprehensive cleaning and normalization of aptitude practice questions database export.

**Date:** April 9, 2026  
**Script:** `backend/clean_aptitude_questions.py`

## Results Summary

| Metric | Count |
|--------|-------|
| **Total Input Questions** | 5,852 |
| **Cleaned Questions Kept** | 5,827 |
| **Questions Removed** | 25 |
| **Retention Rate** | 99.6% |

## Cleaning Operations Performed

| Operation | Count |
|-----------|-------|
| Questions Text Cleaned | 3,074 |
| Explanations Cleaned | 4,652 |
| Subcategories Normalized | 2,604 |
| Answers Corrected | 0 |

## Files Generated

### 1. `aptitude_practice_questions_cleaned.json` (4.5 MB)
- Contains 5,827 validated and cleaned questions
- All fields normalized and validated
- Empty explanations removed
- Subcategories standardized
- Tags deduplicated and limited to 5 per question

### 2. `aptitude_practice_questions_removed.json` (25 KB)
- Contains 25 removed questions with reasons
- Primarily image-based questions with empty options
- Questions with invalid structure

### 3. `backend/clean_aptitude_questions.py`
- Reusable cleaning script
- Can be run on future exports

## Cleaning Rules Applied

### 1. Field Filtering
**Kept fields:**
- id, question, image, has_image
- options, answer, explanation
- category, subcategory, difficulty, tags

**Removed fields:**
- source, created_at, updated_at

### 2. Text Cleaning
- Removed broken spacing and extra whitespace
- Fixed missing spaces (e.g., "What isnot" → "What is not")
- Fixed punctuation spacing
- Removed metadata patterns like [Company 2019] and (Question #123)
- Decoded HTML entities (&nbsp;, &lt;, etc.)

### 3. Options Cleaning
- Trimmed whitespace from all options
- Removed empty options
- Validated option keys (A, B, C, D)
- Ensured at least 2 valid options per question

### 4. Explanation Cleaning
**Removed placeholder text:**
- "No answer description is available. Let's discuss."
- "No answer description available."
- "Let's discuss."

**Removed speculative content:**
- "Let me recheck..."
- "assume typo..."
- "possible intended..."
- "might be...typo"

**Removed external links:**
- YouTube/video links
- "Watch video..." references

### 5. Category/Subcategory Normalization

**Standardized subcategories:**

| Original | Normalized |
|----------|-----------|
| percentages, percentage | percentage |
| profit-loss, profit-and-loss | profit-and-loss |
| time-and-distance, boats-and-streams, trains | time-speed-distance |
| work-efficiency, time-and-work | time-and-work |
| ratio, proportion | ratio-and-proportion |
| averages | average |
| SQL, sql | sql |
| Digital Electronics, digital-electronics | digital-electronics |

**Total normalized:** 2,604 subcategories

### 6. Tags Cleanup
- Removed duplicates
- Normalized to lowercase slug format
- Removed irrelevant tags
- Limited to maximum 5 tags per question
- Minimum tag length: 3 characters

### 7. Validation Rules

**Questions removed if:**
- Missing question text or options
- Question text < 10 characters
- Less than 2 valid options
- Invalid answer key (not A, B, C, or D)
- Answer key out of range
- Image question with < 3 text options
- Too many special characters (>50%)

### 8. Difficulty Levels
Preserved as-is:
- easy (4,469 questions)
- medium (1,168 questions)
- hard (215 questions)

## Removal Reasons Breakdown

| Reason | Count |
|--------|-------|
| Too many empty options | 23 |
| Image question with insufficient text options | 2 |

**Note:** Most removed questions were image-based questions where the options were stored as images rather than text, making them unsuitable for text-based rendering.

## Quality Improvements

### Before Cleaning
- Inconsistent subcategory naming
- Placeholder explanations cluttering data
- Duplicate tags
- Broken text formatting
- Metadata in question text
- HTML entities not decoded

### After Cleaning
- ✓ Standardized subcategory slugs
- ✓ Empty explanations removed (4,652 cleaned)
- ✓ Deduplicated tags (max 5 per question)
- ✓ Clean, readable text (3,074 questions improved)
- ✓ Metadata removed from questions
- ✓ HTML entities decoded

## Data Integrity

- All 5,827 questions have valid structure
- All answer keys validated (A, B, C, or D)
- All questions have at least 2 valid options
- All IDs preserved from original export
- UTF-8 encoding maintained
- Valid JSON format

## Usage

### Load Cleaned Questions
```python
import json

with open('aptitude_practice_questions_cleaned.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} cleaned questions")
```

### Check Removed Questions
```python
with open('aptitude_practice_questions_removed.json', 'r', encoding='utf-8') as f:
    removed = json.load(f)

for item in removed:
    print(f"ID: {item['original']['id']}")
    print(f"Reason: {item['removal_reason']}\n")
```

### Re-run Cleaning
```bash
python3 backend/clean_aptitude_questions.py
```

## Statistics by Category (Cleaned Data)

Based on the 5,827 cleaned questions:

| Category | Approximate Count |
|----------|------------------|
| Aptitude | ~1,830 |
| Database | ~1,045 |
| Digital Electronics | ~690 |
| C Programming | ~665 |
| General Knowledge | ~660 |
| Logical Reasoning | ~530 |
| Networking | ~235 |
| Java Programming | ~175 |
| Verbal Ability | ~1 |

## Next Steps

1. ✓ Cleaned data ready for use
2. ✓ Removed questions documented
3. Consider: Import cleaned data back to database
4. Consider: Add more validation rules if needed
5. Consider: Manual review of edge cases

## Notes

- Cleaning is conservative - only removes clearly invalid questions
- 99.6% retention rate indicates high data quality
- Most removals were technical (image-only questions)
- No answers were automatically corrected (requires manual review)
- Subcategory normalization improves filtering and search
- Tags cleanup reduces noise and improves categorization

## Files Location

- **Cleaned:** `aptitude_practice_questions_cleaned.json`
- **Removed:** `aptitude_practice_questions_removed.json`
- **Original:** `aptitude_practice_questions_export.json`
- **Script:** `backend/clean_aptitude_questions.py`
- **This Report:** `APTITUDE_QUESTIONS_CLEANING_REPORT.md`
