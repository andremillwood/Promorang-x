-- Promorang Growth Partner Program Seed Data
-- Timestamp: 2026-01-10
-- Creates demo Growth Partner user and sample data for testing

-- ============================================================================
-- DEMO GROWTH PARTNER USER
-- ============================================================================

-- Insert demo Growth Partner user (matrix_demo@promorang.co)
insert into public.users (
  id,
  email,
  username,
  display_name,
  user_type,
  points_balance,
  keys_balance,
  gems_balance,
  gold_collected,
  user_tier,
  avatar_url
) values (
  'a0000000-0000-0000-0000-000000000100',
  'matrix_demo@promorang.co',
  'growth_partner',
  'Growth Partner Demo',
  'matrix_builder',
  15000,
  250,
  500,
  1200,
  'premium',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=matrixbuilder'
) on conflict (id) do update set
  email = excluded.email,
  username = excluded.username,
  display_name = excluded.display_name,
  user_type = excluded.user_type;

-- Create additional demo recruits for the Matrix demo user
insert into public.users (id, email, username, display_name, user_type, points_balance, gems_balance, avatar_url) values
  ('a0000000-0000-0000-0000-000000000101', 'recruit1@demo.com', 'sarah_recruit', 'Sarah Johnson', 'user', 5000, 100, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'),
  ('a0000000-0000-0000-0000-000000000102', 'recruit2@demo.com', 'mike_recruit', 'Mike Chen', 'user', 3500, 75, 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'),
  ('a0000000-0000-0000-0000-000000000103', 'recruit3@demo.com', 'emma_recruit', 'Emma Williams', 'user', 4200, 90, 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma'),
  ('a0000000-0000-0000-0000-000000000104', 'recruit4@demo.com', 'james_recruit', 'James Brown', 'user', 2800, 60, 'https://api.dicebear.com/7.x/avataaars/svg?seed=james'),
  ('a0000000-0000-0000-0000-000000000105', 'recruit5@demo.com', 'lisa_recruit', 'Lisa Davis', 'user', 6100, 120, 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa'),
  ('a0000000-0000-0000-0000-000000000106', 'recruit6@demo.com', 'david_recruit', 'David Wilson', 'user', 1500, 40, 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'),
  ('a0000000-0000-0000-0000-000000000107', 'recruit7@demo.com', 'amy_recruit', 'Amy Taylor', 'user', 4800, 95, 'https://api.dicebear.com/7.x/avataaars/svg?seed=amy'),
  ('a0000000-0000-0000-0000-000000000108', 'recruit8@demo.com', 'chris_recruit', 'Chris Martinez', 'user', 3200, 70, 'https://api.dicebear.com/7.x/avataaars/svg?seed=chris')
on conflict (id) do nothing;

-- Second-level recruits (recruited by first-level)
insert into public.users (id, email, username, display_name, user_type, points_balance, gems_balance, avatar_url) values
  ('a0000000-0000-0000-0000-000000000111', 'l2recruit1@demo.com', 'alex_l2', 'Alex Thompson', 'user', 2000, 50, 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'),
  ('a0000000-0000-0000-0000-000000000112', 'l2recruit2@demo.com', 'nina_l2', 'Nina Garcia', 'user', 1800, 45, 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina'),
  ('a0000000-0000-0000-0000-000000000113', 'l2recruit3@demo.com', 'ryan_l2', 'Ryan Lee', 'user', 2200, 55, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan'),
  ('a0000000-0000-0000-0000-000000000114', 'l2recruit4@demo.com', 'olivia_l2', 'Olivia Moore', 'user', 1600, 40, 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia')
on conflict (id) do nothing;

-- ============================================================================
-- MATRIX INSTANCE
-- ============================================================================

insert into public.matrix_instances (
  id,
  name,
  description,
  status,
  effective_from,
  config_json
) values (
  'b0000000-0000-0000-0000-000000000001',
  'Promorang Matrix v1',
  'The official Promorang Growth Partner team building compensation system',
  'active',
  now() - interval '30 days',
  '{
    "period_type": "weekly",
    "payout_delay_days": 7,
    "direct_commission": { "percent": 20, "eligible_tiers": ["user_50","user_100","user_200","user_500"] },
    "residual_commission": { "percent": 10, "eligible_tiers": ["user_50","user_100","user_200","user_500"] },
    "qualification": {
      "requires_active_subscription": true,
      "min_personal_active_recruits": 2,
      "support_actions_per_recruit_per_period": 1,
      "min_support_actions_total_per_period": 3,
      "unlock_depth_by_rank": true,
      "retention_thresholds": { "promoranger": 0.3, "entered_apprentice": 0.5, "presidential": 0.7, "diamond": 0.8, "blue_diamond": 0.9 }
    },
    "caps": {
      "weekly_cap_by_rank": { "promoranger": 5000, "entered_apprentice": 10000, "presidential": 25000, "diamond": 50000, "blue_diamond": 100000 }
    },
    "clawbacks": {
      "on_chargeback": true,
      "on_refund_within_days": 30
    }
  }'::jsonb
) on conflict (id) do nothing;

-- ============================================================================
-- MATRIX RANKS
-- ============================================================================

insert into public.matrix_ranks (id, matrix_instance_id, rank_key, rank_name, order_index, weekly_cap_cents, eligible_depth, min_active_recruits, min_team_size, min_retention_rate, commission_rate_direct, commission_rate_residual, rank_bonus_cents, badge_icon, badge_color) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'promoranger', 'Promoranger', 1, 500000, 1, 0, 0, 0.00, 20.00, 10.00, 0, '🌟', '#6366f1'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'entered_apprentice', 'Entered Apprentice', 2, 1000000, 2, 3, 5, 0.50, 22.00, 12.00, 5000, '⭐', '#8b5cf6'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'fellow_craft', 'Fellow Craft', 3, 1500000, 3, 5, 15, 0.55, 24.00, 14.00, 10000, '🌙', '#a855f7'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'master_mason', 'Master Mason', 4, 2000000, 4, 8, 30, 0.60, 26.00, 16.00, 25000, '🔮', '#d946ef'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'presidential', 'Presidential', 5, 2500000, 5, 12, 50, 0.70, 28.00, 18.00, 50000, '👑', '#ec4899'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'diamond', 'Diamond', 6, 5000000, 6, 20, 100, 0.80, 30.00, 20.00, 100000, '💎', '#f43f5e'),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'blue_diamond', 'Blue Diamond', 7, 10000000, 7, 35, 250, 0.90, 32.00, 22.00, 250000, '💠', '#0ea5e9')
on conflict (id) do nothing;

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

-- Demo Matrix user subscription ($100 tier)
insert into public.matrix_subscriptions (id, user_id, tier, status, amount_cents, start_at, current_period_start, current_period_end) values
  ('d0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000100', 'user_100', 'active', 10000, now() - interval '90 days', now() - interval '5 days', now() + interval '25 days')
on conflict (user_id) do update set status = 'active', tier = 'user_100';

-- First-level recruit subscriptions (mix of active and past_due)
insert into public.matrix_subscriptions (id, user_id, tier, status, amount_cents, start_at, current_period_start, current_period_end) values
  ('d0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000101', 'user_50', 'active', 5000, now() - interval '60 days', now() - interval '10 days', now() + interval '20 days'),
  ('d0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000102', 'user_50', 'active', 5000, now() - interval '45 days', now() - interval '8 days', now() + interval '22 days'),
  ('d0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000103', 'user_100', 'active', 10000, now() - interval '30 days', now() - interval '3 days', now() + interval '27 days'),
  ('d0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000104', 'user_50', 'past_due', 5000, now() - interval '75 days', now() - interval '15 days', now() - interval '5 days'),
  ('d0000000-0000-0000-0000-000000000105', 'a0000000-0000-0000-0000-000000000105', 'user_100', 'active', 10000, now() - interval '55 days', now() - interval '7 days', now() + interval '23 days'),
  ('d0000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000106', 'user_50', 'canceled', 5000, now() - interval '40 days', now() - interval '20 days', now() - interval '10 days'),
  ('d0000000-0000-0000-0000-000000000107', 'a0000000-0000-0000-0000-000000000107', 'user_50', 'active', 5000, now() - interval '25 days', now() - interval '2 days', now() + interval '28 days'),
  ('d0000000-0000-0000-0000-000000000108', 'a0000000-0000-0000-0000-000000000108', 'user_50', 'active', 5000, now() - interval '20 days', now() - interval '1 day', now() + interval '29 days')
on conflict (user_id) do nothing;

-- Second-level recruit subscriptions
insert into public.matrix_subscriptions (id, user_id, tier, status, amount_cents, start_at, current_period_start, current_period_end) values
  ('d0000000-0000-0000-0000-000000000111', 'a0000000-0000-0000-0000-000000000111', 'user_50', 'active', 5000, now() - interval '15 days', now() - interval '1 day', now() + interval '29 days'),
  ('d0000000-0000-0000-0000-000000000112', 'a0000000-0000-0000-0000-000000000112', 'user_50', 'active', 5000, now() - interval '12 days', now() - interval '1 day', now() + interval '29 days'),
  ('d0000000-0000-0000-0000-000000000113', 'a0000000-0000-0000-0000-000000000113', 'user_50', 'past_due', 5000, now() - interval '18 days', now() - interval '10 days', now() - interval '2 days'),
  ('d0000000-0000-0000-0000-000000000114', 'a0000000-0000-0000-0000-000000000114', 'user_50', 'active', 5000, now() - interval '10 days', now() - interval '1 day', now() + interval '29 days')
on conflict (user_id) do nothing;

-- ============================================================================
-- SPONSOR LINKS
-- ============================================================================

-- Demo user sponsors first-level recruits
insert into public.matrix_sponsor_links (sponsor_user_id, recruit_user_id, source, linked_at) values
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000101', 'referral_link', now() - interval '60 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000102', 'referral_link', now() - interval '45 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000103', 'referral_link', now() - interval '30 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000104', 'referral_link', now() - interval '75 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000105', 'referral_link', now() - interval '55 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000106', 'referral_link', now() - interval '40 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000107', 'referral_link', now() - interval '25 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000108', 'referral_link', now() - interval '20 days')
on conflict (recruit_user_id) do nothing;

-- First-level recruits sponsor second-level
insert into public.matrix_sponsor_links (sponsor_user_id, recruit_user_id, source, linked_at) values
  ('a0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000111', 'referral_link', now() - interval '15 days'),
  ('a0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000112', 'referral_link', now() - interval '12 days'),
  ('a0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000113', 'referral_link', now() - interval '18 days'),
  ('a0000000-0000-0000-0000-000000000105', 'a0000000-0000-0000-0000-000000000114', 'referral_link', now() - interval '10 days')
on conflict (recruit_user_id) do nothing;

-- ============================================================================
-- USER RANK STATUS
-- ============================================================================

-- Demo user is at "Entered Apprentice" rank
insert into public.matrix_user_rank_status (matrix_instance_id, user_id, rank_id, achieved_at, is_current) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'c0000000-0000-0000-0000-000000000001', now() - interval '90 days', false),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'c0000000-0000-0000-0000-000000000002', now() - interval '45 days', true)
on conflict (matrix_instance_id, user_id, rank_id) do nothing;

-- First-level recruits at Promoranger rank
insert into public.matrix_user_rank_status (matrix_instance_id, user_id, rank_id, achieved_at, is_current) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000101', 'c0000000-0000-0000-0000-000000000001', now() - interval '60 days', true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000102', 'c0000000-0000-0000-0000-000000000001', now() - interval '45 days', true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000103', 'c0000000-0000-0000-0000-000000000001', now() - interval '30 days', true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000105', 'c0000000-0000-0000-0000-000000000001', now() - interval '55 days', true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000107', 'c0000000-0000-0000-0000-000000000001', now() - interval '25 days', true),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000108', 'c0000000-0000-0000-0000-000000000001', now() - interval '20 days', true)
on conflict (matrix_instance_id, user_id, rank_id) do nothing;

-- ============================================================================
-- QUALIFICATION PERIODS
-- ============================================================================

-- Create past and current qualification periods
insert into public.matrix_qualification_periods (id, matrix_instance_id, period_type, period_start, period_end, status) values
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'weekly', now() - interval '21 days', now() - interval '14 days', 'paid'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'weekly', now() - interval '14 days', now() - interval '7 days', 'paid'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'weekly', now() - interval '7 days', now(), 'closed'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'weekly', now(), now() + interval '7 days', 'open')
on conflict (id) do nothing;

-- ============================================================================
-- QUALIFICATION STATUS
-- ============================================================================

-- Demo user qualification status (passed)
insert into public.matrix_qualification_status (period_id, user_id, status, reasons_json, active_recruits_count, total_team_size, retention_rate, support_actions_count, computed_at) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'pass', '["All requirements met"]'::jsonb, 5, 8, 0.75, 8, now() - interval '14 days'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', 'pass', '["All requirements met"]'::jsonb, 6, 10, 0.80, 10, now() - interval '7 days'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'pass', '["All requirements met"]'::jsonb, 6, 12, 0.75, 9, now()),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000100', 'pending', '[]'::jsonb, 6, 12, 0.75, 4, null)
on conflict (period_id, user_id) do nothing;

-- ============================================================================
-- SUPPORT LOGS
-- ============================================================================

-- Demo user support actions
insert into public.matrix_support_logs (sponsor_user_id, recruit_user_id, period_id, action_type, notes, verified, created_at) values
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000101', 'e0000000-0000-0000-0000-000000000003', 'onboarding_complete', 'Completed full onboarding walkthrough', true, now() - interval '5 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000101', 'e0000000-0000-0000-0000-000000000003', 'check_in', 'Weekly progress check-in call', true, now() - interval '3 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000102', 'e0000000-0000-0000-0000-000000000003', 'training_attended', 'Attended team training session', true, now() - interval '4 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000103', 'e0000000-0000-0000-0000-000000000003', 'check_in', 'Strategy call for growth', true, now() - interval '2 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000105', 'e0000000-0000-0000-0000-000000000003', 'activation_help', 'Helped set up first campaign', true, now() - interval '6 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000107', 'e0000000-0000-0000-0000-000000000003', 'onboarding_complete', 'New recruit onboarding', true, now() - interval '4 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000108', 'e0000000-0000-0000-0000-000000000003', 'message_sent', 'Welcome message and resources', true, now() - interval '1 day'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000104', 'e0000000-0000-0000-0000-000000000003', 'check_in', 'Retention outreach - payment issue', true, now() - interval '2 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000106', 'e0000000-0000-0000-0000-000000000003', 'check_in', 'Win-back attempt', false, now() - interval '3 days')
on conflict do nothing;

