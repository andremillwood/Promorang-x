-- Operational support hardening: ownership, SLA timestamps, and full history.

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_user_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_admin_reply_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to
ON public.support_tickets(assigned_to, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_sla_due_at
ON public.support_tickets(sla_due_at) WHERE status IN ('open', 'in_progress');

CREATE TABLE IF NOT EXISTS public.support_ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL DEFAULT 'admin' CHECK (actor_type IN ('user', 'admin', 'system')),
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'assigned', 'status_changed', 'admin_reply', 'user_reply', 'note')),
  previous_status public.support_status,
  new_status public.support_status,
  message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_events_ticket_id
ON public.support_ticket_events(ticket_id, created_at ASC);

ALTER TABLE public.support_ticket_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own support ticket events" ON public.support_ticket_events;
CREATE POLICY "Users can view own support ticket events"
ON public.support_ticket_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    WHERE st.id = ticket_id
      AND st.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage support ticket events" ON public.support_ticket_events;
CREATE POLICY "Admins can manage support ticket events"
ON public.support_ticket_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'master_admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'master_admin', 'moderator')
  )
);

UPDATE public.support_tickets
SET sla_due_at = COALESCE(
  sla_due_at,
  created_at + CASE priority
    WHEN 'high' THEN INTERVAL '8 hours'
    WHEN 'medium' THEN INTERVAL '24 hours'
    ELSE INTERVAL '72 hours'
  END
);
