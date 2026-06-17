-- =====================================================
-- FEED GENERATION FUNCTION
-- Personalized activity feed for users based on follows
-- =====================================================

-- Create the personalized feed function
DROP FUNCTION IF EXISTS public.fn_get_personalized_feed(UUID, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION public.fn_get_personalized_feed(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    activity_type TEXT,
    user_id UUID,
    user_name TEXT,
    user_avatar TEXT,
    source_id UUID,
    source_table TEXT,
    title TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ,
    likes_count INTEGER,
    comments_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    -- Get activity from followed users
    SELECT 
        af.id,
        af.activity_type,
        af.user_id,
        COALESCE(u.display_name, u.username, 'Unknown')::TEXT as user_name,
        u.avatar_url as user_avatar,
        af.source_id,
        af.source_table,
        af.title,
        af.description,
        af.image_url,
        af.created_at,
        COALESCE(af.likes_count, 0)::INTEGER as likes_count,
        COALESCE(af.comments_count, 0)::INTEGER as comments_count
    FROM public.activity_feed af
    INNER JOIN public.user_follows uf ON af.user_id = uf.following_id
    INNER JOIN public.users u ON af.user_id = u.id
    WHERE uf.follower_id = p_user_id
        AND af.visibility = 'public'
        AND af.is_pinned = false
    
    UNION ALL
    
    -- Include user's own activity
    SELECT 
        af.id,
        af.activity_type,
        af.user_id,
        COALESCE(u.display_name, u.username, 'You')::TEXT as user_name,
        u.avatar_url as user_avatar,
        af.source_id,
        af.source_table,
        af.title,
        af.description,
        af.image_url,
        af.created_at,
        COALESCE(af.likes_count, 0)::INTEGER as likes_count,
        COALESCE(af.comments_count, 0)::INTEGER as comments_count
    FROM public.activity_feed af
    INNER JOIN public.users u ON af.user_id = u.id
    WHERE af.user_id = p_user_id
        AND af.visibility IN ('public', 'followers')
        AND af.is_pinned = false
    
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get pinned activities
DROP FUNCTION IF EXISTS public.fn_get_pinned_activities(UUID);
CREATE OR REPLACE FUNCTION public.fn_get_pinned_activities(
    p_user_id UUID
)
RETURNS TABLE (
    id UUID,
    activity_type TEXT,
    user_id UUID,
    user_name TEXT,
    user_avatar TEXT,
    source_id UUID,
    source_table TEXT,
    title TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ,
    likes_count INTEGER,
    comments_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        af.id,
        af.activity_type,
        af.user_id,
        COALESCE(u.display_name, u.username, 'Unknown')::TEXT as user_name,
        u.avatar_url as user_avatar,
        af.source_id,
        af.source_table,
        af.title,
        af.description,
        af.image_url,
        af.created_at,
        COALESCE(af.likes_count, 0)::INTEGER as likes_count,
        COALESCE(af.comments_count, 0)::INTEGER as comments_count
    FROM public.activity_feed af
    INNER JOIN public.user_follows uf ON af.user_id = uf.following_id
    INNER JOIN public.users u ON af.user_id = u.id
    WHERE uf.follower_id = p_user_id
        AND af.is_pinned = true
        AND af.visibility = 'public'
    ORDER BY af.created_at DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to create activity feed entry when moment is created
DROP FUNCTION IF EXISTS public.trg_moment_to_activity_feed();
CREATE OR REPLACE FUNCTION public.trg_moment_to_activity_feed()
RETURNS TRIGGER AS $$
DECLARE
    host_name TEXT;
BEGIN
    -- Get host name
    host_name := (
        SELECT COALESCE(display_name, username, 'Someone')
        FROM public.users
        WHERE id = NEW.host_id
        LIMIT 1
    );
    
    -- Create activity feed entry
    INSERT INTO public.activity_feed (
        user_id,
        activity_type,
        source_id,
        source_table,
        title,
        description,
        image_url,
        visibility
    ) VALUES (
        NEW.host_id,
        'post',
        NEW.id,
        'moments',
        host_name || ' created a new moment',
        NEW.title || ' at ' || COALESCE(NEW.location, 'an unknown location'),
        NEW.image_url,
        'public'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on moments table (commented out until ready)
-- DROP TRIGGER IF EXISTS trg_moment_activity_feed ON public.moments;
-- CREATE TRIGGER trg_moment_activity_feed
--     AFTER INSERT ON public.moments
--     FOR EACH ROW
--     EXECUTE FUNCTION public.trg_moment_to_activity_feed();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.fn_get_personalized_feed(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_pinned_activities(UUID) TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.fn_get_personalized_feed IS 
'Returns personalized activity feed for a user based on their follows. Includes both followed users activity and own activity.';

COMMENT ON FUNCTION public.fn_get_pinned_activities IS 
'Returns pinned activities from followed users for highlight display.';
