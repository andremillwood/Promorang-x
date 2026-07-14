-- Contextual interaction belongs to a Moment, not an unbounded social feed.
-- Participants and hosts can post/react; everyone may read the public Moment Wall.

create extension if not exists pgcrypto;

create table if not exists public.moment_comments (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.moment_comments(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 1000),
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('moment', 'comment')),
  entity_id uuid not null,
  reaction_type text not null check (reaction_type in ('❤️', '🔥', '👏', '✨')),
  created_at timestamptz not null default now(),
  unique(user_id, entity_type, entity_id)
);

create index if not exists idx_moment_comments_moment_created on public.moment_comments(moment_id, created_at);
create index if not exists idx_moment_comments_parent on public.moment_comments(parent_id);
create index if not exists idx_reactions_entity on public.reactions(entity_type, entity_id);

create or replace function public.can_interact_with_moment(_moment_id uuid, _user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.moment_participants mp
    where mp.moment_id = _moment_id and mp.user_id = _user_id and mp.status <> 'cancelled'
  ) or exists (
    select 1 from public.moments m
    where m.id = _moment_id and m.host_id = _user_id
  );
$$;

create or replace function public.can_interact_with_moment_entity(_entity_type text, _entity_id uuid, _user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select case
    when _entity_type = 'moment' then public.can_interact_with_moment(_entity_id, _user_id)
    when _entity_type = 'comment' then exists (
      select 1 from public.moment_comments mc
      where mc.id = _entity_id and public.can_interact_with_moment(mc.moment_id, _user_id)
    )
    else false
  end;
$$;

create or replace function public.enforce_moment_comment_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.moment_comments parent
    where parent.id = new.parent_id and parent.moment_id = new.moment_id
  ) then
    raise exception 'A reply must belong to the same Moment as its parent';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_moment_comment_parent_trigger on public.moment_comments;
create trigger enforce_moment_comment_parent_trigger
before insert or update of parent_id, moment_id on public.moment_comments
for each row execute function public.enforce_moment_comment_parent();

alter table public.moment_comments enable row level security;
alter table public.reactions enable row level security;

drop policy if exists "Anyone can read comments" on public.moment_comments;
drop policy if exists "Authenticated can comment" on public.moment_comments;
drop policy if exists "Authors can update" on public.moment_comments;
drop policy if exists "Authors can delete" on public.moment_comments;
drop policy if exists "Public reads Moment Wall" on public.moment_comments;
drop policy if exists "Moment participants post" on public.moment_comments;
drop policy if exists "Authors edit Moment Wall posts" on public.moment_comments;
drop policy if exists "Authors delete Moment Wall posts" on public.moment_comments;

create policy "Public reads Moment Wall" on public.moment_comments for select using (true);
create policy "Moment participants post" on public.moment_comments for insert with check (
  user_id = auth.uid()
  and public.can_interact_with_moment(moment_id, auth.uid())
);
create policy "Authors edit Moment Wall posts" on public.moment_comments for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.can_interact_with_moment(moment_id, auth.uid()));
create policy "Authors delete Moment Wall posts" on public.moment_comments for delete
  using (user_id = auth.uid());

drop policy if exists "Anyone can view reactions" on public.reactions;
drop policy if exists "Authenticated can react" on public.reactions;
drop policy if exists "Users can unreact" on public.reactions;
drop policy if exists "Public reads contextual reactions" on public.reactions;
drop policy if exists "Moment participants react" on public.reactions;
drop policy if exists "Users change own reactions" on public.reactions;
drop policy if exists "Users remove own reactions" on public.reactions;

create policy "Public reads contextual reactions" on public.reactions for select using (true);
create policy "Moment participants react" on public.reactions for insert with check (
  user_id = auth.uid()
  and public.can_interact_with_moment_entity(entity_type, entity_id, auth.uid())
);
create policy "Users change own reactions" on public.reactions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.can_interact_with_moment_entity(entity_type, entity_id, auth.uid()));
create policy "Users remove own reactions" on public.reactions for delete
  using (user_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.moment_comments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.reactions;
exception when duplicate_object then null;
end $$;
