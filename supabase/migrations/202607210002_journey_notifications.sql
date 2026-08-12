-- Human journey notifications derived from authoritative source records.
-- Presentation and routing are resolved by clients from type + related_id.

alter table public.notifications add column if not exists dedupe_key text;
create unique index if not exists idx_notifications_dedupe_key on public.notifications(dedupe_key);

create or replace function public.notify_memory_kept()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  moment_title text;
begin
  select title into moment_title from public.moments where id = new.moment_id;
  insert into public.notifications (user_id, type, title, message, related_id, is_read)
  values (
    new.user_id,
    'memory_kept',
    'Something from this Moment stayed with you',
    coalesce(moment_title, new.title, 'Your Moment') || ' is now kept privately in your Vault.',
    new.id,
    false
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_memory_kept on public.memories;
create trigger trg_notify_memory_kept
after insert on public.memories
for each row execute function public.notify_memory_kept();

create or replace function public.notify_scene_relationship_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  scene_title text;
  notification_type text;
  notification_title text;
  notification_message text;
begin
  select title into scene_title from public.scenes where id = new.scene_id;

  if new.membership_state = 'invited'
    and (tg_op = 'INSERT' or old.membership_state is distinct from 'invited') then
    notification_type := 'scene_invitation';
    notification_title := 'There is a place for you in ' || coalesce(scene_title, 'this Scene');
    notification_message := 'Look around, meet the people shaping it, and join when it feels like your world.';
  elsif tg_op = 'UPDATE'
    and new.membership_state = 'active'
    and coalesce(new.moments_returned, 0) > coalesce(old.moments_returned, 0) then
    notification_type := 'scene_return';
    notification_title := coalesce(scene_title, 'Your Scene') || ' knows you came back';
    notification_message := 'See the people, places, and next gathering connected to your return.';
  elsif tg_op = 'INSERT' and new.membership_state = 'active' then
    notification_type := 'scene_joined';
    notification_title := 'Your place in ' || coalesce(scene_title, 'the Scene') || ' has started';
    notification_message := 'Stay close to the people, places, and Moments that keep it alive.';
  else
    return new;
  end if;

  insert into public.notifications (user_id, type, title, message, related_id, is_read)
  values (new.user_id, notification_type, notification_title, notification_message, new.scene_id, false);
  return new;
end;
$$;

drop trigger if exists trg_notify_scene_relationship_changed on public.scene_memberships;
create trigger trg_notify_scene_relationship_changed
after insert or update of membership_state, moments_returned on public.scene_memberships
for each row execute function public.notify_scene_relationship_changed();

comment on function public.notify_memory_kept() is
  'Emits one memory_kept notification from the authoritative memory insert.';
comment on function public.notify_scene_relationship_changed() is
  'Emits invitation, first-membership, and genuine-return notifications from Scene membership changes.';
