-- Add solutions_cache column to dsa_problems table for high-performance caching
ALTER TABLE dsa_problems ADD COLUMN IF NOT EXISTS solutions_cache TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN dsa_problems.solutions_cache IS 'JSON cache of solutions: {"python": "...", "javascript": "...", "cpp": "..."}';
