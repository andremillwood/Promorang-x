-- Impact Economy Schema
-- Viral rewards, catalyst hierarchy, early mover bonuses, passive yield

-- Catalyst tiers define influence multipliers and bonus eligibility
CREATE TABLE IF NOT EXISTS public.catalyst_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_level integer NOT NULL UNIQUE,
  name text NOT NULL,
  min_direct_conversions integer NOT NULL DEFAULT 0,
  min_network_conversions integer NOT NULL DEFAULT 0,
  viral_reward_multiplier numeric(4,2) NOT NULL DEFAULT 1.00,
  early_mover_bonus_percent numeric(5,2) NOT NULL DEFAULT 0.00,
  passive_yield_percent numeric(5,2) NOT NULL DEFAULT 0.00,
  max_yield_per_moment numeric(12,2) NOT NULL DEFAULT 0.00,
  perks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed catalyst tiers
INSERT INTO public.catalyst_tiers (
  tier_level, name, min_direct_conversions, min_network_conversions,
  viral_reward_multiplier, early_mover_bonus_percent, passive_yield_percent, max_yield_per_moment, perks
) VALUES
  (1, 'Spark', 0, 0, 1.00, 0.00, 0.00, 0.00, '["basic_sharing"]'),
  (2, 'Ignite', 3, 10, 1.25, 5.00, 2.50, 5.00, '["boosted_sharing", "early_access"]'),
  (3, 'Amplify', 10, 50, 1.50, 10.00, 5.00, 15.00, '["priority_placement", "bonus_keys"]'),
  (4, 'Viral', 25, 200, 2.00, 15.00, 7.50, 50.00, '["revenue_share", "exclusive_moments"]'),
  (5, 'Legend', 100, 1000, 3.00, 20.00, 10.00, 200.00, '["co_creation", "brand_deals", "guaranteed_yield"]')
ON CONFLICT (tier_level) DO UPDATE SET
  name = EXCLUDED.name,
  viral_reward_multiplier = EXCLUDED.viral_reward_multiplier,
  early_mover_bonus_percent = EXCLUDED.early_mover_bonus_percent,
  passive_yield_percent = EXCLUDED.passive_yield_percent;

-- User catalyst status tracking
CREATE TABLE IF NOT EXISTS public.user_catalyst_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_tier_id uuid REFERENCES public.catalyst_tiers(id) ON DELETE SET NULL,
  current_tier_level integer NOT NULL DEFAULT 1,
  
  -- Conversion tracking
  lifetime_direct_conversions integer NOT NULL DEFAULT 0,
  lifetime_network_conversions integer NOT NULL DEFAULT 0,
  lifetime_viral_rewards_earned numeric(12,4) NOT NULL DEFAULT 0.0000,
  lifetime_early_mover_bonuses numeric(12,4) NOT NULL DEFAULT 0.0000,
  lifetime_passive_yield_earned numeric(12,4) NOT NULL DEFAULT 0.0000,
  
  -- Current period metrics (reset monthly)
  period_direct_conversions integer NOT NULL DEFAULT 0,
  period_network_conversions integer NOT NULL DEFAULT 0,
  period_starts_at timestamptz NOT NULL DEFAULT now(),
  
  -- Passive yield tracking
  active_yield_moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  active_yield_started_at timestamptz,
  active_yield_base_amount numeric(12,4) NOT NULL DEFAULT 0.0000,
  
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Viral share tree - tracks the referral cascade
CREATE TABLE IF NOT EXISTS public.viral_share_trees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  root_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES public.content_items(id) ON DELETE CASCADE,
  moment_id uuid REFERENCES public.moments(id) ON DELETE CASCADE,
  mission_link_id uuid REFERENCES public.content_moment_links(id) ON DELETE CASCADE,
  
  -- Tree depth tracking
  max_depth_reached integer NOT NULL DEFAULT 0,
  total_nodes integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  
  -- Rewards distributed
  total_viral_rewards_paid numeric(12,4) NOT NULL DEFAULT 0.0000,
  is_active boolean NOT NULL DEFAULT true,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Individual viral share links (edges in the tree)
