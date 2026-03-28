-- Fix notifications table to cascade delete when user is deleted
-- This allows users to be deleted without foreign key constraint violations

-- Drop the existing foreign key constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Add the foreign key constraint with CASCADE delete
ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Also fix broadcasts table
ALTER TABLE broadcasts DROP CONSTRAINT IF EXISTS broadcasts_admin_id_fkey;

ALTER TABLE broadcasts 
ADD CONSTRAINT broadcasts_admin_id_fkey 
FOREIGN KEY (admin_id) 
REFERENCES users(id) 
ON DELETE CASCADE;
