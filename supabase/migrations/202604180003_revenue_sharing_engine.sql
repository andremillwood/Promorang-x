-- Revenue Sharing Engine
-- Automatic earnings calculation when mission attributions are verified

-- Function to calculate creator earnings from an attribution event
CREATE OR REPLACE FUNCTION public.calculate_creator_earnings(
  p_creator_id uuid,
  p_source_type public.creator_revenue_source,
  p_mission_link_id uuid DEFAULT NULL,
  p_content_item_id uuid DEFAULT NULL,
  p_brand_id uuid DEFAULT NULL
)
RETURNS TABLE (
  revshare_percent numeric,
  fixed_amount numeric,
  unit_amount numeric,
  currency text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_creator_profile public.creator_economic_profiles;
  v_specific_rule public.creator_revenue_share_rules;
  v_default_percent numeric;
BEGIN
  -- Get creator profile for default revshare
  SELECT * INTO v_creator_profile
  FROM public.creator_economic_profiles
  WHERE user_id = p_creator_id;
  
  v_default_percent := COALESCE(v_creator_profile.default_revshare_percent, 10.00);
  
  -- Look for specific rule (most specific wins)
  -- Priority: mission_link > content_item > brand > creator default
  
  -- Check mission link specific rule
  IF p_mission_link_id IS NOT NULL THEN
    SELECT * INTO v_specific_rule
    FROM public.creator_revenue_share_rules
    WHERE mission_link_id = p_mission_link_id
      AND creator_id = p_creator_id
      AND source_type = p_source_type
      AND is_active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (expires_at IS NULL OR expires_at >= now())
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Check content item specific rule
  IF v_specific_rule.id IS NULL AND p_content_item_id IS NOT NULL THEN
    SELECT * INTO v_specific_rule
    FROM public.creator_revenue_share_rules
    WHERE content_item_id = p_content_item_id
      AND creator_id = p_creator_id
      AND source_type = p_source_type
      AND is_active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (expires_at IS NULL OR expires_at >= now())
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Check brand-specific rule
  IF v_specific_rule.id IS NULL AND p_brand_id IS NOT NULL THEN
    SELECT * INTO v_specific_rule
    FROM public.creator_revenue_share_rules
    WHERE brand_id = p_brand_id
      AND creator_id = p_creator_id
      AND source_type = p_source_type
      AND is_active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (expires_at IS NULL OR expires_at >= now())
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Check creator default rule for this source type
  IF v_specific_rule.id IS NULL THEN
    SELECT * INTO v_specific_rule
    FROM public.creator_revenue_share_rules
    WHERE creator_id = p_creator_id
      AND source_type = p_source_type
      AND mission_link_id IS NULL
      AND content_item_id IS NULL
      AND brand_id IS NULL
      AND is_active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (expires_at IS NULL OR expires_at >= now())
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Return the appropriate rates
  IF v_specific_rule.id IS NOT NULL THEN
    RETURN QUERY SELECT 
      v_specific_rule.revshare_percent,
      v_specific_rule.fixed_amount,
      COALESCE(v_specific_rule.fixed_amount, 0),
      'usd'::text;
  ELSE
    -- Use creator profile default
    RETURN QUERY SELECT 
      v_default_percent,
      NULL::numeric,
      0::numeric,
      'usd'::text;
  END IF;
END;
$$;

-- Function to get base unit amount for a source type
CREATE OR REPLACE FUNCTION public.get_base_unit_amount(
  p_source_type public.creator_revenue_source
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN CASE p_source_type
    WHEN 'mission_join' THEN 0.50
    WHEN 'mission_verification' THEN 1.00
    WHEN 'memory_issuance' THEN 2.00
    WHEN 'sponsored_boost' THEN 5.00
    WHEN 'catalyst_conversion' THEN 3.00
    ELSE 0.50
  END;
END;
$$;

-- Main function to record creator earnings from mission attribution
CREATE OR REPLACE FUNCTION public.record_creator_earnings(
  p_mission_attribution_id uuid,
  p_source_type public.creator_revenue_source,
  p_unit_count integer DEFAULT 1
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attribution public.mission_attributions;
  v_creator_profile public.creator_economic_profiles;
  v_earnings_rate record;
  v_unit_amount numeric;
  v_gross_amount numeric;
  v_creator_share_amount numeric;
  v_ledger_id uuid;
BEGIN
  -- Get the mission attribution
  SELECT * INTO v_attribution
  FROM public.mission_attributions
  WHERE id = p_mission_attribution_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission attribution not found: %', p_mission_attribution_id;
  END IF;
  
  -- Get or create creator profile
  SELECT * INTO v_creator_profile
  FROM public.creator_economic_profiles
  WHERE user_id = v_attribution.user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.creator_economic_profiles (user_id)
    VALUES (v_attribution.user_id)
    RETURNING * INTO v_creator_profile;
  END IF;
  
  -- Calculate earnings rates
  SELECT * INTO v_earnings_rate
  FROM public.calculate_creator_earnings(
    v_attribution.user_id,
    p_source_type,
    v_attribution.mission_link_id,
    v_attribution.content_item_id,
    v_attribution.brand_id
  );
  
  -- Calculate amounts
  v_unit_amount := COALESCE(v_earnings_rate.fixed_amount, public.get_base_unit_amount(p_source_type));
  v_gross_amount := v_unit_amount * p_unit_count;
  v_creator_share_amount := v_gross_amount * (v_earnings_rate.revshare_percent / 100);
  
  -- Create earnings ledger entry
  INSERT INTO public.creator_earnings_ledger (
    creator_id,
    mission_attribution_id,
    mission_link_id,
    content_item_id,
    moment_id,
    brand_id,
    source_type,
    status,
    currency,
    unit_count,
    unit_amount,
    gross_amount,
    creator_share_percent,
    creator_share_amount
  ) VALUES (
    v_attribution.user_id,
    p_mission_attribution_id,
    v_attribution.mission_link_id,
    v_attribution.content_item_id,
    v_attribution.moment_id,
    v_attribution.brand_id,
    p_source_type,
    'pending',
    v_earnings_rate.currency,
    p_unit_count,
    v_unit_amount,
    v_gross_amount,
    v_earnings_rate.revshare_percent,
    v_creator_share_amount
  )
  RETURNING id INTO v_ledger_id;
  
  -- Update creator profile lifetime stats based on source type
  CASE p_source_type
    WHEN 'mission_verification' THEN
      UPDATE public.creator_economic_profiles
      SET lifetime_verified_unlocks = lifetime_verified_unlocks + p_unit_count,
          lifetime_momentum_value = lifetime_momentum_value + v_creator_share_amount,
          updated_at = now()
      WHERE user_id = v_attribution.user_id;
    WHEN 'memory_issuance' THEN
      UPDATE public.creator_economic_profiles
      SET lifetime_memories_issued = lifetime_memories_issued + p_unit_count,
          lifetime_momentum_value = lifetime_momentum_value + v_creator_share_amount,
          updated_at = now()
      WHERE user_id = v_attribution.user_id;
    WHEN 'catalyst_conversion' THEN
      UPDATE public.creator_economic_profiles
      SET lifetime_catalyst_conversions = lifetime_catalyst_conversions + p_unit_count,
          lifetime_momentum_value = lifetime_momentum_value + v_creator_share_amount,
          updated_at = now()
      WHERE user_id = v_attribution.user_id;
    ELSE
      UPDATE public.creator_economic_profiles
      SET lifetime_momentum_value = lifetime_momentum_value + v_creator_share_amount,
          updated_at = now()
      WHERE user_id = v_attribution.user_id;
  END CASE;
  
  RETURN v_ledger_id;
END;
$$;

-- Trigger function to auto-record earnings when attribution is verified
CREATE OR REPLACE FUNCTION public.on_mission_attribution_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only process when status changes to verified
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    -- Record verification earnings
    PERFORM public.record_creator_earnings(
      NEW.id,
      'mission_verification'::public.creator_revenue_source,
      1
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on mission_attributions
DROP TRIGGER IF EXISTS trg_mission_attribution_verified ON public.mission_attributions;
CREATE TRIGGER trg_mission_attribution_verified
  AFTER UPDATE ON public.mission_attributions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.on_mission_attribution_verified();

-- Function to approve pending earnings (called by admin/process)
CREATE OR REPLACE FUNCTION public.approve_creator_earnings(
  p_ledger_id uuid,
  p_approved_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ledger public.creator_earnings_ledger;
BEGIN
  -- Get the ledger entry
  SELECT * INTO v_ledger
  FROM public.creator_earnings_ledger
  WHERE id = p_ledger_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Earnings ledger entry not found: %', p_ledger_id;
  END IF;
  
  IF v_ledger.status != 'pending' THEN
    RAISE EXCEPTION 'Earnings entry must be pending to approve. Current status: %', v_ledger.status;
  END IF;
  
  -- Update to approved
  UPDATE public.creator_earnings_ledger
  SET status = 'approved',
      updated_at = now()
  WHERE id = p_ledger_id;
  
  RETURN true;
END;
$$;

-- Function to settle approved earnings (when payout is made)
CREATE OR REPLACE FUNCTION public.settle_creator_earnings(
  p_ledger_id uuid,
  p_payout_request_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ledger public.creator_earnings_ledger;
BEGIN
  -- Get the ledger entry
  SELECT * INTO v_ledger
  FROM public.creator_earnings_ledger
  WHERE id = p_ledger_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Earnings ledger entry not found: %', p_ledger_id;
  END IF;
  
  IF v_ledger.status != 'approved' THEN
    RAISE EXCEPTION 'Earnings entry must be approved to settle. Current status: %', v_ledger.status;
  END IF;
  
  -- Update to settled
  UPDATE public.creator_earnings_ledger
  SET status = 'settled',
      settled_at = now(),
      payout_request_id = p_payout_request_id,
      updated_at = now()
  WHERE id = p_ledger_id;
  
  RETURN true;
END;
$$;

-- Function to batch approve earnings by creator (for periodic processing)
CREATE OR REPLACE FUNCTION public.batch_approve_creator_earnings(
  p_creator_id uuid,
  p_max_amount numeric DEFAULT NULL
)
RETURNS TABLE (approved_count integer, approved_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer := 0;
  v_amount numeric := 0;
  v_ledger_id uuid;
BEGIN
  -- Approve pending earnings up to max_amount if specified
  FOR v_ledger_id IN
    SELECT id
    FROM public.creator_earnings_ledger
    WHERE creator_id = p_creator_id
      AND status = 'pending'
      AND (p_max_amount IS NULL OR 
           (SELECT COALESCE(SUM(creator_share_amount), 0) 
            FROM public.creator_earnings_ledger 
            WHERE creator_id = p_creator_id AND status = 'pending' AND id <= el.id) <= p_max_amount)
    ORDER BY created_at
  LOOP
    PERFORM public.approve_creator_earnings(v_ledger_id);
    v_count := v_count + 1;
    
    SELECT creator_share_amount INTO v_amount
    FROM public.creator_earnings_ledger
    WHERE id = v_ledger_id;
  END LOOP;
  
  RETURN QUERY SELECT v_count, v_amount;
END;
$$;

-- Seed default revenue share rules for existing creators (optional)
-- This ensures all creators have fair default rates
INSERT INTO public.creator_revenue_share_rules (
  creator_id,
  source_type,
  revshare_percent,
  is_active
)
SELECT 
  u.id,
  'mission_verification'::public.creator_revenue_source,
  15.00,
  true
FROM public.users u
LEFT JOIN public.creator_revenue_share_rules r 
  ON r.creator_id = u.id 
  AND r.source_type = 'mission_verification'
WHERE r.id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.content_items ci 
    WHERE ci.creator_id = u.id 
    LIMIT 1
  )
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
