-- PromoPush distribution engine
-- Makes campaigns explicit geo-triggered traffic pipes into a single Moment.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS system_module text NOT NULL DEFAULT 'promopush'
    CHECK (system_module IN ('promopush')),
  ADD COLUMN IF NOT EXISTS objective_type text
    CHECK (objective_type IN ('content', 'purchase', 'sampling', 'signup', 'attendance', 'custom')),
  ADD COLUMN IF NOT EXISTS geo_label text,
  ADD COLUMN IF NOT EXISTS geo_radius_meters integer
    CHECK (geo_radius_meters IS NULL OR geo_radius_meters > 0),
  ADD COLUMN IF NOT EXISTS distribution_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS distribution_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS entry_mode text
    CHECK (entry_mode IN ('moment_direct', 'qr', 'ad_link', 'direct_link')),
  ADD COLUMN IF NOT EXISTS entry_endpoint text,
  ADD COLUMN IF NOT EXISTS distribution_channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS creator_reward_per_verified_action_jmd numeric(12,2)
    CHECK (creator_reward_per_verified_action_jmd IS NULL OR creator_reward_per_verified_action_jmd >= 0),
  ADD COLUMN IF NOT EXISTS payout_per_scan_signup_jmd numeric(12,2)
    CHECK (payout_per_scan_signup_jmd IS NULL OR payout_per_scan_signup_jmd >= 0),
  ADD COLUMN IF NOT EXISTS payout_per_verified_post_jmd numeric(12,2)
    CHECK (payout_per_verified_post_jmd IS NULL OR payout_per_verified_post_jmd >= 0),
  ADD COLUMN IF NOT EXISTS payout_per_purchase_proof_jmd numeric(12,2)
    CHECK (payout_per_purchase_proof_jmd IS NULL OR payout_per_purchase_proof_jmd >= 0);

CREATE INDEX IF NOT EXISTS idx_campaigns_moment_id
  ON public.campaigns(moment_id)
  WHERE moment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_system_module
  ON public.campaigns(system_module);

CREATE INDEX IF NOT EXISTS idx_campaigns_distribution_window
  ON public.campaigns(distribution_starts_at, distribution_ends_at)
  WHERE distribution_starts_at IS NOT NULL OR distribution_ends_at IS NOT NULL;

UPDATE public.campaigns
SET
  system_module = 'promopush',
  entry_mode = COALESCE(entry_mode, 'moment_direct'),
  distribution_channels = COALESCE(distribution_channels, '[]'::jsonb)
WHERE system_module IS NULL
   OR entry_mode IS NULL
   OR distribution_channels IS NULL;

COMMENT ON TABLE public.campaigns IS 'PromoPush campaign records that distribute traffic into a single Moment.';
COMMENT ON COLUMN public.campaigns.moment_id IS 'The single Moment this PromoPush campaign routes traffic into.';
COMMENT ON COLUMN public.campaigns.geo_radius_meters IS 'GeoFence radius for the active distribution zone.';
COMMENT ON COLUMN public.campaigns.entry_endpoint IS 'Single entry endpoint for ads, QR, and direct links.';

notify pgrst, 'reload schema';