CREATE TABLE IF NOT EXISTS public.viral_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id uuid NOT NULL REFERENCES public.viral_share_trees(id) ON DELETE CASCADE,
  parent_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- NULL if anonymous
  share_depth integer NOT NULL DEFAULT 1,
  
  -- Conversion tracking
  converted_at timestamptz,
  converted_moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  
  -- Rewards
  viral_reward_amount numeric(12,4),
  reward_paid_at timestamptz,
  
  -- Attribution path
  attribution_path uuid[] NOT NULL DEFAULT '{}',
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Early mover bonuses - track first N joiners per moment
CREATE TABLE IF NOT EXISTS public.early_mover_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Position and bonus
  join_position integer NOT NULL,
  total_early_slots integer NOT NULL,
  bonus_percent numeric(5,2) NOT NULL,
  bonus_points integer NOT NULL DEFAULT 0,
  bonus_keys numeric(6,2) NOT NULL DEFAULT 0.00,
  
  -- Status
  claimed_at timestamptz,
  expires_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (moment_id, user_id)
);

-- Passive yield claims - track proven participant rewards
CREATE TABLE IF NOT EXISTS public.passive_yield_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  catalyst_status_id uuid NOT NULL REFERENCES public.user_catalyst_status(id) ON DELETE CASCADE,
  
  -- Yield calculation
  base_amount numeric(12,4) NOT NULL,
  yield_percent numeric(5,2) NOT NULL,
  yield_amount numeric(12,4) NOT NULL,
  currency text NOT NULL DEFAULT 'points',
  
  -- Claim status
  claimed_at timestamptz NOT NULL DEFAULT now(),
  claim_method text NOT NULL DEFAULT 'auto' CHECK (claim_method IN ('auto', 'manual', 'scheduled')),
  
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Viral reward calculation log (for transparency)
CREATE TABLE IF NOT EXISTS public.viral_reward_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id uuid NOT NULL REFERENCES public.viral_share_trees(id) ON DELETE CASCADE,
  link_id uuid NOT NULL REFERENCES public.viral_share_links(id) ON DELETE CASCADE,
  beneficiary_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Calculation inputs
  base_reward numeric(12,4) NOT NULL,
  catalyst_multiplier numeric(4,2) NOT NULL DEFAULT 1.00,
  depth_decay_factor numeric(4,2) NOT NULL DEFAULT 1.00,
  calculated_reward numeric(12,4) NOT NULL,
  
  -- Distribution
  distributed_at timestamptz,
  distribution_method text NOT NULL DEFAULT 'points' CHECK (distribution_method IN ('points', 'keys', 'usd', 'credit')),
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_catalyst_status_user ON public.user_catalyst_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_catalyst_status_tier ON public.user_catalyst_status(current_tier_level);

CREATE INDEX IF NOT EXISTS idx_viral_share_trees_root ON public.viral_share_trees(root_user_id);
CREATE INDEX IF NOT EXISTS idx_viral_share_trees_moment ON public.viral_share_trees(moment_id);
CREATE INDEX IF NOT EXISTS idx_viral_share_trees_active ON public.viral_share_trees(is_active);

