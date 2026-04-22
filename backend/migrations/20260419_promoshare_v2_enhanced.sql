-- PromoShare V2 Enhanced Schema
-- Implements weighted eligibility, tiered distribution, user stats tracking, and audit logging

-- ============================================
-- 1. ENHANCED PROMOSHARE CYCLES
-- ============================================

-- Add new columns to existing promoshare_cycles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_cycles' AND column_name = 'cycle_name') THEN
        ALTER TABLE promoshare_cycles ADD COLUMN cycle_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_cycles' AND column_name = 'description') THEN
        ALTER TABLE promoshare_cycles ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_cycles' AND column_name = 'eligibility_config') THEN
        ALTER TABLE promoshare_cycles ADD COLUMN eligibility_config JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_cycles' AND column_name = 'weight_config') THEN
        ALTER TABLE promoshare_cycles ADD COLUMN weight_config JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_cycles' AND column_name = 'selection_method') THEN
        ALTER TABLE promoshare_cycles ADD COLUMN selection_method TEXT DEFAULT 'weighted_draw';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_cycles' AND column_name = 'announcement_at') THEN
        ALTER TABLE promoshare_cycles ADD COLUMN announcement_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_cycles' AND column_name = 'created_by') THEN
        ALTER TABLE promoshare_cycles ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- ============================================
-- 2. PROMOSHARE USER STATS (Per Cycle)
-- ============================================

CREATE TABLE IF NOT EXISTS promoshare_user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES promoshare_cycles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Eligibility tracking
    eligible BOOLEAN DEFAULT FALSE,
    eligibility_reason JSONB DEFAULT '[]',
    disqualified BOOLEAN DEFAULT FALSE,
    disqualified_reason TEXT,
    
    -- Activity counts (for weight calculation)
    verified_moves_count INTEGER DEFAULT 0,
    moments_joined_count INTEGER DEFAULT 0,
    proofs_submitted_count INTEGER DEFAULT 0,
    proofs_approved_count INTEGER DEFAULT 0,
    referral_count INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    
    -- Weight calculation
    base_entry_score INTEGER DEFAULT 0,
    activity_score INTEGER DEFAULT 0,
    streak_bonus INTEGER DEFAULT 0,
    referral_bonus INTEGER DEFAULT 0,
    tier_multiplier NUMERIC(3,2) DEFAULT 1.0,
    special_boost INTEGER DEFAULT 0,
    risk_penalty INTEGER DEFAULT 0,
    final_weight INTEGER DEFAULT 0,
    
    -- Status and metadata
    status TEXT DEFAULT 'not_qualified', -- not_qualified, qualified, boosted, winner, spotlighted, disqualified, under_review
    risk_score INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 100,
    manual_review_required BOOLEAN DEFAULT FALSE,
    
    -- Entry tracking (explicit entries model)
    total_entries INTEGER DEFAULT 0,
    
    -- Timestamps
    first_activity_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    last_computed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(cycle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_promoshare_user_stats_cycle ON promoshare_user_stats(cycle_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_user_stats_user ON promoshare_user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_user_stats_eligible ON promoshare_user_stats(cycle_id, eligible) WHERE eligible = TRUE;
CREATE INDEX IF NOT EXISTS idx_promoshare_user_stats_status ON promoshare_user_stats(cycle_id, status);
CREATE INDEX IF NOT EXISTS idx_promoshare_user_stats_weight ON promoshare_user_stats(cycle_id, final_weight DESC) WHERE eligible = TRUE;

-- ============================================
-- 3. PROMOSHARE ENTRIES (Explicit Entry Model)
-- ============================================

CREATE TABLE IF NOT EXISTS promoshare_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES promoshare_cycles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Entry source
    source_type TEXT NOT NULL, -- 'move', 'moment', 'referral', 'subscription', 'manual', 'booster', 'sponsor'
    source_id UUID, -- Reference to the source record
    source_action TEXT, -- Specific action type
    
    -- Entry value
    entry_count INTEGER DEFAULT 1,
    weight_value INTEGER DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(cycle_id, user_id, source_type, source_id) WHERE source_id IS NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_promoshare_entries_cycle ON promoshare_entries(cycle_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_entries_user ON promoshare_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_entries_source ON promoshare_entries(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_entries_created ON promoshare_entries(created_at);

-- ============================================
-- 4. ENHANCED PROMOSHARE POOLS
-- ============================================

-- Ensure promoshare_pool_items has all needed columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_pool_items' AND column_name = 'distribution_bucket') THEN
        ALTER TABLE promoshare_pool_items ADD COLUMN distribution_bucket TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_pool_items' AND column_name = 'reward_meta') THEN
        ALTER TABLE promoshare_pool_items ADD COLUMN reward_meta JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_pool_items' AND column_name = 'quantity') THEN
        ALTER TABLE promoshare_pool_items ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_pool_items' AND column_name = 'remaining_quantity') THEN
        ALTER TABLE promoshare_pool_items ADD COLUMN remaining_quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- ============================================
-- 5. ENHANCED PROMOSHARE WINNERS
-- ============================================

-- Ensure promoshare_winners has all needed columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'pool_id') THEN
        ALTER TABLE promoshare_winners ADD COLUMN pool_id UUID REFERENCES promoshare_pool_items(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'selection_bucket') THEN
        ALTER TABLE promoshare_winners ADD COLUMN selection_bucket TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'selection_reason') THEN
        ALTER TABLE promoshare_winners ADD COLUMN selection_reason TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'selection_method') THEN
        ALTER TABLE promoshare_winners ADD COLUMN selection_method TEXT DEFAULT 'weighted_random';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'final_weight_at_selection') THEN
        ALTER TABLE promoshare_winners ADD COLUMN final_weight_at_selection INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'rank_at_selection') THEN
        ALTER TABLE promoshare_winners ADD COLUMN rank_at_selection INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'announced') THEN
        ALTER TABLE promoshare_winners ADD COLUMN announced BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'claimed') THEN
        ALTER TABLE promoshare_winners ADD COLUMN claimed BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'claimed_at') THEN
        ALTER TABLE promoshare_winners ADD COLUMN claimed_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoshare_winners' AND column_name = 'expires_at') THEN
        ALTER TABLE promoshare_winners ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_promoshare_winners_bucket ON promoshare_winners(cycle_id, selection_bucket);
