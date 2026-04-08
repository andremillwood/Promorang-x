-- =============================================
-- MIGRATION: AR FRAME SUPPORT
-- DATE: 2026-02-03
-- DESCRIPTION: Add branded overlay support to moments.
-- =============================================

ALTER TABLE moments ADD COLUMN IF NOT EXISTS frame_url TEXT;

-- Update existing moments with a placeholder if needed (optional)
-- UPDATE moments SET frame_url = 'https://example.com/placeholder-frame.png' WHERE frame_url IS NULL;
