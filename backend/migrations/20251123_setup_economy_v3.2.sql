-- =====================================================
-- PROMORANG ECONOMY v3.2 SETUP
-- Adds User Balances and Transaction History
-- =====================================================

-- 1. USER BALANCES TABLE
-- Tracks current holdings of all currencies for each user
CREATE TABLE IF NOT EXISTS user_balances (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Currencies
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    promokeys INTEGER DEFAULT 0 CHECK (promokeys >= 0),
    gems NUMERIC(15, 2) DEFAULT 0 CHECK (gems >= 0), -- Storing as numeric for precision
    gold INTEGER DEFAULT 0 CHECK (gold >= 0),
    
    -- Master Key Status
    master_key_unlocked BOOLEAN DEFAULT false,
    master_key_expires_at TIMESTAMPTZ,
    
    -- Metadata for caps and tracking
    last_daily_conversion_reset TIMESTAMPTZ DEFAULT NOW(),
    daily_conversions_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE TRIGGER update_user_balances_updated_at
    BEFORE UPDATE ON user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user balance on user creation (optional, if we want auto-create)
-- Assuming app logic handles creation or we add a trigger on users table. 
-- For now, we'll let service handle creation or add a trigger if needed.
-- Let's add a trigger on users table to be safe and ensure every user has a balance record.
CREATE OR REPLACE FUNCTION create_user_balance_entry()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_balances (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
DROP TRIGGER IF EXISTS trigger_create_user_balance ON users;
CREATE TRIGGER trigger_create_user_balance
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_balance_entry();

-- Backfill existing users
INSERT INTO user_balances (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;


-- 2. TRANSACTION HISTORY TABLE
-- Immutable record of all economy changes
CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    currency VARCHAR(20) NOT NULL CHECK (currency IN ('points', 'promokeys', 'gems', 'gold')),
    amount NUMERIC(15, 2) NOT NULL, -- Positive for earn, Negative for spend
    
    transaction_type VARCHAR(50) NOT NULL, -- e.g., 'earn', 'spend', 'conversion', 'admin_adjustment'
    source VARCHAR(50) NOT NULL, -- e.g., 'social_like', 'drop_entry', 'shop_purchase', 'daily_unlock'
    
    reference_id UUID, -- Optional link to post_id, drop_id, etc.
    reference_table VARCHAR(50), -- Table name of the reference_id
    
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_currency ON transaction_history(user_id, currency);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transaction_history(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transaction_history(source, reference_id);

