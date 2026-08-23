-- Multi-market city launch inventory.
-- Extends the private candidate review model; no imported record is public by default.

ALTER TABLE public.inventory_import_batches
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_slug text,
  ADD COLUMN IF NOT EXISTS city_slug text;

ALTER TABLE public.inventory_candidates
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_slug text,
  ADD COLUMN IF NOT EXISTS city_slug text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'current';

ALTER TABLE public.inventory_candidates DROP CONSTRAINT IF EXISTS inventory_candidates_lifecycle_status_check;
ALTER TABLE public.inventory_candidates ADD CONSTRAINT inventory_candidates_lifecycle_status_check
  CHECK (lifecycle_status IN ('current','stale','expired','superseded','removed'));

CREATE INDEX IF NOT EXISTS idx_inventory_candidates_market_review
  ON public.inventory_candidates(country_code,city_slug,entity_type,review_status,lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_inventory_candidates_expiry
  ON public.inventory_candidates(expires_at) WHERE lifecycle_status='current';

CREATE OR REPLACE FUNCTION public.sync_inventory_candidate_market()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE existing_id uuid;
BEGIN
  NEW.country_code := COALESCE(NEW.country_code,NEW.normalized_data->>'country_code');
  NEW.country_slug := COALESCE(NEW.country_slug,NEW.normalized_data->>'country_slug',public.slugify(NEW.normalized_data->>'country'));
  NEW.city_slug := COALESCE(NEW.city_slug,NEW.normalized_data->>'city_slug',public.slugify(NEW.normalized_data->>'city'));
  IF NEW.entity_type='moment' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := COALESCE(NULLIF(NEW.normalized_data->>'ends_at','')::timestamptz,NULLIF(NEW.normalized_data->>'starts_at','')::timestamptz)+interval '24 hours';
  END IF;
  SELECT candidate.id INTO existing_id FROM public.inventory_candidates candidate
  WHERE candidate.fingerprint=NEW.fingerprint AND candidate.entity_type=NEW.entity_type
    AND candidate.id<>NEW.id AND candidate.lifecycle_status IN ('current','stale')
  ORDER BY candidate.created_at LIMIT 1;
  IF existing_id IS NOT NULL THEN
    NEW.duplicate_of := COALESCE(NEW.duplicate_of,existing_id);
    IF NEW.review_status NOT IN ('published','rejected') THEN NEW.review_status := 'needs_research'; END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_inventory_candidate_market ON public.inventory_candidates;
CREATE TRIGGER trg_sync_inventory_candidate_market BEFORE INSERT OR UPDATE OF normalized_data,country_code,country_slug,city_slug
ON public.inventory_candidates FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_candidate_market();

UPDATE public.inventory_candidates SET normalized_data=normalized_data WHERE country_code IS NULL OR city_slug IS NULL;

CREATE TABLE IF NOT EXISTS public.city_inventory_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  country_slug text NOT NULL,
  country_name text NOT NULL,
  city_slug text NOT NULL,
  city_name text NOT NULL,
  region_name text,
  currency text NOT NULL,
  timezone text NOT NULL,
  launch_stage text NOT NULL DEFAULT 'planned' CHECK (launch_stage IN ('live','pilot','planned','paused')),
  target_venues integer NOT NULL DEFAULT 30 CHECK (target_venues>=0),
  target_discoveries integer NOT NULL DEFAULT 20 CHECK (target_discoveries>=0),
  target_moments integer NOT NULL DEFAULT 10 CHECK (target_moments>=0),
  target_polls integer NOT NULL DEFAULT 4 CHECK (target_polls>=0),
  target_scenes integer NOT NULL DEFAULT 3 CHECK (target_scenes>=0),
  public_launch_ready boolean NOT NULL DEFAULT false,
  readiness_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(country_code,city_slug)
);

CREATE TABLE IF NOT EXISTS public.city_discovery_poll_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_inventory_target_id uuid NOT NULL REFERENCES public.city_inventory_targets(id) ON DELETE CASCADE,
  template_key text NOT NULL UNIQUE,
  question text NOT NULL,
  category text NOT NULL DEFAULT 'Local Discovery',
  suggested_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  threshold_for_moment integer NOT NULL DEFAULT 25 CHECK (threshold_for_moment>0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','published','retired')),
  discovery_question_id uuid REFERENCES public.discovery_questions(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.city_steward_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_inventory_target_id uuid NOT NULL REFERENCES public.city_inventory_targets(id) ON DELETE CASCADE,
  steward_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN ('lead','contributor','reviewer')),
  status text NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate','active','paused','graduated','removed')),
  cohort_started_at timestamptz,
  cohort_ends_at timestamptz,
  conflicts jsonb NOT NULL DEFAULT '[]'::jsonb,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(city_inventory_target_id,steward_id)
);

