-- Mission archetypes give participants a culturally legible role inside a Moment.
-- Camera consent is explicit because Aura missions may involve capturing others.

alter table public.content_missions
  add column if not exists archetype text not null default 'side_quest',
  add column if not exists camera_consent text;

alter table public.content_missions
  drop constraint if exists content_missions_archetype_check,
  add constraint content_missions_archetype_check
    check (archetype in ('scout', 'aura', 'rally', 'signal', 'remix', 'lore', 'side_quest'));

alter table public.content_missions
  drop constraint if exists content_missions_camera_consent_check,
  add constraint content_missions_camera_consent_check
    check (
      camera_consent is null or camera_consent in
      ('open_to_camera', 'ask_first', 'no_face', 'private_proof', 'public_post')
    ),
  drop constraint if exists content_missions_aura_consent_required,
  add constraint content_missions_aura_consent_required
    check (archetype <> 'aura' or camera_consent is not null);

comment on column public.content_missions.archetype is
  'The participant role invited by the mission: Scout, Aura, Rally, Signal, Remix, Lore, or Side Quest.';
comment on column public.content_missions.camera_consent is
  'Explicit capture expectation for camera-bearing missions; required by product policy for Aura missions.';

notify pgrst, 'reload schema';
