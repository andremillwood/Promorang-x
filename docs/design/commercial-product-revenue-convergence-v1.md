# Commercial Product + Revenue Convergence v1

**Status:** audited contract and P0 convergence baseline, 2026-09-23
**Branch:** `codex/commercial-activation-promopush-convergence-v1`
**Constraint:** no deployment, no main merge, no fabricated commercial data.

## Decision

PROMORANG already contains the main parts of the commercial loop. The safe path is to connect them:

`Demand → programme → proposal/activation → Offer/access inventory → PromoPush/PromoShare → response/order/pass → fulfillment → evidence → allocation/settlement → next move`

Activation is the operating envelope, not a ninth customer programme. PromoPush is the distribution system, not a second campaign system. Offer and activation access remain the inventory authorities. Gems/economy transactions, activation reserves, payout allocations, referral commissions, and merchant settlement remain the financial authorities.

## Audit classification

| Family | Decision | Existing authority | Convergence note |
|---|---|---|---|
| First 50, Fill the Room, Try This, Move This, Quiet Hours, Bring Them Back, What Do They Want?, Tell Somebody | KEEP | `business-outcomes.ts`, Business Start, programme metadata | Preserve as the eight customer-facing jobs. |
| Campaign/proposal/activation | CONNECT | campaigns, proposals, activation operations, stakeholder access | Use as one operational envelope; do not create another campaign root. |
| PromoPush | EXTEND | `promopush_campaigns`, channel/events APIs, creator links, `/go/:code` | Supply and demand push are modes. Launch already has configuration and funding gates. |
| PromoShare/referrals | CONNECT | PromoShare governance and referral services/ledger | Keep storage compatible; attribution alone never creates earnings. |
| Offer/inventory | EXTEND | `offers`, distributions, issuances, atomic claim/redemption | Canonical for perks, samples, discounts, rewards, and merchant fulfillment. Add allocation views/adapters, not a new stock engine. |
| Activation access | KEEP | access tiers/passes and Gem purchase functions | Canonical for free/paid/invite/earned/reward/draw access and finite capacity. |
| Contributions/sponsorship | CONNECT | activation contributions/funding events, organizations, stakeholder access | Sponsor/brand/venue/agency contributions belong to an activation and desired outcome. |
| Commerce | CONNECT | commerce orders/reservations, activation passes, Stripe verification boundaries | A claim, reservation, payment, attendance, and redemption remain distinct. |
| Gems and reserves | KEEP | economy wallet/transactions, activation Gem reservations/reserves | Planned budget is not secured money. Reserved value is not revenue. |
| Settlement/payout | EXTEND | payout allocations, release/refund functions, referral commissions, merchant ledger | Use configured funded rules and idempotent release/reversal. |
| Evidence Pack | EXTEND | Brand/Agency evidence surfaces, proof feeds, outcome snapshots | Join authoritative sources and say “Not recorded” when absent. |
| Discovery/Want/Ask/Poll | KEEP | discovery demand hooks/services, demand plans, opportunity inbox | Preserve question → option → signal → aggregate → response and provenance. |
| Agency services | CONNECT | Agency workspace/service catalogue/collaborators | Agency is a provider; its labour and revenue are not implicit platform revenue. |
| Enterprise | DEFER | organization roles, integration and API foundations | Not required to close the first commercial loop. |

## What looks missing but already exists?

- Atomic finite Offer claims and redemption guards.
- Free and paid activation access with row locking and capacity checks.
- Activation contributions for cash, venue, product, service, access, media, talent, reward, transport, and other.
- Gem-native activation reservations, aggregate reserves, payouts, and refunds.
- Server-only verified funding boundaries and idempotency keys.
- Stakeholder-scoped RLS for activation funding, contributions, passes, and payouts.
- PromoPush campaigns, channels, links, events, configuration validation, inactive-link guards, and funded launch checks.
- Referral attribution and direct referral economics.
- Merchant Offer validation and pending fulfillment queues.
- Host attendance/check-in and evidence surfaces.
- Discovery/Demand aggregation and operator response entry points.

## What genuinely does not exist end to end?

- One universal adapter carrying PromoPush/PromoShare attribution through every order and refund rail.
- One operator screen aggregating Offer stock, access tiers, contributions, Gem reserves, distribution, orders, fulfillment, evidence, and settlements.
- A first-class inventory allocation picker that references canonical Offer/access records without manual IDs.
- A configurable multi-party sale allocation contract used by every checkout path.
- A fully joined Evidence Pack from demand source through transaction, fulfillment, reversal, and repeat action.
- Automated consent-aware notification from a demand signal to a legitimate supply response across every demand path.
- Complete real-record golden-journey QA. Existing demo or example context is not proof.

