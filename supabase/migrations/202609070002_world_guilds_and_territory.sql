-- Scene-level Guilds (Crew federations) and Kingston territory copy.
-- Territory standing is derived from verified_actions. This is not land ownership.

CREATE TABLE IF NOT EXISTS public.world_guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
  created_by UUID,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.world_guild_crews (
  guild_id UUID NOT NULL REFERENCES public.world_guilds(id) ON DELETE CASCADE,
  crew_id UUID NOT NULL REFERENCES public.world_crews(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (guild_id, crew_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_world_guild_crews_one_guild
  ON public.world_guild_crews(crew_id);

CREATE INDEX IF NOT EXISTS idx_world_guilds_scene ON public.world_guilds(scene_id);
CREATE INDEX IF NOT EXISTS idx_world_guild_crews_guild ON public.world_guild_crews(guild_id);

ALTER TABLE public.world_guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_guild_crews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read own guilds" ON public.world_guilds;
CREATE POLICY "Members read own guilds"
  ON public.world_guilds FOR SELECT TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.world_guild_crews gc
      JOIN public.world_crew_members cm ON cm.crew_id = gc.crew_id
      WHERE gc.guild_id = world_guilds.id
        AND cm.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members read own guild crews" ON public.world_guild_crews;
CREATE POLICY "Members read own guild crews"
  ON public.world_guild_crews FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.world_crew_members cm
      WHERE cm.crew_id = world_guild_crews.crew_id
        AND cm.user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.world_guild_crews gc
      JOIN public.world_crew_members cm ON cm.crew_id = gc.crew_id
      WHERE gc.guild_id = world_guild_crews.guild_id
        AND cm.user_id = (SELECT auth.uid())
    )
  );

-- Writes stay on the service role through the API.

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS area_key TEXT;

ALTER TABLE public.venues
  DROP CONSTRAINT IF EXISTS venues_area_key_check;

ALTER TABLE public.venues
  ADD CONSTRAINT venues_area_key_check
  CHECK (area_key IS NULL OR area_key IN ('barbican', 'red-hills', 'new-kingston'));

UPDATE public.venues
SET area_key = 'barbican'
WHERE area_key IS NULL
  AND (name ILIKE '%barbican%' OR COALESCE(address, '') ILIKE '%barbican%');

UPDATE public.venues
SET area_key = 'red-hills'
WHERE area_key IS NULL
  AND (
    name ILIKE '%red hills%'
    OR name ILIKE '%red-hills%'
    OR COALESCE(address, '') ILIKE '%red hills%'
    OR COALESCE(address, '') ILIKE '%kingston 19%'
  );

UPDATE public.venues
SET area_key = 'new-kingston'
WHERE area_key IS NULL
  AND (name ILIKE '%new kingston%' OR COALESCE(address, '') ILIKE '%new kingston%');

UPDATE public.scenes
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'territories', COALESCE(metadata->'territories', '[
    {"key":"barbican","title":"Barbican","detail":"First coherent test area"},
    {"key":"red-hills","title":"Red Hills Road","detail":"Participating corridor"},
    {"key":"new-kingston","title":"New Kingston","detail":"After-hours corridor"}
  ]'::jsonb),
  'contest_line', COALESCE(
    metadata->>'contest_line',
    'The war is Current versus Static — not people versus people.'
  )
)
WHERE slug = 'kingston-after-dark';
