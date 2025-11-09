-- Email notification queue for coupon assignments
-- Timestamp: 2025-11-09
-- Queues email notifications to be sent by backend service

-- Email notification queue table
create table if not exists public.email_notification_queue (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  email_type text not null check (email_type in ('coupon_earned', 'weekly_digest', 'expiry_warning')),
  recipient_email text not null,
  subject text not null,
  template_data jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  error_message text,
  retry_count integer default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_email_queue_status 
  on public.email_notification_queue(status, created_at);

create index if not exists idx_email_queue_user 
  on public.email_notification_queue(user_id, email_type);

-- Function to queue coupon earned email
create or replace function queue_coupon_earned_email()
returns trigger as $$
declare
  user_record record;
  coupon_record record;
begin
  -- Only queue email for user-specific assignments that were just created
  if NEW.user_id is not null and OLD is null then
    -- Get user info
    select email, username into user_record
    from public.users
    where id = NEW.user_id;

    -- Get coupon info
    select title, description, value, value_unit, end_date
    into coupon_record
    from public.advertiser_coupons
    where id = NEW.coupon_id;

    -- Queue email notification
    insert into public.email_notification_queue (
      user_id,
      email_type,
      recipient_email,
      subject,
      template_data
    ) values (
      NEW.user_id,
      'coupon_earned',
      user_record.email,
      format('🎁 You Earned: %s', coupon_record.title),
      jsonb_build_object(
        'user_name', user_record.username,
        'coupon_title', coupon_record.title,
        'coupon_description', coupon_record.description,
        'value', coupon_record.value,
        'value_unit', coupon_record.value_unit,
        'source_label', NEW.target_label,
        'expires_at', coupon_record.end_date,
        'assignment_id', NEW.id
      )
    );
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Trigger to queue email on coupon assignment
drop trigger if exists trigger_queue_coupon_email on public.advertiser_coupon_assignments;
create trigger trigger_queue_coupon_email
  after insert on public.advertiser_coupon_assignments
  for each row
  execute function queue_coupon_earned_email();

-- Function to queue expiry warning emails (called by cron)
create or replace function queue_expiry_warning_emails()
returns integer as $$
declare
  assignment_record record;
  user_record record;
  coupon_record record;
  queued_count integer := 0;
begin
  -- Find coupons expiring in 3 days that haven't been redeemed
  for assignment_record in
    select 
      aca.id,
      aca.user_id,
      aca.coupon_id
    from public.advertiser_coupon_assignments aca
    join public.advertiser_coupons ac on ac.id = aca.coupon_id
    where aca.user_id is not null
      and aca.is_redeemed = false
      and aca.status = 'active'
      and ac.end_date between now() and now() + interval '3 days'
      -- Don't send duplicate warnings
      and not exists (
        select 1 from public.email_notification_queue
        where user_id = aca.user_id
          and email_type = 'expiry_warning'
          and template_data->>'assignment_id' = aca.id::text
          and created_at > now() - interval '7 days'
      )
  loop
    -- Get user and coupon info
    select email, username into user_record
    from public.users
    where id = assignment_record.user_id;

    select title, value, value_unit, end_date
    into coupon_record
    from public.advertiser_coupons
    where id = assignment_record.coupon_id;

    -- Queue warning email
    insert into public.email_notification_queue (
      user_id,
      email_type,
      recipient_email,
      subject,
      template_data
    ) values (
      assignment_record.user_id,
      'expiry_warning',
      user_record.email,
      format('⚠️ Your %s Reward Expires Soon!', coupon_record.title),
      jsonb_build_object(
        'user_name', user_record.username,
        'coupon_title', coupon_record.title,
        'value', coupon_record.value,
        'value_unit', coupon_record.value_unit,
        'expires_at', coupon_record.end_date,
        'assignment_id', assignment_record.id,
        'days_until_expiry', extract(day from (coupon_record.end_date - now()))
      )
    );

    queued_count := queued_count + 1;
  end loop;

  return queued_count;
end;
$$ language plpgsql;

-- Add cron job for expiry warnings (runs daily at 10 AM UTC)
select cron.schedule(
  'queue-expiry-warnings',
  '0 10 * * *',
  $$select queue_expiry_warning_emails();$$
);

-- Function to get pending emails for backend to process
create or replace function get_pending_email_notifications(p_limit integer default 50)
returns table (
  id uuid,
  user_id uuid,
  email_type text,
  recipient_email text,
  subject text,
  template_data jsonb,
  retry_count integer
) as $$
begin
  return query
  select 
    enq.id,
    enq.user_id,
    enq.email_type,
    enq.recipient_email,
    enq.subject,
    enq.template_data,
    enq.retry_count
  from public.email_notification_queue enq
  where enq.status = 'pending'
    and enq.retry_count < 3
  order by enq.created_at asc
  limit p_limit;
end;
$$ language plpgsql;

-- Function to mark email as sent
create or replace function mark_email_sent(p_email_id uuid)
returns void as $$
begin
  update public.email_notification_queue
  set 
    status = 'sent',
    sent_at = now(),
    updated_at = now()
  where id = p_email_id;
end;
$$ language plpgsql;

-- Function to mark email as failed
create or replace function mark_email_failed(p_email_id uuid, p_error_message text)
returns void as $$
begin
  update public.email_notification_queue
  set 
    status = case when retry_count >= 2 then 'failed' else 'pending' end,
    retry_count = retry_count + 1,
    error_message = p_error_message,
    updated_at = now()
  where id = p_email_id;
end;
$$ language plpgsql;
