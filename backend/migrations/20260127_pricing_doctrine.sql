-- =============================================
-- MIGRATION: PRICING DOCTRINE INTEGRATION
-- DESCRIPTION: Adds tiers, verification levels, and billing statuses to Moments.
-- =============================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE moment_tier AS ENUM ('basic', 'pro', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_level AS ENUM ('standard', 'advanced', 'priority');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_status AS ENUM ('pending', 'paid', 'waived', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. UPDATE MOMENTS TABLE
ALTER TABLE moments 
ADD COLUMN IF NOT EXISTS moment_tier moment_tier DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS verification_level verification_level DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS billing_status billing_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS participant_cap INTEGER;

-- 3. INITIAL DATA MIGRATION
-- Default existing live moments to basic/paid to avoid disruption
UPDATE moments SET moment_tier = 'basic', billing_status = 'paid' WHERE status = 'live';
UPDATE moments SET participant_cap = capacity;

-- 4. POLICIES
-- Ensure billing status is visible
-- No changes needed if moments_read_policy is already SELECT true

-- =============================================
-- END MIGRATION
-- =============================================
