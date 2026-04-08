-- Create company_exam_settings table for admin control
CREATE TABLE IF NOT EXISTS company_exam_settings (
    id SERIAL PRIMARY KEY,
    company_key VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    is_unlocked BOOLEAN DEFAULT true,
    difficulty VARCHAR(50),
    plan_requirement VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_exam_key ON company_exam_settings(company_key);

-- Insert default company exams
INSERT INTO company_exam_settings (company_key, company_name, is_unlocked, difficulty, plan_requirement)
VALUES 
    ('tcs', 'TCS', true, 'Medium', 'free'),
    ('infosys', 'Infosys', true, 'Medium', 'free'),
    ('wipro', 'Wipro', true, 'Easy', 'free'),
    ('amazon', 'Amazon', true, 'Hard', 'free'),
    ('microsoft', 'Microsoft', true, 'Hard', 'free'),
    ('google', 'Google', true, 'Hard', 'free')
ON CONFLICT (company_key) DO NOTHING;
