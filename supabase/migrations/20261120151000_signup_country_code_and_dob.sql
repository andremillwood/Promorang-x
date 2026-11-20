-- PromoRang signup: ISO-2 country on profiles, 18+ date of birth on public.users,
-- and no country default in upsert_user_preferences.
--
-- Profile keying (verified in this repo, both shapes are real):
--   * apps/web generated types and the web profiles migration: profiles.id is a
--     surrogate primary key and profiles.user_id references auth.users.
--   * backend/migrations/20260407_fix_upsert_user_preferences.sql inserts
--     profiles.id = auth user id, because inserting only user_id left id null.
--   * apps/web/src/lib/account-profile.ts reads user_id first, then id, and
--     inserts both.
-- Writes in this file match a row by user_id when that column matches, and
-- fall back to id = auth user id only when no user_id row exists.
--
-- Backfill choice: user_preferences.country token 'US' or 'USA' is the old
-- web default, so it is unknown and stays NULL. 'Jamaica' and 'JM' become JM
-- with country_source = backfill_unverified. Any other value that is already
-- an ISO-2 code is copied and marked backfill_unverified. Other free text,
-- including a full name such as 'United States', stays NULL so a default
-- written out in words is not treated as a confirmed country.

create or replace function public.is_iso_country_code(p_code text)
returns boolean
language sql
immutable
as $$
  select upper(btrim(coalesce(p_code, ''))) in (
    'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
    'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
    'CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ',
    'DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR',
    'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
    'HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP',
    'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
    'MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
    'NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
    'QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ',
    'TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ',
    'VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW'
  );
$$;

comment on function public.is_iso_country_code(text) is
  'True for an ISO 3166-1 alpha-2 code. Kept in sync with packages/shared/src/iso-countries.ts.';

alter table public.profiles
  add column if not exists country_code char(2),
  add column if not exists country_source text;

alter table public.profiles drop constraint if exists profiles_country_code_iso2_chk;
alter table public.profiles
  add constraint profiles_country_code_iso2_chk
  check (country_code is null or public.is_iso_country_code(country_code::text));

alter table public.profiles drop constraint if exists profiles_country_source_chk;
alter table public.profiles
  add constraint profiles_country_source_chk
  check (
    country_source is null
    or country_source in ('signup', 'backfill_unverified', 'user_confirmed')
  );

alter table public.users
  add column if not exists dob date;

create or replace function public.reject_underage_dob()
returns trigger
language plpgsql
as $$
declare
  v_today date := (timezone('America/Jamaica', now()))::date;
begin
  if new.dob is not null and new.dob > (v_today - interval '18 years')::date then
    raise exception 'UNDERAGE' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists users_reject_underage_dob on public.users;
create trigger users_reject_underage_dob
  before insert or update of dob on public.users
  for each row
  execute function public.reject_underage_dob();

create or replace function public.validate_signup_eligibility(p_country_code text, p_dob date)
returns void
language plpgsql
stable
as $$
declare
  v_today date := (timezone('America/Jamaica', now()))::date;
  v_country text := upper(btrim(coalesce(p_country_code, '')));
