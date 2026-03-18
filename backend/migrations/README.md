# Database Migrations

## Quick Setup for Aptitude Exam History

### Option 1: Automatic (Recommended)
The table will be created automatically when you restart the backend server. Just restart your backend:

```bash
cd backend
python3 -m uvicorn app.main:app --reload
```

The backend will automatically create the `aptitude_exam_history` table on startup.

### Option 2: Manual Script
Run the Python script to create the table manually:

```bash
cd backend
python3 create_history_table.py
```

### Option 3: Direct SQL
If you prefer to run SQL directly on your database:

```bash
psql -U your_username -d your_database -f create_aptitude_exam_history.sql
```

Or manually execute the SQL commands in `create_aptitude_exam_history.sql`.

## Troubleshooting

### Error: "Table does not exist"
1. Restart your backend server (it will auto-create the table)
2. Or run: `python3 create_history_table.py` from the backend directory

### Error: "Column user_id does not exist"
If you already have the table but it's missing the user_id column:
```bash
psql -U your_username -d your_database -f add_user_id_to_existing_history.sql
```

## Table Structure

The `aptitude_exam_history` table stores:
- `user_id` - Links exam to specific user
- Exam metadata (company, category, difficulty)
- Score information (correct, wrong, skipped, percentage)
- Complete questions and answers as JSON
- Timestamp of when the exam was taken

## Verification

To verify the table was created successfully:

```sql
SELECT * FROM aptitude_exam_history LIMIT 1;
```

Or run the verification script:
```bash
cd backend
python3 create_history_table.py
```
