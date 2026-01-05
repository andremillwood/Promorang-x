-- 1. Check if the auth schema exists and is accessible
SELECT nspname 
FROM pg_namespace 
WHERE nspname = 'auth';

-- 2. Check if auth.users table exists
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' AND table_name = 'users';

-- 3. Check if the public.get_user_id function exists
SELECT proname, pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'get_user_id' AND pronamespace = 'public'::regnamespace;

-- 4. Check RLS status on auth.users
SELECT relname, relrowsecurity, relforcerowsecurity 
FROM pg_class 
WHERE relname = 'users' AND relnamespace = 'auth'::regnamespace;

-- 5. Check if the service_role has necessary permissions
SELECT 
    rolname, 
    rolcanlogin, 
    rolsuper, 
    rolinherit, 
    rolcreaterole, 
    rolcreatedb, 
    rolbypassrls
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'service_role');

-- 6. Check if the JWT secret is set
SHOW jwt_secret;
