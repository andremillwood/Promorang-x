-- Migration: Verified Actions Schema
-- Implements the Phase 0 action grammar for Being Seen experience

-- Create verified_action_type enum
DO $$ BEGIN
    CREATE TYPE verified_action_type AS ENUM (
        'PLATFORM',
        'CONTENT_PARTICIPATION',
        'CONTENT_CONTRIBUTION',
        'PROMORANG_DROP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create verification_mode enum
DO $$ BEGIN
    CREATE TYPE verification_mode AS ENUM (
        'SYSTEM_EVENT',
        'INTERACTION_LOG',
        'PROOF_UPLOAD'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verified Actions table
-- Every meaningful user action that contributes to recognition
DROP TABLE IF EXISTS verified_actions CASCADE;

CREATE TABLE verified_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type verified_action_type NOT NULL,
    verification_mode verification_mode NOT NULL,
    
    -- Action context
    action_label TEXT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Social Shield eligibility
    social_shield_eligible BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_at TIMESTAMPTZ
);

-- Indexes (wrapped in DO blocks to handle if table was just created)
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_verified_actions_user ON verified_actions(user_id);
EXCEPTION WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_verified_actions_type ON verified_actions(action_type);
EXCEPTION WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_verified_actions_reference ON verified_actions(reference_type, reference_id);
EXCEPTION WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_verified_actions_created ON verified_actions(created_at);
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- RLS Policies (drop first to avoid duplicates)
ALTER TABLE verified_actions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own actions" ON verified_actions;
    CREATE POLICY "Users can view own actions"
        ON verified_actions FOR SELECT
        USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Service can insert actions" ON verified_actions;
    CREATE POLICY "Service can insert actions"
        ON verified_actions FOR INSERT
        WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- Comments
COMMENT ON TABLE verified_actions IS 'Phase 0 verified actions for Being Seen recognition system';
COMMENT ON COLUMN verified_actions.action_type IS 'One of: PLATFORM, CONTENT_PARTICIPATION, CONTENT_CONTRIBUTION, PROMORANG_DROP';
COMMENT ON COLUMN verified_actions.verification_mode IS 'How action was verified: SYSTEM_EVENT, INTERACTION_LOG, or PROOF_UPLOAD';
