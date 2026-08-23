-- Publishes the national Jamaica OSM expansion while preferring already-live records
-- during fingerprint deduplication, then creates the standard Scout and Discovery inventory.

WITH ranked AS (
  SELECT candidate.id,
         row_number() OVER (
           PARTITION BY candidate.fingerprint
           ORDER BY (venue.id IS NOT NULL) DESC, candidate.confidence DESC, candidate.created_at, candidate.id
         ) AS duplicate_rank
  FROM public.inventory_candidates candidate
  JOIN public.inventory_sources source ON source.id = candidate.source_id
  LEFT JOIN public.pre_populated_venues venue ON venue.inventory_candidate_id = candidate.id
  WHERE source.source_key = 'openstreetmap' AND candidate.entity_type = 'venue'
)
UPDATE public.inventory_candidates candidate
SET review_status = CASE WHEN ranked.duplicate_rank = 1 THEN 'approved' ELSE 'needs_research' END,
    review_notes = concat_ws(E'\n', candidate.review_notes,
      CASE WHEN ranked.duplicate_rank = 1
        THEN 'National Jamaica expansion: approved as an attributed unclaimed listing.'
        ELSE 'National Jamaica expansion: held as a duplicate fingerprint.' END),
    reviewed_at = now(), updated_at = now()
FROM ranked
WHERE candidate.id = ranked.id
  AND NOT EXISTS (SELECT 1 FROM public.pre_populated_venues published WHERE published.inventory_candidate_id = candidate.id);

DO $$
DECLARE candidate record;
BEGIN
  FOR candidate IN
    SELECT item.id
    FROM public.inventory_candidates item
    JOIN public.inventory_sources source ON source.id = item.source_id
    LEFT JOIN public.pre_populated_venues venue ON venue.inventory_candidate_id = item.id
    WHERE source.source_key = 'openstreetmap' AND item.entity_type = 'venue'
      AND item.review_status = 'approved' AND venue.id IS NULL
    ORDER BY item.confidence DESC, item.id
  LOOP
    PERFORM public.publish_approved_inventory_venue(candidate.id);
  END LOOP;
END;
$$;

INSERT INTO public.listing_enrichment_opportunities (
  inventory_candidate_id, pre_populated_venue_id, field_key, title, instructions, proof_requirements, reward_points, priority
)
SELECT candidate.id, venue.id, task.field_key, task.title, task.instructions, task.proof, task.reward, task.priority
FROM public.pre_populated_venues venue
JOIN public.inventory_candidates candidate ON candidate.id = venue.inventory_candidate_id
CROSS JOIN LATERAL (
  VALUES
    ('operating_status', 'Confirm this place is operating', 'Visit or provide a recent authoritative source confirming that this place currently operates.', '["recent geotagged photo or official dated source", "short observation"]'::jsonb, 25, 95),
    ('original_photo', 'Photograph the storefront', 'Take a clear, original photo showing the venue exterior or public entrance. Do not upload copied social or map imagery.', '["original photo", "location confirmation"]'::jsonb, 35, 80)
) AS task(field_key, title, instructions, proof, reward, priority)
ON CONFLICT (inventory_candidate_id, field_key) DO NOTHING;

INSERT INTO public.listing_enrichment_opportunities (
  inventory_candidate_id, pre_populated_venue_id, field_key, title, instructions, proof_requirements, reward_points, priority
)
SELECT candidate.id, venue.id, missing.field_key, missing.title, missing.instructions, missing.proof, missing.reward, missing.priority
FROM public.pre_populated_venues venue
JOIN public.inventory_candidates candidate ON candidate.id = venue.inventory_candidate_id
CROSS JOIN LATERAL (
  VALUES
    ('street_address', 'Confirm the street address', 'Submit the visible street address with location proof.', '["street sign, storefront, receipt, or official source"]'::jsonb, 25, 85, candidate.raw_data->'tags'->>'addr:street'),
    ('opening_hours', 'Confirm opening hours', 'Submit current public opening hours and supporting proof.', '["storefront hours, current menu, or official source"]'::jsonb, 20, 70, candidate.normalized_data->>'opening_hours'),
    ('phone', 'Confirm the business phone', 'Submit a current public business telephone number and its source.', '["official source or visible business material"]'::jsonb, 15, 55, candidate.normalized_data->>'phone'),
    ('website', 'Find the official website', 'Submit the business-owned website, not a directory or review page.', '["official website URL"]'::jsonb, 15, 50, candidate.normalized_data->>'website')
) AS missing(field_key, title, instructions, proof, reward, priority, existing_value)
WHERE NULLIF(missing.existing_value, '') IS NULL
ON CONFLICT (inventory_candidate_id, field_key) DO NOTHING;

INSERT INTO public.discovery_questions (
  inventory_candidate_id, pre_populated_venue_id, question, category, author_name,
  threshold_for_moment, question_type, status, metadata
)
SELECT candidate.id, venue.id,
       concat('Is ', venue.venue_name, ' still operating in ', COALESCE(venue.city, venue.state, 'Jamaica'), '?'),
       'Place Verification', 'Promorang Scout Network', 5, 'listing_verification', 'active',
       jsonb_build_object('venue_slug', venue.venue_slug, 'reward_points', 0, 'confidence', candidate.confidence, 'parish', venue.state)
FROM public.pre_populated_venues venue
JOIN public.inventory_candidates candidate ON candidate.id = venue.inventory_candidate_id
WHERE candidate.confidence < 0.800
ON CONFLICT (inventory_candidate_id, question_type) DO NOTHING;

INSERT INTO public.discovery_options (discovery_id, question_id, option_text, votes_count)
SELECT question.id, question.id, option.option_text, 0
FROM public.discovery_questions question
CROSS JOIN (VALUES
  ('Yes — I visited recently'),
  ('I know it exists, but not recently'),
  ('It needs an in-person check'),
  ('It appears closed or moved')
) AS option(option_text)
WHERE question.question_type = 'listing_verification'
  AND NOT EXISTS (
    SELECT 1 FROM public.discovery_options existing
    WHERE COALESCE(existing.discovery_id, existing.question_id) = question.id
  );

NOTIFY pgrst, 'reload schema';
