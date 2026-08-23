-- Provenance-aware cold-start inventory pipeline for Jamaica.
-- Collected records remain private until an operator explicitly approves them.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.inventory_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text NOT NULL UNIQUE,
  name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('open_data', 'official_directory', 'organizer_site', 'partner_feed', 'manual')),
  base_url text,
  license_name text,
  license_url text,
  attribution_text text,
  terms_url text,
  enabled boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.inventory_sources(id),
  region text NOT NULL,
  status text NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'ready_for_review', 'completed', 'failed')),
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query jsonb NOT NULL DEFAULT '{}'::jsonb,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.inventory_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.inventory_import_batches(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.inventory_sources(id),
  entity_type text NOT NULL CHECK (entity_type IN ('venue', 'brand', 'moment', 'discovery')),
  source_record_id text NOT NULL,
  source_url text,
  source_first_seen_at timestamptz NOT NULL DEFAULT now(),
  source_last_checked_at timestamptz NOT NULL DEFAULT now(),
  raw_data jsonb NOT NULL,
  normalized_data jsonb NOT NULL,
  fingerprint text NOT NULL,
  confidence numeric(4,3) NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_research', 'published')),
  review_notes text,
  duplicate_of uuid REFERENCES public.inventory_candidates(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  published_record_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, entity_type, source_record_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_candidates_review
  ON public.inventory_candidates (review_status, entity_type, confidence DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_candidates_fingerprint
  ON public.inventory_candidates (fingerprint);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_source_status
  ON public.inventory_import_batches (source_id, status, started_at DESC);

ALTER TABLE public.inventory_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_candidates ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies are intentional: these are operator/service-role tables.
REVOKE ALL ON public.inventory_sources FROM anon, authenticated;
REVOKE ALL ON public.inventory_import_batches FROM anon, authenticated;
REVOKE ALL ON public.inventory_candidates FROM anon, authenticated;
GRANT ALL ON public.inventory_sources TO service_role;
GRANT ALL ON public.inventory_import_batches TO service_role;
GRANT ALL ON public.inventory_candidates TO service_role;

INSERT INTO public.inventory_sources (
  source_key, name, source_type, base_url, license_name, license_url, attribution_text, terms_url
) VALUES (
  'openstreetmap',
  'OpenStreetMap',
  'open_data',
  'https://www.openstreetmap.org',
  'Open Data Commons Open Database License (ODbL)',
  'https://opendatacommons.org/licenses/odbl/1-0/',
  '© OpenStreetMap contributors',
  'https://operations.osmfoundation.org/policies/'
)
ON CONFLICT (source_key) DO UPDATE SET
  license_name = EXCLUDED.license_name,
  license_url = EXCLUDED.license_url,
  attribution_text = EXCLUDED.attribution_text,
  terms_url = EXCLUDED.terms_url,
  updated_at = now();

-- Some deployments never received the earlier cold-start bootstrap migration.
-- Keep this migration self-contained while remaining compatible with installations
-- where the table already exists.
CREATE TABLE IF NOT EXISTS public.pre_populated_venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name text NOT NULL,
  venue_slug text UNIQUE,
  address text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'Jamaica',
  latitude numeric(10,8),
  longitude numeric(11,8),
  phone text,
  website text,
  email text,
  social_profiles jsonb NOT NULL DEFAULT '{}'::jsonb,
  categories text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  logo_url text,
  data_source text,
  enrichment_status text NOT NULL DEFAULT 'pending',
  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  claim_token text UNIQUE,
  inventory_candidate_id uuid REFERENCES public.inventory_candidates(id) ON DELETE SET NULL,
  source_url text,
  attribution_text text,
  is_claimed boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'unverified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pre_populated_venues
  ADD COLUMN IF NOT EXISTS venue_name text,
  ADD COLUMN IF NOT EXISTS venue_slug text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Jamaica',
  ADD COLUMN IF NOT EXISTS latitude numeric(10,8),
  ADD COLUMN IF NOT EXISTS longitude numeric(11,8),
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS social_profiles jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS data_source text,
  ADD COLUMN IF NOT EXISTS enrichment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS claim_token text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS inventory_candidate_id uuid REFERENCES public.inventory_candidates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS attribution_text text,
  ADD COLUMN IF NOT EXISTS is_claimed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified';

-- Replace an earlier partial-index version so ON CONFLICT can infer it on reruns.
DROP INDEX IF EXISTS public.idx_pre_populated_venues_inventory_candidate;
CREATE UNIQUE INDEX idx_pre_populated_venues_inventory_candidate
  ON public.pre_populated_venues (inventory_candidate_id);

CREATE OR REPLACE FUNCTION public.publish_approved_inventory_venue(p_candidate_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate public.inventory_candidates%ROWTYPE;
  published_id uuid;
  slug_base text;
BEGIN
  SELECT * INTO candidate
  FROM public.inventory_candidates
  WHERE id = p_candidate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory candidate not found';
  END IF;
  IF candidate.entity_type <> 'venue' THEN
    RAISE EXCEPTION 'Candidate is not a venue';
  END IF;
  IF candidate.review_status <> 'approved' THEN
    RAISE EXCEPTION 'Candidate must be approved before publication';
  END IF;

  slug_base := trim(both '-' from regexp_replace(
    lower(candidate.normalized_data->>'name'), '[^a-z0-9]+', '-', 'g'
  ));

  INSERT INTO public.pre_populated_venues (
    venue_name,
    venue_slug,
    address,
    city,
    state,
    country,
    latitude,
    longitude,
    phone,
    website,
    social_profiles,
    categories,
    tags,
    data_source,
    enrichment_status,
    inventory_candidate_id,
    source_url,
    attribution_text,
    is_claimed,
    verification_status
  ) VALUES (
    candidate.normalized_data->>'name',
    concat(slug_base, '-', left(candidate.id::text, 8)),
    candidate.normalized_data->>'address',
    candidate.normalized_data->>'city',
    candidate.normalized_data->>'parish',
    COALESCE(candidate.normalized_data->>'country', 'Jamaica'),
    NULLIF(candidate.normalized_data->>'latitude', '')::numeric,
    NULLIF(candidate.normalized_data->>'longitude', '')::numeric,
    candidate.normalized_data->>'phone',
    candidate.normalized_data->>'website',
    COALESCE(candidate.normalized_data->'social_profiles', '{}'::jsonb),
    ARRAY[candidate.normalized_data->>'category'],
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(candidate.normalized_data->'tags', '[]'::jsonb))),
    'openstreetmap',
    'completed',
    candidate.id,
    candidate.source_url,
    '© OpenStreetMap contributors',
    false,
    'unverified'
  )
  ON CONFLICT (inventory_candidate_id) DO UPDATE SET
    source_url = EXCLUDED.source_url,
    updated_at = now()
  RETURNING id INTO published_id;

  UPDATE public.inventory_candidates
  SET review_status = 'published', published_record_id = published_id::text, updated_at = now()
  WHERE id = candidate.id;

  RETURN published_id;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_approved_inventory_venue(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_approved_inventory_venue(uuid) TO service_role;
