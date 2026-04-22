-- Align the public.moments table with the active web app create/edit flows.
-- This is additive and safe to run against partially repaired environments.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'moment_visibility'
  ) THEN
    CREATE TYPE public.moment_visibility AS ENUM ('open', 'invite', 'private');
  END IF;
END $$;

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS venue_id UUID,
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS max_participants INTEGER,
  ADD COLUMN IF NOT EXISTS reward TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS visibility public.moment_visibility NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS mechanic_id UUID,
  ADD COLUMN IF NOT EXISTS proof_type TEXT,
  ADD COLUMN IF NOT EXISTS evidence_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS expected_action_unit TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_moments_host_id ON public.moments(host_id);
CREATE INDEX IF NOT EXISTS idx_moments_visibility ON public.moments(visibility);
CREATE INDEX IF NOT EXISTS idx_moments_is_active ON public.moments(is_active);

NOTIFY pgrst, 'reload schema';
