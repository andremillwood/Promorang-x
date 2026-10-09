-- Minimal source-ledger fixture for an isolated PostgreSQL database only.
do $$ begin
  if current_database() <> 'promorang_funnel_test' then raise exception 'Use the isolated promorang_funnel_test database'; end if;
end $$;
create role anon;
create role authenticated;
create role service_role;
create schema auth;
create table auth.users(id uuid primary key);
create table public.crm_leads(id uuid primary key, funnel_key text, user_id uuid, first_captured_at timestamptz default now());
create table public.moments(id uuid primary key, host_id uuid, organizer_id uuid, status text, created_at timestamptz default now());
create table public.guest_moment_rsvps(id uuid primary key, user_id uuid, moment_id uuid, status text, created_at timestamptz default now(), claimed_at timestamptz);
create table public.guest_attendance_receipts(id uuid primary key, rsvp_id uuid, moment_id uuid, user_id uuid, verified_at timestamptz default now());
create table public.moment_participants(id uuid primary key, user_id uuid, moment_id uuid, status text, joined_at timestamptz default now(), checked_in_at timestamptz);
create table public.offers(id uuid primary key, owner_user_id uuid, status text, created_at timestamptz default now());
create table public.offer_issuances(id uuid primary key, user_id uuid, offer_id uuid, status text, issued_at timestamptz default now(), claimed_at timestamptz, redeemed_at timestamptz);
create table public.campaigns(id uuid primary key, brand_id uuid, activation_proposal_id uuid, created_at timestamptz default now());
create table public.activation_gem_reserves(proposal_id uuid primary key, secured_gems numeric default 0, released_gems numeric default 0, refunded_gems numeric default 0, updated_at timestamptz default now());
create table public.proof_submissions(id uuid primary key, user_id uuid, moment_id uuid, submission_state text);
create table public.verified_actions(id uuid primary key, user_id uuid, moment_id uuid, action_type text, verified_at timestamptz);
