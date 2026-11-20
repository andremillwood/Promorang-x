# Public event discovery and ownership

Verified external events are public Moments. An event's public visibility does not depend on whether its organizer has claimed it. Each published physical event must link to one matching venue identity, with an existing owned profile preserved or a new unclaimed public profile created.

## Policy and market scope

`data/events/discovery-policy.json` is the event publication policy. Its `auto_publish_verified` setting supersedes the general intake review setting **for verified event discovery only**. The general `data/markets/pilot-cities.json` setting continues to govern unrelated inventory imports.

The event scopes include the existing live/pilot markets plus Florida, Georgia, New York State, Michigan, and Greater London. US states are not aliases for their largest cities. Preserve each venue's actual municipality. US and UK market configuration supplies USD and GBP respectively; event dates use the venue's IANA timezone, including Central-time areas of Florida and Michigan and daylight saving in London.

The daily discovery task looks ahead 60 days and prioritizes the next 14. Public calendar pages are discovery leads; an event-specific organizer, venue, authorized ticketing, or official tourism page must substantiate publication. Do not assume that a calendar's empty or unrendered results mean that no events exist.

## Publication contract

The migration `20261120113704_public_event_discovery_and_claims.sql` adds the service-only RPC `publish_discovered_event_candidate(p_candidate_id uuid)` and a private `event_publication_policies` table. Each enabled policy authorizes one source and market, with a country, optional state, timezone allowlist, confidence threshold, and maximum evidence age. Populate policies from the approved scopes, not arbitrary page instructions.

After applying the migration, run `scripts/events/enable-approved-discovery-markets.sql` to enable the 35 registered source/market combinations with a 0.95 confidence threshold and 24-hour evidence limit. It resolves existing sources by stable keys and preserves existing policy rows, including any deliberately paused policy. It does not publish a candidate by itself. Then recheck the approved candidate evidence and call the publisher individually, verifying its public Moment, venue profile and claim-target results.

The publisher requires an approved, current candidate with recent authoritative evidence, a verified start time and timezone, an actual venue name/address, and a matching enabled source policy. `normalized_data` must contain:

- `title`, `description`, `category`, `city`, `state` where applicable, `country`, `country_code`, and `market_key`.
- `starts_at` with an explicit UTC offset, `timezone` as an IANA identifier, `event_status: "scheduled"`, and `schedule_precision: "exact"` for the verified start. `ends_at` remains null when the source does not state an exact finish; preserve the source's more detailed precision/approximation in separate metadata.
- `venue_name`, `venue_address`, and `venue_source_url`. An explicit `venue_id` must still match the verified identity.
- Optional original organizer name/website and official ticket URL. Do not infer an organizer from a ticket vendor or venue alone.

Evidence rows must substantiate the normalized event schedule at the candidate's source URL and the physical venue at `venue_source_url`. Preserve original wording/facts separately from normalized timezone and geographical values. Only advance `checked_at` after actually retrieving the source. Store short original summaries and links; do not copy complete descriptions or assume image reuse rights.

Call the RPC after verification and read back both public directory rows. It publishes one open, imported, unclaimed Moment and resolves its venue in the same transaction. Retrying the same candidate returns the same identity. Matching includes venue and occurrence, so simultaneous events with similar names at different venues remain separate. Conflicting existing identities, ownership defaults, or duplicate matches stop publication for review.

Unknown price is not free admission, and an external event is not a Promorang reservation. Imported event pages direct visitors to the source for ticket and entry information. Listing a venue does not imply that it accepts PromoCard, provides rewards, or has partnered with Promorang.

## Ownership requests

Public event pages expose **Claim this Moment**. Unclaimed venue pages expose **Claim this venue**. Both carry the exact entity UUID through authentication to `/claim-pages`; neither creates a replacement listing.

`request_imported_listing_claim` requires a signed-in user with a Promorang profile, a relationship statement, and a supporting HTTPS URL. Requests remain private to the claimant and authorized administrators. A request does not grant editing rights. Existing email-directed invitations retain their separate workflow and take precedence over open requests.

Review requests at `/admin?tab=claimable-pages`, under discovered listing ownership claims. A public link is evidence to investigate, not automatic proof that the claimant controls the organization. Verify the claimant's authority and record a substantive review note. `admin_review_imported_listing_claim` serializes competing approvals, grants only one owner, and rejects the other pending requests. The old direct-update policy that allowed an arbitrary account to take an unclaimed Moment is removed.

Moment approval sets the real host/organizer ownership fields used by the existing management APIs. Venue approval preserves the venue UUID, creates its owned public profile, and enables the owner-only editor on that venue's public page. The venue editor synchronizes name, description, website and phone across the canonical and public profile representations. No merchant role or organization is invented to grant this access.

## Refresh, expiration, and exceptions

Automatic factual refreshes apply only to importer-controlled unclaimed records. Never overwrite an organizer's edits, transfer ownership, reset cancellation, reactivate retired records, or manufacture a partnership. Preserve existing prepared ownership invitations.

`expire_stale_imported_moments()` retires eligible unclaimed imports after the supplied end, or a conservative internal fallback when the end is unknown. That fallback is not a public event end time. Do not use the `closed` business state as an expiration shortcut: it can trigger unrelated economy behavior.

For a verified cancellation or a schedule change that cannot be safely reconciled, keep its current evidence and proposed correction in the intake record and identify the exact affected Moment. A missing source page is not proof of cancellation. Do not publish another copy of an existing event to apply a correction.

Known setup holds on 2026-11-20:

- Kingston Curry Festival: Devon House has conflicting legacy canonical/directory identities and a claimed default without a corresponding owner. Reconcile those records before publishing; do not create a third unclaimed venue profile.
- Reggae Marathon: the existing Moment and candidate refer to the same event, but official runner and FAQ pages disagree on start times. Resolve the schedule conflict before changing its public record.

## Verification and reporting

The SQL regression suite exercises actual PostgreSQL behavior with PGlite: evidence gates, atomic publication, retry/deduplication, separate venues, geography/timezone checks, retirement protection, direct takeover denial, private competing claims, and approved owner edits. Frontend tests cover exact claim targets, form/admin contracts, state filtering, direct public detail lookup beyond the feed window, and timezone-safe event edits.

Each daily result should report newly published Moments and venue profiles, updates, held records, duplicates avoided, sources that failed, and coverage gaps by market. Include public links only after reading back the published records. Research, staged candidates, and successful publication are distinct outcomes.
