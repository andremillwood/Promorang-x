-- People experience layer
-- Additive only. Reuses scenes (hubs), offers (perks), referrals, wallets,
-- PromoCards, and verified_actions. Does not replace those tables.

-- 1. Drop presentation over existing offers / perks / keys / points
CREATE TABLE IF NOT EXISTS public.community_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  creator_id uuid NOT NULL,
  scene_id uuid REFERENCES public.scenes(id) ON DELETE SET NULL,
  offer_id uuid,
  perk_kind text NOT NULL DEFAULT 'custom'
    CHECK (perk_kind IN (
      'free_entry', 'discount', 'complimentary', 'priority',
      'invitation', 'points', 'promokey', 'merchant', 'custom'
    )),
  title text NOT NULL,
  description text,
  image_url text,
  audience text NOT NULL DEFAULT 'everyone'
    CHECK (audience IN ('everyone', 'most_active', 'first_x', 'specific', 'complete_something')),
  audience_limit integer CHECK (audience_limit IS NULL OR audience_limit > 0),
  remaining integer,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'paused', 'exhausted', 'ended')),
  claim_message text,
  attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_drops_creator
  ON public.community_drops(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_drops_scene
  ON public.community_drops(scene_id, status);
CREATE INDEX IF NOT EXISTS idx_community_drops_status
  ON public.community_drops(status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.community_drop_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES public.community_drops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  referrer_id uuid,
  scene_id uuid REFERENCES public.scenes(id) ON DELETE SET NULL,
  offer_issuance_id uuid,
  status text NOT NULL DEFAULT 'claimed'
    CHECK (status IN ('claimed', 'redeemed', 'expired', 'cancelled')),
  claimed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (drop_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_drop_claims_user
  ON public.community_drop_claims(user_id, claimed_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_drop_claims_referrer
  ON public.community_drop_claims(referrer_id, claimed_at DESC);

-- 2. First-touch attribution: who brought whom into a Scene/Hub
CREATE TABLE IF NOT EXISTS public.hub_member_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
  member_user_id uuid NOT NULL,
  attributed_by_user_id uuid NOT NULL,
  source text NOT NULL DEFAULT 'invite'
    CHECK (source IN ('invite', 'link', 'qr', 'discovery', 'drop', 'promokey', 'moment', 'referral')),
  source_entity_type text,
  source_entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scene_id, member_user_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_attr_contributor
  ON public.hub_member_attributions(attributed_by_user_id, scene_id);
CREATE INDEX IF NOT EXISTS idx_hub_attr_member
  ON public.hub_member_attributions(member_user_id);

-- 3. Present existing offer inventory as a Drop without a new asset type
ALTER TABLE public.offer_distributions
  ADD COLUMN IF NOT EXISTS presentation_mode text NOT NULL DEFAULT 'standard';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'offer_distributions_presentation_mode_check'
  ) THEN
    ALTER TABLE public.offer_distributions
      ADD CONSTRAINT offer_distributions_presentation_mode_check
      CHECK (presentation_mode IN ('standard', 'drop', 'flash', 'invite'));
  END IF;
END $$;

-- 4. Attribution context on existing verified_actions (nullable, additive)
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS scene_id uuid;
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS contributor_id uuid;
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS referrer_id uuid;
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS moment_id uuid;
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS campaign_id uuid;
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS merchant_id uuid;
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS drop_id uuid;
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS amount numeric(14,2);
ALTER TABLE public.verified_actions ADD COLUMN IF NOT EXISTS verification_method text;

CREATE INDEX IF NOT EXISTS idx_verified_actions_scene
  ON public.verified_actions(scene_id, verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_verified_actions_contributor
  ON public.verified_actions(contributor_id, verified_at DESC);

-- 5. Scene contributor role without ownership (reuse scene_members when present)
ALTER TABLE public.scene_members
  ADD COLUMN IF NOT EXISTS invited_by uuid;
ALTER TABLE public.scene_members
  ADD COLUMN IF NOT EXISTS can_distribute boolean NOT NULL DEFAULT false;
ALTER TABLE public.scene_members
  ADD COLUMN IF NOT EXISTS verified_actions_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.scene_members
  ADD COLUMN IF NOT EXISTS attributed_value numeric(14,2) NOT NULL DEFAULT 0;

COMMENT ON TABLE public.community_drops IS
  'User-facing Drop presentation over existing offers, keys, points, and invitations.';
COMMENT ON TABLE public.hub_member_attributions IS
  'First-touch who-brought-whom inside a Scene/Hub. Complements global user_referrals.';

ALTER TABLE public.community_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_drop_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_member_attributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_drops_public_read ON public.community_drops;
CREATE POLICY community_drops_public_read ON public.community_drops
  FOR SELECT USING (status = 'active' OR creator_id = auth.uid());

DROP POLICY IF EXISTS community_drops_creator_write ON public.community_drops;
CREATE POLICY community_drops_creator_write ON public.community_drops
  FOR ALL USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS community_drop_claims_own ON public.community_drop_claims;
CREATE POLICY community_drop_claims_own ON public.community_drop_claims
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.community_drops d
      WHERE d.id = drop_id AND d.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS community_drop_claims_insert ON public.community_drop_claims;
CREATE POLICY community_drop_claims_insert ON public.community_drop_claims
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS hub_attr_read ON public.hub_member_attributions;
CREATE POLICY hub_attr_read ON public.hub_member_attributions
  FOR SELECT USING (
    member_user_id = auth.uid()
    OR attributed_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.scene_members sm
      WHERE sm.scene_id = hub_member_attributions.scene_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('operator', 'steward', 'contributor')
    )
  );

DROP POLICY IF EXISTS hub_attr_insert ON public.hub_member_attributions;
CREATE POLICY hub_attr_insert ON public.hub_member_attributions
  FOR INSERT WITH CHECK (attributed_by_user_id = auth.uid() OR member_user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.community_drops TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.community_drop_claims TO authenticated, service_role;
GRANT SELECT, INSERT ON public.hub_member_attributions TO authenticated, service_role;
GRANT SELECT ON public.community_drops TO anon;
