-- Content engagement tracking for coupon assignments
-- Timestamp: 2025-11-09
-- Tracks user interactions with sponsored content and assigns coupons based on engagement

-- Content engagement events table
create table if not exists public.content_engagement_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  content_id uuid not null,
  event_type text not null check (event_type in ('view', 'like', 'share', 'comment', 'click')),
  metadata jsonb default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_content_engagement_user 
  on public.content_engagement_events(user_id, content_id, event_type);

create index if not exists idx_content_engagement_content 
  on public.content_engagement_events(content_id, event_type, created_at desc);

-- Function to check and assign content engagement coupons
create or replace function check_content_engagement_coupons(
  p_user_id uuid,
  p_content_id uuid,
  p_event_type text
)
returns integer as $$
declare
  assignment_record record;
  engagement_count integer;
  assigned_count integer := 0;
  user_record record;
begin
  -- Get user info for notifications
  select username, email into user_record
  from public.users
  where id = p_user_id;

  -- Find all active content-based coupon assignments for this content
  for assignment_record in
    select 
      aca.id,
      aca.coupon_id,
      aca.conditions,
      ac.title,
      ac.description,
      ac.value,
      ac.value_unit,
      ac.quantity_remaining
    from public.advertiser_coupon_assignments aca
    join public.advertiser_coupons ac on ac.id = aca.coupon_id
    where aca.content_id = p_content_id
      and aca.target_type = 'content'
      and aca.status = 'active'
      and aca.user_id is null  -- Template assignment, not user-specific
      and ac.status = 'active'
      and ac.quantity_remaining > 0
      and ac.end_date > now()
  loop
    -- Check if user already has this coupon
    if exists (
      select 1 from public.advertiser_coupon_assignments
      where coupon_id = assignment_record.coupon_id
        and user_id = p_user_id
        and status = 'active'
    ) then
      continue;
    end if;

    -- Check engagement conditions
    if assignment_record.conditions ? 'required_events' then
      -- Count user's engagement events for this content
      select count(*) into engagement_count
      from public.content_engagement_events
      where user_id = p_user_id
        and content_id = p_content_id
        and event_type = any(
          array(select jsonb_array_elements_text(assignment_record.conditions->'required_events'))
        );

      -- Check if threshold met
      if engagement_count >= coalesce(
        (assignment_record.conditions->>'min_engagement_count')::integer,
        1
      ) then
        -- Assign coupon to user
        insert into public.advertiser_coupon_assignments (
          coupon_id,
          target_type,
          target_id,
          target_label,
          user_id,
          content_id,
          status,
          metadata
        ) values (
          assignment_record.coupon_id,
          'user_content_engagement',
          p_user_id::text,
          'Content engagement reward',
          p_user_id,
          p_content_id,
          'active',
          jsonb_build_object(
            'content_id', p_content_id,
            'trigger_event', p_event_type,
            'engagement_count', engagement_count,
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
          p_user_id,
          'coupon_earned',
          'Engagement Reward! 🎁',
          format('You earned: %s - %s %s for engaging with sponsored content!', 
            assignment_record.title, 
            assignment_record.value, 
            assignment_record.value_unit
          ),
          jsonb_build_object(
            'coupon_id', assignment_record.coupon_id,
            'coupon_title', assignment_record.title,
            'source', 'content_engagement',
            'content_id', p_content_id
          )
        );

        assigned_count := assigned_count + 1;
      end if;
    end if;
  end loop;

  return assigned_count;
end;
$$ language plpgsql;

-- Trigger to check for coupon assignments on engagement events
create or replace function trigger_content_engagement_coupons()
returns trigger as $$
begin
  -- Asynchronously check for coupon assignments
  perform check_content_engagement_coupons(
    NEW.user_id,
    NEW.content_id,
    NEW.event_type
  );
  
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trigger_check_content_coupons on public.content_engagement_events;
create trigger trigger_check_content_coupons
  after insert on public.content_engagement_events
  for each row
  execute function trigger_content_engagement_coupons();

-- Helper function to track engagement (called from backend)
create or replace function track_content_engagement(
  p_user_id uuid,
  p_content_id uuid,
  p_event_type text,
  p_metadata jsonb default '{}'
)
returns jsonb as $$
declare
  v_event_id uuid;
  v_coupons_assigned integer;
begin
  -- Insert engagement event
  insert into public.content_engagement_events (
    user_id,
    content_id,
    event_type,
    metadata
  ) values (
    p_user_id,
    p_content_id,
    p_event_type,
    p_metadata
  ) returning id into v_event_id;

  -- Check for coupon assignments (trigger handles this, but we can also return count)
  select count(*) into v_coupons_assigned
  from public.advertiser_coupon_assignments
  where user_id = p_user_id
    and content_id = p_content_id
    and created_at > now() - interval '1 second';

  return jsonb_build_object(
    'event_id', v_event_id,
    'coupons_assigned', v_coupons_assigned,
    'success', true
  );
end;
$$ language plpgsql;
