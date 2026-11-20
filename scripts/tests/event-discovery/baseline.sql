-- Minimal live-schema fixture: real identity FKs, enums, defaults, public view
-- dependencies, and the unsafe legacy policy. No production data is included.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated,service_role;
CREATE TABLE public.users(id uuid PRIMARY KEY REFERENCES auth.users(id),role text DEFAULT 'user');
CREATE TABLE public.organizations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text,slug text);
CREATE FUNCTION public.is_claimable_page_admin(p_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM public.users WHERE id=p_user_id AND role='admin'); $$;
CREATE FUNCTION public.slugify(text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' FROM regexp_replace(lower(coalesce($1,'')),'[^a-z0-9]+','-','g'));
$$;
CREATE TYPE public.moment_content_origin AS ENUM('stakeholder_created','platform_seed','demo','scraped','imported');
CREATE TYPE public.moment_status AS ENUM('draft','submitted','reviewed','approved_unfunded','funded','joinable','active','processing','closed','cancelled','archived','scheduled');
CREATE TYPE public.moment_visibility AS ENUM('open','invite','private');
CREATE TABLE public.inventory_sources (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),source_key text NOT NULL UNIQUE,name text NOT NULL,source_type text NOT NULL,
 base_url text,license_name text,license_url text,attribution_text text,terms_url text,enabled boolean NOT NULL DEFAULT true,
 metadata jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.inventory_import_batches(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),source_id uuid NOT NULL REFERENCES public.inventory_sources(id),
 region text,status text DEFAULT 'collecting',query jsonb DEFAULT '{}',stats jsonb DEFAULT '{}');
CREATE TABLE public.inventory_candidates (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),batch_id uuid NOT NULL REFERENCES public.inventory_import_batches(id),
 source_id uuid NOT NULL REFERENCES public.inventory_sources(id),entity_type text NOT NULL CHECK(entity_type IN('venue','brand','moment','discovery')),
 source_record_id text NOT NULL,source_url text,source_first_seen_at timestamptz NOT NULL DEFAULT now(),source_last_checked_at timestamptz NOT NULL DEFAULT now(),
 raw_data jsonb NOT NULL,normalized_data jsonb NOT NULL,fingerprint text NOT NULL,confidence numeric NOT NULL DEFAULT 0 CHECK(confidence BETWEEN 0 AND 1),
 review_status text NOT NULL DEFAULT 'pending' CHECK(review_status IN('pending','approved','rejected','needs_research','published')),
 review_notes text,duplicate_of uuid REFERENCES public.inventory_candidates(id),reviewed_by uuid REFERENCES auth.users(id),reviewed_at timestamptz,
 published_record_id text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 country_code text,country_slug text,city_slug text,expires_at timestamptz,lifecycle_status text NOT NULL DEFAULT 'current'
 CHECK(lifecycle_status IN('current','stale','expired','superseded','removed')),UNIQUE(source_id,entity_type,source_record_id));
CREATE TABLE public.event_candidate_evidence(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),inventory_candidate_id uuid NOT NULL REFERENCES public.inventory_candidates(id),
 source_url text NOT NULL,source_name text NOT NULL,evidence_type text NOT NULL CHECK(evidence_type IN('official_calendar','organizer_page','venue_page','ticket_page','community_report')),
 observed_facts jsonb NOT NULL DEFAULT '{}',is_authoritative boolean NOT NULL DEFAULT false,checked_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(inventory_candidate_id,source_url));
CREATE TABLE public.venues (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),owner_id uuid REFERENCES auth.users(id),venue_name text NOT NULL,venue_slug text UNIQUE,
 description text,address text,city text,state text,zip_code text,country text DEFAULT 'US',latitude numeric,longitude numeric,phone text,email text,
 website_url text,logo_url text,cover_image_url text,capacity integer,venue_type text,amenities jsonb DEFAULT '[]',operating_hours jsonb,
 is_verified boolean DEFAULT false,status text DEFAULT 'active' CHECK(status IN('active','inactive','pending')),
 created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),organization_id uuid REFERENCES public.organizations(id),
 claim_status text NOT NULL DEFAULT 'claimed' CHECK(claim_status IN('unclaimed','claimed','verified')),
 source text DEFAULT 'manual' CHECK(source IN('manual','google_maps','scraped','yelp')),source_url text,claimed_by uuid REFERENCES auth.users(id),
 claimed_at timestamptz,name text,image_url text,category text DEFAULT 'retail',is_active boolean DEFAULT true,website text,area_key text,
 slug text,location text);
CREATE TABLE public.pre_populated_venues (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),venue_name text NOT NULL,venue_slug text UNIQUE,address text,city text,state text,zip_code text,country text DEFAULT 'Jamaica',
 latitude numeric,longitude numeric,phone text,website text,email text,social_profiles jsonb DEFAULT '{}',categories text[] DEFAULT '{}',tags text[] DEFAULT '{}',
 photos jsonb DEFAULT '[]',logo_url text,data_source text,enrichment_status text DEFAULT 'pending',claimed_by uuid REFERENCES auth.users(id),claimed_at timestamptz,
 claim_token text UNIQUE,inventory_candidate_id uuid UNIQUE REFERENCES public.inventory_candidates(id),source_url text,attribution_text text,
 is_claimed boolean NOT NULL DEFAULT false,verification_status text NOT NULL DEFAULT 'unverified',created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),
 opening_hours text,amenities jsonb DEFAULT '[]',menu_url text,community_verified_at timestamptz);
