-- Interest that aims a member PromoCard. Not a balance and not a second unlock table.
-- Unlock still lives on discovery_card_unlocks. This only remembers what the card is watching.

CREATE TABLE IF NOT EXISTS public.promocard_member_aims (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  aim text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promocard_member_aims_known CHECK (
    aim IN ('kingston-after-dark', 'barbican', 'food', 'tonight')
  )
);

ALTER TABLE public.promocard_member_aims ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.promocard_member_aims FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.promocard_member_aims TO service_role;
