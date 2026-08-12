-- One authoritative path from a saved campaign plan into Activation Studio,
-- with server-enforced lifecycle and Gem funding truth.

alter table public.campaigns
  add column if not exists compiler_metadata jsonb not null default '{}'::jsonb;

create or replace function public.open_campaign_activation(p_campaign_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign public.campaigns%rowtype;
  v_proposal_id uuid;
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Sign in to continue shaping this activation';
  end if;

  select * into v_campaign
  from public.campaigns
  where id = p_campaign_id
  for update;

  if not found then
    raise exception 'Campaign plan not found';
  end if;

  if v_campaign.brand_id <> v_user then
    raise exception 'You cannot manage this campaign plan';
  end if;

  if v_campaign.activation_proposal_id is not null then
    return v_campaign.activation_proposal_id;
  end if;

  insert into public.proposals (
    planner_id,
    title,
    description,
    budget,
    funding_goal_gems,
    status,
    lifecycle_state,
    metadata
  ) values (
    v_user,
    v_campaign.title,
    v_campaign.description,
    null,
    null,
    'draft',
    'shaping',
    coalesce(v_campaign.compiler_metadata, '{}'::jsonb) || jsonb_build_object(
      'campaign_id', v_campaign.id,
      'source', 'campaign_plan',
      'value_unit', 'GEM',
      'funding_status', 'unfunded',
      'activation_status', 'draft',
      'outcome_detail', coalesce(
        v_campaign.compiler_metadata->>'original_prompt',
        v_campaign.compiler_metadata#>>'{normalizedIntent,cleanedInput}',
        v_campaign.description
      ),
      'what_counts', coalesce(
        v_campaign.compiler_metadata->>'proof_requirement',
        'The proof requirement must be agreed before people are invited.'
      ),
      'participant_value', jsonb_build_array(
        coalesce(v_campaign.reward_value, 'Participant value must be agreed before funding.')
      )
    )
  ) returning id into v_proposal_id;

  update public.campaigns
  set activation_proposal_id = v_proposal_id,
      is_active = false,
      updated_at = now(),
      compiler_metadata = coalesce(compiler_metadata, '{}'::jsonb) || jsonb_build_object(
        'activation_proposal_id', v_proposal_id,
        'activation_status', 'draft',
        'funding_status', 'unfunded'
      )
  where id = p_campaign_id;

  return v_proposal_id;
end;
$$;

create or replace function public.sync_campaign_activation_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.campaigns
  set is_active = (new.lifecycle_state = 'live'),
      moment_id = coalesce(new.target_moment_id, moment_id),
      updated_at = now(),
      compiler_metadata = coalesce(compiler_metadata, '{}'::jsonb) || jsonb_build_object(
        'activation_status', new.lifecycle_state,
        'funding_status', case
          when new.lifecycle_state in ('funded','live','completed','reviewed') then 'funded'
          when new.lifecycle_state = 'funding' then 'securing'
          else 'unfunded'
        end,
        'activation_proposal_id', new.id
      )
  where activation_proposal_id = new.id;
  return new;
end;
$$;

create or replace function public.guard_activation_lifecycle_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.lifecycle_state is distinct from old.lifecycle_state
     and coalesce(current_setting('promorang.lifecycle_move', true), 'off') <> 'on' then
    raise exception 'Use the activation lifecycle action to change this state';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_activation_lifecycle_update on public.proposals;
create trigger trg_guard_activation_lifecycle_update
before update of lifecycle_state on public.proposals
for each row execute function public.guard_activation_lifecycle_update();

drop trigger if exists trg_sync_campaign_activation_lifecycle on public.proposals;
create trigger trg_sync_campaign_activation_lifecycle
after update of lifecycle_state, target_moment_id on public.proposals
for each row execute function public.sync_campaign_activation_lifecycle();

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
begin
  if not public.can_manage_activation(p_proposal_id) then
    raise exception 'Not authorized to move this activation';
  end if;

  select lifecycle_state, funding_goal_gems
  into v_from, v_goal
  from public.proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'Activation not found';
  end if;

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
    if coalesce(v_goal, 0) <= 0 then
      raise exception 'Agree a positive Gem funding goal before confirming funding';
    end if;
    select coalesce(secured_gems - released_gems - refunded_gems, 0)
    into v_secured
    from public.activation_gem_reserves
    where proposal_id = p_proposal_id;
    if coalesce(v_secured, 0) < v_goal then
      raise exception 'Secured Gems must meet the funding goal';
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

-- Bring already-linked plans onto the same display truth as their activation.
update public.campaigns as campaign
set is_active = (proposal.lifecycle_state = 'live'),
    moment_id = coalesce(proposal.target_moment_id, campaign.moment_id),
    updated_at = now(),
    compiler_metadata = coalesce(campaign.compiler_metadata, '{}'::jsonb) || jsonb_build_object(
      'activation_status', proposal.lifecycle_state,
      'funding_status', case
        when proposal.lifecycle_state in ('funded','live','completed','reviewed') then 'funded'
        when proposal.lifecycle_state = 'funding' then 'securing'
        else 'unfunded'
      end,
      'activation_proposal_id', proposal.id
    )
from public.proposals as proposal
where campaign.activation_proposal_id = proposal.id;

revoke all on function public.open_campaign_activation(uuid) from public;
grant execute on function public.open_campaign_activation(uuid) to authenticated;
revoke all on function public.move_activation(uuid, text, text) from public;
grant execute on function public.move_activation(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
