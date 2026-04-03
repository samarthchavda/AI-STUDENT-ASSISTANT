-- Add streak and score tracking to dsa_user_progress
ALTER TABLE dsa_user_progress
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard ON dsa_user_progress(score DESC, current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_streak ON dsa_user_progress(user_id, last_active_date);

-- Function to calculate score based on difficulty
CREATE OR REPLACE FUNCTION calculate_dsa_score(difficulty VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    CASE difficulty
        WHEN 'Easy' THEN RETURN 1;
        WHEN 'Medium' THEN RETURN 2;
        WHEN 'Hard' THEN RETURN 3;
        ELSE RETURN 0;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_dsa_streak(p_user_id INTEGER, p_activity_date DATE)
RETURNS VOID AS $$
DECLARE
    v_last_active DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_new_streak INTEGER;
BEGIN
    -- Get current streak data
    SELECT last_active_date, current_streak, longest_streak
    INTO v_last_active, v_current_streak, v_longest_streak
    FROM dsa_user_progress
    WHERE user_id = p_user_id
    LIMIT 1;
    
    -- If no record exists, initialize
    IF v_last_active IS NULL THEN
        v_new_streak := 1;
    -- If same day, keep streak
    ELSIF v_last_active = p_activity_date THEN
        v_new_streak := v_current_streak;
    -- If consecutive day, increment
    ELSIF v_last_active = p_activity_date - INTERVAL '1 day' THEN
        v_new_streak := v_current_streak + 1;
    -- If gap > 1 day, reset
    ELSE
        v_new_streak := 1;
    END IF;
    
    -- Update longest streak if needed
    IF v_new_streak > COALESCE(v_longest_streak, 0) THEN
        v_longest_streak := v_new_streak;
    END IF;
    
    -- Update all progress records for this user
    UPDATE dsa_user_progress
    SET current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        last_active_date = p_activity_date
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
