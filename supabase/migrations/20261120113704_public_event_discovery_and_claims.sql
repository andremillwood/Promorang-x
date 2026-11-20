-- Verified event publication and reviewed ownership of sourced listings.
-- Draft only. Generate the final migration name with the Supabase CLI.
-- Existing email-directed page_ownership_claims are deliberately unchanged.

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION app_private.listing_key(p_value text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = ''
AS $$ SELECT trim(regexp_replace(lower(coalesce(p_value,'')), '[^[:alnum:]]+', ' ', 'g')); $$;
REVOKE ALL ON FUNCTION app_private.listing_key(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION app_private.country_key(p_value text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = '' AS $$
  SELECT CASE upper(trim(coalesce(p_value,'')))
    WHEN 'USA' THEN 'US' WHEN 'UNITED STATES' THEN 'US' WHEN 'UNITED STATES OF AMERICA' THEN 'US'
    WHEN 'JAMAICA' THEN 'JM' WHEN 'UK' THEN 'GB' WHEN 'UNITED KINGDOM' THEN 'GB' WHEN 'GREAT BRITAIN' THEN 'GB'
    WHEN 'TRINIDAD AND TOBAGO' THEN 'TT' WHEN 'TRINIDAD & TOBAGO' THEN 'TT'
    WHEN 'BARBADOS' THEN 'BB' WHEN 'BAHAMAS' THEN 'BS' WHEN 'THE BAHAMAS' THEN 'BS'
    WHEN 'GUYANA' THEN 'GY' WHEN 'GHANA' THEN 'GH' WHEN 'DOMINICAN REPUBLIC' THEN 'DO'
    WHEN 'COLOMBIA' THEN 'CO' WHEN 'PANAMA' THEN 'PA'
    WHEN 'ANTIGUA AND BARBUDA' THEN 'AG' WHEN 'ANTIGUA & BARBUDA' THEN 'AG'
    ELSE upper(trim(coalesce(p_value,''))) END;
$$;
REVOKE ALL ON FUNCTION app_private.country_key(text) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION app_private.address_key(p_value text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = '' AS $$
  SELECT trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(
    app_private.listing_key(split_part(coalesce(p_value,''),',',1)),
    '\mrd\M','road','g'),'\mst\M','street','g'),'\mave\M','avenue','g'),'\mblvd\M','boulevard','g'));
$$;
REVOKE ALL ON FUNCTION app_private.address_key(text) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION app_private.region_key(p_value text,p_country_code text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = '' AS $$
  SELECT CASE WHEN p_country_code='US' THEN CASE upper(trim(coalesce(p_value,'')))
    WHEN 'FL' THEN 'florida' WHEN 'US-FL' THEN 'florida'
    WHEN 'GA' THEN 'georgia' WHEN 'US-GA' THEN 'georgia'
    WHEN 'NY' THEN 'new york' WHEN 'US-NY' THEN 'new york'
    WHEN 'MI' THEN 'michigan' WHEN 'US-MI' THEN 'michigan'
    ELSE app_private.listing_key(p_value) END ELSE app_private.listing_key(p_value) END;
$$;
REVOKE ALL ON FUNCTION app_private.region_key(text,text) FROM PUBLIC,anon,authenticated;

-- Separate from legacy venue import metadata.auto_publish. Policies are opt-in
-- for one source and one geographic market, and are writable only by service role.
CREATE TABLE public.event_publication_policies (
  source_id uuid NOT NULL REFERENCES public.inventory_sources(id) ON DELETE CASCADE,
  market_key text NOT NULL CHECK (length(market_key) BETWEEN 2 AND 100),
  country_code text NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  country_name text NOT NULL CHECK (length(trim(country_name)) > 0),
  state text CHECK (state IS NULL OR length(trim(state)) > 0),
  allowed_timezones text[] NOT NULL CHECK (cardinality(allowed_timezones)>0),
  enabled boolean NOT NULL DEFAULT false,
  minimum_confidence numeric NOT NULL DEFAULT 0.95 CHECK (minimum_confidence BETWEEN 0.9 AND 1),
  max_evidence_age_hours integer NOT NULL DEFAULT 72 CHECK (max_evidence_age_hours BETWEEN 1 AND 168),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_id, market_key)
);
ALTER TABLE public.event_publication_policies ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.event_publication_policies FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.event_publication_policies TO service_role;

CREATE TABLE public.imported_listing_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('moment','venue')),
  entity_id uuid NOT NULL,
  display_name text NOT NULL,
  claimant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected')),
  claimant_note text NOT NULL CHECK (length(trim(claimant_note)) BETWEEN 20 AND 4000),
  evidence_url text NOT NULL CHECK (length(evidence_url) <= 2048 AND evidence_url ~ '^https://[^[:space:]]+$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_note text,
  CHECK ((status = 'requested' AND reviewed_at IS NULL) OR (status <> 'requested' AND reviewed_at IS NOT NULL))
);
CREATE UNIQUE INDEX imported_listing_claims_one_request_per_person
  ON public.imported_listing_claims(entity_type,entity_id,claimant_id) WHERE status='requested';
CREATE UNIQUE INDEX imported_listing_claims_one_approved_owner
  ON public.imported_listing_claims(entity_type,entity_id) WHERE status='approved';
CREATE INDEX imported_listing_claims_claimant_created
  ON public.imported_listing_claims(claimant_id,created_at DESC);
CREATE INDEX imported_listing_claims_pending
  ON public.imported_listing_claims(created_at) WHERE status='requested';
ALTER TABLE public.imported_listing_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.imported_listing_claims FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.imported_listing_claims TO authenticated;
GRANT ALL ON public.imported_listing_claims TO service_role;
CREATE POLICY imported_listing_claims_private_read ON public.imported_listing_claims
  FOR SELECT TO authenticated
  USING (claimant_id = (SELECT auth.uid()) OR public.is_claimable_page_admin((SELECT auth.uid())));

-- An unclaimed listing is an invitation to request review, not permission to
-- assign ownership by directly updating the public row.
DROP POLICY IF EXISTS "Users can claim unclaimed moments" ON public.moments;

