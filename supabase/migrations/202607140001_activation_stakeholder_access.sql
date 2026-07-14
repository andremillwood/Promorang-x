-- Make activation ownership explicit and keep the operating room visible to the
-- people who are legitimately part of it. Management remains narrower than view.

alter table public.activation_outcome_snapshots
  add column if not exists proposal_id uuid references public.proposals(id) on delete cascade;

update public.activation_outcome_snapshots
set proposal_id = (metadata ->> 'proposal_id')::uuid
where proposal_id is null
  and metadata ->> 'proposal_id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1 from public.proposals p
    where p.id = (activation_outcome_snapshots.metadata ->> 'proposal_id')::uuid
  );

create index if not exists idx_activation_outcomes_proposal
  on public.activation_outcome_snapshots(proposal_id, captured_at desc);

create or replace function public.can_view_activation(p_proposal_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.proposals p
    where p.id = p_proposal_id
      and (
        p.planner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = p.brand_id and om.user_id = auth.uid()
        )
        or exists (
          select 1 from public.activation_collaborators ac
          where ac.proposal_id = p.id
            and ac.status <> 'removed'
            and (
              ac.invited_user_id = auth.uid()
              or exists (
                select 1 from public.organization_members om
                where om.organization_id = ac.invited_organization_id
                  and om.user_id = auth.uid()
              )
            )
        )
        or exists (
          select 1 from public.activation_access_passes ap
          where ap.proposal_id = p.id and ap.user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_manage_activation(p_proposal_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.proposals p
    where p.id = p_proposal_id
      and (
        p.planner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = p.brand_id and om.user_id = auth.uid()
        )
        or exists (
          select 1 from public.activation_collaborators ac
          where ac.proposal_id = p.id
            and ac.status = 'accepted'
            and ac.role in ('host', 'venue', 'merchant', 'brand', 'agency', 'scene_lead')
            and (
              ac.invited_user_id = auth.uid()
              or exists (
                select 1 from public.organization_members om
                where om.organization_id = ac.invited_organization_id
                  and om.user_id = auth.uid()
              )
            )
        )
      )
  );
$$;

drop policy if exists "Stakeholders read outcome snapshots" on public.activation_outcome_snapshots;
create policy "Activation stakeholders read outcome snapshots"
on public.activation_outcome_snapshots for select
using (
  owner_user_id = auth.uid()
  or (proposal_id is not null and public.can_view_activation(proposal_id))
);

drop policy if exists "Stakeholders write outcome snapshots" on public.activation_outcome_snapshots;
drop policy if exists "Activation managers create outcome snapshots" on public.activation_outcome_snapshots;
create policy "Activation managers create outcome snapshots"
on public.activation_outcome_snapshots for insert
with check (
  owner_user_id = auth.uid()
  and proposal_id is not null
  and public.can_manage_activation(proposal_id)
);

drop policy if exists "Activation managers update outcome snapshots" on public.activation_outcome_snapshots;
create policy "Activation managers update outcome snapshots"
on public.activation_outcome_snapshots for update
using (proposal_id is not null and public.can_manage_activation(proposal_id))
with check (proposal_id is not null and public.can_manage_activation(proposal_id));

drop policy if exists "Activation managers delete outcome snapshots" on public.activation_outcome_snapshots;
create policy "Activation managers delete outcome snapshots"
on public.activation_outcome_snapshots for delete
using (proposal_id is not null and public.can_manage_activation(proposal_id));

drop policy if exists "Stakeholders read activation content" on public.activation_content_assignments;
create policy "Activation stakeholders read activation content"
on public.activation_content_assignments for select
using (public.can_view_activation(proposal_id) or owner_user_id = auth.uid());

drop policy if exists "Stakeholders read activation contributions" on public.activation_contributions;
create policy "Activation stakeholders read activation contributions"
on public.activation_contributions for select
using (
  public.can_view_activation(proposal_id)
  or contributor_user_id = auth.uid()
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = contributor_organization_id and om.user_id = auth.uid()
  )
);

drop policy if exists "Stakeholders read activation history" on public.activation_status_history;
create policy "Activation stakeholders read activation history"
on public.activation_status_history for select
using (public.can_view_activation(proposal_id));

drop policy if exists "Activation stakeholders read proposals" on public.proposals;
create policy "Activation stakeholders read proposals"
on public.proposals for select
using (
  planner_id = auth.uid()
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = brand_id and om.user_id = auth.uid()
  )
  or exists (
    select 1 from public.activation_collaborators ac
    where ac.proposal_id = id
      and ac.status <> 'removed'
      and (
        ac.invited_user_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = ac.invited_organization_id and om.user_id = auth.uid()
        )
      )
  )
  or exists (
    select 1 from public.activation_access_passes ap
    where ap.proposal_id = id and ap.user_id = auth.uid()
  )
);

grant execute on function public.can_view_activation(uuid) to authenticated;
grant execute on function public.can_manage_activation(uuid) to authenticated;

comment on column public.activation_outcome_snapshots.proposal_id is
  'Direct activation relationship for return reports, stakeholder access, and operating review.';

notify pgrst, 'reload schema';
