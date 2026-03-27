-- Optimization for Google OAuth login performance
-- This migration adds indexes and optimizations for faster authentication

-- 1. Add composite index for Google users (email + auth_provider)
CREATE INDEX IF NOT EXISTS idx_users_email_provider ON users(email, auth_provider);

-- 2. Add index on is_google_user for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_google ON users(is_google_user) WHERE is_google_user = true;

-- 3. Optimize refresh_tokens table with composite index
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_expires ON refresh_tokens(user_id, expires_at) WHERE revoked = false;

-- 4. Add index on token_blacklist expires_at for faster cleanup
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);

-- 5. Analyze tables for query planner optimization
ANALYZE users;
ANALYZE refresh_tokens;
ANALYZE token_blacklist;
