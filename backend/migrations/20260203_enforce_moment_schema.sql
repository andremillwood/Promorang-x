-- =============================================
-- MIGRATION: ENFORCE MOMENT SYSTEM DIRECTIVE
-- DATE: 2026-02-03
-- DESCRIPTION: Strict enforcement of Moment Types and Lifecycle States.
--              Includes mapping for User-Proposed Moments.
-- =============================================

-- 1. DROP OLD TYPES (CASCADE to columns using them)
-- We use CASCADE carefully. In production, we might rename types instead.
-- For this "System Audit" enforcement, we want strict adherence.

DO $$ BEGIN
    -- Remove old types if they exist to force clean state
    -- Note: This might fail if dependent objects exist, but we'll try to ALTER first.
    -- Better approach: Create NEW types, alter columns, drop old types.
END $$;

-- 2. CREATE CANONICAL TYPES
DO $$ BEGIN
    CREATE TYPE moment_type_v2 AS ENUM (
        'activation',   -- Brand-funded, time-bound
        'bounty',       -- Brand-requested, claim-based
        'community',    -- Host-led, culture-first
        'merchant',     -- Venue-anchored, recurring
        'digital'       -- Remote, verifiable
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE moment_status_v2 AS ENUM (
        -- Proposal Phase
        'draft',
        'submitted',
        'reviewed',
        'approved_unfunded',
        
        -- Active Phase
        'funded',    -- Money committed
        'joinable',  -- Open for RSVPs (was 'scheduled')
        'active',    -- Happening now
        'processing', -- Proofs being validated
        
        -- Archival Phase
        'closed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. MIGRATE TABLE `moments`
-- We need to map old values to new values.

-- Add new columns
ALTER TABLE moments ADD COLUMN type_v2 moment_type_v2;
ALTER TABLE moments ADD COLUMN status_v2 moment_status_v2;

-- Map Data (Best Guess Mapping)
UPDATE moments SET type_v2 = CASE
    WHEN type::text = 'physical_event' THEN 'community'::moment_type_v2
    WHEN type::text = 'digital_drop' THEN 'digital'::moment_type_v2
    WHEN type::text = 'retail_activation' THEN 'activation'::moment_type_v2
    ELSE 'community'::moment_type_v2 -- Default fallback
END;

UPDATE moments SET status_v2 = CASE
    WHEN status::text = 'draft' THEN 'draft'::moment_status_v2
    WHEN status::text = 'scheduled' THEN 'joinable'::moment_status_v2
    WHEN status::text = 'live' THEN 'active'::moment_status_v2
    WHEN status::text = 'closed' THEN 'closed'::moment_status_v2
    ELSE 'draft'::moment_status_v2
END;

-- Enforce Not Null
ALTER TABLE moments ALTER COLUMN type_v2 SET NOT NULL;
ALTER TABLE moments ALTER COLUMN status_v2 SET DEFAULT 'draft'::moment_status_v2;

-- Swap Columns
ALTER TABLE moments DROP COLUMN type;
ALTER TABLE moments DROP COLUMN status;

ALTER TABLE moments RENAME COLUMN type_v2 TO type;
ALTER TABLE moments RENAME COLUMN status_v2 TO status;

-- 4. CLEANUP
DROP TYPE IF EXISTS moment_type;
DROP TYPE IF EXISTS moment_status;

-- Rename v2 types to clean names if possible, or just leave as is.
-- Postgres types are global. We can rename the type itself.
ALTER TYPE moment_type_v2 RENAME TO moment_type;
ALTER TYPE moment_status_v2 RENAME TO moment_status;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_moments_type_new ON moments(type);
CREATE INDEX IF NOT EXISTS idx_moments_status_new ON moments(status);

-- =============================================
-- END MIGRATION
-- =============================================
