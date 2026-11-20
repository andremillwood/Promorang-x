-- Sync moments.proof_type enum values that are already live in production.
-- moments.proof_type uses mechanic_proof_type
-- (backend/migrations/20260203_ami_schema_and_seeds.sql and
-- backend/migrations/20260203_moments_harden_mechanics.sql).
-- Share, Screenshot, and Link must not be introduced and then used
-- in this same migration: PostgreSQL will not accept a new enum label
-- until the adding transaction commits. The retag migration runs next.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'mechanic_proof_type'
  ) THEN
    CREATE TYPE public.mechanic_proof_type AS ENUM (
      'QR',
      'GPS',
      'Photo',
      'Video',
      'API',
      'Code',
      'Share',
      'Screenshot',
      'Link'
    );
  END IF;
END $$;

ALTER TYPE public.mechanic_proof_type ADD VALUE IF NOT EXISTS 'Share';
ALTER TYPE public.mechanic_proof_type ADD VALUE IF NOT EXISTS 'Screenshot';
ALTER TYPE public.mechanic_proof_type ADD VALUE IF NOT EXISTS 'Link';

DO $$
DECLARE
  v_type text;
BEGIN
  SELECT t.typname INTO v_type
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_type t ON t.oid = a.atttypid
  WHERE n.nspname = 'public'
    AND c.relname = 'moments'
    AND a.attname = 'proof_type'
    AND NOT a.attisdropped;

  IF v_type IS NULL THEN
    RAISE NOTICE 'moments.proof_type column was not found. Enum mechanic_proof_type was still synced.';
  ELSIF v_type = 'mechanic_proof_type' THEN
    RAISE NOTICE 'moments.proof_type uses mechanic_proof_type. Share, Screenshot, and Link are present.';
  ELSIF v_type = 'text' THEN
    RAISE NOTICE 'moments.proof_type is text in this database. mechanic_proof_type was synced for environments that use the enum.';
  ELSE
    RAISE NOTICE 'moments.proof_type uses %. Share, Screenshot, and Link were added to mechanic_proof_type only.', v_type;
  END IF;
END $$;
