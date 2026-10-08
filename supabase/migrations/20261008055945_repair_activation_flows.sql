-- Apply only after staging validation, never from the web client.
-- Uses existing proposals, Gem ledger/reserves, organization membership and user roles.
-- Existing CRM capture uses a constrained funnel vocabulary; add the explicit-contact route.
alter table public.crm_leads drop constraint if exists crm_leads_funnel_key_check;
alter table public.crm_leads add constraint crm_leads_funnel_key_check
  check (funnel_key in ('scene','moment','demand','creator','sponsor','business'));

-- PostgREST upsert uses ON CONFLICT(idempotency_key) without an index predicate.
-- A normal unique index permits multiple NULLs and is inferable by that clause.
drop index if exists public.growth_events_idempotency_idx;
create unique index growth_events_idempotency_idx on public.growth_events(idempotency_key);

create or replace function public.is_campaign_buyer()
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (
    select 1 from public.user_roles where user_id = auth.uid()
    and role::text in ('merchant','brand','agency','admin')
  );
$$;
revoke all on function public.is_campaign_buyer() from public;
grant execute on function public.is_campaign_buyer() to authenticated;

-- Restrictive policies also constrain legacy permissive policies from apps/web.
create policy "Activation draft visibility boundary" on public.campaigns as restrictive for select to authenticated
using (is_active or brand_id = auth.uid() or exists (select 1 from public.user_roles where user_id=auth.uid() and role::text='admin') or exists (
  select 1 from public.organization_members m where m.organization_id = campaigns.organization_id and m.user_id = auth.uid()
));
create policy "Activation plan insertion boundary" on public.campaigns as restrictive for insert to authenticated
with check (public.is_campaign_buyer() and brand_id = auth.uid() and not is_active
  and activation_proposal_id is null and (organization_id is null or public.can_manage_organization(organization_id,'manager')));
create policy "Buyers create their activation plans" on public.campaigns for insert to authenticated
with check (public.is_campaign_buyer() and brand_id = auth.uid() and not is_active
  and activation_proposal_id is null and (organization_id is null or public.can_manage_organization(organization_id,'manager')));
create policy "Activation plan update boundary" on public.campaigns as restrictive for update to authenticated
using (public.is_campaign_buyer() and (brand_id = auth.uid() or public.can_manage_organization(organization_id,'manager')))
with check (public.is_campaign_buyer() and (brand_id = auth.uid() or public.can_manage_organization(organization_id,'manager')));

create or replace function public.guard_campaign_identity()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated','anon') and (
    new.brand_id is distinct from old.brand_id or new.organization_id is distinct from old.organization_id
    or new.activation_proposal_id is distinct from old.activation_proposal_id or new.is_active is distinct from old.is_active
  ) then raise exception 'Campaign ownership and activation state are server managed'; end if;
  return new;
end $$;
create trigger guard_campaign_identity before update on public.campaigns for each row execute function public.guard_campaign_identity();

