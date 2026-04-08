-- ===========================================
-- UGC & CONTENT SYSTEM
-- ===========================================

-- Moment media uploads from users
CREATE TABLE public.moment_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_notes TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moment reviews from participants
CREATE TABLE public.moment_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_participant BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(moment_id, user_id)
);

-- ===========================================
-- PROMO POINTS SYSTEM (Brand Loyalty)
-- ===========================================

-- Brand-specific point configurations
CREATE TABLE public.brand_point_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  points_per_checkin INTEGER DEFAULT 10,
  points_per_referral INTEGER DEFAULT 50,
  points_per_review INTEGER DEFAULT 25,
  points_per_media INTEGER DEFAULT 15,
  point_expiry_days INTEGER, -- NULL = no expiry
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id)
);

-- Tier definitions per brand
CREATE TYPE public.loyalty_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'ambassador');

CREATE TABLE public.brand_loyalty_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL,
  tier loyalty_tier NOT NULL,
  min_points INTEGER NOT NULL,
  tier_name TEXT NOT NULL,
  tier_benefits JSONB DEFAULT '[]'::jsonb,
  discount_percent NUMERIC DEFAULT 0,
  priority_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id, tier)
);

-- User point balances per brand
CREATE TABLE public.user_brand_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  current_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  current_tier loyalty_tier DEFAULT 'bronze',
  tier_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, brand_id)
);

-- Point transaction history
CREATE TYPE public.point_action AS ENUM (
  'checkin', 'referral', 'review', 'media_upload', 
  'redemption', 'bonus', 'expiry', 'adjustment', 'affiliate_commission'
);

CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  points INTEGER NOT NULL, -- positive = earned, negative = spent/expired
  action point_action NOT NULL,
  reference_type TEXT, -- 'moment', 'review', 'referral', etc.
  reference_id UUID,
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===========================================
-- REFERRALS & AFFILIATES SYSTEM
-- ===========================================

-- User referral codes
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  total_clicks INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral tracking
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code_id UUID REFERENCES public.referral_codes(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded', 'invalid')),
  reward_points INTEGER,
  reward_paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- Affiliate links (for content creators)
CREATE TABLE public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID,
  campaign_id UUID REFERENCES public.campaigns(id),
  moment_id UUID REFERENCES public.moments(id),
  link_code TEXT NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  commission_percent NUMERIC DEFAULT 10,
  commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
  fixed_commission NUMERIC,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate conversions/transactions
CREATE TABLE public.affiliate_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id),
  affiliate_user_id UUID NOT NULL,
  converted_user_id UUID,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('signup', 'checkin', 'purchase', 'redemption')),
  order_value NUMERIC,
  commission_earned NUMERIC NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Brand ambassador program
CREATE TYPE public.ambassador_status AS ENUM ('applied', 'pending', 'active', 'suspended', 'inactive');

CREATE TABLE public.brand_ambassadors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  status ambassador_status DEFAULT 'applied',
  ambassador_code TEXT UNIQUE,
  commission_rate NUMERIC DEFAULT 15,
  monthly_target INTEGER,
  perks JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  total_earnings NUMERIC DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, brand_id)
);

-- ===========================================
-- MERCHANT INVENTORY SYSTEM
-- ===========================================

-- Merchant products (native inventory)
CREATE TABLE public.merchant_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL,
  venue_id UUID REFERENCES public.venues(id),
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  cost_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  images JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy TEXT DEFAULT 'deny' CHECK (inventory_policy IN ('deny', 'continue')),
  is_active BOOLEAN DEFAULT true,
  is_redeemable_with_points BOOLEAN DEFAULT false,
  points_cost INTEGER,
  external_source TEXT, -- 'shopify', 'woocommerce', etc.
  external_id TEXT,
  external_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product redemptions (points to products)
CREATE TABLE public.product_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.merchant_products(id),
  brand_id UUID NOT NULL,
  points_spent INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- E-commerce platform connections
CREATE TABLE public.merchant_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('shopify', 'woocommerce', 'square', 'custom')),
  store_url TEXT,
  api_key_encrypted TEXT, -- Store encrypted
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
  sync_error TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(merchant_id, platform)
);

-- ===========================================
-- ENABLE RLS ON ALL NEW TABLES
-- ===========================================

