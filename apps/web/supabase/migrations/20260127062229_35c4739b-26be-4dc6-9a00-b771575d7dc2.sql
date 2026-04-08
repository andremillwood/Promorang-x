-- Add check_in_code to moments table for QR code verification
ALTER TABLE public.moments ADD COLUMN IF NOT EXISTS check_in_code TEXT UNIQUE;

-- Create rewards table to track earned rewards
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  reward_type TEXT NOT NULL,
  reward_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'earned',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  redemption_code TEXT UNIQUE
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Rewards RLS policies
CREATE POLICY "Users can view their own rewards"
ON public.rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
ON public.rewards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards for users"
ON public.rewards FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Function to generate check-in code for moments
CREATE OR REPLACE FUNCTION public.generate_check_in_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_code IS NULL THEN
    NEW.check_in_code := upper(substring(md5(random()::text || NEW.id::text) from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate check-in codes
CREATE TRIGGER set_check_in_code
BEFORE INSERT ON public.moments
FOR EACH ROW
EXECUTE FUNCTION public.generate_check_in_code();

-- Update existing moments with check-in codes
UPDATE public.moments 
SET check_in_code = upper(substring(md5(random()::text || id::text) from 1 for 8))
WHERE check_in_code IS NULL;