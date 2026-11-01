# PromoCard beyond its physical representation

## Product intent
PromoCard is the continuity of access across discovery, participation, use and retained history. Make its usefulness visible at the decision point. Preserve the approved physical card as a presentation option, with an independent access mark for the rest of the interface.

## Appreciations and implementation plan

| Appreciation | User benefit | Current implementation / boundary |
| --- | --- | --- |
| Recognition | Recognize where PromoCard matters | Open-door-and-spark vector mark; text accompanies state signals. Not a card silhouette. |
| Everyday utility | Know what is available to use now | Today access strip with real ready count, benefit title and direct Card route. |
| Discovery | Understand how an offer connects to personal access | Shared offer signals distinguish claimable, saved, ready, pending, used, expired and unavailable. |
| Ownership | Avoid claiming the same issued access again | Offer detail recognizes owned offer/issuance IDs and opens existing access. |
| Navigation | See that access is waiting without opening a separate page | Desktop and mobile Card navigation show a real ready count; no guest or stale-data count. |
| Participation | Understand what remains after attending | Verified proof links to PromoCard access; it does not assert that a reward was issued. |
| Redemption | Get to the appropriate next action | Direct route to the existing Card access section and its actual code/QR/fulfillment flow. No credential shown in navigation or summaries. |
| Fulfillment | Distinguish ownership from readiness | Shipping, manual and automatic processing stay pending until authoritative state changes. |
| Retention | See what was kept and used | Card and Vault access summaries distinguish ready, saved/pending, used and expired records. |
| First use | Know how to begin | Honest empty state leads to actual offer discovery. |
| Trust | Understand failure and staleness | Loading, retry, stale-data notice and conservative counts. No fabricated zeros after a failed request. |
| Personal relevance | See meaningful local access | Existing nearby discovery and market-scoped APIs remain the source. No guessed location or invented eligibility. |
| Partner value | Connect issuing access to participant use | Existing operator ledger remains the data source; no new savings, attribution or acceptance promises. |

## Build order
1. Shared read-only access-state presenter and tests.
2. Vector access mark, contextual signal, account summary and navigation count.
3. Today, Card, Vault, discovery offer cards, offer detail and verified proof integration.
4. Regression states, actual mobile/desktop screenshots, build, changed-file lint and production checks.
5. Commit and deploy only the isolated release worktree.

## Assets and constraints
The mark is a small repository-native SVG in `apps/web/src/components/promocard/PromoCardPresence.tsx`, styled by `PromoCardPresence.css`. No raster asset is necessary. Category photography is the separate generated 100-scene library documented in `category-variation-prompts.json` and `category-imagery.md`.

No backend entitlement, authentication, payment, redemption or RLS policy changes. No real account claims or redemptions during QA. Monetary savings, priority access, personal cultural traits, exclusive unlocks and acceptance claims require authoritative supporting data before adding them.

## Future extensions requiring additional product/data work
A personal benefit-use timeline with verified monetary savings; explicit issuer-authored eligibility explanations; opted-in expiry reminders; scene-specific earned access; partner acceptance signage based on verified participation; member preferences based on consent. These are separately scoped extensions, not implied by this interface release.

## Release verification
72 unique tests passed across the affected suites and final reruns, including four owned/unowned/used/expired offer tests and twelve dedicated presence tests. Slow-machine five-second timeouts were rerun with a larger test startup budget; no test assertions were weakened.

Verified 100 distinct large images by SHA-256, plus their 100 responsive versions (13,751,366 bytes combined). Reviewed category contact sheets, creation previews, uploaded-photo priority, broken-upload recovery and stable cross-placement scene selection. Browser fixture matrix covered mobile and desktop Today, discovery, Wants, Vault, public market, Moment, scene, Piece, offer and drop detail, plus Card, verified proof, first-use and failed access loading. Final owned-offer checks confirm one access link and no duplicate claim button on either viewport. No page overflow, broken images or browser errors in successful final checks. Signed-in checks use local fixtures; no real claims or redemptions were performed.

The new shared presence component passes ui-craft-detect with zero findings. Changed-file lint comparison introduced no findings; the 48 existing findings remain outside this change. The scoped finish review preserves hierarchy, type, surfaces, spacing, icon scale, responsive touch targets, reduced-motion behavior, focus visibility, loading/error states and the existing physical-card presentation. No added animation is needed. Production build retains the existing large-chunk warning.
