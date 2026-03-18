-- Migration script to add user_id column to existing aptitude_exam_history table
-- Run this if you already have the table without user_id column

-- Add user_id column if it doesn't exist
ALTER TABLE aptitude_exam_history 
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_exam_history_user ON aptitude_exam_history(user_id);

-- Optional: If you have existing records without user_id, you can set a default user
-- UPDATE aptitude_exam_history SET user_id = 1 WHERE user_id IS NULL;