## Pricing authority and doctrine drift

| Economic system | Classification | Authority today | Contradiction / isolation |
|---|---|---|---|
| Participant memberships | LEGACY-COMPATIBILITY | `backend/constants/pricing.js`, active subscription/order records | Older fixed USD tiers coexist with newer public outcome pricing. Do not advertise or delete without entitlement and checkout audit. |
| Advertiser Move/Drop tiers | LEGACY-COMPATIBILITY / DEPRECATE | `backend/constants/pricing.js` and legacy advertiser flows | Contains JMD anchors and action-volume promises that conflict with international, outcome-first public doctrine. Keep existing contracts readable; do not make this the new public authority. |
| Programme/service fee | EXTEND | configured proposal/order/agreement | Public Pricing correctly scopes before price; no invented tariff. |
| Transaction/service fee | CONNECT | actual checkout/order/payment record | Must be disclosed on the transaction; not inferred from marketing copy. |
| PromoPush | EXTEND | campaign pricing plan plus linked funded proposal/reserve | Planned Gems are not secured; paid launch requires canonical funding. |
| Sponsorship/admin | CONNECT | contribution/funding agreement and activation record | Sponsor inventory/funding is not platform revenue unless an explicit admin/service fee exists. |
| Enterprise | DEFER | negotiated order/agreement | No public invented tier. |
| Rewards/payouts | KEEP | funded earning rule plus economy/payout ledger | Link/click/attribution alone is insufficient. |

Until an active order says otherwise, public doctrine is `OUTCOME → PROGRAMME → SCOPE → CONFIGURED PRICE`. Legacy tier constants are compatibility inputs, not permission to promise outcomes.

## Canonical commercial contract

### Revenue families

1. Programme/activation fee.
2. PromoPush/distribution.
3. Transaction/service fee.
4. Real operator subscription.
5. Sponsorship/funded-programme administration.
6. Enterprise/infrastructure.

Every recognized amount must reference the agreement, order, fee, or ledger entry that makes it authoritative.

### Money buckets

Track separately: gross money received, tax, processor cost, platform revenue, participant value, distribution/media cost, agency/provider cost, operator proceeds, reserved, earned, paid, refunded/reversed, and still available. Inventory is never cash. A target or estimate is never committed or earned value.

### Inventory/resource model

The aggregate activation resource view may combine references to money, inventory, distribution, media, services, access, audience, and rewards. It does not replace their canonical tables. Finite inventory requires quantity and cannot fall below zero. Unlimited supply must be explicit. Reservation is not fulfillment.

Sellable, free, discount, BOGO, bundle, perk, distributor, brand, reward, and access allocations must retain owner/source, quantity, reserved/fulfilled counts, optional reference value and currency, terms, eligibility, purpose, activation association, validity, evidence, and attribution where applicable.

### Contribution model

A contribution belongs to an activation and records contributor, type, description, quantity/amount where relevant, owner, intended outcome, terms, fulfillment responsibility, status, and evidence. Money, products, offers, rewards, access, distribution, and services are not interchangeable buckets.

### Distribution and attribution

PromoPush is the execution family. Demand Push distributes a question or demand signal. Supply Push distributes an available Offer/Moment/action. A share or attributed touch records influence only. Earnings require an explicit, funded rule and sufficient evidence.

### Fulfillment

Every material promise needs an owner before launch. Offer issuers/merchants fulfill perks; hosts fulfill access/check-in; brands or venues fulfill their products; agencies fulfill contracted services; configured settlement fulfils commissions/rewards. Drafts may remain unresolved; launch may not.

### Settlement states

`planned → secured/funded → pending → earned → released/paid`, with `disputed`, `refunded/reversed`, and `cancelled` paths. State transitions must be idempotent. Paid cannot exceed earned; earned cannot exceed reserved; paid plus refunded cannot exceed reserved.

### Evidence states

`view ≠ vote ≠ want ≠ share ≠ RSVP ≠ reservation ≠ purchase ≠ attendance ≠ redemption ≠ repeat purchase`.

Evidence Packs display source, time, scope, confidence/status, and “Not recorded” for missing evidence. They never promote a weak event into a stronger one.

### Internationalization

Customer copy uses the established translation catalogue. Currency is an explicit ISO code and is formatted with the active locale. Dates, numbers, quantities, and pluralization use locale-aware helpers. No new core contract assumes Jamaica, Kingston, JMD, USD, US addresses, tax, phone, or time formats. Existing Gem doctrine is a separate internal platform-value rule, not a general commerce-currency assumption.

### Permissions and privacy

Participants see their access, proof, attribution, and funded return. Distributors see their own links, response, verified commercial outcomes, and settlement. Contributors see their commitment and agreed evidence. Operators see activation operations. Confidential margins, other contributors’ terms, and platform economics require manager/admin scope. Service-role-only payment verification remains server-side.

