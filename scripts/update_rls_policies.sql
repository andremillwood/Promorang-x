-- Update RLS policies to use public.get_user_id() instead of auth.uid()

-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS users_select_self ON public.users;
DROP POLICY IF EXISTS users_update_self ON public.users;
DROP POLICY IF EXISTS users_insert_service_only ON public.users;

-- Recreate policies with public.get_user_id()

-- Allow users to read their own profile
CREATE POLICY users_select_self ON public.users
FOR SELECT
USING (public.get_user_id() = id);

-- Allow users to update their own profile
CREATE POLICY users_update_self ON public.users
FOR UPDATE
USING (public.get_user_id() = id)
WITH CHECK (public.get_user_id() = id);

-- Restrict inserts to service role only (if needed)
CREATE POLICY users_insert_service_only ON public.users
FOR INSERT
TO service_role
WITH CHECK (true);

-- Update any other tables with RLS policies
-- Example for profiles table (uncomment and modify as needed):
/*
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
CREATE POLICY profiles_select_self ON public.profiles
FOR SELECT
USING (public.get_user_id() = user_id);

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles
FOR UPDATE
USING (public.get_user_id() = user_id)
WITH CHECK (public.get_user_id() = user_id);
*/
