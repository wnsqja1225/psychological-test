-- Add layout_config column for storing advanced layout settings (JSONB)
-- This will store things like:
-- Chat: { "senderName": "AI", "senderImage": "...", "delay": 1000 }
-- Swipe: { "swipeLeftLabel": "Nope", "swipeRightLabel": "Like" }
-- Video: { "videoUrl": "..." }

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}'::jsonb;
