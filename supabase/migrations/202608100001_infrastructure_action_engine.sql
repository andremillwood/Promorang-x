-- =============================================
-- PROMORANG INFRASTRUCTURE FOR ORGANIZED HUMAN ACTION
-- Migration: Action Engine, Double-Entry Gem Ledger, Scenes & Activated Referral Attribution
-- Date: 2026-08-10
-- =============================================

-- 1. ENUMS FOR ACTION VERIFICATION & GEM LEDGER
DO $$ BEGIN
    CREATE TYPE action_verification_type AS ENUM (
        'qr_scan', 'geolocation', 'code_entry', 'merchant_confirmation', 'receipt_upload', 'social_link', 'manual_review'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_confidence AS ENUM (
        'low', 'medium', 'high', 'system_verified'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE gem_ledger_state AS ENUM (
        'funded', 'allocated', 'held', 'earned', 'available', 'pending_redemption', 'redeemed', 'refunded', 'reversed', 'expired'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. SCENES & SCENE MEMBERSHIP
CREATE TABLE IF NOT EXISTS scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    tagline TEXT,
    description TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Jamaica',
    image_url TEXT,
    banner_url TEXT,
    steward_id UUID REFERENCES users(id),
    visibility VARCHAR(20) DEFAULT 'public',
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    activated_members_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scene_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'member',
    status VARCHAR(30) DEFAULT 'active',
    actions_completed_count INT DEFAULT 0,
    people_brought_count INT DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scene_id, user_id)
);

-- 3. THE ATOMIC UNIT: ACTIONS
CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id),
    scene_id UUID REFERENCES scenes(id),
    merchant_id UUID REFERENCES users(id),
    brand_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    verification_type action_verification_type NOT NULL DEFAULT 'qr_scan',
    points_reward INT DEFAULT 0,
    gems_reward_amount DECIMAL(10,2) DEFAULT 0,
    promoshare_tickets INT DEFAULT 0,
    required_key_slug VARCHAR(100),
    eligibility_rules JSONB DEFAULT '{}'::jsonb,
    capacity INT,
    completion_count INT DEFAULT 0,
    activated_attribution_count INT DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACTION COMPLETIONS & PROOF
CREATE TABLE IF NOT EXISTS action_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referrer_id UUID REFERENCES users(id),
    scene_id UUID REFERENCES scenes(id),
    verification_status VARCHAR(30) DEFAULT 'pending',
    confidence verification_confidence DEFAULT 'low',
    proof_data JSONB DEFAULT '{}'::jsonb,
    points_awarded INT DEFAULT 0,
    gems_awarded DECIMAL(10,2) DEFAULT 0,
    promoshare_tickets_awarded INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(action_id, user_id)
);

-- 5. AUDITABLE DOUBLE-ENTRY GEM LEDGER
CREATE TABLE IF NOT EXISTS gem_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(12,2) NOT NULL,
    currency_basis VARCHAR(10) DEFAULT 'USD',
    state gem_ledger_state NOT NULL,
    source_wallet_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(100) NOT NULL,
    destination_wallet_type VARCHAR(50) NOT NULL,
    destination_id VARCHAR(100) NOT NULL,
    action_id UUID REFERENCES actions(id),
    campaign_id UUID,
    scene_id UUID REFERENCES scenes(id),
    reference_reason TEXT NOT NULL,
    actor_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. USER ACTIVATION & ATTRIBUTION GRAPH
