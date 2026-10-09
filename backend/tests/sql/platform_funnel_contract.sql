\set ON_ERROR_STOP on
begin;
do $$ begin
  if current_database() <> 'promorang_funnel_test' then raise exception 'Use the isolated promorang_funnel_test database'; end if;
end $$;
insert into auth.users values ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002'),('00000000-0000-4000-8000-000000000003');

-- Guest capture -> verified attendance -> account, without losing the original identity.
insert into moments(id,host_id,status) values('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','scheduled');
insert into guest_moment_rsvps(id,moment_id,status) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','confirmed');
insert into guest_attendance_receipts(id,rsvp_id,moment_id) values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001');
do $$ begin
  if (select count(*) from platform_funnel_events where funnel='participant' and anonymous_id='guest-rsvp:20000000-0000-4000-8000-000000000001')<>2 then raise exception 'Guest capture or verification missing'; end if;
  if exists(select 1 from platform_funnel_events where funnel='participant' and stage='account') then raise exception 'An unclaimed pass is not an account'; end if;
end $$;
update guest_moment_rsvps set user_id='00000000-0000-4000-8000-000000000001',status='checked_in',claimed_at=now() where id='20000000-0000-4000-8000-000000000001';
update guest_attendance_receipts set user_id='00000000-0000-4000-8000-000000000001' where id='30000000-0000-4000-8000-000000000001';
update guest_attendance_receipts set user_id=user_id where id='30000000-0000-4000-8000-000000000001';
do $$ begin
  if (select count(*) from platform_funnel_events where funnel='participant' and user_id='00000000-0000-4000-8000-000000000001' and stage in ('reserved','verified','account'))<>3 then raise exception 'Account claim failed to stitch the three guest receipts'; end if;
  if exists(select 1 from platform_funnel_events where stage='returned') then raise exception 'Repeated check-in is not a return'; end if;
end $$;

-- Native joined participation is pending, not verified.
select set_config('request.jwt.claims','{"role":"authenticated"}',true);
insert into moment_participants(id,user_id,moment_id,status,checked_in_at)
values('40000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','checked_in',now());
do $$ begin
  if exists(select 1 from platform_funnel_events where funnel='participant' and stage='verified' and user_id='00000000-0000-4000-8000-000000000003') then raise exception 'A browser self-reported check-in must not manufacture verification'; end if;
end $$;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
insert into moments(id,host_id,status) values('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','active');
insert into moment_participants(id,user_id,moment_id,status) values('40000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','joined');
do $$ begin
  if exists(select 1 from platform_funnel_events where stage='verified' and entity_id='10000000-0000-4000-8000-000000000002') then raise exception 'Pending participation was marked verified'; end if;
end $$;
update moment_participants set status='checked_in',checked_in_at=now() where id='40000000-0000-4000-8000-000000000001';
do $$ begin
  if not exists(select 1 from platform_funnel_events where funnel='participant' and stage='returned' and user_id='00000000-0000-4000-8000-000000000001') then raise exception 'A second verified Moment must create a return receipt'; end if;
end $$;

-- Merchant publication, redemption, and subsequent activation.
insert into offers(id,owner_user_id,status) values('50000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','draft');
do $$ begin
  if exists(select 1 from platform_funnel_events where funnel='operator' and user_id='00000000-0000-4000-8000-000000000003') then raise exception 'Draft offers are not published'; end if;
end $$;
update offers set status='active' where id='50000000-0000-4000-8000-000000000001';
insert into offer_issuances(id,user_id,offer_id,status) values('60000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','claimed');
do $$ begin
  if exists(select 1 from platform_funnel_events where funnel='operator' and user_id='00000000-0000-4000-8000-000000000003' and stage='first_customer') then raise exception 'A claim is not a verified customer'; end if;
end $$;
update offer_issuances set status='redeemed',redeemed_at=now() where id='60000000-0000-4000-8000-000000000001';
update offers set status='draft' where id='50000000-0000-4000-8000-000000000001';
update offers set status='active' where id='50000000-0000-4000-8000-000000000001';
do $$ begin
  if exists(select 1 from platform_funnel_events where funnel='operator' and user_id='00000000-0000-4000-8000-000000000003' and stage='repeat_activation') then raise exception 'Toggling the same offer is not another activation'; end if;
end $$;
insert into offers(id,owner_user_id,status) values('50000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','active');
do $$ begin
  if not exists(select 1 from platform_funnel_events where funnel='operator' and user_id='00000000-0000-4000-8000-000000000003' and stage='repeat_activation') then raise exception 'A new offer after a verified customer must count'; end if;
end $$;

-- CRM identity linking and brand funding truth.
insert into crm_leads(id,funnel_key) values('70000000-0000-4000-8000-000000000001','sponsor');
update crm_leads set user_id='00000000-0000-4000-8000-000000000003' where id='70000000-0000-4000-8000-000000000001';
insert into campaigns(id,brand_id,activation_proposal_id) values('80000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000001');
insert into activation_gem_reserves(proposal_id) values('90000000-0000-4000-8000-000000000001');
do $$ begin
  if exists(select 1 from platform_funnel_events where funnel='brand' and stage='funded') then raise exception 'A zero reserve is not funding'; end if;
end $$;
update activation_gem_reserves set secured_gems=100 where proposal_id='90000000-0000-4000-8000-000000000001';
update activation_gem_reserves set secured_gems=100 where proposal_id='90000000-0000-4000-8000-000000000001';
do $$ begin
  if (select count(*) from platform_funnel_events where funnel='brand' and stage='funded')<>1 then raise exception 'Funding retries inflated conversions'; end if;
end $$;
insert into platform_funnel_events(event_key,funnel,stage,user_id,entity_type,entity_id) values('test-report','brand','outcome_report','00000000-0000-4000-8000-000000000003','campaign','80000000-0000-4000-8000-000000000001');
insert into campaigns(id,brand_id,activation_proposal_id) values('80000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000002');
do $$ begin
  if exists(select 1 from platform_funnel_events where stage='renewed') then raise exception 'A new draft is not a funded renewal'; end if;
end $$;
insert into activation_gem_reserves(proposal_id,secured_gems) values('90000000-0000-4000-8000-000000000002',200);
do $$ begin
  if not exists(select 1 from platform_funnel_events where funnel='brand' and stage='renewed') then raise exception 'Funded next campaign after reviewed outcomes must count'; end if;
  if not exists(select 1 from platform_funnel_events where funnel='brand' and stage='brief_captured' and user_id='00000000-0000-4000-8000-000000000003') then raise exception 'Captured contact was not linked to its account'; end if;
  if has_table_privilege('anon','public.platform_funnel_events','INSERT') or has_table_privilege('authenticated','public.platform_funnel_events','INSERT') then raise exception 'Browser roles must not manufacture funnel evidence'; end if;
  if has_table_privilege('anon','public.platform_funnel_events','SELECT') or has_table_privilege('authenticated','public.platform_funnel_events','SELECT') then raise exception 'Funnel evidence must be read through owner-checked APIs'; end if;
  if not (select relrowsecurity from pg_class where oid='public.platform_funnel_events'::regclass) then raise exception 'Funnel table requires RLS'; end if;
  if has_function_privilege('anon','promorang_internal.funnel_receipt(text,text,uuid,text,text,text,timestamptz,jsonb)','EXECUTE') then raise exception 'Private trigger helpers must not be publicly executable'; end if;
end $$;
select 'All platform funnel SQL contracts passed' as result;
rollback;
