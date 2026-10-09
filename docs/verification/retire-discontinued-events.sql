-- REVISED DRAFT: supersedes the unsafe SQL in commit 716770ede. NOT APPLIED.
-- Confirmed scope: AftrHrs and Andre-owned Encore at Footprints Cafe. Capleton excluded.
begin;
update public.moments set is_active=false, status='closed', recurrence_enabled=false, recurrence_frequency=null, recurrence_by_weekday='{}', updated_at=now()
where id='00000000-0000-0000-0002-000000000080' and slug='aftrhrs'
  and venue_id='00000000-0000-0000-0003-000000000080';
update public.moments set is_active=false, status='closed', recurrence_enabled=false, recurrence_frequency=null, recurrence_by_weekday='{}', updated_at=now()
where id='58fa8801-6f83-40e3-a80b-86d6a67fc1a7'
  and title='Encore: Ladies Throwback Playground'
  and venue_id='00000000-0000-0000-0003-000000000081'
  and host_id='349e4f8f-f2f1-4a7f-9ad2-9327c8bea1ec'
  and organizer_id='349e4f8f-f2f1-4a7f-9ad2-9327c8bea1ec';
update public.event_editions set published=false, claims_open=false, updated_at=now()
where moment_id='00000000-0000-0000-0002-000000000080';
update public.aftrhrs_digital_releases set claims_open=false, closed_at=coalesce(closed_at,now()), updated_at=now() where id='0ffcf3d9-3864-4a25-a6e1-80a716dce6c8' and month_key='2026-09' and batch_index=1 and claims_open=true;
create or replace function public.prevent_retired_aftrhrs_edition()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.moment_id='00000000-0000-0000-0002-000000000080'::uuid
    and exists(select 1 from public.moments where id=new.moment_id and is_active=false)
    and (TG_OP='INSERT' or new.published or new.claims_open) then
   raise exception 'AftrHrs is retired; new editions and claims are closed' using errcode='23514';
 end if;
 return new;
end;
$$;
revoke all on function public.prevent_retired_aftrhrs_edition() from public;
drop trigger if exists prevent_retired_aftrhrs_edition on public.event_editions;
create trigger prevent_retired_aftrhrs_edition before insert or update on public.event_editions for each row execute function public.prevent_retired_aftrhrs_edition();
commit;
