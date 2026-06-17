-- Add payment-tracking fields to transactions so external payment providers
-- can be recorded idempotently and referenced by downstream ledgers.

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS provider text,
ADD COLUMN IF NOT EXISTS external_payment_id text,
ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc', now());

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_provider_external_payment_id
ON public.transactions(provider, external_payment_id)
WHERE external_payment_id IS NOT NULL;
