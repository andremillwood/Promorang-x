# Universal verified-outcome architecture (proposed, not deployed)

## Critical migration blocker
The existing `supabase/migrations/202611060001_munchies_partner_pilot.sql` on this branch is malformed and must **not** be applied. It contains duplicated fragments and incomplete currency constraints following an earlier refactor. Replace and validate it before any merge. The proposed replacement write was blocked, so the broken file remains unchanged.

## Shared entities
- Campaign: sponsoring organization, native ISO currency, funded budget, outcome policy and attribution window.
- Partner membership: approved partner and campaign-specific eligibility.
- Outcome: immutable source-system identifier, source record ID, campaign, partner, outcome type, verification status, evidence and timestamps.
- Commission: unique outcome reference, fixed/percentage reward policy, native currency, margin cap, approval, payout and reversal status.

## Outcome adapters
- `order_fulfilled`: paid and delivered/redeemed merchant commerce order, confirmed attribution, refunds monitored. First to implement.
- `event_checked_in`: trusted event check-in with valid ticket or attendance record. Not yet implemented.
- `lead_qualified`: merchant-approved CRM record with qualification rules and anti-duplication. Not yet implemented.
- `sale_closed`: verified sale and collected payment, e.g. vehicle. Not yet implemented.
- `subscription_paid`: paid billing invoice, not free signup. Not yet implemented.
- `shipment_completed`: trusted completed shipment. Not yet implemented.

Only verified outcomes may create payable commission records. Unknown outcome types must fail closed. Neither screenshots nor arbitrary user-generated event names establish financial eligibility.

## Next safe development tasks
1. Replace malformed migration with valid, reviewed SQL; validate in disposable PostgreSQL before applying anywhere.
2. Add a trusted order adapter using existing merchant-confirmed and online payment records, preserving native currency.
3. Test idempotency, referral locking, self-referrals, refunds, reversals, race conditions, commission cap and service-role authorization.
4. Keep draft PR #164 unmerged and undeployed until review.
