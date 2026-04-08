-- =============================================
-- MIGRATION: POS & ATTRIBUTION INSIGHTS
-- DATE: 2026-02-03
-- DESCRIPTION: Link real-world POS sales to digital participation.
-- =============================================

-- 1. POS Transactions Table
CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    pos_order_id TEXT NOT NULL,
    pos_platform TEXT NOT NULL, -- 'square', 'toast', 'clover'
    gross_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    sku_list JSONB DEFAULT '[]', -- List of items purchased
    customer_email_hash TEXT, -- For privacy-safe matching
    transaction_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, pos_order_id)
);

-- 2. Attribution Events (The "Link" table)
CREATE TABLE IF NOT EXISTS attribution_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participation_event_id UUID REFERENCES participation_events(id) ON DELETE CASCADE,
    pos_transaction_id UUID REFERENCES pos_transactions(id) ON DELETE CASCADE,
    attribution_type TEXT DEFAULT 'time_window', -- proximity, email_match, qr_scan
    confidence_score DECIMAL(3,2) DEFAULT 1.00,
    attributed_value DECIMAL(12,2) NOT NULL, -- How much of the transaction is attributed to the brand
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_pos_tx_venue ON pos_transactions(venue_id);
CREATE INDEX IF NOT EXISTS idx_pos_tx_date ON pos_transactions(transaction_at);
CREATE INDEX IF NOT EXISTS idx_attr_participation ON attribution_events(participation_event_id);

-- 4. View for Brand ROI
CREATE OR REPLACE VIEW view_brand_roi AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.organization_id as brand_org_id,
    SUM(ae.attributed_value) as total_attributed_sales,
    COUNT(ae.id) as total_attributed_conversions,
    m.budget as campaign_spent
FROM campaigns c
JOIN moments m ON m.campaign_id = c.id
JOIN participation_events pe ON pe.moment_id = m.id
JOIN attribution_events ae ON ae.participation_event_id = pe.id
GROUP BY c.id, c.name, c.organization_id, m.budget;
