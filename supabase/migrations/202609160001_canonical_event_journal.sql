-- Canonical event journal: one cross-domain lineage for production truth.
-- Domain tables remain authoritative for rich details; this journal references them.

CREATE TABLE IF NOT EXISTS public.canonical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_version integer NOT NULL DEFAULT 1 CHECK (event_version > 0),
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),

  actor_user_id uuid NULL,
  actor_organization_id uuid NULL,
  actor_role text NULL,
  subject_user_id uuid NULL,

  object_type text NOT NULL,
  object_id text NOT NULL,
  aggregate_type text NULL,
  aggregate_id text NULL,

  place_id text NULL,
  campaign_id text NULL,
  experience_id text NULL,

  source text NOT NULL,
  source_event_id text NULL,
  causation_event_id uuid NULL REFERENCES public.canonical_events(id),
  correlation_id text NULL,
  idempotency_key text NOT NULL UNIQUE,

  truth_class text NOT NULL DEFAULT 'observed'
    CHECK (truth_class IN ('observed','attributed','verified','incremental','administrative')),
  reversal_of_event_id uuid NULL REFERENCES public.canonical_events(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS canonical_events_object_idx
  ON public.canonical_events(object_type, object_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS canonical_events_aggregate_idx
  ON public.canonical_events(aggregate_type, aggregate_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS canonical_events_correlation_idx
  ON public.canonical_events(correlation_id, occurred_at ASC);
CREATE INDEX IF NOT EXISTS canonical_events_subject_idx
  ON public.canonical_events(subject_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS canonical_events_campaign_idx
  ON public.canonical_events(campaign_id, occurred_at DESC)
  WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS canonical_events_experience_idx
  ON public.canonical_events(experience_id, occurred_at DESC)
  WHERE experience_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS canonical_events_truth_idx
  ON public.canonical_events(truth_class, occurred_at DESC);

ALTER TABLE public.canonical_events ENABLE ROW LEVEL SECURITY;

-- No browser/client policy is intentionally created here. Canonical truth is written
-- by trusted backend/service-role paths during the first convergence phase.
REVOKE ALL ON TABLE public.canonical_events FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.canonical_events TO service_role;

COMMENT ON TABLE public.canonical_events IS
  'Append-oriented cross-domain journal. Stakeholder projections may differ; underlying event identity and truth class may not.';
COMMENT ON COLUMN public.canonical_events.truth_class IS
  'Observed, attributed, verified, incremental, or administrative. Never infer a stronger class from presentation.';
COMMENT ON COLUMN public.canonical_events.reversal_of_event_id IS
  'Corrections append a new event referencing the prior event; source history remains intact.';

NOTIFY pgrst, 'reload schema';
