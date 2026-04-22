-- =====================================================
-- ONBOARDING NUDGE SYSTEM
-- Automated email reminders for incomplete onboarding
-- =====================================================

-- Table to track onboarding nudges sent
CREATE TABLE IF NOT EXISTS public.onboarding_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('profile_incomplete', 'no_moments_joined', 'no_checkin', 'no_following', 'abandoned')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_onboarding_nudges_user ON public.onboarding_nudges(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_nudges_type ON public.onboarding_nudges(nudge_type, sent_at);

-- Enable RLS
ALTER TABLE public.onboarding_nudges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own nudges
CREATE POLICY "Users can view own nudges" ON public.onboarding_nudges
  FOR SELECT USING (user_id = auth.uid());

-- Policy: System can insert nudges
CREATE POLICY "System can insert nudges" ON public.onboarding_nudges
  FOR INSERT WITH CHECK (true);

-- Function to check if user needs onboarding nudge
CREATE OR REPLACE FUNCTION public.fn_get_users_needing_nudge(nudge_type TEXT, hours_since_signup INTEGER)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  hours_since_created NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(u.display_name, u.username, 'there')::TEXT as display_name,
    EXTRACT(EPOCH FROM (now() - u.created_at)) / 3600 as hours_since_created
  FROM public.users u
  WHERE u.email IS NOT NULL
    -- Check if user was created within the target window
    AND u.created_at BETWEEN now() - INTERVAL '1 hour' * (hours_since_signup + 1)
                         AND now() - INTERVAL '1 hour' * hours_since_signup
    -- Check if nudge was already sent
    AND NOT EXISTS (
      SELECT 1 FROM public.onboarding_nudges n
      WHERE n.user_id = u.id 
        AND n.nudge_type = $1
        AND n.sent_at > now() - INTERVAL '24 hours'
    )
    -- Check specific condition based on nudge type
    AND CASE $1
      WHEN 'profile_incomplete' THEN
        -- Profile incomplete: no display_name or no avatar
        (u.display_name IS NULL OR u.avatar_url IS NULL)
      WHEN 'no_moments_joined' THEN
        -- No moments joined
        NOT EXISTS (
          SELECT 1 FROM public.moment_participants mp
          WHERE mp.user_id = u.id
        )
      WHEN 'no_checkin' THEN
        -- Joined moments but never checked in
        EXISTS (
          SELECT 1 FROM public.moment_participants mp
          WHERE mp.user_id = u.id AND mp.status != 'checked_in'
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.moment_participants mp
          WHERE mp.user_id = u.id AND mp.status = 'checked_in'
        )
      WHEN 'no_following' THEN
        -- Not following anyone
        NOT EXISTS (
          SELECT 1 FROM public.user_follows uf
          WHERE uf.follower_id = u.id
        )
      WHEN 'abandoned' THEN
        -- No activity in 7 days
        NOT EXISTS (
          SELECT 1 FROM public.moment_participants mp
          WHERE mp.user_id = u.id
            AND mp.created_at > now() - INTERVAL '7 days'
        )
      ELSE TRUE
    END
  ORDER BY u.created_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to record nudge sent
CREATE OR REPLACE FUNCTION public.fn_record_nudge_sent(p_user_id UUID, p_nudge_type TEXT)
RETURNS UUID AS $$
DECLARE
  nudge_id UUID;
BEGIN
  INSERT INTO public.onboarding_nudges (user_id, nudge_type)
  VALUES (p_user_id, p_nudge_type)
  RETURNING id INTO nudge_id;
  
  RETURN nudge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark nudge as opened/clicked (for tracking)
CREATE OR REPLACE FUNCTION public.fn_track_nudge_interaction(
  p_nudge_id UUID,
  p_action TEXT -- 'opened' or 'clicked'
)
RETURNS VOID AS $$
BEGIN
  IF p_action = 'opened' THEN
    UPDATE public.onboarding_nudges
    SET opened_at = COALESCE(opened_at, now())
    WHERE id = p_nudge_id;
  ELSIF p_action = 'clicked' THEN
    UPDATE public.onboarding_nudges
    SET clicked_at = COALESCE(clicked_at, now())
    WHERE id = p_nudge_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for nudge analytics
CREATE OR REPLACE VIEW public.onboarding_nudge_stats AS
SELECT 
  nudge_type,
  COUNT(*) as total_sent,
  COUNT(opened_at) as opened_count,
  COUNT(clicked_at) as clicked_count,
  ROUND(COUNT(opened_at) * 100.0 / NULLIF(COUNT(*), 0), 2) as open_rate,
  ROUND(COUNT(clicked_at) * 100.0 / NULLIF(COUNT(*), 0), 2) as click_rate
FROM public.onboarding_nudges
WHERE sent_at > now() - INTERVAL '30 days'
GROUP BY nudge_type;

-- Comments
COMMENT ON TABLE public.onboarding_nudges IS 'Tracks onboarding reminder emails sent to users';
COMMENT ON FUNCTION public.fn_get_users_needing_nudge IS 'Returns users who need a specific onboarding nudge based on type and hours since signup';
COMMENT ON FUNCTION public.fn_record_nudge_sent IS 'Records that a nudge was sent to a user';
COMMENT ON FUNCTION public.fn_track_nudge_interaction IS 'Tracks when user opens or clicks a nudge email';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_get_users_needing_nudge TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_record_nudge_sent TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_track_nudge_interaction TO authenticated;
GRANT SELECT ON public.onboarding_nudge_stats TO authenticated;
