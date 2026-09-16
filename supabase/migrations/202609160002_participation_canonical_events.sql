-- Canonical attendance producer at the authoritative participation-table boundary.
-- A checked_in_at write proves an arrival/check-in record exists. It does NOT by
-- itself prove reviewed/verified attendance because some flows mark check-in while
-- proof is still pending. Verification is emitted separately by proof review.

CREATE OR REPLACE FUNCTION public.journal_moment_participant_checkin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.checked_in_at IS NOT NULL
     AND (OLD.checked_in_at IS NULL OR OLD.checked_in_at IS DISTINCT FROM NEW.checked_in_at) THEN
    INSERT INTO public.canonical_events (
      event_name,
      event_version,
      occurred_at,
      actor_user_id,
      actor_role,
      subject_user_id,
      object_type,
      object_id,
      aggregate_type,
      aggregate_id,
      experience_id,
      source,
      source_event_id,
      correlation_id,
      idempotency_key,
      truth_class,
      metadata
    ) VALUES (
      'attendance.checkin.observed',
      1,
      NEW.checked_in_at,
      NEW.user_id,
      'participant',
      NEW.user_id,
      'moment_participation',
      NEW.id::text,
      'experience',
      NEW.moment_id::text,
      NEW.moment_id::text,
      'db.moment_participants',
      'moment_participant:' || NEW.id::text || ':checked_in',
      'experience:' || NEW.moment_id::text || ':participant:' || NEW.user_id::text,
      'canonical:attendance-checkin:' || NEW.id::text,
      'observed',
      jsonb_build_object(
        'participation_status', NEW.status,
        'domain_record', 'moment_participants'
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_moment_participant_checkin ON public.moment_participants;
CREATE TRIGGER trg_journal_moment_participant_checkin
AFTER UPDATE OF checked_in_at ON public.moment_participants
FOR EACH ROW
EXECUTE FUNCTION public.journal_moment_participant_checkin();

COMMENT ON FUNCTION public.journal_moment_participant_checkin() IS
  'Records observed check-in truth. Proof approval remains the separate verification boundary.';

NOTIFY pgrst, 'reload schema';
