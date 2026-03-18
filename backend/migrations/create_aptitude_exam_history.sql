-- Create aptitude exam history table
CREATE TABLE IF NOT EXISTS aptitude_exam_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    company VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    wrong INTEGER NOT NULL,
    skipped INTEGER NOT NULL,
    score_percent DECIMAL(5,2) NOT NULL,
    exam_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    questions_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exam_history_date ON aptitude_exam_history(exam_date DESC);
CREATE INDEX IF NOT EXISTS idx_exam_history_company ON aptitude_exam_history(company);
CREATE INDEX IF NOT EXISTS idx_exam_history_user ON aptitude_exam_history(user_id);