CREATE TABLE IF NOT EXISTS user_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    referrer_id UUID REFERENCES users(id),
    origin_scene_id UUID REFERENCES scenes(id),
    origin_action_id UUID REFERENCES actions(id),
    activation_score INT DEFAULT 0,
    is_activated BOOLEAN DEFAULT FALSE,
    qualifying_actions_count INT DEFAULT 0,
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_scenes_slug ON scenes(slug);
CREATE INDEX IF NOT EXISTS idx_scenes_steward_id ON scenes(steward_id);
CREATE INDEX IF NOT EXISTS idx_scene_members_scene_user ON scene_members(scene_id, user_id);
CREATE INDEX IF NOT EXISTS idx_actions_slug ON actions(slug);
CREATE INDEX IF NOT EXISTS idx_actions_scene_id ON actions(scene_id);
CREATE INDEX IF NOT EXISTS idx_action_completions_user_id ON action_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_action_completions_action_id ON action_completions(action_id);
CREATE INDEX IF NOT EXISTS idx_gem_ledger_entries_source ON gem_ledger_entries(source_wallet_type, source_id);
CREATE INDEX IF NOT EXISTS idx_gem_ledger_entries_dest ON gem_ledger_entries(destination_wallet_type, destination_id);
CREATE INDEX IF NOT EXISTS idx_user_activations_referrer ON user_activations(referrer_id);

-- FUNCTION: Record Action Completion with Activation Credit
CREATE OR REPLACE FUNCTION record_action_completion(
    p_action_id UUID,
    p_user_id UUID,
    p_proof_data JSONB,
    p_referrer_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_action RECORD;
    v_completion_id UUID;
    v_user_activated BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_action FROM actions WHERE id = p_action_id AND is_active = TRUE;
    IF v_action.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Action not found or inactive');
    END IF;

    -- Insert or fetch completion
    INSERT INTO action_completions (
        action_id, user_id, referrer_id, scene_id, verification_status, confidence, proof_data, points_awarded, gems_awarded, promoshare_tickets_awarded
    ) VALUES (
        p_action_id, p_user_id, p_referrer_id, v_action.scene_id, 'approved', 'system_verified', p_proof_data, v_action.points_reward, v_action.gems_reward_amount, v_action.promoshare_tickets
    ) ON CONFLICT (action_id, user_id) DO UPDATE SET completed_at = NOW()
    RETURNING id INTO v_completion_id;

    -- Update action completion count
    UPDATE actions SET completion_count = completion_count + 1 WHERE id = p_action_id;

    -- Update PromoPoints & Gems balance on users table (synced view)
    UPDATE users SET 
        points_balance = COALESCE(points_balance, 0) + v_action.points_reward,
        gems_balance = COALESCE(gems_balance, 0) + CAST(v_action.gems_reward_amount AS INT)
    WHERE id = p_user_id;

    -- Record Double-Entry Gem Ledger if Gems > 0
    IF v_action.gems_reward_amount > 0 THEN
        INSERT INTO gem_ledger_entries (
            amount, currency_basis, state, source_wallet_type, source_id, destination_wallet_type, destination_id, action_id, scene_id, reference_reason, actor_id
        ) VALUES (
            v_action.gems_reward_amount, 'USD', 'earned', 'brand_campaign_escrow', COALESCE(v_action.brand_id::text, 'system_pool'), 'participant_earning', p_user_id::text, p_action_id, v_action.scene_id, 'Action completion reward', p_user_id
        );
    END IF;

    -- Process User Activation
    INSERT INTO user_activations (user_id, referrer_id, origin_scene_id, origin_action_id, qualifying_actions_count)
    VALUES (p_user_id, p_referrer_id, v_action.scene_id, p_action_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET 
        qualifying_actions_count = user_activations.qualifying_actions_count + 1,
        activation_score = user_activations.activation_score + 25;

    -- Check if user just crossed activation threshold (>= 1 qualifying action)
    SELECT is_activated INTO v_user_activated FROM user_activations WHERE user_id = p_user_id;
    IF NOT v_user_activated THEN
        UPDATE user_activations SET is_activated = TRUE, activated_at = NOW() WHERE user_id = p_user_id;
        
        -- Increment activated count on origin scene if exists
        IF v_action.scene_id IS NOT NULL THEN
            UPDATE scenes SET activated_members_count = activated_members_count + 1 WHERE id = v_action.scene_id;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'completion_id', v_completion_id,
        'points_awarded', v_action.points_reward,
        'gems_awarded', v_action.gems_reward_amount,
        'promoshare_tickets', v_action.promoshare_tickets,
        'is_activated', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
