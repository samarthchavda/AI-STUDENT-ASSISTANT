-- Fix user_usage table cascade delete
-- Remove the NO ACTION constraint and keep only the CASCADE one

-- Drop the NO ACTION constraint
ALTER TABLE user_usage 
DROP CONSTRAINT IF EXISTS user_usage_user_id_fkey;

-- The CASCADE constraint (fk_user_usage_user_id) should already exist
-- If you need to verify, run this query:
-- SELECT constraint_name, delete_rule FROM information_schema.referential_constraints 
-- WHERE constraint_name LIKE '%user_usage%';

