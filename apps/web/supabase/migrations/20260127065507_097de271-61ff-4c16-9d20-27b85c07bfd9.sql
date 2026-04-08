-- Create admin-specific RLS policies for viewing all users
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all moments (including drafts and private)
CREATE POLICY "Admins can view all moments"
  ON public.moments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any moment (for approval/moderation)
CREATE POLICY "Admins can update any moment"
  ON public.moments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all user roles
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage user roles (add/remove roles)
CREATE POLICY "Admins can insert user roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all participants
CREATE POLICY "Admins can view all participants"
  ON public.moment_participants FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all check-ins
CREATE POLICY "Admins can view all check-ins"
  ON public.check_ins FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all rewards
CREATE POLICY "Admins can view all rewards"
  ON public.rewards FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all campaigns
CREATE POLICY "Admins can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all venues
CREATE POLICY "Admins can view all venues"
  ON public.venues FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));