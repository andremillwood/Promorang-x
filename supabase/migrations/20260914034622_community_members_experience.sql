-- Private community operations. Browser roles have no direct table or RPC access.
-- Verified API identity is passed to service-only, SECURITY INVOKER functions.
create table public.community_spaces (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  name text not null, timezone text not null default 'America/Jamaica'
);
insert into public.community_spaces(id,slug,name)
values ('b8ca4dba-f067-4daf-9206-b2908ff7aa11','promorang','Promorang Community')
on conflict (id) do nothing;

create table public.community_memberships (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.community_spaces(id),
  user_id uuid not null references public.users(id),
  status text not null default 'pending' check(status in ('pending','active','paused','removed')),
  tier text not null default 'free' check(tier in ('free','premium','super')),
  can_manage boolean not null default false,
  display_name text not null, career_path text not null, personal_goal text not null,
  pods text[] not null default '{general}',
  created_at timestamptz not null default now(), joined_at timestamptz,
  unique(space_id,user_id)
);
create table public.community_goals (
  id uuid primary key default gen_random_uuid(), space_id uuid not null references public.community_spaces(id),
  owner_id uuid not null references public.users(id), title text not null, why text not null,
  starts_on date not null, ends_on date not null, check(ends_on >= starts_on),
  created_at timestamptz not null default now()
);
create table public.community_results (
  id uuid primary key default gen_random_uuid(), goal_id uuid not null references public.community_goals(id),
  title text not null, unit text not null, target numeric not null check(target > 0),
  current_value numeric not null default 0 check(current_value >= 0)
);
create table public.community_role_definitions (
  slug text primary key, name text not null, kind text not null,
  tiers text[] not null, min_points integer not null default 60 check(min_points >= 0),
  min_moves integer not null default 2 check(min_moves > 0),
  term_days integer not null default 90 check(term_days between 30 and 180),
  review_days integer not null default 30 check(review_days between 7 and 90),
  grace_days integer not null default 7 check(grace_days between 1 and 30)
);
insert into public.community_role_definitions(slug,name,kind,tiers) values
('ambassador','Community Ambassador','onboarding','{premium,super}'),
('creator','Content Creator','content','{free,premium,super}'),
('coordinator','Event Coordinator','session','{premium,super}'),
('growth','Growth Champion','distribution','{free,premium,super}'),
('taskmaster','Task Master','operations','{free,premium,super}'),
('mentor','Mentor','mentoring','{premium,super}')
on conflict (slug) do nothing;

