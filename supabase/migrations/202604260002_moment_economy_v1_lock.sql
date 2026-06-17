-- Moment Economy V1 Lock
-- Canonical closed-loop economy tables for:
-- fund Moment -> lock reward pool -> verify Moves -> execute payout rules -> ledger money movement.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_money_source') THEN
    CREATE TYPE public.moment_money_source AS ENUM ('entry', 'host', 'event', 'hybrid');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_funding_status') THEN
    CREATE TYPE public.moment_funding_status AS ENUM ('pending', 'funded', 'locked', 'completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_payout_status') THEN
    CREATE TYPE public.moment_payout_status AS ENUM ('pending', 'in_progress', 'completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_move_proof_type') THEN
    CREATE TYPE public.moment_move_proof_type AS ENUM ('code', 'photo', 'video', 'referral', 'link');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_payout_rule_type') THEN
    CREATE TYPE public.moment_payout_rule_type AS ENUM ('first_n', 'per_action', 'leaderboard', 'milestone', 'judged');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moment_ledger_type') THEN
    CREATE TYPE public.moment_ledger_type AS ENUM ('inflow', 'escrow_lock', 'payout', 'refund', 'platform_fee', 'host_margin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'manual_payout_status') THEN
    CREATE TYPE public.manual_payout_status AS ENUM ('queued', 'processing', 'paid', 'cancelled');
  END IF;
END $$;

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS check_in_code text;

CREATE TABLE IF NOT EXISTS public.moment_economics (
  moment_id uuid PRIMARY KEY REFERENCES public.moments(id) ON DELETE CASCADE,
  money_source public.moment_money_source NOT NULL,
  entry_fee_jmd numeric(12,2),
  total_funded_jmd numeric(12,2) NOT NULL DEFAULT 0 CHECK (total_funded_jmd >= 0),
  reward_pool_jmd numeric(12,2) NOT NULL DEFAULT 0 CHECK (reward_pool_jmd >= 0),
  host_margin_jmd numeric(12,2) NOT NULL DEFAULT 0 CHECK (host_margin_jmd >= 0),
  platform_fee_jmd numeric(12,2) NOT NULL DEFAULT 0 CHECK (platform_fee_jmd >= 0),
  ops_buffer_jmd numeric(12,2) NOT NULL DEFAULT 0 CHECK (ops_buffer_jmd >= 0),
  funding_status public.moment_funding_status NOT NULL DEFAULT 'pending',
  payout_status public.moment_payout_status NOT NULL DEFAULT 'pending',
  locked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT moment_economics_entry_fee_required
    CHECK (money_source <> 'entry' OR COALESCE(entry_fee_jmd, 0) > 0),
  CONSTRAINT moment_economics_reward_pool_funded_when_locked
    CHECK (funding_status NOT IN ('locked', 'completed') OR total_funded_jmd >= reward_pool_jmd)
);

CREATE TABLE IF NOT EXISTS public.moment_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  proof_type public.moment_move_proof_type NOT NULL,
  reward_amount_jmd numeric(12,2) NOT NULL DEFAULT 0 CHECK (reward_amount_jmd >= 0),
  max_completions integer CHECK (max_completions IS NULL OR max_completions > 0),
  requires_unique boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moment_payout_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  rule_type public.moment_payout_rule_type NOT NULL,
  amount_jmd numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount_jmd >= 0),
  cap_jmd numeric(12,2) CHECK (cap_jmd IS NULL OR cap_jmd >= 0),
  rank_start integer CHECK (rank_start IS NULL OR rank_start > 0),
  rank_end integer CHECK (rank_end IS NULL OR rank_end > 0),
  criteria_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moment_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  type public.moment_ledger_type NOT NULL,
  amount_jmd numeric(12,2) NOT NULL CHECK (amount_jmd >= 0),
  user_id uuid,
  proof_submission_id uuid REFERENCES public.proof_submissions(id) ON DELETE SET NULL,
  reference text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.manual_payout_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  proof_submission_id uuid REFERENCES public.proof_submissions(id) ON DELETE SET NULL,
  ledger_id uuid REFERENCES public.moment_ledger(id) ON DELETE SET NULL,
  amount_jmd numeric(12,2) NOT NULL CHECK (amount_jmd > 0),
  status public.manual_payout_status NOT NULL DEFAULT 'queued',
  due_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  paid_at timestamptz,
  paid_by uuid,
  payment_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.proof_submissions
  ADD COLUMN IF NOT EXISTS moment_move_id uuid REFERENCES public.moment_moves(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payout_status public.moment_payout_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payout_ledger_id uuid REFERENCES public.moment_ledger(id) ON DELETE SET NULL;

ALTER TABLE public.moment_participants
  ADD COLUMN IF NOT EXISTS entry_paid_jmd numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS entry_payment_reference text;

CREATE INDEX IF NOT EXISTS idx_moment_economics_status ON public.moment_economics(funding_status, payout_status);
CREATE INDEX IF NOT EXISTS idx_moment_moves_moment_sort ON public.moment_moves(moment_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_moment_payout_rules_moment ON public.moment_payout_rules(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_ledger_moment_type_created ON public.moment_ledger(moment_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manual_payout_queue_status_due ON public.manual_payout_queue(status, due_at);
CREATE INDEX IF NOT EXISTS idx_proof_submissions_move ON public.proof_submissions(moment_move_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_proof_submissions_unique_verified_move
  ON public.proof_submissions(moment_id, user_id, moment_move_id)
  WHERE submission_state <> 'rejected' AND moment_move_id IS NOT NULL;

ALTER TABLE public.moment_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_payout_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_payout_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moment economics readable by participants"
  ON public.moment_economics FOR SELECT
  USING (true);

CREATE POLICY "Moment moves readable by participants"
  ON public.moment_moves FOR SELECT
  USING (true);

CREATE POLICY "Moment payout rules readable by participants"
  ON public.moment_payout_rules FOR SELECT
  USING (true);

CREATE POLICY "Moment ledger readable by hosts and recipients"
  ON public.moment_ledger FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.moments m
      WHERE m.id = moment_ledger.moment_id
        AND (m.host_id = auth.uid() OR m.organizer_id = auth.uid())
    )
  );

CREATE POLICY "Manual payout queue readable by recipients and hosts"
  ON public.manual_payout_queue FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.moments m
      WHERE m.id = manual_payout_queue.moment_id
        AND (m.host_id = auth.uid() OR m.organizer_id = auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.set_moment_economy_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_moment_economics_updated_at ON public.moment_economics;
CREATE TRIGGER trg_moment_economics_updated_at
BEFORE UPDATE ON public.moment_economics
FOR EACH ROW EXECUTE FUNCTION public.set_moment_economy_updated_at();

DROP TRIGGER IF EXISTS trg_moment_moves_updated_at ON public.moment_moves;
CREATE TRIGGER trg_moment_moves_updated_at
BEFORE UPDATE ON public.moment_moves
FOR EACH ROW EXECUTE FUNCTION public.set_moment_economy_updated_at();

DROP TRIGGER IF EXISTS trg_moment_payout_rules_updated_at ON public.moment_payout_rules;
CREATE TRIGGER trg_moment_payout_rules_updated_at
BEFORE UPDATE ON public.moment_payout_rules
FOR EACH ROW EXECUTE FUNCTION public.set_moment_economy_updated_at();

DROP TRIGGER IF EXISTS trg_manual_payout_queue_updated_at ON public.manual_payout_queue;
CREATE TRIGGER trg_manual_payout_queue_updated_at
BEFORE UPDATE ON public.manual_payout_queue
FOR EACH ROW EXECUTE FUNCTION public.set_moment_economy_updated_at();

NOTIFY pgrst, 'reload schema';