ALTER TABLE public.city_inventory_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_discovery_poll_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_steward_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads city launch targets" ON public.city_inventory_targets FOR SELECT USING (true);
CREATE POLICY "Active polls are publicly readable" ON public.city_discovery_poll_templates FOR SELECT USING (status='published');
CREATE POLICY "Stewards read own assignments" ON public.city_steward_assignments FOR SELECT USING (steward_id=auth.uid());
GRANT SELECT ON public.city_inventory_targets TO anon,authenticated;
GRANT SELECT ON public.city_discovery_poll_templates TO anon,authenticated;
GRANT SELECT ON public.city_steward_assignments TO authenticated;
GRANT ALL ON public.city_inventory_targets,public.city_discovery_poll_templates,public.city_steward_assignments TO service_role;

CREATE OR REPLACE FUNCTION public.expire_stale_imported_moments()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.inventory_candidates SET lifecycle_status='expired',updated_at=now()
  WHERE entity_type='moment' AND lifecycle_status='current' AND expires_at<=now();
  GET DIAGNOSTICS affected=ROW_COUNT;
  UPDATE public.moments SET is_active=false,status='completed',updated_at=now()
  WHERE content_origin='imported' AND is_active=true AND COALESCE(ends_at,starts_at)+interval '24 hours'<=now();
  RETURN affected;
END; $$;
REVOKE ALL ON FUNCTION public.expire_stale_imported_moments() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_imported_moments() TO service_role;

