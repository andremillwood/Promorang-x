-- Same LAUNCH_WINDOW_END seed as supabase/migrations/20261120150000_capped_drops.sql.
-- ON CONFLICT DO NOTHING so this PR and the capped-drops PR can apply in either order.
-- packages/shared/src/launch-window.ts and backend/lib/launchWindow.js use the same date.

do $$
begin
  if to_regclass('public.system_settings') is not null then
    insert into public.system_settings (key, value, description)
    values (
      'LAUNCH_WINDOW_END',
      jsonb_build_object('date', '2027-01-31'),
      'PromoRang launch window end (America/Jamaica calendar date). Shared with packages/shared LAUNCH_WINDOW_END and backend/lib/launchWindow.js. Country/invites work should read this same value.'
    )
    on conflict (key) do nothing;
  end if;
end $$;
