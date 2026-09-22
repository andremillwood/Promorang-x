# Commercial Activation + PromoPush Convergence v1

**Status:** implementation baseline, 2026-09-22  
**Branch:** `codex/commercial-activation-promopush-convergence-v1`  
**Scope:** connect supply, distribution, participation, commerce, proof, attribution, settlement and return without creating a parallel product family. No deployment is included.

## Executive decision

PROMORANG already has most required object families. This is a convergence problem, not a greenfield build.

`Moment/Scene → Stock or Offer/access tier → Activation/PromoPush → PromoShare or attributed channel → order/pass/claim → attendance or redemption proof → canonical ledger/allocation → Evidence/Result Pack → next move`

PromoPush remains the distribution product. `promopush_campaigns` is extended; no new campaign family is introduced. “Ambassador” is not a stakeholder: distributor is a capability represented by an accepted attributable channel. FlashCreate remains an Agency operator/service provider, not the platform ledger.

## Audit basis

Reviewed `DESIGN.md`, the completion contract/worklog, public-experience convergence and handoff, A+ execution plan, PromoCard world contract, production-truth sweep, application routes, role/participant surfaces, web hooks/services, backend APIs/services/tests, shared contracts/tests, and Supabase migrations through 2026-09-20. Repository names alone were not treated as proof.

## Capability convergence matrix

| Capability | Decision | Canonical source / current truth | Gap and required evidence |
|---|---|---|---|
| Moment | KEEP | `moments`; `/create/moment`, `/moments/:id`; create/edit/public flows exist. | Collaborator acceptance remains incomplete. Prove host create and unauthorized-edit rejection. |
| Scene | KEEP | `scenes`, membership and discovery graph; correctly distinct from Moment/attendance. | Prove a Scene relationship never implies participation. |
| Offer | KEEP | `offers`, distributions, issuances; atomic claim/redemption and merchant validation. | PromoPush reward must reference real inventory. Prove concurrent claims cannot oversell. |
| Stock/inventory | CONNECT | Merchant products, Offer quantities, activation access tiers/contributions. | Reference canonical inventory rather than copy it into prose. Prove exhaustion atomically. |
| PromoCard | KEEP | Account bootstrap, benefit/return services and participant Card. | Purchase/attendance/redemption must reach Card without invented value. |
| PromoShare | CONNECT | V2/governance and `/promoshare`; retained-value truth hardened. | Prize atomicity T-026 remains. Converge semantics with PromoPush channels before storage consolidation. |
| Referrals | KEEP | Codes/clicks/user referrals and canonical economy trigger; idempotent direct 5% policy exists. | Per-opportunity sale commission is not yet configurable. Prove duplicate source cannot double-pay. |
| Influence | CONNECT | Growth Hub, content distribution and creator attribution. | No new role needed; prove one person can participate/create/distribute with scoped views. |
| Distributor earnings | EXTEND | PromoPush creator links/earnings plus economy wallet. | Legacy JMD path bypassed Gems. New writes use Gems and remain pending; ledger release remains P0. |
| Tickets/orders | CONNECT | Activation access tiers/passes, commerce orders/reservations, guest passes. | Paid Moment access is split across families. Prove capacity and verified payment before activation. |
| Merchant validation | KEEP | Offer QR scanner and atomic redemption. | Prove non-owner and repeat redemption fail; purchase remains distinct from fulfillment. |
| Door Board/check-in | KEEP | CheckIn, Host Door Board and guest attendance receipts. | Prove RSVP alone creates no attendance. |
| Brand Evidence Pack | KEEP | Source-aware pack, proof services and outcome snapshots. | Every metric needs source/provenance and role scope. |
| Agency Managed Result Pack | KEEP | Agency pack/client workspace. | Agency consumes platform truth; client-scoped QA/export remain. |
| PromoPush | EXTEND | Campaigns/channels/events, `/promopush`, `/go/:code`, creator/promoter/admin paths. | Previously lacked outcome/package/fulfillment/funding gate. This slice closes launch truth. |
| Campaign/Activation | CONNECT | Campaigns, proposals, collaborators, contributions, access, funding, reserves and payouts. | PromoPush now links optional `proposal_id`; do not create a third family. |
| Missions | KEEP | Content missions and mission attribution/proof. | Reward only after verified proof. |
| Content Drops | KEEP | Distribution/release/provenance surfaces. | Acceptance/rights T-019 remains. |
| Gems | KEEP | Canonical economy doctrine and wallet/transactions. | Keep available/secured/pending/earned/released/refunded/withdrawn distinct. |
| Ledger/reserves | KEEP | Economy transactions/wallets and activation Gem reservations/reserves. | Prove the same balance cannot be committed twice. |
| Payments | CONNECT | Stripe webhook/capture, commerce and Gem purchase boundaries. | PromoPush funding UI missing. Client payment intent must never launch activity. |
| Commissions | EXTEND | Referral commissions, revenue sharing and payout allocations. | Configurable distributor sale terms and refund reversal remain P0. |
| Settlement/payouts | CONNECT | Payout allocations, manual queue, merchant settlement ledger and Wallet. | PromoPush earnings are not yet released through canonical ledger. |
| Subscriptions | KEEP/DEFER | Plans/tiers/pricing exist. | Not a golden-journey blocker; verify entitlement before expansion. |
| Enterprise | DEFER | Enterprise, roles, integrations and API concepts exist. | Consent, governance, retention and audit contract required. |
| Analytics/attribution | CONNECT | PromoPush events/metrics, growth events, learning and proof feeds. | Purchase/order attribution is not universally joined. |
| Data export | EXTEND | Brand/Agency report/export surfaces. | Provenance, consent and scope need verification. |
| E-commerce | KEEP | Products/orders/reservations/capture/settlement. | Add a Moment access adapter, not duplicate checkout. |
| Service marketplace/gigs | CONNECT/DEFER | Missions, bounties, service catalog, collaborators/payouts. | Bounty escrow T-057 blocks financial claims. |
| Notifications | KEEP | Jobs, receipts and push subscriptions. | Add funding/launch/proof/refund/payout lifecycle notices. |
| Permissions/roles | KEEP | Organization members, activation stakeholder access, role service/RLS. | Marika may operate merchant + host; Patrice receives distribution capability only. |

