-- Add recurrence support directly to public.moments so the current
-- moment creation and editing flow can support recurring real-world moments.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'moment_recurrence_frequency'
  ) THEN
    CREATE TYPE public.moment_recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly');
  END IF;
END $$;

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS recurrence_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_frequency public.moment_recurrence_frequency,
  ADD COLUMN IF NOT EXISTS recurrence_interval integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS recurrence_by_weekday smallint[] NOT NULL DEFAULT '{}'::smallint[],
  ADD COLUMN IF NOT EXISTS recurrence_day_of_month smallint,
  ADD COLUMN IF NOT EXISTS recurrence_timezone text NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS recurrence_until timestamptz,
  ADD COLUMN IF NOT EXISTS recurrence_count integer;

CREATE INDEX IF NOT EXISTS idx_moments_recurrence_enabled
  ON public.moments(recurrence_enabled, starts_at DESC);

NOTIFY pgrst, 'reload schema';
