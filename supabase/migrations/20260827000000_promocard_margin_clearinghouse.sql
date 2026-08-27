-- Migration: PromoCard & Margin Clearinghouse Architecture
-- Enables pre-endowed spendable limits, merchant-authorized margin pools, and split-tender settlements.

-- 1. Merchant Margin Pools (0-Cash Margin Clearing)
CREATE TABLE IF NOT EXISTS public.merchant_margin_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  category TEXT DEFAULT 'Retail',
  allowance_per_user NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
  min_basket_size NUMERIC(10, 2) NOT NULL DEFAULT 35.00,
  monthly_customer_cap INTEGER NOT NULL DEFAULT 50,
  current_redemptions_count INTEGER NOT NULL DEFAULT 0,
  total_cash_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_margin_committed NUMERIC(12, 2) NOT NULL DEFAULT 750.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  terms_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User PromoCards (Dynamic Pre-Endowed Credit Lines)
CREATE TABLE IF NOT EXISTS public.user_promo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'verified' CHECK (tier IN ('starter', 'verified', 'vip', 'ambassador')),
  monthly_limit NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  available_balance NUMERIC(10, 2) NOT NULL DEFAULT 45.00,
  spent_this_cycle NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  recharge_health_score INTEGER NOT NULL DEFAULT 75 CHECK (recharge_health_score BETWEEN 0 AND 100),
  card_number TEXT NOT NULL DEFAULT ('•••• •••• •••• ' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  cycle_resets_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  total_savings_lifetime NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Split-Tender Transactions (Receipts & Settlements)
CREATE TABLE IF NOT EXISTS public.split_tender_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  merchant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_attribution_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hub_operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gross_amount NUMERIC(10, 2) NOT NULL,
  promo_discount_applied NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  fiat_cash_charged NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 5% of fiat portion
  operator_share NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 80% of platform fee
  promorang_share NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 20% of platform fee
  net_merchant_payout NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'settled' CHECK (status IN ('pending', 'settled', 'refunded', 'failed')),
  receipt_metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Attention Recharge Events (Proof of Settle & Reload)
CREATE TABLE IF NOT EXISTS public.attention_recharge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('moment_post', 'verified_review', 'referral_join', 'check_in', 'social_share')),
  recharge_amount NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
  reference_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_merchant_margin_pools_merchant ON public.merchant_margin_pools(merchant_id);
CREATE INDEX IF NOT EXISTS idx_user_promo_cards_user ON public.user_promo_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_split_tender_tx_user ON public.split_tender_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_split_tender_tx_merchant ON public.split_tender_transactions(merchant_id);

-- RLS Policies
ALTER TABLE public.merchant_margin_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promo_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_tender_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attention_recharge_events ENABLE ROW LEVEL SECURITY;

-- Public read for active merchant pools
CREATE POLICY "Public read active margin pools"
  ON public.merchant_margin_pools FOR SELECT
  USING (is_active = TRUE);

-- Users can read/update their own card
CREATE POLICY "Users read own card"
  ON public.user_promo_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own transactions"
  ON public.split_tender_transactions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = merchant_id OR auth.uid() = hub_operator_id);
