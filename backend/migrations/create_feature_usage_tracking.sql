-- Feature Usage Analytics Migration
-- Tracks which features users use most, least, and how long they spend on each

-- Create feature_usage_logs table
CREATE TABLE IF NOT EXISTS feature_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_category VARCHAR(50), -- practice, exam, ai-chat, resume, dsa, etc.
    action_type VARCHAR(50), -- open, use, complete, abandon, error
    duration_seconds INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    metadata JSONB, -- Additional context like difficulty, topic, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage_logs(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_category ON feature_usage_logs(feature_category);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created_at ON feature_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage_logs(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_success ON feature_usage_logs(success) WHERE success = false;

-- Materialized view for feature usage summary
CREATE MATERIALIZED VIEW IF NOT EXISTS feature_usage_summary AS
SELECT 
    feature_name,
    feature_category,
    -- Usage stats
    COUNT(*) as total_uses,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) FILTER (WHERE success = true) as successful_uses,
    COUNT(*) FILTER (WHERE success = false) as failed_uses,
    ROUND(COUNT(*) FILTER (WHERE success = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as success_rate,
    
    -- Time stats
    ROUND(AVG(duration_seconds), 2) as avg_duration_seconds,
    ROUND(SUM(duration_seconds) / 60.0, 2) as total_time_minutes,
    
    -- Action breakdown
    COUNT(*) FILTER (WHERE action_type = 'open') as opens,
    COUNT(*) FILTER (WHERE action_type = 'use') as uses,
    COUNT(*) FILTER (WHERE action_type = 'complete') as completions,
    COUNT(*) FILTER (WHERE action_type = 'abandon') as abandons,
    COUNT(*) FILTER (WHERE action_type = 'error') as errors,
    
    -- Completion rate
    ROUND(
        COUNT(*) FILTER (WHERE action_type = 'complete')::numeric / 
        NULLIF(COUNT(*) FILTER (WHERE action_type = 'open'), 0) * 100, 
        2
    ) as completion_rate,
    
    -- Recent activity
    MAX(created_at) as last_used
FROM feature_usage_logs
GROUP BY feature_name, feature_category;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_usage_summary_feature 
ON feature_usage_summary(feature_name, feature_category);

-- Function to refresh feature usage summary
CREATE OR REPLACE FUNCTION refresh_feature_usage_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY feature_usage_summary;
END;
$$ LANGUAGE plpgsql;

-- View for most used features
CREATE OR REPLACE VIEW most_used_features AS
SELECT 
    feature_name,
    feature_category,
    total_uses,
    unique_users,
    success_rate,
    avg_duration_seconds,
    completion_rate,
    last_used
FROM feature_usage_summary
ORDER BY total_uses DESC
LIMIT 20;

-- View for least used features
CREATE OR REPLACE VIEW least_used_features AS
SELECT 
    feature_name,
    feature_category,
    total_uses,
    unique_users,
    success_rate,
    avg_duration_seconds,
    completion_rate,
    last_used
FROM feature_usage_summary
WHERE last_used >= CURRENT_DATE - INTERVAL '30 days'  -- Only active features
ORDER BY total_uses ASC
LIMIT 20;

-- View for feature drop-off analysis
CREATE OR REPLACE VIEW feature_dropoff_analysis AS
SELECT 
    feature_name,
    feature_category,
    opens,
    uses,
    completions,
    abandons,
    -- Drop-off rates
    ROUND((opens - uses)::numeric / NULLIF(opens, 0) * 100, 2) as open_to_use_dropoff,
    ROUND((uses - completions)::numeric / NULLIF(uses, 0) * 100, 2) as use_to_complete_dropoff,
    ROUND(abandons::numeric / NULLIF(opens, 0) * 100, 2) as abandon_rate,
    completion_rate
FROM feature_usage_summary
WHERE opens > 0
ORDER BY abandon_rate DESC;

-- View for feature usage by category
CREATE OR REPLACE VIEW feature_usage_by_category AS
SELECT 
    feature_category,
    COUNT(DISTINCT feature_name) as feature_count,
    SUM(total_uses) as total_uses,
    SUM(unique_users) as total_unique_users,
    ROUND(AVG(success_rate), 2) as avg_success_rate,
    ROUND(AVG(completion_rate), 2) as avg_completion_rate,
    ROUND(SUM(total_time_minutes), 2) as total_time_minutes
FROM feature_usage_summary
GROUP BY feature_category
ORDER BY total_uses DESC;

-- View for user feature adoption
CREATE OR REPLACE VIEW user_feature_adoption AS
WITH user_features AS (
    SELECT 
        user_id,
        COUNT(DISTINCT feature_name) as features_used,
        COUNT(DISTINCT feature_category) as categories_used,
        COUNT(*) as total_actions,
        ROUND(AVG(duration_seconds), 2) as avg_duration,
        COUNT(*) FILTER (WHERE success = true) as successful_actions,
        COUNT(*) FILTER (WHERE action_type = 'complete') as completed_actions
    FROM feature_usage_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id
)
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.plan,
    COALESCE(uf.features_used, 0) as features_used,
    COALESCE(uf.categories_used, 0) as categories_used,
    COALESCE(uf.total_actions, 0) as total_actions,
    COALESCE(uf.avg_duration, 0) as avg_duration,
    COALESCE(uf.successful_actions, 0) as successful_actions,
    COALESCE(uf.completed_actions, 0) as completed_actions,
    -- Adoption score (0-100)
    LEAST(100, ROUND(
        (COALESCE(uf.features_used, 0) * 5) + 
        (COALESCE(uf.categories_used, 0) * 10) + 
        (COALESCE(uf.completed_actions, 0) * 2)
    )) as adoption_score
FROM users u
LEFT JOIN user_features uf ON u.id = uf.user_id
WHERE u.is_admin = false
ORDER BY adoption_score DESC;

-- View for feature usage trends (daily)
CREATE OR REPLACE VIEW feature_usage_trends AS
SELECT 
    DATE(created_at) as usage_date,
    feature_name,
    feature_category,
    COUNT(*) as daily_uses,
    COUNT(DISTINCT user_id) as daily_unique_users,
    ROUND(AVG(duration_seconds), 2) as avg_duration,
    COUNT(*) FILTER (WHERE success = true) as successful_uses,
    COUNT(*) FILTER (WHERE action_type = 'complete') as completions
FROM feature_usage_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), feature_name, feature_category
ORDER BY usage_date DESC, daily_uses DESC;

-- View for new feature adoption (features launched in last 30 days)
CREATE OR REPLACE VIEW new_feature_adoption AS
WITH feature_first_use AS (
    SELECT 
        feature_name,
        feature_category,
        MIN(created_at) as first_used_at
    FROM feature_usage_logs
    GROUP BY feature_name, feature_category
)
SELECT 
    ffu.feature_name,
    ffu.feature_category,
    ffu.first_used_at,
    CURRENT_DATE - DATE(ffu.first_used_at) as days_since_launch,
    fus.total_uses,
    fus.unique_users,
    fus.success_rate,
    fus.completion_rate,
    -- Adoption velocity (users per day)
    ROUND(
        fus.unique_users::numeric / 
        NULLIF(CURRENT_DATE - DATE(ffu.first_used_at), 0), 
        2
    ) as users_per_day
FROM feature_first_use ffu
JOIN feature_usage_summary fus ON ffu.feature_name = fus.feature_name 
    AND ffu.feature_category = fus.feature_category
WHERE ffu.first_used_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY users_per_day DESC;

-- View for feature errors and issues
CREATE OR REPLACE VIEW feature_error_analysis AS
SELECT 
    feature_name,
    feature_category,
    COUNT(*) as error_count,
    COUNT(DISTINCT user_id) as affected_users,
    ROUND(COUNT(*)::numeric / (
        SELECT COUNT(*) 
        FROM feature_usage_logs ful2 
        WHERE ful2.feature_name = feature_usage_logs.feature_name
    ) * 100, 2) as error_rate,
    MAX(created_at) as last_error_at,
    -- Most common error metadata
    MODE() WITHIN GROUP (ORDER BY metadata::text) as common_error_context
FROM feature_usage_logs
WHERE success = false OR action_type = 'error'
GROUP BY feature_name, feature_category
ORDER BY error_count DESC;
