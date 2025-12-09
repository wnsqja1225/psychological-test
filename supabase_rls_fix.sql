-- Enable RLS on tests table (if not already)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Allow Public Read on tests
DROP POLICY IF EXISTS "Public Read Tests" ON tests;
CREATE POLICY "Public Read Tests"
ON tests FOR SELECT
USING (true);

-- Allow Public Read on questions
DROP POLICY IF EXISTS "Public Read Questions" ON questions;
CREATE POLICY "Public Read Questions"
ON questions FOR SELECT
USING (true);

-- Allow Public Read on options
DROP POLICY IF EXISTS "Public Read Options" ON options;
CREATE POLICY "Public Read Options"
ON options FOR SELECT
USING (true);

-- Allow Public Read on results
DROP POLICY IF EXISTS "Public Read Results" ON results;
CREATE POLICY "Public Read Results"
ON results FOR SELECT
USING (true);

-- Allow Insert for Anon (for Admin creation - in real app this should be authenticated)
DROP POLICY IF EXISTS "Anon Insert Tests" ON tests;
CREATE POLICY "Anon Insert Tests"
ON tests FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anon Insert Questions" ON questions;
CREATE POLICY "Anon Insert Questions"
ON questions FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anon Insert Options" ON options;
CREATE POLICY "Anon Insert Options"
ON options FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anon Insert Results" ON results;
CREATE POLICY "Anon Insert Results"
ON results FOR INSERT
WITH CHECK (true);
