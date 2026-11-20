# Verified public events and reviewed listing ownership

This migration extends the existing inventory pipeline. A service process verifies source facts and stages a candidate; `publish_discovered_event_candidate` validates the evidence, resolves the venue, and publishes the public Moment in one transaction. A visitor can request ownership of an imported event or venue, but only a separate administrator can approve transfer.

## Run the PostgreSQL tests

The tests execute PostgreSQL SQL, PL/pgSQL, row security, grants, views, and identity foreign keys through **PGlite 0.5.17**. No application secrets, remote database, or production records are required.

From the repository root:

```sh
npm install --prefix scripts/tests/event-discovery
npm --prefix scripts/tests/event-discovery test
```

Alternatively, keep the dependency outside the repository:

```sh
npm install --prefix /tmp/promorang-event-sql-tests @electric-sql/pglite@0.5.17
PGLITE_MODULE=file:///tmp/promorang-event-sql-tests/node_modules/@electric-sql/pglite/dist/index.js node --test scripts/tests/event-discovery/*.test.mjs
```

`EVENT_MIGRATION_PATH` optionally selects another local SQL draft for the publication regression suite. The default is `supabase/migrations/20261120113704_public_event_discovery_and_claims.sql`; the policy-seed suite always tests that committed migration.

The separate `enable-approved-discovery-markets.test.mjs` suite executes the post-migration policy seed against synthetic registered source IDs. It verifies all 35 source policies and 14 geographic scopes, cross-checks the five new scopes against `data/events/discovery-policy.json`, checks IANA timezone availability and summer/winter offsets, preserves manually paused/customized policies on rerun, and confirms that owner profiles, claims, cancelled records, and unrelated inventory settings do not change. Disabled or missing sources are skipped rather than enabled or fabricated. Its fixtures do not assert that a remote registry is complete; check the seed's returned counts after running it on the target database.

The fixture retains the inspected live enums, relevant column defaults and constraints, `auth.users`/`public.users` ownership foreign keys, existing Moment owner policies, and the old insecure claim policy so the migration must actually remove it. The previous public directory views and candidate normalization trigger are copied from the inspected live definitions. Unrelated application tables/triggers are omitted. PGlite uses a single connection: simultaneous promise submissions verify queued retries and idempotency, while a production-equivalent multi-session lock/load test requires a PostgreSQL server. The publisher also takes transaction-scoped advisory locks before cross-candidate event and venue matching.

## Publisher contract

`public.publish_discovered_event_candidate(p_candidate_id uuid) returns uuid` is executable by `service_role` only. It accepts a current, approved/published Moment candidate without an unresolved duplicate marker, with recent source verification and confidence meeting a separately enabled event policy. Existing legacy venue `auto_publish` metadata does not authorize this operation.

`event_publication_policies` has one row per `source_id, market_key` and contains:

- `country_code`, `country_name`, optional `state`, and `allowed_timezones text[]`.
- `enabled`, default `false`.
- `minimum_confidence`, default `0.95`, constrained to `0.9–1`.
- `max_evidence_age_hours`, default `72`, constrained to `1–168`.

The collector supplies these `normalized_data` fields:

| Field | Rule |
| --- | --- |
| `title`, `city`, `country`, `country_code`, `market_key` | Source-confirmed identity and geographic scope. |
| `state` | Required for US/GB; must match a scoped policy when configured. |
| `starts_at` | ISO timestamp with explicit offset; the wall clock and offset must agree with `timezone`. |
| `ends_at` | Optional source-confirmed end; do not invent a value. |
| `timezone` | Valid IANA zone in the policy allowlist, including both zones where a state spans zones. |
| `event_status` | `scheduled`; cancelled and ambiguous candidates do not publish. |
| `schedule_precision` | `exact`, meaning the start is explicitly verified. |
| `recurrence_enabled` | False/absent; each verified occurrence has its own candidate. |
| `venue_name`, `venue_address`, `venue_source_url` | Actual physical venue and authoritative address page. |
| `venue_id` | Optional already verified identity; never invent an ID. Every existing representation at that ID must agree with source geography/address. |
| `description`, `category` | Optional concise factual presentation. |
| `ticket_status` | Optional source fact such as `sold_out`; publication does not issue tickets or imply admission/RSVP. |

