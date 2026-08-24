-- ============================================================
-- MIGRATION: 202608170001_seed_kingston_scenes_moments_radar.sql
-- Description: Standard ANSI SQL without anonymous DO blocks or custom dollar tags.
--              100% compatible with Supabase SQL Editor and automated linters.
-- ============================================================

-- 1. Ensure Supporting Tables and Columns exist
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

-- Enable Row Level Security (RLS) on newly created tables with public read policy
ALTER TABLE public.discovery_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promokey_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_crm_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read discovery questions" ON public.discovery_questions;
CREATE POLICY "Allow public read discovery questions" ON public.discovery_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read discovery options" ON public.discovery_options;
CREATE POLICY "Allow public read discovery options" ON public.discovery_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated vote discovery options" ON public.discovery_options;
CREATE POLICY "Allow authenticated vote discovery options" ON public.discovery_options FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow user access own promokeys" ON public.promokey_claims;
CREATE POLICY "Allow user access own promokeys" ON public.promokey_claims FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow insert crm leads" ON public.marketplace_crm_leads;
CREATE POLICY "Allow insert crm leads" ON public.marketplace_crm_leads FOR INSERT WITH CHECK (true);

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
    'High-energy midweek gathering at Usain Bolt flagship lounge with 45+ HD screens, signature jerk platters, live DJ sets, and Bolt burgers.',
    'Nightlife & Social',
    '67 Constant Spring Rd, Marketplace, Kingston',
    'Usain Bolt Tracks and Records',
    NOW() + INTERVAL '2 days',
    150,
    '120 PromoPoints + PromoKey',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000026',
    'Chandon Open House Friday Courtyard Soirée',
    'Sophisticated open-air Friday courtyard soiree at the historic Devon House with dry-aged steak cuts, Chandon champagne, and elevated social vibes.',
    'Food & Wine',
    '26 Hope Rd, Devon House Courtyard, Kingston',
    'Steakhouse on the Verandah (Devon House)',
    NOW() + INTERVAL '4 days',
    100,
    '150 PromoPoints + PromoKey',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000022',
    'Tacos, Margaritas & Patio Beats at Tacbar',
    'Devon House courtyard street taco hub blending authentic Mexican barbacoa and carnitas with spicy Jamaican Scotch bonnet flare.',
    'Dining & Culture',
    '26 Hope Rd, Devon House Courtyard, Kingston',
    'Tacbar Jamaica (Devon House)',
    NOW() + INTERVAL '1 day',
    80,
    '100 PromoPoints',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000023',
    'Let Lyme Friday Poolside & Grill at Pegasus',
    'Premier New Kingston weekend kickoff at the Pegasus tropical pool lounge with live acoustic entertainment and barbecue grill stations.',
    'Social & Music',
    '81 Knutsford Blvd, New Kingston',
    'The Jamaica Pegasus Hotel (Pool Lounge)',
    NOW() + INTERVAL '4 days',
    200,
    '100 PromoPoints',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    'Kingston Dub Club Sunday Roots Session',
    'Legendary weekly hilltop sound system gathering overlooking city lights. Authentic dub plates and strictly conscious vibes.',
    'Music & Roots',
    'Skyline Drive, Jacks Hill, Kingston',
    'Kingston Dub Club',
    NOW() + INTERVAL '6 days',
    300,
    '100 PromoPoints',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000015',
    'Downtown Kingston Creative Artwalk & Mural Tour',
    'Free public cultural festival celebrating street murals, live performances, local crafts, and historic lane tours.',
    'Arts & Heritage',
    'Water Lane & Church St, Downtown Kingston',
    'Downtown Art District',
    NOW() + INTERVAL '12 days',
    500,
    '150 PromoPoints + Badge',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000017',
    'Tacos & Reggae Jam at Chilitos JaMexican',
    'Lively courtyard fiesta blending authentic Mexican tacos, burritos, and tequila cocktails with bold Jamaican spices.',
    'Dining & Culture',
    '88 Hope Rd, Kingston 6',
    'Chilitos JaMexican',
    NOW() + INTERVAL '3 days',
    120,
    '100 PromoPoints',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000018',
    'AC Lounge Tapas & Craft Mixology Evenings',
    'Chic European-inspired lounge with Spanish tapas, signature rum cocktails, and cosmopolitan weekend DJ sets.',
    'Nightlife & Social',
    '38-42 Lady Musgrave Rd, Kingston',
    'AC Lounge (AC Hotel Kingston)',
    NOW() + INTERVAL '5 days',
    140,
    '100 PromoPoints',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000005',
    'Devon House Gourmet Bakery & Ice Cream Crawl',
    'Historic estate culinary exploration featuring world-famous gourmet patties and authentic Devon House I Scream.',
    'Food & Wine',
    'Hope Rd, Kingston',
    'Devon House Gourmet Court',
    NOW() + INTERVAL '2 days',
    150,
    '100 PromoPoints',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    TRUE,
    'open'
  ),
  (
    '00000000-0000-0000-0002-000000000006',
    'Live Acoustic & Grill at Janga''s',
    'Relaxed open-air courtyard sessions with acoustic live bands, craft cocktails, and authentic Jamaican grilled bites.',
    'Social & Music',
    'Belmont Rd, New Kingston',
    'Janga''s Soundbar & Grill',
    NOW() + INTERVAL '3 days',
    100,
    '100 PromoPoints',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
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

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000017'::uuid, s.id, 'partner'
FROM public.scenes s WHERE s.slug = 'food-and-taste'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000018'::uuid, s.id, 'featured'
FROM public.scenes s WHERE s.slug = 'kingston-after-dark'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000005'::uuid, s.id, 'featured'
FROM public.scenes s WHERE s.slug = 'food-and-taste'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

INSERT INTO public.moment_scene_links (moment_id, scene_id, relationship)
SELECT '00000000-0000-0000-0002-000000000006'::uuid, s.id, 'featured'
FROM public.scenes s WHERE s.slug = 'kingston-after-dark'
ON CONFLICT (moment_id, scene_id, relationship) DO NOTHING;

-- 5. Seed Discovery Questions directly with dynamic subqueries (No PL/pgSQL DO blocks needed)
INSERT INTO public.discovery_questions (id, scene_id, question, category, author_name, total_votes, threshold_for_moment)
VALUES
  (
    '00000000-0000-0000-0003-000000000001',
    (SELECT id FROM public.scenes WHERE slug = 'food-and-taste' LIMIT 1),
    'What should Promorang make happen in Kingston next?',
    'Market Intelligence',
    'Kingston Culture Desk',
    42,
    50
  ),
  (
    '00000000-0000-0000-0003-000000000002',
    (SELECT id FROM public.scenes WHERE slug = 'kingston-after-dark' LIMIT 1),
    'Which midweek after-work hangout spot needs better exclusive perks?',
    'Nightlife & Dining',
    'Promorang Community Guild',
    29,
    40
  )
ON CONFLICT (id) DO UPDATE SET
  scene_id = EXCLUDED.scene_id,
  question = EXCLUDED.question;

-- 6. Seed Discovery Options
INSERT INTO public.discovery_options (id, discovery_id, question_id, option_text, votes_count)
VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0003-000000000001', 'FAT Wednesdays at Tracks and Records VIP pass', 22),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0003-000000000001', 'Friday Courtyard Open House at Steakhouse on the Verandah', 14),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0003-000000000001', 'Sunset High Tea and Coffee Cupping in Irish Town', 6),
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0003-000000000002', 'Pegasus Poolside Lyme and Barbecue', 16),
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0003-000000000002', 'Tacbar Taco Tuesday at Devon House', 9),
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0003-000000000002', 'AC Hotel Lounge Tapas and Mixology', 4)
ON CONFLICT (id) DO UPDATE SET
  discovery_id = EXCLUDED.discovery_id,
  question_id = EXCLUDED.question_id,
  option_text = EXCLUDED.option_text;

NOTIFY pgrst, 'reload schema';
