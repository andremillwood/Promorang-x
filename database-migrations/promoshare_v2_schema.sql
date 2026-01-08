-- =============================================
-- PROMOSHARE V2 SCHEMA (Lottery & Revenue)
-- =============================================

-- =============================================
-- 1. UPDATE CYCLES TABLE
-- =============================================
-- Add fields for rollover jackpots
ALTER TABLE promoshare_cycles 
ADD COLUMN IF NOT EXISTS jackpot_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_rollover BOOLEAN DEFAULT FALSE;

-- =============================================
-- 2. UPDATE TICKETS TABLE
-- =============================================
-- Add ticket number for lottery logic (non-unique per cycle allow multiple winners)
ALTER TABLE promoshare_tickets
ADD COLUMN IF NOT EXISTS ticket_number INTEGER;

-- Create index for quick lookup of winning numbers
CREATE INDEX IF NOT EXISTS idx_promoshare_tickets_number ON promoshare_tickets(cycle_id, ticket_number);

-- =============================================
-- 3. REVENUE LEDGER
-- =============================================
-- Track 5% revenue share from platform transactions
CREATE TABLE IF NOT EXISTS promoshare_revenue_ledger (
    id BIGSERIAL PRIMARY KEY,
    source_transaction_id UUID REFERENCES transactions(id), -- Link to original transaction
    source_type VARCHAR(50), -- e.g., 'subscription', 'purchase', 'ad_spend'
    total_amount DECIMAL(15,2) NOT NULL,
    promoshare_amount DECIMAL(15,2) NOT NULL, -- The 5% allocation
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'allocated')), -- allocated means moved to a specific cycle
    allocated_cycle_id BIGINT REFERENCES promoshare_cycles(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_revenue_status ON promoshare_revenue_ledger(status);

-- =============================================
-- 4. SPONSORSHIPS (Advertiser Specific)
-- =============================================
-- Allow advertisers to sponsor specific cycles
CREATE TABLE IF NOT EXISTS promoshare_sponsorships (
    id BIGSERIAL PRIMARY KEY,
    advertiser_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cycle_id BIGINT REFERENCES promoshare_cycles(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('gem', 'key', 'point', 'coupon', 'product')),
    amount DECIMAL(10,2) DEFAULT 0,
    description VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_sponsorships_advertiser ON promoshare_sponsorships(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_sponsorships_cycle ON promoshare_sponsorships(cycle_id);

-- =============================================
-- RLS POLICIES FOR NEW TABLES
-- =============================================

ALTER TABLE promoshare_revenue_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoshare_sponsorships ENABLE ROW LEVEL SECURITY;

-- Only admins can read revenue ledger
CREATE POLICY revenue_ledger_admin_read ON promoshare_revenue_ledger 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.user_type = 'admin')
);

-- Advertisers can read/create their own sponsorships
CREATE POLICY sponsorships_own_crud ON promoshare_sponsorships 
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = promoshare_sponsorships.advertiser_id AND users.mocha_user_id = auth.uid()::text)
);

-- Public can read active sponsorships (for transparency/marketing)
CREATE POLICY sponsorships_public_read ON promoshare_sponsorships 
FOR SELECT USING (status = 'active');
