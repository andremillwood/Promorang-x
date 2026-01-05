-- 1. Create a function to get user ID from JWT claims
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
$$;

-- 2. Grant execute permissions to the necessary roles
GRANT EXECUTE ON FUNCTION public.get_user_id() TO anon, authenticated, service_role;

-- 3. Set up RLS policies for public.profiles
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (public.get_user_id() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (public.get_user_id() = id) 
WITH CHECK (public.get_user_id() = id);

-- 4. Ensure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