begin
  if v_country = '' then
    raise exception 'COUNTRY_REQUIRED' using errcode = 'P0001';
  end if;
  if not public.is_iso_country_code(v_country) then
    raise exception 'INVALID_COUNTRY' using errcode = 'P0001';
  end if;
  if p_dob is null then
    raise exception 'DOB_REQUIRED' using errcode = 'P0001';
  end if;
  if p_dob > (v_today - interval '18 years')::date then
    raise exception 'UNDERAGE' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.persist_signup_eligibility(
  p_user_id uuid,
  p_email text,
  p_country_code text,
  p_dob date,
  p_source text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_country char(2) := upper(btrim(p_country_code))::char(2);
  v_source text := coalesce(nullif(btrim(p_source), ''), 'signup');
begin
  if v_source not in ('signup', 'user_confirmed') then
    raise exception 'INVALID_REQUEST' using errcode = 'P0001';
  end if;
  perform public.validate_signup_eligibility(v_country::text, p_dob);

  -- claim_capped_drop reads public.users.dob where id = auth uid.
  update public.users
  set dob = p_dob
  where id = p_user_id;

  if not found then
    begin
      insert into public.users (id, email, dob)
      values (p_user_id, p_email, p_dob);
    exception when unique_violation then
      begin
        insert into public.users (id, dob)
        values (p_user_id, p_dob);
      exception when unique_violation then
        update public.users
        set dob = p_dob
        where id = p_user_id;
      end;
    end;
  end if;

  -- claim_capped_drop reads profiles.country_code where user_id = auth uid.
  -- If the only profile row is keyed by id, stamp user_id so that lookup hits.
  update public.profiles
  set country_code = v_country,
      country_source = case
        when country_code is null or country_code = v_country then coalesce(country_source, v_source)
        else 'user_confirmed'
      end,
      updated_at = now()
  where user_id = p_user_id;

  if not found then
    update public.profiles
    set country_code = v_country,
        user_id = p_user_id,
        country_source = case
          when country_code is null or country_code = v_country then coalesce(country_source, v_source)
          else 'user_confirmed'
        end,
        updated_at = now()
    where id = p_user_id
      and (user_id is null or user_id = p_user_id);
  end if;

  if not found then
    begin
      insert into public.profiles (id, user_id, country_code, country_source)
      values (p_user_id, p_user_id, v_country, v_source);
    exception when unique_violation then
      update public.profiles
      set country_code = v_country,
          user_id = coalesce(user_id, p_user_id),
          country_source = v_source,
          updated_at = now()
      where user_id = p_user_id or (id = p_user_id and (user_id is null or user_id = p_user_id));
    end;
  end if;
end;
$$;

revoke all on function public.persist_signup_eligibility(uuid, text, text, date, text) from public, anon, authenticated;

create or replace function public.signup_eligibility_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_country text;
  v_dob date;
begin
  if v_uid is null then
    raise exception 'SIGN_IN_REQUIRED' using errcode = 'P0001';
  end if;

  -- Same columns claim_capped_drop reads: profiles.country_code by user_id,
  -- public.users.dob by id.
  select nullif(upper(btrim(p.country_code::text)), '')
    into v_country
  from public.profiles p
  where p.user_id = v_uid
  limit 1;

  select u.dob into v_dob
  from public.users u
  where u.id = v_uid;

  return jsonb_build_object(
    'country_code', v_country,
    'dob', v_dob,
    'complete', v_country ~ '^[A-Z]{2}$' and v_dob is not null
  );
end;
$$;

revoke all on function public.signup_eligibility_status() from public, anon;
grant execute on function public.signup_eligibility_status() to authenticated;

create or replace function public.record_signup_eligibility(
  p_country_code text,
  p_dob date,
  p_source text default 'signup'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then
    raise exception 'SIGN_IN_REQUIRED' using errcode = 'P0001';
  end if;
  select email into v_email from auth.users where id = v_uid;
  perform public.persist_signup_eligibility(v_uid, v_email, p_country_code, p_dob, p_source);
  return public.signup_eligibility_status();
end;
$$;

revoke all on function public.record_signup_eligibility(text, date, text) from public, anon;
grant execute on function public.record_signup_eligibility(text, date, text) to authenticated;

-- Email signup puts country_code and dob in auth metadata. Missing metadata
-- (Google, demo, older clients) is allowed here; onboarding calls
-- record_signup_eligibility once the person is signed in. An underage dob
-- aborts the insert, so the date is not stored.
create or replace function public.enforce_auth_signup_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_country text := upper(btrim(coalesce(new.raw_user_meta_data->>'country_code', '')));
  v_dob_text text := nullif(btrim(coalesce(new.raw_user_meta_data->>'dob', '')), '');
  v_dob date;
begin
  if v_country = '' and v_dob_text is null then
    return new;
  end if;
  if v_country = '' then
    raise exception 'COUNTRY_REQUIRED' using errcode = 'P0001';
  end if;
  if not public.is_iso_country_code(v_country) then
    raise exception 'INVALID_COUNTRY' using errcode = 'P0001';
  end if;
  if v_dob_text is null then
    raise exception 'DOB_REQUIRED' using errcode = 'P0001';
  end if;
  begin
    v_dob := v_dob_text::date;
  exception when others then
    raise exception 'INVALID_DOB' using errcode = 'P0001';
  end;
  perform public.validate_signup_eligibility(v_country, v_dob);
  perform public.persist_signup_eligibility(new.id, new.email, v_country, v_dob, 'signup');
  return new;
end;
$$;

revoke all on function public.enforce_auth_signup_eligibility() from public, anon, authenticated;

drop trigger if exists enforce_auth_signup_eligibility on auth.users;
create trigger enforce_auth_signup_eligibility
  after insert on auth.users
  for each row
  execute function public.enforce_auth_signup_eligibility();

-- Replace the 'US' default from backend/migrations/20260407_fix_upsert_user_preferences.sql.
-- Null means no country was chosen. A later ISO-2 value is copied onto profiles.
create or replace function public.upsert_user_preferences(
  p_user_id uuid,
  p_age_range text default null,
  p_gender text default null,
  p_city text default null,
  p_state text default null,
  p_country text DEFAULT NULL,
  p_latitude decimal default null,
  p_longitude decimal default null,
  p_location_radius_km integer default 25,
  p_location_sharing_enabled boolean default false,
  p_lifestyle_tags text[] default '{}',
  p_preferred_categories text[] default '{}',
  p_preferred_times text[] default '{}',
  p_notification_enabled boolean default true,
  p_email_digest_frequency text default 'weekly'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  v_country text := nullif(btrim(coalesce(p_country, '')), '');
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Not authorized';
  end if;

  insert into public.profiles (id, user_id)
  values (p_user_id, p_user_id)
  on conflict do nothing;

  if v_country is not null and public.is_iso_country_code(v_country) then
    update public.profiles
    set country_code = upper(v_country)::char(2),
        user_id = coalesce(user_id, p_user_id),
        country_source = case
          when country_code is null or country_code = upper(v_country)::char(2) then coalesce(country_source, 'signup')
          else 'user_confirmed'
        end,
        updated_at = now()
    where user_id = p_user_id
       or (
         id = p_user_id
         and not exists (select 1 from public.profiles existing where existing.user_id = p_user_id)
       );
  end if;

  insert into public.user_preferences (
    user_id, age_range, gender, city, state, country,
    latitude, longitude, location_radius_km, location_sharing_enabled,
    lifestyle_tags, preferred_categories, preferred_times,
    notification_enabled, email_digest_frequency
  ) values (
    p_user_id, p_age_range, p_gender, p_city, p_state, v_country,
    p_latitude, p_longitude, p_location_radius_km, p_location_sharing_enabled,
    p_lifestyle_tags, p_preferred_categories, p_preferred_times,
    p_notification_enabled, p_email_digest_frequency
  )
  on conflict (user_id) do update set
    age_range = coalesce(excluded.age_range, user_preferences.age_range),
    gender = coalesce(excluded.gender, user_preferences.gender),
    city = coalesce(excluded.city, user_preferences.city),
    state = coalesce(excluded.state, user_preferences.state),
    country = coalesce(excluded.country, user_preferences.country),
    latitude = coalesce(excluded.latitude, user_preferences.latitude),
    longitude = coalesce(excluded.longitude, user_preferences.longitude),
    location_radius_km = coalesce(excluded.location_radius_km, user_preferences.location_radius_km),
    location_sharing_enabled = coalesce(excluded.location_sharing_enabled, user_preferences.location_sharing_enabled),
    lifestyle_tags = coalesce(excluded.lifestyle_tags, user_preferences.lifestyle_tags),
    preferred_categories = coalesce(excluded.preferred_categories, user_preferences.preferred_categories),
    preferred_times = coalesce(excluded.preferred_times, user_preferences.preferred_times),
    notification_enabled = coalesce(excluded.notification_enabled, user_preferences.notification_enabled),
    email_digest_frequency = coalesce(excluded.email_digest_frequency, user_preferences.email_digest_frequency),
    updated_at = now()
  returning row_to_json(user_preferences.*) into result;

  return result;
end;
$$;

grant execute on function public.upsert_user_preferences(
  uuid, text, text, text, text, text, numeric, numeric, integer, boolean, text[], text[], text[], boolean, text
) to authenticated;

-- Backfill. US/USA stay NULL on purpose. See the header comment.
do $$
begin
  if to_regclass('public.user_preferences') is null or to_regclass('public.profiles') is null then
    raise notice 'country backfill skipped; profiles or user_preferences is missing';
    return;
  end if;

  execute $backfill$
    with mapped as (
      select
        up.user_id,
        case
          when up.country is null or btrim(up.country) = '' then null
          when upper(btrim(up.country)) IN ('US', 'USA') then null
          when upper(btrim(up.country)) in ('JM', 'JAMAICA') then 'JM'
          when public.is_iso_country_code(up.country) then upper(btrim(up.country))
          else null
        end as code
      from public.user_preferences up
    )
    update public.profiles p
    set country_code = mapped.code::char(2),
        country_source = 'backfill_unverified',
        updated_at = now()
    from mapped
    where mapped.code is not null
      and p.country_code is null
      and (
        p.user_id = mapped.user_id
        or (
          p.id = mapped.user_id
          and not exists (
            select 1 from public.profiles existing
            where existing.user_id = mapped.user_id
          )
        )
      )
  $backfill$;
end $$;
