-- Merchant Sampling Program Seed Data
-- Timestamp: 2026-01-10
-- 
-- This script creates a clean testing environment for the Merchant Sampling Program.
-- It handles cleaning up existing demo data to avoid foreign key and unique constraint conflicts.

-- =============================================================================
-- 1. CLEANUP (All potential dependent tables)
-- =============================================================================

DO $$
DECLARE
    demo_user_ids UUID[] := ARRAY[
        '00000000-0000-0000-0000-00000000c001'::UUID, -- Creator
        '00000000-0000-0000-0000-00000000b001'::UUID, -- Investor
        'b0000000-0000-0000-0000-000000000200'::UUID, -- New Merchant
        'b0000000-0000-0000-0000-000000000201'::UUID, -- Active Merchant
        'b0000000-0000-0000-0000-000000000202'::UUID  -- Graduated Merchant
    ];
BEGIN
    -- Delete from sampling tables
    DELETE FROM public.merchant_state_transitions WHERE advertiser_id = ANY(demo_user_ids);
    DELETE FROM public.sampling_participations WHERE user_id = ANY(demo_user_ids) OR activation_id IN (SELECT id FROM public.sampling_activations WHERE advertiser_id = ANY(demo_user_ids));
    DELETE FROM public.sampling_activations WHERE advertiser_id = ANY(demo_user_ids);
    DELETE FROM public.advertiser_profiles WHERE user_id = ANY(demo_user_ids);
    
    -- Delete from other potential dependent tables found in migrations
    -- Using dynamic SQL or simple checks to avoid errors if tables don't exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'matrix_nodes') THEN
        DELETE FROM public.matrix_nodes WHERE user_id = ANY(demo_user_ids);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'matrix_wallets') THEN
        DELETE FROM public.matrix_wallets WHERE user_id = ANY(demo_user_ids);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        DELETE FROM public.user_roles WHERE user_id = ANY(demo_user_ids);
    END IF;

    -- Finally delete the users
    DELETE FROM public.users WHERE id = ANY(demo_user_ids);
    
    -- Also clean up by email just in case they exist with different IDs
    DELETE FROM public.users 
    WHERE email IN (
      'creator@promorang.co', 
      'investor@promorang.co', 
      'sampling_merchant@promorang.co', 
      'active_sampling@promorang.co', 
      'graduated_merchant@promorang.co'
    );
END $$;

-- =============================================================================
-- 2. INSERT USERS (Guaranteed to be present for foreign keys)
-- =============================================================================

INSERT INTO public.users (id, email, username, display_name, user_type, created_at)
VALUES 
  ('00000000-0000-0000-0000-00000000c001', 'creator@promorang.co', 'demo_creator', 'Demo Creator', 'creator', NOW()),
  ('00000000-0000-0000-0000-00000000b001', 'investor@promorang.co', 'demo_investor', 'Demo Investor', 'investor', NOW()),
  ('b0000000-0000-0000-0000-000000000200', 'sampling_merchant@promorang.co', 'sampling_merchant', 'Sample Coffee Shop', 'advertiser', NOW()),
  ('b0000000-0000-0000-0000-000000000201', 'active_sampling@promorang.co', 'active_sampling', 'Downtown Boutique', 'advertiser', NOW()),
  ('b0000000-0000-0000-0000-000000000202', 'graduated_merchant@promorang.co', 'graduated_merchant', 'Fitness Studio Pro', 'advertiser', NOW() - INTERVAL '30 days');

-- =============================================================================
-- 3. MERCHANT PROFILES
-- =============================================================================

INSERT INTO public.advertiser_profiles (user_id, company_name, company_website, merchant_state, created_at)
VALUES ('b0000000-0000-0000-0000-000000000200', 'Sample Coffee Shop', 'https://samplecoffee.local', 'NEW', NOW());

