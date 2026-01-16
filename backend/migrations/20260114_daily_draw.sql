-- =============================================
-- DAILY LAYER SCHEMA - PART 2: DAILY DRAW (Zero-Capital Phase 0)
-- Created: 2026-01-14
-- Purpose: Daily draw system with auto-entry at 1+ ticket
-- =============================================

-- Drop if exists for clean slate (development only)
DROP TABLE IF EXISTS draw_entries CASCADE;
DROP TABLE IF EXISTS daily_draw CASCADE;

-- Daily draw pool and results
CREATE TABLE daily_draw (
    id BIGSERIAL PRIMARY KEY,
    draw_date DATE NOT NULL UNIQUE,
    
    -- Prize pool: Phase 0 = Keys/Boosts/Access/Badges ONLY (no gems)
    -- Format: [{ tier, type, amount, quantity, description }, ...]
    -- type must be: 'keys' | 'boost' | 'access' | 'badge' (NO 'gems' in Phase 0)
    prize_pool JSONB NOT NULL DEFAULT '[]',
    
    -- CRITICAL: Store total_entries BEFORE winner selection (for accurate reporting)
    total_entries INTEGER DEFAULT 0,
    
    -- Winners array after draw execution
    -- Format: [{ user_id, prize_tier, prize_type, prize_amount }, ...]
    winners JSONB DEFAULT '[]',
    
    -- Draw status
    status VARCHAR(20) DEFAULT 'open' 
        CHECK (status IN ('open', 'closed', 'drawn')),
    
    drawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_draw_date ON daily_draw(draw_date);
CREATE INDEX idx_daily_draw_status ON daily_draw(status);

-- Draw entries - users with 1+ tickets are auto-entered (NOT 3/3 requirement)
CREATE TABLE draw_entries (
    id BIGSERIAL PRIMARY KEY,
    draw_id BIGINT REFERENCES daily_draw(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Number of tickets (more tickets = higher chance)
    tickets_count INTEGER DEFAULT 1 CHECK (tickets_count >= 1),
    
    -- Auto-entered when user earns first ticket (not manually entered)
    auto_entered BOOLEAN DEFAULT TRUE,
    
    -- How tickets were earned
    earned_via VARCHAR(50) DEFAULT 'daily_activity',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One entry per user per draw
    UNIQUE(draw_id, user_id)
);

CREATE INDEX idx_draw_entries_draw ON draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user ON draw_entries(user_id);

-- Comments for documentation
COMMENT ON TABLE daily_draw IS 'Daily lucky draw. Phase 0 uses non-cash prizes only (Keys, boosts, access, badges).';
COMMENT ON COLUMN daily_draw.total_entries IS 'Stored BEFORE winner selection for accurate reporting.';
COMMENT ON COLUMN draw_entries.auto_entered IS 'Users are auto-entered at 1+ tickets (not 3/3 requirement).';