ALTER TABLE public.moment_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_point_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_brand_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_integrations ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- Moment Media policies
CREATE POLICY "Anyone can view approved media" ON public.moment_media FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Users can upload their own media" ON public.moment_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own media" ON public.moment_media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Hosts can moderate media for their moments" ON public.moment_media FOR UPDATE USING (EXISTS (SELECT 1 FROM moments WHERE moments.id = moment_media.moment_id AND moments.host_id = auth.uid()));
CREATE POLICY "Admins can manage all media" ON public.moment_media FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Moment Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON public.moment_reviews FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Users can create reviews" ON public.moment_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.moment_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.moment_reviews FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Brand Point Programs policies
CREATE POLICY "Anyone can view active programs" ON public.brand_point_programs FOR SELECT USING (is_active = true);
CREATE POLICY "Brands can manage their programs" ON public.brand_point_programs FOR ALL USING (auth.uid() = brand_id);
CREATE POLICY "Admins can manage all programs" ON public.brand_point_programs FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Brand Loyalty Tiers policies
CREATE POLICY "Anyone can view tiers" ON public.brand_loyalty_tiers FOR SELECT USING (true);
CREATE POLICY "Brands can manage their tiers" ON public.brand_loyalty_tiers FOR ALL USING (auth.uid() = brand_id);

-- User Brand Points policies
CREATE POLICY "Users can view their own points" ON public.user_brand_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Brands can view points for their brand" ON public.user_brand_points FOR SELECT USING (auth.uid() = brand_id);
CREATE POLICY "System can manage points" ON public.user_brand_points FOR ALL USING (auth.uid() IS NOT NULL);

-- Point Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Brands can view their transactions" ON public.point_transactions FOR SELECT USING (auth.uid() = brand_id);
CREATE POLICY "System can create transactions" ON public.point_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Referral Codes policies
CREATE POLICY "Users can view their own codes" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their codes" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their codes" ON public.referral_codes FOR UPDATE USING (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view referrals they made" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "System can create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Affiliate Links policies
CREATE POLICY "Users can view their own links" ON public.affiliate_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their links" ON public.affiliate_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their links" ON public.affiliate_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Brands can view links for their campaigns" ON public.affiliate_links FOR SELECT USING (auth.uid() = brand_id);

-- Affiliate Conversions policies
CREATE POLICY "Affiliates can view their conversions" ON public.affiliate_conversions FOR SELECT USING (auth.uid() = affiliate_user_id);
CREATE POLICY "System can create conversions" ON public.affiliate_conversions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Brand Ambassadors policies
CREATE POLICY "Users can view their ambassador status" ON public.brand_ambassadors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can apply as ambassadors" ON public.brand_ambassadors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Brands can manage their ambassadors" ON public.brand_ambassadors FOR ALL USING (auth.uid() = brand_id);
CREATE POLICY "Admins can manage all ambassadors" ON public.brand_ambassadors FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Merchant Products policies
CREATE POLICY "Anyone can view active products" ON public.merchant_products FOR SELECT USING (is_active = true);
CREATE POLICY "Merchants can manage their products" ON public.merchant_products FOR ALL USING (auth.uid() = merchant_id);
CREATE POLICY "Admins can manage all products" ON public.merchant_products FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Product Redemptions policies
CREATE POLICY "Users can view their redemptions" ON public.product_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create redemptions" ON public.product_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Merchants can view brand redemptions" ON public.product_redemptions FOR SELECT USING (auth.uid() = brand_id);
CREATE POLICY "Merchants can update redemption status" ON public.product_redemptions FOR UPDATE USING (auth.uid() = brand_id);

-- Merchant Integrations policies
CREATE POLICY "Merchants can manage their integrations" ON public.merchant_integrations FOR ALL USING (auth.uid() = merchant_id);
CREATE POLICY "Admins can manage all integrations" ON public.merchant_integrations FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX idx_moment_media_moment ON public.moment_media(moment_id);
CREATE INDEX idx_moment_media_user ON public.moment_media(user_id);
CREATE INDEX idx_moment_reviews_moment ON public.moment_reviews(moment_id);
CREATE INDEX idx_user_brand_points_user ON public.user_brand_points(user_id);
CREATE INDEX idx_user_brand_points_brand ON public.user_brand_points(brand_id);
CREATE INDEX idx_point_transactions_user ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_brand ON public.point_transactions(brand_id);
CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_affiliate_links_user ON public.affiliate_links(user_id);
CREATE INDEX idx_affiliate_links_code ON public.affiliate_links(link_code);
CREATE INDEX idx_merchant_products_merchant ON public.merchant_products(merchant_id);
CREATE INDEX idx_merchant_products_sku ON public.merchant_products(sku);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Auto-update timestamps
CREATE TRIGGER update_moment_reviews_updated_at BEFORE UPDATE ON public.moment_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_brand_point_programs_updated_at BEFORE UPDATE ON public.brand_point_programs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_user_brand_points_updated_at BEFORE UPDATE ON public.user_brand_points FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON public.affiliate_links FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_brand_ambassadors_updated_at BEFORE UPDATE ON public.brand_ambassadors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_merchant_products_updated_at BEFORE UPDATE ON public.merchant_products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_product_redemptions_updated_at BEFORE UPDATE ON public.product_redemptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_merchant_integrations_updated_at BEFORE UPDATE ON public.merchant_integrations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();