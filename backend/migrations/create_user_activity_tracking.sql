-- User Activity Tracking Migration
-- Tracks user time spent, page views, and feature usage

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page_url VARCHAR(500),
    feature_name VARCHAR(100),
    action_type VARCHAR(50), -- page_view, feature_use, button_click, session_start, session_end
    duration_seconds INTEGER DEFAULT 0,
    session_id VARCHAR(100),
    metadata JSONB, -- Additional data like screen size, referrer, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_session_id ON user_activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_feature ON user_activity_logs(feature_name);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity_logs(action_type);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity_logs(user_id, created_at DESC);

-- Create materialized view for daily summary (for faster queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_daily_summary AS
SELECT 
    user_id,
    DATE(created_at) as activity_date,
    COUNT(DISTINCT session_id) as session_count,
    SUM(duration_seconds) as total_duration_seconds,
    COUNT(*) as total_actions,
    COUNT(DISTINCT feature_name) as unique_features_used,
    MIN(created_at) as first_activity,
    MAX(created_at) as last_activity
FROM user_activity_logs
GROUP BY user_id, DATE(created_at);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_activity_summary_user_date ON user_activity_daily_summary(user_id, activity_date DESC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_activity_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_daily_summary;
END;
$$ LANGUAGE plpgsql;

-- Add comment to table
COMMENT ON TABLE user_activity_logs IS 'Tracks all user activity including page views, feature usage, and time spent';
COMMENT ON COLUMN user_activity_logs.action_type IS 'Type of action: page_view, feature_use, button_click, session_start, session_end';
COMMENT ON COLUMN user_activity_logs.duration_seconds IS 'Duration in seconds for the activity';
COMMENT ON COLUMN user_activity_logs.session_id IS 'Unique session identifier to group activities';
COMMENT ON COLUMN user_activity_logs.metadata IS 'Additional metadata in JSON format';
