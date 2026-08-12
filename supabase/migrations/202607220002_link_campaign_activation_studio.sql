-- A campaign plan enters the canonical activation studio before funding or launch.
alter table public.campaigns
  add column if not exists activation_proposal_id uuid
  references public.proposals(id) on delete set null;

create index if not exists idx_campaigns_activation_proposal
  on public.campaigns(activation_proposal_id)
  where activation_proposal_id is not null;

comment on column public.campaigns.activation_proposal_id is
  'The canonical activation workspace where this campaign is shaped, funded with secured Gems, opened, and reviewed.';

notify pgrst, 'reload schema';
