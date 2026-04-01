-- Resume Admin Tables Migration
-- Creates tables for tracking resume usage and AI generation logs

-- Resume Tracking Table
CREATE TABLE IF NOT EXISTS resume_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    template_id VARCHAR(50) NOT NULL,
    template_name VARCHAR(100),
    template_tier VARCHAR(20) DEFAULT 'free', -- 'free' or 'premium'
    ats_score INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT FALSE,
    pdf_export_count INTEGER DEFAULT 0,
    resume_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for resume_tracking
CREATE INDEX IF NOT EXISTS idx_resume_tracking_user ON resume_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_tracking_template ON resume_tracking(template_id);
CREATE INDEX IF NOT EXISTS idx_resume_tracking_created ON resume_tracking(created_at);

-- AI Generation Logs Table
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module VARCHAR(50) DEFAULT 'resume', -- 'resume', 'chat', 'dsa', etc.
    request_type VARCHAR(50), -- 'summary', 'experience', 'project', 'optimize', 'template_recommendation'
    status VARCHAR(20), -- 'success', 'failure'
    response_time_ms INTEGER, -- response time in milliseconds
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ai_generation_logs
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_module ON ai_generation_logs(module);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_generation_logs(request_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_status ON ai_generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_generation_logs(created_at);

-- Add comments for documentation
COMMENT ON TABLE resume_tracking IS 'Tracks user resume creation, templates used, and export statistics';
COMMENT ON TABLE ai_generation_logs IS 'Logs all AI generation requests for monitoring and analytics';

COMMENT ON COLUMN resume_tracking.template_id IS 'Template identifier (e.g., ats-clean, premium-glass)';
COMMENT ON COLUMN resume_tracking.template_tier IS 'Template tier: free or premium';
COMMENT ON COLUMN resume_tracking.ats_score IS 'ATS compatibility score (0-100)';
COMMENT ON COLUMN resume_tracking.ai_generated IS 'Whether resume was created/optimized using AI';
COMMENT ON COLUMN resume_tracking.pdf_export_count IS 'Number of times resume was exported to PDF';
COMMENT ON COLUMN resume_tracking.resume_data IS 'Complete resume data in JSON format';

COMMENT ON COLUMN ai_generation_logs.module IS 'Module that requested AI generation (resume, chat, dsa, etc.)';
COMMENT ON COLUMN ai_generation_logs.request_type IS 'Type of AI request (summary, experience, project, optimize, etc.)';
COMMENT ON COLUMN ai_generation_logs.response_time_ms IS 'AI API response time in milliseconds';

-- AI Settings Table
CREATE TABLE IF NOT EXISTS ai_settings (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL UNIQUE, -- 'resume', 'chat', 'dsa', etc.
    model_name VARCHAR(100) DEFAULT 'gemini-1.5-flash',
    prompt_version VARCHAR(50) DEFAULT 'v1.0',
    ai_enabled BOOLEAN DEFAULT TRUE,
    free_user_limit INTEGER DEFAULT 5,
    premium_user_limit INTEGER DEFAULT 50,
    settings_data JSONB, -- Additional settings as JSON
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Index for ai_settings
CREATE INDEX IF NOT EXISTS idx_ai_settings_module ON ai_settings(module);

-- Insert default settings for resume module
INSERT INTO ai_settings (module, model_name, prompt_version, ai_enabled, free_user_limit, premium_user_limit)
VALUES ('resume', 'gemini-1.5-flash', 'v1.0', TRUE, 5, 50)
ON CONFLICT (module) DO NOTHING;

COMMENT ON TABLE ai_settings IS 'Stores AI configuration settings per module';
COMMENT ON COLUMN ai_settings.module IS 'Module identifier (resume, chat, dsa, etc.)';
COMMENT ON COLUMN ai_settings.free_user_limit IS 'Daily AI generation limit for free users';
COMMENT ON COLUMN ai_settings.premium_user_limit IS 'Daily AI generation limit for premium users';
COMMENT ON COLUMN ai_settings.updated_by IS 'Admin user who last updated the settings';
