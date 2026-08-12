CREATE TABLE IF NOT EXISTS public.guest_moment_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL, mobile TEXT NOT NULL, email TEXT, guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count BETWEEN 1 AND 12),
  group_name TEXT, meeting_point TEXT, status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','refunded','checked_in')),
  invite_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE, pass_code TEXT NOT NULL UNIQUE,
  manage_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  consent_whatsapp BOOLEAN NOT NULL DEFAULT FALSE, consent_sms BOOLEAN NOT NULL DEFAULT FALSE, consent_email BOOLEAN NOT NULL DEFAULT FALSE,
  schedule_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB, checked_in_at TIMESTAMPTZ, cancelled_at TIMESTAMPTZ,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  parent_rsvp_id UUID REFERENCES public.guest_moment_rsvps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_rsvp_moment_mobile_active ON public.guest_moment_rsvps(moment_id,mobile) WHERE status='confirmed';
CREATE INDEX IF NOT EXISTS idx_guest_rsvp_moment_status ON public.guest_moment_rsvps(moment_id,status);
CREATE INDEX IF NOT EXISTS idx_guest_rsvp_user ON public.guest_moment_rsvps(user_id,created_at DESC) WHERE user_id IS NOT NULL;
ALTER TABLE public.guest_moment_rsvps ENABLE ROW LEVEL SECURITY;
