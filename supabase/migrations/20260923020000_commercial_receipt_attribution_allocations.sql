-- Universal commerce receipt → attribution → allocation adapter.
-- Extends canonical receipts and activation payouts; does not create a second wallet.

alter table public.commerce_receipts
  add column if not exists proposal_id uuid references public.proposals(id) on delete set null,
  add column if not exists promopush_campaign_id uuid references public.promopush_campaigns(id) on delete set null,
  add column if not exists promopush_channel_id uuid references public.promopush_channels(id) on delete set null,
  add column if not exists referral_code text,
  add column if not exists source_receipt_id uuid references public.commerce_receipts(id) on delete set null;

alter table public.activation_value_commitments
  add column if not exists offer_id uuid references public.offers(id) on delete set null,
  add column if not exists access_tier_id uuid references public.activation_access_tiers(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists commerce_receipts_proposal_idx on public.commerce_receipts(proposal_id, occurred_at desc);
create index if not exists commerce_receipts_promopush_idx on public.commerce_receipts(promopush_campaign_id, promopush_channel_id, occurred_at desc);
create index if not exists activation_value_commitments_offer_idx on public.activation_value_commitments(offer_id) where offer_id is not null;

create table if not exists public.commercial_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  demand_response_enabled boolean not null default false,
  activation_lifecycle_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.commercial_notification_preferences enable row level security;
drop policy if exists "People manage commercial notification consent" on public.commercial_notification_preferences;
create policy "People manage commercial notification consent" on public.commercial_notification_preferences for all
  using (user_id=auth.uid()) with check (user_id=auth.uid());
grant select, insert, update on public.commercial_notification_preferences to authenticated;
grant all on public.commercial_notification_preferences to service_role;

create table if not exists public.demand_activation_responses (
  id uuid primary key default gen_random_uuid(),
  discovery_id uuid not null references public.discovery_questions(id) on delete cascade,
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  response_summary text not null,
  route text not null,
  created_by uuid not null references auth.users(id) on delete cascade default auth.uid(),
  published_at timestamptz not null default now(),
  unique(discovery_id, proposal_id)
);
alter table public.demand_activation_responses enable row level security;
create policy "People read published demand responses" on public.demand_activation_responses for select using (true);
create policy "Activation managers publish demand responses" on public.demand_activation_responses for insert with check (public.can_manage_activation(proposal_id));
grant select, insert on public.demand_activation_responses to authenticated;

create or replace function public.notify_activation_lifecycle_changed()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.lifecycle_state is not distinct from old.lifecycle_state then return new; end if;
  insert into public.notifications(user_id,notification_type,type,title,message,related_id,is_read,dedupe_key,action_url,route,metadata)
  select recipients.user_id,'order_update','activation_lifecycle',
    'An activation moved forward',
    new.title || ' is now ' || replace(new.lifecycle_state,'_',' ') || '.',
    new.id,false,
    'activation-lifecycle:'||new.id::text||':'||new.lifecycle_state||':'||recipients.user_id::text,
    '/dashboard/proposals/'||new.id::text,'/dashboard/proposals/'||new.id::text,
    jsonb_build_object('proposal_id',new.id,'lifecycle_state',new.lifecycle_state,'consent_kind','activation_lifecycle')
  from (
    select new.planner_id as user_id
    union
    select invited_user_id from public.activation_collaborators where proposal_id=new.id and status='accepted'
  ) recipients
  left join public.commercial_notification_preferences prefs on prefs.user_id=recipients.user_id
  where recipients.user_id is not null and coalesce(prefs.activation_lifecycle_enabled,true)
  on conflict(dedupe_key) do nothing;
  return new;
end $$;
drop trigger if exists trg_notify_activation_lifecycle_changed on public.proposals;
create trigger trg_notify_activation_lifecycle_changed after update of lifecycle_state on public.proposals for each row execute function public.notify_activation_lifecycle_changed();

create or replace function public.publish_demand_activation_response(p_discovery_id uuid,p_proposal_id uuid,p_summary text,p_route text)
returns public.demand_activation_responses language plpgsql security definer set search_path=public as $$
declare result public.demand_activation_responses%rowtype;
begin
  if not public.can_manage_activation(p_proposal_id) then raise exception 'Not authorized'; end if;
  if nullif(trim(p_summary),'') is null or nullif(trim(p_route),'') is null then raise exception 'Response summary and route are required'; end if;
  insert into public.demand_activation_responses(discovery_id,proposal_id,response_summary,route)
  values(p_discovery_id,p_proposal_id,trim(p_summary),trim(p_route))
  on conflict(discovery_id,proposal_id) do update set response_summary=excluded.response_summary,route=excluded.route,published_at=now()
  returning * into result;
  insert into public.notifications(user_id,notification_type,type,title,message,related_id,is_read,dedupe_key,action_url,route,metadata)
  select vote.user_id,'market_watch_changed','demand_response_available','Something you wanted has a response',result.response_summary,result.proposal_id,false,
    'demand-response:'||result.discovery_id::text||':'||result.proposal_id::text||':'||vote.user_id::text,
    result.route,result.route,jsonb_build_object('discovery_id',result.discovery_id,'proposal_id',result.proposal_id,'consent_kind','demand_response')
  from public.discovery_votes vote
  join public.commercial_notification_preferences prefs on prefs.user_id=vote.user_id and prefs.demand_response_enabled=true
  where vote.discovery_id=result.discovery_id
  on conflict(dedupe_key) do nothing;
  return result;
end $$;
grant execute on function public.publish_demand_activation_response(uuid,uuid,text,text) to authenticated;

create table if not exists public.activation_commercial_rules (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  bucket text not null check (bucket in ('platform_revenue','participant_value','distribution','media','service_provider','agency','operator','tax','other_fulfillment')),
  recipient_user_id uuid references auth.users(id) on delete set null,
  amount numeric(14,2) check (amount is null or amount > 0),
  percentage numeric(7,4) check (percentage is null or (percentage > 0 and percentage <= 100)),
  currency text,
  required_evidence text not null default 'purchase' check (required_evidence in ('view','vote','want','share','rsvp','reservation','purchase','attendance','redemption','repeat_purchase')),
  funded boolean not null default false,
  active boolean not null default true,
  terms text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((amount is not null)::integer + (percentage is not null)::integer = 1),
  check (bucket not in ('distributor','service_provider','agency','operator') or recipient_user_id is not null)
);

-- distributor is added separately to keep this migration safe on databases that
-- may already contain the table from a preview environment.
alter table public.activation_commercial_rules drop constraint if exists activation_commercial_rules_bucket_check;
alter table public.activation_commercial_rules add constraint activation_commercial_rules_bucket_check
  check (bucket in ('platform_revenue','participant_value','distribution','distributor','media','service_provider','agency','operator','tax','other_fulfillment'));

create table if not exists public.activation_commercial_allocations (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  receipt_id uuid not null references public.commerce_receipts(id) on delete cascade,
  rule_id uuid not null references public.activation_commercial_rules(id) on delete restrict,
  payout_allocation_id uuid references public.activation_payout_allocations(id) on delete set null,
  reversed_by_receipt_id uuid references public.commerce_receipts(id) on delete set null,
  bucket text not null,
  recipient_user_id uuid references auth.users(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null,
  evidence_level text not null check (evidence_level in ('reservation','purchase','attendance','redemption','repeat_purchase')),
  status text not null default 'earned' check (status in ('planned','reserved','earned','paid','reversed','disputed')),
  earned_at timestamptz,
  paid_at timestamptz,
  reversed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(receipt_id, rule_id)
);

create index if not exists activation_commercial_rules_proposal_idx on public.activation_commercial_rules(proposal_id, active);
create index if not exists activation_commercial_allocations_proposal_idx on public.activation_commercial_allocations(proposal_id, status, created_at desc);

alter table public.activation_commercial_rules enable row level security;
alter table public.activation_commercial_allocations enable row level security;

drop policy if exists "Activation managers read commercial rules" on public.activation_commercial_rules;
create policy "Activation managers read commercial rules" on public.activation_commercial_rules for select using (public.can_manage_activation(proposal_id));
drop policy if exists "Activation managers manage commercial rules" on public.activation_commercial_rules;
create policy "Activation managers manage commercial rules" on public.activation_commercial_rules for all using (public.can_manage_activation(proposal_id)) with check (public.can_manage_activation(proposal_id));

drop policy if exists "Stakeholders read relevant commercial allocations" on public.activation_commercial_allocations;
create policy "Stakeholders read relevant commercial allocations" on public.activation_commercial_allocations for select using (
  public.can_manage_activation(proposal_id) or recipient_user_id = auth.uid()
);

drop policy if exists "Activation managers read activation commerce receipts" on public.commerce_receipts;
create policy "Activation managers read activation commerce receipts" on public.commerce_receipts for select using (
  proposal_id is not null and public.can_manage_activation(proposal_id)
);

create or replace view public.activation_commercial_evidence
with (security_invoker = true) as
select
  p.id as proposal_id,
  count(distinct cr.id) filter (where cr.receipt_type='reservation' and cr.status not in ('cancelled','refunded')) as reservations,
  count(distinct cr.id) filter (where cr.receipt_type='purchase' and cr.status not in ('cancelled','refunded')) as purchases,
  count(distinct cr.id) filter (where cr.status='fulfilled' or cr.receipt_type='redemption') as fulfilled,
  count(distinct cr.id) filter (where cr.receipt_type='refund' or cr.status='refunded') as refunds,
  coalesce(sum(cr.amount) filter (where cr.receipt_type='purchase' and cr.status not in ('cancelled','refunded')),0) as gross_amount,
  coalesce(sum(cr.amount) filter (where cr.receipt_type='refund' or cr.status='refunded'),0) as refunded_amount,
  min(cr.currency) filter (where cr.amount > 0) as currency,
  count(distinct cr.promopush_channel_id) filter (where cr.promopush_channel_id is not null) as attributed_channels,
  max(cr.occurred_at) as last_commerce_at
from public.proposals p
left join public.commerce_receipts cr on cr.proposal_id=p.id
group by p.id;

grant select on public.activation_commercial_evidence to authenticated;
grant select, insert, update on public.activation_commercial_rules to authenticated;
grant select on public.activation_commercial_allocations to authenticated;
grant all on public.activation_commercial_rules, public.activation_commercial_allocations to service_role;

comment on table public.activation_commercial_rules is 'Configured, funded allocation rules. Attribution without one cannot create earnings.';
comment on table public.activation_commercial_allocations is 'Auditable allocation results linked to canonical commerce receipts and existing payout allocations.';
notify pgrst, 'reload schema';
