-- Add solutions_viewed column to users table for tracking DSA solution views
ALTER TABLE users ADD COLUMN IF NOT EXISTS solutions_viewed INTEGER DEFAULT 0;

-- Update existing users to have 0 solutions viewed
UPDATE users SET solutions_viewed = 0 WHERE solutions_viewed IS NULL;
