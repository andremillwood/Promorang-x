-- Social Features Migration for Our Moments
-- Version: 1.0
-- Date: 2026-02-02

-- ============================================
-- 1. FOLLOWS / SOCIAL GRAPH
-- ============================================

-- User follows (Pinterest-style save / Airbnb wishlist concept)
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- Saved moments (collections/boards like Pinterest)
CREATE TABLE IF NOT EXISTS public.saved_moments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  collection_name TEXT NOT NULL DEFAULT 'Saved',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, moment_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_moments_user ON public.saved_moments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_moments_collection ON public.saved_moments(user_id, collection_name);

-- ============================================
-- 2. ACTIVITY FEED
-- ============================================

CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- who did the action
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,    -- who it affects (nullable for public events)
  event_type TEXT NOT NULL,                                            -- 'follow', 'join', 'comment', 'reaction', 'reward', 'check_in'
  entity_type TEXT,                                                    -- 'moment', 'user', 'comment', 'reward'
  entity_id UUID,                                                      -- ID of the related entity
  metadata JSONB NOT NULL DEFAULT '{}',                                -- flexible extra data
  read_at TIMESTAMPTZ,                                                 -- when user saw it
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for feed queries
CREATE INDEX IF NOT EXISTS idx_activity_target ON public.activity_events(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON public.activity_events(event_type);

-- ============================================
-- 3. COMMENTS (Threaded)
-- ============================================

CREATE TABLE IF NOT EXISTS public.moment_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.moment_comments(id) ON DELETE CASCADE,  -- for replies
  content TEXT NOT NULL,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_moment ON public.moment_comments(moment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.moment_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.moment_comments(parent_id);

-- ============================================
-- 4. REACTIONS (Emoji-based)
-- ============================================

CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,      -- 'moment', 'comment'
  entity_id UUID NOT NULL,        -- ID of moment or comment
  reaction_type TEXT NOT NULL,    -- '❤️', '🔥', '👏', '✨'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_entity ON public.reactions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.reactions(user_id);

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Follows: Users can see all follows, but only manage their own
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Saved moments: Private to user
CREATE POLICY "Users can view own saved" ON public.saved_moments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save moments" ON public.saved_moments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update saved" ON public.saved_moments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can unsave" ON public.saved_moments FOR DELETE USING (auth.uid() = user_id);

-- Activity: Users see events targeted to them or public events
CREATE POLICY "Users see their activity" ON public.activity_events FOR SELECT USING (auth.uid() = target_user_id OR target_user_id IS NULL);
CREATE POLICY "System can insert activity" ON public.activity_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can mark read" ON public.activity_events FOR UPDATE USING (auth.uid() = target_user_id);

-- Comments: Public read, authenticated write, author can edit/delete
CREATE POLICY "Anyone can read comments" ON public.moment_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated can comment" ON public.moment_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update" ON public.moment_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete" ON public.moment_comments FOR DELETE USING (auth.uid() = user_id);

-- Reactions: Public read, authenticated write, user can remove own
CREATE POLICY "Anyone can view reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated can react" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unreact" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.follows WHERE following_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Get following count
CREATE OR REPLACE FUNCTION get_following_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.follows WHERE follower_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Get reaction counts for an entity
CREATE OR REPLACE FUNCTION get_reaction_counts(p_entity_type TEXT, p_entity_id UUID)
RETURNS JSONB AS $$
  SELECT COALESCE(
    jsonb_object_agg(reaction_type, count),
    '{}'::JSONB
  )
  FROM (
    SELECT reaction_type, COUNT(*) as count
    FROM public.reactions
    WHERE entity_type = p_entity_type AND entity_id = p_entity_id
    GROUP BY reaction_type
  ) counts;
$$ LANGUAGE SQL STABLE;
