-- Defensible Growth Hub: benefits, reserve-backed rewards, resilience, and Kickstart escrow.

alter table public.participant_tier_configs
  add column if not exists monthly_gem_allowance numeric(12,2) not null default 0,
  add column if not exists allowance_pool_percent numeric(5,4) not null default 0
    check (allowance_pool_percent between 0 and 1);

update public.participant_tier_configs set
  monthly_gem_allowance = case tier_key when 'plus' then 5 when 'pro' then 15 when 'elite' then 30 else 0 end,
  allowance_pool_percent = case tier_key when 'plus' then .05 when 'pro' then .075 when 'elite' then .10 else 0 end;

alter table public.participant_tier_configs
  drop constraint if exists participant_tier_configs_check;
alter table public.participant_tier_configs add constraint participant_tier_pool_total_check
  check (promoshare_pool_percent + liquidity_pool_percent + local_impact_pool_percent + allowance_pool_percent <= 1);

alter table public.participant_subscription_allocations
  add column if not exists allowance_pool_amount numeric(12,2) not null default 0;

create table if not exists public.membership_allowance_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tier_key text not null references public.participant_tier_configs(tier_key),
  allocation_id uuid not null unique references public.participant_subscription_allocations(id) on delete cascade,
  gems_amount numeric(12,2) not null check (gems_amount > 0),
  status text not null default 'issued' check (status in ('issued','reversed')),
  created_at timestamptz not null default now()
);

create or replace function public.issue_membership_allowance()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_amount numeric;
begin
  if new.status <> 'allocated' then return new; end if;
  select monthly_gem_allowance into v_amount from public.participant_tier_configs where tier_key=new.tier_key;
  if coalesce(v_amount,0) <= 0 then return new; end if;
  insert into public.membership_allowance_grants(user_id,tier_key,allocation_id,gems_amount)
    values(new.user_id,new.tier_key,new.id,v_amount) on conflict(allocation_id) do nothing;
  if found then
    perform public.post_economy_transaction(
      new.user_id,'gems',v_amount,'earn','membership_allowance',
      'membership-allowance:'||new.id::text,new.id,'participant_subscription_allocations',
      new.tier_key||' monthly membership allowance',jsonb_build_object('tier',new.tier_key)
    );
  end if;
  return new;
end $$;
drop trigger if exists trg_issue_membership_allowance on public.participant_subscription_allocations;
create trigger trg_issue_membership_allowance after insert or update of status
  on public.participant_subscription_allocations for each row execute function public.issue_membership_allowance();

create table if not exists public.funded_reward_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  currency text not null check(currency in ('gems','usd')),
  reserve_amount numeric(14,2) not null check(reserve_amount >= 0),
  committed_amount numeric(14,2) not null default 0 check(committed_amount >= 0),
  paid_amount numeric(14,2) not null default 0 check(paid_amount >= 0),
  reward_rate numeric(8,6) not null check(reward_rate >= 0),
  lock_days integer not null check(lock_days > 0),
  min_commitment numeric(14,2) not null default 1,
  max_commitment numeric(14,2),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft' check(status in ('draft','active','paused','settling','completed','cancelled')),
  terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check(committed_amount + paid_amount <= reserve_amount)
);

create table if not exists public.funded_reward_commitments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.funded_reward_programs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  principal numeric(14,2) not null check(principal > 0),
  reward_amount numeric(14,2) not null check(reward_amount >= 0),
  unlocks_at timestamptz not null,
  status text not null default 'locked' check(status in ('locked','claimable','paid','refunded','cancelled')),
  created_at timestamptz not null default now()
);

create or replace function public.join_funded_reward_program(p_program_id uuid,p_user_id uuid,p_principal numeric)
returns public.funded_reward_commitments language plpgsql security definer set search_path=public as $$
declare v_program public.funded_reward_programs%rowtype; v_row public.funded_reward_commitments%rowtype; v_reward numeric;
begin
  select * into v_program from public.funded_reward_programs where id=p_program_id and status='active' for update;
  if not found or now() not between v_program.starts_at and v_program.ends_at then raise exception 'Program is not accepting commitments'; end if;
  if p_principal < v_program.min_commitment or (v_program.max_commitment is not null and p_principal > v_program.max_commitment) then raise exception 'Commitment is outside program limits'; end if;
  v_reward := round(p_principal*v_program.reward_rate,2);
  if v_program.committed_amount + v_reward + v_program.paid_amount > v_program.reserve_amount then raise exception 'Program reward reserve is full'; end if;
  insert into public.funded_reward_commitments(program_id,user_id,principal,reward_amount,unlocks_at)
    values(p_program_id,p_user_id,p_principal,v_reward,now()+make_interval(days=>v_program.lock_days)) returning * into v_row;
  perform public.post_economy_transaction(
    p_user_id,v_program.currency,-p_principal,'spend','funded_reward_commitment',
    'reward-principal:'||v_row.id::text,v_row.id,'funded_reward_commitments','Reserve-backed reward commitment',jsonb_build_object('program_id',p_program_id)
  );
  update public.funded_reward_programs set committed_amount=committed_amount+v_reward where id=p_program_id;
  return v_row;