## Golden journey A — Serendipity / Marika / Patrice / participant / brand

| Step | Current state | Gap / implementation | Source of truth and success evidence |
|---|---|---|---|
| Venue | Add/claim venue and merchant organization paths exist. | Complete real claim operationally; create no fixture. | Venue, organization member and ownership claim prove Marika’s scope. |
| Moment | Host creates date/place/capacity Moment. | Use real content. | `moments`; public source-backed record. |
| Tickets | Access tiers and commerce stock exist. | Paid Moment adapter not unified (P0). | Atomic capacity 45–50 and verified Gem/payment capture. |
| Venue perks | Offer quantities and merchant validation exist. | Operator supplies real quantities/rules. | At most configured issuances/redemptions. |
| Promotional allocation | Offer allocation/access tiers can model passes/upgrades. | Host/merchant allocation UX needs convergence. | Sellable and promotional pools reconcile. |
| Distribution opportunity | Active PromoPush exposes creator opportunities. | Percentage/threshold pass terms need canonical configurable allocation. | Patrice sees audience, action, proof and truthful return. |
| Accept/share | Creator-link acceptance and `/go/:code` exist. | Later converge with PromoShare. | One acceptance returns one owned channel; no Ambassador role. |
| Distribute | QR/direct/creator/street channels exist. | Policy/consent QA. | Correct click/scan event on an active campaign only. |
| Landing | Redirect enters canonical Moment. | Moment content must lead with experience. | `/moments/:id` retains campaign/channel context. |
| Purchase/claim | Claims, orders and passes exist. | Persist channel through canonical paid access (P0). | Durable purchase/claim; purchase ≠ fulfillment. |
| Attribution | Growth touch and events exist. | Universal server-side order/refund join missing (P0). | Patrice survives auth/payment return. |
| Onward share | Participant sharing exists. | Parent commercial chain needs QA. | New link owner and parent touch remain distinct. |
| Attend | Door/check-in and attendance receipt exist. | Use host verification only. | RSVP without check-in has no attendance receipt. |
| Redeem | Merchant validation is atomic. | Connect perk to Moment/pass where relevant. | One authorized redemption with actor/time. |
| Economics | Reserve, allocations, referral ledger and settlement exist. | One configurable sale/refund allocation adapter missing (P0). | Gross and allocations/reversals reconcile exactly. |
| Evidence | Brand and Agency packs exist. | Join order/proof/ledger records. | Each role sees sourced, relevant outcomes only. |
| Return | Return panels/guidance exist. | Golden-journey decision QA needed. | Repeat/improve/invite/promote opens a real next step. |

