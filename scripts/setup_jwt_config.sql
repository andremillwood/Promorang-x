-- 1. Create a function to set JWT configuration
CREATE OR REPLACE FUNCTION public.setup_jwt_config()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Set JWT secret (replace 'your-super-secret-jwt-token' with a secure secret)
    -- This should match the JWT_SECRET in your Supabase dashboard
    EXECUTE format('ALTER SYSTEM SET jwt_secret = %L', 
        'your-super-secret-jwt-token-with-at-least-32-characters');
    
    -- Set JWT issuer
    EXECUTE format('ALTER SYSTEM SET jwt_issuer = %L', 
        'supabase');
        
    -- Set JWT expiration (optional)
    EXECUTE format('ALTER SYSTEM SET jwt_exp = %L', 
        '3600');  -- 1 hour expiration
    
    -- Reload configuration
    PERFORM pg_reload_conf();
    
    RAISE NOTICE 'JWT configuration updated. Please restart your Supabase instance for changes to take effect.';
EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error setting up JWT config: %', SQLERRM;
END;
$$;

-- 2. Execute the function
-- SELECT public.setup_jwt_config();

-- 3. Verify the configuration (run after restarting Supabase)
-- SHOW jwt_secret;
-- SHOW jwt_issuer;
-- SHOW jwt_exp;
