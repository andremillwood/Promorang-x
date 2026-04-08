-- Phase 28: Stripe Integration
-- Migration: 20260204_stripe_integration.sql
-- Description: Adds Stripe Connect support and payment intent tracking

-- Update user_payout_methods to support Stripe Connect
ALTER TABLE user_payout_methods
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT CHECK (stripe_account_status IN ('pending', 'active', 'restricted', 'disabled')),
ADD COLUMN IF NOT EXISTS stripe_capabilities JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false;

-- Create index for Stripe account lookups
CREATE INDEX IF NOT EXISTS idx_payout_methods_stripe_account 
ON user_payout_methods(stripe_account_id) 
WHERE stripe_account_id IS NOT NULL;

-- Stripe Payment Intents Table
-- Tracks all payment intents created for marketplace purchases
CREATE TABLE IF NOT EXISTS stripe_payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN (
        'requires_payment_method',
        'requires_confirmation',
        'requires_action',
        'processing',
        'requires_capture',
        'canceled',
        'succeeded'
    )),
    payment_method_types TEXT[] DEFAULT ARRAY['card'],
    metadata JSONB DEFAULT '{}',
    last_payment_error JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment intent queries
CREATE INDEX IF NOT EXISTS idx_stripe_payment_intents_user 
ON stripe_payment_intents(user_id);

CREATE INDEX IF NOT EXISTS idx_stripe_payment_intents_stripe_id 
ON stripe_payment_intents(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_stripe_payment_intents_status 
ON stripe_payment_intents(status);

CREATE INDEX IF NOT EXISTS idx_stripe_payment_intents_created 
ON stripe_payment_intents(created_at DESC);

-- Stripe Webhook Events Table
-- Logs all webhook events from Stripe for debugging and audit
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processing_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Index for webhook event processing
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type 
ON stripe_webhook_events(event_type);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed 
ON stripe_webhook_events(processed, created_at);

-- Row Level Security Policies

-- stripe_payment_intents RLS
ALTER TABLE stripe_payment_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment intents"
    ON stripe_payment_intents FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can manage all payment intents"
    ON stripe_payment_intents FOR ALL
    USING (true)
    WITH CHECK (true);

-- stripe_webhook_events RLS (admin only)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view webhook events"
    ON stripe_webhook_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "System can manage webhook events"
    ON stripe_webhook_events FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stripe_payment_intent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stripe_payment_intents_updated_at 
BEFORE UPDATE ON stripe_payment_intents
FOR EACH ROW EXECUTE FUNCTION update_stripe_payment_intent_timestamp();

-- Comments for documentation
COMMENT ON TABLE stripe_payment_intents IS 'Tracks Stripe payment intents for marketplace purchases';
COMMENT ON TABLE stripe_webhook_events IS 'Logs all Stripe webhook events for audit and debugging';
COMMENT ON COLUMN user_payout_methods.stripe_account_id IS 'Stripe Connect account ID for automated payouts';
COMMENT ON COLUMN user_payout_methods.stripe_account_status IS 'Current status of the Stripe Connect account';
COMMENT ON COLUMN user_payout_methods.stripe_capabilities IS 'Stripe account capabilities (charges_enabled, transfers_enabled, etc.)';
