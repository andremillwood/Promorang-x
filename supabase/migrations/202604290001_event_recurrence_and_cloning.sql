-- Add recurrence and cloning support for host-managed events.
-- This migration is intentionally additive so it can run safely against
-- environments where the legacy events stack already exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'event_recurrence_frequency'
  ) THEN
    CREATE TYPE public.event_recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.event_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid,
  source_event_id uuid,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  timezone text NOT NULL DEFAULT 'UTC',
  frequency public.event_recurrence_frequency NOT NULL,
  recurrence_interval integer NOT NULL DEFAULT 1,
  recurrence_by_weekday smallint[] NOT NULL DEFAULT '{}'::smallint[],
  recurrence_day_of_month smallint,
  recurrence_until timestamptz,
  recurrence_count integer,
  generation_horizon_days integer NOT NULL DEFAULT 90,
  template_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'events'
  ) THEN
    ALTER TABLE public.event_series
      ADD CONSTRAINT event_series_source_event_id_fkey
      FOREIGN KEY (source_event_id)
      REFERENCES public.events(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'events'
  ) THEN
    ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS series_id uuid,
      ADD COLUMN IF NOT EXISTS source_event_id uuid,
      ADD COLUMN IF NOT EXISTS clone_source_event_id uuid,
      ADD COLUMN IF NOT EXISTS recurrence_enabled boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS recurrence_frequency public.event_recurrence_frequency,
      ADD COLUMN IF NOT EXISTS recurrence_interval integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS recurrence_by_weekday smallint[] NOT NULL DEFAULT '{}'::smallint[],
      ADD COLUMN IF NOT EXISTS recurrence_day_of_month smallint,
      ADD COLUMN IF NOT EXISTS recurrence_timezone text NOT NULL DEFAULT 'UTC',
      ADD COLUMN IF NOT EXISTS recurrence_until timestamptz,
      ADD COLUMN IF NOT EXISTS recurrence_count integer,
      ADD COLUMN IF NOT EXISTS generation_horizon_days integer NOT NULL DEFAULT 90,
      ADD COLUMN IF NOT EXISTS occurrence_index integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_series_exception boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS series_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'events'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_series_id_fkey
      FOREIGN KEY (series_id)
      REFERENCES public.event_series(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'events'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_source_event_id_fkey
      FOREIGN KEY (source_event_id)
      REFERENCES public.events(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'events'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_clone_source_event_id_fkey
      FOREIGN KEY (clone_source_event_id)
      REFERENCES public.events(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_series_creator_id
  ON public.event_series(creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_series_frequency
  ON public.event_series(frequency, status);

CREATE INDEX IF NOT EXISTS idx_events_series_id
  ON public.events(series_id, event_date);

CREATE INDEX IF NOT EXISTS idx_events_source_event_id
  ON public.events(source_event_id);

CREATE INDEX IF NOT EXISTS idx_events_clone_source_event_id
  ON public.events(clone_source_event_id);

CREATE INDEX IF NOT EXISTS idx_events_recurrence_enabled
  ON public.events(recurrence_enabled, event_date);

NOTIFY pgrst, 'reload schema';
