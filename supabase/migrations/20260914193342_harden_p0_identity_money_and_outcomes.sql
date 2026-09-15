-- P0 hardening: identity, authorization, money, settlement, and outcomes.
-- Client roles receive only proven reads. Financial/privileged writes stay server-side.

do $$
declare target_table text;
begin
  foreach target_table in array array[
    'users','user_roles','transactions','gem_ledger_entries','growth_ledger',
    'creator_earnings_ledger','representatives','representative_commissions',
    'piece_settlement_ledger','piece_escrow','piece_fee_reserves','staking_positions',
    'shield_subscriptions','funding_pledges','investor_content_shares','verified_actions'
  ] loop
    execute format('alter table public.%I enable row level security', target_table);
    execute format('revoke all on table public.%I from anon, authenticated', target_table);
    execute format('grant select, insert, update, delete on table public.%I to service_role', target_table);
  end loop;
end $$;

-- Public profile discovery is protected at the column-permission layer. Private
-- email, balance, referral-earnings, KYC, and marketing fields are not granted.
grant select (
  id, username, display_name, user_type, advertiser_tier, user_tier, avatar_url,
  has_store, store_id, primary_referral_code, maturity_state, last_used_surface,
  verified_actions_count, role, roles
) on public.users to authenticated;
grant select (
  id, username, display_name, user_type, avatar_url, has_store, store_id,
  primary_referral_code
) on public.users to anon;
grant update (demo_email_recipient) on public.users to authenticated;

create policy users_public_directory_read on public.users for select to anon, authenticated using (true);
create policy users_update_own_demo_recipient on public.users for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Business-directory roles are discoverable; platform authority roles are not.
grant select (user_id, role) on public.user_roles to anon, authenticated;
grant insert (user_id, role) on public.user_roles to authenticated;
grant delete on public.user_roles to authenticated;
create policy user_roles_read_public_or_own on public.user_roles for select to anon, authenticated
  using (role::text in ('creator','host','brand','merchant','agency','promoter','marketing')
    or (select auth.uid()) = user_id);
create policy user_roles_insert_own_non_privileged on public.user_roles for insert to authenticated
  with check ((select auth.uid()) = user_id and role::text in
    ('participant','creator','host','brand','merchant','agency','promoter','marketing'));
create policy user_roles_delete_own_non_privileged on public.user_roles for delete to authenticated
  using ((select auth.uid()) = user_id and role::text in
    ('participant','creator','host','brand','merchant','agency','promoter','marketing'));

grant select on public.transactions to authenticated;
create policy transactions_read_own on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.growth_ledger to authenticated;
create policy growth_ledger_read_own on public.growth_ledger for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.creator_earnings_ledger to authenticated;
create policy creator_earnings_read_own on public.creator_earnings_ledger for select to authenticated
  using ((select auth.uid()) = creator_id);
grant select on public.representatives to authenticated;
create policy representatives_read_own on public.representatives for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.representative_commissions to authenticated;
create policy representative_commissions_read_own on public.representative_commissions for select to authenticated
  using (exists (select 1 from public.representatives r
    where r.id = representative_id and r.user_id = (select auth.uid())));
grant select on public.piece_settlement_ledger to authenticated;
create policy piece_settlement_ledger_read_own on public.piece_settlement_ledger for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.piece_escrow to authenticated;
create policy piece_escrow_read_own on public.piece_escrow for select to authenticated
  using ((select auth.uid()) = owner_id);
grant select on public.staking_positions to authenticated;
create policy staking_positions_read_own on public.staking_positions for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.shield_subscriptions to authenticated;
create policy shield_subscriptions_read_own on public.shield_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.funding_pledges to authenticated;
create policy funding_pledges_read_own on public.funding_pledges for select to authenticated
  using ((select auth.uid()) = backer_id);
grant select on public.investor_content_shares to authenticated;
create policy investor_content_shares_read_own on public.investor_content_shares for select to authenticated
  using ((select auth.uid()) = investor_id);
grant select on public.verified_actions to authenticated;
create policy verified_actions_read_own on public.verified_actions for select to authenticated
  using ((select auth.uid()) = user_id or (select auth.uid()) = contributor_id);

-- Gem ledger wallet identifiers are polymorphic text values.
grant select on public.gem_ledger_entries to authenticated;
create policy gem_ledger_entries_read_own on public.gem_ledger_entries for select to authenticated
  using ((select auth.uid()) = actor_id
    or (source_wallet_type = 'user' and source_id = (select auth.uid())::text)
    or (destination_wallet_type = 'user' and destination_id = (select auth.uid())::text));

comment on table public.piece_fee_reserves is
  'Service-only Piece fee reserve balances; no direct anon or authenticated access.';

-- Fail closed for future public-schema objects. Each later migration must opt
-- its Data API surface in with explicit grants and RLS/policies.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;
