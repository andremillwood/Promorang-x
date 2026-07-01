-- PromoShare super-admin demo flow seed.
-- Run this after 202606170001_promoshare_governance_hardening.sql.
-- It creates a fresh active demo draw with sponsor-backed pool items,
-- legacy tickets for the current dashboard, and governance entries/stats
-- for the newer PromoShare draw model.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.users (id, email, username, display_name, user_type, points_balance, keys_balance, gems_balance, user_tier, avatar_url)
VALUES
  ('00000000-0000-0000-0000-00000000a501', 'promoshare.sponsor.demo@promorang.com', 'promoshare_demo_sponsor', 'PromoShare Demo Sponsor', 'brand', 0, 0, 0, 'pro', 'https://api.dicebear.com/7.x/avataaars/svg?seed=promoshare-sponsor'),
  ('00000000-0000-0000-0000-00000000a502', 'promoshare.participant.one@promorang.com', 'promoshare_participant_one', 'PromoShare Participant One', 'creator', 320, 8, 0, 'free', 'https://api.dicebear.com/7.x/avataaars/svg?seed=promoshare-one'),
  ('00000000-0000-0000-0000-00000000a503', 'promoshare.participant.two@promorang.com', 'promoshare_participant_two', 'PromoShare Participant Two', 'creator', 540, 14, 0, 'pro', 'https://api.dicebear.com/7.x/avataaars/svg?seed=promoshare-two'),
  ('00000000-0000-0000-0000-00000000a504', 'promoshare.participant.three@promorang.com', 'promoshare_participant_three', 'PromoShare Participant Three', 'participant', 180, 4, 0, 'free', 'https://api.dicebear.com/7.x/avataaars/svg?seed=promoshare-three')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  user_type = EXCLUDED.user_type,
  points_balance = EXCLUDED.points_balance,
  keys_balance = EXCLUDED.keys_balance,
  user_tier = EXCLUDED.user_tier,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();

