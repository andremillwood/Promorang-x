# PROMORANG Canonical Object → Production Map v1

## Purpose

This audit maps the canonical PROMORANG object system back to what already exists in the product before any production convergence work proceeds.

Classification:
- **REAL** — backed by real production data/mutations and suitable for reuse.
- **PARTIAL** — meaningful real capability exists, but the object is fragmented or incomplete.
- **ILLUSTRATIVE** — primarily review/demo UI or hard-coded presentation.
- **BESPOKE** — real capability exists, but only for a specific experience/activation rather than the canonical object family.
- **ABSENT** — no mature product surface found yet.

The rule remains: **reuse capability; do not preserve weak interface.**

## Product-wide map

| Canonical object | Existing production capability | Current assessment | Next convergence action |
| --- | --- | --- | --- |
| Moment | `moments` API, `useHostedMoments`, `useJoinedMoments`, participant count/check-in, commerce context, proof requirements, sub-Moments, product links, AFTRHRS experience, Host guest ops | **REAL but fragmented / BESPOKE participant face** | Build canonical Participant Moment detail first; then progressively reuse the same object identity in Host/Merchant/Creator/Brand/Agency/Admin |
| Scene | Scene/world language and curated cultural surfaces exist; Scene references already shape AFTRHRS and Participant identity | **PARTIAL** | Establish canonical Scene page + membership/demand/history surface before deeper role convergence |
| Discovery | `DiscoveryDemandInbox`, `useDiscoveryDemand`, demand polls/intents/unlocks, role-aware dashboard embedding | **REAL but fragmented** | Promote one canonical Discovery object and activation handoff rather than role-local demand panels |
| Perk | Benefit/reward concepts exist across PromoCard, offers, moments and presents | **PARTIAL / taxonomy overlap** | Normalize Perk as benefit-only object; remove Offer/PromoKey ambiguity |
| Offer | `OfferStudio`, `useDirectOfferClaim`, `useRedeemOffer`, Merchant scanner/validation | **REAL** | Reuse current writes; converge participant claim/access + merchant commercial instrument around same Offer identity |
| PromoKey | Access requirements and participant PromoKey review object exist; access concepts are already linked to drops/perks | **PARTIAL** | Map actual entitlement storage/source-of-truth; keep canonical PromoKey as access object, not payment/offer |
| Pass / Ticket | AFTRHRS pass/ticket flows, guest RSVP/check-in, participant TicketPass object, Host door operations | **REAL + BESPOKE** | Generalize pass identity/state from AFTRHRS/guest operations into canonical Moment access family |
| Opportunity / Mission | Content Drops, sponsored content↔Moment, mission attribution/economics, creator proof/economic records | **REAL but fragmented** | Promote real Content Drops/mission records into canonical Opportunity object; retire mock mission boards |
| Proof | proof API requirements/submissions/review, host proof close, creator O2O attribution, brand O2O evidence | **REAL** | Build one shared Proof family with role-specific presentation; preserve source-specific verification meaning |
| Receipt | participant PaperReceipt, merchant validation slip, commerce receipts, consequence receipt | **REAL but visually fragmented** | Normalize human-readable Receipt component family while keeping receipt_type/state distinctions |
| Piece | Participant review object + marketplace/provenance concepts; product-universe and PromoCard world docs | **PARTIAL** | Confirm production ownership/transfer/provenance sources before converging operator views |
| PromoShare | participant review surfaces and economy concepts | **PARTIAL** | Audit production draw/ticket/prize source before operator convergence |
| Save & Win | participant review/economy contract exists | **PARTIAL** | Audit live principal/pool/ticket implementation; do not imply implemented custody where absent |
| Gems / Points / Tickets | economy balances and object language exist | **REAL / PARTIAL by species** | Keep species distinct; map each source ledger before any unified Value surface |

## Moment — current capability map

### Production truth already present

- `GET /api/moments/:id` resolves a specific Moment.
- `useHostedMoments()` reads real hosted Moments.
- `useJoinedMoments()` reads participant Moment membership/participation records.
- `useParticipantCount(momentId)` reads real going count.
- `useCheckIn()` writes participant check-in through `/api/participation/moments/:id/checkin` and refreshes joined Moments + Vault.
- Moment commerce context exists under `/commerce/moments/:id/context`.
- Proof requirements exist under `/proof/moments/:id/requirements`.
- Moment economy includes sub-Moment capability.
- Moment products can be linked through dedicated Moment product APIs.
- Host Guest Operations already performs real door/check-in work against Moment context.
- AFTRHRS already proves that a rich participant-facing Moment can exist, but it is bespoke rather than a generic canonical Moment detail.

### Critical gap

The main current web router has specific AFTRHRS Moment routes, but the mature generic Participant Next experience does not yet expose a canonical deep Moment route. Participant Next currently has deep review routes for Poll, Piece, Marketplace, PromoKey, PromoShare and Save & Win, but not Moment.

That makes the first convergence target:

`Participant Next → /moment/:slug`

### Participant Moment contract

Participant should experience the Moment as a world-facing object, not as an operator dashboard.

Core participant journey:

`DISCOVER → ACCESS / RSVP → READY → ARRIVE → PARTICIPATE → PROOF → KEPT`

The page must answer:
1. What is happening?
2. Why might I care?
3. Where and when?
4. What do I need to get in?
5. What Perk/PromoKey/Pass is attached?
6. What changes after I actually arrive?
7. What proof/history stays with me afterward?

It should not expose Host/admin operational density.

## Moment role lenses

### Participant
Media-rich, place-aware, simple, emotional. One primary action. Shows access, Scene, Perks, people/context, readiness and retained proof.

### Host
Run Sheet, guest/pass inventory, Door Board, Arrival Ledger, exceptions, Proof Close, return audience.

### Merchant / Venue
Attached Offers/Perks, validation activity, orders/fulfillment, place outcome and repeat history.

### Creator
Opportunity/Brief, content asset, distribution link, attribution, proof and retained portfolio value.

### Brand
Activation Dossier, stakeholder network, source-distinct evidence, unresolved gaps and Stop/Change/Scale decision.

### Agency
Client-owned Moment context, operating responsibility, proof packaging and Managed Result Pack.

### Admin
Source record, attendance/access/proof exceptions, correction chain and audit history.

## Convergence sequence

### 1. Moment family
- Participant canonical Moment review page
- existing Host Door/Proof surfaces linked conceptually to same Moment identity
- role-specific object contract documented
- no new Moment backend until a missing state is proven

### 2. Commercial chain
`Perk → Offer → PromoKey → Validation → Receipt → Purchase/Fulfillment → Return`

Existing Offer/validation writes should be preserved.

### 3. Evidence family
`Observed → Attributed → Verified → Consequence → Auditable`

Participant Receipt, Host Proof Close, Merchant Validation Slip, Creator Proof Dossier, Brand Evidence Pack, Agency Managed Result Pack and Admin Case Evidence should share semantic truth without sharing visual sameness.

### 4. Market construction
`Discovery + Scene → threshold → Moment / Offer / Opportunity`

### 5. Retained value/history
`Piece + Vault + PromoShare + Save & Win + Gems/Points/Tickets`

## Visual divergence rule

Canonical objects define **identity and truth**, not one UI template.

Participant remains:
- emotional
- cultural
- media-rich
- simple
- collectible
- spatial

Operator roles remain distinct:
- Creator — studio / field kit
- Host — backstage / live operations
- Merchant — counter / commercial instruments
- Brand — activation fieldbook
- Agency — client folio
- Admin — forensic archive

No production convergence is approved if canonical reuse causes those experiences to collapse into the same interface grammar.
