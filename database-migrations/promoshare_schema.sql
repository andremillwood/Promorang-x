-- =============================================
-- PROMOSHARE SCHEMA
-- =============================================

-- =============================================
-- PROMOSHARE CYCLES
-- =============================================
CREATE TABLE promoshare_cycles (
    id BIGSERIAL PRIMARY KEY,
    cycle_type VARCHAR(20) DEFAULT 'weekly' CHECK (cycle_type IN ('daily', 'weekly', 'monthly')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    config JSONB DEFAULT '{}', -- Stores rules like ticket sources, multipliers
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promoshare_cycles_status ON promoshare_cycles(status);
CREATE INDEX idx_promoshare_cycles_dates ON promoshare_cycles(start_at, end_at);

-- =============================================
-- PROMOSHARE TICKETS
-- =============================================
CREATE TABLE promoshare_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cycle_id BIGINT REFERENCES promoshare_cycles(id) ON DELETE CASCADE,
    source_action VARCHAR(50) NOT NULL, -- e.g., 'social_like', 'drop_complete', 'login'
    source_id VARCHAR(255), -- ID of the action (drop_application_id, social_action_id, etc.)
    multiplier DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promoshare_tickets_user_cycle ON promoshare_tickets(user_id, cycle_id);
CREATE INDEX idx_promoshare_tickets_cycle ON promoshare_tickets(cycle_id);

-- =============================================
-- PROMOSHARE POOL ITEMS (Rewards)
-- =============================================
CREATE TABLE promoshare_pool_items (
    id BIGSERIAL PRIMARY KEY,
    cycle_id BIGINT REFERENCES promoshare_cycles(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('gem', 'key', 'point', 'coupon', 'product', 'other')),
    amount DECIMAL(10,2) DEFAULT 0,
    description VARCHAR(255),
    sponsor_id UUID REFERENCES users(id), -- If sponsored by an advertiser
    image_url TEXT,
    distribution_logic VARCHAR(50) DEFAULT 'random', -- 'random', 'top_holder', etc.
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promoshare_pool_cycle ON promoshare_pool_items(cycle_id);

-- =============================================
-- PROMOSHARE WINNERS
-- =============================================
CREATE TABLE promoshare_winners (
    id BIGSERIAL PRIMARY KEY,
    cycle_id BIGINT REFERENCES promoshare_cycles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pool_item_id BIGINT REFERENCES promoshare_pool_items(id),
    prize_description VARCHAR(255),
    prize_data JSONB, -- Details about what was won
    won_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promoshare_winners_cycle ON promoshare_winners(cycle_id);
CREATE INDEX idx_promoshare_winners_user ON promoshare_winners(user_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE promoshare_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoshare_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoshare_pool_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoshare_winners ENABLE ROW LEVEL SECURITY;

-- Public read for cycles and pool items
CREATE POLICY promoshare_cycles_public_read ON promoshare_cycles FOR SELECT USING (true);
CREATE POLICY promoshare_pool_items_public_read ON promoshare_pool_items FOR SELECT USING (true);
CREATE POLICY promoshare_winners_public_read ON promoshare_winners FOR SELECT USING (true);

-- Authentic users can read their own tickets
CREATE POLICY promoshare_tickets_own_read ON promoshare_tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = promoshare_tickets.user_id AND users.mocha_user_id = auth.uid()::text)
);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_promoshare_cycles_updated_at BEFORE UPDATE ON promoshare_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DEMO DATA
-- =============================================
INSERT INTO promoshare_cycles (cycle_type, status, start_at, end_at, config) VALUES
('weekly', 'active', NOW(), NOW() + INTERVAL '7 days', '{"ticket_per_action": 1}');

INSERT INTO promoshare_pool_items (cycle_id, reward_type, amount, description) 
SELECT id, 'gem', 1000, 'Weekly Gem Jackpot' FROM promoshare_cycles WHERE status = 'active' LIMIT 1;
