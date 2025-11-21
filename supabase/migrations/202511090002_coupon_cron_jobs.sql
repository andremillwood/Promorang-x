-- Cron jobs for automated coupon assignments
-- Timestamp: 2025-11-09
-- Sets up pg_cron jobs for periodic coupon distribution

-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists "pgcrypto";

-- Weekly leaderboard coupon assignment (runs every Monday at 00:00 UTC)
select cron.schedule(
  'weekly-leaderboard-coupons',
  '0 0 * * 1',  -- Every Monday at midnight
  $$
  select assign_leaderboard_coupons('weekly', 10);
  $$
);

-- Monthly leaderboard coupon assignment (runs on 1st of each month at 00:00 UTC)
select cron.schedule(
  'monthly-leaderboard-coupons',
  '0 0 1 * *',  -- First day of month at midnight
  $$
  select assign_leaderboard_coupons('monthly', 25);
  $$
);

-- Daily top performers coupon assignment (runs daily at 23:00 UTC)
select cron.schedule(
  'daily-top-performers-coupons',
  '0 23 * * *',  -- Every day at 11 PM
  $$
  select assign_leaderboard_coupons('daily', 5);
  $$
);

-- Cleanup expired coupon assignments (runs daily at 02:00 UTC)
select cron.schedule(
  'cleanup-expired-coupons',
  '0 2 * * *',  -- Every day at 2 AM
  $$
  update public.advertiser_coupon_assignments
  set status = 'completed'
  where status = 'active'
    and is_redeemed = false
    and coupon_id in (
      select id from public.advertiser_coupons
      where end_date < now()
    );
  $$
);

-- Update coupon status based on expiry and quantity (runs hourly)
select cron.schedule(
  'update-coupon-status',
  '0 * * * *',  -- Every hour
  $$
  update public.advertiser_coupons
  set status = 'expired'
  where status = 'active'
    and end_date < now();

  update public.advertiser_coupons
  set status = 'archived'
  where status = 'active'
    and quantity_remaining <= 0;
  $$
);

-- Log cron job execution for monitoring
create table if not exists public.coupon_cron_logs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  executed_at timestamptz not null default timezone('utc', now()),
  coupons_assigned integer default 0,
  success boolean default true,
  error_message text
);

create or replace function public.assign_leaderboard_coupons_with_logging(
  p_period text default 'weekly',
  p_limit integer default 10
)
returns integer as $$
declare
  v_assigned_count integer;
  v_error_message text;
begin
  -- Call the main assignment function
  v_assigned_count := public.assign_leaderboard_coupons(p_period, p_limit);
  
  -- Log successful execution
  insert into public.coupon_cron_logs (job_name, coupons_assigned, success)
  values (format('leaderboard_%s', p_period), v_assigned_count, true);
  
  return v_assigned_count;
  
exception when others then
  v_error_message := SQLERRM;
  
  -- Log error
  insert into public.coupon_cron_logs (job_name, coupons_assigned, success, error_message)
  values (format('leaderboard_%s', p_period), 0, false, v_error_message);
  
  raise notice 'Error in assign_leaderboard_coupons: %', v_error_message;
  return 0;
end;
$$ language plpgsql;

-- Update cron jobs to use logging version
select cron.unschedule('weekly-leaderboard-coupons');
select cron.schedule(
  'weekly-leaderboard-coupons',
  '0 0 * * 1',
  $$select public.assign_leaderboard_coupons_with_logging('weekly', 10);$$
);

select cron.unschedule('monthly-leaderboard-coupons');
select cron.schedule(
  'monthly-leaderboard-coupons',
  '0 0 1 * *',
  $$select public.assign_leaderboard_coupons_with_logging('monthly', 25);$$
);

select cron.unschedule('daily-top-performers-coupons');
select cron.schedule(
  'daily-top-performers-coupons',
  '0 23 * * *',
  $$select public.assign_leaderboard_coupons_with_logging('daily', 5);$$
);
