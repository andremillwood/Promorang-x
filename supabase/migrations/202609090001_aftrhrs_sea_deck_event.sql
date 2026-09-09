-- AftrHrs at Sea Deck: venue profile, Moment, limited digital passes,
-- ambassador physical invitations, participation, FAQs, and atomic issuance.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.venue_profiles
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS opening_information text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS featured_image_url text;

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS music_categories text[],
  ADD COLUMN IF NOT EXISTS hosts jsonb,
  ADD COLUMN IF NOT EXISTS access_rules_copy jsonb,
  ADD COLUMN IF NOT EXISTS paid_admission_jmd numeric,
  ADD COLUMN IF NOT EXISTS paid_patron_benefit text,
  ADD COLUMN IF NOT EXISTS series_key text;

CREATE TABLE IF NOT EXISTS public.event_editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venue_profiles(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  tagline text,
  supporting_copy text,
  powered_by text,
  music_categories text[] NOT NULL DEFAULT ARRAY[]::text[],
  published boolean NOT NULL DEFAULT true,
  page_mode text NOT NULL DEFAULT 'live' CHECK (page_mode IN ('live', 'post-event')),
  claims_open boolean NOT NULL DEFAULT true,
  digital_allocation integer NOT NULL DEFAULT 20 CHECK (digital_allocation >= 0),
  digital_claimed integer NOT NULL DEFAULT 0 CHECK (digital_claimed >= 0),
  claim_opens_at timestamptz,
  claim_closes_at timestamptz,
  capacity_information text,
  paid_admission_jmd numeric(12,2),
  paid_patron_benefit text,
  venue_policies jsonb NOT NULL DEFAULT '{}'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  artwork jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_editions_claimed_within_allocation CHECK (digital_claimed <= digital_allocation)
);

CREATE TABLE IF NOT EXISTS public.event_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  edition_id uuid REFERENCES public.event_editions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pass_type text NOT NULL CHECK (pass_type IN ('digital-free', 'physical-invitation', 'paid', 'guest-list')),
  unique_code text NOT NULL UNIQUE,
  qr_payload text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'cancelled', 'expired', 'transferred')),
  claim_source text,
  campaign text,
  referrer text,
  ambassador_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  email_normalized text,
  phone_normalized text,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz,
  redeemed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  validation_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS event_passes_one_digital_free_per_user
  ON public.event_passes(event_id, user_id)
  WHERE pass_type = 'digital-free' AND status IN ('active', 'redeemed', 'transferred');

CREATE UNIQUE INDEX IF NOT EXISTS event_passes_one_digital_free_per_email
  ON public.event_passes(event_id, email_normalized)
  WHERE pass_type = 'digital-free' AND status IN ('active', 'redeemed', 'transferred') AND email_normalized IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS event_passes_one_digital_free_per_phone
  ON public.event_passes(event_id, phone_normalized)
  WHERE pass_type = 'digital-free' AND status IN ('active', 'redeemed', 'transferred') AND phone_normalized IS NOT NULL;

CREATE INDEX IF NOT EXISTS event_passes_event_status_idx ON public.event_passes(event_id, status, pass_type);
CREATE INDEX IF NOT EXISTS event_passes_user_idx ON public.event_passes(user_id, claimed_at DESC);

CREATE TABLE IF NOT EXISTS public.event_ambassador_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  name text,
  profile_image_url text,
  allocation integer NOT NULL DEFAULT 0 CHECK (allocation >= 0),
  distributed integer NOT NULL DEFAULT 0 CHECK (distributed >= 0),
  tracking_code text NOT NULL,
  contact_preference text NOT NULL DEFAULT 'promorang',
  public_contact_handle text,
  contact_consent boolean NOT NULL DEFAULT false,
  distribution_locations jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ambassador_user_id, event_id),
  UNIQUE (tracking_code),
  CONSTRAINT event_ambassador_distributed_within_allocation CHECK (distributed <= allocation)
);

CREATE TABLE IF NOT EXISTS public.event_ambassador_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ambassador_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'fulfilled', 'cancelled')),
  note text,
  waitlist boolean NOT NULL DEFAULT false,
  pass_id uuid REFERENCES public.event_passes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  fulfilled_at timestamptz
);

