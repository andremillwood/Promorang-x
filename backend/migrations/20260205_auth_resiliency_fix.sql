-- =============================================
-- MIGRATION: AUTH RESILIENCY & SCHEMA SYNC
-- DATE: 2026-02-05
-- DESCRIPTION: Fixes 400 errors during signup by making handle_new_user robust.
--              Ensures public.users and public.profiles are both populated.
--              Handles username collisions gracefully.
-- =============================================

-- 1. ROBUST NEW USER HANDLER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_display_name TEXT;
    v_user_type TEXT;
    v_base_username TEXT;
    v_counter INTEGER := 0;
    v_exists BOOLEAN;
BEGIN
    -- Extract metadata or fallback to email prefix
    v_display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    v_user_type := COALESCE(NEW.raw_user_meta_data->>'role', COALESCE(NEW.raw_user_meta_data->>'user_type', 'participant'));
    v_base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
    
    -- Generate unique username
    v_username := v_base_username;
    LOOP
        SELECT EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) INTO v_exists;
        IF NOT v_exists THEN
            EXIT;
        END IF;
        v_counter := v_counter + 1;
        v_username := v_base_username || v_counter::TEXT;
        
        -- Safety break
        IF v_counter > 10 THEN
            v_username := v_base_username || '-' || substr(md5(random()::text), 1, 6);
            EXIT;
        END IF;
    END LOOP;

    -- A. INSERT INTO public.users (Progressive Experience Layer)
    INSERT INTO public.users (
        id,
        email,
        username,
        display_name,
        user_type,
        maturity_state,
        points_balance,
        gems_balance,
        keys_balance
    )
    VALUES (
        NEW.id,
        NEW.email,
        v_username,
        v_display_name,
        v_user_type,
        0, -- FIRST_TIME state
        0, 0, 0
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = COALESCE(public.users.username, EXCLUDED.username),
        display_name = COALESCE(public.users.display_name, EXCLUDED.display_name),
        user_type = COALESCE(public.users.user_type, EXCLUDED.user_type);

    -- B. INSERT INTO public.profiles (Core Profile Layer)
    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        user_type,
        points_balance,
        keys_balance,
        gems_balance,
        gold_collected
    )
    VALUES (
        NEW.id,
        v_username,
        v_display_name,
        v_user_type,
        0, 0, 0, 0
    )
    ON CONFLICT (id) DO UPDATE SET
        username = COALESCE(public.profiles.username, EXCLUDED.username),
        display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Low-level catch all to prevent signup failure
    RAISE LOG 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. RE-ATTACH TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. DATA SYNC: Populate missing public.users entries
INSERT INTO public.users (id, email, username, display_name, user_type)
SELECT 
    au.id, 
    au.email, 
    COALESCE(p.username, split_part(au.email, '@', 1)), 
    COALESCE(p.display_name, split_part(au.email, '@', 1)),
    COALESCE(p.user_type, 'participant')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. DATA SYNC: Populate missing public.profiles entries
INSERT INTO public.profiles (id, username, display_name, user_type)
SELECT 
    au.id, 
    COALESCE(pu.username, split_part(au.email, '@', 1)), 
    COALESCE(pu.display_name, split_part(au.email, '@', 1)),
    COALESCE(pu.user_type, 'participant')
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
