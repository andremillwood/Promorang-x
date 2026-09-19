-- Watch notifications fan out from an authoritative object change to the users
-- who explicitly saved that object. The existing unique key is user-first, so
-- add the reverse lookup path used by emit_market_watch_notification.

create index if not exists idx_saved_objects_watch_lookup
  on public.saved_objects (object_type, object_id, user_id);
