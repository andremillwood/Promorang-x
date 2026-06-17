-- Gems redemption controls
-- Adds redemption-state tracking for purchased and promotional Gems.

ALTER TABLE public.gems_transactions
  ADD COLUMN IF NOT EXISTS redemption_status text
    CHECK (redemption_status IN (
      'redeemable',
      'pending_30_day_hold',
      'locked_objective',
      'non_redeemable',
      'not_applicable'
    )),
  ADD COLUMN IF NOT EXISTS redeemable_after timestamptz,
  ADD COLUMN IF NOT EXISTS objective_code text,
  ADD COLUMN IF NOT EXISTS objective_status text
    CHECK (objective_status IN ('not_applicable', 'pending', 'completed', 'waived')),
  ADD COLUMN IF NOT EXISTS objective_completed_at timestamptz;

ALTER TABLE public.gems_settings
  ADD COLUMN IF NOT EXISTS purchase_redemption_hold_days integer NOT NULL DEFAULT 30;

UPDATE public.gems_transactions
SET
  redemption_status = CASE
    WHEN amount <= 0 THEN 'not_applicable'
    WHEN transaction_type = 'purchase' THEN 'pending_30_day_hold'
    WHEN transaction_type = 'bonus' THEN 'redeemable'
    WHEN transaction_type IN ('trade_in', 'refund', 'adjustment') THEN 'redeemable'
    ELSE 'not_applicable'
  END
WHERE redemption_status IS NULL;

UPDATE public.gems_transactions
SET redeemable_after = created_at + interval '30 days'
WHERE transaction_type = 'purchase'
  AND amount > 0
  AND redeemable_after IS NULL;

UPDATE public.gems_transactions
SET objective_status = CASE
  WHEN transaction_type = 'bonus' THEN 'not_applicable'
  ELSE 'not_applicable'
END
WHERE objective_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_gems_transactions_redemption_status
  ON public.gems_transactions(redemption_status);

CREATE INDEX IF NOT EXISTS idx_gems_transactions_redeemable_after
  ON public.gems_transactions(redeemable_after)
  WHERE redeemable_after IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gems_transactions_objective_code
  ON public.gems_transactions(objective_code)
  WHERE objective_code IS NOT NULL;

notify pgrst, 'reload schema';
