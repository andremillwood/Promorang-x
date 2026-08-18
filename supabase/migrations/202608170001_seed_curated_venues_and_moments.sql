-- =============================================================================
-- Migration: 202608170001_seed_curated_venues_and_moments.sql
-- Description: Robust, schema-safe seed for Scenes, Venues, and Moments.
--              Compatible with existing public.scenes (using title/slug)
--              and public.venues/moments.
-- =============================================================================

-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure editorial operator user exists in public.users for host/owner reference
DO $$
DECLARE
  v_editorial_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_editorial_id) THEN
    INSERT INTO public.users (
      id,
      email,
      username,
      display_name,
      user_type,
      user_tier,
      avatar_url,
      points_balance,
      keys_balance,
      gems_balance,
      created_at,
      updated_at
    ) VALUES (
      v_editorial_id,
      'editorial@promorang.co',
      'promorang_presents',
      'Promorang Presents',
      'host',
      'verified',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
      5000,
      100,
      500,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url;
  END IF;
END $$;

-- 2. Ensure scenes table exists and matches schema (with title, slug, description, image_url, etc.)
CREATE TABLE IF NOT EXISTS public.scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  city TEXT,
  country TEXT,
  image_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure required columns exist if table was already created earlier
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.scenes ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scenes' AND policyname = 'Scenes are publicly readable'
  ) THEN
    CREATE POLICY "Scenes are publicly readable" ON public.scenes FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO public.scenes (
  id,
  title,
  slug,
  description,
  city,
  country,
  image_url,
  visibility,
  status,
  metadata
) VALUES 
(
  '00000000-0000-0000-0001-000000000001',
  'Kingston After Dark',
  'kingston-after-dark',
  'The definitive lens for nightlife, late-night food spots, live music, and party culture in Kingston.',
  'Kingston',
  'Jamaica',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
  'public',
  'active',
  '{"category": "Nightlife & Music", "curator": "Promorang Culture Guild"}'::jsonb
),
(
  '00000000-0000-0000-0001-000000000002',
  'Food & Taste Jamaica',
  'food-and-taste',
  'Discover underrated breakfast joints, street vendors, chef popups, and signature dining experiences.',
  'Kingston',
  'Jamaica',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
  'public',
  'active',
  '{"category": "Food & Dining", "curator": "Taste Collective"}'::jsonb
),
(
  '00000000-0000-0000-0001-000000000003',
  'Move & Fitness Jamaica',
  'move-jamaica',
  'Active lifestyle, outdoor runs, fitness popups, wellness retreats, and beach workouts.',
  'Kingston',
  'Jamaica',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
  'public',
  'active',
  '{"category": "Fitness & Health", "curator": "Movement Club"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- 3. Create / ensure venues table exists and seed curated venues
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Entertainment',
  phone TEXT,
  website TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'venues' AND policyname = 'Venues are publicly readable'
  ) THEN
    CREATE POLICY "Venues are publicly readable" ON public.venues FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO public.venues (
  id,
  owner_id,
  name,
  address,
  description,
  image_url,
  category,
  is_active
) VALUES
(
  '00000000-0000-0000-0003-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Fiction Nightclub',
  'Marketplace, Constant Spring Rd, Kingston, Jamaica',
  'Kingston premier upscale nightclub and cultural lounge.',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
  'Nightlife & Music',
  true
),
(
  '00000000-0000-0000-0003-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Usain Bolt''s Tracks & Records',
  '67 Constant Spring Rd, Marketplace, Kingston, Jamaica',
  'Flagship sports lounge celebrating Jamaican culture, jerk cuisine, and live entertainment.',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
  'Sports & Dining',
  true
),
(
  '00000000-0000-0000-0003-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Steakhouse on the Verandah (Devon House)',
  '26 Hope Rd, Devon House Courtyard, Kingston, Jamaica',
  'Historic verandah dining with prime dry-aged steak cuts and open-air ambiance.',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
  'Fine Dining',
  true
),
(
  '00000000-0000-0000-0003-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Tacbar Jamaica (Devon House)',
  '26 Hope Rd, Devon House Courtyard, Kingston, Jamaica',
  'Gourmet street taco and cocktail patio at Devon House.',
  'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800',
  'Food & Drinks',
  true
),
(
  '00000000-0000-0000-0003-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'The Jamaica Pegasus Hotel (Pool Lounge)',
  '81 Knutsford Blvd, New Kingston, Jamaica',
  'Tropical poolside retreat and barbecue terrace in the heart of the financial district.',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
  'Hospitality & Social',
  true
),
(
  '00000000-0000-0000-0003-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'Chilitos JaMexican',
  '88 Hope Rd, Kingston 6, Jamaica',
  'Courtyard Mexican-Jamaican fusion kitchen and bar.',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800',
  'Food & Drinks',
  true
),
(
  '00000000-0000-0000-0003-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'AC Lounge (AC Hotel Kingston)',
  '38-42 Lady Musgrave Rd, Kingston, Jamaica',
  'Sophisticated European style lounge and cocktail venue.',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=800',
  'Lounge & Drinks',
  true
),
(
  '00000000-0000-0000-0003-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'Kingston Dub Club',
  'Skyline Drive, Jack''s Hill, Kingston, Jamaica',
  'High-altitude sound system sanctuary overlooking Kingston city lights.',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
  'Music & Culture',
  true
),
(
  '00000000-0000-0000-0003-000000000009',
  '00000000-0000-0000-0000-000000000001',
  'Devon House Gourmet Court',
  'Hope Rd, Kingston, Jamaica',
  'Famous national heritage gastronomy court and ice cream parlour.',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
  'Culinary Heritage',
  true
),
(
  '00000000-0000-0000-0003-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Janga''s Soundbar & Grill',
  'Belmont Rd, New Kingston, Jamaica',
  'Open-air music bar, live acoustics, and grilled delicacies.',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
  'Live Music & Dining',
  true
),
(
  '00000000-0000-0000-0003-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'Downtown Art District',
  'Water Lane & Church St, Downtown Kingston, Jamaica',
  'Vibrant outdoor mural gallery and creative cultural streetscape.',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
  'Art & Culture',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;

-- 4. Seed Curated Moments into public.moments
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'moments' AND policyname = 'Moments are publicly readable'
  ) THEN
    CREATE POLICY "Moments are publicly readable" ON public.moments FOR SELECT USING (true);
  END IF;
