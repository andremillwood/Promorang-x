-- Funding is one way to secure an activation promise, not the definition of
-- activation readiness. Support attendance, IRL access, sponsored coupons,
-- in-kind value, Gem funding, and hybrid value without inventing Gem budgets.

create table if not exists public.activation_value_commitments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  commitment_type text not null check (commitment_type in (
    'attendance', 'access', 'coupon', 'product', 'service', 'venue', 'in_kind', 'other'
  )),
  provider_name text not null,
  fulfiller_name text,
  summary text not null,
  terms text,
  quantity integer check (quantity is null or quantity > 0),
  face_value numeric(14,2) check (face_value is null or face_value >= 0),
  currency text,
  valid_from timestamptz,
  valid_until timestamptz,
  status text not null default 'draft' check (status in (
    'draft', 'offered', 'confirmed', 'active', 'exhausted', 'fulfilled', 'cancelled'
  )),
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_activation_value_commitments_proposal
  on public.activation_value_commitments(proposal_id, status, commitment_type);

alter table public.activation_value_commitments enable row level security;

drop policy if exists "Activation stakeholders read value commitments"
  on public.activation_value_commitments;
create policy "Activation stakeholders read value commitments"
on public.activation_value_commitments for select
using (public.can_view_activation(proposal_id));

drop policy if exists "Activation managers create value commitments"
  on public.activation_value_commitments;
create policy "Activation managers create value commitments"
on public.activation_value_commitments for insert
with check (public.can_manage_activation(proposal_id));

drop policy if exists "Activation managers update value commitments"
  on public.activation_value_commitments;
create policy "Activation managers update value commitments"
on public.activation_value_commitments for update
using (public.can_manage_activation(proposal_id))
with check (public.can_manage_activation(proposal_id));

create or replace function public.set_activation_value_model(
  p_proposal_id uuid,
  p_value_model text,
  p_participant_value_summary text
) returns public.proposals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.proposals%rowtype;
begin
  if not public.can_manage_activation(p_proposal_id) then
    raise exception 'Not authorized to set activation value';
  end if;

  if p_value_model not in (
    'attendance_only', 'irl_access', 'sponsored_coupon',
    'in_kind', 'gem_funded', 'hybrid'
  ) then
    raise exception 'Invalid activation value model';
  end if;

  if nullif(trim(p_participant_value_summary), '') is null then
    raise exception 'Describe what participants receive or experience';
  end if;

  update public.proposals
  set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'value_model', p_value_model,
        'participant_value_summary', trim(p_participant_value_summary)
      ),
      funding_goal_gems = case
        when p_value_model in ('gem_funded', 'hybrid') then funding_goal_gems
        else null
      end,
      updated_at = now()
  where id = p_proposal_id
  returning * into v_row;

  if not found then raise exception 'Activation not found'; end if;
  return v_row;
end;
$$;

create or replace function public.confirm_activation_value_commitment(
  p_commitment_id uuid
) returns public.activation_value_commitments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.activation_value_commitments%rowtype;
begin
  update public.activation_value_commitments
  set status = 'confirmed',
      confirmed_by = auth.uid(),
      confirmed_at = now(),
      updated_at = now()
  where id = p_commitment_id
    and public.can_manage_activation(proposal_id)
    and status in ('draft', 'offered')
  returning * into v_row;

  if not found then raise exception 'Commitment is not available to confirm'; end if;
  return v_row;
end;
$$;

create or replace function public.move_activation(
  p_proposal_id uuid, p_to_state text, p_note text default null
) returns public.proposals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.proposals%rowtype;
  v_from text;
  v_goal numeric;
  v_secured numeric;
  v_model text;
  v_summary text;
  v_confirmed_commitments integer;
  v_access_paths integer;
begin
  if not public.can_manage_activation(p_proposal_id) then
    raise exception 'Not authorized to move this activation';
  end if;

  select lifecycle_state,
         funding_goal_gems,
         coalesce(metadata ->> 'value_model', 'gem_funded'),
         metadata ->> 'participant_value_summary'
  into v_from, v_goal, v_model, v_summary
  from public.proposals
  where id = p_proposal_id
  for update;

  if not found then raise exception 'Activation not found'; end if;

  if not (
    (v_from = 'shaping' and p_to_state in ('inviting','cancelled')) or
    (v_from = 'inviting' and p_to_state in ('awaiting_responses','paused','cancelled')) or
    (v_from = 'awaiting_responses' and p_to_state in ('aligned','paused','cancelled')) or
    (v_from = 'aligned' and p_to_state in ('funding','paused','cancelled')) or
    (v_from = 'funding' and p_to_state in ('funded','paused','cancelled')) or
    (v_from = 'funded' and p_to_state in ('live','paused','cancelled')) or
    (v_from = 'live' and p_to_state in ('completed','paused','cancelled')) or
    (v_from = 'completed' and p_to_state = 'reviewed') or
    (v_from = 'paused' and p_to_state in ('aligned','funding','funded','cancelled'))
  ) then
    raise exception 'Invalid activation transition from % to %', v_from, p_to_state;
  end if;

  if p_to_state in ('funded', 'live') then
    if nullif(trim(v_summary), '') is null then
      raise exception 'Describe the participant value before securing promises';
    end if;

    select count(*) into v_confirmed_commitments
    from public.activation_value_commitments
    where proposal_id = p_proposal_id
      and status in ('confirmed', 'active', 'fulfilled');

    select count(*) into v_access_paths
    from public.activation_access_tiers
    where proposal_id = p_proposal_id
      and status in ('open', 'sold_out', 'closed');

    if v_model = 'attendance_only' then
      null; -- The Moment itself is the promised value.
    elsif v_model = 'irl_access' then
      if v_access_paths = 0 and v_confirmed_commitments = 0 then
        raise exception 'Confirm an access path or IRL value commitment';
      end if;
    elsif v_model in ('sponsored_coupon', 'in_kind') then
      if v_confirmed_commitments = 0 then
        raise exception 'Confirm the sponsor or partner commitment';
      end if;
    elsif v_model = 'hybrid' then
      if v_confirmed_commitments = 0 and coalesce(v_goal, 0) <= 0 then
        raise exception 'Secure at least one partner commitment or Gem reserve';
      end if;
    end if;

    if v_model in ('gem_funded', 'hybrid') and coalesce(v_goal, 0) > 0 then
      select coalesce(secured_gems - released_gems - refunded_gems, 0)
      into v_secured
      from public.activation_gem_reserves
      where proposal_id = p_proposal_id;
      if coalesce(v_secured, 0) < v_goal then
        raise exception 'Secured Gems must meet the optional Gem goal';
      end if;
    elsif v_model = 'gem_funded' then
      raise exception 'Agree a positive Gem funding goal for a Gem-funded activation';
    end if;
  end if;

  perform set_config('promorang.lifecycle_move', 'on', true);

  update public.proposals
  set lifecycle_state = p_to_state,
      updated_at = now(),
      launched_at = case when p_to_state = 'live' then coalesce(launched_at, now()) else launched_at end,
      completed_at = case when p_to_state = 'completed' then coalesce(completed_at, now()) else completed_at end
  where id = p_proposal_id
  returning * into v_row;

  insert into public.activation_status_history(proposal_id, changed_by, from_state, to_state, note)
  values (p_proposal_id, auth.uid(), v_from, p_to_state, p_note);

  return v_row;
end;
$$;

grant execute on function public.set_activation_value_model(uuid, text, text) to authenticated;
grant execute on function public.confirm_activation_value_commitment(uuid) to authenticated;
grant execute on function public.move_activation(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