CREATE INDEX IF NOT EXISTS event_ambassador_requests_event_idx
  ON public.event_ambassador_requests(event_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.event_moment_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'discovered' CHECK (state IN (
    'discovered', 'interested', 'pass_requested', 'digital_pass_claimed',
    'ambassador_request_submitted', 'physical_invitation_secured',
    'checked_in', 'attended', 'shared_content', 'completed'
  )),
  source text,
  referrer text,
  reminder_opt_in boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.event_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  session_id text,
  name text NOT NULL,
  source text,
  campaign text,
  referrer text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_analytics_events_lookup_idx
  ON public.event_analytics_events(event_id, name, created_at DESC);

CREATE TABLE IF NOT EXISTS public.venue_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venue_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venue_id, user_id)
);

ALTER TABLE public.event_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ambassador_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ambassador_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_moment_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_follows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_editions' AND policyname = 'Event editions are publicly readable') THEN
    CREATE POLICY "Event editions are publicly readable" ON public.event_editions FOR SELECT USING (published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_ambassador_allocations' AND policyname = 'Approved ambassadors are publicly readable') THEN
    CREATE POLICY "Approved ambassadors are publicly readable" ON public.event_ambassador_allocations FOR SELECT USING (approved = true AND active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_passes' AND policyname = 'Users read own event passes') THEN
    CREATE POLICY "Users read own event passes" ON public.event_passes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_moment_participations' AND policyname = 'Users read own event participation') THEN
    CREATE POLICY "Users read own event participation" ON public.event_moment_participations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'venue_follows' AND policyname = 'Users manage own venue follows') THEN
    CREATE POLICY "Users manage own venue follows" ON public.venue_follows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.claim_aftrhrs_digital_pass(
  p_user_id uuid,
  p_event_id uuid,
  p_terms_accepted boolean DEFAULT false,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_campaign text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_edition public.event_editions%ROWTYPE;
  v_pass public.event_passes%ROWTYPE;
  v_code text;
  v_email text;
  v_phone text;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;
  IF p_terms_accepted IS NOT TRUE THEN
    RAISE EXCEPTION 'TERMS_REQUIRED';
  END IF;

  v_email := NULLIF(lower(trim(COALESCE(p_email, ''))), '');
  v_phone := NULLIF(regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g'), '');
  IF v_phone IS NOT NULL AND length(v_phone) < 7 THEN
    v_phone := NULL;
  ELSIF v_phone IS NOT NULL AND length(v_phone) = 11 AND left(v_phone, 1) = '1' THEN
    v_phone := substr(v_phone, 2);
  END IF;

  SELECT * INTO v_edition
  FROM public.event_editions
  WHERE moment_id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND';
  END IF;
  IF v_edition.published IS NOT TRUE THEN
    RAISE EXCEPTION 'UNPUBLISHED';
  END IF;
  IF v_edition.claims_open IS NOT TRUE THEN
    RAISE EXCEPTION 'CLAIMS_CLOSED';
  END IF;
  IF v_edition.claim_opens_at IS NOT NULL AND now() < v_edition.claim_opens_at THEN
    RAISE EXCEPTION 'CLAIMS_CLOSED';
  END IF;
  IF v_edition.claim_closes_at IS NOT NULL AND now() >= v_edition.claim_closes_at THEN
    RAISE EXCEPTION 'DEADLINE';
  END IF;
  IF v_edition.digital_claimed >= v_edition.digital_allocation THEN
    RAISE EXCEPTION 'SOLD_OUT';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.event_passes
    WHERE event_id = p_event_id
      AND user_id = p_user_id
      AND pass_type = 'digital-free'
      AND status IN ('active', 'redeemed', 'transferred')
  ) THEN
    RAISE EXCEPTION 'ALREADY_CLAIMED';
  END IF;

  IF v_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.event_passes
    WHERE event_id = p_event_id
      AND email_normalized = v_email
      AND pass_type = 'digital-free'
      AND status IN ('active', 'redeemed', 'transferred')
  ) THEN
    RAISE EXCEPTION 'IDENTITY_CLAIMED';
  END IF;

  IF v_phone IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.event_passes
    WHERE event_id = p_event_id
      AND phone_normalized = v_phone
      AND pass_type = 'digital-free'
      AND status IN ('active', 'redeemed', 'transferred')
  ) THEN
    RAISE EXCEPTION 'IDENTITY_CLAIMED';
  END IF;

  v_code := 'AH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.event_passes (
    event_id, edition_id, user_id, pass_type, unique_code, qr_payload, status,
    claim_source, campaign, referrer, email_normalized, phone_normalized, metadata
  ) VALUES (
    p_event_id, v_edition.id, p_user_id, 'digital-free', v_code,
    'promorang://aftrhrs/redeem/' || v_code, 'active',
    COALESCE(p_source, 'landing'), p_campaign, p_referrer, v_email, v_phone,
    COALESCE(p_metadata, '{}'::jsonb)
  ) RETURNING * INTO v_pass;

  UPDATE public.event_editions
  SET digital_claimed = digital_claimed + 1, updated_at = now()
  WHERE id = v_edition.id
    AND digital_claimed < digital_allocation
  RETURNING * INTO v_edition;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SOLD_OUT';
  END IF;

  INSERT INTO public.event_moment_participations (user_id, event_id, state, source, referrer)
  VALUES (p_user_id, p_event_id, 'digital_pass_claimed', COALESCE(p_source, 'landing'), p_referrer)
  ON CONFLICT (user_id, event_id) DO UPDATE SET
    state = CASE
      WHEN public.event_moment_participations.state IN ('checked_in', 'attended', 'shared_content', 'completed')
        THEN public.event_moment_participations.state
      ELSE 'digital_pass_claimed'
    END,
    source = COALESCE(public.event_moment_participations.source, EXCLUDED.source),
    referrer = COALESCE(EXCLUDED.referrer, public.event_moment_participations.referrer),
    updated_at = now();

  RETURN jsonb_build_object(
    'pass', to_jsonb(v_pass),
    'remaining', v_edition.digital_allocation - v_edition.digital_claimed,
    'sold_out', v_edition.digital_claimed >= v_edition.digital_allocation
  );
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'ALREADY_CLAIMED';
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_aftrhrs_pass(
  p_actor_user_id uuid,
  p_code text,
  p_notes text DEFAULT NULL,
  p_device jsonb DEFAULT '{}'::jsonb
) RETURNS public.event_passes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pass public.event_passes%ROWTYPE;
  v_code text;
