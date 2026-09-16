-- Canonical Creator value attribution.
-- The current creator economy creates pending earnings ledger entries, but no
-- production service transition proves creator payout settlement. This producer
-- therefore records attributed value only and does not emit approved/paid events.

CREATE OR REPLACE FUNCTION public.journal_creator_earning_attributed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.canonical_events (
    event_name, event_version, occurred_at,
    actor_user_id, actor_role, subject_user_id,
    object_type, object_id,
    aggregate_type, aggregate_id,
    experience_id,
    source, source_event_id, correlation_id, idempotency_key,
    truth_class, metadata
  ) VALUES (
    'creator.value.attributed', 1, NEW.created_at,
    NULL, 'creator_economy_system', NEW.creator_id,
    'creator_earning', NEW.id::text,
    CASE WHEN NEW.mission_attribution_id IS NOT NULL THEN 'mission_attribution' ELSE 'creator' END,
    COALESCE(NEW.mission_attribution_id::text, NEW.creator_id::text),
    NEW.moment_id::text,
    'db.creator_earnings_ledger', 'creator_earning:' || NEW.id::text || ':attributed',
    CASE
      WHEN NEW.mission_attribution_id IS NOT NULL THEN 'mission-attribution:' || NEW.mission_attribution_id::text
      ELSE 'creator:' || NEW.creator_id::text || ':earning:' || NEW.id::text
    END,
    'canonical:creator-value:' || NEW.id::text,
    'attributed',
    jsonb_build_object(
      'mission_attribution_id', NEW.mission_attribution_id,
      'mission_link_id', NEW.mission_link_id,
      'content_item_id', NEW.content_item_id,
      'brand_id', NEW.brand_id,
      'source_type', NEW.source_type,
      'ledger_status', NEW.status,
      'currency', NEW.currency,
      'unit_count', NEW.unit_count,
      'gross_amount', NEW.gross_amount,
      'creator_share_amount', NEW.creator_share_amount,
      'domain_record', 'creator_earnings_ledger',
      'payout_proven', false
    )
  )
  ON CONFLICT (idempotency_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_creator_earning_attributed ON public.creator_earnings_ledger;
CREATE TRIGGER trg_journal_creator_earning_attributed
AFTER INSERT ON public.creator_earnings_ledger
FOR EACH ROW
EXECUTE FUNCTION public.journal_creator_earning_attributed();

COMMENT ON FUNCTION public.journal_creator_earning_attributed() IS
  'Records Creator economic attribution from the existing earnings ledger. It deliberately does not imply approval, settlement, or payout.';

NOTIFY pgrst, 'reload schema';
