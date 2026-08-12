CREATE TABLE IF NOT EXISTS public.user_guidance_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guidance_id text NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz,
  opened_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, guidance_id)
);

ALTER TABLE public.user_guidance_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their guidance progress" ON public.user_guidance_progress;
CREATE POLICY "Users can read their guidance progress"
  ON public.user_guidance_progress
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their guidance progress" ON public.user_guidance_progress;
CREATE POLICY "Users can create their guidance progress"
  ON public.user_guidance_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their guidance progress" ON public.user_guidance_progress;
CREATE POLICY "Users can update their guidance progress"
  ON public.user_guidance_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
