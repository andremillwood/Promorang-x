-- Complete the Scene/Moment selection journey:
-- reversible links and consent-based partner-hosted Moment connection.

create or replace function public.unlink_activation_scene(p_proposal_id uuid)
returns public.proposals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.proposals%rowtype;
begin
  if not public.can_manage_activation(p_proposal_id) then
    raise exception 'Not authorized to change this Scene';
  end if;

  update public.proposals
  set scene_id = null, updated_at = now()
  where id = p_proposal_id
  returning * into v_row;

  if not found then raise exception 'Activation not found'; end if;
  return v_row;
end;
$$;

create or replace function public.unlink_activation_moment(p_proposal_id uuid)
returns public.proposals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.proposals%rowtype;
begin
  if not public.can_manage_activation(p_proposal_id) then
    raise exception 'Not authorized to change this Moment';
  end if;

  update public.proposals
  set target_moment_id = null, updated_at = now()
  where id = p_proposal_id
  returning * into v_row;

  if not found then raise exception 'Activation not found'; end if;
  return v_row;
end;
$$;

create or replace function public.request_activation_moment_partnership(
  p_proposal_id uuid,
  p_moment_id uuid,
  p_message text default null
) returns public.activation_collaborators
language plpgsql
security definer
set search_path = public
as $$
declare
  v_moment public.moments%rowtype;
  v_row public.activation_collaborators%rowtype;
begin
  if not public.can_manage_activation(p_proposal_id) then
    raise exception 'Not authorized to request this partnership';
  end if;

  select * into v_moment
  from public.moments
  where id = p_moment_id
    and is_active = true
    and visibility = 'open';

  if not found then raise exception 'This Moment is not open to partnership'; end if;
  if v_moment.host_id = auth.uid() then raise exception 'Connect your own Moment directly'; end if;

  select * into v_row
  from public.activation_collaborators
  where proposal_id = p_proposal_id
    and role = 'host'
    and invited_user_id = v_moment.host_id
    and status <> 'removed'
  limit 1;

  if found then
    update public.activation_collaborators
    set responsibility = coalesce(
          nullif(trim(p_message), ''),
          'Explore hosting this activation at ' || v_moment.title || '.'
        ),
        status = case
          when metadata ->> 'requested_moment_id' = p_moment_id::text
            and status in ('invited', 'viewed', 'accepted') then status
          else 'invited'
        end,
        response_message = case
          when metadata ->> 'requested_moment_id' = p_moment_id::text
            and status = 'accepted' then response_message
          else null
        end,
        responded_at = case
          when metadata ->> 'requested_moment_id' = p_moment_id::text
            and status = 'accepted' then responded_at
          else null
        end,
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
          'request_kind', 'moment_partnership',
          'requested_moment_id', v_moment.id,
          'requested_moment_title', v_moment.title
        ),
        updated_at = now()
    where id = v_row.id
    returning * into v_row;
    return v_row;
  end if;

  insert into public.activation_collaborators (
    proposal_id, role, invited_user_id, invited_by, display_name,
    responsibility, status, metadata
  ) values (
    p_proposal_id, 'host', v_moment.host_id, auth.uid(), 'Moment host',
    coalesce(nullif(trim(p_message), ''), 'Explore hosting this activation at ' || v_moment.title || '.'),
    'invited',
    jsonb_build_object(
      'request_kind', 'moment_partnership',
      'requested_moment_id', v_moment.id,
      'requested_moment_title', v_moment.title
    )
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.respond_to_activation_invitation(
  p_collaborator_id uuid, p_response text, p_message text default null
) returns public.activation_collaborators
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.activation_collaborators%rowtype;
  v_requested_moment_id uuid;
begin
  if p_response not in ('accepted', 'declined', 'changes_requested') then
    raise exception 'Invalid response';
  end if;

  update public.activation_collaborators
  set status = p_response,
      response_message = p_message,
      responded_at = now(),
      updated_at = now()
  where id = p_collaborator_id
    and (
      invited_user_id = auth.uid()
      or exists (
        select 1
        from public.organization_members om
        where om.organization_id = invited_organization_id
          and om.user_id = auth.uid()
      )
    )
  returning * into v_row;

  if not found then raise exception 'Invitation not available'; end if;

  if p_response = 'accepted'
     and v_row.metadata ->> 'request_kind' = 'moment_partnership'
     and v_row.metadata ->> 'requested_moment_id' is not null then
    v_requested_moment_id := (v_row.metadata ->> 'requested_moment_id')::uuid;

    if not exists (
      select 1 from public.moments
      where id = v_requested_moment_id and host_id = auth.uid()
    ) then
      raise exception 'Only the Moment host can accept this partnership';
    end if;

    update public.proposals
    set target_moment_id = v_requested_moment_id, updated_at = now()
    where id = v_row.proposal_id;

    insert into public.moment_scene_links(moment_id, scene_id, relationship)
    select v_requested_moment_id, scene_id, 'partner'
    from public.proposals
    where id = v_row.proposal_id and scene_id is not null
    on conflict do nothing;
  end if;

  return v_row;
end;
$$;

grant execute on function public.unlink_activation_scene(uuid) to authenticated;
grant execute on function public.unlink_activation_moment(uuid) to authenticated;
grant execute on function public.request_activation_moment_partnership(uuid, uuid, text) to authenticated;
grant execute on function public.respond_to_activation_invitation(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
