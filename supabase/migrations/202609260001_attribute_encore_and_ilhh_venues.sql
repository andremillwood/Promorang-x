-- Make the venue directory and Moment attribution agree:
-- Encore is hosted by Footprints Cafe; I Luv Hip Hop is hosted by Dulce Lounge.
-- Sea Deck/AftrHrs is already linked correctly and is intentionally untouched.

DO $$
DECLARE
  v_host_id uuid := '00000000-0000-0000-0000-000000000001';
  v_footprints_id uuid;
  v_dulce_id uuid;
BEGIN
  SELECT id INTO v_footprints_id
  FROM public.venues
  WHERE lower(COALESCE(name, venue_name, '')) IN ('footprints cafe', 'footprints café')
     OR slug = 'footprints-cafe'
  ORDER BY created_at NULLS LAST
  LIMIT 1;

  v_footprints_id := COALESCE(v_footprints_id, '00000000-0000-0000-0003-000000000081'::uuid);

  INSERT INTO public.venues (
    id, owner_id, name, venue_name, address, location, description, image_url,
    category, is_active, slug, latitude, longitude, is_verified
  ) VALUES (
    v_footprints_id, v_host_id, 'Footprints Cafe', 'Footprints Cafe',
    '5 Belmont Road, Saint Andrew, Jamaica',
    '5 Belmont Road, Saint Andrew, Jamaica',
    'A Belmont Road restaurant and nightlife venue in Kingston.',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800',
    'Restaurant & Nightlife', true, 'footprints-cafe', 18.0017055, -76.7849963, false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    venue_name = EXCLUDED.venue_name,
    address = EXCLUDED.address,
    location = EXCLUDED.location,
    slug = EXCLUDED.slug,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    is_active = true,
    updated_at = now();

  IF NOT EXISTS (
    SELECT 1 FROM public.venue_profiles
    WHERE id = v_footprints_id OR slug = 'footprints-cafe'
  ) THEN
    INSERT INTO public.venue_profiles (
      id, name, slug, description, location, address, city, country, venue_type,
      verification_status, images, featured_image_url, latitude, longitude,
      is_active, popularity_score
    ) VALUES (
      v_footprints_id, 'Footprints Cafe', 'footprints-cafe',
      'A Belmont Road restaurant and nightlife venue in Kingston.',
      'Belmont Road, Kingston', '5 Belmont Road, Saint Andrew, Jamaica',
      'Kingston', 'Jamaica', 'restaurant', 'unverified',
      '[]'::jsonb,
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800',
      18.0017055, -76.7849963, true, 0
    );
  END IF;

  SELECT id INTO v_dulce_id
  FROM public.venues
  WHERE lower(COALESCE(name, venue_name, '')) = 'dulce lounge'
     OR slug = 'dulce-lounge'
  ORDER BY created_at NULLS LAST
  LIMIT 1;

  v_dulce_id := COALESCE(v_dulce_id, '00000000-0000-0000-0003-000000000082'::uuid);

  INSERT INTO public.venues (
    id, owner_id, name, venue_name, address, location, description, image_url,
    category, is_active, slug, is_verified
  ) VALUES (
    v_dulce_id, v_host_id, 'Dulce Lounge', 'Dulce Lounge',
    'Kingston, Jamaica', 'Kingston, Jamaica',
    'A Kingston nightlife venue and the home of I Luv Hip Hop.',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    'Nightlife & Music', true, 'dulce-lounge', false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    venue_name = EXCLUDED.venue_name,
    description = EXCLUDED.description,
    slug = EXCLUDED.slug,
    is_active = true,
    updated_at = now();

  IF NOT EXISTS (
    SELECT 1 FROM public.venue_profiles
    WHERE id = v_dulce_id OR slug = 'dulce-lounge'
  ) THEN
    INSERT INTO public.venue_profiles (
      id, name, slug, description, location, address, city, country, venue_type,
      verification_status, images, featured_image_url, is_active, popularity_score
    ) VALUES (
      v_dulce_id, 'Dulce Lounge', 'dulce-lounge',
      'A Kingston nightlife venue and the home of I Luv Hip Hop.',
      'Kingston, Jamaica', 'Kingston, Jamaica', 'Kingston', 'Jamaica', 'club',
      'unverified', '[]'::jsonb,
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
      true, 0
    );
  END IF;

  UPDATE public.moments
  SET venue_id = v_footprints_id,
      venue_name = 'Footprints Cafe',
      location = 'Footprints Cafe, 5 Belmont Road, Kingston',
      description = replace(description, ' at Fiction.', ' at Footprints Cafe.'),
      updated_at = now()
  WHERE id = '00000000-0000-0000-0002-000000000002'
     OR slug IN ('encore', 'encore-90s-fridays', 'encore-wednesday-social-vip')
     OR (
       title ILIKE '%Encore%'
       AND title NOT ILIKE '%Capleton%'
       AND title NOT ILIKE '%Encore Live%'
       AND COALESCE(slug, '') NOT ILIKE '%encore-live%'
     );

  UPDATE public.moments
  SET venue_id = v_dulce_id,
      venue_name = 'Dulce Lounge',
      location = 'Dulce Lounge, Kingston',
      description = replace(description, ' at Fiction.', ' at Dulce Lounge.'),
      updated_at = now()
  WHERE id = '00000000-0000-0000-0002-000000000001'
     OR slug = 'i-luv-hip-hop-live-culture-lab'
     OR title ILIKE '%I Luv Hip Hop%';

  UPDATE public.presents_experiences
  SET venue_name = 'Footprints Cafe', updated_at = now()
  WHERE event_name IN ('Encore', 'Encore 90s Fridays')
     OR slug IN ('encore-secret-table', 'encore-fast-lane');

  UPDATE public.presents_experiences
  SET venue_name = 'Dulce Lounge', updated_at = now()
  WHERE event_name = 'I Luv Hip Hop'
     OR slug IN ('ilhh-dj-booth', 'ilhh-pick-track');
END $$;
