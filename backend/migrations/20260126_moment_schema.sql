-- =============================================
-- MIGRATION: MOMENT INFRASTRUCTURE CORE
-- DESCRIPTION: creates tables for Moments, Entitlements, Redemptions, and Records.
-- =============================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE moment_status AS ENUM ('draft', 'scheduled', 'live', 'closed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE moment_type AS ENUM ('physical_event', 'digital_drop', 'content_premiere', 'retail_activation', 'exclusive_access');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entitlement_type AS ENUM ('entry_pass', 'digital_asset', 'physical_redemption', 'priority_access');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. MOMENTS TABLE
CREATE TABLE IF NOT EXISTS moments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES users(id), -- Links to Brand/Creator
    title TEXT NOT NULL,
    description TEXT,
    type moment_type NOT NULL,
    status moment_status DEFAULT 'draft',
    
    -- Access Logic
    gate_rules JSONB, -- { "min_pri": 100, "required_holding": "xyz", "geo": {...} }
    capacity INTEGER, -- NULL = Unlimited
    
    -- Timing
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    
    -- Lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ, -- When the Moment ended
    
    -- Integrity
    record_hash TEXT -- Filled when Status = Closed. Locks the moment.
);

-- Index for discovery
CREATE INDEX idx_moments_organizer ON moments(organizer_id);
CREATE INDEX idx_moments_status ON moments(status);
CREATE INDEX idx_moments_type ON moments(type);

-- 3. ENTITLEMENTS TABLE
CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
    type entitlement_type NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Allocation
    total_allocation INTEGER, -- NULL = Unlimited
    remaining_allocation INTEGER,
    
    -- Restrictions
    claim_limit_per_user INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entitlements_moment ON entitlements(moment_id);

-- 4. REDEMPTIONS (The "Ticket" / "Proof")
CREATE TABLE IF NOT EXISTS redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entitlement_id UUID REFERENCES entitlements(id),
    user_id UUID REFERENCES users(id),
    moment_id UUID REFERENCES moments(id), -- Denormalized for speed
    
    status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'voided')),
    redeemed_at TIMESTAMPTZ,
    
    -- Verification
    verification_proof JSONB, -- { "scan_location": "...", "scanner_id": "..." }
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(entitlement_id, user_id) -- Prevent double claiming unless logic allows (handled via code usually, but good safeguard)
);

CREATE INDEX idx_redemptions_user ON redemptions(user_id);
CREATE INDEX idx_redemptions_moment ON redemptions(moment_id);

-- 5. MOMENT RECORDS (Immutable Artifacts)
CREATE TABLE IF NOT EXISTS moment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moment_id UUID REFERENCES moments(id),
    
    -- The Artifact
    finalized_at TIMESTAMPTZ DEFAULT NOW(),
    organizer_signature TEXT, -- Digital signature if we impelment that
    
    -- Data Dump (The complete state of the moment at closure)
    data JSONB NOT NULL, -- Full list of attendees, redemptions, stats.
    
    hash TEXT NOT NULL, -- SHA256 of the data column
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moment_records_moment ON moment_records(moment_id);

-- 6. RLS
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_records ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for now)
-- Public read for Live moments
CREATE POLICY moments_read_policy ON moments FOR SELECT USING (true);
-- Organizer write
CREATE POLICY moments_organizer_policy ON moments FOR ALL USING (organizer_id::text = auth.uid()::text); 
-- Note: auth.uid() in supabase is usually UUID, but our users table uses BIGINT id but `mocha_user_id` as string UUID.
-- We might need a helper function or join logic.
-- Assuming `mocha_user_id` is the auth ID.
-- Fix policy:
-- CREATE POLICY moments_organizer_policy ON moments FOR ALL USING (
--    EXISTS (SELECT 1 FROM users WHERE users.id = moments.organizer_id AND users.mocha_user_id = auth.uid()::text)
-- );

-- =============================================
-- END MIGRATION
-- =============================================
