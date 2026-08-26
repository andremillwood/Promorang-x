-- ============================================================
-- Discovery Acquisition Loop (/d/[slug])
-- Distinct from evergreen place `discoveries` and listing `discovery_questions`.
-- Product language: Discovery. Table prefix: acquisition_discovery_*
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------
-- Early-user campaigns (Founding 100 and reusable cohorts)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.early_user_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  badge_label text NOT NULL DEFAULT 'Founding Member',
  capacity integer NOT NULL CHECK (capacity > 0),
  enrolled_count integer NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
  starting_points integer NOT NULL DEFAULT 0 CHECK (starting_points >= 0),
  eligibility_rule jsonb NOT NULL DEFAULT '{"source":"discovery_capture"}'::jsonb,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.early_user_campaign_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.early_user_campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  discovery_id uuid,
  member_number integer NOT NULL,
  badge_label text NOT NULL,
  points_awarded integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id),
  UNIQUE (campaign_id, member_number)
);

-- ----------------------------------------------------------
-- Core Discovery entity
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.acquisition_discoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  eyebrow text,
  description text,
  cover_image_url text,
  discovery_type text NOT NULL DEFAULT 'single_choice'
    CHECK (discovery_type IN (
      'single_choice', 'multi_select', 'binary', 'ranking',
      'nomination', 'interest', 'demand_signal'
    )),
  max_selections integer NOT NULL DEFAULT 1 CHECK (max_selections >= 1 AND max_selections <= 20),
  scene_id uuid REFERENCES public.scenes(id) ON DELETE SET NULL,
  related_moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  starts_at timestamptz,
  closes_at timestamptz,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'live', 'closed', 'archived')),
  capture_required boolean NOT NULL DEFAULT true,
  results_visibility text NOT NULL DEFAULT 'after_capture'
    CHECK (results_visibility IN ('after_capture', 'after_vote', 'public', 'hidden')),
  allow_repeat_votes boolean NOT NULL DEFAULT false,
  indexable boolean NOT NULL DEFAULT true,
  primary_next_action text NOT NULL DEFAULT 'express_interest'
    CHECK (primary_next_action IN (
      'view_moment', 'rsvp', 'claim_promokey', 'save_moment', 'express_interest',
      'join_scene', 'next_discovery', 'nominate_place', 'view_recommendation',
      'unlock_reward', 'visit_partner', 'custom'
    )),
  next_action_label text,
  next_action_destination text,
  next_action_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  reward_points integer NOT NULL DEFAULT 10 CHECK (reward_points >= 0),
  referral_rewards jsonb NOT NULL DEFAULT '{
    "share_link": 0,
    "referred_visit": 0,
    "referred_vote": 5,
    "referred_capture": 10,
    "referred_promokey": 25,
    "referred_verified_action": 100
  }'::jsonb,
  partner_attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_attribution_default text,
  share_copy_template text,
  seo_title text,
  seo_description text,
  og_image_url text,
  total_votes integer NOT NULL DEFAULT 0,
  total_captures integer NOT NULL DEFAULT 0,
  total_visitors integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.acquisition_discovery_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_id uuid NOT NULL REFERENCES public.acquisition_discoveries(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  image_url text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  destination_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  votes_count integer NOT NULL DEFAULT 0 CHECK (votes_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acq_discovery_choices_discovery
  ON public.acquisition_discovery_choices (discovery_id, sort_order);

-- ----------------------------------------------------------
-- Anonymous sessions + attribution survival
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.acquisition_discovery_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_id uuid NOT NULL REFERENCES public.acquisition_discoveries(id) ON DELETE CASCADE,
  anonymous_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  browser_fingerprint text,
  source text,
  campaign text,
  referrer_url text,
  referring_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  voted_at timestamptz,
  captured_at timestamptz,
  phone text,
  email text,
  display_name text,
  capture_method text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (discovery_id, anonymous_id)
);

CREATE INDEX IF NOT EXISTS idx_acq_discovery_sessions_anon
  ON public.acquisition_discovery_sessions (anonymous_id);
CREATE INDEX IF NOT EXISTS idx_acq_discovery_sessions_user
  ON public.acquisition_discovery_sessions (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_acq_discovery_sessions_source
  ON public.acquisition_discovery_sessions (discovery_id, source);

CREATE TABLE IF NOT EXISTS public.acquisition_discovery_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_id uuid NOT NULL REFERENCES public.acquisition_discoveries(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.acquisition_discovery_sessions(id) ON DELETE CASCADE,
  anonymous_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text,
  campaign text,
  referrer_url text,
  referring_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  first_touch jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_touch jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id)
);

CREATE INDEX IF NOT EXISTS idx_acq_discovery_attr_discovery
  ON public.acquisition_discovery_attribution (discovery_id, source);

-- ----------------------------------------------------------
-- Responses (votes)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.acquisition_discovery_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_id uuid NOT NULL REFERENCES public.acquisition_discoveries(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.acquisition_discovery_sessions(id) ON DELETE CASCADE,
  anonymous_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  choice_ids uuid[] NOT NULL,
  ranking jsonb,
  nomination_text text,
  is_captured boolean NOT NULL DEFAULT false,
  points_awarded integer NOT NULL DEFAULT 0,
  source text,
  referring_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  captured_at timestamptz
);

-- One response per anonymous session per discovery (unless admin allows repeats via app logic)
CREATE UNIQUE INDEX IF NOT EXISTS idx_acq_discovery_response_session
  ON public.acquisition_discovery_responses (discovery_id, session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_acq_discovery_response_user
  ON public.acquisition_discovery_responses (discovery_id, user_id)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_acq_discovery_responses_discovery
  ON public.acquisition_discovery_responses (discovery_id, created_at DESC);

-- ----------------------------------------------------------
-- Referrals
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.acquisition_discovery_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_id uuid NOT NULL REFERENCES public.acquisition_discoveries(id) ON DELETE CASCADE,
  referrer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_anonymous_id text,
  referred_session_id uuid REFERENCES public.acquisition_discovery_sessions(id) ON DELETE SET NULL,
  referred_anonymous_id text,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visit_at timestamptz,
  vote_at timestamptz,
  capture_at timestamptz,
  downstream_action text,
  downstream_at timestamptz,
  is_verified boolean NOT NULL DEFAULT false,
  is_self_referral boolean NOT NULL DEFAULT false,
  points_awarded integer NOT NULL DEFAULT 0,
  award_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_acq_discovery_referral_unique_visit
  ON public.acquisition_discovery_referrals (discovery_id, referrer_anonymous_id, referred_anonymous_id)
  WHERE referrer_anonymous_id IS NOT NULL AND referred_anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_acq_discovery_referrals_referrer
  ON public.acquisition_discovery_referrals (referrer_user_id, discovery_id);

-- ----------------------------------------------------------
-- Next actions taken
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.acquisition_discovery_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_id uuid NOT NULL REFERENCES public.acquisition_discoveries(id) ON DELETE CASCADE,
  response_id uuid REFERENCES public.acquisition_discovery_responses(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.acquisition_discovery_sessions(id) ON DELETE SET NULL,
  anonymous_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  action_value text,
  destination text,
  moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acq_discovery_actions_discovery
  ON public.acquisition_discovery_actions (discovery_id, action_type, created_at DESC);

-- ----------------------------------------------------------
-- Extensible user signals (Demand Graph nodes)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  signal_type text NOT NULL,
  signal_key text NOT NULL,
  signal_value text,
  weight numeric(8,2) NOT NULL DEFAULT 1,
  scene_id uuid REFERENCES public.scenes(id) ON DELETE SET NULL,
  discovery_id uuid REFERENCES public.acquisition_discoveries(id) ON DELETE SET NULL,
  moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  choice_id uuid,
  source text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_signals_user
  ON public.user_signals (user_id, signal_type, created_at DESC)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_signals_anon
  ON public.user_signals (anonymous_id, signal_type, created_at DESC)
  WHERE anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_signals_discovery
  ON public.user_signals (discovery_id, signal_type);

-- ----------------------------------------------------------
-- Funnel analytics events (dedicated; growth_events remains general)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.acquisition_discovery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_id uuid REFERENCES public.acquisition_discoveries(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  anonymous_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.acquisition_discovery_sessions(id) ON DELETE SET NULL,
  source text,
  referrer_url text,
  scene_id uuid,
  moment_id uuid,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acq_discovery_events_discovery
  ON public.acquisition_discovery_events (discovery_id, event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acq_discovery_events_created
  ON public.acquisition_discovery_events (created_at DESC);

-- ----------------------------------------------------------
-- Helper: is platform operator
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_acquisition_discovery_operator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role::text IN ('admin', 'administrator', 'master_admin', 'moderator', 'platform_admin')
  ) OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND (
        coalesce(u.role::text, '') IN ('admin', 'administrator', 'master_admin', 'moderator', 'platform_admin')
        OR coalesce(u.user_type::text, '') IN ('admin', 'administrator', 'master_admin', 'moderator', 'platform_admin')
      )
  );
$$;

-- ----------------------------------------------------------
-- Public results view (aggregates only)
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW public.view_public_acquisition_discovery_results
WITH (security_invoker = true)
AS
SELECT
  d.id AS discovery_id,
  d.slug,
  d.title,
  d.total_votes,
  d.status,
  c.id AS choice_id,
  c.label,
  c.image_url,
  c.sort_order,
  c.votes_count,
  CASE WHEN d.total_votes > 0
    THEN round((c.votes_count::numeric / d.total_votes::numeric) * 100, 1)
    ELSE 0
  END AS vote_pct
FROM public.acquisition_discoveries d
JOIN public.acquisition_discovery_choices c ON c.discovery_id = d.id
WHERE d.status IN ('live', 'closed');

-- ----------------------------------------------------------
-- RLS
-- ----------------------------------------------------------
ALTER TABLE public.early_user_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_user_campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_discovery_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_discovery_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_discovery_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_discovery_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_discovery_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_discovery_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS acq_discoveries_public_read ON public.acquisition_discoveries;
CREATE POLICY acq_discoveries_public_read ON public.acquisition_discoveries
  FOR SELECT USING (status IN ('live', 'closed') OR public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS acq_discoveries_operator_all ON public.acquisition_discoveries;
CREATE POLICY acq_discoveries_operator_all ON public.acquisition_discoveries
  FOR ALL USING (public.is_acquisition_discovery_operator())
  WITH CHECK (public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS acq_choices_public_read ON public.acquisition_discovery_choices;
CREATE POLICY acq_choices_public_read ON public.acquisition_discovery_choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.acquisition_discoveries d
      WHERE d.id = discovery_id AND (d.status IN ('live', 'closed') OR public.is_acquisition_discovery_operator())
    )
  );

DROP POLICY IF EXISTS acq_choices_operator_all ON public.acquisition_discovery_choices;
CREATE POLICY acq_choices_operator_all ON public.acquisition_discovery_choices
  FOR ALL USING (public.is_acquisition_discovery_operator())
  WITH CHECK (public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS acq_sessions_own_read ON public.acquisition_discovery_sessions;
CREATE POLICY acq_sessions_own_read ON public.acquisition_discovery_sessions
  FOR SELECT USING (auth.uid() = user_id OR public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS acq_responses_own_read ON public.acquisition_discovery_responses;
CREATE POLICY acq_responses_own_read ON public.acquisition_discovery_responses
  FOR SELECT USING (auth.uid() = user_id OR public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS acq_actions_own_read ON public.acquisition_discovery_actions;
CREATE POLICY acq_actions_own_read ON public.acquisition_discovery_actions
  FOR SELECT USING (auth.uid() = user_id OR public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS acq_signals_own_read ON public.user_signals;
CREATE POLICY acq_signals_own_read ON public.user_signals
  FOR SELECT USING (auth.uid() = user_id OR public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS acq_events_operator_read ON public.acquisition_discovery_events;
CREATE POLICY acq_events_operator_read ON public.acquisition_discovery_events
  FOR SELECT USING (public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS acq_referrals_own_read ON public.acquisition_discovery_referrals;
CREATE POLICY acq_referrals_own_read ON public.acquisition_discovery_referrals
  FOR SELECT USING (
    auth.uid() = referrer_user_id OR auth.uid() = referred_user_id OR public.is_acquisition_discovery_operator()
  );

DROP POLICY IF EXISTS acq_attr_operator_read ON public.acquisition_discovery_attribution;
CREATE POLICY acq_attr_operator_read ON public.acquisition_discovery_attribution
  FOR SELECT USING (auth.uid() = user_id OR public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS early_campaigns_public_read ON public.early_user_campaigns;
CREATE POLICY early_campaigns_public_read ON public.early_user_campaigns
  FOR SELECT USING (status = 'active' OR public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS early_members_own_read ON public.early_user_campaign_members;
CREATE POLICY early_members_own_read ON public.early_user_campaign_members
  FOR SELECT USING (auth.uid() = user_id OR public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS early_campaigns_operator_all ON public.early_user_campaigns;
CREATE POLICY early_campaigns_operator_all ON public.early_user_campaigns
  FOR ALL USING (public.is_acquisition_discovery_operator())
  WITH CHECK (public.is_acquisition_discovery_operator());

DROP POLICY IF EXISTS early_members_operator_all ON public.early_user_campaign_members;
CREATE POLICY early_members_operator_all ON public.early_user_campaign_members
  FOR ALL USING (public.is_acquisition_discovery_operator())
  WITH CHECK (public.is_acquisition_discovery_operator());

-- Mutations go through service_role backend APIs (not direct client inserts).
REVOKE INSERT, UPDATE, DELETE ON public.acquisition_discovery_sessions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.acquisition_discovery_responses FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.acquisition_discovery_attribution FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.acquisition_discovery_referrals FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.acquisition_discovery_actions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_signals FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.acquisition_discovery_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.early_user_campaign_members FROM anon, authenticated;

GRANT SELECT ON public.view_public_acquisition_discovery_results TO anon, authenticated;

-- ----------------------------------------------------------
-- Seed: Founding 100 campaign
-- ----------------------------------------------------------
INSERT INTO public.early_user_campaigns (key, title, description, badge_label, capacity, starting_points, eligibility_rule, status)
VALUES (
  'founding-100',
  'Founding 100',
  'First 100 qualifying Promorang participants who complete a Discovery capture.',
  'Founding Member',
  100,
  50,
  '{"source":"discovery_capture","require_phone_or_email":true}'::jsonb,
  'active'
)
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();

-- ----------------------------------------------------------
-- Seed Discovery 1: Final song for DJ 3D / I Luv Hip Hop
-- ----------------------------------------------------------
WITH scene AS (
  SELECT id FROM public.scenes WHERE slug = 'kingston-after-dark' LIMIT 1
),
moment AS (
  SELECT id FROM public.moments
  WHERE slug = 'i-luv-hip-hop-live-culture-lab'
     OR title ILIKE '%I Luv Hip Hop%'
  ORDER BY created_at DESC NULLS LAST
  LIMIT 1
),
ins AS (
  INSERT INTO public.acquisition_discoveries (
    slug, title, eyebrow, description, cover_image_url, discovery_type, max_selections,
    scene_id, related_moment_id, starts_at, closes_at, status, capture_required,
    results_visibility, primary_next_action, next_action_label, next_action_destination,
    next_action_config, reward_points, partner_attribution, share_copy_template,
    seo_title, seo_description, og_image_url, indexable, published_at, metadata
  )
  SELECT
    'final-song',
    '3D gets one final song. What should it be?',
    'I Luv Hip Hop · Thursday',
    'Help shape the last record of the night at Dulce Lounge. Kingston votes. The booth listens.',
    'https://images.unsplash.com/photo-1571266028241-d34cbea0b0e1?auto=format&fit=crop&q=80&w=1200',
    'single_choice',
    1,
    (SELECT id FROM scene),
    (SELECT id FROM moment),
    now() - interval '1 hour',
    timestamptz '2026-08-28 04:00:00+00',
    'live',
    true,
    'after_capture',
    'express_interest',
    'Are you going Thursday?',
    CASE WHEN (SELECT id FROM moment) IS NOT NULL
      THEN '/moments/' || (SELECT id::text FROM moment)
      ELSE '/nightlife/ilhh'
    END,
    jsonb_build_object(
      'prompt', 'Going to I Luv Hip Hop Thursday?',
      'options', jsonb_build_array(
        jsonb_build_object('value', 'going', 'label', 'I''m going'),
        jsonb_build_object('value', 'maybe', 'label', 'Maybe'),
        jsonb_build_object('value', 'not_this_week', 'label', 'Not this week')
      ),
      'going_routes_to_moment', true
    ),
    10,
    jsonb_build_object(
      'venue', 'Dulce Lounge',
      'creator', 'DJ 3D',
      'event', 'I Luv Hip Hop',
      'attribution_line', 'Featuring DJ 3D · Presented with Dulce Lounge'
    ),
    'I chose {{choice}} 😂 What are you picking?',
    '3D gets one final song. What should it be?',
    'Vote on the last record for I Luv Hip Hop Thursday at Dulce Lounge. Kingston decides.',
    'https://images.unsplash.com/photo-1571266028241-d34cbea0b0e1?auto=format&fit=crop&q=80&w=1200',
    true,
    now(),
    jsonb_build_object('seed', true, 'city', 'Kingston', 'event_date', '2026-08-27')
  WHERE NOT EXISTS (
    SELECT 1 FROM public.acquisition_discoveries WHERE slug = 'final-song'
  )
  RETURNING id
)
INSERT INTO public.acquisition_discovery_choices (discovery_id, label, sort_order, image_url, metadata)
SELECT ins.id, v.label, v.sort_order, v.image_url, v.metadata
FROM ins
CROSS JOIN (
  VALUES
    ('2000s Hip-Hop Anthem', 0, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=400', '{"category":"hip-hop"}'::jsonb),
    ('Dancehall Crossover', 1, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400', '{"category":"dancehall"}'::jsonb),
    ('Ladies R&B/Hip-Hop', 2, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400', '{"category":"rnb"}'::jsonb),
    ('Crowd Chaos Record', 3, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=400', '{"category":"chaos"}'::jsonb)
) AS v(label, sort_order, image_url, metadata);

-- Ensure choices exist even if discovery already seeded
INSERT INTO public.acquisition_discovery_choices (discovery_id, label, sort_order, image_url, metadata)
SELECT d.id, v.label, v.sort_order, v.image_url, v.metadata
FROM public.acquisition_discoveries d
CROSS JOIN (
  VALUES
    ('2000s Hip-Hop Anthem', 0, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=400', '{"category":"hip-hop"}'::jsonb),
    ('Dancehall Crossover', 1, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400', '{"category":"dancehall"}'::jsonb),
    ('Ladies R&B/Hip-Hop', 2, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400', '{"category":"rnb"}'::jsonb),
    ('Crowd Chaos Record', 3, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=400', '{"category":"chaos"}'::jsonb)
) AS v(label, sort_order, image_url, metadata)
WHERE d.slug = 'final-song'
  AND NOT EXISTS (
    SELECT 1 FROM public.acquisition_discovery_choices c WHERE c.discovery_id = d.id
  );

-- ----------------------------------------------------------
-- Seed Discovery 2: Weekend move template
-- ----------------------------------------------------------
WITH scene AS (
  SELECT id FROM public.scenes WHERE slug = 'kingston-after-dark' LIMIT 1
),
ins AS (
  INSERT INTO public.acquisition_discoveries (
    slug, title, eyebrow, description, cover_image_url, discovery_type, max_selections,
    scene_id, starts_at, closes_at, status, capture_required, results_visibility,
    primary_next_action, next_action_label, next_action_config, reward_points,
    partner_attribution, share_copy_template, seo_title, seo_description,
    indexable, published_at, metadata
  )
  SELECT
    'kingston-weekend',
    'You get ONE move this weekend. What are you choosing?',
    'What Kingston Is Doing',
    'Pick the Moment that owns your weekend. See what the Scene is choosing — then send it to your crew.',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
    'single_choice',
    1,
    (SELECT id FROM scene),
    now() - interval '1 hour',
    now() + interval '7 days',
    'live',
    true,
    'after_capture',
    'view_moment',
    'See the Moment',
    jsonb_build_object(
      'secondary_actions', jsonb_build_array('express_interest', 'share'),
      'template', 'weekend_move'
    ),
    10,
    jsonb_build_object('attribution_line', 'Kingston Scene · Promorang'),
    'Kingston needs to settle this. Vote:',
    'You get ONE move this weekend. What are you choosing?',
    'Vote on what Kingston is doing this weekend — then see the Moment and send it to your crew.',
    true,
    now(),
    jsonb_build_object('seed', true, 'template', 'weekend_move', 'city', 'Kingston')
  WHERE NOT EXISTS (
    SELECT 1 FROM public.acquisition_discoveries WHERE slug = 'kingston-weekend'
  )
  RETURNING id
)
INSERT INTO public.acquisition_discovery_choices (discovery_id, label, description, image_url, sort_order, moment_id, metadata)
SELECT
  ins.id,
  coalesce(m.title, v.fallback_label),
  coalesce(m.location, v.fallback_venue),
    coalesce(m.image_url, v.fallback_image),
  v.sort_order,
  m.id,
  jsonb_build_object(
    'event_title', coalesce(m.title, v.fallback_label),
    'venue', coalesce(m.location, v.fallback_venue),
    'category', coalesce(m.category, 'Nightlife'),
    'date', m.starts_at
  )
FROM ins
CROSS JOIN (
  VALUES
    (0, 'i-luv-hip-hop-live-culture-lab', 'I Luv Hip Hop', 'Dulce Lounge', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400'),
    (1, NULL, 'Late Night Taste Run', 'Kingston street food', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400'),
    (2, NULL, 'Sunday Brunch Circuit', 'Uptown Kingston', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=400'),
    (3, NULL, 'Stay In / Reload', 'Home base', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400')
) AS v(sort_order, moment_slug, fallback_label, fallback_venue, fallback_image)
LEFT JOIN LATERAL (
  SELECT * FROM public.moments mm
  WHERE (v.moment_slug IS NOT NULL AND mm.slug = v.moment_slug)
     OR (v.sort_order = 0 AND mm.title ILIKE '%I Luv Hip Hop%')
  ORDER BY mm.created_at DESC NULLS LAST
  LIMIT 1
) m ON true;

-- Backfill weekend choices if discovery exists without choices
INSERT INTO public.acquisition_discovery_choices (discovery_id, label, description, image_url, sort_order, moment_id, metadata)
SELECT
  d.id,
  coalesce(m.title, v.fallback_label),
  coalesce(m.location, v.fallback_venue),
  coalesce(m.image_url, v.fallback_image),
  v.sort_order,
  m.id,
  jsonb_build_object(
    'event_title', coalesce(m.title, v.fallback_label),
    'venue', coalesce(m.location, v.fallback_venue),
    'category', coalesce(m.category, 'Nightlife'),
    'date', m.starts_at
  )
FROM public.acquisition_discoveries d
CROSS JOIN (
  VALUES
    (0, 'i-luv-hip-hop-live-culture-lab', 'I Luv Hip Hop', 'Dulce Lounge', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400'),
    (1, NULL, 'Late Night Taste Run', 'Kingston street food', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400'),
    (2, NULL, 'Sunday Brunch Circuit', 'Uptown Kingston', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=400'),
    (3, NULL, 'Stay In / Reload', 'Home base', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400')
) AS v(sort_order, moment_slug, fallback_label, fallback_venue, fallback_image)
LEFT JOIN LATERAL (
  SELECT * FROM public.moments mm
  WHERE (v.moment_slug IS NOT NULL AND mm.slug = v.moment_slug)
     OR (v.sort_order = 0 AND mm.title ILIKE '%I Luv Hip Hop%')
  ORDER BY mm.created_at DESC NULLS LAST
  LIMIT 1
) m ON true
WHERE d.slug = 'kingston-weekend'
  AND NOT EXISTS (
    SELECT 1 FROM public.acquisition_discovery_choices c WHERE c.discovery_id = d.id
  );

NOTIFY pgrst, 'reload schema';
