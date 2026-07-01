-- Standalone content distribution engine.
-- Content distribution is first-class and can optionally connect to Moments.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.content_distribution_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sponsor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  linked_moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  objective_type text NOT NULL DEFAULT 'engagement'
    CHECK (objective_type IN ('awareness', 'engagement', 'share', 'signup', 'sale', 'content_launch', 'custom')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  reward_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  promoshare_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  attribution_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  budget_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (budget_amount >= 0),
  budget_currency text NOT NULL DEFAULT 'USD',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_distribution_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.content_distribution_campaigns(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  asset_type text NOT NULL DEFAULT 'content'
    CHECK (asset_type IN ('content', 'link', 'image', 'video', 'text', 'audio', 'other')),
  target_url text,
  media_url text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  attribution_slug text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, attribution_slug)
);

CREATE TABLE IF NOT EXISTS public.content_distribution_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.content_distribution_campaigns(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES public.content_distribution_assets(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  parent_action_id uuid REFERENCES public.content_distribution_actions(id) ON DELETE SET NULL,
  action_type text NOT NULL
    CHECK (action_type IN ('impression', 'view', 'click', 'engage', 'share', 'repost', 'comment', 'save', 'signup', 'conversion', 'purchase', 'proof_verified')),
  channel text,
  attribution_code text,
  source_url text,
  destination_url text,
  value_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (value_amount >= 0),
  value_currency text NOT NULL DEFAULT 'USD',
  promoshare_entries_awarded integer NOT NULL DEFAULT 0 CHECK (promoshare_entries_awarded >= 0),
  points_awarded integer NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  verified boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_distribution_user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.content_distribution_campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  first_action_at timestamptz,
  last_action_at timestamptz,
  impressions_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  clicks_count integer NOT NULL DEFAULT 0,
  engagements_count integer NOT NULL DEFAULT 0,
  shares_count integer NOT NULL DEFAULT 0,
  conversions_count integer NOT NULL DEFAULT 0,
  verified_actions_count integer NOT NULL DEFAULT 0,
  points_earned integer NOT NULL DEFAULT 0,
  promoshare_entries_earned integer NOT NULL DEFAULT 0,
  distribution_score numeric(14,4) NOT NULL DEFAULT 0,
  rank_position integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.content_distribution_reward_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.content_distribution_campaigns(id) ON DELETE CASCADE,
  action_id uuid REFERENCES public.content_distribution_actions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_type text NOT NULL CHECK (reward_type IN ('points', 'promoshare_entry', 'gems', 'coupon', 'cash', 'other')),
  reward_amount numeric(14,4) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'reversed', 'failed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_distribution_campaigns_status
  ON public.content_distribution_campaigns(status, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_distribution_campaigns_owner
  ON public.content_distribution_campaigns(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_distribution_campaigns_moment
  ON public.content_distribution_campaigns(linked_moment_id)
  WHERE linked_moment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_distribution_assets_campaign
  ON public.content_distribution_assets(campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_content_distribution_actions_campaign_created
  ON public.content_distribution_actions(campaign_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_distribution_actions_user
  ON public.content_distribution_actions(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_distribution_user_stats_campaign_score
  ON public.content_distribution_user_stats(campaign_id, distribution_score DESC);

ALTER TABLE public.content_distribution_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_distribution_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_distribution_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_distribution_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_distribution_reward_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active content distribution campaigns are public" ON public.content_distribution_campaigns;
CREATE POLICY "Active content distribution campaigns are public"
  ON public.content_distribution_campaigns FOR SELECT
  USING (status = 'active' OR owner_id = auth.uid() OR sponsor_id = auth.uid());

DROP POLICY IF EXISTS "Owners manage content distribution campaigns" ON public.content_distribution_campaigns;
CREATE POLICY "Owners manage content distribution campaigns"
  ON public.content_distribution_campaigns FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Active content distribution assets are public" ON public.content_distribution_assets;
CREATE POLICY "Active content distribution assets are public"
  ON public.content_distribution_assets FOR SELECT
  USING (
    status = 'active'
    OR EXISTS (
      SELECT 1 FROM public.content_distribution_campaigns c
      WHERE c.id = campaign_id AND (c.owner_id = auth.uid() OR c.sponsor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners manage content distribution assets" ON public.content_distribution_assets;
CREATE POLICY "Owners manage content distribution assets"
  ON public.content_distribution_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.content_distribution_campaigns c
      WHERE c.id = campaign_id AND c.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.content_distribution_campaigns c
      WHERE c.id = campaign_id AND c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users view own content distribution actions" ON public.content_distribution_actions;
CREATE POLICY "Users view own content distribution actions"
  ON public.content_distribution_actions FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.content_distribution_campaigns c
      WHERE c.id = campaign_id AND (c.owner_id = auth.uid() OR c.sponsor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users insert own content distribution actions" ON public.content_distribution_actions;
CREATE POLICY "Users insert own content distribution actions"
  ON public.content_distribution_actions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Users view own content distribution stats" ON public.content_distribution_user_stats;
CREATE POLICY "Users view own content distribution stats"
  ON public.content_distribution_user_stats FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.content_distribution_campaigns c
      WHERE c.id = campaign_id AND (c.owner_id = auth.uid() OR c.sponsor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users view own content distribution rewards" ON public.content_distribution_reward_ledger;
CREATE POLICY "Users view own content distribution rewards"
  ON public.content_distribution_reward_ledger FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.content_distribution_campaigns c
      WHERE c.id = campaign_id AND (c.owner_id = auth.uid() OR c.sponsor_id = auth.uid())
    )
  );

NOTIFY pgrst, 'reload schema';