create table public.community_role_seats (
  id uuid primary key default gen_random_uuid(), space_id uuid not null references public.community_spaces(id),
  user_id uuid not null references public.users(id), role_slug text not null references public.community_role_definitions(slug),
  status text not null default 'applied' check(status in ('applied','active','grace','paused','declined')),
  application text not null, starts_at timestamptz, term_ends_at timestamptz,
  review_at timestamptz, grace_until timestamptz,
  review_note text, unique(space_id,user_id,role_slug)
);
create table public.community_moves (
  id uuid primary key default gen_random_uuid(), space_id uuid not null references public.community_spaces(id),
  created_by uuid not null references public.users(id), result_id uuid references public.community_results(id),
  title text not null, brief text not null, proof_prompt text not null,
  kind text not null check(kind in ('content','distribution','onboarding','mentoring','session','operations','feedback')),
  pod text not null default 'general',
  status text not null default 'proposed' check(status in ('proposed','open','closed')),
  points integer not null default 0 check(points between 0 and 1000),
  gems numeric(18,2) not null default 0 check(gems >= 0),
  capacity integer not null default 1 check(capacity between 1 and 500),
  min_tier text not null default 'free' check(min_tier in ('free','premium','super')),
  required_role text references public.community_role_definitions(slug),
  due_at timestamptz not null, published_at timestamptz, created_at timestamptz not null default now(),
  funder_id uuid references public.users(id), secured_gems numeric(18,2) not null default 0,
  released_gems numeric(18,2) not null default 0, refunded_gems numeric(18,2) not null default 0,
  check(secured_gems >= 0 and released_gems >= 0 and refunded_gems >= 0),
  check(released_gems + refunded_gems <= secured_gems)
);
create table public.community_submissions (
  id uuid primary key default gen_random_uuid(), move_id uuid not null references public.community_moves(id),
  user_id uuid not null references public.users(id),
  status text not null default 'claimed' check(status in ('claimed','submitted','changes_requested','approved','declined','withdrawn')),
  proof text, proof_url text, submitted_at timestamptz, reviewed_at timestamptz,
  reviewed_by uuid references public.users(id), feedback text,
  verified_value numeric not null default 0 check(verified_value >= 0),
  points_awarded integer not null default 0, gems_awarded numeric(18,2) not null default 0,
  created_at timestamptz not null default now(), unique(move_id,user_id)
);
create table public.community_sessions (
  id uuid primary key default gen_random_uuid(), space_id uuid not null references public.community_spaces(id),
  title text not null, description text not null, starts_at timestamptz not null,
  duration_minutes integer not null default 60 check(duration_minutes between 15 and 480),
  min_tier text not null default 'free' check(min_tier in ('free','premium','super')),
  required_role text references public.community_role_definitions(slug),
  host_id uuid not null references public.users(id), join_url text, replay_url text,
  moment_id uuid references public.moments(id)
);
create table public.community_session_rsvps (
  session_id uuid not null references public.community_sessions(id),
  user_id uuid not null references public.users(id), created_at timestamptz not null default now(),
  primary key(session_id,user_id)
);
create table public.community_posts (
  id uuid primary key default gen_random_uuid(), space_id uuid not null references public.community_spaces(id),
  author_id uuid not null references public.users(id), author_name text not null,
  kind text not null check(kind in ('note','feedback','big_up','resource','newsletter')),
  pod text not null default 'general', title text not null, body text not null, href text,
  min_tier text not null default 'free' check(min_tier in ('free','premium','super')),
  required_role text references public.community_role_definitions(slug),
  created_at timestamptz not null default now()
);
create table public.community_audit (
  id uuid primary key default gen_random_uuid(), space_id uuid not null references public.community_spaces(id),
  actor_id uuid not null references public.users(id), action text not null,
  record_id uuid, detail jsonb not null default '{}', created_at timestamptz not null default now()
);
create index on public.community_memberships(user_id,status);
create index on public.community_goals(space_id,ends_on);
create index on public.community_results(goal_id);
create index on public.community_moves(space_id,status,due_at);
create index on public.community_moves(result_id);
create index on public.community_submissions(user_id,reviewed_at desc);
create index on public.community_submissions(move_id,status);
create index on public.community_sessions(space_id,starts_at);
create index on public.community_posts(space_id,created_at desc);
create index on public.community_audit(space_id,created_at desc);

do $$ declare t text; begin
  foreach t in array array['community_spaces','community_memberships','community_goals','community_results',
    'community_role_definitions','community_role_seats','community_moves','community_submissions',
    'community_sessions','community_session_rsvps','community_posts','community_audit'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated',t);
    execute format('grant all on table public.%I to service_role',t);
  end loop;
end $$;

create function public.community_role_active(p_space uuid,p_user uuid,p_role text)
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from public.community_role_seats s
    join public.community_role_definitions d on d.slug=s.role_slug
    join public.community_memberships m on m.space_id=s.space_id and m.user_id=s.user_id
    where s.space_id=p_space and s.user_id=p_user and s.role_slug=p_role
    and m.status='active' and m.tier=any(d.tiers) and s.term_ends_at>now()
    and ((s.status='active' and s.review_at + make_interval(days=>d.grace_days)>now())
      or (s.status='grace' and s.grace_until>now())))
$$;

