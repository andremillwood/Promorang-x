-- Source-backed in-app notifications for watched market relationships.
-- A watch is still only a saved relationship; notifications are emitted only
-- when a supported authoritative source record crosses a meaningful change.
-- Notification side effects are deliberately non-blocking: failure to notify
-- must never roll back the authoritative market-source update.
--
-- The notifications table still has legacy notification_type/action_url fields
-- in production. Keep those fields populated alongside the newer type/route
-- fields so existing notification consumers continue to work.

alter table public.notifications
  add column if not exists route text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.notifications
  drop constraint if exists notifications_notification_type_check;

alter table public.notifications
  add constraint notifications_notification_type_check
  check (notification_type in (
    'follow',
    'connection_request',
    'connection_accepted',
    'like',
    'comment',
    'mention',
    'share',
    'order_update',
    'referral_earning',
    'achievement',
    'market_watch_changed'
  ));

create or replace function public.emit_market_watch_notification(
  p_object_type text,
  p_object_id text,
  p_title text,
  p_message text,
  p_route text,
  p_revision text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer := 0;
begin
  insert into public.notifications (
    user_id,
    notification_type,
    type,
    title,
    message,
    related_id,
    is_read,
    dedupe_key,
    action_url,
    route,
    metadata
  )
  select
    saved.user_id,
    'market_watch_changed',
    'market_watch_changed',
    p_title,
    p_message,
    null,
    false,
    'market-watch:' || p_object_type || ':' || p_object_id || ':' || saved.user_id::text || ':' || p_revision,
    p_route,
    p_route,
    jsonb_build_object('object_type', p_object_type, 'object_id', p_object_id, 'watch', true)
  from public.saved_objects saved
  join public.users app_user on app_user.id = saved.user_id
  where saved.object_type = p_object_type
    and saved.object_id = p_object_id
  on conflict (dedupe_key) do nothing;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.emit_market_watch_notification(text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.emit_market_watch_notification(text,text,text,text,text,text) to service_role;

create or replace function public.notify_watched_discovery_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  revision text;
begin
  if new.verification_status is distinct from 'approved' then
    return new;
  end if;

  if row(old.title, old.description, old.location_address, old.city, old.verification_status)
     is not distinct from
     row(new.title, new.description, new.location_address, new.city, new.verification_status) then
    return new;
  end if;

  revision := md5(concat_ws('|', new.title, new.description, new.location_address, new.city, new.verification_status));
  begin
    perform public.emit_market_watch_notification(
      'discovery',
      new.id::text,
      'A Discovery you are watching changed',
      coalesce(new.title, 'This Discovery') || ' has new approved information. Open it to see what changed.',
      '/discoveries/' || new.slug,
      revision
    );
  exception when others then
    raise warning 'Discovery watch notification failed for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;

revoke all on function public.notify_watched_discovery_changed() from public, anon, authenticated;

drop trigger if exists trg_notify_watched_discovery_changed on public.discoveries;
create trigger trg_notify_watched_discovery_changed
after update of title, description, location_address, city, verification_status on public.discoveries
for each row execute function public.notify_watched_discovery_changed();

create or replace function public.notify_watched_demand_threshold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  threshold_value integer;
begin
  threshold_value := nullif(new.threshold_for_moment, 0);
  if threshold_value is null then
    return new;
  end if;

  if coalesce(old.total_votes, 0) < threshold_value
     and coalesce(new.total_votes, 0) >= threshold_value then
    begin
      perform public.emit_market_watch_notification(
        'demand',
        new.id::text,
        'A Demand signal you are watching reached its threshold',
        coalesce(new.question, 'This Demand question') || ' reached its configured signal target. This still does not guarantee supply.',
        '/discover/rewards#wanted',
        'threshold-' || threshold_value::text
      );
    exception when others then
      raise warning 'Demand watch notification failed for %: %', new.id, sqlerrm;
    end;
  end if;
  return new;
end;
$$;

revoke all on function public.notify_watched_demand_threshold() from public, anon, authenticated;

drop trigger if exists trg_notify_watched_demand_threshold on public.discovery_questions;
create trigger trg_notify_watched_demand_threshold
after update of total_votes on public.discovery_questions
for each row execute function public.notify_watched_demand_threshold();

create or replace function public.notify_watched_moment_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  revision text;
  route_value text;
begin
  if row(old.starts_at, old.ends_at, old.location, old.venue_name, old.status, old.reward)
     is not distinct from
     row(new.starts_at, new.ends_at, new.location, new.venue_name, new.status, new.reward) then
    return new;
  end if;

  route_value := '/moments/' || coalesce(nullif(new.slug, ''), new.id::text);
  revision := md5(concat_ws('|', new.starts_at::text, new.ends_at::text, new.location, new.venue_name, new.status, new.reward));
  begin
    perform public.emit_market_watch_notification(
      'moment',
      new.id::text,
      'A Moment you are watching changed',
      coalesce(new.title, 'This Moment') || ' has an updated schedule, place, status, or recorded access detail.',
      route_value,
      revision
    );
  exception when others then
    raise warning 'Moment watch notification failed for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;

revoke all on function public.notify_watched_moment_changed() from public, anon, authenticated;

drop trigger if exists trg_notify_watched_moment_changed on public.moments;
create trigger trg_notify_watched_moment_changed
after update of starts_at, ends_at, location, venue_name, status, reward on public.moments
for each row execute function public.notify_watched_moment_changed();

comment on function public.emit_market_watch_notification(text,text,text,text,text,text) is
  'Creates deduplicated in-app notifications for users who explicitly saved a supported market object.';
comment on function public.notify_watched_demand_threshold() is
  'Notifies watchers only when recorded Demand crosses its configured threshold; threshold remains distinct from supply.';

notify pgrst, 'reload schema';
