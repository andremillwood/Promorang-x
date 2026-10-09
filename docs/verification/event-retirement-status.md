# Confirmed event retirement — 9 October 2026

## Final scope

Andre confirmed Encore: Ladies Throwback Playground at Footprints Cafe. Only this exact Andre-owned series and AftrHrs at Sea Deck are retired. Capleton's separate concert at Plantation Cove is unchanged. I Luv Hip Hop remains active weekly on Thursdays in America/Jamaica. Homepage proposal and recurring discovery publication are excluded.

Production database approval succeeded for retire_confirmed_aftrhrs_encore_series. Verification confirms both target moments inactive/closed/nonrecurring, five AftrHrs editions retained with publication/claims closed, one digital release closed, and the exact-ID retirement trigger installed. Complete Capleton and I Luv Hip Hop rows match the before-state exactly. No events, passes, tickets or participation history were deleted.

Private complete before-state is /workspace/promorang-event-retirement-final-before.json, captured 2026-10-09T17:24:29.803154Z, owner-only permissions, outside Git. Earlier attempts expired/aborted without changing records. The SQL from 716770ede was superseded; only the corrected SQL in this release was approved/applied.

## Code

Remove retired AftrHrs promotions from card/wallet/home/auth/scene/venue surfaces and the global claim-resume redirect. Existing landing URLs show a past-event notice with no RSVP/claim action; historical ticket routes remain. SEO no longer advertises Friday recurrence. Preserve Capleton's curated entry unchanged; remove only the two confirmed series' curated promotions. Generic Encore detail supports the existing Moment ended state after recurrence is disabled.

Backend refuses to regenerate inactive AftrHrs editions. The canonical feed resolves current/next recurring occurrences, keeping Thursday I Luv Hip Hop visible while preserving Jamaica wall time. backend/lib/momentRecurrence.js is generated from the existing web utility; regenerate if that source changes.

## Validation

- 28 focused web tests pass.
- 19 backend tests pass (canonical feed and AftrHrs service).
- PGlite SQL test passes: exact two targets retired; Capleton unchanged; five editions retained/closed; new/reopened AftrHrs editions blocked; unrelated editions allowed; repeated execution idempotent.
- Production build passes; lint zero errors/117 existing warnings; diff check passes.
- No real claims, messages, charges, redemptions or payouts were tested. Physical iPhone/Safari remains unverified.

## Rollback

Do not revert the database blindly. Restoring promotions without deliberately reactivating series would advertise closed events. If authorized, remove only the new exact-ID trigger/function and restore changed fields conditionally from the private snapshot, preserving intervening writes. Do not reopen old claim windows indiscriminately. Normal code rollback can leave database retirement intact.

## Discovery automation

Not enabled. Market, cadence and review-versus-auto-publication are still undefined. Existing inventory candidates/evidence/publishing infrastructure is available, but scripts/events/jamaica-events.mjs is a static list and must not be scheduled unchanged.
