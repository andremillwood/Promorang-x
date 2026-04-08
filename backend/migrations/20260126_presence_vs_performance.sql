-- Migration: Phase 12 - Presence vs. Performance Schema
-- Adds support for Moment Anchors and voluntary social linkage

-- 1. Update verified_actions for optional emotional expression
ALTER TABLE verified_actions
ADD COLUMN IF NOT EXISTS expression_url TEXT,
ADD COLUMN IF NOT EXISTS reflection_text TEXT;

-- 2. Update redemptions for persistent Moment Anchors
ALTER TABLE redemptions
ADD COLUMN IF NOT EXISTS moment_anchor TEXT;

-- Index for anchor lookup if needed in future
CREATE INDEX IF NOT EXISTS idx_redemptions_moment_anchor ON redemptions(moment_anchor);

-- Comments
COMMENT ON COLUMN verified_actions.expression_url IS 'Optional URL to a social media post linking expression to verified presence';
COMMENT ON COLUMN verified_actions.reflection_text IS 'Optional user-submitted quote or reflection linked to the verified action';
COMMENT ON COLUMN redemptions.moment_anchor IS 'Verified Moment Anchor string bridging presence to social expression';
