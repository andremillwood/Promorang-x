-- Converge PromoPush purchasing, fulfillment and launch on the existing
-- PromoPush campaign and canonical activation Gem reserve.

ALTER TABLE public.promopush_campaigns
  ADD COLUMN IF NOT EXISTS objective_type text,
  ADD COLUMN IF NOT EXISTS push_mode text,
  ADD COLUMN IF NOT EXISTS reward_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS package_code text,
  ADD COLUMN IF NOT EXISTS fulfillment_kit jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS distribution_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS funding_status text NOT NULL DEFAULT 'unfunded',
  ADD COLUMN IF NOT EXISTS launched_at timestamptz;

ALTER TABLE public.promopush_campaigns DROP CONSTRAINT IF EXISTS promopush_campaigns_objective_type_check;
ALTER TABLE public.promopush_campaigns ADD CONSTRAINT promopush_campaigns_objective_type_check
  CHECK (objective_type IS NULL OR objective_type IN ('awareness','signups','foot_traffic','ticket_sales','redemptions','product_trial','leads','content_creation','sales'));
ALTER TABLE public.promopush_campaigns DROP CONSTRAINT IF EXISTS promopush_campaigns_push_mode_check;
ALTER TABLE public.promopush_campaigns ADD CONSTRAINT promopush_campaigns_push_mode_check
  CHECK (push_mode IS NULL OR push_mode IN ('organic','geo','people','live','full'));
ALTER TABLE public.promopush_campaigns DROP CONSTRAINT IF EXISTS promopush_campaigns_reward_type_check;
ALTER TABLE public.promopush_campaigns ADD CONSTRAINT promopush_campaigns_reward_type_check
  CHECK (reward_type IN ('discount','free_item','ticket','sample','upgrade','gems','exclusive_access','none'));
ALTER TABLE public.promopush_campaigns DROP CONSTRAINT IF EXISTS promopush_campaigns_funding_status_check;
ALTER TABLE public.promopush_campaigns ADD CONSTRAINT promopush_campaigns_funding_status_check
  CHECK (funding_status IN ('unfunded','secured','partially_released','released','refunded'));

CREATE INDEX IF NOT EXISTS idx_promopush_campaigns_proposal ON public.promopush_campaigns(proposal_id) WHERE proposal_id IS NOT NULL;

ALTER TABLE public.promopush_creator_earnings ALTER COLUMN currency SET DEFAULT 'GEMS';

CREATE OR REPLACE FUNCTION public.launch_promopush_campaign(p_campaign_id uuid, p_actor_user_id uuid)
RETURNS public.promopush_campaigns
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_campaign public.promopush_campaigns%rowtype;
  v_reserve public.activation_gem_reserves%rowtype;
  v_price numeric;
BEGIN
  SELECT * INTO v_campaign FROM public.promopush_campaigns WHERE id = p_campaign_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PromoPush campaign not found'; END IF;
  IF p_actor_user_id IS NULL OR NOT (
    p_actor_user_id = v_campaign.host_id OR
    p_actor_user_id = v_campaign.brand_id OR
    p_actor_user_id = v_campaign.created_by
  ) THEN
    RAISE EXCEPTION 'Not authorized to launch this PromoPush';
  END IF;
  IF v_campaign.objective_type IS NULL OR v_campaign.push_mode IS NULL THEN
    RAISE EXCEPTION 'Outcome and distribution package are required';
  END IF;
  IF nullif(trim(v_campaign.fulfillment_kit->>'cta'),'') IS NULL
     OR nullif(trim(v_campaign.fulfillment_kit->>'landing_url'),'') IS NULL THEN
    RAISE EXCEPTION 'CTA and landing destination are required';
  END IF;
  IF v_campaign.reward_type <> 'none'
     AND nullif(trim(v_campaign.fulfillment_kit->>'inventory_reference'),'') IS NULL THEN
    RAISE EXCEPTION 'Connected reward inventory is required';
  END IF;
  IF v_campaign.end_time <= v_campaign.start_time OR v_campaign.end_time <= now() THEN
    RAISE EXCEPTION 'Campaign distribution window is invalid';
  END IF;

  v_price := coalesce(nullif(v_campaign.pricing->>'total_gems','')::numeric, 0);
  IF v_campaign.push_mode <> 'organic' THEN
    IF v_campaign.proposal_id IS NULL OR v_price <= 0 THEN
      RAISE EXCEPTION 'Paid PromoPush requires a priced activation';
    END IF;
    SELECT * INTO v_reserve FROM public.activation_gem_reserves WHERE proposal_id = v_campaign.proposal_id FOR UPDATE;
    IF NOT FOUND OR (v_reserve.secured_gems - v_reserve.released_gems - v_reserve.refunded_gems) < v_price THEN
      RAISE EXCEPTION 'PromoPush funding is not secured';
    END IF;
  END IF;

  UPDATE public.promopush_campaigns
  SET status = 'active',
      funding_status = CASE WHEN push_mode = 'organic' THEN funding_status ELSE 'secured' END,
      launched_at = coalesce(launched_at, now()), updated_at = now()
  WHERE id = p_campaign_id RETURNING * INTO v_campaign;
  RETURN v_campaign;
END $$;

REVOKE ALL ON FUNCTION public.launch_promopush_campaign(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.launch_promopush_campaign(uuid,uuid) TO service_role;

COMMENT ON COLUMN public.promopush_campaigns.fulfillment_kit IS 'Required assets and operational inputs; references canonical inventory rather than duplicating it.';
COMMENT ON COLUMN public.promopush_campaigns.proposal_id IS 'Optional activation contract whose canonical Gem reserve secures paid PromoPush.';
COMMENT ON FUNCTION public.launch_promopush_campaign(uuid,uuid) IS 'Server-only truthful launch boundary: validates actor, configuration, inventory reference, window and canonical Gem funding.';

NOTIFY pgrst, 'reload schema';
