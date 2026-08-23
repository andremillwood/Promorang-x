-- =============================================
-- USER INTENT & CONTINUITY ENGINE
-- Stores in-progress drafts, active session goals, and recent intent history
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_intent_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_intent_key VARCHAR(100) NOT NULL DEFAULT 'explore_perks',
    active_draft_type VARCHAR(100),
    active_draft_id VARCHAR(255),
    active_draft_title VARCHAR(255),
    active_draft_payload JSONB DEFAULT '{}'::jsonb,
    draft_step_index INTEGER DEFAULT 0,
    draft_step_total INTEGER DEFAULT 1,
    recent_intents JSONB DEFAULT '[]'::jsonb,
    dismissed_draft_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_intent_states_user_id ON public.user_intent_states(user_id);

-- Enable RLS
ALTER TABLE public.user_intent_states ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own intent state"
    ON public.user_intent_states FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intent state"
    ON public.user_intent_states FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intent state"
    ON public.user_intent_states FOR UPDATE
    USING (auth.uid() = user_id);
