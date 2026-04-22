-- Momentum Engine Core Schema
-- Additive migration that extends the existing moments model with
-- pulse, proof, memories, perks, impact attribution, content linking,
-- and venue capacity policies.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'pulse_state'
  ) THEN
    CREATE TYPE public.pulse_state AS ENUM ('dormant', 'forming', 'live', 'cooling');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'moment_mode'
  ) THEN
    CREATE TYPE public.moment_mode AS ENUM ('digital', 'physical', 'hybrid');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'memory_rarity'
  ) THEN
    CREATE TYPE public.memory_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'proof_requirement_type'
  ) THEN
    CREATE TYPE public.proof_requirement_type AS ENUM (
      'geofence',
      'venue_qr',
      'rotating_code',
      'timestamped_media',
      'receipt',
      'merchant_confirm'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'proof_submission_state'
  ) THEN
    CREATE TYPE public.proof_submission_state AS ENUM ('pending', 'verified', 'rejected', 'expired');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'perk_benefit_type'
  ) THEN
    CREATE TYPE public.perk_benefit_type AS ENUM (
      'discount',
      'priority_access',
      'exclusive_content',
      'bonus_multiplier'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'perk_source_type'
  ) THEN
    CREATE TYPE public.perk_source_type AS ENUM ('memory', 'venue', 'brand', 'status');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'impact_event_type'
  ) THEN
    CREATE TYPE public.impact_event_type AS ENUM (
      'share_conversion',
      'first_mover_influence',
      'gathering_activation_assist'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'safety_mode'
  ) THEN
    CREATE TYPE public.safety_mode AS ENUM ('managed', 'strict', 'invite_only');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'proof_mode'
  ) THEN
    CREATE TYPE public.proof_mode AS ENUM ('single', 'multi_modal');
  END IF;
END $$;

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS pulse_state public.pulse_state NOT NULL DEFAULT 'dormant',
  ADD COLUMN IF NOT EXISTS moment_mode public.moment_mode NOT NULL DEFAULT 'physical',
  ADD COLUMN IF NOT EXISTS gathering_threshold integer,
  ADD COLUMN IF NOT EXISTS capacity_limit integer,
  ADD COLUMN IF NOT EXISTS cooldown_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS early_incentive_percent numeric(6,2),
  ADD COLUMN IF NOT EXISTS viral_share_percent numeric(6,2),
  ADD COLUMN IF NOT EXISTS memory_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS memory_rarity public.memory_rarity,
  ADD COLUMN IF NOT EXISTS perk_template_id uuid,
  ADD COLUMN IF NOT EXISTS safety_mode public.safety_mode NOT NULL DEFAULT 'managed',
  ADD COLUMN IF NOT EXISTS content_item_id uuid,
  ADD COLUMN IF NOT EXISTS venue_node_id uuid,
  ADD COLUMN IF NOT EXISTS proof_mode public.proof_mode NOT NULL DEFAULT 'single';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'moments_content_item_id_fkey'
  ) THEN
    ALTER TABLE public.moments
      ADD CONSTRAINT moments_content_item_id_fkey
      FOREIGN KEY (content_item_id)
      REFERENCES public.content_items(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.memory_perks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type public.perk_source_type NOT NULL,
  source_id uuid NOT NULL,
  benefit_type public.perk_benefit_type NOT NULL,
  benefit_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  redemption_rules jsonb,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'moments_perk_template_id_fkey'
  ) THEN
    ALTER TABLE public.moments
      ADD CONSTRAINT moments_perk_template_id_fkey
      FOREIGN KEY (perk_template_id)
      REFERENCES public.memory_perks(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.moment_pulse_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  pulse_state public.pulse_state NOT NULL,
  threshold_progress integer NOT NULL DEFAULT 0,
  current_bonus_multiplier numeric(8,2) NOT NULL DEFAULT 1,
  crowd_level integer NOT NULL DEFAULT 0,
  sentiment_band text,
  saturation_risk text,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.proof_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  requirement_type public.proof_requirement_type NOT NULL,
  is_required boolean NOT NULL DEFAULT true,
  weight numeric(8,2) NOT NULL DEFAULT 1,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.proof_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  submission_state public.proof_submission_state NOT NULL DEFAULT 'pending',
  proof_bundle jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  creator_id uuid,
  brand_id uuid,
  rarity public.memory_rarity NOT NULL,
  title text NOT NULL,
  collection_key text,
  legacy_score integer NOT NULL DEFAULT 0,
  perk_id uuid REFERENCES public.memory_perks(id) ON DELETE SET NULL,
  is_transferable boolean NOT NULL DEFAULT false,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS public.impact_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_user_id uuid NOT NULL,
  downstream_user_id uuid NOT NULL,
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  event_type public.impact_event_type NOT NULL,
  impact_score_delta integer NOT NULL DEFAULT 0,
  viral_share_amount numeric(12,2),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_impact_profiles (
  user_id uuid PRIMARY KEY,
  impact_score integer NOT NULL DEFAULT 0,
  catalyst_rank text,
  first_mover_count integer NOT NULL DEFAULT 0,
  downstream_action_count integer NOT NULL DEFAULT 0,
  downstream_reward_value numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_moment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  entry_action_types text[] NOT NULL DEFAULT '{}'::text[],
  physical_unlock_rules jsonb,
  o2o_conversion_rate numeric(8,4),
  is_sponsored boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_item_id, moment_id)
);

CREATE TABLE IF NOT EXISTS public.venue_capacity_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  default_capacity_limit integer NOT NULL,
  cooldown_minutes integer NOT NULL DEFAULT 0,
  safety_mode public.safety_mode NOT NULL DEFAULT 'managed',
  auto_pause_on_capacity boolean NOT NULL DEFAULT true,
  allow_gatherings boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(venue_id)
);

CREATE INDEX IF NOT EXISTS idx_moments_pulse_state_starts_at
  ON public.moments(pulse_state, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_moments_mode_active_starts_at
  ON public.moments(moment_mode, is_active, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_moments_content_item_id
  ON public.moments(content_item_id);

CREATE INDEX IF NOT EXISTS idx_moment_pulse_snapshots_moment_id_captured_at
  ON public.moment_pulse_snapshots(moment_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_proof_requirements_moment_id
  ON public.proof_requirements(moment_id);

CREATE INDEX IF NOT EXISTS idx_proof_submissions_moment_id_user_id_created_at
  ON public.proof_submissions(moment_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_user_id_issued_at
  ON public.memories(user_id, issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_collection_key_rarity
  ON public.memories(collection_key, rarity);

CREATE INDEX IF NOT EXISTS idx_impact_events_source_user_id_created_at
  ON public.impact_events(source_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_moment_links_content_item_id
  ON public.content_moment_links(content_item_id);

CREATE INDEX IF NOT EXISTS idx_content_moment_links_moment_id
  ON public.content_moment_links(moment_id);

ALTER TABLE public.moment_pulse_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_impact_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_capacity_policies ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
