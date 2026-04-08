-- =============================================
-- MIGRATION: PARTNERSHIP & DISTILLATION LAYER
-- DESCRIPTION: Extends Moment schema for Sponsor/Host accounting and Distillation types.
-- =============================================

-- 1. ADD DISTILLATION TYPE TO moment_type ENUM
-- Note: We have to handle enum updates carefully in Postgres.
ALTER TYPE moment_type ADD VALUE 'distillation';

-- 2. EXTEND MOMENTS TABLE
ALTER TABLE moments 
ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES users(id), -- The Brand (Funder)
ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES users(id),    -- The Creator (Manager)
ADD COLUMN IF NOT EXISTS distillation_source_id UUID REFERENCES moments(id); -- If this is a distillation of a parent moment

-- Rename organizer_id to owner_id for clarity (optional, but let's keep it for compatibility and just use host/sponsor for logic)
-- COMMENT ON COLUMN moments.organizer_id IS 'The primary legal owner/manager of the moment object.';

-- 3. UPDATED SCHEMA NOTES
-- If Sponsor + Host are both present, it is a "Partnered Moment".
-- If Host is present but Sponsor is NULL, it is a "Creator Moment".
-- If Sponsor is present but Host is NULL, it is a "Direct Brand Moment".

-- =============================================
-- END MIGRATION
-- =============================================