BEGIN
  v_code := upper(trim(COALESCE(p_code, '')));
  v_code := regexp_replace(v_code, '^PROMORANG://AFTRHRS/REDEEM/', '');

  SELECT * INTO v_pass
  FROM public.event_passes
  WHERE unique_code = v_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
  IF v_pass.status = 'redeemed' THEN
    RAISE EXCEPTION 'ALREADY_REDEEMED';
  END IF;
  IF v_pass.status <> 'active' THEN
    RAISE EXCEPTION 'NOT_REDEEMABLE';
  END IF;

  UPDATE public.event_passes
  SET status = 'redeemed',
      redeemed_at = now(),
      redeemed_by = p_actor_user_id,
      validation_metadata = COALESCE(p_device, '{}'::jsonb) || jsonb_build_object('notes', p_notes),
      updated_at = now()
  WHERE id = v_pass.id
  RETURNING * INTO v_pass;

  INSERT INTO public.event_moment_participations (user_id, event_id, state, source)
  VALUES (v_pass.user_id, v_pass.event_id, 'checked_in', 'door')
  ON CONFLICT (user_id, event_id) DO UPDATE SET
    state = 'checked_in',
    updated_at = now();

  RETURN v_pass;
END;
$$;

CREATE OR REPLACE FUNCTION public.fulfill_aftrhrs_invitation(
  p_ambassador_id uuid,
  p_event_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_request_id uuid DEFAULT NULL,
  p_unique_code text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_alloc public.event_ambassador_allocations%ROWTYPE;
  v_pass public.event_passes%ROWTYPE;
  v_code text;
  v_phone text;
BEGIN
  SELECT * INTO v_alloc
  FROM public.event_ambassador_allocations
  WHERE ambassador_user_id = p_ambassador_id AND event_id = p_event_id
  FOR UPDATE;

  IF NOT FOUND OR v_alloc.approved IS NOT TRUE OR v_alloc.active IS NOT TRUE THEN
    RAISE EXCEPTION 'AMBASSADOR_NOT_FOUND';
  END IF;
  IF v_alloc.distributed >= v_alloc.allocation THEN
    RAISE EXCEPTION 'ALLOCATION_EXHAUSTED';
  END IF;

  v_phone := NULLIF(regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g'), '');
  IF v_phone IS NOT NULL AND length(v_phone) < 7 THEN
    v_phone := NULL;
  ELSIF v_phone IS NOT NULL AND length(v_phone) = 11 AND left(v_phone, 1) = '1' THEN
    v_phone := substr(v_phone, 2);
  END IF;
  v_code := COALESCE(NULLIF(upper(trim(p_unique_code)), ''), 'AH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

  INSERT INTO public.event_passes (
    event_id, user_id, pass_type, unique_code, qr_payload, status,
    claim_source, campaign, referrer, ambassador_id, phone_normalized
  ) VALUES (
    p_event_id,
    COALESCE(p_user_id, p_ambassador_id),
    'physical-invitation',
    v_code,
    'promorang://aftrhrs/redeem/' || v_code,
    'active',
    'ambassador',
    v_alloc.tracking_code,
    p_ambassador_id::text,
    p_ambassador_id,
    v_phone
  ) RETURNING * INTO v_pass;

  UPDATE public.event_ambassador_allocations
  SET distributed = distributed + 1, updated_at = now()
  WHERE id = v_alloc.id AND distributed < allocation
  RETURNING * INTO v_alloc;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ALLOCATION_EXHAUSTED';
  END IF;

  IF p_request_id IS NOT NULL THEN
    UPDATE public.event_ambassador_requests
    SET status = 'fulfilled', pass_id = v_pass.id, ambassador_id = p_ambassador_id, fulfilled_at = now(), updated_at = now()
    WHERE id = p_request_id;
  END IF;

  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.event_moment_participations (user_id, event_id, state, source, referrer)
    VALUES (p_user_id, p_event_id, 'physical_invitation_secured', 'ambassador', p_ambassador_id::text)
    ON CONFLICT (user_id, event_id) DO UPDATE SET
      state = CASE
        WHEN public.event_moment_participations.state IN ('checked_in', 'attended', 'shared_content', 'completed')
          THEN public.event_moment_participations.state
        ELSE 'physical_invitation_secured'
      END,
      updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'pass', to_jsonb(v_pass),
    'remaining', v_alloc.allocation - v_alloc.distributed
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_aftrhrs_digital_pass(uuid, uuid, boolean, text, text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.redeem_aftrhrs_pass(uuid, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fulfill_aftrhrs_invitation(uuid, uuid, uuid, text, uuid, text) FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  v_host_id uuid := '00000000-0000-0000-0000-000000000001';
  v_venue_id uuid := '00000000-0000-0000-0003-000000000080';
  v_moment_id uuid := '00000000-0000-0000-0002-000000000080';
  v_edition_id uuid := '00000000-0000-0000-0004-000000000080';
  v_amb_field uuid := '00000000-0000-0000-0000-000000000081';
  v_amb_door uuid := '00000000-0000-0000-0000-000000000082';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_host_id) THEN
    INSERT INTO public.users (
      id, email, username, display_name, user_type, user_tier, avatar_url, points_balance, keys_balance, gems_balance
    ) VALUES (
      v_host_id, 'editorial@promorang.co', 'promorang_presents', 'Promorang Presents', 'host', 'verified',
      '/campaigns/aftrhrs/logo.jpg', 5000, 100, 500
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.users (
    id, email, username, display_name, user_type, user_tier, avatar_url, points_balance, keys_balance, gems_balance
  ) VALUES
    (v_amb_field, 'ambassador.field@promorang.co', 'aftrhrs_field', 'AftrHrs Field', 'creator', 'verified', '/campaigns/aftrhrs/logo.jpg', 0, 0, 0),
    (v_amb_door, 'ambassador.door@promorang.co', 'aftrhrs_door', 'AftrHrs Door', 'creator', 'verified', '/campaigns/aftrhrs/invite.jpg', 0, 0, 0)
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    username = EXCLUDED.username;

  INSERT INTO public.venues (
    id, owner_id, name, venue_name, address, location, description, image_url, category, is_active, slug, latitude, longitude, is_verified
  ) VALUES (
    v_venue_id, v_host_id, 'Sea Deck', 'Sea Deck',
    'Orchid Village, 20 Barbican Road, Kingston',
    'Orchid Village, 20 Barbican Road, Kingston',
    'Sea Deck is an open-air Barbican venue combining dining, drinks and nightlife in a distinctive deck-side setting. Follow Sea Deck on Promorang to discover upcoming experiences, offers and Moments.',
    '/campaigns/aftrhrs/flyer.jpg',
    'Nightlife & Music',
    true,
    'sea-deck',
    18.0174,
    -76.7669,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    venue_name = EXCLUDED.venue_name,
    address = EXCLUDED.address,
    location = EXCLUDED.location,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    slug = EXCLUDED.slug,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    is_verified = EXCLUDED.is_verified,
    is_active = true;

  INSERT INTO public.venue_profiles (
    id, name, slug, description, location, address, city, country, venue_type,
    verification_status, images, featured_image_url, latitude, longitude,
    social_links, contact, opening_information, is_active, popularity_score, capacity
  ) VALUES (
    v_venue_id,
    'Sea Deck',
    'sea-deck',
    'Sea Deck is an open-air Barbican venue combining dining, drinks and nightlife in a distinctive deck-side setting. Follow Sea Deck on Promorang to discover upcoming experiences, offers and Moments.',
    'Orchid Village, Barbican',
    'Orchid Village, 20 Barbican Road, Kingston',
    'Kingston',
    'Jamaica',
    'bar',
    'verified',
    '[{"url":"/campaigns/aftrhrs/flyer.jpg","alt":"AftrHrs at Sea Deck"},{"url":"/campaigns/aftrhrs/invite.jpg","alt":"AftrHrs invitation"},{"url":"/campaigns/aftrhrs/logo.jpg","alt":"AftrHrs mark"}]'::jsonb,
    '/campaigns/aftrhrs/flyer.jpg',
    18.0174,
    -76.7669,
    '{}'::jsonb,
    '{}'::jsonb,
    NULL,
    true,
    96,
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    venue_type = EXCLUDED.venue_type,
    verification_status = 'verified',
    images = EXCLUDED.images,
    featured_image_url = EXCLUDED.featured_image_url,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    is_active = true;

  INSERT INTO public.moments (
    id, host_id, venue_id, venue_name, title, slug, description, category, location,
    starts_at, ends_at, max_participants, reward, image_url, is_active, visibility,
    latitude, longitude, city, country, music_categories, paid_admission_jmd, paid_patron_benefit,
    series_key, created_at, updated_at
  ) VALUES (
    v_moment_id, v_host_id, v_venue_id, 'Sea Deck', 'AftrHrs', 'aftrhrs',
    'AftrHrs brings Afro House, Classic House and House Fusion to Sea Deck for a carefully curated night powered by Origin: Alric & Boyd.',
    'Music & Parties',
    'Sea Deck, Orchid Village, 20 Barbican Road, Kingston',
    '2026-09-11 22:00:00-05',
    NULL,
    NULL,
    'Digital Free Pass or Ambassador invitation',
    '/campaigns/aftrhrs/flyer.jpg',
    true,
    'open',
    18.0174,
    -76.7669,
    'Kingston',
    'Jamaica',
    ARRAY['Afro House', 'Classic House', 'House Fusion'],
    2000,
    'Complimentary drink and wings',
    'aftrhrs',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    venue_id = EXCLUDED.venue_id,
    venue_name = EXCLUDED.venue_name,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    starts_at = EXCLUDED.starts_at,
    image_url = EXCLUDED.image_url,
    music_categories = EXCLUDED.music_categories,
    paid_admission_jmd = EXCLUDED.paid_admission_jmd,
    paid_patron_benefit = EXCLUDED.paid_patron_benefit,
    series_key = EXCLUDED.series_key,
    is_active = true,
    updated_at = now();

  INSERT INTO public.event_editions (
    id, moment_id, venue_id, slug, title, tagline, supporting_copy, powered_by, music_categories,
    published, page_mode, claims_open, digital_allocation, digital_claimed,
    claim_opens_at, claim_closes_at, capacity_information, paid_admission_jmd, paid_patron_benefit,
    venue_policies, faqs, artwork
  ) VALUES (
    v_edition_id, v_moment_id, v_venue_id, 'aftrhrs', 'AftrHrs',
    'After hours is where house lives.',
    'AftrHrs brings Afro House, Classic House and House Fusion to Sea Deck for a carefully curated night powered by Origin: Alric & Boyd.',
    'Origin — Alric & Boyd',
    ARRAY['Afro House', 'Classic House', 'House Fusion'],
    true, 'live', true, 20, 0,
    NULL, '2026-09-11 22:00:00-05',
    'Admission remains subject to venue capacity and Sea Deck entry policies.',
    2000,
    'Complimentary drink and wings',
    '{"dress_code": null, "entry_policy": "Valid invitation, RSVP, or paid admission. Capacity and door policy remain with Sea Deck."}'::jsonb,
    '[
      {"question":"Are Digital Free Passes still available?","answer":"Digital Free Passes are limited and go quickly. Claim yours while they last."},
      {"question":"What time must I arrive to get in free?","answer":"RSVP and Digital Free Pass holders must arrive before 11:30 PM to get in free."},
      {"question":"What happens when the Digital Free Passes are claimed?","answer":"Find an AftrHrs Ambassador for a physical invitation. Paid entry stays open."},
      {"question":"How do I obtain a physical invitation?","answer":"Connect with an approved AftrHrs Ambassador. They distribute the remaining free invitations in person."},
      {"question":"Does a physical invitation guarantee entry?","answer":"A valid invitation or RSVP covers admission, subject to Sea Deck capacity, entry policies, and successful verification at the door."},
      {"question":"What is the cost without an invitation or RSVP?","answer":"Entry without an invitation or RSVP is JMD $2,000."},
      {"question":"What does the paid admission include?","answer":"Paid patrons receive complimentary drink and wings."},
      {"question":"Where is Sea Deck?","answer":"Orchid Village, 20 Barbican Road, Kingston."},
      {"question":"How will my Digital Free Pass be verified?","answer":"Present the unique QR code from your Promorang pass at Sea Deck. Staff scan it once. A redeemed pass cannot be scanned again."},
      {"question":"Can I transfer my pass?","answer":"Each Digital Free Pass is for one person and cannot be transferred."},
      {"question":"What happens if the venue reaches capacity?","answer":"Admission remains subject to venue capacity and Sea Deck entry policies even with a valid pass or invitation."}
    ]'::jsonb,
    '{"logo":"/campaigns/aftrhrs/logo.jpg","flyer":"/campaigns/aftrhrs/flyer.jpg","invite":"/campaigns/aftrhrs/invite.jpg","og":"/og/aftrhrs.jpg"}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    tagline = EXCLUDED.tagline,
    supporting_copy = EXCLUDED.supporting_copy,
    powered_by = EXCLUDED.powered_by,
    faqs = EXCLUDED.faqs,
    artwork = EXCLUDED.artwork,
    updated_at = now();

  INSERT INTO public.event_ambassador_allocations (
    ambassador_user_id, event_id, name, profile_image_url, allocation, distributed,
    tracking_code, contact_preference, public_contact_handle, contact_consent,
    distribution_locations, approved, active
  ) VALUES
    (
      v_amb_field, v_moment_id, 'AftrHrs Field', '/campaigns/aftrhrs/logo.jpg', 15, 0,
      'AH-FIELD', 'promorang', NULL, false,
      '[{"label":"Ambassadors","detail":"Approved field ambassadors distribute physical invitations by arrangement."}]'::jsonb,
      true, true
    ),
    (
      v_amb_door, v_moment_id, 'Sea Deck Wednesday desk', '/campaigns/aftrhrs/invite.jpg', 15, 0,
      'AH-SEADECK', 'promorang', NULL, false,
      '[{"label":"Sea Deck","detail":"Physical invitations may be collected at Sea Deck on Wednesday at 7:00 PM when announced."}]'::jsonb,
      true, true
    )
  ON CONFLICT (ambassador_user_id, event_id) DO UPDATE SET
    name = EXCLUDED.name,
    allocation = EXCLUDED.allocation,
    tracking_code = EXCLUDED.tracking_code,
    approved = true,
    active = true;
END $$;
