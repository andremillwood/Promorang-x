-- World-layer Crews and Kingston After Dark season copy.
-- Progress is derived from verified_actions. This is not a second financial ledger.

CREATE TABLE IF NOT EXISTS public.world_crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
  created_by UUID,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.world_crew_members (
  crew_id UUID NOT NULL REFERENCES public.world_crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (crew_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.world_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES public.world_crews(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  season_key TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_world_crew_members_user ON public.world_crew_members(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_world_crew_members_one_crew ON public.world_crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_world_runs_crew ON public.world_runs(crew_id);

ALTER TABLE public.world_crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read own crews" ON public.world_crews;
CREATE POLICY "Members read own crews"
  ON public.world_crews FOR SELECT TO authenticated
  USING (created_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Members read own crew seats" ON public.world_crew_members;
CREATE POLICY "Members read own crew seats"
  ON public.world_crew_members FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Creators read own runs" ON public.world_runs;
CREATE POLICY "Creators read own runs"
  ON public.world_runs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.world_crews c
      WHERE c.id = world_runs.crew_id AND c.created_by = (SELECT auth.uid())
    )
  );

-- Writes stay on the service role through the API. Authenticated clients are read-only.

UPDATE public.scenes
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'season_key', 'the-city-wakes',
  'season_title', 'The City Wakes',
  'season_line', 'The Current is moving through Barbican.',
  'test_area', 'Barbican',
  'tagline', COALESCE(metadata->>'tagline', 'Where Kingston nights turn into stories.'),
  'welcome', COALESCE(metadata->>'welcome', 'Find a night worth leaving home for. PromoCard is the passport that carries what comes back.'),
  'next_invitation', COALESCE(metadata->>'next_invitation', 'Follow one Signal in Barbican, then keep what comes back.'),
  'vibe', COALESCE(metadata->'vibe', '["nightlife","music","after hours"]'::jsonb),
  'places', COALESCE(metadata->'places', '[
    {"name":"Barbican","detail":"First coherent test area"},
    {"name":"Red Hills Road","detail":"Participating corridor"},
    {"name":"New Kingston","detail":"After-hours corridor"}
  ]'::jsonb)
)
WHERE slug = 'kingston-after-dark';
