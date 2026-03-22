-- Add ON DELETE CASCADE to foreign key constraints for faster user deletion
-- This migration adds cascade delete to tables that reference users

-- Note: PostgreSQL doesn't support modifying constraints directly
-- We need to drop and recreate them with CASCADE

-- 1. aptitude_exam_history - Add foreign key with cascade if not exists
DO $$ 
BEGIN
    -- Check if foreign key exists, if not add it with cascade
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_aptitude_exam_history_user_id'
    ) THEN
        ALTER TABLE aptitude_exam_history 
        ADD CONSTRAINT fk_aptitude_exam_history_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. notifications - Add foreign key with cascade if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_notifications_user_id'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT fk_notifications_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. user_usage - Add foreign key with cascade if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_usage_user_id'
    ) THEN
        ALTER TABLE user_usage 
        ADD CONSTRAINT fk_user_usage_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. broadcasts - Add foreign key with cascade if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_broadcasts_admin_id'
    ) THEN
        ALTER TABLE broadcasts 
        ADD CONSTRAINT fk_broadcasts_admin_id 
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for faster deletion if they don't exist
CREATE INDEX IF NOT EXISTS idx_aptitude_exam_history_user_id ON aptitude_exam_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_admin_id ON broadcasts(admin_id);

-- Verify the changes
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('aptitude_exam_history', 'notifications', 'user_usage', 'broadcasts')
ORDER BY tc.table_name;
