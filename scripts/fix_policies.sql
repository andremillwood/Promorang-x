-- First, drop existing policies if they exist
DO $$
BEGIN
    -- Drop update policy if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
        AND policyname = 'Users can update own profile'
    ) THEN
        DROP POLICY "Users can update own profile" ON public.profiles;
        RAISE NOTICE 'Dropped policy: Users can update own profile';
    END IF;

    -- Drop select policy if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
        AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
        RAISE NOTICE 'Dropped policy: Public profiles are viewable by everyone';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error dropping policies: %', SQLERRM;
END $$;

-- Now create the policies with error handling
DO $$
BEGIN
    -- Create select policy
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
        AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone" 
        ON public.profiles 
        FOR SELECT 
        USING (true);
        RAISE NOTICE 'Created policy: Public profiles are viewable by everyone';
    END IF;

    -- Create update policy
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
        ON public.profiles 
        FOR UPDATE
        USING (auth.uid() = id);
        RAISE NOTICE 'Created policy: Users can update own profile';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating policies: %', SQLERRM;
END $$;

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check 
FROM 
    pg_policies 
WHERE 
    tablename = 'profiles' 
    AND schemaname = 'public';
