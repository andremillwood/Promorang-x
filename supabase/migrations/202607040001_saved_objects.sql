create table if not exists public.saved_objects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_type text not null check (object_type in ('moment', 'mission', 'creator', 'scene')),
  object_id text not null,
  title text not null,
  subtitle text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, object_type, object_id)
);

create index if not exists saved_objects_user_created_idx
  on public.saved_objects(user_id, created_at desc);

alter table public.saved_objects enable row level security;

drop policy if exists "Users read own saved objects" on public.saved_objects;
create policy "Users read own saved objects"
  on public.saved_objects for select
  using (auth.uid() = user_id);

drop policy if exists "Users save own objects" on public.saved_objects;
create policy "Users save own objects"
  on public.saved_objects for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users remove own saved objects" on public.saved_objects;
create policy "Users remove own saved objects"
  on public.saved_objects for delete
  using (auth.uid() = user_id);
