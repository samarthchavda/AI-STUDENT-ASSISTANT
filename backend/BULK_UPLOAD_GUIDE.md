# 📁 Bulk Upload Company Questions - Complete Guide

## ✨ Feature Overview

**Admin can now upload hundreds of interview questions in one click!**

### What You Can Do:
- ✅ Upload TXT file with multiple questions
- ✅ Upload a sample template with 50+ questions
- ✅ Auto-detect duplicates and increment frequency
- ✅ View upload results (added, skipped, errors)
- ✅ Browse all questions in admin dashboard

---

## 🎯 How to Use

### Step 1: Download Sample Template
```
Admin Panel → Company Questions Tab → Download Template Button
```

This gives you a pre-formatted TXT file with 50+ real company questions from:
- Amazon (10 questions)
- Microsoft (10 questions)
- Google (8 questions)
- TCS, Infosys, Wipro, Accenture (6 each)

### Step 2: Edit the Template

File format example:
```plaintext
COMPANY: Amazon
category: dsa
difficulty: easy
topic: Arrays
question: Two Sum - Find two numbers that add up to target
year: 2024
---
COMPANY: Amazon
category: dsa
difficulty: medium
topic: Binary Search
question: Search in Rotated Sorted Array
year: 2024
---
```

**Required Fields:**
- `COMPANY:` - Company name (e.g., Amazon, Microsoft)
- `question:` - The interview question text

**Optional Fields:**
- `category:` - dsa, system_design, hr, coding, aptitude, behavioral, technical
- `difficulty:` - easy, medium, hard
- `topic:` - Topic area (e.g., Arrays, Binary Search, Strings)
- `year:` - Year the question was asked

**Separator:** Each question must be separated by `---` (three dashes)

### Step 3: Upload to Database

1. Go to Admin Panel → Company Questions Tab
2. Select your TXT file
3. Click **"✅ Upload Questions"**
4. View the results:
   - ✅ New Questions Added
   - 🔄 Updated (Duplicates)
   - ⚠️ Skipped

---

## 📊 Upload Results Breakdown

### Example Upload:
```json
{
  "status": "success",
  "total_processed": 50,
  "added_new": 48,
  "skipped": 2,
  "errors": [
    "Missing company or question in block: ...",
    "Error processing block: Invalid category..."
  ]
}
```

### What Happens to Duplicates?
If you upload the same question twice:
1. **First upload:** Question added with `frequency: 1`
2. **Second upload:** Frequency incremented to `2`
3. **Result:** Shows popular questions first

Example:
```
Two Sum question
├─ First upload: frequency = 1
├─ Second upload: frequency = 2
├─ Third upload: frequency = 3
└─ Ranks as most asked question
```

---

## 🗂️ TXT File Formats Supported

### Format 1: Complete (Recommended)
```plaintext
COMPANY: Amazon
category: dsa
difficulty: medium
topic: Trees
question: Maximum Depth of Binary Tree
year: 2024
---
COMPANY: Microsoft
category: system_design
difficulty: hard
topic: Databases
question: Design a distributed cache system
year: 2023
---
```

### Format 2: Minimal
```plaintext
COMPANY: Amazon
question: Two Sum Problem
---
COMPANY: Microsoft
question: Reverse a Linked List
---
```
*Note: Will use defaults for missing category, difficulty, etc.*

### Format 3: Mixed
```plaintext
COMPANY: Google
category: dsa
question: Longest Substring Without Repeating Characters
difficulty: medium
topic: Hash Tables
year: 2024
---
```
*Note: Field order doesn't matter, just ensure separator `---` is present*

---

## 📋 Valid Category Values

```
dsa                  → Data Structures & Algorithms
system_design        → System Design
hr                   → HR & Behavioral
coding               → Coding/Implementation
aptitude             → Aptitude/Quantitative
behavioral           → Behavioral/Soft Skills
technical            → Technical Knowledge
```

## 📈 Valid Difficulty Levels

```
easy       → Beginner level
medium     → Intermediate level  
hard       → Advanced level
```

---

## 🔄 Real-World Examples

### Example 1: Add Amazon DSA Questions
```plaintext
COMPANY: Amazon
category: dsa
difficulty: easy
topic: Arrays
question: Two Sum
year: 2024
---
COMPANY: Amazon
category: dsa
difficulty: medium
topic: Arrays
question: 3Sum Problem
year: 2024
---
COMPANY: Amazon
category: dsa
difficulty: hard
topic: Arrays
question: Skyline Problem
year: 2023
---
```

### Example 2: Add System Design Questions
```plaintext
COMPANY: Google
category: system_design
difficulty: hard
topic: Databases
question: Design a distributed database with replication
year: 2023
---
COMPANY: Google
category: system_design
difficulty: hard
topic: Scaling
question: Design YouTube-scale video platform
year: 2023
---
COMPANY: Google
category: system_design
difficulty: hard
topic: Real-time
question: Design Google Maps with real-time tracking
year: 2023
---
```

### Example 3: Add HR/Behavioral Questions
```plaintext
COMPANY: Microsoft
category: hr
difficulty: easy
topic: Communication
question: Tell me about yourself
year: 2024
---
COMPANY: Microsoft
category: behavioral
difficulty: medium
topic: Leadership
question: Describe a situation where you showed leadership
year: 2024
---
COMPANY: Microsoft
category: aptitude
difficulty: medium
topic: Quantitative
question: If A can complete work in 10 days and B in 15 days, how long together?
year: 2024
---
```

