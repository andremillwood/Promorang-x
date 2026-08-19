-- These columns were introduced after the original guest RSVP migration was first
-- deployed. Keep this migration additive so existing environments are upgraded.
ALTER TABLE public.guest_moment_rsvps
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.guest_moment_rsvps
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE public.guest_moment_rsvps
  ADD COLUMN IF NOT EXISTS parent_rsvp_id UUID REFERENCES public.guest_moment_rsvps(id) ON DELETE SET NULL;
ALTER TABLE public.guest_moment_rsvps
  ADD COLUMN IF NOT EXISTS manage_token UUID;
ALTER TABLE public.guest_moment_rsvps
  ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.guest_moment_rsvps
  ADD COLUMN IF NOT EXISTS verification_method TEXT;
ALTER TABLE public.guest_moment_rsvps
  ADD COLUMN IF NOT EXISTS check_in_note TEXT;

UPDATE public.guest_moment_rsvps
SET manage_token = gen_random_uuid()
WHERE manage_token IS NULL;

ALTER TABLE public.guest_moment_rsvps
  ALTER COLUMN manage_token SET DEFAULT gen_random_uuid();
ALTER TABLE public.guest_moment_rsvps
  ALTER COLUMN manage_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_rsvp_manage_token
  ON public.guest_moment_rsvps(manage_token);
CREATE INDEX IF NOT EXISTS idx_guest_rsvp_parent
  ON public.guest_moment_rsvps(parent_rsvp_id);

CREATE TABLE IF NOT EXISTS public.guest_rsvp_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES public.guest_moment_rsvps(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('confirmation','schedule_changed','location_changed','cancelled','refunded','reminder')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','sms','email')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','skipped')),
  destination_masked TEXT,
  provider_reference TEXT,
  error_message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  idempotency_key TEXT NOT NULL UNIQUE,
  attempted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guest_delivery_queue ON public.guest_rsvp_deliveries(status,created_at) WHERE status IN ('queued','failed');
CREATE INDEX IF NOT EXISTS idx_guest_delivery_rsvp ON public.guest_rsvp_deliveries(rsvp_id,created_at DESC);
ALTER TABLE public.guest_rsvp_deliveries ENABLE ROW LEVEL SECURITY;
