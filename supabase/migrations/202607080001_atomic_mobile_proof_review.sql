-- Atomic mobile proof review outcome:
-- review decision + linked content status + Vault memory + reward receipt + notification.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications
  add column if not exists type text,
  add column if not exists title text,
  add column if not exists message text,
  add column if not exists related_id uuid,
  add column if not exists is_read boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_notifications_user_created
  on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.review_moment_proof(
  p_proof_submission_id uuid,
  p_decision text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_state public.proof_submission_state;
  v_content_status text;
  v_proof public.proof_submissions%rowtype;
  v_moment public.moments%rowtype;
  v_content_id uuid;
  v_memory_id uuid;
  v_receipt_id uuid;
  v_title text;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Unsupported review decision: %', p_decision;
  end if;

  v_state := case when p_decision = 'approved' then 'verified'::public.proof_submission_state else 'rejected'::public.proof_submission_state end;
  v_content_status := case when p_decision = 'approved' then 'published' else 'returned' end;

  select *
    into v_proof
  from public.proof_submissions
  where id = p_proof_submission_id
  for update;

  if not found then
    raise exception 'Proof submission not found';
  end if;

  select *
    into v_moment
  from public.moments
  where id = v_proof.moment_id;

  if not found then
    raise exception 'Moment not found for proof submission';
  end if;

  if not (
    v_moment.organizer_id = v_actor
    or v_moment.host_id = v_actor
    or exists (
      select 1
      from public.users u
      where u.id = v_actor
        and coalesce(u.user_type, '') in ('admin', 'super_admin')
    )
    or exists (
      select 1
      from public.user_roles ur
      where ur.user_id = v_actor
        and ur.role in ('admin', 'super_admin')
    )
  ) then
    raise exception 'Not authorized to review proof for this moment';
  end if;

  v_content_id := case
    when coalesce(v_proof.proof_bundle->>'content_item_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then (v_proof.proof_bundle->>'content_item_id')::uuid
    else null
  end;

  update public.proof_submissions
  set submission_state = v_state,
      reviewed_by = v_actor,
      reviewed_at = now(),
      review_reason = case
        when p_decision = 'approved' then 'Approved through mobile Studio Review'
        else 'Returned through mobile Studio Review'
      end,
      updated_at = now()
  where id = v_proof.id;

  if v_content_id is not null then
    update public.content_items
    set status = v_content_status
    where id = v_content_id;
  end if;

  if p_decision = 'approved' then
    v_title := coalesce(v_moment.title, 'Verified moment') || ' proof';

    select id
      into v_memory_id
    from public.memories
    where user_id = v_proof.user_id
      and moment_id = v_proof.moment_id
    order by issued_at desc
    limit 1;

    if v_memory_id is null then
      insert into public.memories (
        user_id,
        moment_id,
        creator_id,
        rarity,
        title,
        collection_key,
        legacy_score,
        metadata
      )
      values (
        v_proof.user_id,
        v_proof.moment_id,
        v_proof.user_id,
        coalesce(v_moment.memory_rarity, 'common'::public.memory_rarity),
        v_title,
        'verified-proof',
        1,
        jsonb_build_object(
          'proof_submission_id', v_proof.id,
          'content_item_id', v_content_id,
          'reviewed_by', v_actor,
          'source', 'review_moment_proof'
        )
      )
      returning id into v_memory_id;
    else
      update public.memories
      set title = v_title,
          rarity = coalesce(v_moment.memory_rarity, public.memories.rarity),
          legacy_score = greatest(public.memories.legacy_score, 1),
          metadata = coalesce(public.memories.metadata, '{}'::jsonb) || jsonb_build_object(
            'proof_submission_id', v_proof.id,
            'content_item_id', v_content_id,
            'reviewed_by', v_actor,
            'source', 'review_moment_proof'
          )
      where id = v_memory_id;
    end if;

    insert into public.reward_receipts (
      user_id,
      source_type,
      source_id,
      lifecycle_status,
      headline,
      description,
      rewards,
      proof,
      next_action,
      available_at,
      metadata
    )
    values (
      v_proof.user_id,
      'proof_submission',
      v_proof.id::text,
      'available',
      'Verified proof added to your Vault',
      coalesce(v_moment.title, 'Your moment') || ' is now part of your retained record.',
      jsonb_build_array(jsonb_build_object('currency', 'memory', 'amount', 1, 'label', 'Vault memory')),
      jsonb_build_object('proof_submission_id', v_proof.id, 'content_item_id', v_content_id, 'moment_id', v_proof.moment_id, 'memory_id', v_memory_id),
      jsonb_build_object('label', 'Open Vault', 'href', '/vault'),
      now(),
      jsonb_build_object('source', 'review_moment_proof')
    )
    on conflict (user_id, source_type, source_id) do update
      set lifecycle_status = excluded.lifecycle_status,
          rewards = excluded.rewards,
          proof = excluded.proof,
          updated_at = now()
    returning id into v_receipt_id;

    insert into public.value_notifications (
      user_id,
      receipt_id,
      notification_type,
      title,
      body
    )
    values (
      v_proof.user_id,
      v_receipt_id,
      'proof_verified',
      'Your proof was verified',
      'A Vault memory was added from ' || coalesce(v_moment.title, 'your moment') || '.'
    )
    on conflict do nothing;
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    related_id,
    is_read
  )
  values (
    v_proof.user_id,
    case when p_decision = 'approved' then 'proof_approved' else 'proof_returned' end,
    case when p_decision = 'approved' then 'Your proof was approved' else 'Your proof needs another pass' end,
    case
      when p_decision = 'approved' then coalesce(v_moment.title, 'Your moment') || ' is now part of your Vault.'
      else 'Review ' || coalesce(v_moment.title, 'your moment') || ' and submit clearer evidence when you are ready.'
    end,
    v_proof.moment_id,
    false
  );

  return jsonb_build_object(
    'proof_submission_id', v_proof.id,
    'decision', p_decision,
    'submission_state', v_state,
    'content_item_id', v_content_id,
    'memory_id', v_memory_id,
    'receipt_id', v_receipt_id
  );
end;
$$;

revoke all on function public.review_moment_proof(uuid, text) from public;
grant execute on function public.review_moment_proof(uuid, text) to authenticated;

notify pgrst, 'reload schema';
