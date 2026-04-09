-- Engagement Metrics Migration
-- Tracks DAU/WAU/MAU, retention rates, churn prediction, and feature adoption

-- Create engagement_metrics table
CREATE TABLE IF NOT EXISTS engagement_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    is_active_daily BOOLEAN DEFAULT FALSE,
    is_active_weekly BOOLEAN DEFAULT FALSE,
    is_active_monthly BOOLEAN DEFAULT FALSE,
    features_used TEXT[], -- Array of feature names
    session_count INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, metric_date) -- One record per user per day
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_user_id ON engagement_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_date ON engagement_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_user_date ON engagement_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_active_daily ON engagement_metrics(is_active_daily) WHERE is_active_daily = true;
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_active_weekly ON engagement_metrics(is_active_weekly) WHERE is_active_weekly = true;
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_active_monthly ON engagement_metrics(is_active_monthly) WHERE is_active_monthly = true;

-- Function to update daily engagement metrics
CREATE OR REPLACE FUNCTION update_engagement_metrics()
RETURNS void AS $$
BEGIN
    -- Insert or update today's engagement metrics for all active users
    INSERT INTO engagement_metrics (user_id, metric_date, is_active_daily, session_count, total_time_minutes, features_used)
    SELECT 
        user_id,
        CURRENT_DATE,
        true as is_active_daily,
        COUNT(DISTINCT session_id) as session_count,
        ROUND(SUM(duration_seconds) / 60.0) as total_time_minutes,
        ARRAY_AGG(DISTINCT feature_name) FILTER (WHERE feature_name IS NOT NULL) as features_used
    FROM user_activity_logs
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY user_id
    ON CONFLICT (user_id, metric_date) 
    DO UPDATE SET
        is_active_daily = true,
        session_count = EXCLUDED.session_count,
        total_time_minutes = EXCLUDED.total_time_minutes,
        features_used = EXCLUDED.features_used;
    
    -- Update weekly active status (active in last 7 days)
    UPDATE engagement_metrics
    SET is_active_weekly = true
    WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days'
    AND user_id IN (
        SELECT DISTINCT user_id 
        FROM user_activity_logs 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    );
    
    -- Update monthly active status (active in last 30 days)
    UPDATE engagement_metrics
    SET is_active_monthly = true
    WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
    AND user_id IN (
        SELECT DISTINCT user_id 
        FROM user_activity_logs 
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    );
END;
$$ LANGUAGE plpgsql;

-- Materialized view for DAU/WAU/MAU metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS dau_wau_mau_metrics AS
SELECT 
    metric_date,
    -- Daily Active Users
    COUNT(DISTINCT CASE WHEN is_active_daily THEN user_id END) as dau,
    -- Weekly Active Users (last 7 days)
    COUNT(DISTINCT CASE WHEN is_active_weekly THEN user_id END) as wau,
    -- Monthly Active Users (last 30 days)
    COUNT(DISTINCT CASE WHEN is_active_monthly THEN user_id END) as mau,
    -- Stickiness ratio (DAU/MAU)
    ROUND(
        COUNT(DISTINCT CASE WHEN is_active_daily THEN user_id END)::numeric / 
        NULLIF(COUNT(DISTINCT CASE WHEN is_active_monthly THEN user_id END), 0) * 100, 
        2
    ) as stickiness_ratio,
    -- Average sessions per user
    ROUND(AVG(session_count), 2) as avg_sessions_per_user,
    -- Average time per user
    ROUND(AVG(total_time_minutes), 2) as avg_time_per_user
FROM engagement_metrics
WHERE metric_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY metric_date
ORDER BY metric_date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_dau_wau_mau_metrics_date 
ON dau_wau_mau_metrics(metric_date);

-- Function to refresh DAU/WAU/MAU metrics
CREATE OR REPLACE FUNCTION refresh_dau_wau_mau_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dau_wau_mau_metrics;
END;
$$ LANGUAGE plpgsql;

-- View for retention cohorts
CREATE OR REPLACE VIEW retention_cohorts AS
WITH user_cohorts AS (
    SELECT 
        user_id,
        DATE_TRUNC('week', MIN(metric_date)) as cohort_week,
        MIN(metric_date) as first_active_date
    FROM engagement_metrics
    WHERE is_active_daily = true
    GROUP BY user_id
),
cohort_sizes AS (
    SELECT 
        cohort_week,
        COUNT(DISTINCT user_id) as cohort_size
    FROM user_cohorts
    GROUP BY cohort_week
),
cohort_activity AS (
    SELECT 
        uc.cohort_week,
        uc.user_id,
        em.metric_date,
        EXTRACT(WEEK FROM AGE(em.metric_date, uc.first_active_date)) as weeks_since_signup
    FROM user_cohorts uc
    JOIN engagement_metrics em ON uc.user_id = em.user_id
    WHERE em.is_active_daily = true
)
SELECT 
    ca.cohort_week,
    cs.cohort_size,
    ca.weeks_since_signup,
    COUNT(DISTINCT ca.user_id) as active_users,
    ROUND(COUNT(DISTINCT ca.user_id)::numeric / cs.cohort_size * 100, 2) as retention_rate
