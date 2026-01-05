-- Seed demo data for advertiser, investor, creator experiences
-- Timestamp: 2025-11-08

-- Ensure demo users exist
insert into public.users (id, email, username, display_name, user_type, advertiser_tier, points_balance, gems_balance, keys_balance, gold_collected, avatar_url)
values
  ('00000000-0000-0000-0000-00000000ad01', 'advertiser@demo.com', 'demo_advertiser', 'Demo Advertiser', 'advertiser', 'premium', 12500, 2500, 320, 42, 'https://api.dicebear.com/7.x/avataaars/svg?seed=advertiser'),
  ('00000000-0000-0000-0000-00000000b001', 'investor@demo.com', 'demo_investor', 'Demo Investor', 'investor', null, 7600, 1800, 210, 28, 'https://api.dicebear.com/7.x/avataaars/svg?seed=investor'),
  ('00000000-0000-0000-0000-00000000c001', 'creator@demo.com', 'demo_creator', 'Demo Creator', 'creator', null, 18400, 3200, 480, 65, 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator')
on conflict (username) do update set
  email = excluded.email,
  display_name = excluded.display_name,
  user_type = excluded.user_type,
  advertiser_tier = excluded.advertiser_tier,
  points_balance = excluded.points_balance,
  gems_balance = excluded.gems_balance,
  keys_balance = excluded.keys_balance,
  gold_collected = excluded.gold_collected,
  avatar_url = excluded.avatar_url,
  updated_at = timezone('utc', now());

-- Advertiser profile
insert into public.advertiser_profiles (user_id, company_name, company_website, company_description, industry, contact_email, monthly_budget, preferred_platforms, goals)
values (
  (select id from public.users where username = 'demo_advertiser' limit 1),
  'Aurora Labs',
  'https://aurora.demo',
  'Premium wellness products built for ambitious creators.',
  'Health & Wellness',
  'marketing@aurora.demo',
  25000,
  array['instagram','tiktok','youtube'],
  'Launch promo and always-on creator partnerships'
) on conflict (user_id) do update set
  company_name = excluded.company_name,
  company_website = excluded.company_website,
  company_description = excluded.company_description,
  industry = excluded.industry,
  contact_email = excluded.contact_email,
  monthly_budget = excluded.monthly_budget,
  preferred_platforms = excluded.preferred_platforms,
  goals = excluded.goals,
  updated_at = timezone('utc', now());

-- Advertiser campaigns
insert into public.advertiser_campaigns (id, advertiser_id, name, objective, status, start_date, end_date, total_budget, budget_spent, target_audience)
values
  ('10000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_advertiser' limit 1), 'Launch Campaign: Social Buzz', 'Drive viral social proof from top creators', 'active', current_date - 14, current_date + 30, 12000, 4200, '{"persona":"creators","focus":"wellness influencers"}'::jsonb),
  ('10000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_advertiser' limit 1), 'Product Review Blitz', 'Generate review content with measurable conversions', 'paused', current_date - 40, current_date - 5, 8000, 7600, '{"persona":"micro-influencers","focus":"honest reviews"}'::jsonb)
on conflict (id) do nothing;

-- Campaign metrics (weekly snapshots)
insert into public.advertiser_campaign_metrics (id, campaign_id, metric_date, impressions, clicks, conversions, spend, revenue)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', current_date - 14, 18500, 1240, 180, 1200, 3800),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', current_date - 7, 21200, 1580, 220, 1460, 4520),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', current_date, 24350, 1725, 265, 1750, 5360)
on conflict (id) do nothing;

-- Advertiser coupons
insert into public.advertiser_coupons (id, advertiser_id, title, description, reward_type, value, value_unit, quantity_total, quantity_remaining, start_date, end_date, status, conditions)
values
  ('30000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_advertiser' limit 1), '50% Off Premium Subscription', 'Reward top leaderboard creators with a half-off upgrade.', 'coupon', 50, 'percentage', 25, 23, timezone('utc', now()) - interval '3 days', timezone('utc', now()) + interval '11 days', 'active', '{"leaderboard_position_min":1,"leaderboard_position_max":25}'::jsonb),
  ('30000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_advertiser' limit 1), 'Creator Merch Pack', 'Ship merch to creators completing proof drops in Campaign 01.', 'giveaway', 1, 'item', 10, 8, timezone('utc', now()) - interval '10 days', timezone('utc', now()) + interval '20 days', 'active', '{"drop_ids":["drop-1"]}'::jsonb)
on conflict (id) do nothing;

