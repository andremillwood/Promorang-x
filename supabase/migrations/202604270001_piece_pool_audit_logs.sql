-- Track liquidity pool lifecycle changes for admin review and user accountability.

CREATE TABLE IF NOT EXISTS public.piece_pool_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.piece_liquidity_pools(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  piece_type public.piece_type,
  asset_id UUID,
  previous_status TEXT,
  new_status TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_piece_pool_audit_logs_pool_id
ON public.piece_pool_audit_logs(pool_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_piece_pool_audit_logs_actor_id
ON public.piece_pool_audit_logs(actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_piece_pool_audit_logs_action
ON public.piece_pool_audit_logs(action, created_at DESC);

ALTER TABLE public.piece_pool_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read piece pool audit logs" ON public.piece_pool_audit_logs;
CREATE POLICY "Admins can read piece pool audit logs"
ON public.piece_pool_audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'master_admin', 'moderator')
  )
);

