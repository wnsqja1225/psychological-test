-- Add Advanced Layout columns to questions table
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS layout_type TEXT DEFAULT 'default', -- 'default', 'fullscreen', 'card_overlay'
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS text_position JSONB DEFAULT '{"top": 10, "left": 50}',
ADD COLUMN IF NOT EXISTS option_style TEXT DEFAULT 'default'; -- 'default', 'glass', 'minimal'

-- Add comment to explain columns
COMMENT ON COLUMN questions.layout_type IS 'Layout mode: default (image box), fullscreen (bg image), card_overlay (floating card)';
COMMENT ON COLUMN questions.text_color IS 'Hex color code for question text';
COMMENT ON COLUMN questions.text_position IS 'JSON object with top/left percentage for text positioning';
COMMENT ON COLUMN questions.option_style IS 'Style preset for option buttons';
