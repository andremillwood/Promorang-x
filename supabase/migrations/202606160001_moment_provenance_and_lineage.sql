-- Make it explicit whether a Moment is real stakeholder content, demo/example
-- content, imported/discovered content, or a nested creative sub-moment.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'moment_content_origin'
  ) THEN
    CREATE TYPE public.moment_content_origin AS ENUM (
      'stakeholder_created',
      'platform_seed',
      'demo',
      'scraped',
      'imported'
    );
  END IF;
END $$;

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS content_origin public.moment_content_origin NOT NULL DEFAULT 'stakeholder_created',
  ADD COLUMN IF NOT EXISTS parent_moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS creative_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

UPDATE public.moments
SET content_origin = 'demo'
WHERE content_origin = 'stakeholder_created'
  AND (
    lower(coalesce(title, '')) LIKE '%demo%'
    OR lower(coalesce(title, '')) LIKE '%example%'
  );

CREATE INDEX IF NOT EXISTS idx_moments_content_origin
  ON public.moments(content_origin, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_moments_parent_moment_id
  ON public.moments(parent_moment_id, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_moments_creative_owner_id
  ON public.moments(creative_owner_id, starts_at DESC);

COMMENT ON COLUMN public.moments.content_origin IS
  'Distinguishes stakeholder-created moments from demo/seed, scraped, or imported listings.';

COMMENT ON COLUMN public.moments.parent_moment_id IS
  'Optional parent moment for sub-moments, pop-ups, stages, sessions, or creator-led activations inside a larger moment.';

COMMENT ON COLUMN public.moments.creative_owner_id IS
  'User accountable for the creative/activity layer of this moment, which may differ from the host or organizer.';

NOTIFY pgrst, 'reload schema';
