-- =============================================
-- PART 1: USER TARGETING & PREFERENCES
-- =============================================

-- User preferences for personalization
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  -- Demographics
  age_range text, -- '18-24', '25-34', '35-44', '45-54', '55+'
  gender text, -- 'male', 'female', 'non-binary', 'prefer_not_to_say'
  -- Geographics
  city text,
  state text,
  country text DEFAULT 'US',
  latitude decimal,
  longitude decimal,
  location_radius_km integer DEFAULT 25,
  location_sharing_enabled boolean DEFAULT false,
  -- Psychographics (lifestyle)
  lifestyle_tags text[], -- ['active', 'foodie', 'creative', 'social', 'professional']
  -- Preferences
  preferred_categories text[], -- moment categories they're interested in
  preferred_times text[], -- 'morning', 'afternoon', 'evening', 'weekend'
  notification_enabled boolean DEFAULT true,
  email_digest_frequency text DEFAULT 'weekly', -- 'daily', 'weekly', 'never'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Brands can read aggregate/anonymized preference data (for targeting UI)
CREATE POLICY "Brands can view preference distributions"
  ON public.user_preferences FOR SELECT
  USING (has_role(auth.uid(), 'brand'::user_role) OR has_role(auth.uid(), 'admin'::user_role));

-- =============================================
-- PART 2: CAMPAIGN TARGETING ENHANCEMENT
-- =============================================

-- Add targeting fields to campaigns
ALTER TABLE public.campaigns
ADD COLUMN target_age_ranges text[], -- ['18-24', '25-34']
ADD COLUMN target_genders text[], -- ['male', 'female']
ADD COLUMN target_locations jsonb, -- [{"city": "Austin", "radius_km": 50}]
ADD COLUMN target_lifestyle_tags text[], -- ['foodie', 'active']
ADD COLUMN bid_amount decimal DEFAULT 0, -- for positioning priority
ADD COLUMN featured boolean DEFAULT false,
ADD COLUMN featured_until timestamptz;

-- Create index for featured campaigns
CREATE INDEX idx_campaigns_featured ON public.campaigns(featured, featured_until) WHERE featured = true;

-- =============================================
-- PART 3: SPONSORSHIP MARKETPLACE
-- =============================================

-- Sponsorship status enum
CREATE TYPE public.sponsorship_status AS ENUM (
  'pending',      -- Brand submitted request
  'viewed',       -- Host has seen it
  'negotiating',  -- Back and forth
  'accepted',     -- Host accepted
  'declined',     -- Host declined
  'active',       -- Sponsorship is live
  'completed',    -- Moment ended, sponsorship fulfilled
  'cancelled'     -- Either party cancelled
);

-- Sponsorship requests: brands bid to sponsor existing moments
CREATE TABLE public.sponsorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL,
  host_id uuid NOT NULL, -- denormalized for easy querying
  -- Financial
  bid_amount decimal NOT NULL DEFAULT 0,
  platform_fee_percent decimal DEFAULT 15, -- platform takes 15%
  -- Terms
  message text, -- pitch from brand to host
  requirements text, -- what brand expects
  -- Status
  status public.sponsorship_status DEFAULT 'pending',
  host_response text,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_sponsorship_moment ON public.sponsorship_requests(moment_id);
CREATE INDEX idx_sponsorship_brand ON public.sponsorship_requests(brand_id);
CREATE INDEX idx_sponsorship_host ON public.sponsorship_requests(host_id);
CREATE INDEX idx_sponsorship_status ON public.sponsorship_requests(status);

-- RLS policies for sponsorship_requests
CREATE POLICY "Brands can view their own sponsorship requests"
  ON public.sponsorship_requests FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Hosts can view requests for their moments"
  ON public.sponsorship_requests FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "Brands can create sponsorship requests"
  ON public.sponsorship_requests FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their pending requests"
  ON public.sponsorship_requests FOR UPDATE
  USING (auth.uid() = brand_id AND status = 'pending');

CREATE POLICY "Hosts can respond to requests"
  ON public.sponsorship_requests FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Admins can view all sponsorship requests"
  ON public.sponsorship_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- =============================================
-- PART 4: MOMENT BOUNTY MARKETPLACE
-- =============================================

-- Bounty status enum
CREATE TYPE public.bounty_status AS ENUM (
  'open',         -- Brand posted, accepting applications
  'assigned',     -- Host assigned
  'in_progress',  -- Moment being created
  'submitted',    -- Host submitted moment for review
  'approved',     -- Brand approved
  'completed',    -- Payout processed
  'cancelled',    -- Cancelled
  'expired'       -- No one claimed
);