CREATE OR REPLACE FUNCTION public.get_imported_listing_claim_target(p_entity_type text,p_entity_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_name text; v_path text; v_claimable boolean := false;
BEGIN
  IF p_entity_type='moment' THEN
    SELECT m.title, '/moments/' || coalesce(m.slug,m.id::text),
      m.content_origin::text='imported' AND m.inventory_candidate_id IS NOT NULL
      AND m.is_active AND m.status::text NOT IN ('cancelled','archived','closed')
      AND m.visibility::text='open' AND m.ownership_status='unclaimed' AND m.claim_status='unclaimed'
      AND m.host_id IS NULL AND m.organizer_id IS NULL AND m.claimed_by IS NULL
      AND m.organization_id IS NULL AND m.creative_owner_id IS NULL
    INTO v_name,v_path,v_claimable
    FROM public.moments m
    JOIN public.inventory_candidates ic ON ic.id=m.inventory_candidate_id
    JOIN public.venues cv ON cv.id=m.venue_id
    WHERE m.id=p_entity_id AND m.is_active AND ic.review_status='published' AND ic.lifecycle_status='current'
      AND m.content_origin::text='imported' AND m.visibility::text='open'
      AND m.status::text NOT IN ('draft','submitted','cancelled','archived','closed');
  ELSIF p_entity_type='venue' THEN
    SELECT p.venue_name, '/venues/' || coalesce(p.venue_slug,p.id::text),
      NOT p.is_claimed AND p.claimed_by IS NULL AND p.verification_status='unverified'
      AND nullif(trim(p.address),'') IS NOT NULL AND nullif(trim(p.source_url),'') IS NOT NULL
      AND (v.id IS NULL OR (
        v.owner_id IS NULL AND v.claimed_by IS NULL AND v.organization_id IS NULL
        AND v.claim_status='unclaimed' AND v.status='active' AND coalesce(v.is_active,true)
        AND app_private.listing_key(v.venue_name)=app_private.listing_key(p.venue_name)
        AND app_private.address_key(v.address)=app_private.address_key(p.address)
        AND app_private.listing_key(v.city)=app_private.listing_key(p.city)
        AND app_private.country_key(v.country)=app_private.country_key(p.country)
        AND (app_private.country_key(p.country)<>'US' OR
          app_private.region_key(v.state,'US')=app_private.region_key(p.state,'US'))))
      AND (vp.id IS NULL OR (
        app_private.listing_key(vp.name)=app_private.listing_key(p.venue_name)
        AND app_private.address_key(vp.address)=app_private.address_key(p.address)
        AND app_private.listing_key(vp.city)=app_private.listing_key(p.city)
        AND app_private.country_key(vp.country)=app_private.country_key(p.country)))
    INTO v_name,v_path,v_claimable
    FROM public.pre_populated_venues p
    LEFT JOIN public.venues v ON v.id=p.id
    LEFT JOIN public.venue_profiles vp ON vp.id=p.id
    WHERE p.id=p_entity_id;
  ELSE
    RAISE EXCEPTION 'Unsupported listing type' USING ERRCODE='22023';
  END IF;
  -- A separately prepared owner invitation takes precedence over open requests.
  IF EXISTS (SELECT 1 FROM public.page_ownership_claims pc
      WHERE pc.entity_type=p_entity_type AND pc.entity_id=p_entity_id
      AND pc.status IN ('available','requested','approved','claimed'))
    OR EXISTS (SELECT 1 FROM public.imported_listing_claims ic
      WHERE ic.entity_type=p_entity_type AND ic.entity_id=p_entity_id AND ic.status='approved') THEN
    v_claimable := false;
  END IF;
  RETURN jsonb_build_object('entity_type',p_entity_type,'entity_id',p_entity_id,
    'display_name',v_name,'public_path',v_path,'claimable',coalesce(v_claimable,false));
END $$;
REVOKE ALL ON FUNCTION public.get_imported_listing_claim_target(text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_imported_listing_claim_target(text,uuid) TO anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.request_imported_listing_claim(
  p_entity_type text,p_entity_id uuid,p_note text,p_evidence_url text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_user uuid := auth.uid(); v_target jsonb; v_id uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in to request ownership' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id=v_user) THEN
    RAISE EXCEPTION 'Complete your Promorang profile before requesting ownership' USING ERRCODE='22023';
  END IF;
  IF p_entity_type NOT IN ('moment','venue') OR p_entity_id IS NULL THEN
    RAISE EXCEPTION 'Invalid listing' USING ERRCODE='22023';
  END IF;
  IF length(trim(coalesce(p_note,''))) NOT BETWEEN 20 AND 4000 THEN
    RAISE EXCEPTION 'Explain your relationship to this listing in 20 to 4000 characters' USING ERRCODE='22023';
  END IF;
  IF length(coalesce(p_evidence_url,''))>2048 OR coalesce(p_evidence_url,'') !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'Provide a public HTTPS page supporting your ownership' USING ERRCODE='22023';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('imported-claim:'||p_entity_type||':'||p_entity_id::text,0));
  v_target := public.get_imported_listing_claim_target(p_entity_type,p_entity_id);
  IF NOT (v_target->>'claimable')::boolean THEN
    RAISE EXCEPTION 'This listing is not available for an open ownership request' USING ERRCODE='22023';
  END IF;
  SELECT id INTO v_id FROM public.imported_listing_claims
    WHERE entity_type=p_entity_type AND entity_id=p_entity_id AND claimant_id=v_user AND status='requested';
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  INSERT INTO public.imported_listing_claims(entity_type,entity_id,display_name,claimant_id,claimant_note,evidence_url)
    VALUES (p_entity_type,p_entity_id,v_target->>'display_name',v_user,trim(p_note),trim(p_evidence_url))
    RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.request_imported_listing_claim(text,uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.request_imported_listing_claim(text,uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_my_imported_listing_claims()
RETURNS TABLE (id uuid,entity_type text,entity_id uuid,display_name text,status text,
  claimant_note text,evidence_url text,created_at timestamptz,review_note text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT c.id,c.entity_type,c.entity_id,c.display_name,c.status,c.claimant_note,c.evidence_url,c.created_at,c.review_note
  FROM public.imported_listing_claims c WHERE c.claimant_id=auth.uid() ORDER BY c.created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.list_my_imported_listing_claims() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.list_my_imported_listing_claims() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_imported_listing_claims()
RETURNS TABLE (id uuid,entity_type text,entity_id uuid,display_name text,status text,
  claimant_note text,evidence_url text,created_at timestamptz,review_note text,claimant_id uuid)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.is_claimable_page_admin(auth.uid()) THEN RAISE EXCEPTION 'Admin access required' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT c.id,c.entity_type,c.entity_id,c.display_name,c.status,c.claimant_note,c.evidence_url,c.created_at,c.review_note,c.claimant_id
    FROM public.imported_listing_claims c ORDER BY (c.status='requested') DESC,c.created_at;
END $$;
REVOKE ALL ON FUNCTION public.admin_list_imported_listing_claims() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_list_imported_listing_claims() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_review_imported_listing_claim(
  p_claim_id uuid,p_decision text,p_review_note text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_admin uuid := auth.uid(); v_claim public.imported_listing_claims%ROWTYPE;
  v_pre public.pre_populated_venues%ROWTYPE; v_venue public.venues%ROWTYPE;
  v_target jsonb; v_slug text;
BEGIN
  IF NOT public.is_claimable_page_admin(v_admin) THEN RAISE EXCEPTION 'Admin access required' USING ERRCODE='42501'; END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected') OR length(trim(coalesce(p_review_note,''))) NOT BETWEEN 10 AND 4000 THEN
    RAISE EXCEPTION 'Use approved or rejected and record a review note of 10 to 4000 characters' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_claim FROM public.imported_listing_claims WHERE id=p_claim_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Claim not found' USING ERRCODE='22023'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('imported-claim:'||v_claim.entity_type||':'||v_claim.entity_id::text,0));
  SELECT * INTO v_claim FROM public.imported_listing_claims WHERE id=p_claim_id FOR UPDATE;
  IF v_claim.status <> 'requested' THEN RAISE EXCEPTION 'This claim has already been reviewed' USING ERRCODE='22023'; END IF;
  IF p_decision='approved' THEN
    IF v_claim.claimant_id=v_admin THEN RAISE EXCEPTION 'A different administrator must review your ownership request' USING ERRCODE='42501'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id=v_claim.claimant_id) THEN
      RAISE EXCEPTION 'Claimant has no matching Promorang user profile' USING ERRCODE='22023';
    END IF;
    IF v_claim.entity_type='moment' THEN
      PERFORM 1 FROM public.moments WHERE id=v_claim.entity_id FOR UPDATE;
    ELSE
      SELECT * INTO v_pre FROM public.pre_populated_venues WHERE id=v_claim.entity_id FOR UPDATE;
      SELECT * INTO v_venue FROM public.venues WHERE id=v_claim.entity_id FOR UPDATE;
    END IF;
    v_target := public.get_imported_listing_claim_target(v_claim.entity_type,v_claim.entity_id);
    IF NOT (v_target->>'claimable')::boolean THEN
      RAISE EXCEPTION 'Listing ownership or availability changed; review without transferring ownership' USING ERRCODE='22023';
    END IF;
    IF v_claim.entity_type='moment' THEN
      UPDATE public.moments SET host_id=v_claim.claimant_id,organizer_id=v_claim.claimant_id,
        claimed_by=v_claim.claimant_id,claimed_at=now(),claim_status='claimed',ownership_status='owned',updated_at=now()
        WHERE id=v_claim.entity_id;
    ELSE
      -- Legacy pre-populated venues may not yet have a canonical venues row.
      -- The approved request creates that row at the same UUID, never a second
      -- identity and never an overwrite of an existing owned canonical row.
      v_slug := coalesce(v_pre.venue_slug,public.slugify(v_pre.venue_name)||'-'||replace(v_pre.id::text,'-',''));
      IF v_venue.id IS NULL THEN
        INSERT INTO public.venues(id,venue_name,name,venue_slug,slug,address,location,city,state,zip_code,country,
          latitude,longitude,phone,email,website_url,website,logo_url,source,source_url,
          owner_id,claimed_by,claimed_at,claim_status,status,is_active)
        VALUES (v_pre.id,v_pre.venue_name,v_pre.venue_name,v_slug,v_slug,v_pre.address,v_pre.address,v_pre.city,v_pre.state,
          v_pre.zip_code,v_pre.country,v_pre.latitude,v_pre.longitude,v_pre.phone,v_pre.email,v_pre.website,v_pre.website,
          v_pre.logo_url,'scraped',v_pre.source_url,v_claim.claimant_id,v_claim.claimant_id,now(),'claimed','active',true);
      ELSE
        UPDATE public.venues SET owner_id=v_claim.claimant_id,claimed_by=v_claim.claimant_id,claimed_at=now(),
          claim_status='claimed',updated_at=now() WHERE id=v_pre.id;
      END IF;
      INSERT INTO public.venue_profiles(id,name,slug,address,location,city,country,latitude,longitude,
        venue_type,images,contact,verification_status,is_active)
      VALUES (v_pre.id,v_pre.venue_name,v_slug,v_pre.address,v_pre.address,v_pre.city,v_pre.country,v_pre.latitude,v_pre.longitude,
        'other',coalesce(v_pre.photos,'[]'::jsonb),jsonb_strip_nulls(jsonb_build_object('website',v_pre.website,'phone',v_pre.phone)),
        'unverified',true)
      ON CONFLICT (id) DO NOTHING;
      UPDATE public.pre_populated_venues SET is_claimed=true,claimed_by=v_claim.claimant_id,claimed_at=now(),updated_at=now()
        WHERE id=v_pre.id;
    END IF;
  END IF;
  UPDATE public.imported_listing_claims SET status=CASE WHEN p_decision='approved' THEN 'approved' ELSE 'rejected' END,
    reviewed_by=v_admin,reviewed_at=now(),review_note=trim(p_review_note) WHERE id=p_claim_id;
  IF p_decision='approved' THEN
    UPDATE public.imported_listing_claims SET status='rejected',reviewed_by=v_admin,reviewed_at=now(),
      review_note='Another ownership request was approved after review.'
      WHERE entity_type=v_claim.entity_type AND entity_id=v_claim.entity_id AND id<>p_claim_id AND status='requested';
  END IF;
  RETURN jsonb_build_object('id',p_claim_id,'status',CASE WHEN p_decision='approved' THEN 'approved' ELSE 'rejected' END,
    'entity_type',v_claim.entity_type,'entity_id',v_claim.entity_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_review_imported_listing_claim(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_review_imported_listing_claim(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_claimed_venue_profile(p_venue_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT jsonb_build_object('id',v.id,'name',v.venue_name,'description',v.description,
    'website',coalesce(v.website_url,v.website),'phone',v.phone)
  FROM public.venues v WHERE v.id=p_venue_id AND v.owner_id=auth.uid()
    AND EXISTS (SELECT 1 FROM public.imported_listing_claims c WHERE c.entity_type='venue'
      AND c.entity_id=v.id AND c.status='approved' AND c.claimant_id=auth.uid());
$$;
REVOKE ALL ON FUNCTION public.get_my_claimed_venue_profile(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_my_claimed_venue_profile(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_claimed_venue_profile(
  p_venue_id uuid,p_name text,p_description text,p_website text,p_phone text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in to edit your venue' USING ERRCODE='42501'; END IF;
  PERFORM 1 FROM public.venues v WHERE v.id=p_venue_id AND v.owner_id=v_user
    AND EXISTS (SELECT 1 FROM public.imported_listing_claims c WHERE c.entity_type='venue'
      AND c.entity_id=v.id AND c.status='approved' AND c.claimant_id=v_user) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Only the approved venue owner may edit this profile' USING ERRCODE='42501'; END IF;
  IF length(trim(coalesce(p_name,''))) NOT BETWEEN 2 AND 200
    OR length(coalesce(p_description,''))>4000 OR length(coalesce(p_phone,''))>100
    OR length(coalesce(p_website,''))>2048
    OR (nullif(trim(p_website),'') IS NOT NULL AND p_website !~ '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$') THEN
    RAISE EXCEPTION 'Check the venue name, description, phone, and HTTP or HTTPS website' USING ERRCODE='22023';
  END IF;
  UPDATE public.venues SET venue_name=trim(p_name),name=trim(p_name),description=nullif(trim(p_description),''),
    website_url=nullif(trim(p_website),''),website=nullif(trim(p_website),''),phone=nullif(trim(p_phone),''),updated_at=now()
    WHERE id=p_venue_id;
  UPDATE public.venue_profiles SET name=trim(p_name),description=nullif(trim(p_description),''),
    contact=coalesce(contact,'{}'::jsonb)||jsonb_build_object('website',nullif(trim(p_website),''),'phone',nullif(trim(p_phone),'')),
    updated_at=now() WHERE id=p_venue_id;
  UPDATE public.pre_populated_venues SET venue_name=trim(p_name),website=nullif(trim(p_website),''),
    phone=nullif(trim(p_phone),''),updated_at=now() WHERE id=p_venue_id;
  RETURN public.get_my_claimed_venue_profile(p_venue_id);
END $$;
REVOKE ALL ON FUNCTION public.update_claimed_venue_profile(uuid,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.update_claimed_venue_profile(uuid,text,text,text,text) TO authenticated;

-- Old publisher allows stale/owned-row resets and is no longer a public API.
REVOKE ALL ON FUNCTION public.publish_approved_event_candidate(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.publish_approved_event_candidate(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.publish_discovered_event_candidate(p_candidate_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  c public.inventory_candidates%ROWTYPE; s public.inventory_sources%ROWTYPE;
  p public.event_publication_policies%ROWTYPE; d jsonb;
  v_start timestamptz; v_end timestamptz; v_venue_id uuid; v_moment_id uuid;
  v_existing public.moments%ROWTYPE; v_venue public.venues%ROWTYPE;
  v_pre public.pre_populated_venues%ROWTYPE; v_profile public.venue_profiles%ROWTYPE;
  v_matches uuid[]; v_event_key text; v_venue_key text; v_slug text; v_event_evidence boolean; v_venue_evidence boolean;
BEGIN
  SELECT * INTO c FROM public.inventory_candidates WHERE id=p_candidate_id FOR UPDATE;
  IF NOT FOUND OR c.entity_type<>'moment' THEN RAISE EXCEPTION 'Event candidate not found' USING ERRCODE='22023'; END IF;
  IF c.review_status NOT IN ('approved','published') OR c.lifecycle_status<>'current' OR c.duplicate_of IS NOT NULL THEN
    RAISE EXCEPTION 'Candidate must be approved, current, and free of unresolved duplicates' USING ERRCODE='22023';
  END IF;
  SELECT * INTO s FROM public.inventory_sources WHERE id=c.source_id AND enabled;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event source is disabled' USING ERRCODE='22023'; END IF;
  d := c.normalized_data;
  SELECT * INTO p FROM public.event_publication_policies
    WHERE source_id=c.source_id AND market_key=d->>'market_key' AND enabled;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event publication is not enabled for this source and market' USING ERRCODE='22023'; END IF;
  IF c.confidence<p.minimum_confidence OR c.source_last_checked_at<now()-make_interval(hours=>p.max_evidence_age_hours)
      OR c.source_last_checked_at>now()+interval '5 minutes' THEN
    RAISE EXCEPTION 'Event needs recent high-confidence verification' USING ERRCODE='22023';
  END IF;
  IF EXISTS (SELECT 1 FROM unnest(ARRAY['title','city','country','country_code','timezone','venue_name','venue_address','venue_source_url']) k
      WHERE nullif(trim(d->>k),'') IS NULL)
    OR (d->>'event_status') IS DISTINCT FROM 'scheduled'
    OR (d->>'schedule_precision') IS DISTINCT FROM 'exact'
    OR coalesce(d->>'recurrence_enabled','false')<>'false'
    OR coalesce(c.source_url,'') !~ '^https://[^[:space:]]+$'
    OR coalesce(d->>'venue_source_url','') !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'Exact source-confirmed event and physical venue details are required' USING ERRCODE='22023';
  END IF;
  IF upper(d->>'country_code')<>p.country_code
    OR app_private.country_key(d->>'country')<>app_private.country_key(p.country_name)
    OR c.country_code IS DISTINCT FROM p.country_code
    OR (p.state IS NOT NULL AND app_private.region_key(d->>'state',p.country_code)<>app_private.region_key(p.state,p.country_code))
    OR (p.country_code IN ('US','GB') AND nullif(trim(d->>'state'),'') IS NULL)
    OR NOT ((d->>'timezone')=ANY(p.allowed_timezones))
    OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_timezone_names WHERE name=d->>'timezone') THEN
    RAISE EXCEPTION 'Event geography and timezone do not match its authorized market' USING ERRCODE='22023';
  END IF;
  IF coalesce(d->>'starts_at','') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$'
    OR (nullif(d->>'ends_at','') IS NOT NULL AND d->>'ends_at' !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$') THEN
    RAISE EXCEPTION 'Use source-confirmed timestamps with explicit UTC offsets' USING ERRCODE='22023';
  END IF;
  v_start := (d->>'starts_at')::timestamptz;
  v_end := nullif(d->>'ends_at','')::timestamptz;
  IF (v_end IS NOT NULL AND v_end<=v_start) OR coalesce(v_end,v_start+interval '24 hours')<=now() THEN
    RAISE EXCEPTION 'Event is past or its end precedes its start' USING ERRCODE='22023';
  END IF;
  -- Check wall-clock/offset agreement against the IANA zone, including DST.
  IF (v_start AT TIME ZONE (d->>'timezone')) IS DISTINCT FROM (d->>'starts_at')::timestamp
    OR (v_end IS NOT NULL AND (v_end AT TIME ZONE (d->>'timezone')) IS DISTINCT FROM (d->>'ends_at')::timestamp) THEN
    RAISE EXCEPTION 'Timestamp offset conflicts with the event timezone' USING ERRCODE='22023';
  END IF;
  SELECT EXISTS (SELECT 1 FROM public.event_candidate_evidence e
    WHERE e.inventory_candidate_id=c.id AND e.is_authoritative
      AND e.evidence_type IN ('official_calendar','organizer_page','venue_page','ticket_page')
      AND e.checked_at BETWEEN now()-make_interval(hours=>p.max_evidence_age_hours) AND now()+interval '5 minutes'
      AND e.source_url=c.source_url
      AND app_private.listing_key(e.observed_facts->>'title')=app_private.listing_key(d->>'title')
      AND e.observed_facts->>'starts_at'=d->>'starts_at'
      AND nullif(e.observed_facts->>'ends_at','') IS NOT DISTINCT FROM nullif(d->>'ends_at','')
      AND e.observed_facts->>'timezone'=d->>'timezone'
      AND e.observed_facts->>'event_status'='scheduled'
      AND app_private.listing_key(e.observed_facts->>'city')=app_private.listing_key(d->>'city')
      AND app_private.listing_key(e.observed_facts->>'state')=app_private.listing_key(d->>'state')
      AND upper(e.observed_facts->>'country_code')=p.country_code)
    INTO v_event_evidence;
  SELECT EXISTS (SELECT 1 FROM public.event_candidate_evidence e
    WHERE e.inventory_candidate_id=c.id AND e.is_authoritative
      AND e.evidence_type IN ('official_calendar','organizer_page','venue_page','ticket_page')
      AND e.checked_at BETWEEN now()-make_interval(hours=>p.max_evidence_age_hours) AND now()+interval '5 minutes'
      AND e.source_url=d->>'venue_source_url'
      AND app_private.listing_key(e.observed_facts->>'venue_name')=app_private.listing_key(d->>'venue_name')
      AND app_private.address_key(e.observed_facts->>'venue_address')=app_private.address_key(d->>'venue_address')
      AND app_private.listing_key(e.observed_facts->>'city')=app_private.listing_key(d->>'city')
      AND app_private.listing_key(e.observed_facts->>'state')=app_private.listing_key(d->>'state')
      AND upper(e.observed_facts->>'country_code')=p.country_code)
    INTO v_venue_evidence;
  IF NOT v_event_evidence OR NOT v_venue_evidence THEN
    RAISE EXCEPTION 'Authoritative evidence must confirm both the event schedule and the actual venue address' USING ERRCODE='22023';
  END IF;

  -- Serialize equivalent events from separate candidate/source IDs. A stable
  -- candidate ID remains the primary match when its date legitimately changes.
  v_event_key := concat_ws('|',app_private.listing_key(d->>'title'),p.country_code,
    app_private.region_key(d->>'state',p.country_code),app_private.listing_key(d->>'city'),extract(epoch FROM v_start)::text,
    app_private.listing_key(d->>'venue_name'),app_private.address_key(d->>'venue_address'));
  PERFORM pg_advisory_xact_lock(hashtextextended('discovered-event:'||v_event_key,0));
  SELECT array_agg(m.id) INTO v_matches FROM public.moments m
    LEFT JOIN public.venues mv ON mv.id=m.venue_id
    LEFT JOIN public.inventory_candidates mic ON mic.id=m.inventory_candidate_id
    WHERE m.inventory_candidate_id=c.id OR m.id::text=c.published_record_id
      OR (m.starts_at=v_start AND app_private.country_key(m.country)=p.country_code
        AND app_private.listing_key(m.city)=app_private.listing_key(d->>'city')
        AND app_private.region_key(coalesce(mic.normalized_data->>'state',mv.state),p.country_code)=app_private.region_key(d->>'state',p.country_code)
        AND app_private.listing_key(m.venue_name)=app_private.listing_key(d->>'venue_name')
        AND app_private.address_key(m.location)=app_private.address_key(d->>'venue_address')
        AND (app_private.listing_key(m.title)=app_private.listing_key(d->>'title')
          OR m.external_source_url=c.source_url));
  IF coalesce(cardinality(v_matches),0)>1 THEN
    RAISE EXCEPTION 'Multiple event matches require review' USING ERRCODE='22023';
  END IF;
  IF cardinality(v_matches)=1 THEN
    SELECT * INTO v_existing FROM public.moments WHERE id=v_matches[1] FOR UPDATE;
    IF NOT v_existing.is_active OR v_existing.status::text IN ('cancelled','archived','closed')
      OR v_existing.closed_at IS NOT NULL OR v_existing.content_origin::text<>'imported'
      OR v_existing.ownership_status<>'unclaimed' OR v_existing.claim_status<>'unclaimed'
      OR v_existing.host_id IS NOT NULL OR v_existing.organizer_id IS NOT NULL OR v_existing.claimed_by IS NOT NULL
      OR v_existing.organization_id IS NOT NULL OR v_existing.creative_owner_id IS NOT NULL
      OR EXISTS (SELECT 1 FROM public.page_ownership_claims pc WHERE pc.entity_type='moment'
        AND pc.entity_id=v_existing.id AND pc.status IN ('available','requested','approved','claimed')) THEN
      RAISE EXCEPTION 'Existing event is owned, reserved, inactive, or retired; automatic updates are blocked' USING ERRCODE='22023';
    END IF;
    IF v_existing.inventory_candidate_id IS DISTINCT FROM c.id THEN
      -- Confirmed duplicate: record the link without replacing the primary source.
      UPDATE public.inventory_candidates SET published_record_id=v_existing.id::text,review_status='published',
        expires_at=coalesce(v_end,v_start+interval '24 hours'),updated_at=now() WHERE id=c.id;
      RETURN v_existing.id;
    END IF;
  END IF;

  v_venue_key := concat_ws('|',app_private.listing_key(d->>'venue_name'),p.country_code,
    app_private.region_key(d->>'state',p.country_code),app_private.listing_key(d->>'city'),app_private.address_key(d->>'venue_address'));
  PERFORM pg_advisory_xact_lock(hashtextextended('discovered-venue:'||v_venue_key,0));
  IF nullif(d->>'venue_id','') IS NOT NULL THEN
    v_venue_id := (d->>'venue_id')::uuid;
    IF NOT EXISTS (SELECT 1 FROM public.venues WHERE id=v_venue_id)
      AND NOT EXISTS (SELECT 1 FROM public.pre_populated_venues WHERE id=v_venue_id)
      AND NOT EXISTS (SELECT 1 FROM public.venue_profiles WHERE id=v_venue_id) THEN
      RAISE EXCEPTION 'Explicit venue ID does not identify an existing venue' USING ERRCODE='22023';
    END IF;
  ELSE
    SELECT array_agg(DISTINCT q.id) INTO v_matches FROM (
      SELECT id,venue_name AS name,address,city,country,state FROM public.venues
      UNION ALL SELECT id,venue_name,address,city,country,state FROM public.pre_populated_venues
      UNION ALL SELECT vp.id,vp.name,vp.address,vp.city,vp.country,cv.state FROM public.venue_profiles vp LEFT JOIN public.venues cv ON cv.id=vp.id
    ) q WHERE app_private.listing_key(q.name)=app_private.listing_key(d->>'venue_name')
      AND app_private.address_key(q.address)=app_private.address_key(d->>'venue_address')
      AND app_private.listing_key(q.city)=app_private.listing_key(d->>'city')
      AND app_private.country_key(q.country)=p.country_code
      AND (q.state IS NULL OR app_private.region_key(q.state,p.country_code)=app_private.region_key(d->>'state',p.country_code));
    IF coalesce(cardinality(v_matches),0)>1 THEN RAISE EXCEPTION 'Ambiguous venue identity requires review' USING ERRCODE='22023'; END IF;
    v_venue_id := coalesce(v_matches[1],gen_random_uuid());
  END IF;
  -- An ID matched in one representation must agree in every representation.
  IF EXISTS (SELECT 1 FROM (
      SELECT id,venue_name AS name,address,city,country,state FROM public.venues
      UNION ALL SELECT id,venue_name,address,city,country,state FROM public.pre_populated_venues
      UNION ALL SELECT vp.id,vp.name,vp.address,vp.city,vp.country,cv.state FROM public.venue_profiles vp LEFT JOIN public.venues cv ON cv.id=vp.id
    ) q WHERE q.id=v_venue_id AND (
      app_private.listing_key(q.name)<>app_private.listing_key(d->>'venue_name')
      OR app_private.address_key(q.address)<>app_private.address_key(d->>'venue_address')
      OR app_private.listing_key(q.city)<>app_private.listing_key(d->>'city')
      OR app_private.country_key(q.country)<>p.country_code
      OR (q.state IS NOT NULL AND app_private.region_key(q.state,p.country_code)<>app_private.region_key(d->>'state',p.country_code)))) THEN
    RAISE EXCEPTION 'Venue ID conflicts with the verified venue identity or address' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_venue FROM public.venues WHERE id=v_venue_id FOR UPDATE;
  SELECT * INTO v_pre FROM public.pre_populated_venues WHERE id=v_venue_id FOR UPDATE;
  SELECT * INTO v_profile FROM public.venue_profiles WHERE id=v_venue_id FOR UPDATE;
  IF v_venue.id IS NOT NULL AND p.country_code='US' AND nullif(trim(v_venue.state),'') IS NULL THEN
    RAISE EXCEPTION 'Existing US venue lacks a verified state; resolve its identity first' USING ERRCODE='22023';
  END IF;
  IF (v_venue.id IS NOT NULL AND (v_venue.status<>'active' OR NOT coalesce(v_venue.is_active,true)))
    OR (v_profile.id IS NOT NULL AND NOT coalesce(v_profile.is_active,true)) THEN
    RAISE EXCEPTION 'Venue is inactive; automatic publication cannot reactivate it' USING ERRCODE='22023';
  END IF;
  IF v_venue.id IS NOT NULL AND v_venue.claim_status<>'unclaimed' AND v_venue.owner_id IS NULL
      AND v_venue.claimed_by IS NULL AND v_venue.organization_id IS NULL THEN
    RAISE EXCEPTION 'Legacy venue claim state is ambiguous; reconcile its identity before publishing' USING ERRCODE='22023';
  END IF;
  IF v_pre.id IS NOT NULL AND NOT v_pre.is_claimed AND v_venue.id IS NOT NULL
      AND (v_venue.owner_id IS NOT NULL OR v_venue.claimed_by IS NOT NULL OR v_venue.organization_id IS NOT NULL
        OR v_venue.claim_status<>'unclaimed') THEN
    RAISE EXCEPTION 'Conflicting venue claim representations require review' USING ERRCODE='22023';
  END IF;
  v_slug := coalesce(v_pre.venue_slug,v_profile.slug,v_venue.venue_slug,
    public.slugify(d->>'venue_name')||'-'||replace(v_venue_id::text,'-',''));
  IF v_venue.id IS NULL THEN
    IF (v_pre.id IS NOT NULL AND (v_pre.is_claimed OR v_pre.claimed_by IS NOT NULL)) OR v_profile.id IS NOT NULL THEN
      RAISE EXCEPTION 'Existing venue ownership must be reconciled before creating its canonical row' USING ERRCODE='22023';
    END IF;
    INSERT INTO public.venues(id,venue_name,name,venue_slug,slug,address,location,city,state,country,
      source,source_url,claim_status,status,is_active)
    VALUES (v_venue_id,d->>'venue_name',d->>'venue_name',v_slug,v_slug,d->>'venue_address',d->>'venue_address',
      d->>'city',nullif(d->>'state',''),p.country_name,'scraped',d->>'venue_source_url','unclaimed','active',true)
    RETURNING * INTO v_venue;
  END IF;
  IF v_venue.owner_id IS NULL AND v_venue.claimed_by IS NULL AND v_venue.organization_id IS NULL AND v_venue.claim_status='unclaimed' THEN
    IF v_profile.id IS NOT NULL OR (v_pre.id IS NOT NULL AND (v_pre.is_claimed OR v_pre.claimed_by IS NOT NULL)) THEN
      RAISE EXCEPTION 'Conflicting venue claim representations require review' USING ERRCODE='22023';
    END IF;
    INSERT INTO public.pre_populated_venues(id,venue_name,venue_slug,address,city,state,country,
      data_source,source_url,attribution_text,is_claimed,verification_status,enrichment_status)
    VALUES (v_venue_id,d->>'venue_name',v_slug,d->>'venue_address',d->>'city',nullif(d->>'state',''),p.country_name,
      s.source_key,d->>'venue_source_url',coalesce(s.attribution_text,s.name),false,'unverified','completed')
    ON CONFLICT (id) DO NOTHING;
  ELSIF v_profile.id IS NULL THEN
    -- Existing ownership is preserved; the matching canonical venue becomes
    -- visible in the public directory without an unclaimed shadow listing.
    INSERT INTO public.venue_profiles(id,name,slug,description,address,location,city,country,venue_type,
      verification_status,is_active)
    VALUES (v_venue.id,v_venue.venue_name,v_slug,v_venue.description,v_venue.address,v_venue.location,v_venue.city,
      v_venue.country,'other',CASE WHEN v_venue.is_verified THEN 'verified' ELSE 'unverified' END,true);
  END IF;
  IF v_existing.id IS NULL THEN
    INSERT INTO public.moments(title,slug,description,category,location,venue_id,venue_name,city,country,country_code,
      starts_at,ends_at,recurrence_timezone,recurrence_enabled,is_active,status,visibility,content_origin,
      inventory_candidate_id,external_source_url,external_attribution,external_last_checked_at,
      source,source_url,ownership_status,claim_status,source_confidence,schedule_precision,seo_title,seo_description)
    VALUES (d->>'title',public.slugify(d->>'title')||'-'||replace(c.id::text,'-',''),d->>'description',
      coalesce(nullif(d->>'category',''),'general'),d->>'venue_address',v_venue_id,d->>'venue_name',d->>'city',p.country_name,p.country_code,
      v_start,v_end,d->>'timezone',false,true,'scheduled','open','imported',c.id,c.source_url,
      coalesce(s.attribution_text,s.name),c.source_last_checked_at,'scraped',c.source_url,'unclaimed','unclaimed',c.confidence,'exact',
      d->>'title',left(coalesce(d->>'description',''),155)) RETURNING id INTO v_moment_id;
  ELSE
    -- No ownership, activation, visibility, status, rewards, ticketing or payment
    -- fields are reset during a factual source refresh.
    UPDATE public.moments SET title=d->>'title',description=d->>'description',
      category=coalesce(nullif(d->>'category',''),'general'),location=d->>'venue_address',venue_id=v_venue_id,
      venue_name=d->>'venue_name',city=d->>'city',country=p.country_name,country_code=p.country_code,
      starts_at=v_start,ends_at=v_end,recurrence_timezone=d->>'timezone',
      external_source_url=c.source_url,external_attribution=coalesce(s.attribution_text,s.name),
      external_last_checked_at=c.source_last_checked_at,source_url=c.source_url,source_confidence=c.confidence,
      seo_title=d->>'title',seo_description=left(coalesce(d->>'description',''),155),updated_at=now()
    WHERE id=v_existing.id RETURNING id INTO v_moment_id;
  END IF;
  UPDATE public.inventory_candidates SET review_status='published',published_record_id=v_moment_id::text,
    expires_at=coalesce(v_end,v_start+interval '24 hours'),updated_at=now() WHERE id=c.id;
  RETURN v_moment_id;
END $$;
REVOKE ALL ON FUNCTION public.publish_discovered_event_candidate(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.publish_discovered_event_candidate(uuid) TO service_role;

-- Retire only source-controlled listings. The previous implementation used a
-- nonexistent 'completed' status and could overwrite an owner's/cancelled row.
CREATE OR REPLACE FUNCTION public.expire_stale_imported_moments()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.inventory_candidates c SET lifecycle_status='expired',updated_at=now()
  WHERE c.entity_type='moment' AND c.lifecycle_status='current' AND c.expires_at<=now()
    AND NOT EXISTS (SELECT 1 FROM public.moments m
      WHERE (m.inventory_candidate_id=c.id OR m.id::text=c.published_record_id)
        AND (m.ownership_status<>'unclaimed' OR m.claim_status<>'unclaimed' OR m.host_id IS NOT NULL
          OR m.organizer_id IS NOT NULL OR m.claimed_by IS NOT NULL OR m.organization_id IS NOT NULL OR m.creative_owner_id IS NOT NULL))
    AND NOT EXISTS (SELECT 1 FROM public.page_ownership_claims pc
      JOIN public.moments m ON m.id=pc.entity_id AND pc.entity_type='moment'
      WHERE (m.inventory_candidate_id=c.id OR m.id::text=c.published_record_id)
        AND pc.status IN ('available','requested','approved','claimed'));
  GET DIAGNOSTICS affected=ROW_COUNT;
  UPDATE public.moments m SET is_active=false,status='archived',updated_at=now()
  WHERE m.content_origin::text='imported' AND m.is_active AND m.status::text IN ('scheduled','active','joinable')
    AND coalesce(m.ends_at,m.starts_at+interval '24 hours')<=now()
    AND m.ownership_status='unclaimed' AND m.claim_status='unclaimed' AND m.host_id IS NULL AND m.organizer_id IS NULL
    AND m.claimed_by IS NULL AND m.organization_id IS NULL AND m.creative_owner_id IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.page_ownership_claims pc WHERE pc.entity_type='moment'
      AND pc.entity_id=m.id AND pc.status IN ('available','requested','approved','claimed'));
  RETURN affected;
END $$;
REVOKE ALL ON FUNCTION public.expire_stale_imported_moments() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_imported_moments() TO service_role;

-- Retain the existing column order; append geographic and claim metadata.
-- Venue profiles and imported directory records share the canonical venue UUID.
CREATE OR REPLACE VIEW public.view_public_venue_directory AS
SELECT vp.id,vp.slug,vp.name,vp.description,vp.location,vp.city,public.slugify(vp.city) AS city_slug,
  vp.country,public.slugify(vp.country) AS country_slug,vp.address,vp.venue_type,vp.images,
  vp.total_moments_hosted,vp.total_checkins,vp.avg_rating,vp.popularity_score,vp.verification_status,
  (SELECT count(*)::integer FROM public.moments m WHERE m.venue_id=vp.id AND m.is_active AND m.visibility::text='open'
    AND m.status::text NOT IN ('draft','submitted','cancelled','archived','closed')) AS active_moments_count,
  'claimed'::text AS listing_status,NULL::text AS source_url,NULL::text AS attribution_text,
  cv.state AS parish,public.slugify(cv.state) AS parish_slug,
  coalesce(cv.state,market.data->>'state') AS state,market.data->>'market_key' AS market_key,market.data->>'timezone' AS timezone
FROM public.venue_profiles vp
LEFT JOIN public.venues cv ON cv.id=vp.id
LEFT JOIN LATERAL (
  SELECT ic.normalized_data AS data FROM public.moments em
  JOIN public.inventory_candidates ic ON ic.id=em.inventory_candidate_id
  WHERE em.venue_id=vp.id AND em.content_origin::text='imported' ORDER BY ic.source_last_checked_at DESC LIMIT 1
) market ON true
WHERE coalesce(vp.is_active,true)
  AND NOT EXISTS (SELECT 1 FROM public.pre_populated_venues ip WHERE ip.id=vp.id AND NOT ip.is_claimed)
UNION ALL
SELECT ip.id,ip.venue_slug AS slug,ip.venue_name AS name,NULL::text AS description,ip.address AS location,
  ip.city,public.slugify(ip.city) AS city_slug,ip.country,public.slugify(ip.country) AS country_slug,ip.address,
  CASE coalesce(ip.categories[1],'other') WHEN 'restaurant' THEN 'restaurant' WHEN 'cafe' THEN 'cafe'
    WHEN 'nightlife' THEN 'bar' WHEN 'shopping' THEN 'retail' WHEN 'arts_culture' THEN 'gallery' ELSE 'other' END AS venue_type,
  ip.photos AS images,0 AS total_moments_hosted,0 AS total_checkins,0::numeric(3,2) AS avg_rating,
  round(coalesce(candidate.confidence,0)*100,2)::numeric(5,2) AS popularity_score,ip.verification_status,
  (SELECT count(*)::integer FROM public.moments m WHERE m.venue_id=ip.id AND m.is_active AND m.visibility::text='open'
    AND m.status::text NOT IN ('draft','submitted','cancelled','archived','closed')) AS active_moments_count,
  'unclaimed'::text AS listing_status,ip.source_url,ip.attribution_text,ip.state AS parish,public.slugify(ip.state) AS parish_slug,
  ip.state,market.data->>'market_key' AS market_key,market.data->>'timezone' AS timezone
FROM public.pre_populated_venues ip
LEFT JOIN public.inventory_candidates candidate ON candidate.id=ip.inventory_candidate_id
LEFT JOIN public.venues cv ON cv.id=ip.id
LEFT JOIN LATERAL (
  SELECT ic.normalized_data AS data FROM public.moments em
  JOIN public.inventory_candidates ic ON ic.id=em.inventory_candidate_id
  WHERE em.venue_id=ip.id AND em.content_origin::text='imported' ORDER BY ic.source_last_checked_at DESC LIMIT 1
) market ON true
WHERE NOT ip.is_claimed AND ip.claimed_by IS NULL AND ip.verification_status='unverified'
  AND (cv.id IS NULL OR (cv.owner_id IS NULL AND cv.claimed_by IS NULL AND cv.organization_id IS NULL
    AND cv.claim_status='unclaimed' AND cv.status='active' AND coalesce(cv.is_active,true)));

CREATE OR REPLACE VIEW public.view_public_moment_directory AS
WITH participant_counts AS (
  SELECT going.moment_id,count(*)::integer AS participant_count FROM (
    SELECT mp.moment_id FROM public.moment_participants mp
    UNION ALL SELECT g.moment_id FROM public.guest_moment_rsvps g WHERE g.status IN ('confirmed','checked_in')
    UNION ALL SELECT e.event_id AS moment_id FROM public.event_moment_participations e
  ) going GROUP BY going.moment_id
)
SELECT m.id,m.slug,m.title,m.description,coalesce(m.seo_title,m.title) AS seo_title,
  coalesce(m.seo_description,left(coalesce(m.description,''),155)) AS seo_description,
  m.category,public.slugify(m.category) AS category_slug,
  coalesce(m.city,vp.city,ip.city,cv.city) AS city,public.slugify(coalesce(m.city,vp.city,ip.city,cv.city)) AS city_slug,
  coalesce(m.country,vp.country,ip.country,cv.country) AS country,
  public.slugify(coalesce(m.country,vp.country,ip.country,cv.country)) AS country_slug,
  coalesce(m.location,vp.location,ip.address,cv.address,concat_ws(', ',m.city,m.country)) AS location,
  m.venue_id,coalesce(m.venue_name,vp.name,ip.venue_name,cv.venue_name) AS venue_name,
  coalesce(vp.slug,ip.venue_slug,cv.venue_slug) AS venue_slug,
  m.image_url,m.starts_at,m.ends_at,m.reward,m.host_id,m.is_active,
  coalesce(pc.participant_count,0) AS participant_count,
  array_remove(array_agg(DISTINCT o.id),NULL::uuid) AS associated_brand_ids,
  array_remove(array_agg(DISTINCT o.name),NULL::text) AS associated_brand_names,
  array_remove(array_agg(DISTINCT o.slug),NULL::text) AS associated_brand_slugs,m.latitude,m.longitude,
  coalesce(ic.normalized_data->>'state',cv.state,ip.state) AS state,
  ic.normalized_data->>'market_key' AS market_key,m.recurrence_timezone AS timezone,
  m.content_origin,m.ownership_status,m.claim_status,m.claimed_by,m.organizer_id,m.external_source_url,
  m.recurrence_timezone,m.status,m.visibility,
  ic.normalized_data->>'ticket_status' AS ticket_status,m.country_code
FROM public.moments m
LEFT JOIN public.venue_profiles vp ON vp.id=m.venue_id
LEFT JOIN public.pre_populated_venues ip ON ip.id=m.venue_id
LEFT JOIN public.venues cv ON cv.id=m.venue_id
LEFT JOIN public.inventory_candidates ic ON ic.id=m.inventory_candidate_id
LEFT JOIN participant_counts pc ON pc.moment_id=m.id
LEFT JOIN public.view_moment_brand_associations mba ON mba.moment_id=m.id
LEFT JOIN public.organizations o ON o.id=mba.brand_id
WHERE m.is_active AND m.visibility::text='open'
  AND m.status::text NOT IN ('draft','submitted','reviewed','cancelled','archived','closed')
  AND (m.content_origin::text='stakeholder_created' OR (
    m.content_origin::text='imported' AND ((ic.review_status='published' AND ic.lifecycle_status='current') OR
      (m.ownership_status='owned' AND m.claim_status IN ('claimed','verified') AND EXISTS (
        SELECT 1 FROM public.imported_listing_claims owner_claim WHERE owner_claim.entity_type='moment'
          AND owner_claim.entity_id=m.id AND owner_claim.status='approved'
          AND owner_claim.claimant_id IN (m.host_id,m.organizer_id))))
    AND m.venue_id IS NOT NULL AND cv.id IS NOT NULL AND m.starts_at IS NOT NULL))
GROUP BY m.id,vp.id,ip.id,cv.id,ic.id,pc.participant_count;

GRANT SELECT ON public.view_public_moment_directory,public.view_public_venue_directory TO anon,authenticated,service_role;