-- Current period support logs
insert into public.matrix_support_logs (sponsor_user_id, recruit_user_id, period_id, action_type, notes, verified, created_at) values
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000101', 'e0000000-0000-0000-0000-000000000004', 'check_in', 'Weekly check-in', true, now() - interval '1 hour'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000102', 'e0000000-0000-0000-0000-000000000004', 'training_attended', 'Advanced training', true, now() - interval '2 hours'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000103', 'e0000000-0000-0000-0000-000000000004', 'message_sent', 'Growth tips shared', true, now() - interval '30 minutes'),
  ('a0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000105', 'e0000000-0000-0000-0000-000000000004', 'check_in', 'Performance review', true, now() - interval '3 hours')
on conflict do nothing;

-- ============================================================================
-- EARNINGS LEDGER
-- ============================================================================

-- Past period earnings (paid)
insert into public.matrix_earnings_ledger (period_id, user_id, source_type, source_ref_type, source_ref_id, amount_cents, status, metadata_json, created_at) values
  -- Period 1 earnings
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'direct_commission', 'subscription', 'd0000000-0000-0000-0000-000000000107', 1000, 'paid', '{"recruit": "amy_recruit", "tier": "user_50"}'::jsonb, now() - interval '20 days'),
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000101', 500, 'paid', '{"recruit": "sarah_recruit", "renewal": true}'::jsonb, now() - interval '19 days'),
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000102', 500, 'paid', '{"recruit": "mike_recruit", "renewal": true}'::jsonb, now() - interval '19 days'),
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000103', 1000, 'paid', '{"recruit": "emma_recruit", "renewal": true}'::jsonb, now() - interval '18 days'),
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000105', 1000, 'paid', '{"recruit": "lisa_recruit", "renewal": true}'::jsonb, now() - interval '18 days'),
  
  -- Period 2 earnings
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', 'direct_commission', 'subscription', 'd0000000-0000-0000-0000-000000000108', 1000, 'paid', '{"recruit": "chris_recruit", "tier": "user_50"}'::jsonb, now() - interval '13 days'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000101', 500, 'paid', '{"recruit": "sarah_recruit", "renewal": true}'::jsonb, now() - interval '12 days'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000102', 500, 'paid', '{"recruit": "mike_recruit", "renewal": true}'::jsonb, now() - interval '12 days'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000103', 1000, 'paid', '{"recruit": "emma_recruit", "renewal": true}'::jsonb, now() - interval '11 days'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000105', 1000, 'paid', '{"recruit": "lisa_recruit", "renewal": true}'::jsonb, now() - interval '11 days'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000107', 500, 'paid', '{"recruit": "amy_recruit", "renewal": true}'::jsonb, now() - interval '10 days'),
  
  -- Period 3 earnings (closed, eligible for payout)
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000101', 500, 'eligible', '{"recruit": "sarah_recruit", "renewal": true}'::jsonb, now() - interval '5 days'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000102', 500, 'eligible', '{"recruit": "mike_recruit", "renewal": true}'::jsonb, now() - interval '5 days'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000103', 1000, 'eligible', '{"recruit": "emma_recruit", "renewal": true}'::jsonb, now() - interval '4 days'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000105', 1000, 'eligible', '{"recruit": "lisa_recruit", "renewal": true}'::jsonb, now() - interval '4 days'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000107', 500, 'eligible', '{"recruit": "amy_recruit", "renewal": true}'::jsonb, now() - interval '3 days'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000108', 500, 'eligible', '{"recruit": "chris_recruit", "renewal": true}'::jsonb, now() - interval '2 days'),
  
  -- Level 2 earnings (from second-level recruits)
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000111', 250, 'eligible', '{"recruit": "alex_l2", "level": 2, "renewal": true}'::jsonb, now() - interval '3 days'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000112', 250, 'eligible', '{"recruit": "nina_l2", "level": 2, "renewal": true}'::jsonb, now() - interval '3 days'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000114', 250, 'eligible', '{"recruit": "olivia_l2", "level": 2, "renewal": true}'::jsonb, now() - interval '2 days'),
  
  -- Current period pending earnings
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000101', 500, 'pending', '{"recruit": "sarah_recruit", "renewal": true}'::jsonb, now() - interval '1 hour'),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000100', 'residual_commission', 'subscription', 'd0000000-0000-0000-0000-000000000102', 500, 'pending', '{"recruit": "mike_recruit", "renewal": true}'::jsonb, now() - interval '1 hour')
on conflict do nothing;

