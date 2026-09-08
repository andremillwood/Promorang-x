-- World System V2 foundation.
-- Houses, Resonance, and audit events. Not a second wallet or activity ledger.
-- Progress still derives from verified_actions.

ALTER TABLE public.world_crew_members
  DROP CONSTRAINT IF EXISTS world_crew_members_run_role_check;

ALTER TABLE public.world_crew_members
  ADD CONSTRAINT world_crew_members_run_role_check
  CHECK (run_role IS NULL OR run_role IN (
    'captain', 'scout', 'connector', 'amplifier', 'chronicler', 'keeper'
  ));

ALTER TABLE public.world_player_state
  ADD COLUMN IF NOT EXISTS house_key TEXT;

ALTER TABLE public.world_player_state
  DROP CONSTRAINT IF EXISTS world_player_state_house_key_check;

ALTER TABLE public.world_player_state
  ADD CONSTRAINT world_player_state_house_key_check
  CHECK (house_key IS NULL OR house_key IN ('ember', 'tide', 'radiant', 'grove'));

ALTER TABLE public.world_player_state
  ADD COLUMN IF NOT EXISTS house_revealed_at TIMESTAMPTZ;

ALTER TABLE public.world_player_state
  ADD COLUMN IF NOT EXISTS house_rule_version TEXT;

CREATE TABLE IF NOT EXISTS public.world_system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  kind TEXT NOT NULL,
  rule_version TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_world_system_events_user
  ON public.world_system_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_world_system_events_kind
  ON public.world_system_events (kind, created_at DESC);

ALTER TABLE public.world_system_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players read own world system events" ON public.world_system_events;
CREATE POLICY "Players read own world system events"
  ON public.world_system_events FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

COMMENT ON TABLE public.world_system_events IS
  'Audit for House reveal, Techniques, and other world-system events. Not financial truth.';
