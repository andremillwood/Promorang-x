-- =====================================================
-- PROMORANG SOCIAL AMPLIFICATION
-- Comprehensive social features: follows, connections, activity feed, reactions
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================
-- USER FOLLOWS TABLE
-- One-directional follow relationships (like Twitter/Instagram)
-- =====================================================
create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  
  constraint unique_follow unique(follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

-- Indexes
create index if not exists idx_user_follows_follower on public.user_follows(follower_id);
create index if not exists idx_user_follows_following on public.user_follows(following_id);
create index if not exists idx_user_follows_created on public.user_follows(created_at desc);

-- =====================================================
-- USER CONNECTIONS TABLE
-- Two-way connection requests (like LinkedIn/Facebook)
-- =====================================================
create table if not exists public.user_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'blocked')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint unique_connection unique(requester_id, receiver_id),
  constraint no_self_connection check (requester_id != receiver_id)
);

-- Indexes
create index if not exists idx_user_connections_requester on public.user_connections(requester_id, status);
create index if not exists idx_user_connections_receiver on public.user_connections(receiver_id, status);
create index if not exists idx_user_connections_status on public.user_connections(status) where status = 'pending';

-- =====================================================
-- ACTIVITY FEED TABLE
-- User activities for personalized feed
-- =====================================================
create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  activity_type text not null check (activity_type in (
    'post', 'drop_completion', 'product_purchase', 'review', 
    'follow', 'connection', 'achievement', 'referral', 'campaign'
  )),
  
  -- Reference to the activity source
  source_id uuid,
  source_table text,
  
  -- Activity content
  title text,
  description text,
  image_url text,
  metadata jsonb default '{}'::jsonb,
  
  -- Engagement metrics
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  
  -- Visibility
  visibility text not null default 'public' check (visibility in ('public', 'connections', 'private')),
  is_pinned boolean not null default false,
  
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Indexes
create index if not exists idx_activity_feed_user on public.activity_feed(user_id, created_at desc);
create index if not exists idx_activity_feed_type on public.activity_feed(activity_type, created_at desc);
create index if not exists idx_activity_feed_visibility on public.activity_feed(visibility, created_at desc) where visibility = 'public';
create index if not exists idx_activity_feed_source on public.activity_feed(source_table, source_id);
create index if not exists idx_activity_feed_pinned on public.activity_feed(is_pinned, created_at desc) where is_pinned = true;

-- =====================================================
-- REACTIONS TABLE
-- Reactions to various content (likes, loves, etc.)
-- =====================================================
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  
  -- What is being reacted to
  target_type text not null check (target_type in (
    'activity', 'comment', 'product', 'drop', 'review', 'post'
  )),
  target_id uuid not null,
  
  -- Reaction type
  reaction_type text not null default 'like' check (reaction_type in (
    'like', 'love', 'celebrate', 'support', 'insightful', 'curious'
  )),
  
  created_at timestamptz not null default timezone('utc', now()),
  
  constraint unique_reaction unique(user_id, target_type, target_id, reaction_type)
);

-- Indexes
create index if not exists idx_reactions_user on public.reactions(user_id, created_at desc);
create index if not exists idx_reactions_target on public.reactions(target_type, target_id, reaction_type);
create index if not exists idx_reactions_type on public.reactions(reaction_type);

-- =====================================================
-- COMMENTS TABLE
-- Comments on various content
-- =====================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  
  -- What is being commented on
  target_type text not null check (target_type in (
    'activity', 'product', 'drop', 'review', 'post'
  )),
  target_id uuid not null,
  
  -- Comment content
  comment_text text not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  
  -- Engagement
  likes_count integer not null default 0,
  replies_count integer not null default 0,
  
  -- Moderation
  is_edited boolean not null default false,
  is_deleted boolean not null default false,
  
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Indexes
create index if not exists idx_comments_user on public.comments(user_id, created_at desc);
create index if not exists idx_comments_target on public.comments(target_type, target_id, created_at desc);
create index if not exists idx_comments_parent on public.comments(parent_comment_id) where parent_comment_id is not null;

-- =====================================================
-- POSTS TABLE
-- User-generated posts (text, images, links)
-- =====================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  
  -- Post content
  content text,
  images text[] default '{}',
  link_url text,
  link_title text,
  link_description text,
  link_image text,
  
  -- Post type
  post_type text not null default 'text' check (post_type in ('text', 'image', 'link', 'poll')),
  
  -- Engagement metrics
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  views_count integer not null default 0,
  
  -- Visibility
  visibility text not null default 'public' check (visibility in ('public', 'connections', 'private')),
  
  -- Moderation
  is_pinned boolean not null default false,
  is_featured boolean not null default false,
  
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Indexes
create index if not exists idx_posts_user on public.posts(user_id, created_at desc);
create index if not exists idx_posts_visibility on public.posts(visibility, created_at desc) where visibility = 'public';
create index if not exists idx_posts_featured on public.posts(is_featured, created_at desc) where is_featured = true;
create index if not exists idx_posts_engagement on public.posts(likes_count desc, created_at desc);

