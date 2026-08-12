-- ========================================================
-- PROMORANG CAMPAIGN BLUEPRINTS & SOLVENCY ENGINE MIGRATION
-- 1 Gem = $1.00 USD Withdrawable Cash Model
-- ========================================================

-- 1. Referral Sprint & Golden Pass System
CREATE TABLE IF NOT EXISTS public.campaign_sprint_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id VARCHAR(50) NOT NULL DEFAULT 'sprint_2026_q3',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_count INTEGER DEFAULT 0,
    vip_passes_issued INTEGER DEFAULT 3,
    vip_passes_claimed INTEGER DEFAULT 0,
    points_accumulated INTEGER DEFAULT 0,
    bonus_earnings_usd DECIMAL(10,2) DEFAULT 0.00,
    is_double_commission_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sprint_id, user_id)
);

-- 2. Operator Seasons & Hub Director System (80/20 Revenue Split)
CREATE TABLE IF NOT EXISTS public.operator_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    director_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'general',
    theme_color VARCHAR(20) DEFAULT '#8B5CF6',
    total_budget_usd DECIMAL(10,2) DEFAULT 0.00,
    operator_share_usd DECIMAL(10,2) DEFAULT 0.00, -- 80% split
    platform_share_usd DECIMAL(10,2) DEFAULT 0.00, -- 20% split
    completers_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, ended, upcoming
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Merchant Performance Coupon Engine
CREATE TABLE IF NOT EXISTS public.merchant_performance_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.merchant_stores(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_usd', 'fixed_gems', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_usd DECIMAL(10,2) DEFAULT 0.00,
    max_discount_usd DECIMAL(10,2),
    total_issued INTEGER DEFAULT 0,
    total_claimed INTEGER DEFAULT 0,
    total_redeemed INTEGER DEFAULT 0,
    gross_revenue_generated_usd DECIMAL(10,2) DEFAULT 0.00,
    is_zero_risk_performance BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Gem Rush & Dopamine Flash Vault Items
CREATE TABLE IF NOT EXISTS public.gem_flash_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    original_msrp_usd DECIMAL(10,2) NOT NULL,
    gem_price INTEGER NOT NULL, -- 1 Gem = $1.00 USD
    stock_quantity INTEGER NOT NULL DEFAULT 10,
    initial_stock INTEGER NOT NULL DEFAULT 10,
    vault_status VARCHAR(20) DEFAULT 'live', -- upcoming, live, sold_out
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for high-performance flash purchases
CREATE INDEX IF NOT EXISTS idx_gem_flash_vault_status ON public.gem_flash_vault(vault_status);

-- ========================================================
-- 5. ATOMIC STORED PROCEDURE: RACE-CONDITION-FREE GEM FLASH PURCHASE
-- 1 Gem = $1.00 USD 1:1 Escrow Reserve Validation
-- ========================================================
CREATE OR REPLACE FUNCTION process_gem_flash_purchase(
    p_user_id UUID,
    p_item_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_user_gems INT;
    v_gem_price INT;
    v_stock INT;
    v_order_id UUID;
BEGIN
    -- 1. Fetch item price & stock with row lock to prevent race conditions
    SELECT gem_price, stock_quantity INTO v_gem_price, v_stock 
    FROM public.gem_flash_vault 
    WHERE id = p_item_id FOR UPDATE;

    IF v_stock IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'ITEM_NOT_FOUND');
    END IF;

    IF v_stock < 1 THEN
        RETURN jsonb_build_object('success', false, 'reason', 'OUT_OF_STOCK');
    END IF;

    -- 2. Check user Gem balance (1 Gem = $1 USD)
    SELECT COALESCE(gems_balance, 0) INTO v_user_gems 
    FROM public.profiles 
    WHERE id = p_user_id FOR UPDATE;

    IF v_user_gems < v_gem_price THEN
        RETURN jsonb_build_object('success', false, 'reason', 'INSUFFICIENT_GEMS', 'required', v_gem_price, 'available', v_user_gems);
    END IF;

    -- 3. Execute atomic transaction
    -- Debit user balance
    UPDATE public.profiles 
    SET gems_balance = gems_balance - v_gem_price 
    WHERE id = p_user_id;

    -- Decrement inventory stock
    UPDATE public.gem_flash_vault 
    SET stock_quantity = stock_quantity - 1,
        vault_status = CASE WHEN stock_quantity - 1 <= 0 THEN 'sold_out' ELSE 'live' END
    WHERE id = p_item_id;

    -- Create completed marketplace order
    INSERT INTO public.orders (user_id, payment_method, total_gems, total_usd, status)
    VALUES (p_user_id, 'gems', v_gem_price, v_gem_price, 'completed')
    RETURNING id INTO v_order_id;

    RETURN jsonb_build_object(
        'success', true, 
        'order_id', v_order_id, 
        'gems_spent', v_gem_price, 
        'remaining_gems', v_user_gems - v_gem_price
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
