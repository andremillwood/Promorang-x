-- Gems Virtual Currency System
-- Internal ledger for piece trading - zero blockchain costs
-- Timestamp: 2026-04-20

-- =====================================================
-- 1. USER BALANCES (Multi-currency support)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Balance type
  balance_type text NOT NULL CHECK (balance_type IN ('gems', 'fiat', 'crypto')),
  currency text NOT NULL DEFAULT 'GEMS',
  
  -- Current balance
  balance numeric(14,2) NOT NULL DEFAULT 0,
  
  -- Gems specific tracking
  gems_purchased_total numeric(14,2) DEFAULT 0,    -- Total ever bought
  gems_traded_total numeric(14,2) DEFAULT 0,       -- Total used in trades
  gems_withdrawn_total numeric(14,2) DEFAULT 0,    -- Total cashed out
  gems_bonus_total numeric(14,2) DEFAULT 0,        -- Total from bonuses
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  UNIQUE(user_id, balance_type, currency)
);

-- Ensure columns exist in case table was partially created in a previous run
ALTER TABLE public.user_balances 
  ADD COLUMN IF NOT EXISTS balance_type text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'GEMS',
  ADD COLUMN IF NOT EXISTS balance numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gems_purchased_total numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gems_traded_total numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gems_withdrawn_total numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gems_bonus_total numeric(14,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_balances_user ON public.user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_balances_type ON public.user_balances(balance_type);

-- =====================================================
-- 2. GEMS TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gems_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type text NOT NULL CHECK (transaction_type IN (
    'purchase',        -- Bought with fiat
    'trade_out',       -- Spent to buy pieces
    'trade_in',        -- Received from selling pieces
    'withdrawal',      -- Converted to fiat
    'bonus',           -- Promotional/Referral
    'refund',          -- Reversed transaction
    'fee',             -- Platform fee in gems
    'adjustment'       -- Admin correction
  )),
  
  amount numeric(14,2) NOT NULL,  -- Positive = credit, Negative = debit
  balance_after numeric(14,2) NOT NULL,
  
  -- Purchase details
  fiat_amount numeric(14,2),
  fiat_currency text DEFAULT 'USD',
  exchange_rate numeric(10,4),     -- Gems per USD
  stripe_payment_intent_id text,
  
  -- Trade details
  piece_type public.piece_type,
  asset_id uuid,
  pieces_amount numeric(24,8),
  pool_id uuid REFERENCES public.piece_liquidity_pools(id),
  
  -- Withdrawal details
  withdrawal_method text,
  gems_withdrawal_id uuid,
  
  -- Bonus details
  bonus_reason text,
  issued_by uuid REFERENCES public.users(id),
  
  -- General
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_gems_transactions_user ON public.gems_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_type ON public.gems_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_created ON public.gems_transactions(created_at DESC);

-- =====================================================
-- 3. GEMS WITHDRAWALS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gems_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Amounts
  gems_amount numeric(14,2) NOT NULL,
  usd_amount numeric(14,2) NOT NULL,
  exchange_rate numeric(10,4) NOT NULL,
  
  -- Method
  withdrawal_method text NOT NULL DEFAULT 'bank_transfer' 
    CHECK (withdrawal_method IN ('bank_transfer', 'paypal', 'crypto')),
  
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Processing
  requested_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  processed_at timestamptz,
  processed_by uuid REFERENCES public.users(id),
  completed_at timestamptz,
  
  -- Payout tracking
  stripe_transfer_id text,
  payout_receipt_url text,
  
  -- Failure handling
  failed_at timestamptz,
  failure_reason text,
  
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_gems_withdrawals_user ON public.gems_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_gems_withdrawals_status ON public.gems_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_gems_withdrawals_pending ON public.gems_withdrawals(status) 
  WHERE status = 'pending';

-- =====================================================
-- 4. GEMS SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gems_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Exchange rate
  exchange_rate numeric(10,4) NOT NULL DEFAULT 1.0000,  -- 1 Gem = $1.00 (simple)
  rate_last_updated timestamptz DEFAULT timezone('utc', now()),
  
  -- Limits
  min_purchase_gems numeric(14,2) NOT NULL DEFAULT 5,       -- $5 minimum (5 Gems)
  max_purchase_gems numeric(14,2) NOT NULL DEFAULT 1000,    -- $1000 maximum (1000 Gems)
  min_withdrawal_gems numeric(14,2) NOT NULL DEFAULT 10,    -- $10 minimum (10 Gems)
  max_withdrawal_gems numeric(14,2) NOT NULL DEFAULT 5000,  -- $5000 maximum (5000 Gems)
  
  -- Features
  purchases_enabled boolean DEFAULT true,
  withdrawals_enabled boolean DEFAULT true,
  trading_enabled boolean DEFAULT true,
  
  -- Promotional
  signup_bonus_gems numeric(14,2) DEFAULT 0,    -- Free gems on signup
  referral_bonus_gems numeric(14,2) DEFAULT 0, -- Bonus per referral
  
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Insert default settings
INSERT INTO public.gems_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Get current Gems settings
DROP FUNCTION IF EXISTS public.get_gems_settings();
CREATE OR REPLACE FUNCTION public.get_gems_settings()
RETURNS public.gems_settings AS $$
  SELECT * FROM public.gems_settings LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Calculate Gems balance in USD
DROP FUNCTION IF EXISTS public.gems_to_usd(numeric);
CREATE OR REPLACE FUNCTION public.gems_to_usd(gems_amount numeric)
RETURNS numeric AS $$
DECLARE
  rate numeric;
BEGIN
  rate := (SELECT exchange_rate FROM public.gems_settings LIMIT 1);
  RETURN ROUND(gems_amount * COALESCE(rate, 0.10), 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Update user balance timestamp
DROP TRIGGER IF EXISTS trg_user_balance_touch ON public.user_balances;
DROP FUNCTION IF EXISTS public.touch_user_balance_updated_at();
CREATE OR REPLACE FUNCTION public.touch_user_balance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_balance_touch
  BEFORE UPDATE ON public.user_balances
  FOR EACH ROW EXECUTE FUNCTION public.touch_user_balance_updated_at();

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems_settings ENABLE ROW LEVEL SECURITY;

-- User balances - users see own
DROP POLICY IF EXISTS "Users can view own balances" ON public.user_balances;
CREATE POLICY "Users can view own balances" ON public.user_balances
  FOR SELECT USING (auth.uid() = user_id);

-- Transactions - users see own
DROP POLICY IF EXISTS "Users can view own transactions" ON public.gems_transactions;
CREATE POLICY "Users can view own transactions" ON public.gems_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Withdrawals - users see own
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.gems_withdrawals;
CREATE POLICY "Users can view own withdrawals" ON public.gems_withdrawals
  FOR SELECT USING (auth.uid() = user_id);

-- Settings are public
DROP POLICY IF EXISTS "Gems settings are public" ON public.gems_settings;
CREATE POLICY "Gems settings are public" ON public.gems_settings
  FOR SELECT USING (true);

-- Only system can modify
DROP POLICY IF EXISTS "Only system can modify balances" ON public.user_balances;
CREATE POLICY "Only system can modify balances" ON public.user_balances FOR ALL USING (false);

DROP POLICY IF EXISTS "Only system can modify transactions" ON public.gems_transactions;
CREATE POLICY "Only system can modify transactions" ON public.gems_transactions FOR ALL USING (false);

DROP POLICY IF EXISTS "Only system can modify withdrawals" ON public.gems_withdrawals;
CREATE POLICY "Only system can modify withdrawals" ON public.gems_withdrawals FOR ALL USING (false);

DROP POLICY IF EXISTS "Only admins can modify settings" ON public.gems_settings;
CREATE POLICY "Only admins can modify settings" ON public.gems_settings FOR ALL USING (false);

-- =====================================================
-- 7. VIEWS FOR ANALYTICS
-- =====================================================

-- Daily Gems metrics
CREATE OR REPLACE VIEW public.gems_daily_stats AS
SELECT 
  DATE(created_at) as date,
  transaction_type,
  COUNT(*) as transaction_count,
  SUM(ABS(amount)) as total_gems,
  SUM(CASE WHEN transaction_type = 'purchase' THEN fiat_amount ELSE 0 END) as total_fiat_volume
FROM public.gems_transactions
GROUP BY DATE(created_at), transaction_type
ORDER BY date DESC;

-- User Gems summary
CREATE OR REPLACE VIEW public.user_gems_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(b.balance, 0) as gems_balance,
  COALESCE(b.gems_purchased_total, 0) as total_purchased,
  COALESCE(b.gems_traded_total, 0) as total_traded,
  COALESCE(b.gems_withdrawn_total, 0) as total_withdrawn,
  COALESCE(b.gems_bonus_total, 0) as total_bonus,
  COALESCE(b.gems_purchased_total, 0) * 0.10 as estimated_lifetime_value
FROM public.users u
LEFT JOIN public.user_balances b ON u.id = b.user_id AND b.balance_type = 'gems';

notify pgrst, 'reload schema';
