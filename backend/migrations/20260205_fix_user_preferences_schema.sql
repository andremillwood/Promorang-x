-- Migration: Flatten user_preferences table
-- Adds top-level columns for demographic and geographic data for better querying and RLS support

-- 1. Add missing columns to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_radius_km DECIMAL DEFAULT 50,
ADD COLUMN IF NOT EXISTS location_sharing_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lifestyle_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_times TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_digest_frequency TEXT DEFAULT 'daily';

-- 2. Migrate data from old JSONB fields (if they exist)
DO $$
BEGIN
    -- Migrate demographics
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'demographics') THEN
        UPDATE user_preferences 
        SET 
            age_range = demographics->>'age_range',
            gender = demographics->>'gender'
        WHERE demographics IS NOT NULL AND demographics != '{}';
    END IF;

    -- Migrate location_data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'location_data') THEN
        UPDATE user_preferences 
        SET 
            city = location_data->>'city',
            state = location_data->>'state',
            country = COALESCE(location_data->>'country', 'US'),
            latitude = (location_data->>'lat')::DECIMAL,
            longitude = (location_data->>'long')::DECIMAL
        WHERE location_data IS NOT NULL AND location_data != '{}';
    END IF;
END $$;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_age_range ON user_preferences(age_range);
CREATE INDEX IF NOT EXISTS idx_user_preferences_gender ON user_preferences(gender);
CREATE INDEX IF NOT EXISTS idx_user_preferences_city ON user_preferences(city);

-- 4. Success message
DO $$
BEGIN
    RAISE NOTICE 'user_preferences table flattened successfully!';
END $$;