end $$;

create table if not exists public.creator_resilience_funds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null default 'gems' check(currency in ('gems','usd')),
  reserve_balance numeric(14,2) not null default 0 check(reserve_balance >= 0),
  committed_claims numeric(14,2) not null default 0 check(committed_claims >= 0),
  max_grant numeric(14,2) not null,
  status text not null default 'active' check(status in ('active','paused','closed')),
  eligibility_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check(committed_claims <= reserve_balance)
);

create table if not exists public.creator_resilience_claims (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.creator_resilience_funds(id),
  user_id uuid not null references public.users(id),
  incident_type text not null,
  requested_amount numeric(14,2) not null check(requested_amount > 0),
  approved_amount numeric(14,2),
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check(status in ('submitted','reviewing','approved','rejected','paid','cancelled')),
  review_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  paid_at timestamptz
);

create or replace function public.pay_resilience_claim(p_claim_id uuid,p_approved_amount numeric,p_reviewer_id uuid,p_notes text default null)
returns public.creator_resilience_claims language plpgsql security definer set search_path=public as $$
declare v_claim public.creator_resilience_claims%rowtype; v_fund public.creator_resilience_funds%rowtype;
begin
  select * into v_claim from public.creator_resilience_claims where id=p_claim_id and status in ('submitted','reviewing','approved') for update;
  if not found then raise exception 'Claim is not payable'; end if;
  select * into v_fund from public.creator_resilience_funds where id=v_claim.fund_id and status='active' for update;
  if p_approved_amount <= 0 or p_approved_amount > least(v_claim.requested_amount,v_fund.max_grant) then raise exception 'Invalid assistance amount'; end if;
  if p_approved_amount > v_fund.reserve_balance-v_fund.committed_claims then raise exception 'Insufficient resilience reserve'; end if;
  update public.creator_resilience_funds set reserve_balance=reserve_balance-p_approved_amount where id=v_fund.id;
  perform public.post_economy_transaction(
    v_claim.user_id,v_fund.currency,p_approved_amount,'earn','creator_resilience_grant',
    'resilience-claim:'||v_claim.id::text,v_claim.id,'creator_resilience_claims','Creator Resilience assistance grant',jsonb_build_object('reviewer_id',p_reviewer_id)
  );
  update public.creator_resilience_claims set status='paid',approved_amount=p_approved_amount,review_notes=p_notes,reviewed_at=now(),paid_at=now()
    where id=v_claim.id returning * into v_claim;
  return v_claim;
end $$;

create table if not exists public.kickstart_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id),
  title text not null,
  description text not null,
  currency text not null default 'gems' check(currency in ('gems','usd')),
  goal_amount numeric(14,2) not null check(goal_amount > 0),
  pledged_amount numeric(14,2) not null default 0 check(pledged_amount >= 0),
  released_amount numeric(14,2) not null default 0 check(released_amount >= 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft' check(status in ('draft','review','active','funded','delivery','completed','cancelled','refunding','refunded')),
  terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check(released_amount <= pledged_amount)
);

create table if not exists public.kickstart_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.kickstart_projects(id) on delete cascade,
  sequence integer not null,
  title text not null,
  release_percent numeric(5,2) not null check(release_percent > 0 and release_percent <= 100),
  proof_requirements jsonb not null default '{}'::jsonb,
  proof_submission jsonb,
  status text not null default 'pending' check(status in ('pending','submitted','approved','rejected','released')),
  released_amount numeric(14,2) not null default 0,
  unique(project_id,sequence)
);

create table if not exists public.kickstart_pledges (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.kickstart_projects(id),
  backer_id uuid not null references public.users(id),
  amount numeric(14,2) not null check(amount > 0),
  status text not null default 'escrowed' check(status in ('escrowed','partially_released','released','refund_pending','refunded')),
  created_at timestamptz not null default now()
);

