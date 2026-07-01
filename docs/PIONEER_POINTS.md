# Pioneer Points

Pioneer Points are Promorang's seasonal, non-cash record of verified contribution. They are separate from ordinary activity points, Gems, Pieces, commissions, and cash earnings.

## Genesis contributors

- Members earn for meaningful active days and qualified engagement.
- Creators earn for original, attributable content.
- Hosts earn when Moments complete and meet participation or quality thresholds.
- Venues earn once for verified onboarding and repeatedly for facilitating or hosting completed Moments.
- Referrers earn only after a referred person verifies and becomes meaningfully active.
- Community builders earn for verified moderation, support, and community work.

One person may contribute in several roles. Venue events belong to the venue record, while host events belong to the user or organization doing the hosting. This prevents venue performance from being silently assigned to an individual.

## Lifecycle

1. A trusted backend workflow calls `record_pioneer_points` with a unique idempotency key.
2. Rules apply daily and seasonal caps.
3. Low-risk rules may verify immediately; performance and referral rules remain pending.
4. Automated proof or an authorized reviewer verifies, rejects, or reverses the event.
5. At the season snapshot, records freeze for fraud review.
6. Only after a reward pool is funded and announced may allocations be calculated.

## Reward allocation

An allocation should never be created until `pioneer_seasons.reward_pool_amount` and `reward_pool_currency` are set. The recommended formula is:

`beneficiary verified points / eligible verified points × funded category pool`

Category pools should be announced before the snapshot. A suggested starting allocation is 35% creators and active members, 25% hosts, 20% venues, 15% referrers and community builders, and 5% quality awards.

## Required controls

- Points cannot be bought, transferred, traded, withdrawn, or pledged.
- No fixed cash conversion rate is displayed.
- Every event has a source, an idempotency key, a status, and audit metadata.
- Self-referrals, duplicate identities, bot traffic, circular engagement, and cancelled Moments do not qualify.
- Reversals preserve the original receipt rather than deleting history.
- Published terms must identify season dates, eligibility, caps, verification, disqualification, snapshots, tax responsibility, appeals, and whether any pool is actually funded.

## Integration event keys

Use stable keys so retries cannot double-award:

- `active:{user_id}:{yyyy-mm-dd}`
- `content:{content_id}:published`
- `moment:{moment_id}:host-completed`
- `moment:{moment_id}:venue-facilitated`
- `venue:{venue_id}:onboarded`
- `referral:{referral_id}:qualified`

Only backend/service-role code may record Pioneer events. Clients can read their own receipts but cannot award themselves points.

## Production event wiring

Migration `202607010008_pioneer_production_wiring.sql` connects the ledger to trusted states:

- Venue insert creates one pending onboarding receipt.
- Moment transition to `closed` creates host and venue receipts only when participation exists.
- Content first entering `published`, `active`, or `approved` creates a creator receipt.
- Referral first entering `active` creates a connector receipt.
- Verified engagement creates member receipts; one verified view per day is treated as the active-day signal.

All integrations call the same capped, idempotent `record_pioneer_points` function. Trigger failures produce database warnings rather than breaking the underlying Moment, venue, content, or referral transaction.

## Review and integrity

Admins review receipts under **Admin → Pioneer**. Verification and rejection apply only to pending receipts. Reversal applies only to verified receipts and requires a reason. High daily event velocity and self-referral metadata create fraud flags for operational review.

## Season close and allocation

1. Let the season end.
2. Call `freeze_pioneer_season`; this records the immutable snapshot time.
3. Complete fraud and appeals review.
4. Set an actually funded pool amount, currency, and category allocation.
5. Explicitly set `allocations_enabled=true`.
6. Call `allocate_pioneer_season`.

The allocation function refuses to run for an active season, an unfunded pool, or while allocations remain disabled. Generated allocations are provisional until separately approved and paid.