-- =====================================================
-- NOTIFICATIONS TABLE
-- User notifications for social interactions
-- =====================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  
  -- Notification type
  notification_type text not null check (notification_type in (
    'follow', 'connection_request', 'connection_accepted',
    'like', 'comment', 'mention', 'share',
    'order_update', 'referral_earning', 'achievement'
  )),
  
  -- Who triggered the notification
  actor_id uuid references public.users(id) on delete cascade,
  
  -- What the notification is about
  target_type text,
  target_id uuid,
  
  -- Notification content
  title text not null,
  message text,
  image_url text,
  action_url text,
  
  -- Status
  is_read boolean not null default false,
  read_at timestamptz,
  
  created_at timestamptz not null default timezone('utc', now())
);

-- Indexes
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read, created_at desc) where is_read = false;
create index if not exists idx_notifications_type on public.notifications(notification_type, created_at desc);

-- =====================================================
-- EXTEND USERS TABLE
-- Add social-related columns
-- =====================================================
alter table public.users add column if not exists followers_count integer not null default 0;
alter table public.users add column if not exists following_count integer not null default 0;
alter table public.users add column if not exists connections_count integer not null default 0;
alter table public.users add column if not exists posts_count integer not null default 0;
alter table public.users add column if not exists bio text;
alter table public.users add column if not exists website_url text;
alter table public.users add column if not exists social_links jsonb default '{}'::jsonb;
alter table public.users add column if not exists is_verified boolean not null default false;
alter table public.users add column if not exists last_active_at timestamptz default timezone('utc', now());

-- =====================================================
-- TRIGGERS
-- Automatic updates and notifications
-- =====================================================

-- Update follower/following counts
create or replace function public.update_follow_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.users set following_count = following_count + 1 where id = new.follower_id;
    update public.users set followers_count = followers_count + 1 where id = new.following_id;
    
    -- Create notification
    insert into public.notifications (user_id, notification_type, actor_id, title, action_url)
    values (
      new.following_id,
      'follow',
      new.follower_id,
      'New follower',
      '/profile/' || (select username from public.users where id = new.follower_id)
    );
  elsif tg_op = 'DELETE' then
    update public.users set following_count = following_count - 1 where id = old.follower_id;
    update public.users set followers_count = followers_count - 1 where id = old.following_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_follow_counts
  after insert or delete on public.user_follows
  for each row
  execute function public.update_follow_counts();

