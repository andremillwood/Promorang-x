-- Email Campaign State Tracking
-- Track onboarding sequences and email campaign progress per user

-- Campaign state table
CREATE TABLE IF NOT EXISTS email_campaign_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sequence_name VARCHAR(50) NOT NULL,  -- 'creator_onboarding', 'advertiser_onboarding', etc.
    current_step INTEGER NOT NULL DEFAULT 0,
    last_email_sent_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one sequence per user
    UNIQUE(user_id, sequence_name)
);

-- Email events table for tracking opens/clicks
CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(20) NOT NULL DEFAULT 'sent',  -- 'sent', 'opened', 'clicked', 'bounced'
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add email preferences to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_digest_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_marketing_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMPTZ;

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_campaign_state_user ON email_campaign_state(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_state_sequence ON email_campaign_state(sequence_name);
CREATE INDEX IF NOT EXISTS idx_email_campaign_state_pending ON email_campaign_state(completed_at) WHERE completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_email_events_user ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(email_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created ON email_events(created_at);

-- Function to auto-start onboarding sequence on user creation
CREATE OR REPLACE FUNCTION start_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
    -- Determine sequence based on user type
    INSERT INTO email_campaign_state (user_id, sequence_name, current_step)
    VALUES (
        NEW.id,
        CASE 
            WHEN NEW.user_type = 'advertiser' THEN 'advertiser_onboarding'
            WHEN NEW.user_type = 'merchant' THEN 'merchant_onboarding'
            ELSE 'creator_onboarding'
        END,
        1  -- Start at step 1 (step 0 is welcome email, already sent)
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Sequence already exists, ignore
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-start onboarding
DROP TRIGGER IF EXISTS trigger_start_onboarding ON users;
CREATE TRIGGER trigger_start_onboarding
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION start_user_onboarding();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON email_campaign_state TO authenticated;
GRANT SELECT, INSERT ON email_events TO authenticated;