**Status:** Moment, Offers, distributor link, landing, attendance and redemption are materially available. Paid ticket attribution plus sale-split/refund settlement remain P0, so the complete journey cannot yet be claimed without operator reconciliation.

## Golden journey B — business buys PromoPush

| Stage | Before | Converged state / source / evidence |
|---|---|---|
| Outcome | Generic title/Moment form. | Required human outcome in `objective_type`. |
| Configuration | Geo/time/reward fields. | Outcome, mode, reward, CTA and destination validated. |
| Package | No canonical mode. | Organic/geo/people/live/full stored as configurable `push_mode`/`package_code`. |
| Inventory/assets | Reward could be prose. | Reward launch requires canonical `inventory_reference` in fulfillment kit. |
| Price | Budget could appear funded. | `pricing.total_gems` is planned only; budget never means secured. |
| Fund/pay | No gate. | Paid mode links proposal and checks activation Gem reserve. |
| Launch | API directly flipped active. | DB RPC checks owner, window, config, inventory reference and funding. |
| Distribution | Channels existed immediately. | Draft links cannot resolve or be accepted. |
| Attribution | Channel events exist. | Click/proof available; purchase join remains P0. |
| Fulfillment | No structured kit. | CTA, destination and applicable inventory reference required. |
| Evidence | Metrics existed. | Requested outcome recorded; UI may show actual events only. |
| Return | Tracking exists. | Repeat/improve/close recommendation remains P1. |

**Status:** organic PromoPush can launch when complete. Paid PromoPush remains draft until a canonical proposal and sufficient secured Gems exist. The checkout/reservation adapter is still P0.

## Canonical economic contract

Internal value is Gems: 1 Gem = US$1 platform value. External money purchases Gems; it does not become a second user-to-user ledger.

Required configurable allocation inputs are `gross_gems`, `tax_gems`, `platform_fee_gems`, `distributor_commission_gems`, `service_provider_gems`, `agency_fee_gems`, `merchant_or_host_proceeds_gems`, `refund_gems`, and separately reconciled external processor fees. The invariant is:

`gross = tax + platform fee + distributor commission + service provider + agency fee + merchant/host proceeds`

State meanings:

- planned: configuration only;
- secured: Gems atomically reserved;
- pending: action observed, release condition unverified;
- earned: required proof/transaction verified;
- released: reserved Gems posted to recipient wallet;
- withdrawn/settled: approved external withdrawal completed;
- refunded/reversed: original reserve/earning/allocation reversed idempotently.

Authorities are activation Gem reservations/reserves, economy transactions/wallets, payout allocations, referral commissions and merchant settlement ledger. Budget, reward copy, payment intent, click, RSVP, proof submission and operator report are not money truth.

## Implemented in this slice

1. Extended existing PromoPush campaigns with outcome, mode/package, reward, fulfillment/distribution/evidence/pricing, activation proposal, funding state and launch time.
2. Added database launch checks for permission, configuration, CTA, destination, inventory reference, window and canonical Gem funding.
3. Replaced API direct activation with the launch RPC.
4. Prevented draft/inactive link acceptance and resolution.
5. Added server normalization/validation and unit tests.
6. Reframed the buyer UI around “What do you want to make happen?”
7. Paid modes save as drafts; complete organic mode may launch.
8. New distributor reward writes use Gems and remain pending; settlement is not fabricated.

