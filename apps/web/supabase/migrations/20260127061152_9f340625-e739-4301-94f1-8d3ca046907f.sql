-- Create storage buckets for moments and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('moment-images', 'moment-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for moment images
CREATE POLICY "Anyone can view moment images"
ON storage.objects FOR SELECT
USING (bucket_id = 'moment-images');

CREATE POLICY "Authenticated users can upload moment images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'moment-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own moment images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'moment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own moment images"
ON storage.objects FOR DELETE
USING (bucket_id = 'moment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create venues table for merchants
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  phone TEXT,
  website TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaigns table for brands
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10, 2),
  reward_type TEXT NOT NULL DEFAULT 'discount',
  reward_value TEXT,
  target_categories TEXT[],
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  impressions INTEGER NOT NULL DEFAULT 0,
  redemptions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create check_ins table for tracking moment attendance
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  check_in_code TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_verified BOOLEAN NOT NULL DEFAULT false,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(moment_id, user_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Venues RLS policies
CREATE POLICY "Anyone can view active venues"
ON public.venues FOR SELECT
USING (is_active = true);

CREATE POLICY "Owners can view their own venues"
ON public.venues FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Merchants can create venues"
ON public.venues FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their venues"
ON public.venues FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their venues"
ON public.venues FOR DELETE
USING (auth.uid() = owner_id);

-- Campaigns RLS policies
CREATE POLICY "Anyone can view active campaigns"
ON public.campaigns FOR SELECT
USING (is_active = true);

CREATE POLICY "Brands can view their own campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() = brand_id);

CREATE POLICY "Brands can create campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() = brand_id);

CREATE POLICY "Brands can delete their campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() = brand_id);

-- Check-ins RLS policies
CREATE POLICY "Users can view their own check-ins"
ON public.check_ins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Moment hosts can view check-ins for their moments"
ON public.check_ins FOR SELECT
USING (EXISTS (
  SELECT 1 FROM moments WHERE moments.id = check_ins.moment_id AND moments.host_id = auth.uid()
));

CREATE POLICY "Users can create their own check-ins"
ON public.check_ins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
ON public.check_ins FOR UPDATE
USING (auth.uid() = user_id);

-- Notifications RLS policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;