WITH demo_cycle AS (
  INSERT INTO public.promoshare_cycles (
    cycle_type,
    status,
    start_at,
    end_at,
    jackpot_amount,
    is_rollover,
    config,
    pool_scope,
    pool_rule_config,
    draw_policy,
    fraud_config,
    legal_config,
    platform_budget_config
  )
  VALUES (
    'daily',
    'active',
    now() - interval '1 hour',
    now() + interval '23 hours',
    175,
    false,
    '{"demo_flow":true,"demo_name":"super_admin_promoshare_demo","created_for":"super_admin_testing"}'::jsonb,
    'sponsor',
    '{"actions":["check_in","share_content","refer_friend"],"pool_assignment":"rule_based","proof_required":true,"eligible_draws":["daily","weekly","grand"],"ticket_expiry_hours":24}'::jsonb,
    '{"selection_method":"random_weighted_by_entries","one_win_per_user_per_draw":true,"tickets_can_count_across_eligible_cycles":true,"leaderboard_prizes_are_separate":true}'::jsonb,
    '{"max_entries_per_user_per_day":10,"max_entries_per_user_per_cycle":50,"duplicate_source_blocked":true,"proof_required_for_reward_bearing_pools":true,"manual_review_threshold":75}'::jsonb,
    '{"odds_depend_on_eligible_entries":true,"no_purchase_necessary_required":false,"reward_bearing_requires_funded_value":true}'::jsonb,
    '{"funding_source":"sponsor_demo","committed_value":175,"platform_funded":false,"negative_balance_allowed":false}'::jsonb
  )
  RETURNING id
),
pool_items AS (
  INSERT INTO public.promoshare_pool_items (cycle_id, reward_type, amount, description, sponsor_id)
  SELECT id, 'coupon', 75, 'Demo sponsor reward: $75 store credit', '00000000-0000-0000-0000-00000000a501'
  FROM demo_cycle
  UNION ALL
  SELECT id, 'product', 1, 'Demo sponsor reward: featured product bundle', '00000000-0000-0000-0000-00000000a501'
  FROM demo_cycle
  UNION ALL
  SELECT id, 'key', 10, 'Demo platform reward: 10 keys', '00000000-0000-0000-0000-00000000a501'
  FROM demo_cycle
  RETURNING id
),
legacy_tickets AS (
  INSERT INTO public.promoshare_tickets (cycle_id, user_id, ticket_number, source_action, source_id, multiplier)
  SELECT id, '00000000-0000-0000-0000-00000000a502', 120101, 'check_in', 'demo-checkin-001', 1.0 FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a502', 120102, 'share_content', 'demo-share-001', 1.2 FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a503', 220201, 'check_in', 'demo-checkin-002', 1.0 FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a503', 220202, 'refer_friend', 'demo-referral-001', 1.5 FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a503', 220203, 'share_content', 'demo-share-002', 1.2 FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a504', 330301, 'check_in', 'demo-checkin-003', 1.0 FROM demo_cycle
  RETURNING id
),
governance_entries AS (
  INSERT INTO public.promoshare_entries (
    cycle_id,
    user_id,
    source_type,
    source_action,
    source_id,
    entry_count,
    weight_value,
    metadata,
    proof_status,
    eligibility_expires_at,
    pool_scope,
    rule_snapshot
  )
  SELECT id, '00000000-0000-0000-0000-00000000a502', 'moment', 'check_in', 'demo-checkin-001', 1, 1.0, '{"demo":true,"moment":"Demo Coffee Check-In"}'::jsonb, 'verified', now() + interval '23 hours', 'sponsor', '{"eligible_draws":["daily","weekly","grand"],"reason":"verified_check_in"}'::jsonb FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a502', 'content', 'share_content', 'demo-share-001', 1, 1.2, '{"demo":true,"channel":"instagram"}'::jsonb, 'verified', now() + interval '23 hours', 'sponsor', '{"eligible_draws":["daily","weekly","grand"],"reason":"verified_share"}'::jsonb FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a503', 'moment', 'check_in', 'demo-checkin-002', 1, 1.0, '{"demo":true,"moment":"Demo Lunch Check-In"}'::jsonb, 'verified', now() + interval '23 hours', 'sponsor', '{"eligible_draws":["daily","weekly","grand"],"reason":"verified_check_in"}'::jsonb FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a503', 'referral', 'refer_friend', 'demo-referral-001', 1, 1.5, '{"demo":true,"referred_user":"demo_friend"}'::jsonb, 'verified', now() + interval '23 hours', 'sponsor', '{"eligible_draws":["daily","weekly","grand"],"reason":"verified_referral"}'::jsonb FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a503', 'content', 'share_content', 'demo-share-002', 1, 1.2, '{"demo":true,"channel":"tiktok"}'::jsonb, 'verified', now() + interval '23 hours', 'sponsor', '{"eligible_draws":["daily","weekly","grand"],"reason":"verified_share"}'::jsonb FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a504', 'moment', 'check_in', 'demo-checkin-003', 1, 1.0, '{"demo":true,"moment":"Demo Newcomer Check-In"}'::jsonb, 'verified', now() + interval '23 hours', 'sponsor', '{"eligible_draws":["daily","weekly","grand"],"reason":"verified_check_in"}'::jsonb FROM demo_cycle
  RETURNING id
),
user_stats AS (
  INSERT INTO public.promoshare_user_stats (
    cycle_id,
    user_id,
    eligible,
    status,
    verified_moves_count,
    moments_joined_count,
    proofs_submitted_count,
    proofs_approved_count,
    referral_count,
    total_entries,
    base_entry_score,
    activity_score,
    referral_bonus,
    tier_multiplier,
    final_weight,
    streak_days,
    rank_at_selection,
    risk_score,
    disqualified,
    manual_review_required,
    first_activity_at,
    last_activity_at,
    last_computed_at
  )
  SELECT id, '00000000-0000-0000-0000-00000000a502', true, 'qualified', 2, 1, 2, 2, 0, 2, 2, 22, 0, 1.0, 2.2, 2, 2, 0, false, false, now() - interval '45 minutes', now() - interval '20 minutes', now() FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a503', true, 'boosted', 3, 1, 3, 3, 1, 3, 3, 36, 3, 1.5, 5.85, 4, 1, 0, false, false, now() - interval '50 minutes', now() - interval '10 minutes', now() FROM demo_cycle
  UNION ALL
  SELECT id, '00000000-0000-0000-0000-00000000a504', true, 'qualified', 1, 1, 1, 1, 0, 1, 1, 12, 0, 1.0, 1.2, 1, 3, 0, false, false, now() - interval '35 minutes', now() - interval '30 minutes', now() FROM demo_cycle
  RETURNING id
),
audit_rows AS (
  INSERT INTO public.promoshare_audit_log (cycle_id, user_id, action_type, actor_type, actor_id, payload)
  SELECT id, '00000000-0000-0000-0000-00000000a501', 'demo_flow_seeded', 'super_admin', '00000000-0000-0000-0000-00000000a501', '{"demo":true,"message":"Super admin PromoShare demo flow seeded"}'::jsonb
  FROM demo_cycle
  RETURNING id
)
SELECT
  demo_cycle.id AS demo_cycle_id,
  (SELECT count(*) FROM pool_items) AS pool_items_created,
  (SELECT count(*) FROM legacy_tickets) AS tickets_created,
  (SELECT count(*) FROM governance_entries) AS entries_created,
  (SELECT count(*) FROM user_stats) AS user_stats_created,
  (SELECT count(*) FROM audit_rows) AS audit_rows_created
FROM demo_cycle;
