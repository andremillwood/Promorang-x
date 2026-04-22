ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS venue_category text,
  ADD COLUMN IF NOT EXISTS moment_archetype text,
  ADD COLUMN IF NOT EXISTS conversion_type text;

CREATE INDEX IF NOT EXISTS idx_moments_venue_category
  ON public.moments(venue_category);

CREATE INDEX IF NOT EXISTS idx_moments_moment_archetype
  ON public.moments(moment_archetype);

CREATE INDEX IF NOT EXISTS idx_moments_conversion_type
  ON public.moments(conversion_type);

NOTIFY pgrst, 'reload schema';