-- Coupon assignments linking to drops/campaigns
insert into public.advertiser_coupon_assignments (id, coupon_id, target_type, target_id, target_label, status)
values
  ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'drop', 'drop-1', 'Launch Campaign: Social Buzz', 'active'),
  ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'leaderboard', 'daily-top-25', 'Daily Leaderboard Top 25', 'active')
on conflict (id) do nothing;

-- Coupon redemption history
insert into public.advertiser_coupon_redemptions (id, coupon_id, user_id, user_name, redeemed_at, reward_value, reward_unit, status)
values
  ('32000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_creator' limit 1), 'Demo Creator', timezone('utc', now()) - interval '1 day', 50, 'percentage', 'completed'),
  ('32000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_creator' limit 1), 'Demo Creator', timezone('utc', now()) - interval '2 days', 1, 'item', 'completed')
on conflict (id) do nothing;

-- Leaderboard entries
insert into public.leaderboard_entries (id, user_id, period_type, period_start, period_end, rank, points_earned, gems_earned, keys_used, gold_collected, composite_score, trend)
values
  ('40000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_creator' limit 1), 'daily', current_date - 1, current_date - 1, 1, 2850, 560, 12, 18, 92.4, 'up'),
  ('40000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_creator' limit 1), 'weekly', current_date - 7, current_date - 1, 2, 13800, 2320, 45, 60, 88.6, 'steady'),
  ('40000000-0000-0000-0000-000000000003', (select id from public.users where username = 'demo_creator' limit 1), 'monthly', current_date - 30, current_date - 1, 3, 42800, 7120, 118, 174, 84.2, 'down')
on conflict (id) do nothing;

-- Social forecasts created by advertiser for investors
insert into public.social_forecasts (id, content_id, creator_id, platform, content_url, content_title, forecast_type, target_value, current_value, odds, pool_size, creator_initial_amount, creator_side, expires_at, status, participants)
values
  ('50000000-0000-0000-0000-000000000001', null, (select id from public.users where username = 'demo_advertiser' limit 1), 'instagram', 'https://instagram.com/p/demo-forecast', 'Aurora Detox Launch Reel', 'views', 25000, 18250, 1.85, 625.00, 125.00, 'over', timezone('utc', now()) + interval '3 days', 'active', 14),
  ('50000000-0000-0000-0000-000000000002', null, (select id from public.users where username = 'demo_advertiser' limit 1), 'tiktok', 'https://tiktok.com/@aurora/video/launch', 'Limited Run Challenge', 'likes', 18000, 11200, 1.65, 410.00, 90.00, 'under', timezone('utc', now()) + interval '1 day', 'active', 9)
on conflict (id) do nothing;

-- Investor predictions on forecasts
insert into public.investor_predictions (id, forecast_id, investor_id, prediction_amount, prediction_side, potential_payout, status)
values
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_investor' limit 1), 120.00, 'over', 222.00, 'active'),
  ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_investor' limit 1), 75.00, 'under', 123.75, 'active')
on conflict (id) do nothing;

-- Investor content shares
insert into public.investor_content_shares (id, investor_id, content_id, share_link, platform, campaign_id, clicks, impressions, conversions, reward_points, reward_gems, last_interaction_at)
values
  ('52000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_investor' limit 1), null, 'https://promorang.com/s/demo-share-1', 'instagram', '10000000-0000-0000-0000-000000000001', 420, 18200, 36, 920, 85, timezone('utc', now()) - interval '6 hours'),
  ('52000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_investor' limit 1), null, 'https://promorang.com/s/demo-share-2', 'tiktok', '10000000-0000-0000-0000-000000000001', 285, 14300, 22, 640, 60, timezone('utc', now()) - interval '1 day')
on conflict (id) do nothing;

-- Growth Hub staking channels
insert into public.staking_channels (id, name, description, min_stake, max_stake, base_apr, lock_period_days, status)
values
  ('60000000-0000-0000-0000-000000000001', 'Creator Accelerator', 'Moderate risk, weekly multipliers for scaling creators', 250, 7500, 18.5, 30, 'active'),
  ('60000000-0000-0000-0000-000000000002', 'Audience Booster', 'Flexible plan optimised for social engagement growth', 100, null, 12.5, 14, 'active')
on conflict (id) do nothing;

-- Creator staking positions
insert into public.staking_positions (id, user_id, channel_id, amount, multiplier, lock_until, status, earned_so_far, last_claimed_at)
values
  ('61000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_creator' limit 1), '60000000-0000-0000-0000-000000000001', 750, 1.35, timezone('utc', now()) + interval '20 days', 'active', 48.75, timezone('utc', now()) - interval '2 days'),
  ('61000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_creator' limit 1), '60000000-0000-0000-0000-000000000002', 320, 1.12, timezone('utc', now()) + interval '6 days', 'active', 12.80, timezone('utc', now()) - interval '12 hours')
