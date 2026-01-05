-- 1. First, ensure the public.get_user_id() function exists
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT 
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    )::uuid
$$;

-- 2. Update RLS policies to use public.get_user_id()
DO $$
BEGIN
    -- Drop existing policies if they exist
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;';
    
    -- Recreate policies with correct function
    EXECUTE 'CREATE POLICY "Users can view their own profile" 
             ON public.profiles 
             FOR SELECT 
             USING (public.get_user_id() = id);';
    
    EXECUTE 'CREATE POLICY "Users can update own profile" 
             ON public.profiles 
             FOR UPDATE 
             USING (public.get_user_id() = id) 
             WITH CHECK (public.get_user_id() = id);';
    
    -- Grant necessary permissions
    EXECUTE 'GRANT SELECT, UPDATE ON public.profiles TO authenticated;';
    EXECUTE 'GRANT USAGE ON SCHEMA public TO authenticated;';
    
    -- Ensure the service_role can bypass RLS if needed
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;';
    
    -- Log the changes
    RAISE NOTICE 'Updated RLS policies and permissions for public.profiles';
EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error updating RLS policies: %', SQLERRM;
END $$;
