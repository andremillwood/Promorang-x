-- =============================================
-- DEMO STATE USERS MIGRATION (FINAL CORRECTED)
-- Creates demo users for testing maturity states 0-3
-- =============================================

-- 1. SEED USERS TABLE
INSERT INTO users (
    id,
    email,
    username,
    display_name,
    user_type,
    onboarding_completed,
    created_at
) VALUES 
    ('a0000000-0000-0000-0000-000000000000', 'newbie@demo.com', 'state0_user', 'New User (State 0)', 'creator', false, NOW()),
    ('a0000000-0000-0000-0000-000000000001', 'exploring@demo.com', 'state1_user', 'Explorer (State 1)', 'creator', true, NOW() - INTERVAL '3 days'),
    ('a0000000-0000-0000-0000-000000000002', 'engaged@demo.com', 'state2_user', 'Engaged User (State 2)', 'creator', true, NOW() - INTERVAL '14 days'),
    ('a0000000-0000-0000-0000-000000000003', 'power@demo.com', 'state3_user', 'Power User (State 3)', 'creator', true, NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO UPDATE SET
    onboarding_completed = EXCLUDED.onboarding_completed;

-- 2. SEED USER BALANCES (Points, Gems, Keys)
INSERT INTO user_balances (user_id, points, gems, promokeys)
VALUES 
    ('a0000000-0000-0000-0000-000000000000', 0, 0, 0),
    ('a0000000-0000-0000-0000-000000000001', 50, 5.00, 2),
    ('a0000000-0000-0000-0000-000000000002', 500, 50.00, 15),
    ('a0000000-0000-0000-0000-000000000003', 5000, 500.00, 100)
ON CONFLICT (user_id) DO UPDATE SET
    points = EXCLUDED.points,
    gems = EXCLUDED.gems,
    promokeys = EXCLUDED.promokeys;

-- 3. SEED VERIFIED ACTIONS FOR STATE 2 & 3
-- Using correct enum values: SYSTEM_EVENT, INTERACTION_LOG, PROOF_UPLOAD
INSERT INTO verified_actions (
    id,
    user_id,
    action_type,
    verification_mode,
    action_label,
    reference_type,
    created_at
) VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'PROMORANG_DROP', 'SYSTEM_EVENT', 'Completed demo drop', 'promorang_drops', NOW() - INTERVAL '5 days'),
    ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'PROMORANG_DROP', 'SYSTEM_EVENT', 'Drop completion 1', 'promorang_drops', NOW() - INTERVAL '30 days'),
    ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003', 'PROMORANG_DROP', 'SYSTEM_EVENT', 'Drop completion 2', 'promorang_drops', NOW() - INTERVAL '25 days'),
    ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000003', 'CONTENT_CONTRIBUTION', 'PROOF_UPLOAD', 'Proof submission 1', 'content', NOW() - INTERVAL '20 days'),
    ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000003', 'PROMORANG_DROP', 'SYSTEM_EVENT', 'Drop completion 3', 'promorang_drops', NOW() - INTERVAL '15 days'),
    ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000003', 'CONTENT_CONTRIBUTION', 'PROOF_UPLOAD', 'Proof submission 2', 'content', NOW() - INTERVAL '10 days'),
    ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000003', 'PROMORANG_DROP', 'SYSTEM_EVENT', 'Drop completion 4', 'promorang_drops', NOW() - INTERVAL '5 days'),
    ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000003', 'CONTENT_CONTRIBUTION', 'PROOF_UPLOAD', 'Proof submission 3', 'content', NOW() - INTERVAL '2 days'),
    ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000003', 'PROMORANG_DROP', 'SYSTEM_EVENT', 'Drop completion 5', 'promorang_drops', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