create function public.community_command(p_actor uuid,p_action text,p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_space uuid := 'b8ca4dba-f067-4daf-9206-b2908ff7aa11';
  m public.community_memberships%rowtype;
  j public.community_moves%rowtype;
  s public.community_submissions%rowtype;
  seat public.community_role_seats%rowtype;
  def public.community_role_definitions%rowtype;
  event public.community_sessions%rowtype;
  v_id uuid; v_result uuid; v_count integer; v_points integer; v_gems numeric;
  v_value numeric; v_allowed boolean; v_item jsonb; v_out jsonb;
begin
  -- Lock the caller membership for the mutation: suspension cannot race this action.
  select * into m from public.community_memberships
    where space_id=v_space and user_id=p_actor for update;

  if p_action='apply' then
    if found then return to_jsonb(m); end if;
    insert into public.community_memberships(space_id,user_id,display_name,career_path,personal_goal)
    values(v_space,p_actor,p_data->>'display_name',p_data->>'career_path',p_data->>'personal_goal')
    on conflict(space_id,user_id) do nothing;
    select * into m from public.community_memberships where space_id=v_space and user_id=p_actor;
    return to_jsonb(m);
  end if;

  -- First lead comes only from the protected platform role table, never user_metadata.
  if p_action='bootstrap' then
    if not exists(select 1 from public.user_roles where user_id=p_actor
      and role::text in ('admin','administrator','master_admin')) then
      raise exception 'A platform administrator must open the community' using errcode='42501';
    end if;
    insert into public.community_memberships(space_id,user_id,status,tier,can_manage,display_name,career_path,personal_goal,joined_at)
    values(v_space,p_actor,'active','super',true,p_data->>'display_name','Community Leader','Help members reach real wins',now())
    on conflict(space_id,user_id) do update set status='active',can_manage=true,joined_at=coalesce(community_memberships.joined_at,now())
    returning * into m;
    insert into public.community_audit(space_id,actor_id,action,record_id) values(v_space,p_actor,p_action,m.id);
    return to_jsonb(m);
  end if;

  if m.id is null or m.status<>'active' then
    raise exception 'Active community membership required' using errcode='42501';
  end if;
  if p_action in ('membership','goal','publish','close','review','appoint','review_role','session','policy','release_claim','lead_access') and not m.can_manage then
    raise exception 'A community lead must do this' using errcode='42501';
  end if;

  if p_action='profile' then
    update public.community_memberships set career_path=p_data->>'career_path',personal_goal=p_data->>'personal_goal',
      pods=array(select jsonb_array_elements_text(p_data->'pods')) where id=m.id returning to_jsonb(community_memberships.*) into v_out;
    v_id:=m.id;

  elsif p_action='membership' then
    v_id:=(p_data->>'id')::uuid;
    if exists(select 1 from public.community_memberships where id=v_id and can_manage) then
      raise exception 'Lead access is managed by a platform administrator' using errcode='42501';
    end if;
    update public.community_memberships set status=p_data->>'status',tier=p_data->>'tier',
      joined_at=case when p_data->>'status'='active' then coalesce(joined_at,now()) else joined_at end
      where id=v_id and space_id=v_space returning to_jsonb(community_memberships.*) into v_out;
    if v_out is null then raise exception 'Membership not found'; end if;

  elsif p_action='lead_access' then
    if not exists(select 1 from public.user_roles where user_id=p_actor and role::text in ('admin','administrator','master_admin')) then
      raise exception 'A platform administrator must manage leads' using errcode='42501'; end if;
    v_id:=(p_data->>'id')::uuid;
    if v_id=m.id then raise exception 'Another administrator must change your lead access'; end if;
    update public.community_memberships set can_manage=(p_data->>'can_manage')::boolean
      where id=v_id and space_id=v_space and status='active' returning to_jsonb(community_memberships.*) into v_out;
    if v_out is null then raise exception 'An active membership is required'; end if;

  elsif p_action='goal' then
    insert into public.community_goals(space_id,owner_id,title,why,starts_on,ends_on)
    values(v_space,p_actor,p_data->>'title',p_data->>'why',(p_data->>'starts_on')::date,(p_data->>'ends_on')::date)
    returning id into v_id;
    for v_item in select * from jsonb_array_elements(p_data->'results') loop
      insert into public.community_results(goal_id,title,unit,target)
      values(v_id,v_item->>'title',v_item->>'unit',(v_item->>'target')::numeric);
    end loop;
    v_out:=jsonb_build_object('id',v_id);

  elsif p_action='propose' then
    v_result:=(p_data->>'result_id')::uuid;
    if v_result is not null and not exists(select 1 from public.community_results r join public.community_goals g on g.id=r.goal_id
      where r.id=v_result and g.space_id=v_space) then raise exception 'Choose a community goal'; end if;
    if (p_data->>'due_at')::timestamptz<=now() then raise exception 'Choose a future deadline'; end if;
    insert into public.community_moves(space_id,created_by,result_id,title,brief,proof_prompt,kind,pod,points,gems,capacity,min_tier,required_role,due_at)
    values(v_space,p_actor,v_result,p_data->>'title',p_data->>'brief',p_data->>'proof_prompt',p_data->>'kind',p_data->>'pod',
      (p_data->>'points')::integer,(p_data->>'gems')::numeric,(p_data->>'capacity')::integer,p_data->>'min_tier',p_data->>'required_role',(p_data->>'due_at')::timestamptz)
    returning to_jsonb(community_moves.*),id into v_out,v_id;

  elsif p_action in ('publish','close','claim','submit','withdraw','review','release_claim') then
    -- Always lock the move before a submission. Capacity, rewards, and refunds share this lock.
    v_id:=(p_data->>'move_id')::uuid;
    select * into j from public.community_moves where id=v_id and space_id=v_space for update;
    if not found then raise exception 'Move not found'; end if;

    if p_action='publish' then
      if j.status='open' then return to_jsonb(j); end if;
      if j.status<>'proposed' or j.due_at<=now() then raise exception 'This move cannot be opened'; end if;
      if j.result_id is null then raise exception 'Link this move to a measurable win before opening it'; end if;
      if j.gems>0 then
        perform public.post_economy_transaction(p_actor,'gems',-(j.gems*j.capacity),'spend','community_job_funding',
          'community:fund:'||j.id::text,j.id,'community_moves','Set aside Gems for community work','{}');
      end if;
      update public.community_moves set status='open',published_at=now(),funder_id=p_actor,secured_gems=gems*capacity
        where id=j.id returning to_jsonb(community_moves.*) into v_out;

    elsif p_action='close' then
      if j.status='closed' then return to_jsonb(j); end if;
      if exists(select 1 from public.community_submissions where move_id=j.id and status in ('claimed','submitted','changes_requested')) then
        raise exception 'Resolve or withdraw existing work before closing this move';
      end if;
      v_gems:=j.secured_gems-j.released_gems-j.refunded_gems;
      if v_gems>0 then
        perform public.post_economy_transaction(j.funder_id,'gems',v_gems,'refund','community_job_refund',
          'community:refund:'||j.id::text,j.id,'community_moves','Unused community work funding returned','{}');
      end if;
      update public.community_moves set status='closed',refunded_gems=refunded_gems+v_gems
        where id=j.id returning to_jsonb(community_moves.*) into v_out;

    elsif p_action='claim' then
      if j.status<>'open' or j.due_at<=now() then raise exception 'This move is no longer open'; end if;
      if array_position(array['free','premium','super'],m.tier)<array_position(array['free','premium','super'],j.min_tier)
        or (j.required_role is not null and not public.community_role_active(v_space,p_actor,j.required_role)) then
        raise exception 'This move needs a different community tier or active role' using errcode='42501';
      end if;
      select * into s from public.community_submissions where move_id=j.id and user_id=p_actor;
      if found then
        -- A declined or withdrawn claim may be tried again while the move is open.
        -- Preserve the one-row-per-member constraint while clearing old proof/review data.
        if s.status in ('declined','withdrawn') then
          update public.community_submissions set status='claimed',proof=null,proof_url=null,submitted_at=null,
            reviewed_at=null,reviewed_by=null,feedback=null,verified_value=0,points_awarded=0,gems_awarded=0
            where id=s.id returning to_jsonb(community_submissions.*) into v_out;
          return v_out;
        else
          return to_jsonb(s);
        end if;
      end if;
      select count(*) into v_count from public.community_submissions where move_id=j.id and status not in ('declined','withdrawn');
      if v_count>=j.capacity then raise exception 'All places on this move are taken'; end if;
      insert into public.community_submissions(move_id,user_id) values(j.id,p_actor)
        returning to_jsonb(community_submissions.*) into v_out;

    else
      select * into s from public.community_submissions
        where move_id=j.id and id=(p_data->>'submission_id')::uuid for update;
      if not found then raise exception 'Work not found'; end if;
      if p_action in ('submit','withdraw') and s.user_id<>p_actor then
        raise exception 'This is another member’s work' using errcode='42501';
      end if;
      if p_action='submit' then
        if s.status not in ('claimed','changes_requested') then raise exception 'This work cannot be submitted again yet'; end if;
        if j.status<>'open' then raise exception 'This move is closed'; end if;
        if length(trim(coalesce(p_data->>'proof','')))<10 then raise exception 'Describe what you did and show the result'; end if;
        -- Existing claims can submit late. The reviewer sees the deadline and decides on acceptance.
        update public.community_submissions set status='submitted',proof=p_data->>'proof',proof_url=p_data->>'proof_url',submitted_at=now()
          where id=s.id returning to_jsonb(community_submissions.*) into v_out;
      elsif p_action='withdraw' then
        if s.status not in ('claimed','changes_requested') then raise exception 'Only unreviewed work can be withdrawn'; end if;
        update public.community_submissions set status='withdrawn' where id=s.id returning to_jsonb(community_submissions.*) into v_out;
      elsif p_action='release_claim' then
        if j.due_at>now() or s.status not in ('claimed','changes_requested') then
          raise exception 'Only unfinished work past its deadline can be released'; end if;
        update public.community_submissions set status='withdrawn',feedback=p_data->>'feedback',reviewed_by=p_actor,reviewed_at=now()
          where id=s.id returning to_jsonb(community_submissions.*) into v_out;
      elsif p_action='review' then
        if s.user_id=p_actor then raise exception 'Another lead must review your work' using errcode='42501'; end if;
        if s.status='approved' then return to_jsonb(s); end if;
        if s.status<>'submitted' then raise exception 'This work is not waiting for review'; end if;
        if p_data->>'decision' not in ('approved','changes_requested','declined') then raise exception 'Choose a review outcome'; end if;
        v_value:=coalesce((p_data->>'verified_value')::numeric,0);
        if v_value<0 then raise exception 'Verified result cannot be negative'; end if;
        if p_data->>'decision'='approved' then
          if j.released_gems+j.refunded_gems+j.gems>j.secured_gems then raise exception 'The job funding is not available'; end if;
          if j.points>0 then
            perform public.post_economy_transaction(s.user_id,'points',j.points,'earn','community_contribution',
              'community:points:'||s.id::text,s.id,'community_submissions','Community contribution approved','{}');
          end if;
          if j.gems>0 then
            perform public.post_economy_transaction(s.user_id,'gems',j.gems,'earn','community_job',
              'community:gems:'||s.id::text,s.id,'community_submissions','Community job approved','{}');
          end if;
          update public.community_moves set released_gems=released_gems+j.gems where id=j.id;
          update public.community_results set current_value=current_value+v_value where id=j.result_id;
        end if;
        update public.community_submissions set status=p_data->>'decision',feedback=p_data->>'feedback',reviewed_by=p_actor,reviewed_at=now(),
          verified_value=case when p_data->>'decision'='approved' then v_value else 0 end,
          points_awarded=case when p_data->>'decision'='approved' then j.points else 0 end,
          gems_awarded=case when p_data->>'decision'='approved' then j.gems else 0 end
          where id=s.id returning to_jsonb(community_submissions.*) into v_out;
      end if;
    end if;

  elsif p_action='apply_role' then
    select * into def from public.community_role_definitions where slug=p_data->>'role_slug';
    if not found or not m.tier=any(def.tiers) then raise exception 'This role is not open to your community tier'; end if;
    insert into public.community_role_seats(space_id,user_id,role_slug,application)
    values(v_space,p_actor,def.slug,p_data->>'application')
    on conflict(space_id,user_id,role_slug) do update set application=excluded.application,
      status=case when community_role_seats.status in ('declined','paused') or community_role_seats.term_ends_at<=now()
        or (community_role_seats.status='active' and community_role_seats.review_at+make_interval(days=>def.grace_days)<=now())
        or (community_role_seats.status='grace' and community_role_seats.grace_until<=now())
        then 'applied' else community_role_seats.status end
    returning to_jsonb(community_role_seats.*),id into v_out,v_id;

  elsif p_action in ('appoint','review_role') then
    select * into seat from public.community_role_seats where id=(p_data->>'id')::uuid and space_id=v_space for update;
    if not found then raise exception 'Role application not found'; end if;
    if seat.user_id=p_actor then raise exception 'Another lead must review your role' using errcode='42501'; end if;
    select * into def from public.community_role_definitions where slug=seat.role_slug;
    if not exists(select 1 from public.community_memberships where space_id=v_space and user_id=seat.user_id and status='active' and tier=any(def.tiers)) then
      raise exception 'The member must have an eligible active membership'; end if;
    v_id:=seat.id;
    if p_action='appoint' then
      if seat.status<>'applied' then raise exception 'This application has already been reviewed'; end if;
      update public.community_role_seats set status=case when (p_data->>'approved')::boolean then 'active' else 'declined' end,
        starts_at=now(),term_ends_at=now()+make_interval(days=>def.term_days),
        review_at=now()+make_interval(days=>def.review_days),grace_until=null,review_note=p_data->>'note'
        where id=seat.id returning to_jsonb(community_role_seats.*) into v_out;
    else
      if seat.status not in ('active','grace','paused') then raise exception 'Appoint the member before reviewing this role'; end if;
      select coalesce(sum(su.points_awarded),0),count(*) filter(where mv.kind=def.kind) into v_points,v_count
        from public.community_submissions su join public.community_moves mv on mv.id=su.move_id
        where mv.space_id=v_space and su.user_id=seat.user_id and su.status='approved'
          and su.reviewed_at>=now()-make_interval(days=>def.review_days);
      v_allowed:=v_points>=def.min_points and v_count>=def.min_moves;
      update public.community_role_seats set
        status=case when term_ends_at<=now() then 'paused' when v_allowed then 'active'
          when seat.status='grace' and seat.grace_until<=now() then 'paused' else 'grace' end,
        review_at=case when v_allowed then now()+make_interval(days=>def.review_days) else review_at end,
        grace_until=case when v_allowed then null else coalesce(grace_until,now()+make_interval(days=>def.grace_days)) end,
        review_note=p_data->>'note'
        where id=seat.id returning to_jsonb(community_role_seats.*) into v_out;
    end if;

  elsif p_action='policy' then
    update public.community_role_definitions set min_points=(p_data->>'min_points')::integer,min_moves=(p_data->>'min_moves')::integer
      where slug=p_data->>'role_slug';
    v_out:=jsonb_build_object('updated',true);

  elsif p_action='session' then
    insert into public.community_sessions(space_id,title,description,starts_at,duration_minutes,min_tier,required_role,host_id,join_url,replay_url,moment_id)
    values(v_space,p_data->>'title',p_data->>'description',(p_data->>'starts_at')::timestamptz,(p_data->>'duration_minutes')::integer,
      p_data->>'min_tier',p_data->>'required_role',p_actor,p_data->>'join_url',p_data->>'replay_url',(p_data->>'moment_id')::uuid)
    returning to_jsonb(community_sessions.*),id into v_out,v_id;

  elsif p_action='rsvp' then
    select * into event from public.community_sessions where id=(p_data->>'id')::uuid and space_id=v_space;
    if not found then raise exception 'Session not found'; end if;
    if event.starts_at + make_interval(mins=>event.duration_minutes)<=now() then raise exception 'This session has ended'; end if;
    if array_position(array['free','premium','super'],m.tier)<array_position(array['free','premium','super'],event.min_tier)
      or (event.required_role is not null and not public.community_role_active(v_space,p_actor,event.required_role)) then
      raise exception 'This session needs a different community tier or active role' using errcode='42501'; end if;
    insert into public.community_session_rsvps(session_id,user_id) values(event.id,p_actor) on conflict do nothing;
    v_id:=event.id; v_out:=jsonb_build_object('joined',true);

  elsif p_action='post' then
    if p_data->>'kind' in ('resource','newsletter') and not m.can_manage then
      raise exception 'A lead publishes community resources and newsletters' using errcode='42501'; end if;
    if p_data->>'required_role' is not null and not m.can_manage and not public.community_role_active(v_space,p_actor,p_data->>'required_role') then
      raise exception 'An active role is required for this room' using errcode='42501'; end if;
    insert into public.community_posts(space_id,author_id,author_name,kind,pod,title,body,href,min_tier,required_role)
    values(v_space,p_actor,m.display_name,p_data->>'kind',p_data->>'pod',p_data->>'title',p_data->>'body',p_data->>'href',
      case when m.can_manage then p_data->>'min_tier' else 'free' end,p_data->>'required_role')
    returning to_jsonb(community_posts.*),id into v_out,v_id;

  else raise exception 'Unknown community action';
  end if;
  insert into public.community_audit(space_id,actor_id,action,record_id,detail)
    values(v_space,p_actor,p_action,v_id,jsonb_build_object('record',v_out));
  return v_out;
end $$;
revoke all on function public.community_role_active(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.community_command(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.community_role_active(uuid,uuid,text) to service_role;
grant execute on function public.community_command(uuid,text,jsonb) to service_role;