CREATE OR REPLACE FUNCTION public.publish_city_poll_template(p_template_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE template public.city_discovery_poll_templates%rowtype; city public.city_inventory_targets%rowtype; question_id uuid; option_text text;
BEGIN
  SELECT * INTO template FROM public.city_discovery_poll_templates WHERE id=p_template_id FOR UPDATE;
  IF NOT FOUND OR template.status<>'approved' THEN RAISE EXCEPTION 'Approved poll template required'; END IF;
  SELECT * INTO city FROM public.city_inventory_targets WHERE id=template.city_inventory_target_id;
  INSERT INTO public.discovery_questions(question,category,author_name,threshold_for_moment,question_type,status,metadata)
  VALUES(template.question,template.category,'Promorang City Steward',template.threshold_for_moment,'city_direction','active',
    jsonb_build_object('country_code',city.country_code,'country_slug',city.country_slug,'city',city.city_name,'city_slug',city.city_slug,'source','steward_reviewed_template'))
  RETURNING id INTO question_id;
  FOR option_text IN SELECT jsonb_array_elements_text(template.suggested_options) LOOP
    INSERT INTO public.discovery_options(discovery_id,question_id,option_text,votes_count) VALUES(question_id,question_id,option_text,0);
  END LOOP;
  UPDATE public.city_discovery_poll_templates SET status='published',discovery_question_id=question_id,updated_at=now() WHERE id=template.id;
  RETURN question_id;
END; $$;
REVOKE ALL ON FUNCTION public.publish_city_poll_template(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.publish_city_poll_template(uuid) TO service_role;

CREATE OR REPLACE VIEW public.view_city_inventory_health AS
WITH candidate_counts AS (
  SELECT country_code,city_slug,
    count(*) FILTER (WHERE entity_type='venue' AND review_status='published' AND lifecycle_status='current') AS venues,
    count(*) FILTER (WHERE entity_type='discovery' AND review_status='published' AND lifecycle_status='current') AS discoveries,
    count(*) FILTER (WHERE entity_type='moment' AND review_status='published' AND lifecycle_status='current') AS moments,
    count(*) FILTER (WHERE review_status IN ('pending','needs_research','approved')) AS awaiting_review
  FROM public.inventory_candidates GROUP BY country_code,city_slug
), poll_counts AS (
  SELECT target.id,count(template.id) FILTER (WHERE template.status='published') AS polls
  FROM public.city_inventory_targets target LEFT JOIN public.city_discovery_poll_templates template ON template.city_inventory_target_id=target.id GROUP BY target.id
), steward_counts AS (
  SELECT city_inventory_target_id,count(*) FILTER (WHERE status='active') AS active_stewards FROM public.city_steward_assignments GROUP BY city_inventory_target_id
)
SELECT target.id,target.country_code,target.country_slug,target.country_name,target.city_slug,target.city_name,target.launch_stage,
  COALESCE(counts.venues,0) AS venues,COALESCE(counts.discoveries,0) AS discoveries,COALESCE(counts.moments,0) AS moments,
  COALESCE(polls.polls,0) AS polls,COALESCE(stewards.active_stewards,0) AS active_stewards,COALESCE(counts.awaiting_review,0) AS awaiting_review,
  target.target_venues,target.target_discoveries,target.target_moments,target.target_polls,target.target_scenes,target.public_launch_ready,
  round(100.0*((least(COALESCE(counts.venues,0),target.target_venues)::numeric/NULLIF(target.target_venues,0)+
    least(COALESCE(counts.discoveries,0),target.target_discoveries)::numeric/NULLIF(target.target_discoveries,0)+
    least(COALESCE(counts.moments,0),target.target_moments)::numeric/NULLIF(target.target_moments,0)+
    least(COALESCE(polls.polls,0),target.target_polls)::numeric/NULLIF(target.target_polls,0))/4),1) AS inventory_readiness_percent
FROM public.city_inventory_targets target
LEFT JOIN candidate_counts counts ON counts.country_code=target.country_code AND counts.city_slug=target.city_slug
LEFT JOIN poll_counts polls ON polls.id=target.id
LEFT JOIN steward_counts stewards ON stewards.city_inventory_target_id=target.id;
GRANT SELECT ON public.view_city_inventory_health TO anon,authenticated;

CREATE OR REPLACE VIEW public.view_public_city_discovery_polls AS
SELECT question.id,question.question,question.category,question.author_name,question.total_votes,
  question.threshold_for_moment,question.created_at,question.metadata->>'country_code' AS country_code,
  question.metadata->>'country_slug' AS country_slug,question.metadata->>'city' AS city,
  question.metadata->>'city_slug' AS city_slug,
  jsonb_agg(jsonb_build_object('id',option.id,'text',option.option_text,'votes',option.votes_count) ORDER BY option.created_at,option.id) AS options
FROM public.discovery_questions question
JOIN public.discovery_options option ON COALESCE(option.discovery_id,option.question_id)=question.id
WHERE question.question_type='city_direction' AND question.status='active'
GROUP BY question.id;
GRANT SELECT ON public.view_public_city_discovery_polls TO anon,authenticated;

-- Remove the Jamaica-only assumptions from the approved event publisher.
CREATE OR REPLACE FUNCTION public.publish_approved_event_candidate(p_candidate_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE candidate public.inventory_candidates%rowtype; moment_id uuid; starts timestamptz; venue uuid; source_attribution text;
BEGIN
  SELECT * INTO candidate FROM public.inventory_candidates WHERE id=p_candidate_id FOR UPDATE;
  IF NOT FOUND OR candidate.entity_type<>'moment' OR candidate.review_status<>'approved' OR candidate.lifecycle_status<>'current' THEN RAISE EXCEPTION 'Current approved event candidate required'; END IF;
  starts := (candidate.normalized_data->>'starts_at')::timestamptz;
  IF starts<now()-interval '12 hours' THEN RAISE EXCEPTION 'Cannot publish an expired event candidate'; END IF;
  venue := NULLIF(candidate.normalized_data->>'venue_id','')::uuid;
  SELECT COALESCE(source.attribution_text,'Source: '||source.name) INTO source_attribution FROM public.inventory_sources source WHERE source.id=candidate.source_id;
  INSERT INTO public.moments(title,slug,description,category,location,venue_id,venue_name,city,country,starts_at,ends_at,is_active,status,visibility,content_origin,recurrence_enabled,recurrence_frequency,recurrence_interval,recurrence_by_weekday,recurrence_until,inventory_candidate_id,external_source_url,external_attribution,external_last_checked_at,ownership_status,source_confidence,schedule_precision,seo_title,seo_description)
  VALUES(candidate.normalized_data->>'title',public.slugify(candidate.normalized_data->>'title')||'-'||left(candidate.id::text,8),candidate.normalized_data->>'description',COALESCE(candidate.normalized_data->>'category','community'),candidate.normalized_data->>'location',venue,candidate.normalized_data->>'venue_name',candidate.normalized_data->>'city',candidate.normalized_data->>'country',starts,NULLIF(candidate.normalized_data->>'ends_at','')::timestamptz,true,'scheduled','open','imported',COALESCE((candidate.normalized_data->>'recurrence_enabled')::boolean,false),NULLIF(candidate.normalized_data->>'recurrence_frequency','')::public.moment_recurrence_frequency,COALESCE((candidate.normalized_data->>'recurrence_interval')::integer,1),COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(candidate.normalized_data->'recurrence_by_weekday','[]'::jsonb))::smallint),'{}'::smallint[]),NULLIF(candidate.normalized_data->>'recurrence_until','')::timestamptz,candidate.id,candidate.source_url,source_attribution,candidate.source_last_checked_at,'unclaimed',candidate.confidence,COALESCE(candidate.normalized_data->>'schedule_precision','exact'),candidate.normalized_data->>'title',left(candidate.normalized_data->>'description',155))
  ON CONFLICT(inventory_candidate_id) DO UPDATE SET starts_at=excluded.starts_at,ends_at=excluded.ends_at,venue_id=excluded.venue_id,venue_name=excluded.venue_name,city=excluded.city,country=excluded.country,location=excluded.location,external_last_checked_at=excluded.external_last_checked_at,source_confidence=excluded.source_confidence,is_active=true,status='scheduled',updated_at=now()
  RETURNING id INTO moment_id;
  UPDATE public.inventory_candidates SET review_status='published',published_record_id=moment_id::text,expires_at=COALESCE(NULLIF(normalized_data->>'ends_at','')::timestamptz,starts)+interval '24 hours',updated_at=now() WHERE id=candidate.id;
  RETURN moment_id;
END; $$;
REVOKE ALL ON FUNCTION public.publish_approved_event_candidate(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_approved_event_candidate(uuid) TO service_role;

NOTIFY pgrst,'reload schema';
