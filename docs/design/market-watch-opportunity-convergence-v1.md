# Market Watch + Opportunity Convergence v1

Status: implementation contract on `andre/public-experience-convergence-v2`, stacked on the canonical object branch.

## Purpose

Complete the public-market convergence without adding another object family.

The product now needs to carry one person from:

`DISCOVERY / DEMAND → WATCH → RESPONSE → ACTION → PROOF → KEPT HISTORY`

while preserving the canonical distinctions underneath.

## Participant lanes

PromoCard now presents three different relationship classes rather than collapsing everything into rewards:

### WATCHING

User-owned `saved_objects` relationships for market objects the person wants to return to.

Current watchable types:
- approved Discovery,
- canonical Demand question,
- Moment,
- offer,
- product.

Watching means:
- remember this object,
- keep it visible on PromoCard,
- make a future return experience possible.

Watching does **not** mean:
- supply exists,
- inventory is reserved,
- access is issued,
- attendance occurred,
- a purchase occurred,
- value was earned.

Contract:

`WATCH ≠ ENTITLEMENT`

### OPEN

Actual source-backed access / issued benefit already available to the person through the existing offer / issuance sources.

Contract:

`WATCH ≠ OPEN ACCESS`

### KEPT

Verified or retained consequence held by the existing Vault / proof / issuance history sources.

Contract:

`OPEN ≠ USED`

`CLAIM ≠ REDEMPTION`

`PROOF SUBMISSION ≠ VERIFIED CONSEQUENCE`

## Saved-object implementation

The existing `saved_objects` relationship ledger is reused instead of creating a new watchlist table.

Migration:

`supabase/migrations/202609170001_saved_market_objects.sql`

It extends the existing object-type constraint to support:
- `discovery`
- `demand`

No new canonical market family is introduced.

RLS remains user-owned.

Web hook:

`apps/web/src/hooks/useSavedMarketObjects.ts`

Presentation:

`apps/web/src/components/market/WatchMarketObjectButton.tsx`

`apps/web/src/components/promocard/PromoCardWatchShelf.tsx`

## Authentication continuity

Watching while signed out follows the existing auth continuity law:

`OBJECT → WATCH INTENT → AUTH → SAME OBJECT → CONTINUE`

The session marker is resumable intent only.

`AUTH RETURN ≠ WATCH SAVED`

The person must still explicitly complete the watch action after authentication.

## Public Demand + Responses

The previous `/discover/rewards` surface maintained a parallel client-side demand economy using seeded deal requests, local vote increments and invented Points.

That surface is replaced with one canonical read model:

### Demand side

Production-backed `useDiscoveryDemand(...)`.

Shows:
- recorded questions,
- recorded votes,
- configured thresholds,
- matched asks.

Never claims:
- threshold automatically created supply,
- a vote earned invented Points,
- a client-side local mutation became public market truth.

### Response side

Separate production Moment records carrying recorded reward/access language.

Contract:

`DEMAND ≠ RESPONSE`

`THRESHOLD ≠ RESPONSE`

`RESPONSE ≠ OUTCOME`

## Operator Opportunity Inbox

`apps/web/src/components/market/MarketOpportunityInbox.tsx`

The operator surface exposes:
- unresolved asks,
- recorded Demand questions,
- vote / threshold context,
- role-specific response paths.

It does not score or rank operators, guarantee conversion, or convert a threshold into automatic supply.

The shared legacy `DiscoveryDemandInbox` now delegates to this canonical opportunity model so embedded Host, Creator, Merchant, Brand and People surfaces no longer revive older unlock semantics.

## Help convergence

`apps/web/src/pages/Help.tsx` is now a plain-English canonical reference for:
- Discovery,
- Demand,
- Scene,
- Moment,
- PromoCard,
- proof,
- operator response,
- empty-state truth.

Removed as general product claims:
- guaranteed foot traffic,
- automatic payout promises,
- fixed weekly drop mechanics presented as universal product law,
- threshold-to-deal guarantees,
- invented local reward state.

## Growth instrumentation

Current market-loop events added in this slice include:
- `market_ask_recorded`
- `market_watch_saved`
- `market_watch_removed`
- `market_object_shared`

Existing page-view / attribution tracking remains in place.

These events describe interaction stages. They do not replace authoritative market, proof, issuance or commerce records.

## CI

`.github/workflows/web-build.yml` now runs the targeted public-market continuity tests before the production web build:
- `public-object-continuity.test.ts`
- `resumable-intent.test.ts`

This protects:
- exact object return through Auth,
- explicit `next` precedence,
- stale-intent expiry,
- market-watch resumability without fabricated save completion.

## Governing truth boundaries

- proposal ≠ approval
- Discovery ≠ offer
- ask ≠ supply
- vote ≠ attendance
- Demand ≠ response
- threshold ≠ Moment / offer
- watch ≠ entitlement
- auth return ≠ action completion
- RSVP ≠ attendance
- claim ≠ issuance / redemption
- purchase intent ≠ purchase
- proof submission ≠ verification
- verified consequence ≠ financial value unless the source record says so

## Next real-world validation

Run the loop against real production records:

1. open an approved Discovery while logged out,
2. choose Watch on PromoCard,
3. authenticate,
4. return to the exact Discovery,
5. explicitly complete Watch,
6. confirm it appears under PromoCard Watching,
7. open a recorded Demand question and repeat,
8. inspect the same signal from an operator account through Opportunity Inbox,
9. create a real separate response only when appropriate,
10. verify that Open and Kept states appear only after their own authoritative transitions.