CREATE TABLE public.venue_profiles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,slug text UNIQUE,description text,location text,address text,city text,country text,
 coordinates point,venue_type text CHECK(venue_type IN('cafe','restaurant','bar','club','gallery','theater','outdoor','retail','other')),capacity integer,
 amenities jsonb DEFAULT '[]',images jsonb DEFAULT '[]',verification_status text DEFAULT 'unverified' CHECK(verification_status IN('unverified','pending','verified')),
 total_moments_hosted integer DEFAULT 0,total_checkins integer DEFAULT 0,avg_rating numeric(3,2) DEFAULT 0,popularity_score numeric(5,2) DEFAULT 0,
 created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),latitude numeric,longitude numeric,social_links jsonb DEFAULT '{}',contact jsonb DEFAULT '{}',
 opening_information text,is_active boolean DEFAULT true,featured_image_url text);
CREATE TABLE public.moments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organizer_id uuid REFERENCES public.users(id),title text NOT NULL,description text,starts_at timestamptz,ends_at timestamptz,
 created_at timestamptz DEFAULT now(),closed_at timestamptz,host_id uuid REFERENCES public.users(id),status public.moment_status DEFAULT 'draft',
 claim_status text NOT NULL DEFAULT 'claimed' CHECK(claim_status IN('unclaimed','claimed','verified')),
 source text DEFAULT 'manual' CHECK(source IN('manual','eventbrite','partiful','google_maps','scraped')),source_url text,claimed_by uuid REFERENCES auth.users(id),claimed_at timestamptz,
 is_active boolean NOT NULL DEFAULT true,image_url text,category text DEFAULT 'general',location text,venue_id uuid,venue_name text,reward text,
 visibility public.moment_visibility NOT NULL DEFAULT 'open',updated_at timestamptz NOT NULL DEFAULT now(),slug text UNIQUE,city text,country text,country_code text,
 seo_title text,seo_description text,recurrence_enabled boolean NOT NULL DEFAULT false,recurrence_timezone text NOT NULL DEFAULT 'UTC',
 organization_id uuid REFERENCES public.organizations(id),content_origin public.moment_content_origin NOT NULL DEFAULT 'stakeholder_created',creative_owner_id uuid REFERENCES auth.users(id),
 latitude numeric,longitude numeric,inventory_candidate_id uuid UNIQUE REFERENCES public.inventory_candidates(id),external_source_url text,external_attribution text,
 external_last_checked_at timestamptz,ownership_status text NOT NULL DEFAULT 'owned',source_confidence numeric,schedule_precision text NOT NULL DEFAULT 'exact');
CREATE TABLE public.page_ownership_claims(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),entity_type text,entity_id uuid,status text,
 intended_owner_email text NOT NULL,created_by uuid NOT NULL REFERENCES auth.users(id),UNIQUE(entity_type,entity_id));
CREATE TABLE public.moment_participants(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),moment_id uuid REFERENCES public.moments(id));
CREATE TABLE public.guest_moment_rsvps(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),moment_id uuid REFERENCES public.moments(id),status text);
CREATE TABLE public.event_moment_participations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),event_id uuid REFERENCES public.moments(id));
CREATE TABLE public.moment_brand_associations(moment_id uuid REFERENCES public.moments(id),brand_id uuid REFERENCES public.organizations(id));
CREATE VIEW public.view_moment_brand_associations AS SELECT * FROM public.moment_brand_associations;
CREATE FUNCTION public.publish_approved_event_candidate(uuid) RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$ SELECT $1; $$;
GRANT EXECUTE ON FUNCTION public.publish_approved_event_candidate(uuid) TO anon,authenticated,service_role;
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_populated_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY moments_read_policy ON public.moments FOR SELECT USING(true);
CREATE POLICY moments_final_manage ON public.moments FOR ALL USING(host_id=auth.uid() OR public.is_claimable_page_admin(auth.uid()));
CREATE POLICY moments_organizer_policy ON public.moments FOR ALL USING(organizer_id=auth.uid());
CREATE POLICY "Users can claim unclaimed moments" ON public.moments FOR UPDATE
 USING(claim_status='unclaimed') WITH CHECK(claim_status='claimed' AND claimed_by=auth.uid());
CREATE POLICY venues_owner ON public.venues FOR ALL USING(owner_id=auth.uid());
CREATE POLICY venues_public ON public.venues FOR SELECT USING(status='active');
CREATE POLICY venue_profiles_public ON public.venue_profiles FOR SELECT USING(true);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.moments,public.venues,public.pre_populated_venues,public.venue_profiles TO anon,authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
