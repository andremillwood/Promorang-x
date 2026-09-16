-- Canonical commerce purchase truth.
-- A fulfilled purchase receipt is real transaction evidence. It remains distinct
-- from offer redemption. Points-denominated purchases are transactions but are not
-- represented as fiat revenue.

CREATE OR REPLACE FUNCTION public.journal_commerce_purchase_receipt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_prior_event_id uuid;
  v_value_kind text;
BEGIN
  v_value_kind := CASE
    WHEN upper(NEW.currency) IN ('USD','JMD','GBP','EUR','CAD','AUD') THEN 'fiat'
    WHEN lower(NEW.currency) IN ('point','points','gem','gems') THEN 'internal_value'
    ELSE 'other'
  END;

  IF NEW.receipt_type = 'purchase'
     AND NEW.status = 'fulfilled'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.canonical_events (
      event_name, event_version, occurred_at,
      actor_user_id, actor_role, subject_user_id,
      object_type, object_id,
      aggregate_type, aggregate_id,
      campaign_id, experience_id,
      source, source_event_id, correlation_id, idempotency_key,
      truth_class, metadata
    ) VALUES (
      'commerce.purchase.fulfilled', 1, COALESCE(NEW.occurred_at, NEW.created_at, now()),
      NULL, 'commerce_system', NEW.user_id,
      'commerce_receipt', NEW.id::text,
      'sale', NEW.sale_id::text,
      NEW.campaign_id::text, NEW.moment_id::text,
      'db.commerce_receipts', 'commerce_receipt:' || NEW.id::text || ':fulfilled',
      CASE
        WHEN NEW.sale_id IS NOT NULL THEN 'sale:' || NEW.sale_id::text
        ELSE 'commerce-receipt:' || NEW.id::text
      END,
      'canonical:commerce-purchase:' || NEW.id::text,
      'verified',
      jsonb_build_object(
        'merchant_id', NEW.merchant_id,
        'listing_id', NEW.listing_id,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'value_kind', v_value_kind,
        'fiat_revenue_eligible', v_value_kind = 'fiat',
        'domain_record', 'commerce_receipts'
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  IF NEW.receipt_type = 'purchase'
     AND NEW.status = 'refunded'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT id INTO v_prior_event_id
    FROM public.canonical_events
    WHERE idempotency_key = 'canonical:commerce-purchase:' || NEW.id::text
    LIMIT 1;

    INSERT INTO public.canonical_events (
      event_name, event_version, occurred_at,
      actor_user_id, actor_role, subject_user_id,
      object_type, object_id,
      aggregate_type, aggregate_id,
      campaign_id, experience_id,
      source, source_event_id, causation_event_id, correlation_id, idempotency_key,
      truth_class, reversal_of_event_id, metadata
    ) VALUES (
      'commerce.purchase.refunded', 1, now(),
      NULL, 'commerce_system', NEW.user_id,
      'commerce_receipt', NEW.id::text,
      'sale', NEW.sale_id::text,
      NEW.campaign_id::text, NEW.moment_id::text,
      'db.commerce_receipts', 'commerce_receipt:' || NEW.id::text || ':refunded',
      v_prior_event_id,
      CASE
        WHEN NEW.sale_id IS NOT NULL THEN 'sale:' || NEW.sale_id::text
        ELSE 'commerce-receipt:' || NEW.id::text
      END,
      'canonical:commerce-refund:' || NEW.id::text,
      'administrative',
      v_prior_event_id,
      jsonb_build_object(
        'merchant_id', NEW.merchant_id,
        'listing_id', NEW.listing_id,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'value_kind', v_value_kind,
        'domain_record', 'commerce_receipts',
        'actor_unknown_from_domain_row', true
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_commerce_purchase_receipt ON public.commerce_receipts;
CREATE TRIGGER trg_journal_commerce_purchase_receipt
AFTER INSERT OR UPDATE OF status ON public.commerce_receipts
FOR EACH ROW
EXECUTE FUNCTION public.journal_commerce_purchase_receipt();

COMMENT ON FUNCTION public.journal_commerce_purchase_receipt() IS
  'Records fulfilled purchase truth and append-only refund corrections. Redemptions are not purchases; points purchases are not fiat revenue.';

NOTIFY pgrst, 'reload schema';
