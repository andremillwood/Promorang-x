-- Run after 20261120113704_public_event_discovery_and_claims.sql is applied.
-- User-authorized discovery scopes as of 2026-11-20. This does not publish any
-- candidate or change an owner. Existing policy rows (including paused policies)
-- are deliberately preserved on repeat execution.
BEGIN;

WITH approved_markets(market_key,country_code,country_name,state,allowed_timezones) AS (
  VALUES
    ('jamaica','JM','Jamaica',NULL::text,ARRAY['America/Jamaica']),
    ('trinidad-and-tobago','TT','Trinidad and Tobago',NULL,ARRAY['America/Port_of_Spain']),
    ('barbados','BB','Barbados',NULL,ARRAY['America/Barbados']),
    ('bahamas','BS','The Bahamas',NULL,ARRAY['America/Nassau']),
    ('guyana','GY','Guyana',NULL,ARRAY['America/Guyana']),
    ('ghana','GH','Ghana',NULL,ARRAY['Africa/Accra']),
    ('dominican-republic','DO','Dominican Republic',NULL,ARRAY['America/Santo_Domingo']),
    ('colombia','CO','Colombia',NULL,ARRAY['America/Bogota']),
    ('panama','PA','Panama',NULL,ARRAY['America/Panama']),
    ('us-florida','US','United States','Florida',ARRAY['America/New_York','America/Chicago']),
    ('us-georgia','US','United States','Georgia',ARRAY['America/New_York']),
    ('us-new-york','US','United States','New York',ARRAY['America/New_York']),
    ('us-michigan','US','United States','Michigan',ARRAY['America/Detroit','America/Menominee']),
    ('gb-london','GB','United Kingdom','Greater London',ARRAY['Europe/London'])
), approved_sources(source_key,market_key) AS (
  VALUES
    ('visitjamaica-events','jamaica'),
    ('touchstone-link-events','jamaica'),
    ('queens-hall-tt-events','trinidad-and-tobago'),
    ('visit-barbados-events','barbados'),
    ('nassau-paradise-island-events','bahamas'),
    ('guyana-tourism-events','guyana'),
    ('visit-ghana-events','ghana'),
    ('go-dominican-republic-events','dominican-republic'),
    ('medellin-travel-events','colombia'),
    ('bogota-cultural-agenda','colombia'),
    ('visit-panama-events','panama'),
    ('visit-florida-events','us-florida'),
    ('miami-beaches-events','us-florida'),
    ('visit-lauderdale-events','us-florida'),
    ('palm-beaches-events','us-florida'),
    ('visit-orlando-events','us-florida'),
    ('visit-tampa-bay-events','us-florida'),
    ('visit-jacksonville-events','us-florida'),
    ('art-basel-miami-events','us-florida'),
    ('explore-georgia-events','us-georgia'),
    ('discover-atlanta-events','us-georgia'),
    ('visit-savannah-events','us-georgia'),
    ('visit-athens-events','us-georgia'),
    ('visit-augusta-events','us-georgia'),
    ('atlanta-track-club-events','us-georgia'),
    ('iloveny-events','us-new-york'),
    ('nyc-tourism-events','us-new-york'),
    ('dciny-events','us-new-york'),
    ('pure-michigan-events','us-michigan'),
    ('visit-detroit-events','us-michigan'),
    ('destination-ann-arbor-events','us-michigan'),
    ('experience-grand-rapids-events','us-michigan'),
    ('detroit-symphony-events','us-michigan'),
    ('visit-london-events','gb-london'),
    ('barbican-events','gb-london')
)
INSERT INTO public.event_publication_policies
  (source_id,market_key,country_code,country_name,state,allowed_timezones,enabled,minimum_confidence,max_evidence_age_hours)
SELECT s.id,m.market_key,m.country_code,m.country_name,m.state,m.allowed_timezones,true,0.95,24
FROM approved_sources a
JOIN approved_markets m USING (market_key)
JOIN public.inventory_sources s ON s.source_key=a.source_key AND s.enabled
ON CONFLICT (source_id,market_key) DO NOTHING;

UPDATE public.inventory_sources s
SET metadata=s.metadata || jsonb_build_object(
  'discovery_scope','event_discovery',
  'event_auto_publish_verified',true,
  'event_publication_policy_source','event_publication_policies',
  'publication_policy','verified_external_listing'),updated_at=now()
WHERE EXISTS (SELECT 1 FROM public.event_publication_policies p WHERE p.source_id=s.id AND p.enabled);

COMMIT;

SELECT p.market_key,count(*) AS enabled_sources,p.max_evidence_age_hours,p.minimum_confidence
FROM public.event_publication_policies p JOIN public.inventory_sources s ON s.id=p.source_id
WHERE p.enabled AND s.enabled
GROUP BY p.market_key,p.max_evidence_age_hours,p.minimum_confidence ORDER BY p.market_key;
