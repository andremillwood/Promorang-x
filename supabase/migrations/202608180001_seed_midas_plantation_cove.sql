-- =============================================================================
-- Migration: 202608180001_seed_midas_plantation_cove.sql
-- Description: Canonical database seeding for Midas Entertainment activations:
--              1. Plantation Cove Venue (Priory, St. Ann, Jamaica)
--              2. Sophisticated — The Summer End Beach Party (Aug 29, 2026)
--              3. Encore Live featuring Capleton (Aug 30, 2026)
--              4. Summer Finale & Live Music Discoveries
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_host_id UUID := '00000000-0000-0000-0000-000000000001'; -- Promorang Presents / Editorial Host
  v_plantation_cove_id UUID := '00000000-0000-0000-0003-000000000050';
  v_sophisticated_id UUID := '00000000-0000-0000-0002-000000000051';
  v_encore_live_id UUID := '00000000-0000-0000-0002-000000000052';
BEGIN
  -- 1. Ensure host exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_host_id) THEN
    INSERT INTO public.users (
      id, email, username, display_name, user_type, user_tier, avatar_url, points_balance, keys_balance, gems_balance
    ) VALUES (
      v_host_id, 'editorial@promorang.co', 'promorang_presents', 'Promorang Presents', 'host', 'verified',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
      5000, 100, 500
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Seed Plantation Cove in public.venues
  INSERT INTO public.venues (
    id,
    owner_id,
    name,
    venue_name,
    address,
    location,
    description,
    image_url,
    category,
    is_active
  ) VALUES (
    v_plantation_cove_id,
    v_host_id,
    'Grizzly''s Plantation Cove',
    'Plantation Cove',
    'A1 North Coast Highway, Priory, St. Ann, Jamaica',
    'Priory, St. Ann, Jamaica',
    '250-acre premier oceanfront event and festival park on Jamaica''s north coast, hosting major entertainment, beach, and cultural experiences.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    'Entertainment & Festivals',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    venue_name = EXCLUDED.venue_name,
    address = EXCLUDED.address,
    location = EXCLUDED.location,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active;

  -- 3. Seed Plantation Cove in public.venue_profiles (if table exists)
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
      v_plantation_cove_id,
      'Plantation Cove',
      'plantation-cove',
      '250-acre oceanfront festival and concert venue situated in Priory, St. Ann, Jamaica.',
      'A1 North Coast Highway, Priory',
      'St. Ann',
      'Jamaica',
      'outdoor_festival_grounds',
      15000,
      95
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      description = EXCLUDED.description,
      location = EXCLUDED.location,
      city = EXCLUDED.city,
      country = EXCLUDED.country,
      capacity = EXCLUDED.capacity;
  END IF;

  -- 4. Seed Moment: Sophisticated — The Summer End Beach Party
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
    v_sophisticated_id,
    v_host_id,
    v_plantation_cove_id,
    'Plantation Cove',
    'Sophisticated — The Summer End Beach Party',
    'sophisticated-summer-end-beach-party',
    'Presented by Midas Entertainment and 8 Rivaz Ultra Lounge. The ultimate summer finale beach party featuring Vanessa Bling live, Trippple X, Bishop Escobar, and Illusion Sound. Hosted drinks segment from 4:00 PM to 7:00 PM transitioning into an electric oceanfront night session.',
    'Music & Parties',
    'Plantation Cove, Priory, St. Ann, Jamaica',
    '2026-08-29 16:00:00-05',
    '2026-08-29 22:00:00-05',
    500,
    '200 Points + PromoKey',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=1200',
    true,
    'open',
    18.45509,
    -77.23241,
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

  -- 5. Seed Moment: Encore Live featuring Capleton
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
    v_encore_live_id,
    v_host_id,
    v_plantation_cove_id,
    'Plantation Cove',
    'Encore Live featuring Capleton',
    'encore-live-featuring-capleton',
    'Presented by Midas Entertainment. The high-energy live reggae culture concert at Plantation Cove headlined by Capleton (The Fireman / King Shango). Authentic conscious sound, live band instrumentation, and premier festival energy.',
    'Music & Parties',
    'Plantation Cove, Priory, St. Ann, Jamaica',
    '2026-08-30 18:00:00-05',
    '2026-08-31 01:00:00-05',
    500,
    '200 Points + PromoKey',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
    true,
    'open',
    18.45509,
    -77.23241,
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

END $$;
