-- =============================================
-- MIGRATION: HARDEN MOMENT MECHANICAL RULES
-- DATE: 2026-02-03
-- DESCRIPTION: Ensures Moments lock in the mechanical rules (proof_type, action_units) 
--              from the AMI Strategy they were derived from.
-- =============================================

-- 1. Add mechanical columns to moments
ALTER TABLE moments ADD COLUMN IF NOT EXISTS proof_type mechanic_proof_type;
ALTER TABLE moments ADD COLUMN IF NOT EXISTS evidence_requirements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE moments ADD COLUMN IF NOT EXISTS expected_action_unit TEXT;

-- 2. Backfill existing moments (Best guess or null)
-- If a moment has a mechanic_id, we should ideally pull from there, 
-- but for a migration, we'll set defaults if null.
UPDATE moments 
SET proof_type = 'QR' 
WHERE proof_type IS NULL AND mechanic_id IS NULL;

-- 3. Set default action units for consistency
UPDATE moments 
SET expected_action_unit = 'Check-in' 
WHERE expected_action_unit IS NULL;

-- 4. Add index for performance on mechanic lookup
CREATE INDEX IF NOT EXISTS idx_moments_mechanic_id ON moments(mechanic_id);

-- =============================================
-- END MIGRATION
-- =============================================
