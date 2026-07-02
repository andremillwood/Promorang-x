create table if not exists public.revenue_lifecycle_email_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  revenue_event_id uuid not null references public.revenue_funnel_events(id) on delete cascade,
  job_type text not null check (job_type in ('abandoned_checkout', 'confirmation', 'replenishment', 'renewal', 'review', 'reorder')),
  funnel text not null,
  entity_type text,
  entity_id text,
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'cancelled', 'failed')),
  attempts integer not null default 0,
  last_error text,
  provider_message_id text,
  sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (revenue_event_id, job_type)
);

create index if not exists revenue_lifecycle_email_jobs_due_idx
  on public.revenue_lifecycle_email_jobs(due_at)
  where status = 'pending';

alter table public.revenue_lifecycle_email_jobs enable row level security;

create or replace function public.schedule_revenue_lifecycle_emails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then return new; end if;

  if new.stage = 'checkout_started' then
    insert into revenue_lifecycle_email_jobs
      (user_id, revenue_event_id, job_type, funnel, entity_type, entity_id, due_at, metadata)
    values
      (new.user_id, new.id, 'abandoned_checkout', new.funnel, new.entity_type, new.entity_id,
       new.occurred_at + interval '1 hour', new.metadata)
    on conflict do nothing;
  end if;

  if new.stage = 'payment_succeeded' then
    insert into revenue_lifecycle_email_jobs
      (user_id, revenue_event_id, job_type, funnel, entity_type, entity_id, due_at, metadata)
    values
      (new.user_id, new.id, 'confirmation', new.funnel, new.entity_type, new.entity_id,
       new.occurred_at, new.metadata)
    on conflict do nothing;

    if new.funnel = 'membership' then
      insert into revenue_lifecycle_email_jobs
        (user_id, revenue_event_id, job_type, funnel, entity_type, entity_id, due_at, metadata)
      values
        (new.user_id, new.id, 'renewal', new.funnel, new.entity_type, new.entity_id,
         new.occurred_at + interval '25 days', new.metadata)
      on conflict do nothing;
    end if;

    if new.funnel in ('gems', 'campaign', 'sponsorship') then
      insert into revenue_lifecycle_email_jobs
        (user_id, revenue_event_id, job_type, funnel, entity_type, entity_id, due_at, metadata)
      values
        (new.user_id, new.id, 'replenishment', new.funnel, new.entity_type, new.entity_id,
         new.occurred_at + interval '21 days', new.metadata)
      on conflict do nothing;
    end if;
  end if;

  if new.stage = 'fulfilled' and new.funnel = 'marketplace' then
    insert into revenue_lifecycle_email_jobs
      (user_id, revenue_event_id, job_type, funnel, entity_type, entity_id, due_at, metadata)
    values
      (new.user_id, new.id, 'review', new.funnel, new.entity_type, new.entity_id,
       new.occurred_at + interval '3 days', new.metadata),
      (new.user_id, new.id, 'reorder', new.funnel, new.entity_type, new.entity_id,
       new.occurred_at + interval '30 days', new.metadata)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_schedule_revenue_lifecycle_emails on public.revenue_funnel_events;
create trigger trigger_schedule_revenue_lifecycle_emails
after insert on public.revenue_funnel_events
for each row execute function public.schedule_revenue_lifecycle_emails();

