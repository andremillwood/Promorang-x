# PROMORANG Job-First Integrity Sweep — 2026-09-14

**Companion to:** `docs/design/job-first-platform-audit-2026-09-14.md`  
**Doctrine:** `docs/design/promorang-job-first-workspace-standard.md`

## Purpose

The first Job-First audit fixed the primary role dashboards. This deeper sweep tests a harder requirement:

> **A truthful top-level dashboard is not enough if one click later the product invents activity, money, people, rewards, rankings, or opportunities.**

This sweep therefore targets production-facing secondary surfaces, demo fallbacks, financial-looking claims, and evidence inflation.

---

## Integrity rule

PROMORANG must distinguish four things explicitly:

1. **Live record** — returned by the production data source.
2. **Empty state** — no live record exists.
3. **Example / starter pattern** — instructional content, clearly labelled and never counted as live data.
4. **Development fixture** — available only in development/test, never substituted into production.

If a live query is empty or fails, PROMORANG must not replace it with a development fixture.

---

## Deep fixes completed

### Main-first consolidation follow-up

The `87b8f969a` mainline was compared with the earlier local product pass before any work was reapplied. Main remains authoritative for the job-first workspace model and the Today · People · Create · Earn · Card customer loop. The older parallel navigation experiment was not restored.

The follow-up also removed financial-looking claims that survived the first sweep:

- Merchant Results no longer invents GMV, Gems retained, arrivals, repeat rate, APY, location count, or settlement success. It shows recorded transaction-derived points and action counts, with explicit loading, error, and evidence-strength language.
- Save & Win navigation no longer claims “ZERO RISK” or “100% Protected”; it points people to eligibility and withdrawal terms.
- The daily streak modal no longer promises dividend yield or unverified Gem drops.

The pre-consolidation work remains preserved in the named stash `codex-pre-main-consolidation-2026-09-14`; it was not applied wholesale because several of its navigation and economy decisions conflict with the current release contract.

### Production content drops

`apps/web/src/data/seeded-content-drops.ts`

Demo drops and demo leaderboards are now exported only when:

- `import.meta.env.DEV`, or
- `import.meta.env.MODE === "test"`

Production receives an empty array / empty leaderboard map. This protects any surface that still imports the seeded helper from accidentally presenting examples as real inventory.

### Cultural feed fallback

`apps/web/src/data/cultural-feed.ts`

The old fallback contained fictional Moments, creators, offers, products, Pieces, prices, participant counts, rewards, and urgency labels. Production fallback is now `[]`. Fixtures remain available only for development/test.

### Growth Hub

`apps/web/src/pages/GrowthHub.tsx`

Removed demo people/events from the active Growth route. The page now asks what movement the user wants to create, explains what proof would count, and routes to mechanisms only after the job is understood.

### Host Results

`apps/web/src/components/host/HostImpactYieldConsole.tsx`

Removed synthetic claims including:

- fake participant totals
- host level/rank
- APY
- sponsor value
- participant monetary value
- retention/viral/geographic metrics without evidence

The routed Host results surface now uses recorded hosted Moments plus verified role-progress data. Unsupported metrics are explicitly labelled **Not measured yet**.

### Brand Intelligence

`apps/web/src/components/brand/BrandIntelligenceConsole.tsx`

Removed synthetic treasury and financial claims including:

- fake escrow balance
- fake Gems liquidity / APY
- fake quarterly disbursement
- simulated campaign funding
- unsupported ROI / AI-budget claims

The surface now reports campaign records, active campaigns, and recorded results only, then asks the brand to decide whether to repeat, change, or stop.

### Simulated Liquidity Vault

`apps/web/src/components/LiquidityVaultDashboard.tsx`

This was the highest-risk issue found in the sweep. The old component simulated:

- `125,000` Gems protocol TVL
- `16.4%` APY
- a browser-local "stake" stored in `localStorage`
- protected reserve / instant payout claims
- a fee-distribution return model

The simulated financial mechanism has been removed. The component now states that the community reserve is **not active**, shows only the user's recorded Gem balance, and explains that any future reserve/yield product requires a real ledger, settlement model, legal/compliance review, and auditable economics.

### Real `/liquidity` route distinguished from fake Vault simulation

`apps/web/src/pages/LiquidityDashboard.tsx`