-- Update connection counts
create or replace function public.update_connection_counts()
returns trigger as $$
begin
  if new.status = 'accepted' and (old.status is null or old.status != 'accepted') then
    update public.users set connections_count = connections_count + 1 
    where id in (new.requester_id, new.receiver_id);
    
    -- Create notification
    insert into public.notifications (user_id, notification_type, actor_id, title, action_url)
    values (
      new.requester_id,
      'connection_accepted',
      new.receiver_id,
      'Connection accepted',
      '/profile/' || (select username from public.users where id = new.receiver_id)
    );
  elsif new.status = 'pending' and old.status is null then
    -- Create notification for connection request
    insert into public.notifications (user_id, notification_type, actor_id, title, action_url)
    values (
      new.receiver_id,
      'connection_request',
      new.requester_id,
      'New connection request',
      '/connections/requests'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_connection_counts
  after insert or update on public.user_connections
  for each row
  execute function public.update_connection_counts();

-- Update engagement counts on reactions
create or replace function public.update_reaction_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if new.target_type = 'activity' then
      update public.activity_feed set likes_count = likes_count + 1 where id = new.target_id;
    elsif new.target_type = 'post' then
      update public.posts set likes_count = likes_count + 1 where id = new.target_id;
    elsif new.target_type = 'comment' then
      update public.comments set likes_count = likes_count + 1 where id = new.target_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.target_type = 'activity' then
      update public.activity_feed set likes_count = likes_count - 1 where id = old.target_id;
    elsif old.target_type = 'post' then
      update public.posts set likes_count = likes_count - 1 where id = old.target_id;
    elsif old.target_type = 'comment' then
      update public.comments set likes_count = likes_count - 1 where id = old.target_id;
    end if;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_reaction_counts
  after insert or delete on public.reactions
  for each row
  execute function public.update_reaction_counts();

-- Update comment counts
create or replace function public.update_comment_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' and not new.is_deleted then
    if new.target_type = 'activity' then
      update public.activity_feed set comments_count = comments_count + 1 where id = new.target_id;
    elsif new.target_type = 'post' then
      update public.posts set comments_count = comments_count + 1 where id = new.target_id;
    end if;
    
    if new.parent_comment_id is not null then
      update public.comments set replies_count = replies_count + 1 where id = new.parent_comment_id;
    end if;
  elsif tg_op = 'UPDATE' and new.is_deleted and not old.is_deleted then
    if new.target_type = 'activity' then
      update public.activity_feed set comments_count = comments_count - 1 where id = new.target_id;
    elsif new.target_type = 'post' then
      update public.posts set comments_count = comments_count - 1 where id = new.target_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_comment_counts
  after insert or update on public.comments
  for each row
  execute function public.update_comment_counts();

-- Update posts count
create or replace function public.update_posts_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.users set posts_count = posts_count + 1 where id = new.user_id;
  elsif tg_op = 'DELETE' then
    update public.users set posts_count = posts_count - 1 where id = old.user_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_posts_count
  after insert or delete on public.posts
  for each row
  execute function public.update_posts_count();

-- Auto-update timestamps
create or replace function public.update_social_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_activity_feed_timestamp'
      and tgrelid = 'public.activity_feed'::regclass
  ) then
    execute 'drop trigger trg_activity_feed_timestamp on public.activity_feed;';
  end if;

  execute '
    create trigger trg_activity_feed_timestamp
      before update on public.activity_feed
      for each row execute function public.update_social_timestamp();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_comments_timestamp'
      and tgrelid = 'public.comments'::regclass
  ) then
    execute 'drop trigger trg_comments_timestamp on public.comments;';
  end if;

  execute '
    create trigger trg_comments_timestamp
      before update on public.comments
      for each row execute function public.update_social_timestamp();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_posts_timestamp'
      and tgrelid = 'public.posts'::regclass
  ) then
    execute 'drop trigger trg_posts_timestamp on public.posts;';
  end if;

  execute '
    create trigger trg_posts_timestamp
      before update on public.posts
      for each row execute function public.update_social_timestamp();
  ';
end $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Secure access to social data
-- =====================================================

alter table public.user_follows enable row level security;
alter table public.user_connections enable row level security;
alter table public.activity_feed enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.posts enable row level security;
alter table public.notifications enable row level security;

-- User follows policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Anyone can view follows'
      and tablename = 'user_follows'
  ) then
    execute 'DROP POLICY "Anyone can view follows" ON public.user_follows;';
  end if;

  execute $policy$
    CREATE POLICY "Anyone can view follows"
      ON public.user_follows FOR SELECT
      USING (true);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can manage their own follows'
      and tablename = 'user_follows'
  ) then
    execute 'DROP POLICY "Users can manage their own follows" ON public.user_follows;';
  end if;

  execute $policy$
    CREATE POLICY "Users can manage their own follows"
      ON public.user_follows FOR ALL
      USING (auth.uid() = follower_id);
  $policy$;
end $$;

-- User connections policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can view their connections'
      and tablename = 'user_connections'
  ) then
    execute 'DROP POLICY "Users can view their connections" ON public.user_connections;';
  end if;

  execute $policy$
    CREATE POLICY "Users can view their connections"
      ON public.user_connections FOR SELECT
      USING (auth.uid() in (requester_id, receiver_id));
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can create connection requests'
      and tablename = 'user_connections'
  ) then
    execute 'DROP POLICY "Users can create connection requests" ON public.user_connections;';
  end if;

  execute $policy$
    CREATE POLICY "Users can create connection requests"
      ON public.user_connections FOR INSERT
      WITH CHECK (auth.uid() = requester_id);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can update their connection requests'
      and tablename = 'user_connections'
  ) then
    execute 'DROP POLICY "Users can update their connection requests" ON public.user_connections;';
  end if;

  execute $policy$
    CREATE POLICY "Users can update their connection requests"
      ON public.user_connections FOR UPDATE
      USING (auth.uid() in (requester_id, receiver_id));
  $policy$;
end $$;

-- Activity feed policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Anyone can view public activities'
      and tablename = 'activity_feed'
  ) then
    execute 'DROP POLICY "Anyone can view public activities" ON public.activity_feed;';
  end if;

  execute $policy$
    CREATE POLICY "Anyone can view public activities"
      ON public.activity_feed FOR SELECT
      USING (visibility = 'public' or auth.uid() = user_id);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can manage their activities'
      and tablename = 'activity_feed'
  ) then
    execute 'DROP POLICY "Users can manage their activities" ON public.activity_feed;';
  end if;

  execute $policy$
    CREATE POLICY "Users can manage their activities"
      ON public.activity_feed FOR ALL
      USING (auth.uid() = user_id);
  $policy$;
end $$;

