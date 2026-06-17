-- PromoPush core distribution and activation layer.
-- V1 keeps traffic inside the Moment path while making every channel/event attributable.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'promopush_campaign_status'
  ) THEN
    CREATE TYPE public.promopush_campaign_status AS ENUM ('draft', 'active', 'completed', 'paused');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'promopush_channel_type'
  ) THEN
    CREATE TYPE public.promopush_channel_type AS ENUM (
      'qr_code',
      'meta_ads',
      'direct_link',
      'creator_link',
      'street_activation'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'promopush_event_type'
  ) THEN
    CREATE TYPE public.promopush_event_type AS ENUM (
      'impression',
      'click',
      'scan',
      'join',
      'move_completed',
      'proof_submitted',
      'proof_verified',
      'reward_issued',
      'geo_interaction'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'promopush_creative_status'
  ) THEN
    CREATE TYPE public.promopush_creative_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'promopush_applicant_role'
  ) THEN
    CREATE TYPE public.promopush_applicant_role AS ENUM ('promoter', 'creator', 'marketing');
  END IF;
END $$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS roles text[] NOT NULL DEFAULT ARRAY[]::text[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'user_role'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'creator';
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'promoter';
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'marketing';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.promopush_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  linked_moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  host_id uuid NOT NULL,
  brand_id uuid,
  geo_radius_meters integer NOT NULL CHECK (geo_radius_meters > 0),
  geo_center_lat numeric(10,7) NOT NULL CHECK (geo_center_lat BETWEEN -90 AND 90),
  geo_center_lng numeric(10,7) NOT NULL CHECK (geo_center_lng BETWEEN -180 AND 180),
  geo_label text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  budget numeric(14,2) CHECK (budget IS NULL OR budget >= 0),
  reward_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_creative_support boolean NOT NULL DEFAULT false,
  status public.promopush_campaign_status NOT NULL DEFAULT 'draft',
  meta_ads_phase text NOT NULL DEFAULT 'manual_links_v1',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.promopush_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.promopush_campaigns(id) ON DELETE CASCADE,
  channel_type public.promopush_channel_type NOT NULL,
  owner_user_id uuid,
  label text NOT NULL,
  tracking_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  tracking_link text,
  moment_entry_endpoint text NOT NULL,
  reward_per_verified_action numeric(12,2) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promopush_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.promopush_campaigns(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES public.promopush_channels(id) ON DELETE SET NULL,
  user_id uuid,
  event_type public.promopush_event_type NOT NULL,
  moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  move_id uuid,
  proof_submission_id uuid,
  reward_id uuid,
  latitude numeric(10,7),
  longitude numeric(10,7),
  within_radius boolean,
  distance_meters numeric(12,2),
  user_agent text,
  referrer text,
  ip_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promopush_creator_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.promopush_campaigns(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES public.promopush_channels(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL,
  event_id uuid REFERENCES public.promopush_events(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'JMD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'reversed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promopush_creative_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.promopush_campaigns(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('flyer_design', 'qr_layout', 'ad_creative')),
  status public.promopush_creative_status NOT NULL DEFAULT 'pending',
  assigned_to uuid,
  notes text,
  asset_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promopush_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_role public.promopush_applicant_role NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  phone text NOT NULL,
  availability text,
  area_coverage text,
  email text,
  user_id uuid,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promopush_promoter_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.promopush_campaigns(id) ON DELETE CASCADE,
  promoter_id uuid NOT NULL,
  channel_id uuid REFERENCES public.promopush_channels(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'removed')),
  flyer_url text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, promoter_id)
);

CREATE OR REPLACE FUNCTION public.promopush_distance_meters(
  lat1 numeric,
  lng1 numeric,
  lat2 numeric,
  lng2 numeric
) RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    6371000 * acos(
      LEAST(
        1,
        GREATEST(
          -1,
          cos(radians(lat1::double precision))
          * cos(radians(lat2::double precision))
          * cos(radians((lng2 - lng1)::double precision))
          + sin(radians(lat1::double precision))
          * sin(radians(lat2::double precision))
        )
      )
    )
  )::numeric;
$$;

CREATE OR REPLACE VIEW public.promopush_channel_metrics AS
SELECT
  c.id AS channel_id,
  c.campaign_id,
  count(*) FILTER (WHERE e.event_type IN ('click', 'scan')) AS clicks,
  count(*) FILTER (WHERE e.event_type = 'join') AS joins,
  count(*) FILTER (WHERE e.event_type = 'move_completed') AS moves_completed,
  count(*) FILTER (WHERE e.event_type = 'proof_submitted') AS proof_submissions,
  count(*) FILTER (WHERE e.event_type = 'proof_verified') AS proof_verified,
  count(*) FILTER (WHERE e.event_type = 'reward_issued') AS rewards_issued
FROM public.promopush_channels c
LEFT JOIN public.promopush_events e ON e.channel_id = c.id
GROUP BY c.id, c.campaign_id;

CREATE INDEX IF NOT EXISTS idx_promopush_campaigns_moment ON public.promopush_campaigns(linked_moment_id);
CREATE INDEX IF NOT EXISTS idx_promopush_campaigns_window ON public.promopush_campaigns(status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_promopush_channels_campaign ON public.promopush_channels(campaign_id);
CREATE INDEX IF NOT EXISTS idx_promopush_channels_code ON public.promopush_channels(tracking_code);
CREATE INDEX IF NOT EXISTS idx_promopush_events_campaign_type ON public.promopush_events(campaign_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promopush_events_user ON public.promopush_events(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_promopush_creator_link_owner_campaign
  ON public.promopush_channels(campaign_id, owner_user_id)
  WHERE channel_type = 'creator_link' AND owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_promopush_street_activation_owner_campaign
  ON public.promopush_channels(campaign_id, owner_user_id)
  WHERE channel_type = 'street_activation' AND owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_promopush_events_move_completed
  ON public.promopush_events(campaign_id, COALESCE(channel_id, '00000000-0000-0000-0000-000000000000'::uuid), user_id, move_id)
  WHERE event_type = 'move_completed' AND user_id IS NOT NULL AND move_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_promopush_events_proof_submitted
  ON public.promopush_events(campaign_id, COALESCE(channel_id, '00000000-0000-0000-0000-000000000000'::uuid), proof_submission_id)
  WHERE event_type = 'proof_submitted' AND proof_submission_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_promopush_events_proof_verified
  ON public.promopush_events(campaign_id, COALESCE(channel_id, '00000000-0000-0000-0000-000000000000'::uuid), proof_submission_id)
  WHERE event_type = 'proof_verified' AND proof_submission_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_promopush_events_reward_issued
  ON public.promopush_events(campaign_id, COALESCE(channel_id, '00000000-0000-0000-0000-000000000000'::uuid), reward_id)
  WHERE event_type = 'reward_issued' AND reward_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_promopush_creator_earnings_event
  ON public.promopush_creator_earnings(event_id)
  WHERE event_id IS NOT NULL;

ALTER TABLE public.promopush_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promopush_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promopush_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promopush_creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promopush_creative_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promopush_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promopush_promoter_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promopush campaigns readable by operators" ON public.promopush_campaigns;
CREATE POLICY "promopush campaigns readable by operators"
  ON public.promopush_campaigns FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = brand_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "promopush campaigns writable by operators" ON public.promopush_campaigns;
CREATE POLICY "promopush campaigns writable by operators"
  ON public.promopush_campaigns FOR ALL
  USING (auth.uid() = host_id OR auth.uid() = brand_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = host_id OR auth.uid() = brand_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "promopush channels readable by participants" ON public.promopush_channels;
CREATE POLICY "promopush channels readable by participants"
  ON public.promopush_channels FOR SELECT
  USING (
    is_active
    OR owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.promopush_campaigns pc
      WHERE pc.id = campaign_id
        AND (pc.host_id = auth.uid() OR pc.brand_id = auth.uid() OR pc.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "promopush events insertable" ON public.promopush_events;
CREATE POLICY "promopush events insertable"
  ON public.promopush_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "promopush events readable by owners" ON public.promopush_events;
CREATE POLICY "promopush events readable by owners"
  ON public.promopush_events FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.promopush_campaigns pc
      WHERE pc.id = campaign_id
        AND (pc.host_id = auth.uid() OR pc.brand_id = auth.uid() OR pc.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "promopush creator earnings readable by creator" ON public.promopush_creator_earnings;
CREATE POLICY "promopush creator earnings readable by creator"
  ON public.promopush_creator_earnings FOR SELECT
  USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "promopush applications insertable" ON public.promopush_applications;
CREATE POLICY "promopush applications insertable"
  ON public.promopush_applications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "promopush promoter assignments readable by promoter" ON public.promopush_promoter_assignments;
CREATE POLICY "promopush promoter assignments readable by promoter"
  ON public.promopush_promoter_assignments FOR SELECT
  USING (promoter_id = auth.uid());

NOTIFY pgrst, 'reload schema';
