-- Remove legacy synthetic Found listings and any PromoCard slips created from them.
-- Production absence must remain real absence; these records were design fixtures only.

DELETE FROM public.discovery_card_unlocks
WHERE poll_id IN (
  'found:11111111-1111-4111-8111-111111111111',
  'found:22222222-2222-4222-8222-222222222222'
);

DELETE FROM public.found_listings
WHERE id IN (
  '11111111-1111-4111-8111-111111111111'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid
)
OR finder_anon_id IN ('seed:hiking-kids', 'seed:sunday-church');