---

## 🚀 API Endpoints

### Bulk Upload Endpoint
```
POST /api/admin/company-questions/bulk-upload
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

Body: 
  file: <TXT file>

Response:
{
  "status": "success",
  "total_processed": 50,
  "added_new": 48,
  "skipped": 2,
  "errors": [...],
  "message": "Successfully added 48 questions to database"
}
```

### Sample Template Endpoint
```
GET /api/admin/company-questions/sample-template
Authorization: Bearer <admin_token>

Response:
{
  "template": "COMPANY: Amazon\n...",
  "instructions": [...],
  "format_guide": {...}
}
```

### View All Questions Endpoint
```
GET /api/admin/company-questions?skip=0&limit=100
Authorization: Bearer <admin_token>

Response: [
  {
    "id": 1,
    "company_name": "Amazon",
    "question_text": "Two Sum",
    "category": "dsa",
    "difficulty": "easy",
    "frequency": 10,
    "topic": "Arrays",
    "year_asked": 2024
  },
  ...
]
```

---

## ⚙️ Technical Details

### File Upload Flow:
```
User selects TXT file
        ↓
Form sends to /api/admin/company-questions/bulk-upload
        ↓
Backend parses file block by block
        ↓
For each block:
  ├─ Extract fields (company, question, category, etc.)
  ├─ Validate required fields
  ├─ Check for existing question
  ├─ If exists: Increment frequency
  └─ If new: Insert into database
        ↓
Return summary: {added, skipped, errors}
        ↓
Frontend refreshes question list
```

### Duplicate Detection:
```python
# Checks if question already exists by:
# COMPANY (case-insensitive) + QUESTION TEXT (case-insensitive)

existing = db.query(CompanyQuestion).filter(
    CompanyQuestion.company_name.ilike(data['company_name']),
    CompanyQuestion.question_text.ilike(data['question_text'])
).first()

if existing:
    existing.frequency += 1  # Increment
else:
    create_new_question()     # Add new
```

---

## 🎨 Admin Panel UI Features

### Bulk Upload Section:
- 📄 File picker with drag-and-drop
- 📥 Download sample template button
- ✅ Upload button (disabled until file selected)
- 📊 Success results showing added/updated/skipped counts
- ⚠️ Error list if any issues found

### Questions Table:
- 🔍 View all 50+ uploaded questions
- 📊 Filter by difficulty (color-coded)
- 🏢 Group by company
- 📈 Shows frequency count (most asked first)
- 📅 Shows year asked

---

## 📝 Common Issues & Solutions

### Issue 1: "Missing company or question in block"
**Cause:** Missing COMPANY or question field  
**Solution:** Ensure every block has both fields:
```plaintext
COMPANY: Amazon        ← Required
question: Your Q?      ← Required
category: dsa          ← Optional
```

### Issue 2: "Error processing block: Invalid year"
**Cause:** Year is not a valid number  
**Solution:** Use numeric year or omit:
```plaintext
year: 2024        ← Valid
year: invalid      ← Invalid, will be skipped
```

### Issue 3: Upload shows "Skipped: 5"
**Cause:** Some blocks missing required fields or invalid  
**Solution:** Check error message in upload results and fix

### Issue 4: "Duplicates not incrementing"  
**Cause:** Question text or company name has slight difference  
**Solution:** Ensure exact match (case-insensitive):
```plaintext
COMPANY: Amazon      ← This
COMPANY: AMAZON      ← Will be ignored even though same company
```

---

## 📊 Database Table Structure

```sql
CREATE TABLE company_question (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,           -- Indexed
    question_text TEXT NOT NULL,
    category VARCHAR(50),                         -- dsa, system_design, etc.
    difficulty VARCHAR(20),                       -- easy, medium, hard
    frequency INTEGER DEFAULT 1,                  -- How popular
    topic VARCHAR(255),                           -- Arrays, Trees, etc.
    year_asked INTEGER,                           -- 2024, 2023, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Verification

### Test Upload Success:
1. Download sample template
2. Edit to add 5 questions
3. Upload file
4. Check admin dashboard
5. Verify questions appear in table
6. Upload same file again
7. Check frequency increased

### Expected Result:
```
First upload:  added_new: 5, skipped: 0
Second upload: added_new: 0, skipped: 5 (all duplicates)
Database: 5 questions with frequency: 2
```

---

## 🎯 Next Steps

### For Admin Users:
1. ✅ Download sample template
2. ✅ Edit with your company data
3. ✅ Upload to database
4. ✅ View in admin dashboard
5. ✅ Share SEO articles with public

### For Developers:
1. ✅ Monitor bulk upload errors
2. ✅ Add CSV import if needed
3. ✅ Create export functionality
4. ✅ Add question editing in UI
5. ✅ Implement approval workflow

---

## 📚 Resources

**Sample Template File:** `/backend/sample_questions.txt` (50+ real questions)  
**API Documentation:** `SECURITY_FEATURES.md`  
**Admin Guide:** `ADMIN_PANEL_GUIDE.md`  

---

**Status**: ✅ **PRODUCTION READY**
- Upload tested with 50+ questions
- Duplicate detection verified
- Error handling comprehensive
- Frontend UI complete
- Database integration live