-- ============================================================================
-- SUBSCRIPTION EVENTS
-- ============================================================================

insert into public.matrix_subscription_events (subscription_id, user_id, event_type, amount_cents, metadata_json, created_at) values
  ('d0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000100', 'activated', 10000, '{"tier": "user_100"}'::jsonb, now() - interval '90 days'),
  ('d0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000100', 'renewed', 10000, '{"tier": "user_100", "period": 2}'::jsonb, now() - interval '60 days'),
  ('d0000000-0000-0000-0000-000000000100', 'a0000000-0000-0000-0000-000000000100', 'renewed', 10000, '{"tier": "user_100", "period": 3}'::jsonb, now() - interval '30 days'),
  ('d0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000101', 'activated', 5000, '{"tier": "user_50", "sponsor": "matrix_builder"}'::jsonb, now() - interval '60 days'),
  ('d0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000102', 'activated', 5000, '{"tier": "user_50", "sponsor": "matrix_builder"}'::jsonb, now() - interval '45 days'),
  ('d0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000103', 'activated', 10000, '{"tier": "user_100", "sponsor": "matrix_builder"}'::jsonb, now() - interval '30 days'),
  ('d0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000104', 'activated', 5000, '{"tier": "user_50", "sponsor": "matrix_builder"}'::jsonb, now() - interval '75 days'),
  ('d0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000104', 'failed', 5000, '{"reason": "card_declined"}'::jsonb, now() - interval '5 days'),
  ('d0000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000106', 'activated', 5000, '{"tier": "user_50", "sponsor": "matrix_builder"}'::jsonb, now() - interval '40 days'),
  ('d0000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000106', 'canceled', 0, '{"reason": "user_requested"}'::jsonb, now() - interval '10 days')
