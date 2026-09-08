-- Optional faction affinity and temporary Crew Run roles.
-- Neither is required at signup. Mixed-faction Crews stay valid.

ALTER TABLE public.world_crew_members
  ADD COLUMN IF NOT EXISTS run_role TEXT;

ALTER TABLE public.world_crew_members
  DROP CONSTRAINT IF EXISTS world_crew_members_run_role_check;

ALTER TABLE public.world_crew_members
  ADD CONSTRAINT world_crew_members_run_role_check
  CHECK (run_role IS NULL OR run_role IN ('captain', 'scout', 'chronicler', 'keeper'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_world_crew_one_role
  ON public.world_crew_members (crew_id, run_role)
  WHERE run_role IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.world_player_state (
  user_id UUID PRIMARY KEY,
  faction_key TEXT CHECK (faction_key IS NULL OR faction_key IN ('seekers', 'weavers', 'makers', 'keepers', 'stewards')),
  declared_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.world_player_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players read own world state" ON public.world_player_state;
CREATE POLICY "Players read own world state"
  ON public.world_player_state FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
