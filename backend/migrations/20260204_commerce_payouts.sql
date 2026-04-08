-- =============================================
-- MIGRATION: COMMERCE & PAYOUT INFRASTRUCTURE
-- DATE: 2026-02-04
-- DESCRIPTION: Adds tables for manual host payouts, payment methods, and transaction ledger.
-- =============================================

-- 1. Payout Methods
-- Stores user's preferred way to get paid (Bank, PayPal, Venmo, manual, etc.)
CREATE TABLE IF NOT EXISTS user_payout_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL, -- 'bank_transfer', 'paypal', 'venmo', 'other'
    details JSONB NOT NULL DEFAULT '{}', -- encrypted or masked details in practice
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Payout Methods
ALTER TABLE user_payout_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payout methods"
    ON user_payout_methods FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payout methods"
    ON user_payout_methods FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payout methods"
    ON user_payout_methods FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payout methods"
    ON user_payout_methods FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Withdrawal Requests
-- Tracks manual requests for payout (>$250 USD)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    payout_method_id UUID REFERENCES user_payout_methods(id),
    status TEXT DEFAULT 'pending', -- pending, processing, completed, rejected, cancelled
    admin_note TEXT,
    transaction_reference TEXT, -- Manual reference code from admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Withdrawal Requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
    ON withdrawal_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
    ON withdrawal_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view/update all
CREATE POLICY "Admins can view all requests"
    ON withdrawal_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master_admin')
        )
    );

CREATE POLICY "Admins can update requests"
    ON withdrawal_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'master_admin')
        )
    );

-- 3. Commerce Transactions (Ledger)
-- If not fully covered by other tables, ensure we have a unified transaction log
-- We will use the existing `transaction_history` or `platform_transactions` if suitable.
-- Based on inspection, `transaction_history` seems used by economyService.
-- Let's add a `metadata` column if it doesn't exist to store order details.

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transaction_history' AND column_name = 'metadata') THEN
        ALTER TABLE transaction_history ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- 4. Triggers
-- Update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_payout_methods_updated_at
BEFORE UPDATE ON user_payout_methods
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
BEFORE UPDATE ON withdrawal_requests
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