The event's primary `candidate.source_url` must have a recent authoritative `event_candidate_evidence` row. Its `observed_facts` must corroborate `title`, `starts_at`, optional `ends_at`, `timezone`, `event_status`, `city`, `state`, and `country_code`. Another row at `venue_source_url`, or the same row when the page supports both, must corroborate `venue_name`, `venue_address`, `city`, `state`, and `country_code`. Supported authoritative evidence types are official calendar, organizer page, venue page, and ticket page. These evidence flags are assertions made by the trusted collector after inspecting the source; the database does not browse websites.

An unknown end stays SQL NULL. `expires_at` uses a conservative internal `starts_at + 24 hours` fallback only when no end was supplied; this is not displayed as an advertised end time.

## Identity and preservation

New unclaimed places use the same UUID in canonical `venues` and public sourced `pre_populated_venues`; `moments.venue_id` points at that canonical identity. Publication never overwrites an existing owner, inactive venue, or ambiguous legacy claim state. Matching normalizes case, punctuation, common street abbreviations, state aliases, and country aliases; ambiguous multiple IDs require research rather than an automatic merge.

An approved venue request creates the public `venue_profiles` representation with that same UUID and marks the sourced directory record claimed. The directory then displays the owner profile once, and existing Moment links retain their identity.

The publisher updates only factual fields on an existing active, unclaimed, source-controlled event. It does not reset status, visibility, ownership, payments, rewards, or admission. Retired/cancelled/closed/owned events cannot be reactivated by a refresh. Source expiry archives only unclaimed, owner-free scheduled/active/joinable imported events and leaves actual ownership and cancelled records intact.

## Claim API

- `get_imported_listing_claim_target(p_entity_type, p_entity_id)` returns public target metadata `{entity_type, entity_id, display_name, public_path, claimable}`. It does not reveal private Moment metadata.
- `request_imported_listing_claim(p_entity_type, p_entity_id, p_note, p_evidence_url)` returns the request UUID. Types are `moment` and `venue`; note is 20–4000 characters; supporting evidence is a public HTTPS URL up to 2048 characters. An applicant needs a matching public user profile before a Moment ownership FK can be assigned.
- `list_my_imported_listing_claims()` returns the applicant's own requests.
- `admin_list_imported_listing_claims()` returns the review queue and applicant IDs only to existing claim administrators.
- `admin_review_imported_listing_claim(p_claim_id, p_decision, p_review_note)` accepts `approved` or `rejected`; a 10–4000 character review note is required. Administrators cannot approve their own claim. Approval rechecks the locked target and rejects other pending claims for that asset.
- `get_my_claimed_venue_profile(p_venue_id)` returns `{id,name,description,website,phone}` only for the approved canonical owner.
- `update_claimed_venue_profile(p_venue_id,p_name,p_description,p_website,p_phone)` changes those public profile fields only; it cannot change geographic identity or ownership.

The claim ledger permits multiple applicants to request review without granting anyone control or reserving the asset for the first applicant. Requests are private to the applicant and administrators. Existing prepared email-directed `page_ownership_claims` remain unchanged and take precedence over open imported claims. The unsafe direct Moment UPDATE claim policy is removed; only reviewed transfer grants ownership.

## Deployment boundaries

The migration creates no enabled publication policies and publishes no events by itself. Seed approved source/market policies separately, then invoke the publisher on verified candidates. The old event publisher and lifecycle function lose anonymous/authenticated EXECUTE privileges. The new source expiry function fixes the old invalid `completed` enum assignment. Existing notification triggers may create in-app updates when a watched event's factual schedule/place/status changes; this migration does not email or contact organizers.

The public Moment directory now includes verified imports and appends state, market, timezone, ownership, provenance, ticket status, country code, status, and visibility metadata. Public directories exclude inactive or private/cancelled/draft listings. The view preserves approved owner-controlled imports even if an upstream candidate later expires.