This route was inspected separately. Unlike the removed browser-local Vault simulation, it fetches:

- `/api/pools`
- `/api/liquidity/positions`
- `/api/gems/balance`

and derives an estimated return from recorded pool volume/reserves. It was **not removed in this pass** because it is backed by server records rather than hardcoded TVL/APY. Its fee-sharing/legal claims still require a future product/legal audit.

### Pioneers

`apps/web/src/pages/Pioneers.tsx`

Removed the fictional "recording" trail containing invented people, check-ins, contribution amounts, and activity. The public leaderboard now shows only service-returned records. On error or emptiness, no fallback ranking is inserted.

### Creator profile

`apps/web/src/pages/CreatorDetail.tsx`

The route had no real creator-profile data source and was entirely backed by `culture-demo`, while also offering live-looking follow/message/PromoShare commission actions.

Production now refuses to substitute a fictional profile. Development/test can still render the sample, but it is explicitly non-live and commission/follow/booking actions are disabled.

### Watch / Unlock

`apps/web/src/pages/WatchUnlock.tsx`

Inspected and retained. Mission inventory is loaded from `/api/o2o/feed`; the `culture-demo` dependency is decorative hero imagery, not mission data. Empty mission state remains honestly empty.

### PromoShare

`apps/web/src/pages/PromoShare.tsx`

Inspected and retained. User cycles, entries, sponsor pools, featured pools, and history load from production APIs. Demo imagery does not replace PromoShare account records.

---

## Evidence-strength rule

The UI must not silently promote a weaker signal into a stronger claim.

Examples:

| Evidence actually recorded | Allowed wording | Do not automatically call it |
|---|---|---|
| Impression | Seen / impression | demand, interest, conversion |
| Click | Click / visit to link | purchase, customer |
| RSVP | RSVP / intent to attend | attendance |
| Check-in | Verified arrival / attendance | purchase |
| Claim | Claimed offer | redeemed, purchased |
| Redemption | Redeemed / used | repeat customer, lifetime value |
| Payment record | Purchase / paid transaction | retention |
| Repeat verified action | Return / repeat | loyalty without a defined threshold |

---

## Remaining production-demo uses to classify

A static scan still finds `@/data/culture-demo` imports in some active web files. They are not all equivalent.

### Lower risk / likely decorative

- `Activity.tsx` — image fallback / presentation
- `Wallet.tsx` — hero background imagery; wallet balances come from real APIs
- `Settings.tsx` — visual assets
- `WatchUnlock.tsx` — hero imagery; missions come from real API
- `CreateCampaign.tsx` — visual/starter imagery; compiler/save path is real
- `CreateBounty.tsx` — inspect whether imagery is purely visual

### Requires follow-up product audit

- `OrganizerLanding.tsx` — determine whether examples/simulator are clearly labelled
- `PromoShare.tsx` — API data is real, but any culture-demo decorative event references should stay non-evidentiary
- any remaining page that imports `cultureCreators` or `cultureEvents` as actual entities rather than images

Rule for the follow-up:

> Decorative sample media can remain. Sample identity, metrics, opportunity, money, status, or proof must be development-only or explicitly labelled non-live.

---

## Updated platform posture after this sweep

The main role experiences now consistently start with:

**Purpose → outcome → next move → proof → next decision → tools**

The deeper integrity pass additionally removed or gated:

- fake dashboard metrics
- fake live status
- fake revenue/APY/escrow
- fake creator earnings/rank
- fake event/venue defaults
- fake content inventory
- fake cultural feed inventory
- fake contribution trail
- fake creator profile/commission actions
- fake browser-local liquidity staking

The remaining work is now less about the main information architecture and more about systematically applying the same doctrine to every secondary detail page and specialist console.

---

## Definition of trustworthy production UI

Before shipping a production-facing number, badge, person, opportunity, reward, ranking, or financial claim, the implementation should be able to answer:

1. What production source produced this value?
2. What exact event or record does it represent?
3. Is the label no stronger than the evidence?
4. What does the UI show when the source is empty?
5. What does the UI show when the source fails?
6. Is any development fixture capable of entering this production path?
7. If money/returns are involved, is the economic and legal model actually live and auditable?

If those questions cannot be answered, the UI should show an empty/unsupported state rather than simulate confidence.
