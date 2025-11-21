-- User-facing coupon system
-- Timestamp: 2025-11-09
-- Enables users to view available coupons, track redemptions, and claim rewards

-- Extend coupon assignments to support user-specific assignments
-- This allows tracking which users have earned which coupons
do $$
begin
  -- Add user_id to assignments for user-specific coupon grants
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'advertiser_coupon_assignments'
      and column_name = 'user_id'
  ) then
    alter table public.advertiser_coupon_assignments
      add column user_id uuid references public.users(id) on delete cascade;
  end if;

  -- Add drop_id for drop-based assignments
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'advertiser_coupon_assignments'
      and column_name = 'drop_id'
  ) then
    alter table public.advertiser_coupon_assignments
      add column drop_id uuid;
  end if;

  -- Add content_id for content engagement-based assignments
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'advertiser_coupon_assignments'
      and column_name = 'content_id'
  ) then
    alter table public.advertiser_coupon_assignments
      add column content_id uuid;
  end if;

  -- Add leaderboard_rank for leaderboard-based assignments
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'advertiser_coupon_assignments'
      and column_name = 'leaderboard_rank'
  ) then
    alter table public.advertiser_coupon_assignments
      add column leaderboard_rank integer;
  end if;

  -- Add metadata for additional context
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'advertiser_coupon_assignments'
      and column_name = 'metadata'
  ) then
    alter table public.advertiser_coupon_assignments
      add column metadata jsonb default '{}';
  end if;

  -- Add is_redeemed flag to track if user has claimed this assignment
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'advertiser_coupon_assignments'
      and column_name = 'is_redeemed'
  ) then
    alter table public.advertiser_coupon_assignments
      add column is_redeemed boolean default false;
  end if;

  -- Add redeemed_at timestamp
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'advertiser_coupon_assignments'
      and column_name = 'redeemed_at'
  ) then
    alter table public.advertiser_coupon_assignments
      add column redeemed_at timestamptz;
  end if;
end $$;

-- Create index for user-specific coupon queries
create index if not exists idx_advertiser_coupon_assignments_user 
  on public.advertiser_coupon_assignments(user_id, is_redeemed, status);

-- Create index for drop-based coupon queries
create index if not exists idx_advertiser_coupon_assignments_drop 
  on public.advertiser_coupon_assignments(drop_id, status);

-- Create index for content-based coupon queries
create index if not exists idx_advertiser_coupon_assignments_content 
  on public.advertiser_coupon_assignments(content_id, status);

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- User notifications table (if not exists)
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  notification_type text not null,
  title text not null,
  message text,
  data jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz
);

create index if not exists idx_user_notifications_user 
  on public.user_notifications(user_id, is_read, created_at desc);

-- Function and trigger to auto-assign coupons when legacy drop applications complete
do $$
begin
  if to_regclass('public.drop_applications') is not null then
    execute $fn$
      create or replace function public.assign_drop_coupons()
      returns trigger
      language plpgsql
      as $function$
      declare
        assignment_record record;
      begin
        -- When a drop application is approved/completed, check for coupon assignments
        if NEW.status in ('approved', 'completed') and OLD.status != NEW.status then
          -- Find all active coupon assignments for this drop
          for assignment_record in
            select 
              aca.id,
              aca.coupon_id,
              ac.title,
              ac.description,
              ac.value,
              ac.value_unit,
              ac.quantity_remaining
            from public.advertiser_coupon_assignments aca
            join public.advertiser_coupons ac on ac.id = aca.coupon_id
            where (aca.drop_id is null or aca.drop_id::uuid = NEW.drop_id)
              and aca.status = 'active'
              and aca.user_id is null  -- Only template assignments, not user-specific
              and ac.status = 'active'
              and ac.quantity_remaining > 0
              and ac.end_date > now()
          loop
            -- Create user-specific assignment
            insert into public.advertiser_coupon_assignments (
              coupon_id,
              target_type,
              target_id,
              target_label,
              user_id,
              drop_id,
              status,
              metadata
            ) values (
              assignment_record.coupon_id,
              'user_drop_completion',
              NEW.creator_id::text,
              'Drop completion reward',
              NEW.creator_id::uuid,
              NEW.drop_id,
              'active',
              jsonb_build_object(
                'drop_id', NEW.drop_id,
                'application_id', NEW.id,
                'earned_at', now()
              )
            );

            -- Create notification
            insert into public.user_notifications (
              user_id,
              notification_type,
              title,
              message,
              data
            ) values (
              NEW.creator_id::uuid,
              'coupon_earned',
              'Reward Unlocked! 🎁',
              format('You earned: %s - %s %s', 
                assignment_record.title, 
                assignment_record.value, 
                assignment_record.value_unit
              ),
              jsonb_build_object(
                'coupon_id', assignment_record.coupon_id,
                'coupon_title', assignment_record.title,
                'source', 'drop_completion',
                'drop_id', NEW.drop_id
              )
            );
          end loop;
        end if;

        return NEW;
      end;
      $function$;
    $fn$;

    execute '
      do $$
      begin
        if exists (
          select 1 from pg_trigger
          where tgname = ''trigger_assign_drop_coupons''
            and tgrelid = ''public.drop_applications''::regclass
        ) then
          execute ''drop trigger trigger_assign_drop_coupons on public.drop_applications;'';
        end if;

        execute ''
          create trigger trigger_assign_drop_coupons
            after update on public.drop_applications
            for each row
            execute function public.assign_drop_coupons();
        '';
      end $$;
    ';
  end if;
