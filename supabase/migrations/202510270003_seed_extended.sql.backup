-- Seed data for extended Promorang schema

insert into public.content_tags (name) values
  ('productivity'),
  ('wellness'),
  ('lifestyle'),
  ('technology'),
  ('gaming')
on conflict (name) do nothing;

-- Demo content items
insert into public.content_items (
  id, creator_id, drop_id, title, description, media_url, platform,
  status, posted_at, impressions, clicks, engagements, shares,
  conversions, engagement_rate
) values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Morning Productivity Stack', 'Breaking down the tools that fuel my morning routine.',
   'https://cdn.promorang.com/content/morning-stack.mp4', 'youtube', 'published',
   timezone('utc', now()) - interval '2 days', 18250, 1240, 8600, 520,
   180, 0.0472),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002',
   '30-Day Wellness Challenge Recap', 'Highlights from the wellness challenge participants.',
   'https://cdn.promorang.com/content/wellness-recap.mp4', 'tiktok', 'published',
   timezone('utc', now()) - interval '5 days', 9800, 740, 5200, 315,
   140, 0.0531),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', null,
   'Launch Day BTS', 'Behind-the-scenes from our launch day event.',
   'https://cdn.promorang.com/content/launch-bts.mp4', 'instagram', 'scheduled',
   null, 0, 0, 0, 0, 0, null)
  on conflict (id) do nothing;

-- Tag associations
insert into public.content_item_tags (content_id, tag_id)
select '50000000-0000-0000-0000-000000000001'::uuid, id from public.content_tags where name in ('productivity', 'technology')
union all
select '50000000-0000-0000-0000-000000000002'::uuid, id from public.content_tags where name in ('wellness', 'lifestyle')
union all
select '50000000-0000-0000-0000-000000000003'::uuid, id from public.content_tags where name in ('technology')
on conflict (content_id, tag_id) do nothing;

-- Drop applications
insert into public.drop_applications (
  id, drop_id, creator_id, status, proof_url, submission_notes,
  reviewer_notes, reward_amount, reward_currency, submitted_at,
  reviewed_at, approved_at
) values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'approved', 'https://cdn.promorang.com/proofs/drop1-proof.pdf',
   'Submitted analytics screenshot and link.', 'Strong engagement metrics.',
   150.00, 'usd', timezone('utc', now()) - interval '3 days',
   timezone('utc', now()) - interval '2 days', timezone('utc', now()) - interval '2 days')
  on conflict (id) do nothing;

insert into public.content_reviews (
  id, application_id, reviewer_id, rating, feedback
) values
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   5, 'Excellent quality content with strong conversions.')
  on conflict (id) do nothing;

-- Advertiser profiles
insert into public.advertiser_profiles (
  user_id, company_name, company_website, company_description,
  industry, contact_email, contact_phone, monthly_budget,
  preferred_platforms, goals
) values
  ('00000000-0000-0000-0000-000000000002', 'Promorang Labs', 'https://promorang.com',
   'Growth agency focused on creator marketing experiments.', 'Marketing',
   'ads@promorang.com', '+1-555-0123', 5000.00,
   array['instagram','tiktok','youtube'], 'Brand awareness and conversions')
  on conflict (user_id) do nothing;

-- Campaigns
insert into public.campaigns (
  id, advertiser_id, name, objective, status, start_date, end_date,
  total_budget, budget_spent, target_audience
) values
  ('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   'Launch Campaign', 'Drive traffic to new feature launch.', 'active',
   current_date - interval '10 days', current_date + interval '20 days',
   3000.00, 1250.00, '{"age": "18-34", "interests": ["productivity", "tech"]}'::jsonb)
  on conflict (id) do nothing;

insert into public.campaign_assets (
  id, campaign_id, asset_type, asset_url, notes
) values
  ('81000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001',
   'video', 'https://cdn.promorang.com/assets/launch-ad.mp4', 'Primary launch creative'),
  ('81000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001',
   'image', 'https://cdn.promorang.com/assets/launch-poster.png', 'Organic social post asset')
  on conflict (id) do nothing;

insert into public.campaign_metrics (
  id, campaign_id, metric_date, impressions, clicks, conversions, spend, revenue
) values
  ('82000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001',
   current_date - interval '2 days', 15200, 820, 95, 420.00, 950.00),
  ('82000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001',
   current_date - interval '1 day', 16800, 910, 110, 480.00, 1100.00)
  on conflict (id) do nothing;

-- Inventory usage
insert into public.inventory_usage (
  id, advertiser_id, period_start, period_end, moves_used, proof_drops_used,
  paid_drops_used, budget_consumed
) values
  ('83000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   current_date - interval '14 days', current_date - interval '7 days', 35, 4, 1, 890.00),
  ('83000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   current_date - interval '7 days', current_date, 42, 5, 2, 1120.00)
  on conflict (id) do nothing;

-- Leaderboard
insert into public.leaderboard_entries (
  id, user_id, period_type, period_start, period_end, rank, points, total_earnings
) values
  ('84000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'weekly', current_date - interval '7 days', current_date, 1, 15420, 215.50),
  ('84000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'weekly', current_date - interval '7 days', current_date, 5, 8200, 120.00)
  on conflict (id) do nothing;

-- Content shares
insert into public.content_shares (
  id, user_id, content_id, platform, share_url, shared_at, clicks, conversions, notes
) values
  ('85000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   '50000000-0000-0000-0000-000000000001', 'twitter', 'https://twitter.com/demo/status/123456789',
   timezone('utc', now()) - interval '1 day', 280, 35, 'Shared during launch live stream'),
  ('85000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   '50000000-0000-0000-0000-000000000002', 'linkedin', 'https://linkedin.com/posts/demo/987654321',
   timezone('utc', now()) - interval '12 hours', 190, 22, 'Organic share to advertiser network')
  on conflict (id) do nothing;

-- User events
insert into public.user_events (
  id, user_id, event_type, event_source, metadata
) values
  ('86000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'drop_completed', 'drops_service', '{"drop_id":"10000000-0000-0000-0000-000000000001"}'::jsonb),
  ('86000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'campaign_launched', 'advertiser_portal', '{"campaign_id":"80000000-0000-0000-0000-000000000001"}'::jsonb)
  on conflict (id) do nothing;

-- Payouts
insert into public.payouts (
  id, user_id, wallet_id, amount, currency, status, initiated_at, completed_at, reference
) values
  ('87000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 250.00, 'usd', 'completed',
   timezone('utc', now()) - interval '4 days', timezone('utc', now()) - interval '3 days', 'PAYOUT-20251023-001'),
  ('87000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   '20000000-0000-0000-0000-000000000002', 300.00, 'usd', 'pending',
   timezone('utc', now()) - interval '1 day', null, 'PAYOUT-20251026-002')
  on conflict (id) do nothing;
