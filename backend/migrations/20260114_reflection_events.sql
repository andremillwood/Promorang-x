-- Migration: Reflection Events Schema
-- System-generated recognition derived from verified actions

DROP TABLE IF EXISTS reflection_events CASCADE;

CREATE TABLE reflection_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event content (human-readable, no backend jargon)
    message TEXT NOT NULL, -- "You engaged with 3 drops this week"
    category TEXT NOT NULL DEFAULT 'activity', -- 'activity', 'milestone', 'streak', 'community'
    
    -- Visual styling hints
    icon TEXT DEFAULT 'sparkles', -- Lucide icon name
    accent_color TEXT DEFAULT 'blue', -- Theme color
    
    -- Source tracking (internal only, never shown to user)
    source_action_ids UUID[] DEFAULT '{}', -- Which verified_actions generated this
    
    -- Display rules
    priority INTEGER DEFAULT 0, -- Higher = more prominent
    shown_at TIMESTAMPTZ, -- When user saw this reflection
    dismissed_at TIMESTAMPTZ, -- If user dismisses it
    expires_at TIMESTAMPTZ, -- Auto-hide after this time
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reflection_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reflection_events_user_date ON reflection_events(user_id, reflection_date);
CREATE INDEX IF NOT EXISTS idx_reflection_events_category ON reflection_events(category);
CREATE INDEX IF NOT EXISTS idx_reflection_events_priority ON reflection_events(priority DESC);

-- RLS Policies
ALTER TABLE reflection_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
    ON reflection_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service can insert reflections"
    ON reflection_events FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own reflections"
    ON reflection_events FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE reflection_events IS 'System-generated recognition messages for Being Seen experience';
COMMENT ON COLUMN reflection_events.message IS 'Human-readable reflection, no backend jargon';
COMMENT ON COLUMN reflection_events.category IS 'Grouping: activity, milestone, streak, community';