END $$;

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
  created_at,
  updated_at
) VALUES
(
  '00000000-0000-0000-0002-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000001',
  'Fiction Nightclub',
  'I Luv Hip Hop Live Culture Lab',
  'i-luv-hip-hop-live-culture-lab',
  'Kingston’s premier hip hop and sound system lab at Fiction. Vote on the sound of the night, discover the next selector, and earn your way inside the DJ booth with your crew.',
  'Music & Parties',
  'Marketplace, Constant Spring Rd, Kingston',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 4 hours',
  100,
  '150 Points + PromoKey',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000001',
  'Fiction Nightclub',
  'Encore Wednesday Social & VIP',
  'encore-wednesday-social-vip',
  'A room built for crews and tastemakers. Unlock priority entry, secret table dividends, signature bottle service perks, and meet the people worth knowing.',
  'Gatherings & Culture',
  'Marketplace, Constant Spring Rd, Kingston',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days 5 hours',
  100,
  '150 Points + PromoKey',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000025',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000002',
  'Usain Bolt''s Tracks & Records',
  'FAT Wednesdays Live Social & Game Night',
  'fat-wednesdays-live-social-game-night',
  'High-energy midweek gathering at Usain Bolt''s flagship lounge with 45+ HD screens, signature jerk platters, live DJ sets, and Bolt burgers.',
  'Music & Parties',
  '67 Constant Spring Rd, Marketplace',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days 4 hours',
  100,
  '120 Points + PromoKey',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000026',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000003',
  'Steakhouse on the Verandah (Devon House)',
  'Chandon Open House Friday Courtyard Soirée',
  'chandon-open-house-friday-courtyard-soiree',
  'Sophisticated open-air Friday courtyard soiree at the historic Devon House with dry-aged steak cuts, Chandon champagne, and elevated social vibes.',
  'Gatherings & Culture',
  '26 Hope Rd, Devon House Courtyard',
  NOW() + INTERVAL '4 days',
  NOW() + INTERVAL '4 days 4 hours',
  100,
  '150 Points + PromoKey',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000022',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000004',
  'Tacbar Jamaica (Devon House)',
  'Tacos, Margaritas & Patio Beats at Tacbar',
  'tacos-margaritas-patio-beats-tacbar',
  'Devon House courtyard street taco hub blending authentic Mexican barbacoa and carnitas with spicy Jamaican Scotch bonnet flare.',
  'Food & Drinks',
  '26 Hope Rd, Devon House Courtyard',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days 4 hours',
  80,
  '100 Points + PromoKey',
  'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000023',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000005',
  'The Jamaica Pegasus Hotel (Pool Lounge)',
  'Let''s Lyme Friday Poolside & Grill at Pegasus',
  'lets-lyme-friday-poolside-grill-pegasus',
  'Premier New Kingston weekend kickoff at the Pegasus tropical pool lounge with live acoustic entertainment and barbecue grill stations.',
  'Gatherings & Culture',
  '81 Knutsford Blvd, New Kingston',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days 5 hours',
  120,
  '100 Points + PromoKey',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000017',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000006',
  'Chilitos JaMexican',
  'Tacos & Reggae Jam at Chilitos JaMexican',
  'tacos-reggae-jam-chilitos-jamexican',
  'Lively courtyard fiesta blending authentic Mexican tacos, burritos, and tequila cocktails with bold Jamaican spices.',
  'Food & Drinks',
  '88 Hope Rd, Kingston 6',
  NOW() + INTERVAL '6 days',
  NOW() + INTERVAL '6 days 4 hours',
  75,
  '100 Points + PromoKey',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000018',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000007',
  'AC Lounge (AC Hotel Kingston)',
  'AC Lounge Tapas & Craft Mixology Evenings',
  'ac-lounge-tapas-craft-mixology-evenings',
  'Chic European-inspired lounge with Spanish tapas, signature rum cocktails, and cosmopolitan weekend DJ sets.',
  'Gatherings & Culture',
  '38-42 Lady Musgrave Rd, Kingston',
  NOW() + INTERVAL '6 days',
  NOW() + INTERVAL '6 days 4 hours',
  90,
  '100 Points + PromoKey',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000008',
  'Kingston Dub Club',
  'Kingston Dub Club Sunday Roots Session',
  'kingston-dub-club-sunday-roots-session',
  'Legendary weekly hilltop sound system gathering overlooking city lights. Authentic dub plates and strictly conscious vibes.',
  'Music & Parties',
  'Skyline Drive, Jack''s Hill',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days 6 hours',
  150,
  '100 Points + PromoKey',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000005',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000009',
  'Devon House Gourmet Court',
  'Devon House Gourmet Bakery & Ice Cream Crawl',
  'devon-house-gourmet-bakery-ice-cream-crawl',
  'Historic estate culinary exploration featuring world-famous gourmet patties and authentic Devon House I Scream.',
  'Food & Drinks',
  'Hope Rd, Kingston',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days 3 hours',
  100,
  '100 Points + PromoKey',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000006',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000010',
  'Janga''s Soundbar & Grill',
  'Live Acoustic & Grill at Janga''s',
  'live-acoustic-grill-at-jangas',
  'Relaxed open-air courtyard sessions with acoustic live bands, craft cocktails, and authentic Jamaican grilled bites.',
  'Gatherings & Culture',
  'Belmont Rd, New Kingston',
  NOW() + INTERVAL '8 days',
  NOW() + INTERVAL '8 days 4 hours',
  60,
  '100 Points + PromoKey',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0002-000000000015',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0003-000000000011',
  'Downtown Art District',
  'Downtown Kingston Creative Artwalk & Mural Tour',
  'downtown-kingston-creative-artwalk-mural-tour',
  'Free public cultural festival celebrating street murals, live performances, local crafts, and historic lane tours.',
  'Gatherings & Culture',
  'Water Lane & Church St, Downtown KGN',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '10 days 7 hours',
  200,
  '150 Points + PromoKey',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
  true,
  'open',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  location = EXCLUDED.location,
  venue_id = EXCLUDED.venue_id,
  venue_name = EXCLUDED.venue_name,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  reward = EXCLUDED.reward,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active;

-- 5. Refresh public schema cache
NOTIFY pgrst, 'reload schema';
