-- Production may have the stricter lifecycle enum introduced by the moment
-- schema enforcement migration, which omitted the UI-supported archive state.
-- Adding an enum value is forward-only and preserves all existing rows.
alter type public.moment_status add value if not exists 'archived';

notify pgrst, 'reload schema';