-- Public active campaigns remain public, but the management detail surface is scoped.
create or replace function public.get_campaign_workspace_detail(p_campaign_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare c public.campaigns%rowtype;
begin
  if auth.uid() is null then raise exception 'Sign in to view this campaign'; end if;
  select * into c from public.campaigns where id=p_campaign_id and (
    brand_id=auth.uid()
    or exists(select 1 from public.organization_members m where m.organization_id=campaigns.organization_id and m.user_id=auth.uid())
    or exists(select 1 from public.user_roles where user_id=auth.uid() and role::text='admin')
  );
  if not found then return null; end if;
  return to_jsonb(c);
end $$;
revoke all on function public.get_campaign_workspace_detail(uuid) from public,anon;
grant execute on function public.get_campaign_workspace_detail(uuid) to authenticated;

-- Direct writes otherwise allow a customer to forge quotes or activate unpaid work.
revoke insert, update, delete on public.promopush_campaigns from anon, authenticated;
alter table public.promopush_campaigns add column if not exists creation_key text;
alter table public.promopush_campaigns add column if not exists creation_input jsonb;
create unique index if not exists promopush_creation_key on public.promopush_campaigns(created_by,creation_key) where creation_key is not null;
create unique index if not exists promopush_one_proposal on public.promopush_campaigns(proposal_id) where proposal_id is not null;

create or replace function public.create_promopush_draft(p_actor uuid, p_key text, p_input jsonb, p_origin text)
returns public.promopush_campaigns language plpgsql security definer set search_path = public as $$
declare c public.promopush_campaigns%rowtype; m public.moments%rowtype; channel text; code text;
begin
  if p_actor is null or length(coalesce(p_key,'')) < 8 or length(p_key)>160 then raise exception 'A stable request key is required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_actor::text || p_key,0));
  select * into c from public.promopush_campaigns where created_by=p_actor and creation_key=p_key;
  if found then
    if c.creation_input is distinct from p_input then raise exception 'Draft already saved with different details. Refresh the campaign list before creating another'; end if;
    return c;
  end if;
  select * into m from public.moments where id=(p_input->>'linked_moment_id')::uuid;
  if not found or (p_actor is distinct from m.host_id and p_actor is distinct from m.organizer_id) then
    raise exception 'You must own or organize the linked Moment';
  end if;
  if p_input ?| array['pricing','proposal_id','funding_status','launched_at'] then raise exception 'Pricing and funding are server managed'; end if;
  insert into public.promopush_campaigns(title,linked_moment_id,host_id,brand_id,created_by,creation_key,creation_input,
    geo_radius_meters,geo_center_lat,geo_center_lng,geo_label,start_time,end_time,budget,reward_rules,
    request_creative_support,objective_type,push_mode,reward_type,package_code,fulfillment_kit,distribution_config,evidence_config,status)
  values (p_input->>'title',m.id,coalesce(m.host_id,m.organizer_id),p_actor,p_actor,p_key,p_input,
    (p_input->>'geo_radius_meters')::numeric,(p_input->>'geo_center_lat')::numeric,(p_input->>'geo_center_lng')::numeric,p_input->>'geo_label',
    (p_input->>'start_time')::timestamptz,(p_input->>'end_time')::timestamptz,(p_input->>'budget')::numeric,coalesce(p_input->'reward_rules','{}'),
    coalesce((p_input->>'request_creative_support')::boolean,false),p_input->>'objective_type',p_input->>'push_mode',coalesce(p_input->>'reward_type','none'),
    p_input->>'push_mode',p_input->'fulfillment_kit',coalesce(p_input->'distribution_config','{}'),coalesce(p_input->'evidence_config','{}'),'draft') returning * into c;
  foreach channel in array array['qr_code','meta_ads','direct_link','creator_link','street_activation'] loop
    code := channel || '-' || gen_random_uuid()::text;
    insert into public.promopush_channels(campaign_id,channel_type,label,tracking_code,tracking_link,moment_entry_endpoint,reward_per_verified_action)
    values(c.id,channel::public.promopush_channel_type,replace(channel,'_',' '),code,p_origin||'/go/'||code,'/moments/'||m.id::text||'?campaign='||c.id::text||'&channel='||code,
      coalesce((c.reward_rules->>'creator_verified_action_gems')::numeric,0));
  end loop;
  if c.request_creative_support then
    insert into public.promopush_creative_tasks(campaign_id,task_type) select c.id,unnest(array['flyer_design','qr_layout','ad_creative']);
  end if;
  return c;
end $$;
revoke all on function public.create_promopush_draft(uuid,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.create_promopush_draft(uuid,text,jsonb,text) to service_role;

-- Staff quotes are authoritative; no automatic price is invented for uncatalogued packages.
create or replace function public.quote_promopush(p_campaign_id uuid,p_total_gems numeric,p_expires_at timestamptz,p_actor uuid,p_key uuid)
returns public.promopush_campaigns language plpgsql security definer set search_path = public as $$
declare c public.promopush_campaigns%rowtype; pid uuid;
begin
  if not exists(select 1 from public.user_roles where user_id=p_actor and role::text in ('admin','master_admin','administrator')) then raise exception 'Platform pricing permission required'; end if;
  select * into c from public.promopush_campaigns where id=p_campaign_id for update;
  if not found then raise exception 'Campaign not found'; end if;
  if c.pricing->>'quote_id'=p_key::text then return c; end if;
  if c.status<>'draft' or c.push_mode='organic' or c.funding_status<>'unfunded' then raise exception 'Only unfunded paid drafts can be quoted'; end if;
  if p_key is null or p_total_gems is null or p_total_gems<=0 or p_total_gems::text in ('NaN','Infinity') or p_expires_at is null or p_expires_at<=now() then raise exception 'A positive Gem quote and future expiry are required'; end if;
  if exists(select 1 from public.activation_gem_reserves where proposal_id=c.proposal_id and secured_gems>0) then raise exception 'Resolve existing funding before requoting'; end if;
  pid:=c.proposal_id;
  if pid is null then
    insert into public.proposals(planner_id,title,description,status,lifecycle_state,funding_goal_gems,target_moment_id,metadata)
    values(c.created_by,c.title,'PromoPush distribution: '||c.push_mode,'draft','funding',p_total_gems,c.linked_moment_id,
      jsonb_build_object('source','promopush','promopush_campaign_id',c.id,'value_model','gem_funded')) returning id into pid;
  else
    update public.proposals set funding_goal_gems=p_total_gems where id=pid and planner_id=c.created_by;
    if not found then raise exception 'Proposal owner mismatch'; end if;
  end if;
  update public.promopush_campaigns set proposal_id=pid,pricing=jsonb_build_object('quote_id',p_key,'total_gems',p_total_gems,
    'expires_at',p_expires_at,'issued_by',p_actor,'issued_at',now(),'push_mode',c.push_mode),updated_at=now() where id=c.id returning * into c;
  return c;
end $$;
revoke all on function public.quote_promopush(uuid,numeric,timestamptz,uuid,uuid) from public,anon,authenticated;
grant execute on function public.quote_promopush(uuid,numeric,timestamptz,uuid,uuid) to service_role;

-- Buyer approval passes only the observed quote ID. Amount and proposal are read under lock.
create or replace function public.fund_promopush(p_campaign_id uuid,p_quote_id uuid)
returns public.promopush_campaigns language plpgsql security definer set search_path = public as $$
declare c public.promopush_campaigns%rowtype; p public.proposals%rowtype; amount numeric;
begin
  select * into c from public.promopush_campaigns where id=p_campaign_id for update;
  if not found or auth.uid() is null or c.created_by is distinct from auth.uid() then raise exception 'Not authorized to fund this PromoPush'; end if;
  if c.pricing->>'quote_id' is distinct from p_quote_id::text then raise exception 'Quote changed. Refresh and review the new quote'; end if;
  if c.funding_status='secured' then
    if not exists(select 1 from public.activation_gem_reserves where proposal_id=c.proposal_id
      and secured_gems-released_gems-refunded_gems >= (c.pricing->>'total_gems')::numeric) then
      raise exception 'Reserve changed. Request a funding review before retrying';
    end if;
    return c;
  end if;
  if c.status<>'draft' or c.push_mode='organic' then raise exception 'This campaign is not accepting funding'; end if;
  if (c.pricing->>'expires_at')::timestamptz<=now() then raise exception 'Quote expired. Request an updated quote'; end if;
  amount := (c.pricing->>'total_gems')::numeric;
  select * into p from public.proposals where id=c.proposal_id for update;
  if not found or p.planner_id is distinct from c.created_by or p.funding_goal_gems is distinct from amount or amount is null or amount<=0
     or p.lifecycle_state not in ('aligned','funding','funded') then raise exception 'Proposal changed or cancelled. Request review'; end if;
  perform public.secure_activation_gems(p.id,amount,'promopush:'||c.id::text||':'||p_quote_id::text);
  update public.promopush_campaigns set funding_status='secured',updated_at=now() where id=c.id returning * into c;
  return c;
end $$;
revoke all on function public.fund_promopush(uuid,uuid) from public,anon;
grant execute on function public.fund_promopush(uuid,uuid) to authenticated;

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

  if not public.is_campaign_buyer() or not (coalesce(v_campaign.brand_id = v_user,false) or public.can_manage_organization(v_campaign.organization_id, 'manager')) then
    raise exception 'You cannot manage this campaign plan';
  end if;

  if v_campaign.activation_proposal_id is not null then
    return v_campaign.activation_proposal_id;
  end if;

  insert into public.proposals (
    planner_id,
    brand_id,
    title,
    description,
    budget,
    funding_goal_gems,
    status,
    lifecycle_state,
    metadata
  ) values (
    v_campaign.brand_id,
    v_campaign.organization_id,
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


CREATE OR REPLACE FUNCTION public.launch_promopush_campaign(p_campaign_id uuid, p_actor_user_id uuid)
RETURNS public.promopush_campaigns
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_campaign public.promopush_campaigns%rowtype;
  v_reserve public.activation_gem_reserves%rowtype;
  v_price numeric;
  v_proposal public.proposals%rowtype;
BEGIN
  SELECT * INTO v_campaign FROM public.promopush_campaigns WHERE id = p_campaign_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PromoPush campaign not found'; END IF;
  IF p_actor_user_id IS NULL OR (
    p_actor_user_id IS DISTINCT FROM v_campaign.host_id AND
    p_actor_user_id IS DISTINCT FROM v_campaign.brand_id AND
    p_actor_user_id IS DISTINCT FROM v_campaign.created_by
  ) THEN
    RAISE EXCEPTION 'Not authorized to launch this PromoPush';
  END IF;
  IF v_campaign.status = 'active' THEN RETURN v_campaign; END IF;
  IF v_campaign.status <> 'draft' THEN RAISE EXCEPTION 'Only a draft can launch'; END IF;
  IF v_campaign.objective_type IS NULL OR v_campaign.push_mode IS NULL THEN
    RAISE EXCEPTION 'Outcome and distribution package are required';
  END IF;
  IF nullif(trim(v_campaign.fulfillment_kit->>'cta'),'') IS NULL
     OR nullif(trim(v_campaign.fulfillment_kit->>'landing_url'),'') IS NULL THEN
    RAISE EXCEPTION 'CTA and landing destination are required';
  END IF;
  IF v_campaign.reward_type <> 'none'
     AND nullif(trim(v_campaign.fulfillment_kit->>'inventory_reference'),'') IS NULL THEN
    RAISE EXCEPTION 'Connected reward inventory is required';
  END IF;
  IF v_campaign.end_time <= v_campaign.start_time OR v_campaign.end_time <= now() THEN
    RAISE EXCEPTION 'Campaign distribution window is invalid';
  END IF;

  v_price := coalesce(nullif(v_campaign.pricing->>'total_gems','')::numeric, 0);
  IF v_campaign.push_mode <> 'organic' THEN
    IF v_campaign.proposal_id IS NULL OR v_price <= 0 THEN
      RAISE EXCEPTION 'Paid PromoPush requires a priced activation';
    END IF;
    SELECT * INTO v_proposal FROM public.proposals WHERE id=v_campaign.proposal_id FOR UPDATE;
    IF NOT FOUND OR v_proposal.planner_id IS DISTINCT FROM v_campaign.created_by
       OR v_proposal.funding_goal_gems IS DISTINCT FROM v_price
       OR v_proposal.lifecycle_state NOT IN ('funding','funded','live')
       OR v_campaign.funding_status <> 'secured'
       OR v_campaign.pricing->>'quote_id' IS NULL
       OR v_campaign.pricing->>'push_mode' IS DISTINCT FROM v_campaign.push_mode THEN
      RAISE EXCEPTION 'Approved quote or proposal changed; review funding before launch';
    END IF;
    SELECT * INTO v_reserve FROM public.activation_gem_reserves WHERE proposal_id = v_campaign.proposal_id FOR UPDATE;
    IF NOT FOUND OR (v_reserve.secured_gems - v_reserve.released_gems - v_reserve.refunded_gems) < v_price THEN
      RAISE EXCEPTION 'PromoPush funding is not secured';
    END IF;
  ELSE
    IF coalesce((v_campaign.reward_rules->>'creator_verified_action_gems')::numeric,0)>0
       OR coalesce((v_campaign.reward_rules->>'street_verified_action_gems')::numeric,0)>0 OR v_campaign.reward_type='gems' THEN
      RAISE EXCEPTION 'Gem rewards require a paid funded package';
    END IF;
  END IF;

  UPDATE public.promopush_campaigns
  SET status = 'active',
      funding_status = CASE WHEN push_mode = 'organic' THEN funding_status ELSE 'secured' END,
      launched_at = coalesce(launched_at, now()), updated_at = now()
  WHERE id = p_campaign_id RETURNING * INTO v_campaign;
  RETURN v_campaign;
END $$;

REVOKE ALL ON FUNCTION public.launch_promopush_campaign(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.launch_promopush_campaign(uuid,uuid) TO service_role;


create or replace function public.cancel_promopush(p_campaign_id uuid)
returns public.promopush_campaigns language plpgsql security definer set search_path = public as $$
declare c public.promopush_campaigns%rowtype; r record;
begin
  select * into c from public.promopush_campaigns where id=p_campaign_id for update;
  if not found or auth.uid() is null or c.created_by is distinct from auth.uid() then raise exception 'Not authorized'; end if;
  if c.pricing->>'cancelled'='true' then return c; end if;
  if c.status<>'draft' then raise exception 'Only a draft can be cancelled here'; end if;
  for r in select id from public.activation_gem_reservations where proposal_id=c.proposal_id and status='secured' loop
    perform public.refund_activation_gem_reservation(r.id,'promopush-cancel:'||r.id::text);
  end loop;
  update public.promopush_campaigns set status='paused',funding_status=case when funding_status='secured' then 'refunded' else funding_status end,
    pricing=pricing||jsonb_build_object('cancelled',true),updated_at=now() where id=c.id returning * into c;
  return c;
end $$;
revoke all on function public.cancel_promopush(uuid) from public,anon;
grant execute on function public.cancel_promopush(uuid) to authenticated;
notify pgrst,'reload schema';
