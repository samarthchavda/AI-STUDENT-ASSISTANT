-- Learning Behavior Analytics Migration
-- Tracks user learning patterns, preferences, and study habits

-- Create learning_behavior_logs table
CREATE TABLE IF NOT EXISTS learning_behavior_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(100),
    category VARCHAR(100),
    difficulty VARCHAR(20),
    company VARCHAR(100),
    action_type VARCHAR(50), -- start_practice, complete_question, skip_question, view_solution
    time_of_day VARCHAR(20), -- morning, afternoon, evening, night
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_behavior_user_id ON learning_behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_behavior_created_at ON learning_behavior_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_learning_behavior_topic ON learning_behavior_logs(topic);
CREATE INDEX IF NOT EXISTS idx_learning_behavior_category ON learning_behavior_logs(category);
CREATE INDEX IF NOT EXISTS idx_learning_behavior_company ON learning_behavior_logs(company);

-- Create materialized view for quick analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS learning_behavior_summary AS
SELECT 
    user_id,
    COUNT(*) as total_actions,
    COUNT(DISTINCT topic) as unique_topics,
    COUNT(DISTINCT category) as unique_categories,
    COUNT(DISTINCT company) as unique_companies,
    MODE() WITHIN GROUP (ORDER BY topic) as most_practiced_topic,
    MODE() WITHIN GROUP (ORDER BY category) as most_practiced_category,
    MODE() WITHIN GROUP (ORDER BY difficulty) as preferred_difficulty,
    MODE() WITHIN GROUP (ORDER BY company) as favorite_company,
    MODE() WITHIN GROUP (ORDER BY time_of_day) as peak_study_time,
    COUNT(*) FILTER (WHERE action_type = 'complete_question') as completed_count,
    COUNT(*) FILTER (WHERE action_type = 'skip_question') as skipped_count,
    COUNT(*) FILTER (WHERE action_type = 'view_solution') as solutions_viewed,
    MAX(created_at) as last_activity
FROM learning_behavior_logs
GROUP BY user_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_behavior_summary_user_id 
ON learning_behavior_summary(user_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_learning_behavior_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY learning_behavior_summary;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-refresh summary (optional - can be scheduled instead)
-- Note: This is commented out as it might be too frequent. Consider using a cron job instead.
-- CREATE OR REPLACE FUNCTION trigger_refresh_learning_behavior_summary()
-- RETURNS trigger AS $$
-- BEGIN
--     PERFORM refresh_learning_behavior_summary();
--     RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER refresh_learning_behavior_summary_trigger
-- AFTER INSERT OR UPDATE OR DELETE ON learning_behavior_logs
-- FOR EACH STATEMENT
-- EXECUTE FUNCTION trigger_refresh_learning_behavior_summary();