on conflict (id) do nothing;

-- Funding projects in Growth Hub
insert into public.funding_projects (id, creator_id, title, description, target_amount, amount_raised, status, start_date, end_date, rewards)
values
  ('62000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_creator' limit 1), 'Immersive Wellness Studio Build', 'Upgrade studio for interactive livestream experiences.', 18000, 6200, 'active', timezone('utc', now()) - interval '5 days', timezone('utc', now()) + interval '25 days', '{"tiers":[{"amount":50,"title":"Supporter","description":"Shoutout during livestream"},{"amount":200,"title":"Backer","description":"Personalized wellness kit"}]}'::jsonb)
on conflict (id) do nothing;

-- Funding pledges from investor
insert into public.funding_pledges (id, project_id, backer_id, amount, reward_tier, status, created_at)
values
  ('63000000-0000-0000-0000-000000000001', '62000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_investor' limit 1), 250, 'Backer', 'pledged', timezone('utc', now()) - interval '1 day')
on conflict (id) do nothing;

-- Creator reward tiers
insert into public.creator_reward_tiers (id, name, description, metric, threshold, reward_type, reward_value, is_active)
values
  ('64000000-0000-0000-0000-000000000001', 'Bronze Views', 'Hit 10k views in a week', 'views', 10000, 'gems', 150, true),
  ('64000000-0000-0000-0000-000000000002', 'Silver Sales', 'Sell 75 paid shares', 'paid_shares', 75, 'usd', 45, true)
on conflict (id) do nothing;

-- Creator rewards earned
insert into public.creator_rewards (id, creator_id, reward_tier_id, metric, period_start, period_end, threshold, actual, reward_amount, reward_currency, status, metadata, approved_at)
values
  ('65000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_creator' limit 1), '64000000-0000-0000-0000-000000000001', 'views', current_date - 7, current_date - 1, 10000, 12840, 150, 'gems', 'approved', '{"campaign_id":"10000000-0000-0000-0000-000000000001"}'::jsonb, timezone('utc', now()) - interval '8 hours')
on conflict (id) do nothing;

-- Shield policies
insert into public.shield_policies (id, name, description, coverage_amount, premium_amount, duration_days, is_active)
values
  ('66000000-0000-0000-0000-000000000001', 'Basic Shield', 'Essential protection for growing creators', 2500, 45, 30, true),
  ('66000000-0000-0000-0000-000000000002', 'Deluxe Shield', 'Comprehensive coverage for high stakes investors', 10000, 125, 30, true)
on conflict (id) do nothing;

-- Shield subscriptions for demo users
insert into public.shield_subscriptions (id, user_id, policy_id, premium_paid, coverage_amount, started_at, expires_at, status)
values
  ('67000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_creator' limit 1), '66000000-0000-0000-0000-000000000001', 45, 2500, timezone('utc', now()) - interval '10 days', timezone('utc', now()) + interval '20 days', 'active'),
  ('67000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_investor' limit 1), '66000000-0000-0000-0000-000000000002', 125, 10000, timezone('utc', now()) - interval '5 days', timezone('utc', now()) + interval '25 days', 'active')
on conflict (id) do nothing;

-- Growth ledger entries capturing demo economics
insert into public.growth_ledger (id, user_id, source_type, source_id, amount, currency, status, metadata, created_at)
values
  ('68000000-0000-0000-0000-000000000001', (select id from public.users where username = 'demo_creator' limit 1), 'staking', '61000000-0000-0000-0000-000000000001', -750, 'gems', 'completed', '{"channel_id":"60000000-0000-0000-0000-000000000001"}'::jsonb, timezone('utc', now()) - interval '10 days'),
  ('68000000-0000-0000-0000-000000000002', (select id from public.users where username = 'demo_creator' limit 1), 'staking_claim', '61000000-0000-0000-0000-000000000001', 15.6, 'gems', 'completed', '{"type":"auto_compound"}'::jsonb, timezone('utc', now()) - interval '2 days'),
  ('68000000-0000-0000-0000-000000000003', (select id from public.users where username = 'demo_investor' limit 1), 'funding_pledge', '63000000-0000-0000-0000-000000000001', -250, 'usd', 'completed', '{"project_id":"62000000-0000-0000-0000-000000000001"}'::jsonb, timezone('utc', now()) - interval '1 day'),
  ('68000000-0000-0000-0000-000000000004', (select id from public.users where username = 'demo_creator' limit 1), 'creator_reward', '65000000-0000-0000-0000-000000000001', 150, 'gems', 'completed', '{"reason":"bronze_views"}'::jsonb, timezone('utc', now()) - interval '8 hours')
on conflict (id) do nothing;
