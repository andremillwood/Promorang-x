-- Ledger for pieces earned through real platform behavior.
-- This connects moment joins, check-ins, referrals, and content proof to portfolio holdings.

CREATE TABLE IF NOT EXISTS public.piece_earning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  piece_type public.piece_type NOT NULL,
  asset_id UUID NOT NULL,
  quantity NUMERIC(24,8) NOT NULL CHECK (quantity > 0),
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, piece_type, asset_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_piece_earning_events_user
ON public.piece_earning_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_piece_earning_events_asset
ON public.piece_earning_events(piece_type, asset_id, created_at DESC);

ALTER TABLE public.piece_earning_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own piece earning events" ON public.piece_earning_events;
CREATE POLICY "Users can read own piece earning events"
ON public.piece_earning_events
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read piece earning events" ON public.piece_earning_events;
CREATE POLICY "Admins can read piece earning events"
ON public.piece_earning_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'master_admin', 'moderator')
  )
);

NOTIFY pgrst, 'reload schema';

