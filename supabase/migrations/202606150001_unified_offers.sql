-- Unified business offers and reward distribution.
-- Keeps coupons, merchant products, Moments, content and PromoShare as adapters
-- while providing one inventory, issuance and redemption ledger.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  owner_type text NOT NULL DEFAULT 'business' CHECK (owner_type IN ('brand', 'merchant', 'venue', 'host', 'creator', 'business', 'platform')),
  title text NOT NULL,
  description text,
  terms text,
  image_url text,
  reward_type text NOT NULL CHECK (reward_type IN ('coupon', 'product', 'voucher', 'experience', 'cash', 'gems', 'points', 'keys', 'other')),
  fulfillment_type text NOT NULL DEFAULT 'code' CHECK (fulfillment_type IN ('code', 'qr', 'merchant_validation', 'automatic', 'manual', 'shipping')),
  value_amount numeric(14,2),
  value_currency text,
  coupon_id uuid,
  merchant_product_id uuid,
  venue_id uuid,
  quantity_total integer CHECK (quantity_total IS NULL OR quantity_total >= 0),
  quantity_reserved integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_redeemed integer NOT NULL DEFAULT 0 CHECK (quantity_redeemed >= 0),
  per_user_limit integer NOT NULL DEFAULT 1 CHECK (per_user_limit > 0),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  claim_expires_days integer NOT NULL DEFAULT 30 CHECK (claim_expires_days > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended', 'archived')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (quantity_total IS NULL OR quantity_reserved + quantity_redeemed <= quantity_total)
);

CREATE TABLE IF NOT EXISTS public.offer_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('direct', 'moment', 'content', 'promoshare', 'campaign', 'referral', 'manual')),
  trigger_event text NOT NULL,
  source_id text,
  source_label text,
  qualification_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  allocation_limit integer CHECK (allocation_limit IS NULL OR allocation_limit >= 0),
  allocation_count integer NOT NULL DEFAULT 0 CHECK (allocation_count >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_offer_distributions_unique_source
  ON public.offer_distributions(offer_id, channel, trigger_event, COALESCE(source_id, ''));

CREATE TABLE IF NOT EXISTS public.offer_issuances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  distribution_id uuid REFERENCES public.offer_distributions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_event_id text,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'claimed', 'redeemed', 'expired', 'cancelled', 'fulfillment_pending')),
  redemption_code text UNIQUE,
  fulfillment_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  issued_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  redeemed_at timestamptz,
  expires_at timestamptz,
  redeemed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_offer_issuances_event_once
  ON public.offer_issuances(offer_id, user_id, COALESCE(source_event_id, 'direct'));
CREATE INDEX IF NOT EXISTS idx_offer_issuances_user_status ON public.offer_issuances(user_id, status, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_offer_issuances_offer_status ON public.offer_issuances(offer_id, status, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_offer_distributions_lookup ON public.offer_distributions(channel, trigger_event, source_id) WHERE is_active;

CREATE TABLE IF NOT EXISTS public.offer_redemption_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_id uuid NOT NULL REFERENCES public.offer_issuances(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('issued', 'claimed', 'validation_attempted', 'redeemed', 'expired', 'cancelled', 'fulfillment_updated')),
  actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  venue_id uuid,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_redemption_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active offers" ON public.offers;
CREATE POLICY "Public can view active offers" ON public.offers FOR SELECT
  USING (status = 'active' AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now()) OR auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Owners manage offers" ON public.offers;
CREATE POLICY "Owners manage offers" ON public.offers FOR ALL
  USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users view own offer issuances" ON public.offer_issuances;
CREATE POLICY "Users view own offer issuances" ON public.offer_issuances FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.offers o WHERE o.id = offer_id AND o.owner_user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners view offer distributions" ON public.offer_distributions;
CREATE POLICY "Owners view offer distributions" ON public.offer_distributions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.offers o WHERE o.id = offer_id AND (o.status = 'active' OR o.owner_user_id = auth.uid())));

DROP POLICY IF EXISTS "Users view offer events" ON public.offer_redemption_events;
CREATE POLICY "Users view offer events" ON public.offer_redemption_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.offer_issuances i
    JOIN public.offers o ON o.id = i.offer_id
    WHERE i.id = issuance_id AND (i.user_id = auth.uid() OR o.owner_user_id = auth.uid())
  ));

CREATE OR REPLACE FUNCTION public.set_offer_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_offers_updated_at ON public.offers;
CREATE TRIGGER set_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.set_offer_updated_at();
DROP TRIGGER IF EXISTS set_offer_distributions_updated_at ON public.offer_distributions;
CREATE TRIGGER set_offer_distributions_updated_at BEFORE UPDATE ON public.offer_distributions FOR EACH ROW EXECUTE FUNCTION public.set_offer_updated_at();
DROP TRIGGER IF EXISTS set_offer_issuances_updated_at ON public.offer_issuances;
CREATE TRIGGER set_offer_issuances_updated_at BEFORE UPDATE ON public.offer_issuances FOR EACH ROW EXECUTE FUNCTION public.set_offer_updated_at();

NOTIFY pgrst, 'reload schema';
