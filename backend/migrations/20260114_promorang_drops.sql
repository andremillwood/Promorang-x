-- Migration: Promorang-Created Drops
-- First-party prompt-based drops with Phase 0 validation

DROP TABLE IF EXISTS promorang_drop_responses CASCADE;
DROP TABLE IF EXISTS promorang_drops CASCADE;

CREATE TABLE promorang_drops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Prompt content
    prompt_text TEXT NOT NULL,
    prompt_category TEXT NOT NULL DEFAULT 'cultural',
    prompt_order INTEGER NOT NULL DEFAULT 0,
    
    -- Activation window
    active_from DATE,
    active_until DATE,
    is_evergreen BOOLEAN DEFAULT false,
    
    -- Phase 0 validation rules
    requires_proof BOOLEAN DEFAULT true,
    max_daily_responses INTEGER DEFAULT 100,
    
    -- Reward config
    reward_type TEXT DEFAULT 'recognition',
    reward_amount INTEGER DEFAULT 0,
    
    -- Social Shield eligibility
    social_shield_applies BOOLEAN DEFAULT true,
    
    -- Stats
    total_responses INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User responses to Promorang drops
CREATE TABLE promorang_drop_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drop_id UUID NOT NULL REFERENCES promorang_drops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Response content
    response_text TEXT,
    proof_url TEXT,
    proof_type TEXT DEFAULT 'image',
    
    -- Verification
    verified_action_id UUID REFERENCES verified_actions(id),
    status TEXT DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_at TIMESTAMPTZ,
    
    -- Prevent duplicate responses per day
    response_date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(drop_id, user_id, response_date)
);

-- Insert first 10 cultural prompts
INSERT INTO promorang_drops (prompt_text, prompt_category, prompt_order, is_evergreen, reward_type)
VALUES
    ('Share your favorite local spot', 'cultural', 1, true, 'recognition'),
    ('What song is on repeat?', 'personal', 2, true, 'recognition'),
    ('First thing you reach for in the morning?', 'personal', 3, true, 'recognition'),
    ('Describe today in 3 words', 'personal', 4, true, 'recognition'),
    ('What made you smile this week?', 'personal', 5, true, 'recognition'),
    ('Your go-to comfort food?', 'cultural', 6, true, 'recognition'),
    ('Best piece of advice you''ve received?', 'personal', 7, true, 'recognition'),
    ('What are you grateful for today?', 'personal', 8, true, 'recognition'),
    ('A skill you''d like to learn?', 'personal', 9, true, 'recognition'),
    ('Hidden gem in your city?', 'cultural', 10, true, 'recognition')
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promorang_drops_active ON promorang_drops(active_from, active_until) WHERE is_evergreen = false;
CREATE INDEX IF NOT EXISTS idx_promorang_drops_evergreen ON promorang_drops(is_evergreen) WHERE is_evergreen = true;
CREATE INDEX IF NOT EXISTS idx_promorang_drop_responses_user ON promorang_drop_responses(user_id, response_date);
CREATE INDEX IF NOT EXISTS idx_promorang_drop_responses_drop ON promorang_drop_responses(drop_id, status);

-- RLS Policies
ALTER TABLE promorang_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE promorang_drop_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active drops"
    ON promorang_drops FOR SELECT
    USING (is_evergreen = true OR (active_from <= CURRENT_DATE AND active_until >= CURRENT_DATE));

CREATE POLICY "Users can view own responses"
    ON promorang_drop_responses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create responses"
    ON promorang_drop_responses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE promorang_drops IS 'First-party prompt-based drops for Being Seen experience';
COMMENT ON TABLE promorang_drop_responses IS 'User responses to Promorang-created prompts';
