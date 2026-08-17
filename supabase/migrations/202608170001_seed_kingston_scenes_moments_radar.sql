-- ============================================================
-- MIGRATION: 202608170001_seed_kingston_scenes_moments_radar.sql
-- Description: Fully reconciled Kingston Scenes, Moments, 
--              Discovery Polls, and PromoKey schemas.
-- ============================================================

-- 1. Ensure Supporting Tables and Columns exist (Handles both discovery_id and question_id column names)
CREATE TABLE IF NOT EXISTS public.discovery_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES public.scenes(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    category TEXT NOT NULL,
    author_name TEXT DEFAULT 'Community Steward',
    total_votes INTEGER DEFAULT 0,
    threshold_for_moment INTEGER DEFAULT 50,
    is_moment_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discovery_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discovery_id UUID REFERENCES public.discovery_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add discovery_id and question_id columns to discovery_options so both naming patterns work
ALTER TABLE public.discovery_options ADD COLUMN IF NOT EXISTS discovery_id UUID REFERENCES public.discovery_questions(id) ON DELETE CASCADE;
ALTER TABLE public.discovery_options ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES public.discovery_questions(id) ON DELETE CASCADE;
ALTER TABLE public.discovery_options ADD COLUMN IF NOT EXISTS votes_count INTEGER DEFAULT 0;
ALTER TABLE public.discovery_options ADD COLUMN IF NOT EXISTS option_text TEXT;

CREATE TABLE IF NOT EXISTS public.promokey_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id UUID REFERENCES public.moments(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    promo_code TEXT NOT NULL UNIQUE,
    perk_description TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace_crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    objective TEXT,
    scene_affinity TEXT,
    off_peak_capacity_perk TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed / Upsert Kingston Scenes by slug
INSERT INTO public.scenes (title, slug, description, city, country, image_url, visibility, status, metadata)
VALUES
  (
    'Kingston After Dark',
    'kingston-after-dark',
    'The definitive lens for nightlife, late-night food spots, live music, and party culture in Kingston.',
    'Kingston',
    'Jamaica',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    'public',
    'active',
    '{"category": "Nightlife & Music", "tagline": "Where Kingston nights turn into stories.", "curator": "Promorang Culture Guild"}'::jsonb
  ),
  (
    'Food & Taste Jamaica',
    'food-and-taste',
    'Discover underrated breakfast joints, street vendors, chef popups, and signature dining experiences.',
    'Kingston',
    'Jamaica',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    'public',
    'active',
    '{"category": "Food & Dining", "tagline": "Taste the craft, passion, and heritage of Kingston.", "curator": "Taste Collective"}'::jsonb
  ),
  (
    'Move & Fitness Jamaica',
    'move-jamaica',
    'Active lifestyle, outdoor runs, fitness popups, wellness retreats, and beach workouts.',
    'Kingston',
    'Jamaica',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    'public',
    'active',
    '{"category": "Fitness & Health", "tagline": "Move with intention across Kingston.", "curator": "Movement Club"}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- 3. Seed / Upsert Kingston Moments
INSERT INTO public.moments (id, title, description, category, location, venue_name, starts_at, max_participants, reward, image_url, is_active, visibility)
VALUES
  (
    '00000000-0000-0000-0002-000000000025',
    'FAT Wednesdays Live Social & Game Night',
    $desc$High-energy midweek gathering at Usain Bolt's flagship lounge with 45+ HD screens, signature jerk platters, live DJ sets, and Bolt burgers.$desc$,
    'Nightlife & Social',
    '67 Constant Spring Rd, Marketplace, Kingston',
    $venue$Usain Bolt's Tracks & Records$venue$,
    NOW() + INTERVAL '2 days',
    150,
    '120 Proof Points + PromoKey',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000026',
    'Chandon Open House Friday Courtyard Soirée',
    $desc$Sophisticated open-air Friday courtyard soiree at the historic Devon House with dry-aged steak cuts, Chandon champagne, and elevated social vibes.$desc$,
    'Food & Wine',
    '26 Hope Rd, Devon House Courtyard, Kingston',
    $venue$Steakhouse on the Verandah (Devon House)$venue$,
    NOW() + INTERVAL '4 days',
    100,
    '150 Proof Points + PromoKey',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000022',
    'Tacos, Margaritas & Patio Beats at Tacbar',
    $desc$Devon House courtyard street taco hub blending authentic Mexican barbacoa and carnitas with spicy Jamaican Scotch bonnet flare.$desc$,
    'Dining & Culture',
    '26 Hope Rd, Devon House Courtyard, Kingston',
    $venue$Tacbar Jamaica (Devon House)$venue$,
    NOW() + INTERVAL '1 day',
    80,
    '100 Proof Points',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000023',
    'Let Lyme Friday Poolside & Grill at Pegasus',
    $desc$Premier New Kingston weekend kickoff at the Pegasus tropical pool lounge with live acoustic entertainment and barbecue grill stations.$desc$,
    'Social & Music',
    '81 Knutsford Blvd, New Kingston',
    $venue$The Jamaica Pegasus Hotel (Pool Lounge)$venue$,
    NOW() + INTERVAL '4 days',
    200,
    '100 Proof Points',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    'Kingston Dub Club Sunday Roots Session',
    $desc$Legendary weekly hilltop sound system gathering overlooking city lights. Authentic dub plates and strictly conscious vibes.$desc$,
    'Music & Roots',
    'Skyline Drive, Jacks Hill, Kingston',
    $venue$Kingston Dub Club$venue$,
    NOW() + INTERVAL '6 days',
    300,
    '100 Proof Points',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000015',
    'Downtown Kingston Creative Artwalk & Mural Tour',
    $desc$Free public cultural festival celebrating street murals, live performances, local crafts, and historic lane tours.$desc$,
    'Arts & Heritage',
    'Water Lane & Church St, Downtown Kingston',
    $venue$Downtown Art District$venue$,
    NOW() + INTERVAL '12 days',
    500,
    '150 Proof Points + Badge',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  location = EXCLUDED.location,
  venue_name = EXCLUDED.venue_name,
  reward = EXCLUDED.reward,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 4. Dynamically Link Moments to Scenes using slug lookups
INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000025'::uuid, s.id, 'featured'
FROM public.scenes s WHERE s.slug = 'kingston-after-dark'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000026'::uuid, s.id, 'featured'
FROM public.scenes s WHERE s.slug = 'food-and-taste'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000022'::uuid, s.id, 'partner'
FROM public.scenes s WHERE s.slug = 'food-and-taste'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000023'::uuid, s.id, 'featured'
FROM public.scenes s WHERE s.slug = 'kingston-after-dark'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000004'::uuid, s.id, 'origin'
FROM public.scenes s WHERE s.slug = 'kingston-after-dark'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000015'::uuid, s.id, 'featured'
FROM public.scenes s WHERE s.slug = 'kingston-after-dark'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

-- 5. Seed Discovery Intelligence Questions & Options (Populating both discovery_id and question_id)
DO $$
DECLARE
  v_food_scene_id UUID;
  v_dark_scene_id UUID;
  v_q1_id UUID := '00000000-0000-0000-0003-000000000001'::uuid;
  v_q2_id UUID := '00000000-0000-0000-0003-000000000002'::uuid;
BEGIN
  SELECT id INTO v_food_scene_id FROM public.scenes WHERE slug = 'food-and-taste' LIMIT 1;
  SELECT id INTO v_dark_scene_id FROM public.scenes WHERE slug = 'kingston-after-dark' LIMIT 1;

  INSERT INTO public.discovery_questions (id, scene_id, question, category, author_name, total_votes, threshold_for_moment)
  VALUES
    (v_q1_id, v_food_scene_id, 'What should Promorang make happen in Kingston next?', 'Market Intelligence', 'Kingston Culture Desk', 42, 50),
    (v_q2_id, v_dark_scene_id, 'Which midweek after-work hangout spot needs better exclusive perks?', 'Nightlife & Dining', 'Promorang Community Guild', 29, 40)
  ON CONFLICT (id) DO UPDATE SET
    scene_id = EXCLUDED.scene_id,
    question = EXCLUDED.question;

  INSERT INTO public.discovery_options (id, discovery_id, question_id, option_text, votes_count)
  VALUES
    ('00000000-0000-0000-0004-000000000001', v_q1_id, v_q1_id, 'FAT Wednesdays at Tracks & Records VIP pass', 22),
    ('00000000-0000-0000-0004-000000000002', v_q1_id, v_q1_id, 'Friday Courtyard Open House at Steakhouse on the Verandah', 14),
    ('00000000-0000-0000-0004-000000000003', v_q1_id, v_q1_id, 'Sunset High Tea & Coffee Cupping in Irish Town', 6),
    ('00000000-0000-0000-0004-000000000004', v_q2_id, v_q2_id, 'Pegasus Poolside Lyme & Barbecue', 16),
    ('00000000-0000-0000-0004-000000000005', v_q2_id, v_q2_id, 'Tacbar Taco Tuesday at Devon House', 9),
    ('00000000-0000-0000-0004-000000000006', v_q2_id, v_q2_id, 'AC Hotel Lounge Tapas & Mixology', 4)
  ON CONFLICT (id) DO UPDATE SET
    discovery_id = EXCLUDED.discovery_id,
    question_id = EXCLUDED.question_id,
    option_text = EXCLUDED.option_text;
END $$;

NOTIFY pgrst, 'reload schema';
