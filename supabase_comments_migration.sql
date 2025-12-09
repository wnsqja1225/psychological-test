-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    nickname TEXT DEFAULT '익명',
    content TEXT NOT NULL,
    password TEXT, -- Simple password for deletion (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON comments
    FOR SELECT USING (true);

-- Allow public insert access (Anonymous comments)
CREATE POLICY "Allow public insert access" ON comments
    FOR INSERT WITH CHECK (true);

-- Allow deletion if password matches (Complex logic, simplified for now: allow none or owner)
-- For MVP, we might skip deletion or just allow admin deletion.
