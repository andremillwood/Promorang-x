-- Activation commerce orchestration.
-- Payment capture remains the responsibility of a verified server/payment provider.
-- Client users can plan, offer, claim free access, and see state; they cannot
-- self-verify paid funding, paid access, refunds, or payouts.

create extension if not exists pgcrypto;

create table if not exists public.activation_access_tiers (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  moment_id uuid references public.moments(id) on delete cascade,
  name text not null,
  description text,
  access_type text not null check (access_type in ('free', 'paid', 'invite', 'earned', 'reward', 'draw')),
  price numeric(14,2) not null default 0 check (price >= 0),
  currency text not null default 'JMD',
  capacity integer check (capacity is null or capacity > 0),
  issued_count integer not null default 0 check (issued_count >= 0),
  per_user_limit integer not null default 1 check (per_user_limit > 0),
  eligibility_summary text,
  reward_summary text,
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'open', 'paused', 'sold_out', 'closed', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (access_type <> 'paid' or price > 0),
  check (capacity is null or issued_count <= capacity)
);

create table if not exists public.activation_access_passes (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.activation_access_tiers(id) on delete cascade,
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  moment_id uuid references public.moments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  pass_code text not null unique default encode(gen_random_bytes(12), 'hex'),
  status text not null default 'reserved' check (status in ('reserved', 'active', 'used', 'cancelled', 'refunded', 'expired')),
  amount_paid numeric(14,2) not null default 0 check (amount_paid >= 0),
  currency text not null default 'JMD',
  payment_reference text,
  source text not null default 'claim' check (source in ('claim', 'purchase', 'invitation', 'reward', 'draw', 'admin')),
  issued_at timestamptz not null default now(),
  activated_at timestamptz,
  used_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_activation_pass_user_tier_active
  on public.activation_access_passes(tier_id, user_id)
  where status in ('reserved', 'active', 'used');
create index if not exists idx_activation_access_proposal on public.activation_access_tiers(proposal_id, status);
create index if not exists idx_activation_pass_user on public.activation_access_passes(user_id, status, issued_at desc);
create index if not exists idx_activation_pass_moment on public.activation_access_passes(moment_id, status);

create table if not exists public.activation_funding_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  contribution_id uuid references public.activation_contributions(id) on delete set null,
  payer_user_id uuid references auth.users(id) on delete set null,
  payer_organization_id uuid references public.organizations(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'JMD',
  event_type text not null check (event_type in ('authorized', 'captured', 'failed', 'refunded', 'partially_refunded', 'chargeback')),
  provider text not null,
  provider_reference text not null,
  verified_by text not null default 'server',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(provider, provider_reference, event_type)
);

create table if not exists public.activation_payout_allocations (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  moment_id uuid references public.moments(id) on delete cascade,
  collaborator_id uuid references public.activation_collaborators(id) on delete set null,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'JMD',
  release_condition text not null,
  status text not null default 'planned' check (status in ('planned', 'funded', 'earned', 'queued', 'paid', 'cancelled', 'disputed')),
  proof_submission_id uuid references public.proof_submissions(id) on delete set null,
  manual_payout_id uuid references public.manual_payout_queue(id) on delete set null,
  due_at timestamptz,
  earned_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activation_resolution_cases (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  moment_id uuid references public.moments(id) on delete set null,
  opened_by uuid not null references auth.users(id) on delete cascade,
  against_user_id uuid references auth.users(id) on delete set null,
  case_type text not null check (case_type in ('cancellation', 'refund', 'access', 'contribution', 'content', 'payout', 'safety', 'other')),
  title text not null,
  description text not null,
  requested_resolution text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'waiting_on_user', 'resolved', 'declined', 'closed')),
  resolution_summary text,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_activation_funding_proposal on public.activation_funding_events(proposal_id, occurred_at desc);
create index if not exists idx_activation_payout_proposal on public.activation_payout_allocations(proposal_id, status);
create index if not exists idx_activation_payout_recipient on public.activation_payout_allocations(recipient_user_id, status, due_at);
create index if not exists idx_activation_resolution_proposal on public.activation_resolution_cases(proposal_id, status, created_at desc);
create index if not exists idx_activation_resolution_opener on public.activation_resolution_cases(opened_by, status, created_at desc);

create or replace function public.claim_free_activation_access(p_tier_id uuid)
returns public.activation_access_passes
language plpgsql security definer set search_path = public as $$
declare v_tier public.activation_access_tiers%rowtype; v_pass public.activation_access_passes%rowtype; v_existing_count integer;
begin
  select * into v_tier from public.activation_access_tiers where id = p_tier_id and status = 'open' for update;
  if not found then raise exception 'This access option is not open'; end if;
  if v_tier.access_type <> 'free' or v_tier.price <> 0 then raise exception 'Paid, invited, earned, reward, and draw access must be issued through their verified path'; end if;
  if v_tier.sales_start_at is not null and now() < v_tier.sales_start_at then raise exception 'Access is not open yet'; end if;
  if v_tier.sales_end_at is not null and now() > v_tier.sales_end_at then raise exception 'Access has closed'; end if;
  if v_tier.capacity is not null and v_tier.issued_count >= v_tier.capacity then raise exception 'This access option is full'; end if;
  select count(*) into v_existing_count from public.activation_access_passes where tier_id = p_tier_id and user_id = auth.uid() and status in ('reserved','active','used');
  if v_existing_count >= v_tier.per_user_limit then raise exception 'You already have the available access for this option'; end if;
  insert into public.activation_access_passes(tier_id, proposal_id, moment_id, user_id, status, source, activated_at)
    values(v_tier.id, v_tier.proposal_id, v_tier.moment_id, auth.uid(), 'active', 'claim', now()) returning * into v_pass;
  update public.activation_access_tiers set issued_count = issued_count + 1, status = case when capacity is not null and issued_count + 1 >= capacity then 'sold_out' else status end, updated_at = now() where id = v_tier.id;
  return v_pass;
end $$;

create or replace function public.queue_activation_payout(p_allocation_id uuid)
returns public.activation_payout_allocations
language plpgsql security definer set search_path = public as $$
declare v_allocation public.activation_payout_allocations%rowtype; v_queue public.manual_payout_queue%rowtype;
begin
  select * into v_allocation from public.activation_payout_allocations where id = p_allocation_id and status = 'earned' for update;
  if not found then raise exception 'This payout is not ready to queue'; end if;
  if not public.can_manage_activation(v_allocation.proposal_id) then raise exception 'Not authorized to queue this payout'; end if;
  if v_allocation.moment_id is null then raise exception 'A Moment must be connected before payout'; end if;
  insert into public.manual_payout_queue(moment_id, user_id, proof_submission_id, amount_jmd, notes)
    values(v_allocation.moment_id, v_allocation.recipient_user_id, v_allocation.proof_submission_id, v_allocation.amount, v_allocation.purpose)
    returning * into v_queue;
  update public.activation_payout_allocations set status = 'queued', manual_payout_id = v_queue.id, updated_at = now() where id = p_allocation_id returning * into v_allocation;
  return v_allocation;
end $$;

create or replace function public.record_verified_activation_funding(
  p_proposal_id uuid, p_contribution_id uuid, p_payer_user_id uuid,
  p_payer_organization_id uuid, p_amount numeric, p_currency text,
  p_provider text, p_provider_reference text
) returns public.activation_funding_events
language plpgsql security definer set search_path = public as $$
declare v_event public.activation_funding_events%rowtype; v_moment_id uuid;
begin
  if p_amount <= 0 then raise exception 'Funding amount must be positive'; end if;
  select target_moment_id into v_moment_id from public.proposals where id = p_proposal_id;
  insert into public.activation_funding_events(proposal_id, contribution_id, payer_user_id, payer_organization_id, amount, currency, event_type, provider, provider_reference)
    values(p_proposal_id, p_contribution_id, p_payer_user_id, p_payer_organization_id, p_amount, p_currency, 'captured', p_provider, p_provider_reference)
    returning * into v_event;
  if p_contribution_id is not null then update public.activation_contributions set status = 'received', fulfilled_at = now(), updated_at = now() where id = p_contribution_id; end if;
  if v_moment_id is not null and upper(p_currency) = 'JMD' then
    insert into public.moment_economics(moment_id, money_source, total_funded_jmd, funding_status)
      values(v_moment_id, 'hybrid', p_amount, 'funded')
      on conflict(moment_id) do update set total_funded_jmd = public.moment_economics.total_funded_jmd + excluded.total_funded_jmd, funding_status = 'funded', updated_at = now();
    insert into public.moment_ledger(moment_id, type, amount_jmd, user_id, reference, metadata)
      values(v_moment_id, 'inflow', p_amount, p_payer_user_id, p_provider_reference, jsonb_build_object('proposal_id', p_proposal_id, 'funding_event_id', v_event.id));
  end if;
  return v_event;
end $$;

alter table public.activation_access_tiers enable row level security;
alter table public.activation_access_passes enable row level security;
alter table public.activation_funding_events enable row level security;
alter table public.activation_payout_allocations enable row level security;
alter table public.activation_resolution_cases enable row level security;

drop policy if exists "People read open activation access" on public.activation_access_tiers;
create policy "People read open activation access" on public.activation_access_tiers for select using (status in ('open','sold_out','closed') or public.can_manage_activation(proposal_id));
drop policy if exists "Managers create activation access" on public.activation_access_tiers;
create policy "Managers create activation access" on public.activation_access_tiers for insert with check (public.can_manage_activation(proposal_id));
drop policy if exists "Managers update activation access" on public.activation_access_tiers;
create policy "Managers update activation access" on public.activation_access_tiers for update using (public.can_manage_activation(proposal_id));

drop policy if exists "People read own activation passes" on public.activation_access_passes;
create policy "People read own activation passes" on public.activation_access_passes for select using (user_id = auth.uid() or public.can_manage_activation(proposal_id));

drop policy if exists "Stakeholders read verified activation funding" on public.activation_funding_events;
create policy "Stakeholders read verified activation funding" on public.activation_funding_events for select using (public.can_manage_activation(proposal_id) or payer_user_id = auth.uid() or exists (select 1 from public.organization_members om where om.organization_id = payer_organization_id and om.user_id = auth.uid()));

drop policy if exists "Stakeholders read activation payouts" on public.activation_payout_allocations;
create policy "Stakeholders read activation payouts" on public.activation_payout_allocations for select using (recipient_user_id = auth.uid() or public.can_manage_activation(proposal_id));
drop policy if exists "Managers plan activation payouts" on public.activation_payout_allocations;
create policy "Managers plan activation payouts" on public.activation_payout_allocations for insert with check (public.can_manage_activation(proposal_id));
drop policy if exists "Managers update planned activation payouts" on public.activation_payout_allocations;
create policy "Managers update planned activation payouts" on public.activation_payout_allocations for update using (public.can_manage_activation(proposal_id) and status in ('planned','funded','earned','cancelled','disputed'));

drop policy if exists "Stakeholders read activation resolution cases" on public.activation_resolution_cases;
create policy "Stakeholders read activation resolution cases" on public.activation_resolution_cases for select using (opened_by = auth.uid() or against_user_id = auth.uid() or public.can_manage_activation(proposal_id));
drop policy if exists "Stakeholders open activation resolution cases" on public.activation_resolution_cases;
create policy "Stakeholders open activation resolution cases" on public.activation_resolution_cases for insert with check (opened_by = auth.uid() and (public.can_manage_activation(proposal_id) or exists (select 1 from public.activation_access_passes ap where ap.proposal_id = activation_resolution_cases.proposal_id and ap.user_id = auth.uid())));

grant execute on function public.claim_free_activation_access(uuid) to authenticated;
grant execute on function public.queue_activation_payout(uuid) to authenticated;
revoke all on function public.record_verified_activation_funding(uuid, uuid, uuid, uuid, numeric, text, text, text) from public, anon, authenticated;
grant execute on function public.record_verified_activation_funding(uuid, uuid, uuid, uuid, numeric, text, text, text) to service_role;

notify pgrst, 'reload schema';
