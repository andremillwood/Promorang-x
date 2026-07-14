-- Gem wallet actions.
-- Canonical rule: 1 Gem = 1 USD of platform value.

create or replace function public.request_gem_withdrawal(p_gems_amount numeric, p_payout_note text default null)
returns public.gem_withdrawal_requests
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_row public.gem_withdrawal_requests%rowtype;
begin
  if v_user is null then raise exception 'Sign in to request a Gem withdrawal'; end if;
  if p_gems_amount <= 0 then raise exception 'Gem amount must be positive'; end if;
  if p_gems_amount < 250 then raise exception 'Withdrawals start at 250 Gems'; end if;

  perform public.post_economy_transaction(
    v_user,
    'gems',
    -p_gems_amount,
    'spend',
    'gem_withdrawal_request',
    'gem-withdrawal:' || v_user::text || ':' || gen_random_uuid()::text,
    null,
    'gem_withdrawal_requests',
    'Request Gem withdrawal',
    jsonb_build_object('usd_equivalent', p_gems_amount)
  );

  insert into public.gem_withdrawal_requests(user_id, gems_amount, usd_amount, status, metadata)
    values(
      v_user,
      p_gems_amount,
      p_gems_amount,
      'requested',
      jsonb_build_object('payout_note', nullif(trim(coalesce(p_payout_note, '')), ''))
    )
    returning * into v_row;

  return v_row;
end $$;

create or replace function public.cancel_requested_gem_withdrawal(p_request_id uuid)
returns public.gem_withdrawal_requests
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_row public.gem_withdrawal_requests%rowtype;
begin
  if v_user is null then raise exception 'Sign in to cancel a Gem withdrawal'; end if;

  select * into v_row
  from public.gem_withdrawal_requests
  where id = p_request_id
    and user_id = v_user
    and status in ('requested', 'reviewing')
  for update;

  if not found then raise exception 'This withdrawal cannot be cancelled'; end if;

  perform public.post_economy_transaction(
    v_user,
    'gems',
    v_row.gems_amount,
    'refund',
    'gem_withdrawal_cancelled',
    'gem-withdrawal-cancel:' || v_row.id::text,
    v_row.id,
    'gem_withdrawal_requests',
    'Cancelled Gem withdrawal request',
    jsonb_build_object('usd_equivalent', v_row.gems_amount)
  );

  update public.gem_withdrawal_requests
    set status = 'cancelled', updated_at = now()
    where id = v_row.id
    returning * into v_row;

  return v_row;
end $$;

drop policy if exists "Users create own Gem withdrawals" on public.gem_withdrawal_requests;
create policy "Users create own Gem withdrawals" on public.gem_withdrawal_requests
  for insert with check (user_id = auth.uid());

grant execute on function public.request_gem_withdrawal(numeric,text) to authenticated;
grant execute on function public.cancel_requested_gem_withdrawal(uuid) to authenticated;

notify pgrst,'reload schema';
