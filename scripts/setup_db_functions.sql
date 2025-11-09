-- Create or replace the get_jwt_claims function in the public schema
CREATE OR REPLACE FUNCTION public.get_jwt_claims() 
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT 
    coalesce(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb,
      '{}'::jsonb
    )
$$;

-- Create or replace the get_user_id function
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT 
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (public.get_jwt_claims() ->> 'sub')
    )::uuid
$$;

-- Grant execute permissions to the necessary roles
GRANT EXECUTE ON FUNCTION public.get_jwt_claims() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_id() TO anon, authenticated, service_role;
