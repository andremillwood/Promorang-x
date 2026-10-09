begin;
update public.moments set is_active=false, status='closed', recurrence_enabled=false, recurrence_frequency=null, recurrence_by_weekday='{}', updated_at=now()
where slug='aftrhrs' or title in ('Encore: Ladies Throwback Playground','Encore Live featuring Capleton');
update public.event_editions set published=false, claims_open=false, updated_at=now()
where moment_id in (select id from public.moments where slug='aftrhrs');
update public.aftrhrs_digital_releases set claims_open=false, closed_at=coalesce(closed_at,now()), updated_at=now() where claims_open=true;
create or replace function public.prevent_retired_aftrhrs_edition()
returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from public.moments where id=new.moment_id and slug='aftrhrs' and is_active=false)
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
