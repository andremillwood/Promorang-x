-- NEW CARDS ONLY. Needs Andre's explicit OK before this file is applied.
-- It can be applied or skipped on its own.
--
-- Changes user_promo_cards.available_balance default from 45.00 to 0.00.
-- private.provision_user_promo_card() inserts (user_id) only, so accounts
-- created after this migration pick up 0.00.
-- This file does not UPDATE existing rows and does not backfill the
-- current cards. Those balances stay as they are.

alter table public.user_promo_cards
  alter column available_balance SET DEFAULT 0.00;