## P0 implementation in this pass

- Added a shared commercial-truth contract for resource types, inventory allocation types, finite/unlimited availability, evidence ordering, funded earning eligibility, and currency-consistent reserve reconciliation.
- Added unit coverage proving inventory cannot go below zero, unlimited inventory is explicit, votes/RSVPs/reservations do not become stronger evidence, attribution without a funded rule creates no earnings, and reserve/earned/paid/refunded states reconcile.
- Reused the existing Offer, activation access, contribution, Gem reserve, payout, refund, PromoPush, referral, and evidence families; no schema or parallel ledger was added.

## Deliberately not built

- A ninth “Activation” programme.
- A new Ambassador role.
- A new wallet, referral engine, campaign root, or inventory database.
- Invented pricing, inventory, demand, attendance, sales, earnings, ROI, or sponsorship results.
- Automated payout from a click/share.
- Enterprise data warehouse, prediction system, or speculative gamification.

## Golden journey truth

Supply-first and demand-first paths can be assembled from real existing records, but the whole Marika/Serendipity/Patrice/Brand journey is **not yet one reliably operated end-to-end product flow**. The exact missing link is the universal server-side attribution and allocation adapter through purchase/refund plus a single operational workspace/Evidence Pack that joins those records. Until those are complete and tested with real non-production records, operator assistance is required and automatic multi-party settlement must not be claimed.

## Next ordered work

1. Carry channel/touch IDs through the canonical order/access purchase and refund paths.
2. Post configured allocation lines idempotently to existing ledgers; never derive them from attribution alone.
3. Add a canonical Offer/access inventory picker and activation resource aggregate.
4. Join demand, distribution, order, attendance/redemption, reversal, and ledger sources in Evidence Pack.
5. Run the supply-first, demand-first, brand-contribution, PromoPush, and no-incentive journeys with test records and role-boundary checks.

## Implementation update — transaction attribution and joined evidence

Implemented on 2026-09-23:

- Extended `commerce_receipts` with explicit activation, PromoPush campaign/channel, referral, and reversal references while preserving its JSON attribution compatibility field.
- Added activation-scoped commercial rules and allocation results. These are allocation/audit records connected to the existing payout ledger; they are not a wallet.
- Added an idempotent server adapter that resolves an activation from a receipt or PromoPush campaign, requires a funded rule and sufficient evidence, rejects over-allocation, and creates an earned payout allocation only for a configured recipient bucket.
- Connected merchant purchase creation and merchant fulfillment to the adapter.
- Connected marketplace refunds to allocation reversal and cancellation of unpaid payout allocations.
- Added an activation commercial-evidence view and a role-scoped operational panel joining receipts, distribution events, fulfillment, funded rules, earned allocations, reserves, and refunds.
- Added English, Latin American Spanish, and Brazilian Portuguese copy for the new panel and locale-aware currency/number formatting.
- Corrected AftrHrs test inventory rollover so a preloaded edition cannot silently reset from the wall clock; the complete shared suite now proves concurrent finite allocation and repeat-redemption behavior.

Remaining production gates:

1. Apply and verify the migration in a representative Supabase environment.
2. Route any commerce rails that bypass `commerceOutcomeService` through the adapter.
3. Add operator UI for authoring allocation rules with explicit recipient, funding source, evidence requirement, and terms.
4. Add a canonical Offer/access picker instead of manual inventory references.
5. Execute real-record golden journeys and permission tests across participant, distributor, host, merchant, brand, Agency, and admin roles.

## Implementation update — operator setup and notification continuity

Implemented in the activation Value workspace:

- Operators can author active funded allocation rules with a bucket, fixed amount or percentage, ISO currency where applicable, required evidence, plain-language terms, and an explicit recipient for payable buckets.
- Existing active rules are visible and can be stopped without deleting their history.
- Operators can select an existing canonical Offer. The activation commitment stores the Offer reference while quantity, redemption, terms, validity, and fulfillment remain governed by the Offer record.
- Marketplace direct purchases, merchant-collected payments, Stripe commerce orders, Gem orders, and coupon claim/redemption receipts now enter the same `commerceOutcomeService` and commercial attribution adapter.
- Activation lifecycle notifications are deduplicated and sent only when lifecycle notifications have not been disabled.
- Demand-response notifications require explicit opt-in and are delivered only to users who recorded a vote on the source Discovery question.
- `publish_demand_activation_response` provides the authorized, auditable bridge from a Discovery demand record to an activation response and its route.

The migration still needs to be applied locally or in an approved non-production environment before these database-backed controls can be exercised. No remote migration or deployment was performed in this pass.
