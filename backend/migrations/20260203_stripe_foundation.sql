-- =============================================
-- MIGRATION: STRIPE INTEGRATION FOUNDATION
-- DATE: 2026-02-03
-- DESCRIPTION: Adds Stripe-related fields to Orgs, Profiles, and Transactions.
-- =============================================

-- 1. Organizations: Stripe Connect Fields
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending', -- pending, active, restricted
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- 2. Profiles: Stripe Customer Fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 3. Transactions: Stripe Session Tracking
-- 3. Transactions: Stripe Session Tracking
ALTER TABLE transaction_history 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 4. User Wallet Logic (for displaying balances)
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON user_wallets(user_id);
