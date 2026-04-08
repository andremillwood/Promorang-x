-- AMI v2 Upgrade Migration
-- Focus: Strictness, Event Sourcing, Ranking Hardening

-- 1. Enum Updates (Snake Case)
ALTER TYPE mechanic_outcome RENAME VALUE 'Foot Traffic' TO 'foot_traffic';
ALTER TYPE mechanic_outcome RENAME VALUE 'UGC' TO 'ugc';
ALTER TYPE mechanic_outcome RENAME VALUE 'Social Follows' TO 'social_follows';
ALTER TYPE mechanic_outcome RENAME VALUE 'App Download' TO 'app_download';
ALTER TYPE mechanic_outcome RENAME VALUE 'Sales' TO 'sales';

-- 2. Activation Mechanics Upgrades
ALTER TABLE activation_mechanics 
ADD COLUMN slug VARCHAR(255),
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN status VARCHAR(50) DEFAULT 'active', -- draft, active, deprecated
ADD COLUMN evidence_requirements JSONB DEFAULT '{}',
ADD COLUMN default_weights JSONB DEFAULT '{}',
ADD COLUMN recommended_context_tags TEXT[],
ADD COLUMN disallowed_context_tags TEXT[],
ADD COLUMN expected_action_unit VARCHAR(100);

-- Generate slugs if missing (simple fallback)
UPDATE activation_mechanics SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;
ALTER TABLE activation_mechanics ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_mechanics_slug ON activation_mechanics(slug);

-- 3. Normalized Outcomes (Replace Array)
CREATE TABLE activation_mechanic_outcomes (
    mechanic_id UUID REFERENCES activation_mechanics(id),
    outcome mechanic_outcome NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (mechanic_id, outcome)
);

-- Backfill from existing data (best effort)
INSERT INTO activation_mechanic_outcomes (mechanic_id, outcome, is_primary)
SELECT id, primary_outcome, TRUE FROM activation_mechanics;

-- 4. Event Model Tables

-- B) Participation Events (Ground Truth)
CREATE TABLE participation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moment_id UUID REFERENCES moments(id),
    user_id UUID REFERENCES auth.users(id), -- Assuming auth.users
    mechanic_id UUID REFERENCES activation_mechanics(id), -- Denormalized for speed
    event_type VARCHAR(50) NOT NULL, -- joined, proof_submitted, verified, rejected
    event_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_part_moment ON participation_events(moment_id);
CREATE INDEX idx_part_user ON participation_events(user_id);
CREATE INDEX idx_part_mech ON participation_events(mechanic_id);

-- C) Verification Events (Quality & Latency)
CREATE TABLE verification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participation_event_id UUID REFERENCES participation_events(id),
    proof_type mechanic_proof_type NOT NULL,
    verdict VARCHAR(20) NOT NULL, -- verified, rejected
    rejection_reason TEXT,
    latency_seconds INTEGER,
    verifier_type VARCHAR(50) -- system, host, third_party
);

-- D) Fraud Signals
CREATE TABLE fraud_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    moment_id UUID,
    signal_type VARCHAR(50) NOT NULL, -- duplicate_proof, gps_spoof, etc.
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Metrics Materialized View (Ranking Data)
-- Drop old table if exists (User said separate table, but MV is better)
DROP TABLE IF EXISTS mechanic_metrics CASCADE;

CREATE MATERIALIZED VIEW mechanic_metrics_mv AS
SELECT 
    m.id as mechanic_id,
    count(distinct pe.moment_id) as total_instances,
    count(distinct pe.user_id) as total_participants,
    
    -- Bayesian Smoothed Completion Rate (Alpha=5, Beta=5)
    -- (Verified + 5) / (Joined + 10)
    (
        (COUNT(CASE WHEN pe.event_type = 'verified' THEN 1 END) + 5.0) / 
        (NULLIF(COUNT(CASE WHEN pe.event_type = 'joined' THEN 1 END), 0) + 10.0)
    ) * 100 as smoothed_completion_rate,
    
    -- Fraud Rate
    (
        COUNT(CASE WHEN pe.event_type = 'fraud_flagged' THEN 1 END)::DECIMAL /
        NULLIF(COUNT(*), 0)
    ) as fraud_rate
    
FROM activation_mechanics m
LEFT JOIN participation_events pe ON m.id = pe.mechanic_id
GROUP BY m.id
WITH DATA;

CREATE UNIQUE INDEX idx_metrics_mv_id ON mechanic_metrics_mv(mechanic_id);

-- 6. Ranking Views with Hardened Logic

CREATE OR REPLACE VIEW view_ami_v2_ranked AS
SELECT 
    am.*,
    mm.total_participants,
    mm.smoothed_completion_rate,
    mm.fraud_rate,
    
    -- Composite Reliability Score (0-100)
    -- 40% Completion, 30% Base Trust, 30% Fraud Penalty (inverse)
    (
        (mm.smoothed_completion_rate * 0.4) + 
        (50 * 0.3) + -- Base trust 
        ((1 - mm.fraud_rate) * 100 * 0.3)
    ) as reliability_score,
    
    -- Confidence Badge
    CASE 
        WHEN mm.total_participants > 1000 THEN 'High'
        WHEN mm.total_participants > 100 THEN 'Medium'
        ELSE 'Low'
    END as confidence_level

FROM activation_mechanics am
LEFT JOIN mechanic_metrics_mv mm ON am.id = mm.mechanic_id
WHERE am.status = 'active';
