-- Attach support cases to durable commerce proof and route them to the responsible merchant.
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS receipt_id UUID REFERENCES public.commerce_receipts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commerce_reason TEXT,
  ADD COLUMN IF NOT EXISTS evidence JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS resolution JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS merchant_response_due_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_support_tickets_merchant_cases
ON public.support_tickets(merchant_id, status, merchant_response_due_at)
WHERE merchant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_open_receipt_case
ON public.support_tickets(user_id, receipt_id)
WHERE receipt_id IS NOT NULL AND status IN ('open', 'in_progress');