on conflict do nothing;

-- ============================================================================
-- PAYOUT REQUESTS
-- ============================================================================

insert into public.matrix_payout_requests (id, user_id, period_id, requested_amount_cents, approved_amount_cents, status, processed_at, created_at) values
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'e0000000-0000-0000-0000-000000000001', 4000, 4000, 'paid', now() - interval '13 days', now() - interval '14 days'),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', 'e0000000-0000-0000-0000-000000000002', 5000, 5000, 'paid', now() - interval '6 days', now() - interval '7 days')
on conflict (id) do nothing;

-- ============================================================================
-- TRAINING MODULES
-- ============================================================================

insert into public.matrix_training_modules (id, matrix_instance_id, title, description, content_url, duration_minutes, required_for_rank, order_index, is_required) values
  ('a1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Matrix Fundamentals', 'Learn the basics of the Promorang Matrix compensation system', '/training/matrix-101', 30, null, 1, true),
  ('a1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Recruiting Best Practices', 'How to effectively recruit and onboard new team members', '/training/recruiting', 45, null, 2, true),
  ('a1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Support & Retention', 'Strategies for supporting your team and maintaining retention', '/training/retention', 40, 'entered_apprentice', 3, false),
  ('a1000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Leadership Development', 'Advanced leadership skills for building a successful team', '/training/leadership', 60, 'presidential', 4, false),
  ('a1000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Compliance & Ethics', 'Understanding compliance requirements and ethical practices', '/training/compliance', 25, null, 5, true)
