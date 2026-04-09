-- Performance Trends Analytics Migration
-- Tracks user performance, score improvements, and weak areas

-- Create performance_trends table
CREATE TABLE IF NOT EXISTS performance_trends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(100),
    category VARCHAR(100),
    difficulty VARCHAR(20),
    score_percent DECIMAL(5,2),
    accuracy_percent DECIMAL(5,2),
    time_taken_seconds INTEGER,
    questions_attempted INTEGER,
    questions_correct INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_trends_user_id ON performance_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_trends_created_at ON performance_trends(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_trends_topic ON performance_trends(topic);
CREATE INDEX IF NOT EXISTS idx_performance_trends_category ON performance_trends(category);
CREATE INDEX IF NOT EXISTS idx_performance_trends_user_topic ON performance_trends(user_id, topic);

-- Create materialized view for performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS performance_trends_summary AS
SELECT 
    user_id,
    -- Overall stats
    COUNT(*) as total_attempts,
    ROUND(AVG(score_percent), 2) as avg_score,
    ROUND(AVG(accuracy_percent), 2) as avg_accuracy,
    ROUND(AVG(time_taken_seconds), 2) as avg_time_seconds,
    
    -- Best performance
    MAX(score_percent) as best_score,
    MIN(score_percent) as worst_score,
    
    -- Topic-wise best
    MODE() WITHIN GROUP (ORDER BY topic) as most_practiced_topic,
    
    -- Recent activity
    MAX(created_at) as last_attempt
FROM performance_trends
GROUP BY user_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_performance_trends_summary_user_id 
ON performance_trends_summary(user_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_performance_trends_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY performance_trends_summary;
END;
$$ LANGUAGE plpgsql;

-- View for weak areas (topics with low scores)
CREATE OR REPLACE VIEW user_weak_areas AS
SELECT 
    user_id,
    topic,
    category,
    COUNT(*) as attempts,
    ROUND(AVG(score_percent), 2) as avg_score,
    ROUND(AVG(accuracy_percent), 2) as avg_accuracy
FROM performance_trends
GROUP BY user_id, topic, category
HAVING AVG(score_percent) < 60  -- Consider weak if average score is below 60%
ORDER BY user_id, avg_score ASC;

-- View for strong areas (topics with high scores)
CREATE OR REPLACE VIEW user_strong_areas AS
SELECT 
    user_id,
    topic,
    category,
    COUNT(*) as attempts,
    ROUND(AVG(score_percent), 2) as avg_score,
    ROUND(AVG(accuracy_percent), 2) as avg_accuracy
FROM performance_trends
GROUP BY user_id, topic, category
HAVING AVG(score_percent) >= 80  -- Consider strong if average score is 80% or above
ORDER BY user_id, avg_score DESC;

-- View for top improvers
CREATE OR REPLACE VIEW top_improvers AS
WITH first_attempts AS (
    SELECT 
        user_id,
        AVG(score_percent) as first_avg_score
    FROM (
        SELECT 
            user_id,
            score_percent,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn,
            COUNT(*) OVER (PARTITION BY user_id) as total_count
        FROM performance_trends
    ) ranked
    WHERE rn <= (total_count / 2)  -- First half of attempts
    GROUP BY user_id
),
recent_attempts AS (
    SELECT 
        user_id,
        AVG(score_percent) as recent_avg_score
    FROM (
        SELECT 
            user_id,
            score_percent,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn,
            COUNT(*) OVER (PARTITION BY user_id) as total_count
        FROM performance_trends
    ) ranked
    WHERE rn <= (total_count / 2)  -- Second half of attempts
    GROUP BY user_id
)
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.plan,
    ROUND(fa.first_avg_score, 2) as initial_score,
    ROUND(ra.recent_avg_score, 2) as current_score,
    ROUND(ra.recent_avg_score - fa.first_avg_score, 2) as improvement,
    ROUND(((ra.recent_avg_score - fa.first_avg_score) / NULLIF(fa.first_avg_score, 0)) * 100, 2) as improvement_percent
FROM users u
INNER JOIN first_attempts fa ON u.id = fa.user_id
INNER JOIN recent_attempts ra ON u.id = ra.user_id
WHERE ra.recent_avg_score > fa.first_avg_score  -- Only show improvers
ORDER BY improvement DESC;
