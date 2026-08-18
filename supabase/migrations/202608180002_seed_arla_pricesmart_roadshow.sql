-- =============================================================================
-- Migration: 202608180002_seed_arla_pricesmart_roadshow.sql
-- Description: Canonical database seeding for Arla Pro Whip & Cook Activation:
--              1. PriceSmart Jamaica — Red Hills Road Venue (Kingston 19)
--              2. Arla Whip & Cook @ PriceSmart Recurring Moments (Aug 18-23, 2026)
--                 Daily Operating Hours: 10:00 AM – 8:00 PM (10:00:00-05 to 20:00:00-05)
--              3. Promorang Presents Editorial Experience placement
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_host_id UUID := '00000000-0000-0000-0000-000000000001'; -- Editorial Host
  v_pricesmart_id UUID := '00000000-0000-0000-0003-000000000060';
  v_arla_moment_id UUID := '00000000-0000-0000-0002-000000000060';
  v_arla_day1 UUID := '00000000-0000-0000-0002-000000000061';
  v_arla_day2 UUID := '00000000-0000-0000-0002-000000000062';
  v_arla_day3 UUID := '00000000-0000-0000-0002-000000000063';
  v_arla_day4 UUID := '00000000-0000-0000-0002-000000000064';
  v_arla_day5 UUID := '00000000-0000-0000-0002-000000000065';
  v_arla_day6 UUID := '00000000-0000-0000-0002-000000000066';
