-- Provision one PromoCard per authenticated account and expose read-only card
-- data through the Data API. Balance changes remain server-controlled.

grant select on table public.user_promo_cards to authenticated;
grant select on table public.split_tender_transactions to authenticated;
grant select on table public.attention_recharge_events to authenticated;
grant select on table public.merchant_margin_pools to anon, authenticated;

drop policy if exists "Users read own card" on public.user_promo_cards;
create policy "Users read own card"
  on public.user_promo_cards
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users read own transactions" on public.split_tender_transactions;
create policy "Users read own transactions"
  on public.split_tender_transactions
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select auth.uid()) = merchant_id
    or (select auth.uid()) = hub_operator_id
  );

create policy "Users read own recharge events"
  on public.attention_recharge_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Public read active margin pools" on public.merchant_margin_pools;
create policy "Public read active margin pools"
  on public.merchant_margin_pools
  for select
  to anon, authenticated
  using (is_active = true);

-- Trigger functions require elevated privileges to insert the user's protected
-- card row. Keep the function outside exposed schemas, pin its search path, and
-- revoke public execution so it cannot be called as an API endpoint.
create schema if not exists private;

create or replace function private.provision_user_promo_card()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_promo_cards (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.provision_user_promo_card() from public, anon, authenticated;

drop trigger if exists provision_user_promo_card_after_signup on auth.users;
create trigger provision_user_promo_card_after_signup
  after insert on auth.users
  for each row execute function private.provision_user_promo_card();

-- Provision accounts that existed before the PromoCard migration.
insert into public.user_promo_cards (user_id)
select id from auth.users
on conflict (user_id) do nothing;
