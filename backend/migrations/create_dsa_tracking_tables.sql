-- DSA Submission History Table
CREATE TABLE IF NOT EXISTS dsa_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_slug VARCHAR(255) NOT NULL,
    question_title VARCHAR(500) NOT NULL,
    language VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('run', 'submit')),
    verdict VARCHAR(50) NOT NULL,
    passed_testcases INTEGER DEFAULT 0,
    total_testcases INTEGER DEFAULT 0,
    runtime FLOAT,
    memory INTEGER,
    ai_used BOOLEAN DEFAULT FALSE,
    ai_actions TEXT[], -- Array of AI actions used (hint, explain, solution, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_submissions ON dsa_submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_submissions ON dsa_submissions(question_slug, user_id);
CREATE INDEX IF NOT EXISTS idx_verdict ON dsa_submissions(verdict);

-- DSA User Progress Table
CREATE TABLE IF NOT EXISTS dsa_user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_slug VARCHAR(255) NOT NULL,
    question_title VARCHAR(500) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('solved', 'attempted', 'unsolved')),
    latest_verdict VARCHAR(50),
    latest_language VARCHAR(50),
    best_runtime FLOAT,
    attempts INTEGER DEFAULT 0,
    solved_at TIMESTAMP,
    last_attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, question_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_progress ON dsa_user_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_difficulty ON dsa_user_progress(user_id, difficulty, status);

-- DSA AI Usage Tracking Table (for analytics)
CREATE TABLE IF NOT EXISTS dsa_ai_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_slug VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    language VARCHAR(50),
    response_time FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_ai_usage ON dsa_ai_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_ai_usage ON dsa_ai_usage(question_slug, action_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for dsa_user_progress
DROP TRIGGER IF EXISTS update_dsa_user_progress_updated_at ON dsa_user_progress;
CREATE TRIGGER update_dsa_user_progress_updated_at
    BEFORE UPDATE ON dsa_user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
