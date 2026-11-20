-- Founding invite codes are unlimited. Member codes stay single-use.
--
-- NULL max_uses means unlimited.
-- Verified against redeem_presents_invite in 202608130002_promorang_presents.sql:
--   if v_code.used_count >= v_code.max_uses then raise CODE_EXHAUSTED
--   status = case when used_count + 1 >= max_uses then 'exhausted' else status end
-- A comparison with NULL is unknown, so neither branch treats the code as
-- exhausted. Unlimited already fell out of that SQL, but the column was
-- NOT NULL and checked as 1..10000, so NULL could not be stored.
-- 20261120151100_presents_one_redemption_per_user.sql makes the predicate explicit (`max_uses is not null`).
-- Apply that migration first. This file only changes the four seeded
-- founding codes: PRESENTS, ILHH, ENCORE, FIRST100.

alter table public.presents_invite_codes
  alter column max_uses drop not null;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'presents_invite_codes'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%max_uses%'
      and pg_get_constraintdef(con.oid) not ilike '%used_count%'
  loop
    execute format('alter table public.presents_invite_codes drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.presents_invite_codes
  drop constraint if exists presents_invite_codes_max_uses_unlimited_chk;

alter table public.presents_invite_codes
  add constraint presents_invite_codes_max_uses_unlimited_chk
  check (max_uses is null or (max_uses > 0 and max_uses <= 10000));

comment on column public.presents_invite_codes.max_uses is
  'NULL means unlimited. Member codes stay at 1. Founding codes PRESENTS, ILHH, ENCORE, and FIRST100 are NULL.';

update public.presents_invite_codes code
set max_uses = NULL,
    status = case when code.status = 'exhausted' then 'active' else code.status end,
    updated_at = now()
from public.presents_programs program
where code.program_id = program.id
  and program.slug = 'founding-season'
  and code.source_type = 'founding'
  and code.parent_code_id is null
  and upper(code.code) in ('PRESENTS', 'ILHH', 'ENCORE', 'FIRST100');
