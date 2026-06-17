-- Separate publication from approval for trading and liquidity.

CREATE TABLE IF NOT EXISTS public.piece_asset_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_type public.piece_type NOT NULL,
  asset_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  review_notes TEXT,
  submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (piece_type, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_piece_asset_approvals_status
ON public.piece_asset_approvals(status, submitted_at DESC);

ALTER TABLE public.piece_asset_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage piece asset approvals" ON public.piece_asset_approvals;
CREATE POLICY "Admins can manage piece asset approvals"
ON public.piece_asset_approvals
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

-- Existing pools were created under the previous published-asset rule. Preserve
-- them as explicitly approved so deployments do not unexpectedly halt trading.
INSERT INTO public.piece_asset_approvals (
  piece_type,
  asset_id,
  status,
  review_notes,
  submitted_by,
  reviewed_by,
  reviewed_at
)
SELECT
  pool.piece_type,
  pool.asset_id,
  'approved',
  'Backfilled from an existing liquidity pool during approval-registry rollout.',
  pool.created_by,
  pool.created_by,
  COALESCE(pool.created_at, NOW())
FROM public.piece_liquidity_pools pool
ON CONFLICT (piece_type, asset_id) DO NOTHING;
