-- Add 'theme_color' to 'tests' table
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#8b5cf6';

COMMENT ON COLUMN tests.theme_color IS 'Primary theme color for the test (hex code)';
