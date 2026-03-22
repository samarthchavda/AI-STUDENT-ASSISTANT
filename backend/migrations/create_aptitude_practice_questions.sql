-- Create aptitude practice questions table for unlimited free practice
CREATE TABLE IF NOT EXISTS aptitude_practice_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    image TEXT,
    has_image BOOLEAN DEFAULT FALSE,
    options JSONB NOT NULL, -- Array of {key: "A", text: "option text"}
    answer VARCHAR(1) NOT NULL, -- A, B, C, or D
    explanation TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Aptitude, Logical, Verbal, etc.
    subcategory VARCHAR(100) NOT NULL, -- time-and-distance, percentage, etc.
    difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard
    tags JSONB, -- Array of tags
    source VARCHAR(100), -- IndiaBix, GeeksforGeeks, etc.
    hash VARCHAR(64) UNIQUE, -- For deduplication
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_aptitude_practice_subcategory ON aptitude_practice_questions(subcategory);
CREATE INDEX IF NOT EXISTS idx_aptitude_practice_difficulty ON aptitude_practice_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_aptitude_practice_category ON aptitude_practice_questions(category);
CREATE INDEX IF NOT EXISTS idx_aptitude_practice_hash ON aptitude_practice_questions(hash);

-- Insert sample question from your example
INSERT INTO aptitude_practice_questions (
    id, question, image, has_image, options, answer, explanation, 
    category, subcategory, difficulty, tags, source, hash
) VALUES (
    '4a2e20d4-b54f-4606-8a8c-6f4bf757fe60',
    'A is thrice as good as workman as B and therefore is able to finish a job in 60 days less than B. Working together, they can do it in:',
    NULL,
    FALSE,
    '[{"key": "A", "text": "20 days"}, {"key": "B", "text": "22½ days"}, {"key": "C", "text": "25 days"}, {"key": "D", "text": "30 days"}]'::jsonb,
    'B',
    'Ratio of times taken by A and B = 1: 3. The time difference is (3 - 1) 2 days while B take 3 days and A takes 1 day. If difference of time is 2 days, B takes 3 days. If difference of time is 60 days, B takes 3 x 60 = 90 days. 2 So, A takes 30 days to do the work. A''s 1 day''s work = 1/30, B''s 1 day''s work = 1/90, (A + B)''s 1 day''s work = 1/30 + 1/90 = 4/90 = 2/45. A and B together can do the work in 45/2 = 22½ days.',
    'Aptitude',
    'Time and Work',
    'medium',
    '["aptitude", "time-and-distance", "distance", "work"]'::jsonb,
    'IndiaBix',
    'fcf6514eb424388cc7536581e446c51a'
) ON CONFLICT (id) DO NOTHING;

-- Verify the table
SELECT COUNT(*) as total_questions FROM aptitude_practice_questions;
