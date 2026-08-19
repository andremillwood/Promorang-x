CREATE TABLE IF NOT EXISTS public.guest_attendance_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL UNIQUE REFERENCES public.guest_moment_rsvps(id) ON DELETE CASCADE,
  moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('verified','claimed','reversed')),
  verification_method TEXT NOT NULL,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ,
  outcomes JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_attendance_receipt_moment
  ON public.guest_attendance_receipts(moment_id, verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_attendance_receipt_user
  ON public.guest_attendance_receipts(user_id, verified_at DESC)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.guest_attendance_receipts ENABLE ROW LEVEL SECURITY;