-- Moment bounties: brands request moments to be created
CREATE TABLE public.moment_bounties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  brand_id uuid NOT NULL,
  -- Bounty details
  title text NOT NULL,
  description text,
  requirements text NOT NULL, -- what the moment should include
  -- Targeting (what kind of moment/audience)
  target_category text NOT NULL,
  target_location text,
  target_date_range tstzrange, -- preferred date range
  target_min_participants integer DEFAULT 10,
  -- Financial
  payout_amount decimal NOT NULL,
  platform_fee_percent decimal DEFAULT 20, -- platform takes 20% of bounties
  -- Assignment
  assigned_to uuid, -- host who claimed it
  fulfilled_moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  -- Status
  status public.bounty_status DEFAULT 'open',
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Enable RLS
ALTER TABLE public.moment_bounties ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_bounties_brand ON public.moment_bounties(brand_id);
CREATE INDEX idx_bounties_status ON public.moment_bounties(status);
CREATE INDEX idx_bounties_assigned ON public.moment_bounties(assigned_to);
CREATE INDEX idx_bounties_category ON public.moment_bounties(target_category);

-- RLS policies for moment_bounties
CREATE POLICY "Anyone can view open bounties"
  ON public.moment_bounties FOR SELECT
  USING (status = 'open');

CREATE POLICY "Brands can view their own bounties"
  ON public.moment_bounties FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Assigned hosts can view their bounties"
  ON public.moment_bounties FOR SELECT
  USING (auth.uid() = assigned_to);

CREATE POLICY "Brands can create bounties"
  ON public.moment_bounties FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their bounties"
  ON public.moment_bounties FOR UPDATE
  USING (auth.uid() = brand_id);

CREATE POLICY "Hosts can claim open bounties"
  ON public.moment_bounties FOR UPDATE
  USING (status = 'open' AND has_role(auth.uid(), 'host'::user_role));

CREATE POLICY "Admins can view all bounties"
  ON public.moment_bounties FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- =============================================
-- PART 5: MONETIZATION - PLATFORM TRANSACTIONS
-- =============================================

-- Transaction type enum
CREATE TYPE public.transaction_type AS ENUM (
  'reward_redemption',    -- Fee on reward redemption
  'sponsorship_fee',      -- Fee on sponsorship deals
  'bounty_fee',           -- Fee on bounty payouts
  'subscription',         -- Subscription payment
  'featured_placement',   -- Pay for featured spot
  'payout'               -- Payout to host/merchant
);

-- Platform transactions for fee tracking
CREATE TABLE public.platform_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Parties
  payer_id uuid, -- who paid
  payee_id uuid, -- who receives (null if platform)
  -- Reference
  reference_type text NOT NULL, -- 'sponsorship', 'bounty', 'reward', 'subscription'
  reference_id uuid NOT NULL,
  -- Financial
  transaction_type public.transaction_type NOT NULL,
  gross_amount decimal NOT NULL,
  platform_fee decimal NOT NULL DEFAULT 0,
  net_amount decimal NOT NULL, -- gross - platform_fee
  currency text DEFAULT 'USD',
  -- Status
  status text DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.platform_transactions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_transactions_payer ON public.platform_transactions(payer_id);
CREATE INDEX idx_transactions_payee ON public.platform_transactions(payee_id);
CREATE INDEX idx_transactions_type ON public.platform_transactions(transaction_type);
CREATE INDEX idx_transactions_status ON public.platform_transactions(status);

-- RLS policies
CREATE POLICY "Users can view their own transactions"
  ON public.platform_transactions FOR SELECT
  USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "Admins can view all transactions"
  ON public.platform_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can create transactions"
  ON public.platform_transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- PART 6: SUBSCRIPTION TIERS
-- =============================================

CREATE TYPE public.subscription_tier AS ENUM (
  'free',
  'starter',    -- $29/mo - enhanced visibility
  'pro',        -- $99/mo - analytics, priority support
  'enterprise'  -- Custom pricing
);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tier public.subscription_tier DEFAULT 'free',
  -- Billing
  monthly_price decimal DEFAULT 0,
  billing_cycle_start timestamptz,
  billing_cycle_end timestamptz,
  -- Features (denormalized for fast access)
  features jsonb DEFAULT '{}',
  -- Status
  status text DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
  cancelled_at timestamptz,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();