CREATE INDEX IF NOT EXISTS idx_viral_share_links_tree ON public.viral_share_links(tree_id);
CREATE INDEX IF NOT EXISTS idx_viral_share_links_parent ON public.viral_share_links(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_viral_share_links_child ON public.viral_share_links(child_user_id);

CREATE INDEX IF NOT EXISTS idx_early_mover_bonuses_moment ON public.early_mover_bonuses(moment_id);
CREATE INDEX IF NOT EXISTS idx_early_mover_bonuses_user ON public.early_mover_bonuses(user_id);

CREATE INDEX IF NOT EXISTS idx_passive_yield_claims_user ON public.passive_yield_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_passive_yield_claims_moment ON public.passive_yield_claims(moment_id);

-- RLS Policies
ALTER TABLE public.catalyst_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_catalyst_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_share_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_mover_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passive_yield_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_reward_calculations ENABLE ROW LEVEL SECURITY;

-- Everyone can read catalyst tiers
CREATE POLICY "Catalyst tiers readable by all"
  ON public.catalyst_tiers FOR SELECT TO authenticated, anon USING (true);

-- Users can only see their own catalyst status
CREATE POLICY "User catalyst status readable by owner"
  ON public.user_catalyst_status FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Viral trees readable by participants
CREATE POLICY "Viral trees readable by root user"
  ON public.viral_share_trees FOR SELECT TO authenticated
  USING (root_user_id = auth.uid());

-- Viral links readable by participants
CREATE POLICY "Viral links readable by parent or child"
  ON public.viral_share_links FOR SELECT TO authenticated
  USING (parent_user_id = auth.uid() OR child_user_id = auth.uid());

-- Early mover bonuses readable by recipient
CREATE POLICY "Early mover bonuses readable by recipient"
  ON public.early_mover_bonuses FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Passive yield claims readable by claimant
CREATE POLICY "Passive yield claims readable by claimant"
  ON public.passive_yield_claims FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Functions

-- Calculate appropriate catalyst tier for a user
CREATE OR REPLACE FUNCTION public.calculate_catalyst_tier(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_direct_conversions integer;
  v_network_conversions integer;
  v_tier_id uuid;
BEGIN
  -- Get current counts from catalyst status
  SELECT 
    COALESCE(lifetime_direct_conversions, 0),
    COALESCE(lifetime_network_conversions, 0)
  INTO v_direct_conversions, v_network_conversions
  FROM public.user_catalyst_status
  WHERE user_id = p_user_id;
  
  -- Default to 0 if no status record
  v_direct_conversions := COALESCE(v_direct_conversions, 0);
  v_network_conversions := COALESCE(v_network_conversions, 0);
  
  -- Find highest qualifying tier
  SELECT id INTO v_tier_id
  FROM public.catalyst_tiers
  WHERE min_direct_conversions <= v_direct_conversions
    AND min_network_conversions <= v_network_conversions
  ORDER BY tier_level DESC
  LIMIT 1;
  
  RETURN COALESCE(v_tier_id, 
    (SELECT id FROM public.catalyst_tiers WHERE tier_level = 1)
  );
END;
$$;

-- Initialize or update user catalyst status
CREATE OR REPLACE FUNCTION public.initialize_user_catalyst_status(p_user_id uuid)
RETURNS public.user_catalyst_status
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status public.user_catalyst_status;
  v_tier_id uuid;
BEGIN
  -- Calculate current tier
  v_tier_id := public.calculate_catalyst_tier(p_user_id);
  
  -- Insert or update
  INSERT INTO public.user_catalyst_status (
    user_id, current_tier_id, current_tier_level
  )
  SELECT 
    p_user_id, v_tier_id, ct.tier_level
  FROM public.catalyst_tiers ct
  WHERE ct.id = v_tier_id
  ON CONFLICT (user_id) DO UPDATE SET
    current_tier_id = EXCLUDED.current_tier_id,
    current_tier_level = (SELECT tier_level FROM public.catalyst_tiers WHERE id = v_tier_id),
    updated_at = now()
  RETURNING * INTO v_status;
  
  RETURN v_status;
END;
$$;

-- Record a viral share and create the tree/link structure
CREATE OR REPLACE FUNCTION public.record_viral_share(
  p_sharer_user_id uuid,
  p_content_item_id uuid DEFAULT NULL,
  p_moment_id uuid DEFAULT NULL,
  p_mission_link_id uuid DEFAULT NULL,
  p_parent_share_link_id uuid DEFAULT NULL,
  p_recipient_identifier text DEFAULT NULL -- email, phone, etc
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tree_id uuid;
  v_link_id uuid;
  v_parent_link public.viral_share_links;
  v_depth integer := 1;
  v_tree public.viral_share_trees;
BEGIN
  -- If parent link provided, get tree and calculate depth
  IF p_parent_share_link_id IS NOT NULL THEN
    SELECT * INTO v_parent_link
    FROM public.viral_share_links
    WHERE id = p_parent_share_link_id;
    
    IF FOUND THEN
      v_tree_id := v_parent_link.tree_id;
      v_depth := v_parent_link.share_depth + 1;
    END IF;
  END IF;
  
  -- Create new tree if no parent
  IF v_tree_id IS NULL THEN
    INSERT INTO public.viral_share_trees (
      root_user_id, content_item_id, moment_id, mission_link_id
    ) VALUES (
      p_sharer_user_id, p_content_item_id, p_moment_id, p_mission_link_id
    )
    RETURNING * INTO v_tree;
    
    v_tree_id := v_tree.id;
    
    -- Initialize catalyst status for root if needed
    PERFORM public.initialize_user_catalyst_status(p_sharer_user_id);
  END IF;
  
  -- Create the share link
  INSERT INTO public.viral_share_links (
    tree_id, parent_user_id, share_depth, attribution_path
  ) VALUES (
    v_tree_id,
    p_sharer_user_id,
    v_depth,
    CASE 
      WHEN v_parent_link.attribution_path IS NOT NULL 
      THEN v_parent_link.attribution_path || p_sharer_user_id
      ELSE ARRAY[p_sharer_user_id]
    END
  )
  RETURNING id INTO v_link_id;
  
  -- Update tree stats
  UPDATE public.viral_share_trees
  SET total_nodes = total_nodes + 1,
      max_depth_reached = GREATEST(max_depth_reached, v_depth),
      updated_at = now()
  WHERE id = v_tree_id;
  
  RETURN v_link_id;
END;
$$;

-- Calculate and distribute viral reward when conversion happens
CREATE OR REPLACE FUNCTION public.calculate_viral_reward(
  p_share_link_id uuid,
  p_conversion_value numeric DEFAULT 1.00
)
RETURNS TABLE (rewarded_user_id uuid, reward_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link public.viral_share_links;
  v_tree public.viral_share_trees;
  v_user_id uuid;
  v_depth integer := 0;
  v_max_depth integer := 3; -- Pay up to 3 levels deep
  v_base_reward numeric := p_conversion_value * 0.10; -- 10% of conversion value
  v_decay numeric := 0.50; -- 50% decay per level
  v_catalyst_multiplier numeric;
  v_current_reward numeric;
BEGIN
  -- Get the share link that led to this conversion
  SELECT * INTO v_link
  FROM public.viral_share_links
  WHERE id = p_share_link_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get tree info
  SELECT * INTO v_tree
  FROM public.viral_share_trees
  WHERE id = v_link.tree_id;
  
  -- Walk up the attribution path and reward each level
  FOR v_user_id IN 
    SELECT unnest(v_link.attribution_path)
  LOOP
    EXIT WHEN v_depth >= v_max_depth;
    
    -- Get catalyst multiplier for this user
    SELECT COALESCE(ct.viral_reward_multiplier, 1.00)
    INTO v_catalyst_multiplier
    FROM public.user_catalyst_status ucs
    JOIN public.catalyst_tiers ct ON ct.id = ucs.current_tier_id
    WHERE ucs.user_id = v_user_id;
    
    v_catalyst_multiplier := COALESCE(v_catalyst_multiplier, 1.00);
    
    -- Calculate decayed reward
    v_current_reward := v_base_reward * POWER(v_decay, v_depth) * v_catalyst_multiplier;
    
    -- Record the reward calculation
    INSERT INTO public.viral_reward_calculations (
      tree_id, link_id, beneficiary_user_id,
      base_reward, catalyst_multiplier, depth_decay_factor, calculated_reward
    ) VALUES (
      v_link.tree_id, v_link.id, v_user_id,
      v_base_reward, v_catalyst_multiplier, POWER(v_decay, v_depth), v_current_reward
    );
    
    -- Return the reward info
    RETURN QUERY SELECT v_user_id, v_current_reward;
    
    -- Update catalyst status viral rewards earned
    UPDATE public.user_catalyst_status
    SET lifetime_viral_rewards_earned = lifetime_viral_rewards_earned + v_current_reward,
        updated_at = now()
    WHERE user_id = v_user_id;
    
    v_depth := v_depth + 1;
  END LOOP;
END;
$$;

-- Process viral conversion (called when someone joins from a share)
CREATE OR REPLACE FUNCTION public.process_viral_conversion(
  p_share_link_id uuid,
  p_converted_user_id uuid,
  p_moment_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link public.viral_share_links;
BEGIN
  -- Update the share link with conversion info
  UPDATE public.viral_share_links
  SET child_user_id = p_converted_user_id,
      converted_at = now(),
      converted_moment_id = p_moment_id,
      updated_at = now()
  WHERE id = p_share_link_id
  RETURNING * INTO v_link;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update tree conversion count
  UPDATE public.viral_share_trees
  SET total_conversions = total_conversions + 1,
      updated_at = now()
  WHERE id = v_link.tree_id;
  
  -- Calculate and record viral rewards
  PERFORM public.calculate_viral_reward(p_share_link_id);
  
  -- Update parent's direct conversion count
  UPDATE public.user_catalyst_status
  SET lifetime_direct_conversions = lifetime_direct_conversions + 1,
      period_direct_conversions = period_direct_conversions + 1,
      updated_at = now()
  WHERE user_id = v_link.parent_user_id;
  
  -- Update ancestors' network conversion counts
  UPDATE public.user_catalyst_status
  SET lifetime_network_conversions = lifetime_network_conversions + 1,
      period_network_conversions = period_network_conversions + 1,
      updated_at = now()
  WHERE user_id = ANY(v_link.attribution_path)
    AND user_id != v_link.parent_user_id;
  
  -- Recalculate tiers for affected users
  PERFORM public.initialize_user_catalyst_status(v_link.parent_user_id);
  PERFORM public.initialize_user_catalyst_status(uid)
  FROM unnest(v_link.attribution_path) AS uid
  WHERE uid != v_link.parent_user_id;
  
  RETURN true;
END;
$$;

-- Award early mover bonus
CREATE OR REPLACE FUNCTION public.award_early_mover_bonus(
  p_moment_id uuid,
  p_user_id uuid,
  p_join_position integer,
  p_total_slots integer DEFAULT 50
)
RETURNS public.early_mover_bonuses
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus public.early_mover_bonuses;
  v_bonus_percent numeric;
  v_catalyst_tier public.catalyst_tiers;
BEGIN
  -- Only first N joiners get bonuses
  IF p_join_position > p_total_slots THEN
    RETURN NULL;
  END IF;
  
  -- Calculate bonus percent based on position (decays linearly)
  v_bonus_percent := 20.00 * (1.0 - (p_join_position::numeric / p_total_slots::numeric));
  
  -- Get catalyst early mover bonus boost
  SELECT ct.* INTO v_catalyst_tier
  FROM public.user_catalyst_status ucs
  JOIN public.catalyst_tiers ct ON ct.id = ucs.current_tier_id
  WHERE ucs.user_id = p_user_id;
  
  IF FOUND AND v_catalyst_tier.early_mover_bonus_percent > 0 THEN
    v_bonus_percent := v_bonus_percent + v_catalyst_tier.early_mover_bonus_percent;
  END IF;
  
  -- Create the bonus record
  INSERT INTO public.early_mover_bonuses (
    moment_id, user_id, join_position, total_early_slots,
    bonus_percent, bonus_points, bonus_keys, expires_at
  ) VALUES (
    p_moment_id, p_user_id, p_join_position, p_total_slots,
    v_bonus_percent,
    (100 * v_bonus_percent / 100)::integer, -- 100 base points scaled by bonus
    (1.00 * v_bonus_percent / 100), -- 1 key base scaled by bonus
    now() + interval '7 days' -- Claim within 7 days
  )
  ON CONFLICT (moment_id, user_id) DO NOTHING
  RETURNING * INTO v_bonus;
  
  RETURN v_bonus;
END;
$$;

-- Claim passive yield for a proven participant
CREATE OR REPLACE FUNCTION public.claim_passive_yield(
  p_user_id uuid,
  p_moment_id uuid,
  p_claim_method text DEFAULT 'manual'
)
RETURNS public.passive_yield_claims
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim public.passive_yield_claims;
  v_catalyst_status public.user_catalyst_status;
  v_catalyst_tier public.catalyst_tiers;
  v_base_amount numeric := 100.00; -- Base 100 points
  v_yield_amount numeric;
BEGIN
  -- Get catalyst status
  SELECT * INTO v_catalyst_status
  FROM public.user_catalyst_status
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User catalyst status not found';
  END IF;
  
  -- Get catalyst tier info
  SELECT * INTO v_catalyst_tier
  FROM public.catalyst_tiers
  WHERE id = v_catalyst_status.current_tier_id;
  
  IF NOT FOUND OR v_catalyst_tier.passive_yield_percent <= 0 THEN
    RAISE EXCEPTION 'User does not qualify for passive yield';
  END IF;
  
  -- Calculate yield amount
  v_yield_amount := LEAST(
    v_base_amount * (v_catalyst_tier.passive_yield_percent / 100),
    v_catalyst_tier.max_yield_per_moment
  );
  
  -- Create claim record
  INSERT INTO public.passive_yield_claims (
    user_id, moment_id, catalyst_status_id,
    base_amount, yield_percent, yield_amount, currency, claim_method
  ) VALUES (
    p_user_id, p_moment_id, v_catalyst_status.id,
    v_base_amount, v_catalyst_tier.passive_yield_percent, v_yield_amount, 'points', p_claim_method
  )
  RETURNING * INTO v_claim;
  
  -- Update catalyst status passive yield earned
  UPDATE public.user_catalyst_status
  SET lifetime_passive_yield_earned = lifetime_passive_yield_earned + v_yield_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- TODO: Credit points to user balance
  -- This would integrate with the existing points system
  
  RETURN v_claim;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_impact_economy_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_catalyst_tiers_timestamp
  BEFORE UPDATE ON public.catalyst_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_impact_economy_timestamps();

CREATE TRIGGER update_user_catalyst_status_timestamp
  BEFORE UPDATE ON public.user_catalyst_status
  FOR EACH ROW EXECUTE FUNCTION public.update_impact_economy_timestamps();

CREATE TRIGGER update_viral_share_trees_timestamp
  BEFORE UPDATE ON public.viral_share_trees
  FOR EACH ROW EXECUTE FUNCTION public.update_impact_economy_timestamps();

CREATE TRIGGER update_viral_share_links_timestamp
  BEFORE UPDATE ON public.viral_share_links
  FOR EACH ROW EXECUTE FUNCTION public.update_impact_economy_timestamps();

CREATE TRIGGER update_early_mover_bonuses_timestamp
  BEFORE UPDATE ON public.early_mover_bonuses
  FOR EACH ROW EXECUTE FUNCTION public.update_impact_economy_timestamps();

NOTIFY pgrst, 'reload schema';
