-- User Demographics, Life Events & Contextual Targeting System
-- Timestamp: 2026-04-20

-- =====================================================
-- 1. USER DEMOGRAPHICS TABLE
-- Extended demographic & life context data for personalization
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_demographics (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic Demographics
  gender text CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_say', 'other')),
  gender_identity text, -- Freeform for inclusivity
  marital_status text CHECK (marital_status IN ('single', 'dating', 'engaged', 'married', 'partnership', 'divorced', 'widowed', 'prefer_not_say')),
  relationship_type text CHECK (relationship_type IN ('monogamous', 'polyamorous', 'open', 'long_distance', 'other')),
  
  -- Family/Household
  has_children boolean DEFAULT false,
  children_count int DEFAULT 0,
  children_ages int[], -- Array of ages for targeting kids products
  household_size int,
  living_situation text CHECK (living_situation IN ('alone', 'roommates', 'partner', 'family', 'other')),
  has_pets boolean DEFAULT false,
  pet_types text[], -- ['dog', 'cat', 'bird', 'other']
  
  -- Life Events & Dates (for celebration targeting)
  birthday date, -- Full birthday for age calculation
  birthday_month int CHECK (birthday_month BETWEEN 1 AND 12),
  birthday_day int CHECK (birthday_day BETWEEN 1 AND 31),
  anniversary_date date,
  
  -- Cultural/Religious Context
  country_origin text, -- For diaspora targeting
  languages_spoken text[],
  religion text,
  cultural_background text,
  
  -- Professional Context
  industry_sector text,
  work_schedule text CHECK (work_schedule IN ('9-5', 'shift', 'freelance', 'student', 'unemployed', 'retired', 'flexible')),
  remote_work boolean DEFAULT false,
  commute_type text, -- car, public_transit, bike, walk, none
  
  -- Lifestyle
  fitness_level text CHECK (fitness_level IN ('sedentary', 'light', 'moderate', 'active', 'athlete')),
  dietary_preferences text[], -- vegan, vegetarian, keto, halal, kosher, gluten_free
  drinking_habits text CHECK (drinking_habits IN ('never', 'rarely', 'socially', 'regularly', 'prefer_not_say')),
  smoking_status text CHECK (smoking_status IN ('never', 'former', 'occasional', 'regular', 'prefer_not_say')),
  
  -- Tech/Platform Usage
  primary_platforms text[], -- instagram, tiktok, youtube, twitch
  content_niches text[], -- fashion, tech, parenting, fitness, etc.
  creator_ambitions text CHECK (creator_ambitions IN ('hobby', 'side_hustle', 'full_time', 'influencer', 'brand')),
  
  -- Metadata
  profile_completion_score int DEFAULT 0, -- 0-100 based on fields filled
  last_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_demographics_birthday_month ON public.user_demographics(birthday_month);
CREATE INDEX IF NOT EXISTS idx_user_demographics_marital_status ON public.user_demographics(marital_status);
CREATE INDEX IF NOT EXISTS idx_user_demographics_gender ON public.user_demographics(gender);

-- =====================================================
-- 2. USER CALENDAR TABLE
-- Personal calendar for birthdays, anniversaries, subscribed events
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  event_type text NOT NULL CHECK (event_type IN (
    'my_birthday', 
    'partner_birthday', 
    'anniversary', 
    'child_birthday',
    'friend_birthday', 
    'pet_birthday', 
    'work_anniversary',
    'subscribed_global', 
    'custom'
  )),
  
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  is_recurring boolean DEFAULT true,
  notify_days_before int[] DEFAULT '{7, 1}', -- Reminders at 7 days and 1 day
  
  -- For gift/experience recommendations
  gift_hints jsonb DEFAULT '{}', -- {interests: ['tech'], avoid: ['alcohol'], budget: 'medium'}
  relation_to_user text, -- 'self', 'partner', 'child', 'friend', 'pet'
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_calendar_user_id ON public.user_calendar(user_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_event_date ON public.user_calendar(event_date);
CREATE INDEX IF NOT EXISTS idx_user_calendar_event_type ON public.user_calendar(event_type);

-- =====================================================
-- 3. GLOBAL EVENTS TABLE
-- Curated database of global sports, music, holidays, cultural events
-- =====================================================

CREATE TABLE IF NOT EXISTS public.global_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event Classification
  event_type text NOT NULL CHECK (event_type IN (
    'sports',           -- World Cup, Olympics, Super Bowl
    'music',            -- Coachella, Grammy Awards, album drops
    'entertainment',    -- Oscars, Comic-Con, movie premieres
    'holiday',          -- Christmas, Diwali, Lunar New Year
    'cultural',         -- Pride Month, Black History Month
    'shopping',         -- Black Friday, Prime Day
    'seasonal',         -- First day of summer, winter solstice
    'awareness',        -- Earth Day, Mental Health Awareness
    'local',            -- City-specific events
    'custom'            -- User-created
  )),
  
  -- Event Details
  name text NOT NULL,
  description text,
  short_name text, -- For notifications (e.g., "The Big Game")
  
  -- Date range
  start_date date NOT NULL,
  end_date date, -- NULL for single-day events
  start_time timestamptz, -- For specific start times
  
  -- Geographic Scope
  global boolean DEFAULT false,
  countries text[], -- ['US', 'CA', 'GB'] or NULL for global
  regions text[], -- ['north_america', 'europe', 'asia_pacific', 'latam', 'mea']
  cities text[], -- Specific cities for local events
  timezone text DEFAULT 'UTC',
  
  -- Category targeting
  categories text[], -- e.g., ['football', 'nfl'] for sports
  genres text[], -- e.g., ['pop', 'electronic'] for music
  interests text[], -- Target interest categories
  
  -- Audience targeting
  target_age_min int,
  target_age_max int,
  target_gender text,
  target_marital_status text[],
  target_family_status text[], -- ['has_children', 'empty_nest']
  
  -- Related Content/Opportunities
  suggested_hashtags text[],
  brand_opportunity_score int CHECK (brand_opportunity_score BETWEEN 1 AND 100),
  content_opportunity_type text[], -- ['reaction', 'attendance', 'prediction', 'review']
  
  -- Metadata
  is_recurring boolean DEFAULT false,
  recurrence_pattern text, -- 'annual', 'quadrennial', 'monthly'
  parent_event_id uuid REFERENCES public.global_events(id), -- For recurring series
  event_series text, -- 'fifa_world_cup', 'olympics', 'coachella'
  
  -- External IDs
  external_ids jsonb DEFAULT '{}', -- {ticketmaster_id: 'xxx', sportsradar_id: 'yyy'}
  
  -- Status
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_global_events_type ON public.global_events(event_type);
CREATE INDEX IF NOT EXISTS idx_global_events_dates ON public.global_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_global_events_countries ON public.global_events USING GIN(countries);
CREATE INDEX IF NOT EXISTS idx_global_events_status ON public.global_events(status);
CREATE INDEX IF NOT EXISTS idx_global_events_categories ON public.global_events USING GIN(categories);

-- =====================================================
-- 4. USER EVENT SUBSCRIPTIONS
-- Users can subscribe to/follow events for alerts
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_event_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.global_events(id) ON DELETE CASCADE,
  
  notification_days_before int[] DEFAULT '{7, 1}',
  notification_channels text[] DEFAULT '{push, email}',
  
  subscribed_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_user_event_subscriptions_user ON public.user_event_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_subscriptions_event ON public.user_event_subscriptions(event_id);

-- =====================================================
-- 5. SEASONAL CONFIGURATION
-- Seasonal targeting for different hemispheres
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seasonal_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  hemisphere text CHECK (hemisphere IN ('northern', 'southern')),
  season text CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  
  -- Date ranges
  start_month int NOT NULL,
  start_day int NOT NULL,
  end_month int NOT NULL,
  end_day int NOT NULL,
  
  -- Associated themes & opportunities
  themes text[], -- ['back_to_school', 'beach_vacation']
  shopping_events text[], -- ['labor_day_sales']
  content_opportunities text[], -- ['summer_vibes']
  
  -- Targeting weights
  outdoor_activity_weight int DEFAULT 50, -- 0-100
  indoor_activity_weight int DEFAULT 50,
  travel_season boolean DEFAULT false,
  
  year int,
  active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. PROGRESSIVE PROFILING QUESTIONS
-- Questions to ask users one at a time for data collection
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiling_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_key text UNIQUE NOT NULL,
  question_text text NOT NULL,
  question_short text, -- For UI display
  description text, -- Help text explaining why we ask
  
  input_type text CHECK (input_type IN ('single_select', 'multi_select', 'date', 'text', 'number', 'boolean')),
  options jsonb, -- For select types: [{value: 'male', label: 'Male', emoji: '👨'}]
  
  category text CHECK (category IN ('demographics', 'lifestyle', 'family', 'work', 'preferences')),
  priority int DEFAULT 100, -- Order to ask (lower = earlier)
  
  points_reward int DEFAULT 50,
  field_mapping text, -- Which user_demographics field this maps to
  
  active boolean DEFAULT true,
  required boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 7. USER CONTEXT SNAPSHOTS
-- Cached context for feed personalization
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_context_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Current context
  current_season text,
  hemisphere text,
  local_weather text, -- cached weather condition
  temperature int,
  
  -- Upcoming events (next 30 days)
  upcoming_personal_events jsonb DEFAULT '[]',
  upcoming_global_events jsonb DEFAULT '[]',
  
  -- Holiday context
  next_holiday_name text,
  next_holiday_date date,
  days_until_holiday int,
  
  -- Age calculation from birthday
  current_age int,
  age_group text, -- 'gen_z', 'millennial', 'gen_x', 'boomer'
  
  -- Cached at
  calculated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour'),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_context_snapshots_user ON public.user_context_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_user_context_snapshots_expires ON public.user_context_snapshots(expires_at);

-- =====================================================
-- 8. TRIGGER FUNCTIONS
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS touch_user_calendar ON public.user_calendar;
CREATE TRIGGER touch_user_calendar
  BEFORE UPDATE ON public.user_calendar
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_global_events ON public.global_events;
CREATE TRIGGER touch_global_events
  BEFORE UPDATE ON public.global_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-calculate birthday month/day from full birthday
CREATE OR REPLACE FUNCTION public.extract_birthday_parts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.birthday IS NOT NULL THEN
    NEW.birthday_month = EXTRACT(MONTH FROM NEW.birthday);
    NEW.birthday_day = EXTRACT(DAY FROM NEW.birthday);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS extract_birthday_parts_trigger ON public.user_demographics;
CREATE TRIGGER extract_birthday_parts_trigger
  BEFORE INSERT OR UPDATE ON public.user_demographics
  FOR EACH ROW EXECUTE FUNCTION public.extract_birthday_parts();

-- Auto-calculate profile completion score
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_fields int := 20; -- Approximate number of important fields
  filled_fields int := 0;
BEGIN
  -- Count filled fields
  IF NEW.gender IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.marital_status IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.birthday IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.has_children IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.household_size IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.country_origin IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.languages_spoken IS NOT NULL AND array_length(NEW.languages_spoken, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.industry_sector IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.work_schedule IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.fitness_level IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.dietary_preferences IS NOT NULL AND array_length(NEW.dietary_preferences, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.content_niches IS NOT NULL AND array_length(NEW.content_niches, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.creator_ambitions IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.has_pets IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.living_situation IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.relationship_type IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.remote_work IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.commute_type IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.drinking_habits IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.smoking_status IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  
  NEW.profile_completion_score := (filled_fields * 100) / total_fields;
  NEW.last_updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_profile_completion_trigger ON public.user_demographics;
CREATE TRIGGER calculate_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON public.user_demographics
  FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_completion();

-- =====================================================
-- 9. SEED PROFILING QUESTIONS
-- =====================================================

INSERT INTO public.profiling_questions (question_key, question_text, question_short, description, input_type, options, category, priority, field_mapping, points_reward) VALUES
('birthday', 'When is your birthday?', 'Birthday', 'We use this to celebrate you and find age-appropriate opportunities', 'date', null, 'demographics', 1, 'birthday', 100),
('gender', 'How do you identify?', 'Gender', 'Helps us show you relevant fashion, beauty, and lifestyle opportunities', 'single_select', '[{"value": "male", "label": "Male", "emoji": "👨"}, {"value": "female", "label": "Female", "emoji": "👩"}, {"value": "non_binary", "label": "Non-Binary", "emoji": "⚧"}, {"value": "prefer_not_say", "label": "Prefer not to say", "emoji": "🤐"}]', 'demographics', 2, 'gender', 50),
('marital_status', 'What is your relationship status?', 'Relationship', 'Affects the types of experiences and deals we recommend', 'single_select', '[{"value": "single", "label": "Single", "emoji": "💃"}, {"value": "dating", "label": "Dating", "emoji": "💕"}, {"value": "engaged", "label": "Engaged", "emoji": "💍"}, {"value": "married", "label": "Married", "emoji": "👰"}, {"value": "partnership", "label": "Partnership", "emoji": "🤝"}, {"value": "prefer_not_say", "label": "Prefer not to say", "emoji": "🤐"}]', 'demographics', 3, 'marital_status', 50),
('has_children', 'Do you have children?', 'Children', 'Family-friendly opportunities and parenting content', 'single_select', '[{"value": "true", "label": "Yes", "emoji": "👶"}, {"value": "false", "label": "No", "emoji": "🚫"}, {"value": "expecting", "label": "Expecting", "emoji": "🤰"}]', 'family', 4, 'has_children', 50),
('children_ages', 'What are your children''s ages?', 'Kids Ages', 'For age-appropriate family opportunities', 'multi_select', '[{"value": "0-2", "label": "0-2 years"}, {"value": "3-5", "label": "3-5 years"}, {"value": "6-12", "label": "6-12 years"}, {"value": "13-17", "label": "Teenagers"}]', 'family', 5, 'children_ages', 50),
('has_pets', 'Any furry family members?', 'Pets', 'Pet product opportunities and content', 'multi_select', '[{"value": "dog", "label": "Dog", "emoji": "🐕"}, {"value": "cat", "label": "Cat", "emoji": "🐈"}, {"value": "other", "label": "Other", "emoji": "🐾"}, {"value": "none", "label": "No pets", "emoji": "❌"}]', 'family', 6, 'pet_types', 50),
('fitness_level', 'How active are you?', 'Activity Level', 'Fitness and wellness opportunities', 'single_select', '[{"value": "sedentary", "label": "Mostly sedentary"}, {"value": "light", "label": "Light activity"}, {"value": "moderate", "label": "Moderately active"}, {"value": "active", "label": "Very active"}, {"value": "athlete", "label": "Competitive athlete"}]', 'lifestyle', 7, 'fitness_level', 50),
('dietary_prefs', 'Any dietary preferences?', 'Diet', 'Food and dining opportunities', 'multi_select', '[{"value": "vegan", "label": "Vegan", "emoji": "🌱"}, {"value": "vegetarian", "label": "Vegetarian", "emoji": "🥗"}, {"value": "keto", "label": "Keto/Low-carb"}, {"value": "halal", "label": "Halal"}, {"value": "kosher", "label": "Kosher"}, {"value": "gluten_free", "label": "Gluten-free"}, {"value": "none", "label": "No restrictions"}]', 'lifestyle', 8, 'dietary_preferences', 50),
('work_schedule', 'What is your work situation?', 'Work', 'Helps with timing of opportunities', 'single_select', '[{"value": "9-5", "label": "9-5 Office"}, {"value": "shift", "label": "Shift work"}, {"value": "freelance", "label": "Freelance/Self-employed"}, {"value": "student", "label": "Student"}, {"value": "unemployed", "label": "Not currently working"}, {"value": "retired", "label": "Retired"}, {"value": "flexible", "label": "Flexible schedule"}]', 'work', 9, 'work_schedule', 50),
('content_niches', 'What content do you create or want to create?', 'Content Niches', 'Content opportunities matched to your interests', 'multi_select', '[{"value": "fashion", "label": "Fashion & Style", "emoji": "👗"}, {"value": "tech", "label": "Tech & Gadgets", "emoji": "📱"}, {"value": "fitness", "label": "Fitness & Health", "emoji": "💪"}, {"value": "food", "label": "Food & Cooking", "emoji": "🍳"}, {"value": "travel", "label": "Travel", "emoji": "✈️"}, {"value": "gaming", "label": "Gaming", "emoji": "🎮"}, {"value": "parenting", "label": "Parenting", "emoji": "👶"}, {"value": "beauty", "label": "Beauty & Makeup", "emoji": "💄"}, {"value": "business", "label": "Business & Finance", "emoji": "💼"}, {"value": "comedy", "label": "Comedy & Entertainment", "emoji": "😂"}]', 'preferences', 10, 'content_niches', 100)
ON CONFLICT (question_key) DO NOTHING;

-- =====================================================
-- 10. SEED MAJOR GLOBAL EVENTS (2026-2027)
-- =====================================================

INSERT INTO public.global_events (event_type, name, short_name, description, start_date, end_date, global, countries, regions, categories, genres, interests, suggested_hashtags, brand_opportunity_score, content_opportunity_type, is_recurring, recurrence_pattern, event_series, active) VALUES
-- Major Sports Events
('sports', 'FIFA World Cup 2026', 'World Cup 2026', 'The biggest tournament in football, hosted across USA, Canada, and Mexico', '2026-06-11', '2026-07-19', false, ARRAY['US', 'CA', 'MX'], ARRAY['north_america'], ARRAY['football', 'soccer', 'world_cup'], null, ARRAY['sports', 'football'], ARRAY['#WorldCup2026', '#FIFAWorldCup'], 95, ARRAY['reaction', 'attendance', 'prediction'], true, 'quadrennial', 'fifa_world_cup', true),
('sports', 'Super Bowl LX', 'Super Bowl 2026', 'The biggest game in American football', '2026-02-08', '2026-02-08', false, ARRAY['US'], ARRAY['north_america'], ARRAY['american_football', 'nfl'], null, ARRAY['sports', 'football', 'entertainment'], ARRAY['#SuperBowl', '#SuperBowl2026'], 100, ARRAY['reaction', 'prediction', 'commercials'], true, 'annual', 'super_bowl', true),
('sports', 'NBA Finals 2026', 'NBA Finals', 'Championship series of the National Basketball Association', '2026-06-01', '2026-06-15', false, ARRAY['US', 'CA'], ARRAY['north_america'], ARRAY['basketball', 'nba'], null, ARRAY['sports', 'basketball'], ARRAY['#NBAFinals', '#NBA'], 85, ARRAY['reaction', 'prediction'], true, 'annual', 'nba_finals', true),
('sports', 'Wimbledon 2026', 'Wimbledon', 'The oldest and most prestigious tennis tournament', '2026-06-29', '2026-07-12', false, ARRAY['GB'], ARRAY['europe'], ARRAY['tennis', 'grand_slam'], null, ARRAY['sports', 'tennis'], ARRAY['#Wimbledon', '#Tennis'], 80, ARRAY['reaction', 'attendance'], true, 'annual', 'wimbledon', true),
('sports', 'The Olympics 2028', 'LA Olympics 2028', 'Summer Olympics in Los Angeles', '2028-07-14', '2028-07-30', true, null, null, ARRAY['olympics', 'multi_sport'], null, ARRAY['sports', 'olympics'], ARRAY['#LA2028', '#Olympics'], 95, ARRAY['reaction', 'attendance', 'prediction'], true, 'quadrennial', 'olympics', true),

-- Major Music Events
('music', 'Coachella 2026', 'Coachella', 'One of the world''s largest music festivals', '2026-04-10', '2026-04-19', false, ARRAY['US'], ARRAY['north_america'], ARRAY['festival', 'music'], ARRAY['pop', 'electronic', 'hip_hop', 'indie'], ARRAY['music', 'festival', 'fashion'], ARRAY['#Coachella', '#Coachella2026'], 90, ARRAY['attendance', 'reaction', 'fashion'], true, 'annual', 'coachella', true),
('music', 'Lollapalooza 2026', 'Lollapalooza', 'Multi-city music festival', '2026-08-01', '2026-08-04', false, ARRAY['US'], ARRAY['north_america'], ARRAY['festival', 'music'], ARRAY['rock', 'pop', 'alternative'], ARRAY['music', 'festival'], ARRAY['#Lollapalooza'], 85, ARRAY['attendance', 'reaction'], true, 'annual', 'lollapalooza', true),
('music', 'Grammy Awards 2026', 'The Grammys', 'Music''s biggest night', '2026-02-08', '2026-02-08', false, ARRAY['US'], ARRAY['north_america'], ARRAY['awards', 'music'], null, ARRAY['music', 'entertainment', 'fashion'], ARRAY['#Grammys', '#GrammyAwards'], 90, ARRAY['reaction', 'fashion', 'prediction'], true, 'annual', 'grammy_awards', true),
('music', 'Glastonbury 2026', 'Glastonbury', 'Legendary UK music festival', '2026-06-24', '2026-06-28', false, ARRAY['GB'], ARRAY['europe'], ARRAY['festival', 'music'], ARRAY['rock', 'pop', 'electronic'], ARRAY['music', 'festival'], ARRAY['#Glastonbury'], 85, ARRAY['attendance', 'reaction'], true, 'annual', 'glastonbury', true),

-- Entertainment
('entertainment', 'Academy Awards 2026', 'The Oscars', 'The biggest night in film', '2026-03-01', '2026-03-01', false, ARRAY['US'], ARRAY['north_america'], ARRAY['awards', 'film'], null, ARRAY['film', 'entertainment', 'fashion'], ARRAY['#Oscars', '#AcademyAwards'], 90, ARRAY['reaction', 'fashion', 'prediction'], true, 'annual', 'oscars', true),
('entertainment', 'San Diego Comic-Con 2026', 'Comic-Con', 'The ultimate pop culture convention', '2026-07-23', '2026-07-26', false, ARRAY['US'], ARRAY['north_america'], ARRAY['convention', 'comics', 'movies'], ARRAY['comics', 'sci_fi', 'fantasy'], ARRAY['entertainment', 'gaming', 'cosplay'], ARRAY['#ComicCon', '#SDCC'], 80, ARRAY['attendance', 'cosplay', 'reaction'], true, 'annual', 'comic_con', true),
('entertainment', 'Cannes Film Festival 2026', 'Cannes', 'Prestigious international film festival', '2026-05-12', '2026-05-23', false, ARRAY['FR'], ARRAY['europe'], ARRAY['film', 'festival'], null, ARRAY['film', 'fashion', 'luxury'], ARRAY['#Cannes', '#Cannes2026'], 85, ARRAY['reaction', 'fashion'], true, 'annual', 'cannes', true),

-- Major Holidays
('holiday', 'Christmas 2026', 'Christmas', 'Christian and secular winter holiday', '2026-12-25', '2026-12-25', true, null, null, null, null, ARRAY['family', 'shopping', 'food'], ARRAY['#Christmas', '#MerryChristmas'], 100, ARRAY['shopping', 'reaction', 'family'], true, 'annual', 'christmas', true),
('holiday', 'New Year''s Eve 2026', 'NYE 2026', 'Year-end celebration', '2026-12-31', '2026-12-31', true, null, null, null, null, ARRAY['party', 'celebration'], ARRAY['#NYE', '#NewYearsEve'], 95, ARRAY['attendance', 'reaction'], true, 'annual', 'new_years', true),
('holiday', 'Thanksgiving 2026', 'Thanksgiving', 'American harvest celebration', '2026-11-26', '2026-11-26', false, ARRAY['US'], ARRAY['north_america'], null, null, ARRAY['family', 'food', 'travel'], ARRAY['#Thanksgiving'], 95, ARRAY['family', 'food', 'reaction'], true, 'annual', 'thanksgiving', true),
('holiday', 'Valentine''s Day 2027', 'Valentine''s Day', 'Day of romantic love', '2027-02-14', '2027-02-14', true, null, null, null, null, ARRAY['couples', 'dating', 'gifts'], ARRAY['#ValentinesDay', '#Valentines'], 90, ARRAY['couples', 'gifts', 'dining'], true, 'annual', 'valentines_day', true),
('holiday', 'Halloween 2026', 'Halloween', 'Spooky celebration', '2026-10-31', '2026-10-31', true, null, null, null, null, ARRAY['party', 'costumes', 'horror'], ARRAY['#Halloween'], 90, ARRAY['costumes', 'party', 'reaction'], true, 'annual', 'halloween', true),
('holiday', 'Diwali 2026', 'Diwali', 'Festival of Lights', '2026-11-08', '2026-11-12', false, ARRAY['IN', 'NP', 'LK', 'MY', 'SG'], ARRAY['asia_pacific'], null, null, ARRAY['family', 'celebration', 'food'], ARRAY['#Diwali', '#FestivalOfLights'], 85, ARRAY['family', 'reaction'], true, 'annual', 'diwali', true),
('holiday', 'Lunar New Year 2027', 'Lunar New Year', 'Chinese New Year / Spring Festival', '2027-02-06', '2027-02-13', false, ARRAY['CN', 'TW', 'HK', 'SG', 'MY', 'VN', 'KR'], ARRAY['asia_pacific'], null, null, ARRAY['family', 'celebration', 'food'], ARRAY['#LunarNewYear', '#ChineseNewYear'], 85, ARRAY['family', 'reaction'], true, 'annual', 'lunar_new_year', true),
('holiday', 'Ramadan/Eid 2026', 'Eid al-Fitr', 'End of Ramadan celebration', '2026-03-20', '2026-03-22', true, null, null, null, null, ARRAY['family', 'food', 'celebration'], ARRAY['#Eid', '#EidMubarak'], 80, ARRAY['family', 'food', 'reaction'], true, 'annual', 'eid', true),

-- Shopping Events
('shopping', 'Black Friday 2026', 'Black Friday', 'Biggest shopping day in US', '2026-11-27', '2026-11-27', false, ARRAY['US'], ARRAY['north_america'], null, null, ARRAY['shopping', 'deals'], ARRAY['#BlackFriday'], 100, ARRAY['shopping', 'deals'], true, 'annual', 'black_friday', true),
('shopping', 'Cyber Monday 2026', 'Cyber Monday', 'Online shopping extravaganza', '2026-11-30', '2026-11-30', true, null, null, null, null, ARRAY['shopping', 'deals', 'tech'], ARRAY['#CyberMonday'], 95, ARRAY['shopping', 'deals'], true, 'annual', 'cyber_monday', true),
('shopping', 'Amazon Prime Day 2026', 'Prime Day', 'Amazon''s annual sale event', '2026-07-14', '2026-07-15', false, ARRAY['US', 'CA', 'GB', 'DE', 'FR', 'JP'], ARRAY['north_america', 'europe', 'asia_pacific'], null, null, ARRAY['shopping', 'deals', 'tech'], ARRAY['#PrimeDay'], 90, ARRAY['shopping', 'deals'], true, 'annual', 'prime_day', true),
('shopping', 'Singles Day 2026', '11.11', 'World''s biggest shopping day (China)', '2026-11-11', '2026-11-11', false, ARRAY['CN'], ARRAY['asia_pacific'], null, null, ARRAY['shopping', 'deals'], ARRAY['#SinglesDay', '#Double11'], 90, ARRAY['shopping', 'deals'], true, 'annual', 'singles_day', true),

-- Cultural Events
('cultural', 'Pride Month 2026', 'Pride Month', 'LGBTQ+ celebration and advocacy', '2026-06-01', '2026-06-30', true, null, null, null, null, ARRAY['lgbtq', 'equality', 'celebration'], ARRAY['#Pride', '#PrideMonth'], 85, ARRAY['reaction', 'attendance'], true, 'annual', 'pride_month', true),
('cultural', 'Black History Month 2026', 'Black History Month', 'Celebration of Black history and culture', '2026-02-01', '2026-02-28', false, ARRAY['US', 'CA', 'GB'], ARRAY['north_america', 'europe'], null, null, ARRAY['history', 'culture', 'education'], ARRAY['#BlackHistoryMonth'], 80, ARRAY['reaction', 'education'], true, 'annual', 'black_history_month', true),
('cultural', 'Women''s History Month 2026', 'Women''s History', 'Celebrating women''s contributions', '2026-03-01', '2026-03-31', false, ARRAY['US', 'CA', 'GB'], ARRAY['north_america', 'europe'], null, null, ARRAY['women', 'history', 'equality'], ARRAY['#WomensHistoryMonth'], 75, ARRAY['reaction', 'education'], true, 'annual', 'womens_history_month', true),

-- Seasonal Markers
('seasonal', 'First Day of Summer 2026', 'Summer Begins', 'Summer solstice in Northern Hemisphere', '2026-06-21', '2026-06-21', true, null, null, null, null, ARRAY['summer', 'outdoor', 'travel'], ARRAY['#Summer', '#SummerVibes'], 70, ARRAY['outdoor', 'travel'], true, 'annual', 'summer_solstice', true),
('seasonal', 'First Day of Winter 2026', 'Winter Begins', 'Winter solstice in Northern Hemisphere', '2026-12-21', '2026-12-21', true, null, null, null, null, ARRAY['winter', 'cozy', 'holidays'], ARRAY['#Winter'], 70, ARRAY['indoor', 'cozy'], true, 'annual', 'winter_solstice', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. SEED SEASONAL CONFIG
-- =====================================================

INSERT INTO public.seasonal_config (hemisphere, season, start_month, start_day, end_month, end_day, themes, shopping_events, content_opportunities, outdoor_activity_weight, indoor_activity_weight, travel_season, year, active) VALUES
('northern', 'spring', 3, 20, 6, 20, ARRAY['spring_cleaning', 'easter', 'mothers_day', 'outdoor_fitness', 'graduation'], ARRAY['easter_sales', 'mothers_day_sales', 'spring_sales'], ARRAY['spring_fashion', 'outdoor_content', 'fitness_reset'], 70, 30, true, 2026, true),
('northern', 'summer', 6, 21, 9, 22, ARRAY['beach_vacation', 'outdoor_adventure', 'summer_concerts', 'bbq_season', 'festival_season'], ARRAY['memorial_day_sales', '4th_of_july_sales', 'back_to_school'], ARRAY['summer_vibes', 'travel_content', 'festival_fashion', 'outdoor_fitness'], 90, 10, true, 2026, true),
('northern', 'fall', 9, 23, 12, 20, ARRAY['back_to_school', 'halloween_prep', 'thanksgiving', 'cozy_season', 'fall_fashion'], ARRAY['labor_day_sales', 'black_friday', 'cyber_monday'], ARRAY['fall_aesthetic', 'halloween_content', 'thanksgiving_family'], 50, 50, false, 2026, true),
('northern', 'winter', 12, 21, 3, 19, ARRAY['holiday_season', 'winter_sports', 'new_year_new_me', 'cozy_indoor', 'valentines'], ARRAY['boxing_day_sales', 'new_year_sales', 'valentines_sales'], ARRAY['winter_wonderland', 'holiday_content', 'new_year_goals', 'indoor_activities'], 20, 80, true, 2026, true),
('southern', 'spring', 9, 1, 11, 30, ARRAY['spring_racing', 'outdoor_events', 'graduation'], ARRAY['spring_sales'], ARRAY['spring_fashion'], 70, 30, true, 2026, true),
('southern', 'summer', 12, 1, 2, 28, ARRAY['beach_season', 'christmas_bbq', 'summer_break'], ARRAY['boxing_day_sales'], ARRAY['summer_vibes'], 90, 10, true, 2026, true),
('southern', 'fall', 3, 1, 5, 31, ARRAY['autumn_colors', 'anzac_day'], ARRAY['easter_sales'], ARRAY['fall_aesthetic'], 60, 40, false, 2026, true),
('southern', 'winter', 6, 1, 8, 31, ARRAY['ski_season', 'rugby_season', 'cozy_indoor'], ARRAY['EOFY_sales'], ARRAY['winter_sports'], 40, 60, true, 2026, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 12. ENABLE RLS
-- =====================================================

ALTER TABLE public.user_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_context_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can only see their own demographics
CREATE POLICY "Users can view own demographics" ON public.user_demographics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own demographics" ON public.user_demographics
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own calendar
CREATE POLICY "Users can view own calendar" ON public.user_calendar
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calendar" ON public.user_calendar
  FOR ALL USING (auth.uid() = user_id);

-- Global events are readable by everyone
CREATE POLICY "Global events are public" ON public.global_events
  FOR SELECT USING (true);

-- Only admins can manage global events
CREATE POLICY "Only admins can manage global events" ON public.global_events
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_event_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions" ON public.user_event_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Seasonal config readable by everyone
CREATE POLICY "Seasonal config is public" ON public.seasonal_config
  FOR SELECT USING (true);

-- Context snapshots - users only see own
CREATE POLICY "Users can view own context" ON public.user_context_snapshots
  FOR SELECT USING (auth.uid() = user_id);

-- Profiling questions readable by everyone
CREATE POLICY "Profiling questions are public" ON public.profiling_questions
  FOR SELECT USING (true);

-- =====================================================
-- 13. VIEWS FOR EASY QUERYING
-- =====================================================

-- View: Upcoming birthdays for notifications
CREATE OR REPLACE VIEW public.upcoming_birthdays AS
SELECT 
  uc.*,
  u.display_name,
  u.email,
  CASE 
    WHEN uc.event_date >= CURRENT_DATE THEN 
      EXTRACT(YEAR FROM AGE(uc.event_date + (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM uc.event_date)) * INTERVAL '1 year', CURRENT_DATE))
    ELSE 
      EXTRACT(YEAR FROM AGE(uc.event_date + (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM uc.event_date) + 1) * INTERVAL '1 year', CURRENT_DATE))
  END as days_until
FROM public.user_calendar uc
JOIN public.users u ON uc.user_id = u.id
WHERE uc.event_type IN ('my_birthday', 'partner_birthday', 'child_birthday')
  AND uc.is_recurring = true
  AND uc.event_date IS NOT NULL;

-- View: Active global events
CREATE OR REPLACE VIEW public.active_global_events AS
SELECT *
FROM public.global_events
WHERE status IN ('upcoming', 'active')
  AND start_date <= CURRENT_DATE + INTERVAL '90 days'
  AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  AND active = true
ORDER BY start_date;

-- View: User profile completion status
CREATE OR REPLACE VIEW public.user_profile_completion AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.email,
  COALESCE(ud.profile_completion_score, 0) as completion_score,
  ud.birthday IS NOT NULL as has_birthday,
  ud.gender IS NOT NULL as has_gender,
  ud.marital_status IS NOT NULL as has_marital_status,
  ud.has_children IS NOT NULL as has_children_info,
  ud.fitness_level IS NOT NULL as has_fitness_info,
  ud.content_niches IS NOT NULL AND array_length(ud.content_niches, 1) > 0 as has_content_niches,
  (SELECT COUNT(*) FROM public.user_calendar WHERE user_id = u.id) as calendar_events_count
FROM public.users u
LEFT JOIN public.user_demographics ud ON u.id = ud.user_id;

COMMENT ON VIEW public.user_profile_completion IS 'Shows how complete each user profile is for targeting';
