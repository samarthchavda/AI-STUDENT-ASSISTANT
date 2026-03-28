-- DSA Practice Module Database Schema
-- Run this migration to create all DSA-related tables

BEGIN;

-- DSA Problems Table
CREATE TABLE IF NOT EXISTS dsa_problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    topic VARCHAR NOT NULL,
    difficulty VARCHAR NOT NULL,
    company VARCHAR,
    constraints TEXT,
    examples TEXT,
    starter_code_python TEXT,
    starter_code_javascript TEXT,
    starter_code_cpp TEXT,
    test_cases TEXT,
    solution TEXT,
    hints TEXT,
    time_complexity VARCHAR,
    space_complexity VARCHAR,
    is_daily_challenge BOOLEAN DEFAULT FALSE,
    daily_challenge_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dsa_problems_topic ON dsa_problems(topic);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_difficulty ON dsa_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_company ON dsa_problems(company);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_daily ON dsa_problems(daily_challenge_date);

-- DSA Submissions Table
CREATE TABLE IF NOT EXISTS dsa_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER NOT NULL REFERENCES dsa_problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    execution_time INTEGER,
    memory_used INTEGER,
    test_cases_passed INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    error_message TEXT,
    ai_feedback TEXT,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dsa_submissions_user ON dsa_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_problem ON dsa_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_created ON dsa_submissions(created_at);

-- DSA Progress Table
CREATE TABLE IF NOT EXISTS dsa_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER NOT NULL REFERENCES dsa_problems(id) ON DELETE CASCADE,
    topic VARCHAR NOT NULL,
    difficulty VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'attempted',
    attempts INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    first_attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    solved_at TIMESTAMP,
    UNIQUE(user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_dsa_progress_user ON dsa_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_progress_topic ON dsa_progress(topic);

-- DSA User Stats Table
CREATE TABLE IF NOT EXISTS dsa_user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    accuracy INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_solved_date DATE,
    rank INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dsa_user_stats_user ON dsa_user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_user_stats_score ON dsa_user_stats(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_user_stats_rank ON dsa_user_stats(rank);

-- DSA Hints Table
CREATE TABLE IF NOT EXISTS dsa_hints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER NOT NULL REFERENCES dsa_problems(id) ON DELETE CASCADE,
    hint_level INTEGER DEFAULT 1,
    hint_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dsa_hints_user ON dsa_hints(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_hints_problem ON dsa_hints(problem_id);

COMMIT;
