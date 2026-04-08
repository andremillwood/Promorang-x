-- Fix overly permissive notifications INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Only allow authenticated users to receive notifications created for them
CREATE POLICY "Authenticated users can receive notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);