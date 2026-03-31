-- Admin Panel Enhancements Migration
-- 1. System Health Monitoring
-- 2. Audit Logs
-- 3. User Sessions

-- ============================================================================
-- SYSTEM HEALTH MONITORING
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_health_logs (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,  -- 'gemini_api', 'database_query', 'api_endpoint'
    endpoint VARCHAR(255),
    response_time_ms INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'success', 'error', 'timeout'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_health_metric_type ON system_health_logs(metric_type);
CREATE INDEX idx_system_health_created_at ON system_health_logs(created_at);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,  -- 'user_promoted', 'user_deleted', 'broadcast_sent', etc.
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_details TEXT NOT NULL,  -- JSON or descriptive text
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_created_at ON admin_audit_logs(created_at);
CREATE INDEX idx_audit_action_type ON admin_audit_logs(action_type);

-- ============================================================================
-- USER SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

-- ============================================================================
-- BANNER BROADCASTS (already exists, but add active flag if missing)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'broadcasts' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE broadcasts ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add index for active broadcasts
CREATE INDEX IF NOT EXISTS idx_broadcasts_is_active ON broadcasts(is_active);
