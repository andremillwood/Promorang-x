-- Canonical guest attendance lineage.
-- RSVP remains intent. Guest attendance receipt is the verified attendance object.
-- Reversal appends a correction event and preserves the original verified event.

CREATE OR REPLACE FUNCTION public.journal_guest_rsvp_observed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    INSERT INTO public.canonical_events (
      event_name, event_version, occurred_at,
      actor_user_id, actor_role, subject_user_id,
      object_type, object_id,
      aggregate_type, aggregate_id, experience_id,
      source, source_event_id, correlation_id, idempotency_key,
      truth_class, metadata
    ) VALUES (
      'attendance.rsvp.observed', 1, NEW.created_at,
      NEW.user_id, CASE WHEN NEW.user_id IS NULL THEN 'guest' ELSE 'participant' END, NEW.user_id,
      'guest_rsvp', NEW.id::text,
      'experience', NEW.moment_id::text, NEW.moment_id::text,
      'db.guest_moment_rsvps', 'guest_rsvp:' || NEW.id::text || ':confirmed',
      'experience:' || NEW.moment_id::text || ':guest-rsvp:' || NEW.id::text,
      'canonical:guest-rsvp:' || NEW.id::text,
      'observed',
      jsonb_build_object(
        'guest_count', NEW.guest_count,
        'domain_record', 'guest_moment_rsvps',
        'identified_user', NEW.user_id IS NOT NULL
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_guest_rsvp_observed ON public.guest_moment_rsvps;
CREATE TRIGGER trg_journal_guest_rsvp_observed
AFTER INSERT ON public.guest_moment_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.journal_guest_rsvp_observed();

CREATE OR REPLACE FUNCTION public.journal_guest_attendance_receipt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_prior_event_id uuid;
BEGIN
  IF NEW.status IN ('verified','claimed')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.canonical_events (
      event_name, event_version, occurred_at,
      actor_user_id, actor_role, subject_user_id,
      object_type, object_id,
      aggregate_type, aggregate_id, experience_id,
      source, source_event_id, correlation_id, idempotency_key,
      truth_class, metadata
    ) VALUES (
      'attendance.guest.verified', 1, NEW.verified_at,
      NEW.verified_by, 'host_operator', NEW.user_id,
      'guest_attendance_receipt', NEW.id::text,
      'guest_rsvp', NEW.rsvp_id::text, NEW.moment_id::text,
      'db.guest_attendance_receipts', 'guest_attendance_receipt:' || NEW.id::text || ':verified',
      'experience:' || NEW.moment_id::text || ':guest-rsvp:' || NEW.rsvp_id::text,
      'canonical:guest-attendance:' || NEW.id::text,
      'verified',
      jsonb_build_object(
        'verification_method', NEW.verification_method,
        'receipt_status', NEW.status,
        'domain_record', 'guest_attendance_receipts'
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  IF NEW.status = 'reversed'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT id INTO v_prior_event_id
    FROM public.canonical_events
    WHERE idempotency_key = 'canonical:guest-attendance:' || NEW.id::text
    LIMIT 1;

    INSERT INTO public.canonical_events (
      event_name, event_version, occurred_at,
      actor_user_id, actor_role, subject_user_id,
      object_type, object_id,
      aggregate_type, aggregate_id, experience_id,
      source, source_event_id, causation_event_id, correlation_id, idempotency_key,
      truth_class, reversal_of_event_id, metadata
    ) VALUES (
      'attendance.guest.reversed', 1, COALESCE(NEW.updated_at, now()),
      NEW.verified_by, 'admin_or_host_correction', NEW.user_id,
      'guest_attendance_receipt', NEW.id::text,
      'guest_rsvp', NEW.rsvp_id::text, NEW.moment_id::text,
      'db.guest_attendance_receipts', 'guest_attendance_receipt:' || NEW.id::text || ':reversed',
      v_prior_event_id,
      'experience:' || NEW.moment_id::text || ':guest-rsvp:' || NEW.rsvp_id::text,
      'canonical:guest-attendance-reversed:' || NEW.id::text,
      'administrative',
      v_prior_event_id,
      jsonb_build_object(
        'receipt_status', NEW.status,
        'domain_record', 'guest_attendance_receipts'
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_guest_attendance_receipt ON public.guest_attendance_receipts;
CREATE TRIGGER trg_journal_guest_attendance_receipt
AFTER INSERT OR UPDATE OF status ON public.guest_attendance_receipts
FOR EACH ROW
EXECUTE FUNCTION public.journal_guest_attendance_receipt();

COMMENT ON FUNCTION public.journal_guest_rsvp_observed() IS
  'Records guest reservation intent without implying attendance.';
COMMENT ON FUNCTION public.journal_guest_attendance_receipt() IS
  'Records verified guest attendance and append-only reversals from the authoritative receipt state.';

NOTIFY pgrst, 'reload schema';