INSERT INTO public.advertiser_profiles (user_id, company_name, company_website, merchant_state, sampling_started_at, created_at)
VALUES ('b0000000-0000-0000-0000-000000000201', 'Downtown Boutique', 'https://downtownboutique.local', 'SAMPLING', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 days');

INSERT INTO public.advertiser_profiles (user_id, company_name, company_website, merchant_state, sampling_started_at, graduated_at, created_at)
VALUES ('b0000000-0000-0000-0000-000000000202', 'Fitness Studio Pro', 'https://fitnesspro.local', 'GRADUATED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '30 days');

-- =============================================================================
-- 4. SAMPLING ACTIVATIONS
-- =============================================================================

-- Active sampling activation
INSERT INTO public.sampling_activations (
  id, advertiser_id, name, description, value_type, value_amount, value_unit, 
  max_redemptions, current_redemptions, starts_at, expires_at, duration_days, 
  status, include_in_deals, include_in_events, include_in_post_proof, 
  promoshare_enabled, social_shield_required, created_at
) VALUES (
  'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000201', 
  '20% Off First Purchase', 'New customers get 20% off their first purchase at Downtown Boutique. Share your experience!', 
  'coupon', 20.00, 'percentage', 20, 5, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 7, 
  'active', TRUE, FALSE, TRUE, TRUE, TRUE, NOW() - INTERVAL '3 days'
);

-- Completed sampling activation for graduated merchant
INSERT INTO public.sampling_activations (
  id, advertiser_id, name, description, value_type, value_amount, value_unit, 
  max_redemptions, current_redemptions, starts_at, expires_at, duration_days, 
  status, include_in_deals, graduation_triggered, graduation_reason, 
  graduation_triggered_at, created_at
) VALUES (
  'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000202', 
  'Free Trial Class', 'Get a free trial fitness class at Fitness Studio Pro', 
  'experience', 50.00, 'usd', 15, 8, NOW() - INTERVAL '20 days', NOW() - INTERVAL '6 days', 14, 
  'completed', TRUE, TRUE, 'redemption_rate_threshold', NOW() - INTERVAL '6 days', NOW() - INTERVAL '20 days'
);

-- =============================================================================
-- 5. PARTICIPATIONS
-- =============================================================================

INSERT INTO public.sampling_participations (
  id, activation_id, user_id, user_maturity_state, action_type, verified, verified_at, redeemed, created_at
) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000c001', 1, 'deal_claimed', TRUE, NOW() - INTERVAL '2 days', TRUE, NOW() - INTERVAL '2 days'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000b001', 0, 'deal_claimed', TRUE, NOW() - INTERVAL '1 day', FALSE, NOW() - INTERVAL '1 day');

-- =============================================================================
-- 6. STATE TRANSITIONS
-- =============================================================================

INSERT INTO public.merchant_state_transitions (advertiser_id, from_state, to_state, trigger_reason, trigger_metadata, created_at)
VALUES
  ('b0000000-0000-0000-0000-000000000201', 'NEW', 'SAMPLING', 'sampling_activation_created', '{"activation_id": "c0000000-0000-0000-0000-000000000001"}', NOW() - INTERVAL '3 days'),
  ('b0000000-0000-0000-0000-000000000202', 'NEW', 'SAMPLING', 'sampling_activation_created', '{"activation_id": "c0000000-0000-0000-0000-000000000002"}', NOW() - INTERVAL '20 days'),
  ('b0000000-0000-0000-0000-000000000202', 'SAMPLING', 'GRADUATED', 'redemption_rate_threshold', '{"activation_id": "c0000000-0000-0000-0000-000000000002", "redemption_rate": 0.53}', NOW() - INTERVAL '6 days');

-- =============================================================================
-- ADD DEMO LOGIN SUPPORT
-- =============================================================================

-- Note: Demo login for sampling_merchant@promorang.co should be added to backend/api/auth.js
-- POST /api/auth/demo/sampling-merchant