on conflict (id) do nothing;

-- Demo user training completions
insert into public.matrix_training_completions (module_id, user_id, completed_at, score) values
  ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', now() - interval '85 days', 95.00),
  ('a1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000100', now() - interval '80 days', 88.00),
  ('a1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000100', now() - interval '40 days', 92.00),
  ('a1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000100', now() - interval '75 days', 100.00)
on conflict (module_id, user_id) do nothing;

-- ============================================================================
-- ONBOARDING ITEMS
-- ============================================================================

insert into public.matrix_onboarding_items (id, matrix_instance_id, title, description, order_index, is_required) values
  ('a2000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Complete Profile', 'Fill out your complete profile information', 1, true),
  ('a2000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Watch Welcome Video', 'Watch the Matrix welcome and overview video', 2, true),
  ('a2000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Complete Matrix 101 Training', 'Complete the Matrix Fundamentals training module', 3, true),
  ('a2000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Set Up Payout Account', 'Configure your payout method for receiving earnings', 4, true),
  ('a2000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Get Your Referral Link', 'Generate and share your personal referral link', 5, true),
  ('a2000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'First Recruit', 'Successfully recruit your first team member', 6, false)
on conflict (id) do nothing;

-- Demo user onboarding progress (all complete)
insert into public.matrix_onboarding_progress (user_id, item_id, completed_at) values
  ('a0000000-0000-0000-0000-000000000100', 'a2000000-0000-0000-0000-000000000001', now() - interval '89 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a2000000-0000-0000-0000-000000000002', now() - interval '89 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a2000000-0000-0000-0000-000000000003', now() - interval '85 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a2000000-0000-0000-0000-000000000004', now() - interval '88 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a2000000-0000-0000-0000-000000000005', now() - interval '87 days'),
  ('a0000000-0000-0000-0000-000000000100', 'a2000000-0000-0000-0000-000000000006', now() - interval '60 days')
on conflict (user_id, item_id) do nothing;

-- ============================================================================
-- PAYOUT ACCOUNT FOR DEMO USER
-- ============================================================================

insert into public.matrix_payout_accounts (id, user_id, method, details_json, is_default, is_verified) values
  ('a3000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000100', 'bank', '{"bank_name": "Demo Bank", "account_last4": "1234", "routing_last4": "5678"}'::jsonb, true, true)
on conflict (id) do nothing;
