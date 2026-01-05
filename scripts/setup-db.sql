-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  user_type TEXT NOT NULL DEFAULT 'user',
  points_balance INTEGER NOT NULL DEFAULT 0,
  keys_balance INTEGER NOT NULL DEFAULT 0,
  gems_balance INTEGER NOT NULL DEFAULT 0,
  gold_collected INTEGER NOT NULL DEFAULT 0,
  user_tier TEXT NOT NULL DEFAULT 'basic',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    user_type
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update demo users with correct metadata
-- Creator
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'username', 'demo_creator',
    'full_name', 'Demo Creator',
    'user_type', 'creator'
  )
WHERE email = 'creator@promorang.com';

-- Investor
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'username', 'demo_investor',
    'full_name', 'Demo Investor',
    'user_type', 'investor'
  )
WHERE email = 'investor@promorang.com';

-- Advertiser
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'username', 'demo_advertiser',
    'full_name', 'Demo Advertiser',
    'user_type', 'advertiser'
  )
WHERE email = 'advertiser@promorang.com';

-- Update profiles with initial balances
UPDATE public.profiles p
SET 
  points_balance = CASE 
    WHEN u.email = 'creator@promorang.com' THEN 1000
    WHEN u.email = 'investor@promorang.com' THEN 5000
    WHEN u.email = 'advertiser@promorang.com' THEN 2000
    ELSE 0
  END,
  keys_balance = CASE 
    WHEN u.email = 'creator@promorang.com' THEN 10
    WHEN u.email = 'investor@promorang.com' THEN 50
    WHEN u.email = 'advertiser@promorang.com' THEN 20
    ELSE 0
  END,
  gems_balance = CASE 
    WHEN u.email = 'creator@promorang.com' THEN 100
    WHEN u.email = 'investor@promorang.com' THEN 200
    WHEN u.email = 'advertiser@promorang.com' THEN 150
    ELSE 0
  END,
  gold_collected = CASE 
    WHEN u.email = 'creator@promorang.com' THEN 500
    WHEN u.email = 'investor@promorang.com' THEN 1000
    WHEN u.email = 'advertiser@promorang.com' THEN 750
    ELSE 0
  END,
  user_tier = CASE 
    WHEN u.email = 'creator@promorang.com' THEN 'pro'
    WHEN u.email = 'investor@promorang.com' THEN 'premium'
    WHEN u.email = 'advertiser@promorang.com' THEN 'business'
    ELSE 'basic'
  END,
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
AND u.email IN (
  'creator@promorang.com',
  'investor@promorang.com',
  'advertiser@promorang.com'
);

-- Create a function to get user by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  display_name TEXT,
  user_type TEXT,
  points_balance INTEGER,
  keys_balance INTEGER,
  gems_balance INTEGER,
  gold_collected INTEGER,
  user_tier TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    u.email::TEXT,
    p.username,
    p.display_name,
    p.user_type,
    p.points_balance,
    p.keys_balance,
    p.gems_balance,
    p.gold_collected,
    p.user_tier,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM 
    public.profiles p
    JOIN auth.users u ON p.id = u.id
  WHERE 
    u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
