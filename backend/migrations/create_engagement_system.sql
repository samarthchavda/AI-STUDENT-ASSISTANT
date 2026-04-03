-- ============================================
-- ENGAGEMENT & MONETIZATION SYSTEM
-- ============================================

-- Daily Challenge System
CREATE TABLE IF NOT EXISTS daily_challenges (
    id SERIAL PRIMARY KEY,
    challenge_date DATE NOT NULL UNIQUE,
    question_slug VARCHAR(255) NOT NULL,
    question_title VARCHAR(500) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    bonus_points INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_challenge_completions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken INTEGER, -- seconds
    bonus_earned INTEGER DEFAULT 10,
    UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_challenge_date ON daily_challenges(challenge_date DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_completions ON daily_challenge_completions(user_id, completed_at DESC);

-- Company Sheets System
CREATE TABLE IF NOT EXISTS company_sheets (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    difficulty_level VARCHAR(50), -- Beginner, Intermediate, Advanced
    total_questions INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_sheet_questions (
    id SERIAL PRIMARY KEY,
    company_sheet_id INTEGER NOT NULL REFERENCES company_sheets(id) ON DELETE CASCADE,
    question_slug VARCHAR(255) NOT NULL,
    question_title VARCHAR(500) NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- dsa, aptitude
    difficulty VARCHAR(20) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_sheet_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_sheet_id INTEGER NOT NULL REFERENCES company_sheets(id) ON DELETE CASCADE,
    question_slug VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE(user_id, company_sheet_id, question_slug)
);

CREATE INDEX IF NOT EXISTS idx_company_sheets ON company_sheets(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_sheet_questions ON company_sheet_questions(company_sheet_id, display_order);
CREATE INDEX IF NOT EXISTS idx_sheet_progress ON company_sheet_progress(user_id, company_sheet_id);

-- Learning Roadmap System
CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id SERIAL PRIMARY KEY,
    roadmap_name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    total_topics INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmap_topics (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER NOT NULL REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
    topic_name VARCHAR(255) NOT NULL,
    topic_description TEXT,
    display_order INTEGER NOT NULL,
    prerequisite_topic_id INTEGER REFERENCES roadmap_topics(id),
    total_questions INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmap_topic_questions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES roadmap_topics(id) ON DELETE CASCADE,
    question_slug VARCHAR(255) NOT NULL,
    question_title VARCHAR(500) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmap_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES roadmap_topics(id) ON DELETE CASCADE,
    questions_completed INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_topics ON roadmap_topics(roadmap_id, display_order);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress ON roadmap_progress(user_id, topic_id);

-- Premium/Subscription System
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- free, premium, enterprise
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, expired
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    ai_requests_limit INTEGER DEFAULT 10, -- per day for free users
    ai_requests_used INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    payment_id VARCHAR(255),
    amount_paid DECIMAL(10, 2),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS feature_usage_limits (
    id SERIAL PRIMARY KEY,
    plan_type VARCHAR(50) NOT NULL UNIQUE,
    ai_requests_per_day INTEGER DEFAULT 10,
    company_sheets_access VARCHAR(50) DEFAULT 'limited', -- limited, all
    resume_templates_access VARCHAR(50) DEFAULT 'basic', -- basic, premium, all
    daily_challenges BOOLEAN DEFAULT TRUE,
    advanced_analytics BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE
);

-- Notifications System
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- streak_warning, daily_challenge, leaderboard, resume_score
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_notifications ON user_notifications(user_id, is_read, created_at DESC);

-- Resume ATS Tracking
CREATE TABLE IF NOT EXISTS resume_ats_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ats_score INTEGER NOT NULL,
    suggestions TEXT[],
    resume_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resume_history ON resume_ats_history(user_id, created_at DESC);

-- Insert default feature limits
INSERT INTO feature_usage_limits (plan_type, ai_requests_per_day, company_sheets_access, resume_templates_access, daily_challenges, advanced_analytics, priority_support)
VALUES 
    ('free', 10, 'limited', 'basic', TRUE, FALSE, FALSE),
    ('premium', -1, 'all', 'all', TRUE, TRUE, TRUE),
    ('enterprise', -1, 'all', 'all', TRUE, TRUE, TRUE)
ON CONFLICT (plan_type) DO NOTHING;

-- Initialize all existing users with free subscription
INSERT INTO user_subscriptions (user_id, plan_type, status, ai_requests_limit)
SELECT id, 'free', 'active', 10
FROM users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Function to check and reset daily AI usage
CREATE OR REPLACE FUNCTION reset_daily_ai_usage()
RETURNS VOID AS $$
BEGIN
    UPDATE user_subscriptions
    SET ai_requests_used = 0,
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can use AI
CREATE OR REPLACE FUNCTION can_use_ai(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_plan_type VARCHAR(50);
    v_requests_used INTEGER;
    v_requests_limit INTEGER;
BEGIN
    SELECT plan_type, ai_requests_used, ai_requests_limit
    INTO v_plan_type, v_requests_used, v_requests_limit
    FROM user_subscriptions
    WHERE user_id = p_user_id;
    
    -- Premium users have unlimited (-1)
    IF v_requests_limit = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- Check if under limit
    RETURN v_requests_used < v_requests_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Reset if needed
    PERFORM reset_daily_ai_usage();
    
    -- Increment usage
    UPDATE user_subscriptions
    SET ai_requests_used = ai_requests_used + 1
    WHERE user_id = p_user_id
    AND (ai_requests_limit = -1 OR ai_requests_used < ai_requests_limit);
END;
$$ LANGUAGE plpgsql;