-- Reactions policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Anyone can view reactions'
      and tablename = 'reactions'
  ) then
    execute 'DROP POLICY "Anyone can view reactions" ON public.reactions;';
  end if;

  execute $policy$
    CREATE POLICY "Anyone can view reactions"
      ON public.reactions FOR SELECT
      USING (true);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can manage their reactions'
      and tablename = 'reactions'
  ) then
    execute 'DROP POLICY "Users can manage their reactions" ON public.reactions;';
  end if;

  execute $policy$
    CREATE POLICY "Users can manage their reactions"
      ON public.reactions FOR ALL
      USING (auth.uid() = user_id);
  $policy$;
end $$;

-- Comments policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Anyone can view non-deleted comments'
      and tablename = 'comments'
  ) then
    execute 'DROP POLICY "Anyone can view non-deleted comments" ON public.comments;';
  end if;

  execute $policy$
    CREATE POLICY "Anyone can view non-deleted comments"
      ON public.comments FOR SELECT
      USING (not is_deleted);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can create comments'
      and tablename = 'comments'
  ) then
    execute 'DROP POLICY "Users can create comments" ON public.comments;';
  end if;

  execute $policy$
    CREATE POLICY "Users can create comments"
      ON public.comments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can update their comments'
      and tablename = 'comments'
  ) then
    execute 'DROP POLICY "Users can update their comments" ON public.comments;';
  end if;

  execute $policy$
    CREATE POLICY "Users can update their comments"
      ON public.comments FOR UPDATE
      USING (auth.uid() = user_id);
  $policy$;
end $$;

-- Posts policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Anyone can view public posts'
      and tablename = 'posts'
  ) then
    execute 'DROP POLICY "Anyone can view public posts" ON public.posts;';
  end if;

  execute $policy$
    CREATE POLICY "Anyone can view public posts"
      ON public.posts FOR SELECT
      USING (visibility = 'public' or auth.uid() = user_id);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can manage their posts'
      and tablename = 'posts'
  ) then
    execute 'DROP POLICY "Users can manage their posts" ON public.posts;';
  end if;

  execute $policy$
    CREATE POLICY "Users can manage their posts"
      ON public.posts FOR ALL
      USING (auth.uid() = user_id);
  $policy$;
end $$;

-- Notifications policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can view their notifications'
      and tablename = 'notifications'
  ) then
    execute 'DROP POLICY "Users can view their notifications" ON public.notifications;';
  end if;

  execute $policy$
    CREATE POLICY "Users can view their notifications"
      ON public.notifications FOR SELECT
      USING (auth.uid() = user_id);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can update their notifications'
      and tablename = 'notifications'
  ) then
    execute 'DROP POLICY "Users can update their notifications" ON public.notifications;';
  end if;

  execute $policy$
    CREATE POLICY "Users can update their notifications"
      ON public.notifications FOR UPDATE
      USING (auth.uid() = user_id);
  $policy$;
end $$;

-- =====================================================
-- HELPER FUNCTIONS
-- Utility functions for social features
-- =====================================================

-- Check if user follows another user
create or replace function public.is_following(p_follower_id uuid, p_following_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_follows
    where follower_id = p_follower_id and following_id = p_following_id
  );
end;
$$ language plpgsql security definer;

-- Check if users are connected
create or replace function public.are_connected(p_user1_id uuid, p_user2_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_connections
    where status = 'accepted'
    and ((requester_id = p_user1_id and receiver_id = p_user2_id)
      or (requester_id = p_user2_id and receiver_id = p_user1_id))
  );
end;
$$ language plpgsql security definer;

-- Get user's feed (activities from followed users)
create or replace function public.get_user_feed(p_user_id uuid, p_limit integer default 50)
returns table (
  activity_id uuid,
  user_id uuid,
  activity_type text,
  title text,
  description text,
  created_at timestamptz
) as $$
begin
  return query
  select 
    af.id,
    af.user_id,
    af.activity_type,
    af.title,
    af.description,
    af.created_at
  from public.activity_feed af
  where af.visibility = 'public'
  and (
    af.user_id = p_user_id
    or af.user_id in (
      select following_id from public.user_follows where follower_id = p_user_id
    )
  )
  order by af.created_at desc
  limit p_limit;
end;
$$ language plpgsql security definer;

-- =====================================================
-- COMMENTS
-- Documentation for tables and columns
-- =====================================================

comment on table public.user_follows is 'One-directional follow relationships';
comment on table public.user_connections is 'Two-way connection requests';
comment on table public.activity_feed is 'User activities for personalized feed';
comment on table public.reactions is 'Reactions to various content types';
comment on table public.comments is 'Comments on various content';
comment on table public.posts is 'User-generated posts';
comment on table public.notifications is 'User notifications for social interactions';
