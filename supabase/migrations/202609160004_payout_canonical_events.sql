-- Canonical settlement producer at the authoritative payout-queue boundary.
-- This covers proof-triggered, manual, ranked, and internal queue creation paths.
-- Queueing is administrative state; only status='paid' is verified settlement.

CREATE OR REPLACE FUNCTION public.journal_manual_payout_queue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.canonical_events (
      event_name, event_version, occurred_at,
      actor_user_id, actor_role, subject_user_id,
      object_type, object_id,
      aggregate_type, aggregate_id, experience_id,
      source, source_event_id, correlation_id, idempotency_key,
      truth_class, metadata
    ) VALUES (
      'settlement.payout.queued', 1, NEW.created_at,
      NULL, 'system', NEW.user_id,
      'manual_payout_queue', NEW.id::text,
      'proof_submission', NEW.proof_submission_id::text, NEW.moment_id::text,
      'db.manual_payout_queue', 'manual_payout_queue:' || NEW.id::text || ':queued',
      CASE
        WHEN NEW.proof_submission_id IS NOT NULL THEN 'proof:' || NEW.proof_submission_id::text || ':settlement'
        ELSE 'payout:' || NEW.id::text
      END,
      'canonical:settlement-queued:' || NEW.id::text,
      'administrative',
      jsonb_build_object(
        'proof_submission_id', NEW.proof_submission_id,
        'ledger_id', NEW.ledger_id,
        'amount_jmd', NEW.amount_jmd,
        'status', NEW.status,
        'domain_record', 'manual_payout_queue'
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  IF NEW.status = 'paid'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.canonical_events (
      event_name, event_version, occurred_at,
      actor_user_id, actor_role, subject_user_id,
      object_type, object_id,
      aggregate_type, aggregate_id, experience_id,
      source, source_event_id, correlation_id, idempotency_key,
      truth_class, metadata
    ) VALUES (
      'settlement.payout.paid', 1, COALESCE(NEW.paid_at, NEW.updated_at, now()),
      NEW.paid_by, 'admin_settlement_operator', NEW.user_id,
      'manual_payout_queue', NEW.id::text,
      'proof_submission', NEW.proof_submission_id::text, NEW.moment_id::text,
      'db.manual_payout_queue', 'manual_payout_queue:' || NEW.id::text || ':paid',
      CASE
        WHEN NEW.proof_submission_id IS NOT NULL THEN 'proof:' || NEW.proof_submission_id::text || ':settlement'
        ELSE 'payout:' || NEW.id::text
      END,
      'canonical:settlement-paid:' || NEW.id::text,
      'verified',
      jsonb_build_object(
        'proof_submission_id', NEW.proof_submission_id,
        'ledger_id', NEW.ledger_id,
        'amount_jmd', NEW.amount_jmd,
        'status', NEW.status,
        'payment_reference_present', NEW.payment_reference IS NOT NULL,
        'domain_record', 'manual_payout_queue'
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_manual_payout_queue ON public.manual_payout_queue;
CREATE TRIGGER trg_journal_manual_payout_queue
AFTER INSERT OR UPDATE OF status ON public.manual_payout_queue
FOR EACH ROW
EXECUTE FUNCTION public.journal_manual_payout_queue();

COMMENT ON FUNCTION public.journal_manual_payout_queue() IS
  'Records settlement queue and paid truth for every payout path, including ranked/internal paths. Queueing never implies payment.';

NOTIFY pgrst, 'reload schema';
