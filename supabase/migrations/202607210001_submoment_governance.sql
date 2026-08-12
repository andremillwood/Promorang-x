-- Govern attendee-created activity inside a parent Moment.
alter table public.moments
  add column if not exists submoment_status text,
  add column if not exists submoment_submitted_by uuid references auth.users(id) on delete set null,
  add column if not exists submoment_submitted_at timestamptz,
  add column if not exists submoment_reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists submoment_reviewed_at timestamptz,
  add column if not exists submoment_review_note text,
  add column if not exists venue_approval_required boolean not null default false,
  add column if not exists venue_approval_status text,
  add column if not exists venue_approved_by uuid references auth.users(id) on delete set null,
  add column if not exists venue_approved_at timestamptz;

alter table public.moments drop constraint if exists moments_submoment_status_check;
alter table public.moments add constraint moments_submoment_status_check
  check (submoment_status is null or submoment_status in ('draft','proposed','host_approved','venue_review','approved','rejected','withdrawn','completed'));

alter table public.moments drop constraint if exists moments_venue_approval_status_check;
alter table public.moments add constraint moments_venue_approval_status_check
  check (venue_approval_status is null or venue_approval_status in ('not_required','pending','approved','rejected'));

create index if not exists idx_moments_submoment_review
  on public.moments(parent_moment_id, submoment_status, submoment_submitted_at desc)
  where parent_moment_id is not null;

comment on column public.moments.submoment_status is 'Governance lifecycle for attendee-created activity inside a parent Moment.';
comment on column public.moments.venue_approval_required is 'Whether the parent venue must approve this sub-moment after host approval.';
