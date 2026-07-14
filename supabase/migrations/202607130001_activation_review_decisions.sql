alter table public.activation_outcome_snapshots
  add column if not exists review_loop jsonb not null default '{}'::jsonb,
  add column if not exists next_decision text check (next_decision in ('repeat', 'improve', 'invite', 'fund', 'close')),
  add column if not exists next_decision_note text,
  add column if not exists scene_learning_summary text,
  add column if not exists content_return_summary text,
  add column if not exists gems_return_summary text,
  add column if not exists participant_value_summary text;

create index if not exists idx_activation_outcomes_next_decision
  on public.activation_outcome_snapshots(next_decision, captured_at desc)
  where next_decision is not null;

create index if not exists idx_activation_outcomes_review_loop
  on public.activation_outcome_snapshots using gin(review_loop);
