-- Seed Promorang Curated Flagship Scenes (Individual Statements)

INSERT INTO public.scenes (id, slug, title, description, city, country, image_url, visibility, status, metadata)
VALUES (
  'a1111111-1111-4111-8111-111111111111',
  'sound-system-night-culture',
  'Sound System & Night Culture',
  'The home for sound system culture, DJ sets, street dances, and late-night movement across Jamaica and beyond.',
  'Kingston',
  'Jamaica',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  'public',
  'active',
  '{"tagline": "Riddims, late-night sessions, and verified dancefloor energy.", "welcome": "Welcome to the dancefloor. Discover upcoming sessions, record your check-ins, and support the sound.", "vibe": ["Reggae", "Dancehall", "Afrobeats", "Sound Clash", "Nightlife"], "recurring_ritual": "Midnight Check-In & Creator Recap Drop", "curated_by_platform": true}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.scenes (id, slug, title, description, city, country, image_url, visibility, status, metadata)
VALUES (
  'a2222222-2222-4222-8222-222222222222',
  'creative-coffee-club',
  'Downtown Coffee & Creative Club',
  'A scene for freelancers, podcasters, designers, and local roasters turning morning coffee into collaborative energy.',
  'Kingston',
  'Jamaica',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  'public',
  'active',
  '{"tagline": "Morning brews, co-working sessions, and creator linkups.", "welcome": "Fuel your mornings. Co-work with fellow creators and unlock merchant coffee perks.", "vibe": ["Coffee", "Co-Working", "Designers", "Podcasts"], "recurring_ritual": "First Brew Tuesday Check-In", "curated_by_platform": true}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.scenes (id, slug, title, description, city, country, image_url, visibility, status, metadata)
VALUES (
  'a3333333-3333-4333-8333-333333333333',
  'drop-culture-collective',
  'Streetwear & Drop Culture',
  'A scene for independent designers, sneakerheads, vintage pop-ups, and capsule releases where being early matters.',
  'Kingston',
  'Jamaica',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
  'public',
  'active',
  '{"tagline": "First access, founder capsules, and verified collector proof.", "welcome": "Get first priority on limited drops and keep digital proof of every capsule in your Vault.", "vibe": ["Streetwear", "Fashion", "Capsules", "Sneakers"], "recurring_ritual": "Early-Bird QR Drop Scan", "curated_by_platform": true}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.scenes (id, slug, title, description, city, country, image_url, visibility, status, metadata)
VALUES (
  'a4444444-4444-4444-8444-444444444444',
  'sunrise-fit-recovery',
  'Sunrise Fitness & Recovery',
  'A fitness and wellness scene where 5K run clubs, beach yoga, and recovery drops turn sweat into community rewards.',
  'Montego Bay',
  'Jamaica',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  'public',
  'active',
  '{"tagline": "Run clubs, wellness pop-ups, and creator-led recovery sessions.", "welcome": "Show up for sunrise. Track your workouts, join run clubs, and redeem recovery perks.", "vibe": ["Fitness", "Run Club", "Yoga", "Wellness"], "recurring_ritual": "Post-Run Hydration Check-In", "curated_by_platform": true}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.scenes (id, slug, title, description, city, country, image_url, visibility, status, metadata)
VALUES (
  'a5555555-5555-4555-8555-555555555555',
  'city-culinary-rituals',
  'City Food & Culinary Rituals',
  'A culinary scene for foodies, street food runs, secret supper clubs, and merchant tasting rituals worth showing up for.',
  'Kingston',
  'Jamaica',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'public',
  'active',
  '{"tagline": "Pop-up dinners, chef collabs, and secret tasting drops.", "welcome": "Taste the city. Join secret dinners, discover local food trucks, and get chef rewards.", "vibe": ["Food", "Tastings", "Pop-Ups", "Chef Collabs"], "recurring_ritual": "Secret Menu QR Unlock", "curated_by_platform": true}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();