CREATE INDEX IF NOT EXISTS idx_promoshare_winners_announced ON promoshare_winners(cycle_id, announced);

-- ============================================
-- 6. PROMOSHARE AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS promoshare_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID REFERENCES promoshare_cycles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Action details
    action_type TEXT NOT NULL, -- 'cycle_created', 'cycle_started', 'cycle_ended', 'user_qualified', 'weight_updated', 'winner_selected', 'prize_distributed', 'eligibility_changed', 'manual_override', 'sponsorship_added'
    actor_type TEXT NOT NULL DEFAULT 'system', -- 'system', 'admin', 'user', 'agent'
    actor_id UUID,
    
    -- Payload
    payload JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_audit_cycle ON promoshare_audit_log(cycle_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_audit_user ON promoshare_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_audit_action ON promoshare_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_promoshare_audit_created ON promoshare_audit_log(created_at);

-- ============================================
-- 7. PROMOSHARE NOTIFICATIONS QUEUE
-- ============================================

CREATE TABLE IF NOT EXISTS promoshare_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID REFERENCES promoshare_cycles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type TEXT NOT NULL, -- 'cycle_started', 'became_eligible', 'weight_boosted', 'cycle_ending', 'winner_announcement', 'prize_claimable', 'prize_expiring'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery
    channels JSONB DEFAULT '["in_app"]', -- ['in_app', 'email', 'push']
    delivered_channels JSONB DEFAULT '[]',
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Metadata
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_promoshare_notif_user ON promoshare_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_promoshare_notif_cycle ON promoshare_notifications(cycle_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_notif_scheduled ON promoshare_notifications(scheduled_at) WHERE delivered_at IS NULL;

-- ============================================
-- 8. VIEWS FOR ANALYTICS
-- ============================================

-- Cycle summary view
CREATE OR REPLACE VIEW promoshare_cycle_summary AS
SELECT 
    c.id as cycle_id,
    c.cycle_type,
    c.cycle_name,
    c.status,
    c.start_at,
    c.end_at,
    COUNT(DISTINCT us.user_id) as total_participants,
    COUNT(DISTINCT CASE WHEN us.eligible THEN us.user_id END) as eligible_users,
    COUNT(DISTINCT CASE WHEN us.status = 'winner' THEN us.user_id END) as total_winners,
    COALESCE(SUM(pi.amount), 0) as total_pool_value,
    COALESCE(SUM(CASE WHEN pi.reward_type = 'gem' THEN pi.amount ELSE 0 END), 0) as gem_pool,
    COALESCE(SUM(CASE WHEN pi.reward_type = 'cash' THEN pi.amount ELSE 0 END), 0) as cash_pool
FROM promoshare_cycles c
LEFT JOIN promoshare_user_stats us ON us.cycle_id = c.id
LEFT JOIN promoshare_pool_items pi ON pi.cycle_id = c.id
GROUP BY c.id, c.cycle_type, c.cycle_name, c.status, c.start_at, c.end_at;

-- User PromoShare history view
CREATE OR REPLACE VIEW promoshare_user_history AS
SELECT 
    us.user_id,
    c.id as cycle_id,
    c.cycle_type,
    c.cycle_name,
    c.start_at,
    c.end_at,
    us.eligible,
    us.status,
    us.final_weight,
    us.verified_moves_count,
    us.moments_joined_count,
    us.referral_count,
    us.rank_at_selection,
    EXISTS(SELECT 1 FROM promoshare_winners w WHERE w.cycle_id = c.id AND w.user_id = us.user_id) as was_winner,
    (SELECT jsonb_agg(jsonb_build_object(
        'prize_description', w.prize_description,
        'selection_bucket', w.selection_bucket,
        'claimed', w.claimed
    )) FROM promoshare_winners w WHERE w.cycle_id = c.id AND w.user_id = us.user_id) as prizes
FROM promoshare_user_stats us
JOIN promoshare_cycles c ON c.id = us.cycle_id
ORDER BY c.start_at DESC;

-- ============================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_promoshare_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists to avoid errors
DROP TRIGGER IF EXISTS update_promoshare_user_stats_updated_at ON promoshare_user_stats;

CREATE TRIGGER update_promoshare_user_stats_updated_at
    BEFORE UPDATE ON promoshare_user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_promoshare_updated_at();

-- Function to log audit entry
CREATE OR REPLACE FUNCTION log_promoshare_audit(
    p_cycle_id UUID,
    p_user_id UUID,
    p_action_type TEXT,
    p_actor_type TEXT,
    p_actor_id UUID,
    p_payload JSONB
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO promoshare_audit_log (cycle_id, user_id, action_type, actor_type, actor_id, payload)
    VALUES (p_cycle_id, p_user_id, p_action_type, p_actor_type, p_actor_id, p_payload)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on new tables
ALTER TABLE promoshare_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoshare_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoshare_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoshare_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoshare_notifications ENABLE ROW LEVEL SECURITY;

-- Users can see their own stats
CREATE POLICY "Users can view own stats" ON promoshare_user_stats
    FOR SELECT USING (user_id = auth.uid());

-- Users can see their own entries
CREATE POLICY "Users can view own entries" ON promoshare_entries
    FOR SELECT USING (user_id = auth.uid());

-- Users can see their own wins
CREATE POLICY "Users can view own wins" ON promoshare_winners
    FOR SELECT USING (user_id = auth.uid());

-- Users can see their own notifications
CREATE POLICY "Users can view own notifications" ON promoshare_notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can mark notifications as read
CREATE POLICY "Users can update own notifications" ON promoshare_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Admin policies (full access)
CREATE POLICY "Admins have full access to user_stats" ON promoshare_user_stats
    FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins have full access to entries" ON promoshare_entries
    FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins have full access to winners" ON promoshare_winners
    FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins have full access to audit log" ON promoshare_audit_log
    FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins have full access to notifications" ON promoshare_notifications
    FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================
-- 11. SEED CONFIGURATION
-- ============================================

-- Insert default weight configuration if not exists
INSERT INTO promoshare_cycles (cycle_type, status, eligibility_config, weight_config)
SELECT 
    'monthly',
    'draft',
    jsonb_build_object(
        'min_verified_moves', 3,
        'min_moments_joined', 1,
        'min_referrals', 1,
        'subscription_qualifies', true,
        'min_activity_score', 10
    ),
    jsonb_build_object(
        'base_entry', 1,
        'move_weight', 1,
        'moment_weight', 2,
        'referral_weight', 3,
        'streak_weight', 2,
        'subscription_multiplier', 1.5,
        'free_tier_multiplier', 1.0,
        'paid_tier_multiplier', 1.5,
        'risk_penalty_per_flag', 10
    )
WHERE NOT EXISTS (
    SELECT 1 FROM promoshare_cycles WHERE cycle_type = 'monthly' AND status = 'draft'
);

COMMENT ON TABLE promoshare_user_stats IS 'Per-user, per-cycle activity tracking and weight calculation';
COMMENT ON TABLE promoshare_entries IS 'Individual entry records for weighted draw system';
COMMENT ON TABLE promoshare_audit_log IS 'Complete audit trail for PromoShare operations';
COMMENT ON TABLE promoshare_notifications IS 'Notification queue for PromoShare events';
