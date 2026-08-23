-- A regular unique index still allows multiple NULL inventory candidate IDs,
-- while allowing ON CONFLICT(inventory_candidate_id) to be inferred reliably.
DROP INDEX IF EXISTS public.uq_moments_inventory_candidate;
CREATE UNIQUE INDEX uq_moments_inventory_candidate
  ON public.moments(inventory_candidate_id);

NOTIFY pgrst, 'reload schema';
