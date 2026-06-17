-- Seed demo liquidity pools for the Pieces exchange.
-- These pools make /marketplace and /liquidity usable in demo and early production
-- without requiring live user-created pool inventory.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001'::uuid) THEN
    INSERT INTO public.users (id, email, username, display_name, user_type, created_at)
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'demo@promorang.com',
      'demouser',
      'Demo User',
      'creator',
      timezone('utc', now())
    );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.content_items') IS NOT NULL THEN
    INSERT INTO public.content_items (
      id,
      creator_id,
      title,
      description,
      media_url,
      platform,
      status,
      posted_at,
      impressions,
      clicks,
      engagements,
      shares,
      conversions,
      engagement_rate
    ) VALUES
      (
        '50000000-0000-0000-0000-000000000001'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Morning Productivity Stack',
        'Breaking down the tools that fuel my morning routine.',
        'https://cdn.promorang.com/content/morning-stack.mp4',
        'youtube',
        'published',
        timezone('utc', now()) - interval '2 days',
        18250,
        1240,
        8600,
        520,
        180,
        0.0472
      ),
      (
        '50000000-0000-0000-0000-000000000002'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        '30-Day Wellness Challenge Recap',
        'Highlights from the wellness challenge participants.',
        'https://cdn.promorang.com/content/wellness-recap.mp4',
        'tiktok',
        'published',
        timezone('utc', now()) - interval '5 days',
        9800,
        740,
        5200,
        315,
        140,
        0.0531
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

INSERT INTO public.content_piece_stats (
  content_id,
  current_price,
  previous_close,
  day_open,
  day_high,
  day_low,
  week_high,
  week_low,
  total_pieces,
  available_pieces,
  market_cap,
  volume_24h,
  volume_7d,
  trade_count_24h,
  change_24h,
  holder_count
) VALUES
  (
    '50000000-0000-0000-0000-000000000001'::uuid,
    5.0000,
    4.8500,
    4.8500,
    5.1500,
    4.7000,
    5.2500,
    4.5000,
    12000,
    8300,
    60000,
    18500,
    74200,
    42,
    3.0928,
    18
  ),
  (
    '50000000-0000-0000-0000-000000000002'::uuid,
    3.5000,
    3.6500,
    3.6500,
    3.7600,
    3.4000,
    3.9500,
    3.2000,
    9000,
    6200,
    31500,
    9700,
    38100,
    27,
    -4.1096,
    13
  )
ON CONFLICT (content_id) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  previous_close = EXCLUDED.previous_close,
  day_open = EXCLUDED.day_open,
  day_high = EXCLUDED.day_high,
  day_low = EXCLUDED.day_low,
  week_high = EXCLUDED.week_high,
  week_low = EXCLUDED.week_low,
  total_pieces = EXCLUDED.total_pieces,
  available_pieces = EXCLUDED.available_pieces,
  market_cap = EXCLUDED.market_cap,
  volume_24h = EXCLUDED.volume_24h,
  volume_7d = EXCLUDED.volume_7d,
  trade_count_24h = EXCLUDED.trade_count_24h,
  change_24h = EXCLUDED.change_24h,
  holder_count = EXCLUDED.holder_count,
  updated_at = timezone('utc', now());

INSERT INTO public.content_piece_positions (
  content_id,
  holder_id,
  pieces_owned,
  total_invested,
  avg_purchase_price,
  first_acquired_at,
  last_trade_at,
  updated_at
) VALUES
  (
    '50000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    45,
    180,
    4.0000,
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now())
  ),
  (
    '50000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    30,
    120,
    4.0000,
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now())
  )
ON CONFLICT (content_id, holder_id) DO UPDATE SET
  pieces_owned = EXCLUDED.pieces_owned,
  total_invested = EXCLUDED.total_invested,
  avg_purchase_price = EXCLUDED.avg_purchase_price,
  last_trade_at = EXCLUDED.last_trade_at,
  updated_at = timezone('utc', now());

INSERT INTO public.piece_liquidity_pools (
  id,
  piece_type,
  asset_id,
  pieces_reserve,
  currency_reserve,
  k_constant,
  swap_fee_percent,
  protocol_fee_percent,
  lp_fee_percent,
  status,
  last_price,
  price_24h_ago,
  volume_24h,
  created_by,
  created_at,
  updated_at
) VALUES
  (
    '91000000-0000-0000-0000-000000000001'::uuid,
    'content'::public.piece_type,
    '50000000-0000-0000-0000-000000000001'::uuid,
    12000,
    60000,
    720000000,
    0.0030,
    0.0005,
    0.0025,
    'active',
    5.00000000,
    4.85000000,
    18500,
    '00000000-0000-0000-0000-000000000001'::uuid,
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now())
  ),
  (
    '91000000-0000-0000-0000-000000000002'::uuid,
    'content'::public.piece_type,
    '50000000-0000-0000-0000-000000000002'::uuid,
    9000,
    31500,
    283500000,
    0.0030,
    0.0005,
    0.0025,
    'active',
    3.50000000,
    3.65000000,
    9700,
    '00000000-0000-0000-0000-000000000001'::uuid,
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now())
  )
ON CONFLICT (piece_type, asset_id) DO UPDATE SET
  pieces_reserve = EXCLUDED.pieces_reserve,
  currency_reserve = EXCLUDED.currency_reserve,
  k_constant = EXCLUDED.k_constant,
  swap_fee_percent = EXCLUDED.swap_fee_percent,
  protocol_fee_percent = EXCLUDED.protocol_fee_percent,
  lp_fee_percent = EXCLUDED.lp_fee_percent,
  status = EXCLUDED.status,
  last_price = EXCLUDED.last_price,
  price_24h_ago = EXCLUDED.price_24h_ago,
  volume_24h = EXCLUDED.volume_24h,
  updated_at = timezone('utc', now());

INSERT INTO public.piece_lp_positions (
  pool_id,
  provider_id,
  lp_tokens,
  pieces_deposited,
  currency_deposited,
  fees_earned_pieces,
  fees_earned_currency,
  first_deposit_at,
  last_deposit_at,
  updated_at
) VALUES
  (
    '91000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    26832.81572999,
    12000,
    60000,
    42.25000000,
    211.25000000,
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now())
  ),
  (
    '91000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    16837.45824048,
    9000,
    31500,
    27.50000000,
    96.25000000,
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now())
  )
ON CONFLICT (pool_id, provider_id) DO UPDATE SET
  lp_tokens = EXCLUDED.lp_tokens,
  pieces_deposited = EXCLUDED.pieces_deposited,
  currency_deposited = EXCLUDED.currency_deposited,
  fees_earned_pieces = EXCLUDED.fees_earned_pieces,
  fees_earned_currency = EXCLUDED.fees_earned_currency,
  last_deposit_at = EXCLUDED.last_deposit_at,
  updated_at = timezone('utc', now());

NOTIFY pgrst, 'reload schema';
