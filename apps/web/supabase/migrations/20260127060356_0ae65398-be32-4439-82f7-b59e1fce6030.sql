-- Allow users to delete (leave) their own participation
CREATE POLICY "Users can leave moments"
ON public.moment_participants
FOR DELETE
USING (auth.uid() = user_id);