create or replace function public.pledge_kickstart(p_project_id uuid,p_backer_id uuid,p_amount numeric)
returns public.kickstart_pledges language plpgsql security definer set search_path=public as $$
declare v_project public.kickstart_projects%rowtype; v_pledge public.kickstart_pledges%rowtype;
begin
  select * into v_project from public.kickstart_projects where id=p_project_id and status='active' for update;
  if not found or v_project.ends_at <= now() then raise exception 'Project is not accepting pledges'; end if;
  insert into public.kickstart_pledges(project_id,backer_id,amount)
    values(p_project_id,p_backer_id,p_amount) returning * into v_pledge;
  perform public.post_economy_transaction(
    p_backer_id,v_project.currency,-p_amount,'spend','kickstart_escrow',
    'kickstart-pledge:'||v_pledge.id::text,v_pledge.id,'kickstart_pledges','Kickstart escrow',jsonb_build_object('project_id',p_project_id)
  );
  update public.kickstart_projects set pledged_amount=pledged_amount+p_amount where id=p_project_id;
  return v_pledge;
end $$;

create or replace function public.release_kickstart_milestone(p_milestone_id uuid,p_reviewer_id uuid)
returns public.kickstart_milestones language plpgsql security definer set search_path=public as $$
declare v_milestone public.kickstart_milestones%rowtype; v_project public.kickstart_projects%rowtype; v_amount numeric;
begin
  select * into v_milestone from public.kickstart_milestones where id=p_milestone_id and status='submitted' for update;
  if not found then raise exception 'Milestone is not awaiting approval'; end if;
  select * into v_project from public.kickstart_projects where id=v_milestone.project_id for update;
  v_amount := round(v_project.pledged_amount*(v_milestone.release_percent/100),2);
  if v_project.released_amount+v_amount > v_project.pledged_amount then raise exception 'Release exceeds escrow'; end if;
  perform public.post_economy_transaction(
    v_project.owner_id,v_project.currency,v_amount,'earn','kickstart_milestone_release',
    'kickstart-release:'||v_milestone.id::text,v_milestone.id,'kickstart_milestones','Approved Kickstart milestone release',jsonb_build_object('reviewer_id',p_reviewer_id)
  );
  update public.kickstart_projects set released_amount=released_amount+v_amount,status='delivery' where id=v_project.id;
  update public.kickstart_milestones set status='released',released_amount=v_amount where id=v_milestone.id returning * into v_milestone;
  return v_milestone;
end $$;

create or replace function public.refund_kickstart_project(p_project_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_project public.kickstart_projects%rowtype; v_pledge public.kickstart_pledges%rowtype; v_count integer:=0; v_refund numeric;
begin
  select * into v_project from public.kickstart_projects where id=p_project_id and status in ('cancelled','refunding') for update;
  if not found then raise exception 'Project is not refundable'; end if;
  for v_pledge in select * from public.kickstart_pledges where project_id=p_project_id and status in ('escrowed','partially_released') for update loop
    v_refund := greatest(0,round(v_pledge.amount*(1-(v_project.released_amount/nullif(v_project.pledged_amount,0))),2));
    if v_refund>0 then
      perform public.post_economy_transaction(
        v_pledge.backer_id,v_project.currency,v_refund,'refund','kickstart_refund',
        'kickstart-refund:'||v_pledge.id::text,v_pledge.id,'kickstart_pledges','Kickstart escrow refund',jsonb_build_object('project_id',p_project_id)
      );
    end if;
    update public.kickstart_pledges set status='refunded' where id=v_pledge.id; v_count:=v_count+1;
  end loop;
  update public.kickstart_projects set status='refunded' where id=p_project_id;
  return v_count;
end $$;

alter table public.membership_allowance_grants enable row level security;
alter table public.funded_reward_commitments enable row level security;
alter table public.creator_resilience_claims enable row level security;
alter table public.kickstart_pledges enable row level security;
create policy "Users read own allowances" on public.membership_allowance_grants for select using(auth.uid()=user_id);
create policy "Users read own commitments" on public.funded_reward_commitments for select using(auth.uid()=user_id);
create policy "Users read own resilience claims" on public.creator_resilience_claims for select using(auth.uid()=user_id);
create policy "Users read own Kickstart pledges" on public.kickstart_pledges for select using(auth.uid()=backer_id);

revoke all on function public.pledge_kickstart(uuid,uuid,numeric) from public;
grant execute on function public.pledge_kickstart(uuid,uuid,numeric) to service_role;
revoke all on function public.join_funded_reward_program(uuid,uuid,numeric) from public;
revoke all on function public.pay_resilience_claim(uuid,numeric,uuid,text) from public;
revoke all on function public.release_kickstart_milestone(uuid,uuid) from public;
revoke all on function public.refund_kickstart_project(uuid) from public;
grant execute on function public.join_funded_reward_program(uuid,uuid,numeric) to service_role;
grant execute on function public.pay_resilience_claim(uuid,numeric,uuid,text) to service_role;
grant execute on function public.release_kickstart_milestone(uuid,uuid) to service_role;
grant execute on function public.refund_kickstart_project(uuid) to service_role;
