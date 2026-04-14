-- Migration to fix the upsert_user_preferences function which was throwing:
-- "null value in column 'id' of relation 'profiles' violates not-null constraint"
-- The profile fallback insert incorrectly used 'user_id' instead of 'id'.

CREATE OR REPLACE FUNCTION public.upsert_user_preferences(
  p_user_id uuid,
  p_age_range text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_country text DEFAULT 'US',
  p_latitude decimal DEFAULT NULL,
  p_longitude decimal DEFAULT NULL,
  p_location_radius_km integer DEFAULT 25,
  p_location_sharing_enabled boolean DEFAULT false,
  p_lifestyle_tags text[] DEFAULT '{}',
  p_preferred_categories text[] DEFAULT '{}',
  p_preferred_times text[] DEFAULT '{}',
  p_notification_enabled boolean DEFAULT true,
  p_email_digest_frequency text DEFAULT 'weekly'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Ensure the caller matches the user_id being inserted
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Ensure a profile row exists (the handle_new_user trigger may have failed)
  -- FIX: Insert into `id` as it's the primary key referencing auth.users
  INSERT INTO public.profiles (id)
  VALUES (p_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Upsert the preferences
  INSERT INTO public.user_preferences (
    user_id, age_range, gender, city, state, country,
    latitude, longitude, location_radius_km, location_sharing_enabled,
    lifestyle_tags, preferred_categories, preferred_times,
    notification_enabled, email_digest_frequency
  ) VALUES (
    p_user_id, p_age_range, p_gender, p_city, p_state, p_country,
    p_latitude, p_longitude, p_location_radius_km, p_location_sharing_enabled,
    p_lifestyle_tags, p_preferred_categories, p_preferred_times,
    p_notification_enabled, p_email_digest_frequency
  )
  ON CONFLICT (user_id) DO UPDATE SET
    age_range = COALESCE(EXCLUDED.age_range, user_preferences.age_range),
    gender = COALESCE(EXCLUDED.gender, user_preferences.gender),
    city = COALESCE(EXCLUDED.city, user_preferences.city),
    state = COALESCE(EXCLUDED.state, user_preferences.state),
    country = COALESCE(EXCLUDED.country, user_preferences.country),
    latitude = COALESCE(EXCLUDED.latitude, user_preferences.latitude),
    longitude = COALESCE(EXCLUDED.longitude, user_preferences.longitude),
    location_radius_km = COALESCE(EXCLUDED.location_radius_km, user_preferences.location_radius_km),
    location_sharing_enabled = COALESCE(EXCLUDED.location_sharing_enabled, user_preferences.location_sharing_enabled),
    lifestyle_tags = COALESCE(EXCLUDED.lifestyle_tags, user_preferences.lifestyle_tags),
    preferred_categories = COALESCE(EXCLUDED.preferred_categories, user_preferences.preferred_categories),
    preferred_times = COALESCE(EXCLUDED.preferred_times, user_preferences.preferred_times),
    notification_enabled = COALESCE(EXCLUDED.notification_enabled, user_preferences.notification_enabled),
    email_digest_frequency = COALESCE(EXCLUDED.email_digest_frequency, user_preferences.email_digest_frequency),
    updated_at = now()
  RETURNING row_to_json(user_preferences.*) INTO result;

  RETURN result;
END;
$$;
