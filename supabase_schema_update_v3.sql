-- Add Ad Config to Tests
ALTER TABLE tests ADD COLUMN IF NOT EXISTS ad_config JSONB DEFAULT '{}'::jsonb;

-- Add Layout Config to Results
ALTER TABLE results ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}'::jsonb;

-- Create Analytics Table
CREATE TABLE IF NOT EXISTS test_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    result_id UUID REFERENCES results(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for test_completions
ALTER TABLE test_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to test_completions"
ON test_completions FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow admin select from test_completions"
ON test_completions FOR SELECT
TO authenticated
USING (true);
