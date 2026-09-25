-- Find-or-Ask canonical routing.
-- Keeps factual/community questions distinct from unmet demand while preserving
-- the originating search and allowing canonical outcomes to return to that ask.

alter table public.discovery_questions
  add column if not exists semantic_kind text not null default 'demand',
  add column if not exists origin_user_id uuid references auth.users(id) on delete set null,
  add column if not exists origin_query text,
  add column if not exists origin_city text,
  add column if not exists origin_language text,
  add column if not exists origin_source text,
  add column if not exists recovery_action text,
  add column if not exists moderation_status text not null default 'unreviewed',
  add column if not exists answered_at timestamptz;

do $$ begin
  alter table public.discovery_questions
    add constraint discovery_questions_semantic_kind_check
    check (semantic_kind in ('question', 'demand'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.discovery_questions
    add constraint discovery_questions_recovery_action_check
    check (recovery_action is null or recovery_action in ('ask_people', 'request_something'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.discovery_questions
    add constraint discovery_questions_moderation_status_check
    check (moderation_status in ('unreviewed', 'approved', 'rejected', 'hidden'));
exception when duplicate_object then null; end $$;

update public.discovery_questions
set semantic_kind = 'question'
where question_type = 'listing_verification'
   or question_type like 'event_%_verification';

create index if not exists idx_discovery_questions_find_or_ask_origin
  on public.discovery_questions(origin_user_id, semantic_kind, created_at desc)
  where origin_user_id is not null;

create unique index if not exists idx_discovery_questions_find_or_ask_duplicate
  on public.discovery_questions(origin_user_id, semantic_kind, lower(origin_query), lower(coalesce(origin_city, '')))
  where origin_user_id is not null and origin_query is not null and status = 'active';

create table if not exists public.discovery_outcomes (
  id uuid primary key default gen_random_uuid(),
  discovery_id uuid not null references public.discovery_questions(id) on delete cascade,
  responder_user_id uuid references auth.users(id) on delete set null,
  stakeholder_role text not null check (stakeholder_role in ('merchant', 'host', 'creator', 'brand')),
  action_kind text not null,
  canonical_object_type text not null check (canonical_object_type in ('place', 'offer', 'moment', 'content', 'opportunity', 'proof', 'receipt')),
  canonical_object_id text not null,
  canonical_object_url text,
  source_label text,
  source_url text,
  freshness_at timestamptz,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected', 'hidden')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discovery_id, canonical_object_type, canonical_object_id)
);

create table if not exists public.discovery_supports (
  id uuid primary key default gen_random_uuid(),
  discovery_id uuid not null references public.discovery_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (discovery_id, user_id)
);

alter table public.discovery_supports enable row level security;
grant select, insert on public.discovery_supports to authenticated;
drop policy if exists "Users can read own discovery support" on public.discovery_supports;
create policy "Users can read own discovery support"
  on public.discovery_supports for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "Users can support discovery demand" on public.discovery_supports;
create policy "Users can support discovery demand"
  on public.discovery_supports for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.discovery_questions q
      where q.id = discovery_supports.discovery_id
        and q.semantic_kind = 'demand'
        and q.status = 'active'
        and q.moderation_status in ('unreviewed', 'approved')
    )
  );

alter table public.discovery_outcomes enable row level security;
grant select, insert on public.discovery_outcomes to authenticated;

drop policy if exists "Originators can read discovery outcomes" on public.discovery_outcomes;
create policy "Originators can read discovery outcomes"
  on public.discovery_outcomes for select
  to authenticated
  using (
    exists (
      select 1 from public.discovery_questions q
      where q.id = discovery_outcomes.discovery_id
        and q.origin_user_id = (select auth.uid())
    )
    or responder_user_id = (select auth.uid())
    or moderation_status = 'approved'
  );

drop policy if exists "Responders can propose discovery outcomes" on public.discovery_outcomes;
create policy "Responders can propose discovery outcomes"
  on public.discovery_outcomes for insert
  to authenticated
  with check (
    responder_user_id = (select auth.uid())
    and verification_status = 'pending'
    and moderation_status = 'pending'
    and exists (
      select 1
      from public.discovery_questions q
      where q.id = discovery_outcomes.discovery_id
        and q.status = 'active'
        and q.moderation_status in ('unreviewed', 'approved')
    )
  );

create or replace function public.create_find_or_ask_discovery(
  p_query text,
  p_kind text,
  p_city text default null,
  p_language text default 'en',
  p_source text default 'search',
  p_recovery text default null,
  p_author_name text default 'Community member'
)
returns table(discovery_id uuid, duplicate boolean, semantic_kind text, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_query text := btrim(coalesce(p_query, ''));
  v_city text := nullif(btrim(coalesce(p_city, '')), '');
  v_semantic text;
  v_existing uuid;
  v_id uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if char_length(v_query) < 3 or char_length(v_query) > 280 then
    raise exception 'Write between 3 and 280 characters';
  end if;
  if p_kind not in ('question', 'demand') then raise exception 'Choose question or demand'; end if;
  if p_recovery not in ('ask_people', 'request_something') then raise exception 'Explicit recovery choice required'; end if;
  if (p_kind = 'question' and p_recovery <> 'ask_people')
     or (p_kind = 'demand' and p_recovery <> 'request_something') then
    raise exception 'Recovery choice does not match the post type';
  end if;
  v_semantic := p_kind;

  perform pg_advisory_xact_lock(
    hashtextextended(
      concat_ws('|', v_user::text, v_semantic, lower(v_query), lower(coalesce(v_city, ''))),
      0
    )
  );

  select q.id into v_existing
  from public.discovery_questions q
  where q.origin_user_id = v_user
    and q.semantic_kind = v_semantic
    and lower(coalesce(q.origin_query, q.question)) = lower(v_query)
    and lower(coalesce(q.origin_city, '')) = lower(coalesce(v_city, ''))
    and q.status = 'active'
  order by q.created_at desc
  limit 1;

  if v_existing is not null then
    return query select v_existing, true, v_semantic, 'active'::text;
    return;
  end if;

  v_id := gen_random_uuid();
  insert into public.discovery_questions (
    id, question, category, author_name, threshold_for_moment, total_votes,
    is_moment_triggered, question_type, status, semantic_kind,
    origin_user_id, origin_query, origin_city, origin_language, origin_source,
    recovery_action, moderation_status, metadata
  ) values (
    v_id, v_query,
    case when v_semantic = 'question' then 'Community Question' else 'Community Demand' end,
    left(coalesce(nullif(btrim(p_author_name), ''), 'Community member'), 255),
    case when v_semantic = 'question' then 0 else 25 end,
    case when v_semantic = 'question' then 0 else 1 end,
    false,
    case when v_semantic = 'question' then 'community_question' else 'demand' end,
    'active', v_semantic, v_user, v_query, v_city,
    left(coalesce(nullif(btrim(p_language), ''), 'en'), 24),
    left(coalesce(nullif(btrim(p_source), ''), 'search'), 64),
    p_recovery, 'unreviewed',
    jsonb_build_object('find_or_ask', true, 'privacy', 'public_after_confirmation', 'submitted_at', now())
  );

  if v_semantic = 'demand' then
    insert into public.discovery_supports(discovery_id, user_id)
    values (v_id, v_user)
    on conflict (discovery_id, user_id) do nothing;
  end if;

  return query select v_id, false, v_semantic, 'active'::text;
end;
$$;

revoke all on function public.create_find_or_ask_discovery(text,text,text,text,text,text,text) from public;
grant execute on function public.create_find_or_ask_discovery(text,text,text,text,text,text,text) to authenticated;

create or replace function public.support_find_or_ask_demand(p_discovery_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_count integer;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if not exists (
    select 1 from public.discovery_questions q
    where q.id = p_discovery_id and q.semantic_kind = 'demand' and q.status = 'active'
  ) then raise exception 'Demand is unavailable'; end if;

  insert into public.discovery_supports(discovery_id, user_id)
  select p_discovery_id, v_user
  where not exists (
    select 1 from public.discovery_supports v
    where v.discovery_id = p_discovery_id and v.user_id = v_user
  );

  if found then
    update public.discovery_questions
    set total_votes = coalesce(total_votes, 0) + 1, updated_at = now()
    where id = p_discovery_id;
  end if;

  select coalesce(total_votes, 0) into v_count from public.discovery_questions where id = p_discovery_id;
  return v_count;
end;
$$;

revoke all on function public.support_find_or_ask_demand(uuid) from public;
grant execute on function public.support_find_or_ask_demand(uuid) to authenticated;

create or replace view public.view_public_find_or_ask_discoveries as
select
  q.id, q.question, q.category, q.author_name, q.semantic_kind,
  q.origin_city as city, q.origin_language as language, q.origin_source as source,
  q.recovery_action, q.created_at, q.updated_at, q.answered_at, q.status, q.moderation_status,
  case when q.semantic_kind = 'demand' then q.total_votes else null end as support_count,
  case when q.semantic_kind = 'demand' then nullif(q.threshold_for_moment, 0) else null end as demand_target,
  case when q.semantic_kind = 'demand' then exists (
    select 1 from public.discovery_supports s
    where s.discovery_id = q.id and s.user_id = auth.uid()
  ) else false end as user_supported,
  exists (
    select 1 from public.discovery_outcomes o
    where o.discovery_id = q.id and o.moderation_status = 'approved'
  ) as has_answer
from public.discovery_questions q
where q.status = 'active'
  and q.metadata->>'find_or_ask' = 'true'
  and q.question_type in ('community_question', 'demand')
  and q.moderation_status in ('unreviewed', 'approved');

grant select on public.view_public_find_or_ask_discoveries to anon, authenticated;

create or replace view public.view_public_discovery_outcomes as
select
  o.id, o.discovery_id, o.stakeholder_role, o.action_kind,
  o.canonical_object_type, o.canonical_object_id, o.canonical_object_url,
  o.source_label, o.source_url, o.freshness_at, o.verification_status,
  o.created_at, o.updated_at
from public.discovery_outcomes o
where o.moderation_status = 'approved';

grant select on public.view_public_discovery_outcomes to anon, authenticated;


create or replace function public.notify_find_or_ask_originator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  origin record;
  revision text;
  response_state text;
begin
  select q.origin_user_id, q.semantic_kind, q.question
    into origin
  from public.discovery_questions q
  where q.id = new.discovery_id;

  if origin.origin_user_id is null then return new; end if;

  response_state := case
    when new.verification_status = 'verified' then 'verified'
    when new.moderation_status = 'rejected' or new.verification_status = 'rejected' then 'rejected'
    else 'submitted'
  end;

  if tg_op = 'UPDATE'
     and row(new.verification_status, new.moderation_status)
         is not distinct from row(old.verification_status, old.moderation_status) then
    return new;
  end if;

  revision := response_state || ':' || new.id::text;

  begin
    insert into public.notifications (
      user_id, notification_type, type, title, message, related_id, is_read,
      dedupe_key, action_url, route, metadata
    ) values (
      origin.origin_user_id,
      'market_watch_changed',
      'find_or_ask_response',
      case when response_state = 'verified'
        then 'An answer was verified'
        else 'A response came back'
      end,
      case
        when response_state = 'verified' then 'A response to “' || left(origin.question, 120) || '” was verified. Open it to see the source and freshness.'
        when response_state = 'rejected' then 'A response to your post did not pass verification. Your original question or request is still open.'
        else 'Someone responded to “' || left(origin.question, 120) || '”. Open it to see the source, freshness and verification status.'
      end,
      new.discovery_id,
      false,
      'find-or-ask:' || revision || ':' || origin.origin_user_id::text,
      '/search?posted=' || new.discovery_id::text,
      '/search?posted=' || new.discovery_id::text,
      jsonb_build_object(
        'discovery_id', new.discovery_id,
        'outcome_id', new.id,
        'semantic_kind', origin.semantic_kind,
        'verification_status', new.verification_status,
        'moderation_status', new.moderation_status
      )
    )
    on conflict (dedupe_key) do nothing;
  exception when others then
    raise warning 'Find-or-Ask notification failed for %: %', new.discovery_id, sqlerrm;
  end;

  return new;
end;
$$;

revoke all on function public.notify_find_or_ask_originator() from public, anon, authenticated;

drop trigger if exists trg_notify_find_or_ask_originator on public.discovery_outcomes;
create trigger trg_notify_find_or_ask_originator
after insert or update of verification_status, moderation_status on public.discovery_outcomes
for each row execute function public.notify_find_or_ask_originator();

notify pgrst, 'reload schema';