end
$$;

create or replace function public.assign_leaderboard_coupons(
  p_period text default 'weekly',
  p_limit integer default 10
)
returns integer as $$
declare
  assignment_record record;
  leaderboard_record record;
  assigned_count integer := 0;
begin
  -- Find all active leaderboard coupon assignments
  for assignment_record in
    select 
      aca.id,
      aca.coupon_id,
      aca.leaderboard_rank,
      ac.title,
      ac.description,
      ac.value,
      ac.value_unit,
      ac.quantity_remaining
    from public.advertiser_coupon_assignments aca
    join public.advertiser_coupons ac on ac.id = aca.coupon_id
    where aca.target_type = 'leaderboard'
      and aca.status = 'active'
      and aca.user_id is null
      and ac.status = 'active'
      and ac.quantity_remaining > 0
      and ac.end_date > now()
  loop
    -- Get top N users from leaderboard
    for leaderboard_record in
      select 
        user_id,
        rank
      from public.leaderboard_entries
      where period = p_period
      order by rank asc
      limit coalesce(assignment_record.leaderboard_rank, p_limit)
    loop
      -- Check if user already has this coupon
      if not exists (
        select 1 from public.advertiser_coupon_assignments
        where coupon_id = assignment_record.coupon_id
          and user_id = leaderboard_record.user_id
          and status = 'active'
      ) then
        -- Create user-specific assignment
        insert into public.advertiser_coupon_assignments (
          coupon_id,
          target_type,
          target_id,
          target_label,
          user_id,
          leaderboard_rank,
          status,
          metadata
        ) values (
          assignment_record.coupon_id,
          'user_leaderboard',
          leaderboard_record.user_id::text,
          format('Leaderboard Rank #%s', leaderboard_record.rank),
          leaderboard_record.user_id,
          leaderboard_record.rank,
          'active',
          jsonb_build_object(
            'period', p_period,
            'rank', leaderboard_record.rank,
            'earned_at', now()
          )
        );

        -- Create notification
        insert into public.user_notifications (
          user_id,
          notification_type,
          title,
          message,
          data
        ) values (
          leaderboard_record.user_id,
          'coupon_earned',
          'Leaderboard Reward! 🏆',
          format('Congratulations! You earned: %s for ranking #%s', 
            assignment_record.title,
            leaderboard_record.rank
          ),
          jsonb_build_object(
            'coupon_id', assignment_record.coupon_id,
            'coupon_title', assignment_record.title,
            'source', 'leaderboard',
            'rank', leaderboard_record.rank,
            'period', p_period
          )
        );

        assigned_count := assigned_count + 1;
      end if;
    end loop;
  end loop;

  return assigned_count;
end;
$$ language plpgsql;
