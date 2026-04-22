-- Mission attribution spine for O2O and hybrid content missions.
-- Tracks the digital-to-physical lifecycle on a first-class record.

CREATE TABLE IF NOT EXISTS public.mission_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_link_id uuid REFERENCES public.content_moment_links(id) ON DELETE SET NULL,
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  brand_id uuid,
  host_id uuid,
  first_engaged_at timestamptz,
  joined_at timestamptz,
  verified_at timestamptz,
  memory_id uuid REFERENCES public.memories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'engaged',
  engagement_events_count integer NOT NULL DEFAULT 0,
  join_events_count integer NOT NULL DEFAULT 0,
  verification_events_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_item_id, moment_id)
);

CREATE INDEX IF NOT EXISTS idx_mission_attributions_user_created_at
  ON public.mission_attributions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_attributions_content_item_id
  ON public.mission_attributions(content_item_id);

CREATE INDEX IF NOT EXISTS idx_mission_attributions_moment_id
  ON public.mission_attributions(moment_id);

CREATE INDEX IF NOT EXISTS idx_mission_attributions_mission_link_id
  ON public.mission_attributions(mission_link_id);

ALTER TABLE public.mission_attributions ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