## Ordered implementation plan

### P0 — blocks execution

- Completed: truthful PromoPush configuration and launch/funding guard.
- Build server-side Moment access/order adapter: reserve capacity, verify Gems/payment and persist PromoPush/PromoShare attribution.
- Add configurable, idempotent sale/refund allocation posting for platform, distributor, host/merchant, provider, Agency and tax.
- Release verified PromoPush earnings through payout allocations/canonical economy.
- Implement “fund this PromoPush” by linking an activation proposal and calling the existing Gem reservation function.
- Add DB integration tests for concurrent capacity, duplicate commission, refund and double reservation.

### P1 — reliable operation

- Real Offer/access-tier/Stock picker instead of manual reference.
- Complete fulfillment assets/contact/rules with permissioned storage.
- Evidence join from channel through order, attendance/redemption and ledger.
- Lifecycle notifications; Agency client scope; return recommendations; real-record golden QA.

### P2 — scale/conversion

- One reusable acceptance contract for PromoPush channels and PromoShare.
- Shared curated Drop placement inventory extending Discovery/featured placement.
- Package administration, Scene targeting, consented retargeting and staffing UX.

### P3 — future

- Governed enterprise integrations/exports/multi-market controls.
- Incrementality, attribution windows, fraud scoring and data-backed recommendations.

## Migration and compatibility

- Migration: `202609220001_promopush_commercial_convergence.sql`.
- Columns are additive. Legacy rows remain readable but cannot newly launch through the RPC until configured. Existing active rows are not demoted.
- Historical PromoPush earning currency is preserved. New writes/defaults are Gems; no payout is auto-issued.
- Existing `/go/:code`, `/promopush`, creator and admin routes remain.
- Rollback must disable new code before dropping columns and preserve fulfillment/funding references.

## Tests and release evidence

Added unit cases for complete organic configuration, inventory-required rewards and paid-mode classification. Before release: apply migration to a representative schema; test launch authorization/incomplete/expired/underfunded cases; test inactive link APIs; run web checks/build and database concurrency tests; complete a cross-role walkthrough with test-only data.

## Known limitations / non-claims

- Paid PromoPush checkout and automatic multi-party ticket settlement are not complete.
- PromoShare T-026, collaborator T-010, creator-rights T-019 and bounty T-057 remain open.
- Manual inventory reference is interim.
- PromoPush events are not automatically sales, attendance or fulfillment.
- No Serendipity/Marika/Patrice/brand inventory, results or earnings were fabricated.
- No Vercel deployment was performed.

## Definition-of-done scorecard

| Question | Status / blocker |
|---|---|
| Marika creates Moment | YES. |
| Serendipity contributes inventory | YES/PARTIAL; canonical supply exists, picker P1. |
| Event allocates tickets/promotional inventory | PARTIAL; paid adapter P0. |
| Patrice discovers/accepts distribution | YES for active PromoPush; configurable sale terms P0. |
| Attributable distribution | YES for events; purchase persistence P0. |
| Participant buys/claims | PARTIAL; rails exist, Moment adapter P0. |
| Attribution survives transaction | NO; server order adapter P0. |
| Participant shares onward | YES/PARTIAL; chain QA required. |
| Brand contributes/pays | PARTIAL; contribution/reserve exist, PromoPush funding adapter P0. |
| PromoPush configured commercially | YES. |
| Fulfillment requirements supplied | YES baseline; deeper kit P1. |
| Funded activity reconciles | YES at reserve boundary; sale allocations P0. |
| RSVP differs from attendance | YES. |
| Redemption verified | YES. |
| Commissions automatic | PARTIAL; direct referral yes, opportunity split P0. |
| Truthful stakeholder results | PARTIAL; packs exist, end-to-end join P1. |
| Agency is not financial authority | YES by contract. |
| Platform/FlashCreate revenue distinct | YES in contract; allocation posting P0. |
| Evidence/Result Pack | YES/PARTIAL; join remains. |
| Meaningful next move | PARTIAL; campaign rules P1. |