BEGIN
  -- 1. Ensure editorial host exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_host_id) THEN
    INSERT INTO public.users (
      id, email, username, display_name, user_type, user_tier, avatar_url, points_balance, keys_balance, gems_balance
    ) VALUES (
      v_host_id, 'editorial@promorang.co', 'promorang_presents', 'Promorang Presents', 'host', 'verified',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
      5000, 100, 500
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Seed PriceSmart Jamaica (Red Hills Road) in public.venues
  INSERT INTO public.venues (
    id,
    owner_id,
    name,
    address,
    description,
    image_url,
    category,
    is_active
  ) VALUES (
    v_pricesmart_id,
    v_host_id,
    'PriceSmart Jamaica (Red Hills Road)',
    '111 Red Hills Road, Kingston 19, Jamaica',
    'PriceSmart warehouse club and retail destination in Kingston, Jamaica, hosting the Arla Pro Whip & Cook consumer sampling and roadshow activation.',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1200',
    'Retail & Food Shopping',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active;

  -- 3. Seed PriceSmart Jamaica in public.venue_profiles if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venue_profiles') THEN
    INSERT INTO public.venue_profiles (
      id,
      name,
      slug,
      description,
      location,
      city,
      country,
      venue_type,
      capacity,
      popularity_score
    ) VALUES (
      v_pricesmart_id,
      'PriceSmart Jamaica (Red Hills Road)',
      'pricesmart-red-hills-road',
      'PriceSmart warehouse club and shopping destination on Red Hills Road, Kingston 19, Jamaica.',
      '111 Red Hills Road, Kingston 19',
      'Kingston',
      'Jamaica',
      'retail_club',
      5000,
      94
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      description = EXCLUDED.description,
      location = EXCLUDED.location,
      city = EXCLUDED.city,
      country = EXCLUDED.country,
      capacity = EXCLUDED.capacity;
  END IF;

  -- 4. Seed Primary Anchor Moment: Arla Whip & Cook @ PriceSmart (Taste It. Whip It. Cook It.)
  INSERT INTO public.moments (
    id,
    host_id,
    venue_id,
    venue_name,
    title,
    slug,
    description,
    category,
    location,
    starts_at,
    ends_at,
    max_participants,
    reward,
    image_url,
    is_active,
    visibility,
    latitude,
    longitude,
    created_at,
    updated_at
  ) VALUES (
    v_arla_moment_id,
    v_host_id,
    v_pricesmart_id,
    'PriceSmart Jamaica (Red Hills Road)',
    'Arla Whip & Cook @ PriceSmart — Taste It. Whip It. Cook It.',
    'arla-whip-and-cook-pricesmart',
    'Experience Arla Pro Whip & Cook 28% live at PriceSmart Jamaica. Taste savoury Rasta Pasta and dessert Chocolate Chip Mousse, vote in the live Taste-Off, unlock the 5-Recipe Pack, and get 1L cartons for approx. J$1,200 during the roadshow (regular price approx. J$2,700). Daily 10:00 AM – 8:00 PM.',
    'Food & Dining',
    '111 Red Hills Road, Kingston 19, Jamaica',
    '2026-08-18 10:00:00-05',
    '2026-08-23 20:00:00-05',
    500,
    'Arla Recipe Key + 150 Points',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
    true,
    'open',
    18.04118,
    -76.81508,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    venue_id = EXCLUDED.venue_id,
    venue_name = EXCLUDED.venue_name,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at,
    reward = EXCLUDED.reward,
    image_url = EXCLUDED.image_url,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

  -- 5. Seed Daily Roadshow Occurrences (Aug 18 to Aug 23, 2026: 10:00 AM to 8:00 PM)
  INSERT INTO public.moments (id, host_id, venue_id, venue_name, title, slug, description, category, location, starts_at, ends_at, max_participants, reward, image_url, is_active, visibility, latitude, longitude, created_at, updated_at)
  VALUES
  (
    v_arla_day1, v_host_id, v_pricesmart_id, 'PriceSmart Jamaica (Red Hills Road)',
    'Arla Whip & Cook Roadshow — Tuesday Taste-Off', 'arla-whip-cook-pricesmart-tuesday',
    'Day 1 of the roadshow at PriceSmart. Taste hot Rasta Pasta vs sweet Chocolate Chip Mousse (10:00 AM – 8:00 PM).',
    'Food & Dining', '111 Red Hills Road, Kingston 19, Jamaica',
    '2026-08-18 10:00:00-05', '2026-08-18 20:00:00-05', 200, 'Arla Recipe Key + 150 Points',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', true, 'open', 18.04118, -76.81508, NOW(), NOW()
  ),
  (
    v_arla_day2, v_host_id, v_pricesmart_id, 'PriceSmart Jamaica (Red Hills Road)',
    'Arla Whip & Cook Roadshow — Wednesday Taste-Off', 'arla-whip-cook-pricesmart-wednesday',
    'Day 2 of the roadshow at PriceSmart. Taste hot Rasta Pasta vs sweet Chocolate Chip Mousse (10:00 AM – 8:00 PM).',
    'Food & Dining', '111 Red Hills Road, Kingston 19, Jamaica',
    '2026-08-19 10:00:00-05', '2026-08-19 20:00:00-05', 200, 'Arla Recipe Key + 150 Points',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', true, 'open', 18.04118, -76.81508, NOW(), NOW()
  ),
  (
    v_arla_day3, v_host_id, v_pricesmart_id, 'PriceSmart Jamaica (Red Hills Road)',
    'Arla Whip & Cook Roadshow — Thursday Taste-Off', 'arla-whip-cook-pricesmart-thursday',
    'Day 3 of the roadshow at PriceSmart. Taste hot Rasta Pasta vs sweet Chocolate Chip Mousse (10:00 AM – 8:00 PM).',
    'Food & Dining', '111 Red Hills Road, Kingston 19, Jamaica',
    '2026-08-20 10:00:00-05', '2026-08-20 20:00:00-05', 200, 'Arla Recipe Key + 150 Points',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', true, 'open', 18.04118, -76.81508, NOW(), NOW()
  ),
  (
    v_arla_day4, v_host_id, v_pricesmart_id, 'PriceSmart Jamaica (Red Hills Road)',
    'Arla Whip & Cook Roadshow — Friday Taste-Off', 'arla-whip-cook-pricesmart-friday',
    'Day 4 of the roadshow at PriceSmart. Taste hot Rasta Pasta vs sweet Chocolate Chip Mousse (10:00 AM – 8:00 PM).',
    'Food & Dining', '111 Red Hills Road, Kingston 19, Jamaica',
    '2026-08-21 10:00:00-05', '2026-08-21 20:00:00-05', 200, 'Arla Recipe Key + 150 Points',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', true, 'open', 18.04118, -76.81508, NOW(), NOW()
  ),
  (
    v_arla_day5, v_host_id, v_pricesmart_id, 'PriceSmart Jamaica (Red Hills Road)',
    'Arla Whip & Cook Roadshow — Saturday Weekend Special', 'arla-whip-cook-pricesmart-saturday',
    'Weekend roadshow sampling at PriceSmart (10:00 AM – 8:00 PM). Taste Rasta Pasta, Mousse, and occasional Strong Back Punch drops.',
    'Food & Dining', '111 Red Hills Road, Kingston 19, Jamaica',
    '2026-08-22 10:00:00-05', '2026-08-22 20:00:00-05', 300, 'Arla Recipe Key + 150 Points',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', true, 'open', 18.04118, -76.81508, NOW(), NOW()
  ),
  (
    v_arla_day6, v_host_id, v_pricesmart_id, 'PriceSmart Jamaica (Red Hills Road)',
    'Arla Whip & Cook Roadshow — Sunday Finale', 'arla-whip-cook-pricesmart-sunday',
    'Final day of the PriceSmart roadshow activation (10:00 AM – 8:00 PM). Last chance to taste, vote, and secure J$1,200 cartons.',
    'Food & Dining', '111 Red Hills Road, Kingston 19, Jamaica',
    '2026-08-23 10:00:00-05', '2026-08-23 20:00:00-05', 300, 'Arla Recipe Key + 150 Points',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', true, 'open', 18.04118, -76.81508, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    venue_id = EXCLUDED.venue_id,
    venue_name = EXCLUDED.venue_name,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at,
    reward = EXCLUDED.reward,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

  -- 6. Seed Promorang Presents Experience
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'presents_experiences') THEN
    INSERT INTO public.presents_experiences (
      program_id,
      slug,
      title,
      event_name,
      venue_name,
      category,
      description,
      unlock_label,
      quantity,
      referrals_required,
      mission_requirements,
      redemption_rules,
      status,
      metadata
    )
    SELECT
      id,
      'arla-whip-and-cook-tasting',
      'The Whip or Cook Taste-Off',
      'Arla Whip & Cook @ PriceSmart',
      'PriceSmart Jamaica',
      'food',
      'One cream. Two samples. Pick a side. Taste hot Rasta Pasta vs cold Chocolate Chip Mousse at PriceSmart (10 AM – 8 PM), vote on your winner, and unlock the 5-Recipe Pack.',
      'Recipe Pack + Sampling VIP',
      100,
      1,
      '["taste-off-vote", "whip-or-cook-discovery"]'::jsonb,
      'Visit the Arla sampling station at PriceSmart Jamaica on Red Hills Road.',
      'live',
      '{"day":"This Week (10am-8pm)","badge":"Featured Sampling","brand":"Arla Pro"}'::jsonb
    FROM public.presents_programs
    WHERE slug = 'founding-season'
    ON CONFLICT (program_id, slug) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      unlock_label = EXCLUDED.unlock_label,
      quantity = EXCLUDED.quantity,
      referrals_required = EXCLUDED.referrals_required,
      mission_requirements = EXCLUDED.mission_requirements,
      redemption_rules = EXCLUDED.redemption_rules,
      status = 'live',
      metadata = EXCLUDED.metadata,
      updated_at = NOW();
  END IF;

END $$;

NOTIFY pgrst, 'reload schema';
