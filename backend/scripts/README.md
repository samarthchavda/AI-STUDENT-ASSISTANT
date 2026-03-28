# DSA Scripts

Utility scripts for managing DSA practice questions.

## Available Scripts

### 1. Seed DSA Questions
Populates the database with classic DSA problems.

```bash
python3 scripts/seed_dsa.py
```

**Features:**
- Adds 20 classic DSA problems
- Covers 4 main topics: Arrays, Strings, Linked Lists, Trees
- 5 questions per topic
- Includes company tags: Amazon, TCS, Odoo, Google
- Prevents duplicate entries
- Shows detailed progress

**Topics Covered:**
- Arrays (5 questions)
- Strings (5 questions)
- Linked Lists (5 questions)
- Trees (5 questions)

### 2. Check DSA Questions
View all questions in the database with detailed breakdown.

```bash
python3 scripts/check_dsa_questions.py
```

**Shows:**
- Total question count
- Breakdown by topic
- Breakdown by difficulty
- Company tag statistics

## Database Schema

Questions include:
- Title and description
- Topic and difficulty
- Company tags
- Constraints and examples
- Starter code (Python, JavaScript, C++)
- Test cases
- Solution hints
- Time/space complexity

## AI Fallback

If a topic has no questions, the system automatically:
1. Detects empty results
2. Generates 3 new questions using Gemini AI
3. Saves them to the database
4. Returns the generated questions

This ensures users always have content to practice with.
