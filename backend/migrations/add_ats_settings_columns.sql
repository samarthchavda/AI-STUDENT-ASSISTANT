-- Add ATS scoring configuration columns to ai_settings table

-- Add ATS-related columns
ALTER TABLE ai_settings 
ADD COLUMN IF NOT EXISTS ats_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS ats_mode VARCHAR(20) DEFAULT 'normal', -- 'lenient', 'normal', 'strict'
ADD COLUMN IF NOT EXISTS keywords_weight INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS formatting_weight INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS experience_weight INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS skills_weight INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS readability_weight INTEGER DEFAULT 10;

-- Add check constraint to ensure weights total 100
ALTER TABLE ai_settings 
ADD CONSTRAINT check_ats_weights_total 
CHECK (keywords_weight + formatting_weight + experience_weight + skills_weight + readability_weight = 100);

-- Add check constraint for valid ATS mode
ALTER TABLE ai_settings 
ADD CONSTRAINT check_ats_mode 
CHECK (ats_mode IN ('lenient', 'normal', 'strict'));

-- Update existing resume module settings with default ATS values
UPDATE ai_settings 
SET 
    ats_enabled = TRUE,
    ats_mode = 'normal',
    keywords_weight = 25,
    formatting_weight = 20,
    experience_weight = 25,
    skills_weight = 20,
    readability_weight = 10
WHERE module = 'resume' 
AND ats_enabled IS NULL;

-- Add comments
COMMENT ON COLUMN ai_settings.ats_enabled IS 'Enable/disable ATS scoring for resumes';
COMMENT ON COLUMN ai_settings.ats_mode IS 'ATS scoring strictness: lenient, normal, or strict';
COMMENT ON COLUMN ai_settings.keywords_weight IS 'Weight for keywords in ATS score (must total 100 with other weights)';
COMMENT ON COLUMN ai_settings.formatting_weight IS 'Weight for formatting in ATS score';
COMMENT ON COLUMN ai_settings.experience_weight IS 'Weight for experience in ATS score';
COMMENT ON COLUMN ai_settings.skills_weight IS 'Weight for skills in ATS score';
COMMENT ON COLUMN ai_settings.readability_weight IS 'Weight for readability in ATS score';
