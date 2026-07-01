-- Canonical, backend-issued receipts and lifecycle notifications.

create table if not exists public.reward_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  lifecycle_status text not null check(lifecycle_status in ('submitted','verified','issued','available','reversed','failed')),
  headline text not null,
  description text,
  rewards jsonb not null default '[]'::jsonb,
  proof jsonb not null default '{}'::jsonb,
  next_action jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  available_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,source_type,source_id)
);

create table if not exists public.value_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  receipt_id uuid references public.reward_receipts(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id,receipt_id,notification_type)
);

create index if not exists idx_reward_receipts_user_created on public.reward_receipts(user_id,created_at desc);
create index if not exists idx_value_notifications_user_unread on public.value_notifications(user_id,created_at desc) where read_at is null;

create or replace function public.receipt_from_economy_transaction()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_receipt uuid; v_label text;
begin
  v_label:=case new.currency when 'points' then 'Points' when 'promokeys' then 'PromoKeys' when 'gems' then 'Gems' when 'usd' then 'USD' else initcap(new.currency) end;
  insert into public.reward_receipts(user_id,source_type,source_id,lifecycle_status,headline,description,rewards,proof,next_action,available_at,metadata)
  values(
    new.user_id,new.source,new.id::text,
    case when new.amount>0 then 'available' else 'issued' end,
    case when new.amount>0 then 'Value added to your record' else 'Value used' end,
    coalesce(new.description,new.source),
    jsonb_build_array(jsonb_build_object('currency',new.currency,'amount',new.amount,'label',v_label,'balance_after',new.balance_after)),
    jsonb_build_object('reference_table',new.reference_table,'reference_id',new.reference_id),
    jsonb_build_object('label','Open Wallet','href','/wallet'),
    case when new.amount>0 then now() else null end,
    jsonb_build_object('transaction_type',new.transaction_type,'idempotency_key',new.idempotency_key)
  )
  on conflict(user_id,source_type,source_id) do update set
    lifecycle_status=excluded.lifecycle_status,rewards=excluded.rewards,updated_at=now()
  returning id into v_receipt;
  insert into public.value_notifications(user_id,receipt_id,notification_type,title,body)
    values(new.user_id,v_receipt,'economy_'||new.transaction_type,
      case when new.amount>0 then v_label||' received' else v_label||' used' end,
      case when new.amount>0 then '+' else '' end||new.amount::text||' '||v_label||' · balance '||new.balance_after::text)
    on conflict do nothing;
  return new;
end $$;
drop trigger if exists trg_receipt_from_economy_transaction on public.economy_transactions;
create trigger trg_receipt_from_economy_transaction after insert on public.economy_transactions
  for each row execute function public.receipt_from_economy_transaction();

create or replace function public.receipt_from_engagement()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_receipt uuid;
begin
  insert into public.reward_receipts(user_id,source_type,source_id,lifecycle_status,headline,description,rewards,proof,next_action,available_at)
  values(new.user_id,'engagement',new.id::text,'available','Your contribution counted',
    initcap(new.action_type)||' recorded',
    jsonb_build_array(
      jsonb_build_object('currency','points','amount',new.points_awarded,'label','Points'),
      jsonb_build_object('currency','promoshare_entry','amount',new.promoshare_entries,'label','PromoShare entries')
    ),
    jsonb_build_object('verified',new.verified,'reference_type',new.reference_type,'reference_id',new.reference_id),
    jsonb_build_object('label','Keep moving','href','/discover'),now())
  on conflict(user_id,source_type,source_id) do update set rewards=excluded.rewards,updated_at=now()
  returning id into v_receipt;
  insert into public.value_notifications(user_id,receipt_id,notification_type,title,body)
    values(new.user_id,v_receipt,'engagement_recorded','Your contribution counted',
      '+'||new.points_awarded::text||' Points'||case when new.promoshare_entries>0 then ' · +'||new.promoshare_entries::text||' PromoShare entry' else '' end)
    on conflict do nothing;
  return new;
end $$;
drop trigger if exists trg_receipt_from_engagement on public.engagement_reward_events;
create trigger trg_receipt_from_engagement after insert on public.engagement_reward_events
  for each row execute function public.receipt_from_engagement();

alter table public.reward_receipts enable row level security;
alter table public.value_notifications enable row level security;
drop policy if exists "Users read own reward receipts" on public.reward_receipts;
create policy "Users read own reward receipts" on public.reward_receipts for select using(auth.uid()=user_id);
drop policy if exists "Users read own value notifications" on public.value_notifications;
create policy "Users read own value notifications" on public.value_notifications for select using(auth.uid()=user_id);
