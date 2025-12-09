-- Add 'type' column to 'tests' table
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'score';

-- Add 'mbti_indicator' column to 'options' table
-- This will store values like 'E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'
ALTER TABLE options 
ADD COLUMN IF NOT EXISTS mbti_indicator text;

-- Add 'mbti_result' column to 'results' table
-- This will store values like 'ISTP', 'ENFJ', etc.
ALTER TABLE results 
ADD COLUMN IF NOT EXISTS mbti_result text;

-- Optional: Add comments for clarity
COMMENT ON COLUMN tests.type IS 'Type of the test: "score" or "mbti"';
COMMENT ON COLUMN options.mbti_indicator IS 'For MBTI tests: The trait this option contributes to (e.g., E, I)';
COMMENT ON COLUMN results.mbti_result IS 'For MBTI tests: The 4-letter result code (e.g., ISTP)';
