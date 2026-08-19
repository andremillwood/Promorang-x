ALTER TABLE public.guest_rsvp_deliveries
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.guest_rsvp_deliveries
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ;
ALTER TABLE public.guest_rsvp_deliveries
  ADD COLUMN IF NOT EXISTS provider_status TEXT;
ALTER TABLE public.guest_rsvp_deliveries
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE INDEX IF NOT EXISTS idx_guest_delivery_retry_due
  ON public.guest_rsvp_deliveries(next_attempt_at, created_at)
  WHERE status = 'failed';

ALTER TABLE public.guest_moment_rsvps
  ADD COLUMN IF NOT EXISTS preferences_updated_at TIMESTAMPTZ;