FROM cohort_activity ca
JOIN cohort_sizes cs ON ca.cohort_week = cs.cohort_week
GROUP BY ca.cohort_week, cs.cohort_size, ca.weeks_since_signup
ORDER BY ca.cohort_week DESC, ca.weeks_since_signup;

-- View for churn risk users
CREATE OR REPLACE VIEW churn_risk_users AS
WITH user_activity_stats AS (
    SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.plan,
        u.created_at as signup_date,
        MAX(em.metric_date) as last_active_date,
        CURRENT_DATE - MAX(em.metric_date) as days_inactive,
        COUNT(DISTINCT em.metric_date) as total_active_days,
        AVG(em.session_count) as avg_sessions_per_day,
        AVG(em.total_time_minutes) as avg_time_per_day
    FROM users u
    LEFT JOIN engagement_metrics em ON u.id = em.user_id
    WHERE u.is_admin = false
    GROUP BY u.id, u.name, u.email, u.plan, u.created_at
)
SELECT 
    user_id,
    name,
    email,
    plan,
    signup_date,
    last_active_date,
    days_inactive,
    total_active_days,
    ROUND(avg_sessions_per_day, 2) as avg_sessions_per_day,
    ROUND(avg_time_per_day, 2) as avg_time_per_day,
    -- Churn risk score (0-100, higher = more risk)
    CASE 
        WHEN days_inactive >= 30 THEN 100
        WHEN days_inactive >= 14 THEN 80
        WHEN days_inactive >= 7 THEN 60
        WHEN days_inactive >= 3 THEN 40
        WHEN avg_sessions_per_day < 1 THEN 30
        ELSE 10
    END as churn_risk_score,
    -- Churn risk level
    CASE 
        WHEN days_inactive >= 30 THEN 'Critical'
        WHEN days_inactive >= 14 THEN 'High'
        WHEN days_inactive >= 7 THEN 'Medium'
        WHEN days_inactive >= 3 THEN 'Low'
        ELSE 'Active'
    END as churn_risk_level
FROM user_activity_stats
WHERE last_active_date IS NOT NULL
ORDER BY churn_risk_score DESC, days_inactive DESC;

-- View for feature adoption rates
CREATE OR REPLACE VIEW feature_adoption_rates AS
WITH feature_usage AS (
    SELECT 
        UNNEST(features_used) as feature_name,
        user_id,
        metric_date
    FROM engagement_metrics
    WHERE features_used IS NOT NULL
    AND metric_date >= CURRENT_DATE - INTERVAL '30 days'
),
total_users AS (
    SELECT COUNT(DISTINCT user_id) as total_active_users
    FROM engagement_metrics
    WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
    AND is_active_daily = true
)
SELECT 
    feature_name,
    COUNT(DISTINCT user_id) as users_count,
    COUNT(*) as usage_count,
    ROUND(COUNT(DISTINCT user_id)::numeric / (SELECT total_active_users FROM total_users) * 100, 2) as adoption_rate,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_id), 2) as avg_uses_per_user
FROM feature_usage
GROUP BY feature_name
ORDER BY adoption_rate DESC;

-- View for user engagement segments
CREATE OR REPLACE VIEW user_engagement_segments AS
WITH user_features AS (
    SELECT 
        user_id,
        COUNT(DISTINCT feature_name) as unique_features_used
    FROM (
        SELECT 
            user_id,
            UNNEST(features_used) as feature_name
        FROM engagement_metrics
        WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
        AND features_used IS NOT NULL
    ) features
    GROUP BY user_id
),
user_engagement_stats AS (
    SELECT 
        user_id,
        COUNT(DISTINCT metric_date) as active_days_last_30,
        SUM(session_count) as total_sessions,
        SUM(total_time_minutes) as total_time_minutes,
        AVG(session_count) as avg_sessions_per_day
    FROM engagement_metrics
    WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id
)
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.plan,
    COALESCE(ues.active_days_last_30, 0) as active_days_last_30,
    COALESCE(ues.total_sessions, 0) as total_sessions,
    COALESCE(ues.total_time_minutes, 0) as total_time_minutes,
    COALESCE(uf.unique_features_used, 0) as unique_features_used,
    -- Engagement segment
    CASE 
        WHEN ues.active_days_last_30 >= 20 AND ues.total_sessions >= 30 THEN 'Power User'
        WHEN ues.active_days_last_30 >= 10 AND ues.total_sessions >= 15 THEN 'Active User'
        WHEN ues.active_days_last_30 >= 5 AND ues.total_sessions >= 5 THEN 'Regular User'
        WHEN ues.active_days_last_30 >= 1 THEN 'Casual User'
        ELSE 'Inactive User'
    END as engagement_segment,
    -- Engagement score (0-100)
    LEAST(100, ROUND(
        (COALESCE(ues.active_days_last_30, 0) * 2) + 
        (COALESCE(ues.total_sessions, 0) * 0.5) + 
        (COALESCE(uf.unique_features_used, 0) * 5)
    )) as engagement_score
FROM users u
LEFT JOIN user_engagement_stats ues ON u.id = ues.user_id
LEFT JOIN user_features uf ON u.id = uf.user_id
WHERE u.is_admin = false
ORDER BY engagement_score DESC;
