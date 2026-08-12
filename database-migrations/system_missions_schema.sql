-- =============================================
-- SYSTEM MISSIONS & DAILY QUESTS SCHEMA
-- =============================================

-- 1. SYSTEM MISSIONS TABLE
-- Stores platform-wide missions (trending media, peer verification, affiliate bounties)
CREATE TABLE IF NOT EXISTS system_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('daily_quest', 'trend_clipping', 'peer_verification', 'affiliate_auto', 'onboarding')),
    reward_gems INT NOT NULL DEFAULT 100,
    proof_type VARCHAR(50) DEFAULT 'url' CHECK (proof_type IN ('url', 'peer_vote', 'action_confirm', 'receipt')),
    target_url TEXT,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DAILY QUESTS USER PROGRESS TABLE
-- Tracks a user's daily quests, progress, and streak counts
CREATE TABLE IF NOT EXISTS user_daily_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quest_date DATE DEFAULT CURRENT_DATE,
    quests_completed INT DEFAULT 0,
    total_quests INT DEFAULT 3,
    streak_days INT DEFAULT 0,
    bonus_gems_earned INT DEFAULT 0,
    quest_state_json JSONB DEFAULT '[]'::jsonb, -- e.g. [{"id": "q1", "title": "Verify 3 Clip Proofs", "done": false, "reward": 50}]
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quest_date)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_system_missions_category ON system_missions(category);
CREATE INDEX IF NOT EXISTS idx_user_daily_quests_user_date ON user_daily_quests(user_id, quest_date);

-- RLS Policies
ALTER TABLE system_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_quests ENABLE ROW LEVEL SECURITY;

-- Public read for active system missions
CREATE POLICY system_missions_public_read ON system_missions
FOR SELECT USING (is_active = true);

-- Users can read & manage their own daily quests
CREATE POLICY user_daily_quests_own_crud ON user_daily_quests
FOR ALL USING (user_id = auth.uid());
