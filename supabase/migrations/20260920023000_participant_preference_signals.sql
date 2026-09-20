CREATE TABLE IF NOT EXISTS public.participant_preference_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  object_type text NOT NULL,
  object_key text NOT NULL,
  label text,
  signal_type text NOT NULL CHECK (signal_type IN ('more_like_this','not_for_me','motivation')),
  source_surface text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, object_type, object_key)
);

ALTER TABLE public.participant_preference_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preference_signals_select_own" ON public.participant_preference_signals;
CREATE POLICY "preference_signals_select_own"
  ON public.participant_preference_signals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "preference_signals_insert_own" ON public.participant_preference_signals;
CREATE POLICY "preference_signals_insert_own"
  ON public.participant_preference_signals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "preference_signals_update_own" ON public.participant_preference_signals;
CREATE POLICY "preference_signals_update_own"
  ON public.participant_preference_signals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "preference_signals_delete_own" ON public.participant_preference_signals;
CREATE POLICY "preference_signals_delete_own"
  ON public.participant_preference_signals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.participant_preference_signals IS
  'Private participant taste/motivation signals. These records personalize PROMORANG and MUST NOT be counted as public Wants unless a separate explicit demand action is recorded.';
