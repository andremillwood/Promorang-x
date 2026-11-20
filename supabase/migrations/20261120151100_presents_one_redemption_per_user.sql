-- One Presents redemption per signed-in user.
--
-- Duplicate policy: keep the earliest redemption per user_id
-- (redeemed_at, then id) and delete later rows before creating the unique
-- index. Anonymous rows (user_id is null) are not part of the rule.
-- The table had 0 rows when this was specified; the delete still runs so a
-- drifted database does not fail on the index.
--
-- redeem_presents_invite raises ALREADY_REDEEMED before it increments
-- used_count, so the code stays usable. A unique_violation on the insert
-- raises the same code and rolls the redemption back.
--
-- NULL max_uses is unlimited. The original function already behaved that way
-- because `used_count >= NULL` is unknown and does not enter the exhaustion
-- branch, and the status CASE likewise keeps the current status. That was
-- accidental. The predicate below names it: exhaustion applies only when
-- max_uses is not null. Member PR- codes are still inserted with max_uses 1.
-- Signed-in redemption also requires an ISO-2 profile country and an adult
-- public.users.dob. Anonymous redemption is rejected with SIGN_IN_REQUIRED.

-- keep the earliest redemption
do $$
declare
  v_removed integer;
begin
  with ranked as (
    select id
    from (
      select
        id,
        row_number() over (partition by user_id order by redeemed_at asc, id asc) as rn
      from public.presents_invite_redemptions
      where user_id is not null
    ) numbered
    where rn > 1
  ),
  deleted as (
    delete from public.presents_invite_redemptions redemption
    using ranked
    where redemption.id = ranked.id
    returning redemption.id
  )
  select count(*) into v_removed from deleted;

  if v_removed > 0 then
    raise notice 'presents_invite_redemptions: keep the earliest redemption; removed % later duplicate rows', v_removed;
  end if;
end $$;

create unique index if not exists presents_invite_redemptions_one_per_user_idx
  on public.presents_invite_redemptions (user_id)
  where user_id is not null;

-- presents_memberships_program_user_idx already enforces one membership
-- per (program_id, user_id). This migration does not replace it.

create or replace function public.redeem_presents_invite(
  p_code text,
  p_user_id uuid default null,
  p_anonymous_id text default null,
  p_ip_hash text default null,
  p_user_agent_hash text default null,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.presents_invite_codes%rowtype;
  v_program public.presents_programs%rowtype;
  v_membership public.presents_memberships%rowtype;
  v_existing_count integer;
  v_child_codes jsonb := '[]'::jsonb;
  v_child_code text;
  v_country text;
  v_dob date;
  v_today date := (timezone('America/Jamaica', now()))::date;
  i integer;
begin
  if nullif(trim(p_code), '') is null then
    raise exception 'INVALID_REQUEST';
  end if;
  if p_user_id is null then
    raise exception 'SIGN_IN_REQUIRED';
  end if;

  select * into v_code
  from public.presents_invite_codes
  where upper(code) = upper(trim(p_code))
  for update;
  if not found then raise exception 'INVALID_CODE'; end if;
  if v_code.status <> 'active' then raise exception 'CODE_UNAVAILABLE'; end if;
  if v_code.expires_at is not null and v_code.expires_at <= now() then raise exception 'CODE_EXPIRED'; end if;
  if v_code.max_uses is not null and v_code.used_count >= v_code.max_uses then
    raise exception 'CODE_EXHAUSTED';
  end if;

  select * into v_program
  from public.presents_programs
  where id = v_code.program_id and status = 'live';
  if not found then raise exception 'PROGRAM_UNAVAILABLE'; end if;

  select p.country_code::text into v_country
  from public.profiles p
  where p.user_id = p_user_id
     or (
       p.id = p_user_id
       and not exists (select 1 from public.profiles existing where existing.user_id = p_user_id)
     )
  order by case when p.user_id = p_user_id then 0 else 1 end
  limit 1;
  if v_country is null or not public.is_iso_country_code(v_country) then
    raise exception 'COUNTRY_REQUIRED';
  end if;

  select u.dob into v_dob from public.users u where u.id = p_user_id;
  if v_dob is null then
    raise exception 'DOB_REQUIRED';
  end if;
  if v_dob > (v_today - interval '18 years')::date then
    raise exception 'UNDERAGE';
  end if;

  if exists (
    select 1 from public.presents_invite_redemptions redemption
    where redemption.user_id = p_user_id
  ) or exists (
    select 1 from public.presents_memberships membership
    where membership.program_id = v_program.id
      and membership.user_id = p_user_id
  ) then
    raise exception 'ALREADY_REDEEMED';
  end if;

  if v_program.capacity is not null then
    select count(*) into v_existing_count
    from public.presents_memberships
    where program_id = v_program.id and status = 'active';
    if v_existing_count >= v_program.capacity then
      raise exception 'PROGRAM_FULL';
    end if;
  end if;

  insert into public.presents_memberships(program_id, user_id, anonymous_id, admitted_by_code_id, metadata)
  values (v_program.id, p_user_id, null, v_code.id, coalesce(p_metadata, '{}'::jsonb))
  returning * into v_membership;

  update public.presents_invite_codes
  set used_count = used_count + 1,
      status = case
        when max_uses is not null and used_count + 1 >= max_uses then 'exhausted'
        else status
      end,
      updated_at = now()
  where id = v_code.id;

  begin
    insert into public.presents_invite_redemptions(
      invite_code_id, membership_id, user_id, anonymous_id, ip_hash, user_agent_hash, metadata
    ) values (
      v_code.id, v_membership.id, p_user_id, p_anonymous_id, p_ip_hash, p_user_agent_hash, coalesce(p_metadata, '{}'::jsonb)
    );
  exception when unique_violation then
    raise exception 'ALREADY_REDEEMED';
  end;

  for i in 1..v_code.child_allowance loop
    loop
      v_child_code := 'PR-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6));
      begin
        insert into public.presents_invite_codes(
          program_id, code, issuer_user_id, source_type, parent_code_id, max_uses, child_allowance, metadata
        ) values (
          v_program.id,
          v_child_code,
          p_user_id,
          'member',
          v_code.id,
          1,
          3,
          jsonb_build_object('issuer_membership_id', v_membership.id)
        );
        exit;
      exception when unique_violation then
        null;
      end;
    end loop;
    v_child_codes := v_child_codes || jsonb_build_array(v_child_code);
  end loop;

  return jsonb_build_object(
    'membership_id', v_membership.id,
    'program_slug', v_program.slug,
    'tier', v_membership.tier,
    'already_member', false,
    'invite_codes', v_child_codes
  );
end;
$$;

revoke all on function public.redeem_presents_invite(text, uuid, text, text, text, jsonb) from public, anon, authenticated;
