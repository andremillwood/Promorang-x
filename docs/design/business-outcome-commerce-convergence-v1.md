# Business Outcome + Commerce Convergence v1

Status: active implementation contract for `andre/business-outcome-programme-v1`

## Decision

Commerce is not a separate product universe and a Programme is not synonymous with a Campaign.

The commercial chain is:

```
BUSINESS OUTCOME
→ PROGRAMME
→ EXECUTION RAIL(S)
→ REAL SUPPLY / ACCESS / EXPERIENCE
→ DISTRIBUTION
→ PARTICIPANT ACTION
→ TRANSACTION / VALIDATION / ATTENDANCE AS APPLICABLE
→ FULFILLMENT
→ EVIDENCE
→ PROMOCARD
→ RETURN
```

Execution rails may include Commerce, Offer, Moment, Demand Test, Distribution, or a mixed route.

## Commerce authority

For commerce, the Merchant responsibility is authoritative even when the same organization also acts as Brand, Host, Creator, Agency or Community operator.

Merchant responsibility owns:
- product/service commercial record;
- price;
- inventory / capacity;
- availability;
- offer terms where merchant-funded;
- payment methods it accepts;
- confirmation of merchant-collected payment;
- pickup / delivery / service fulfillment;
- cancellation / refund operations within the supported commerce system;
- customer commerce cases and resolution;
- stock and fulfillment truth.

PROMORANG may route, attribute, verify and report. It must not manufacture any of the above.

A Brand can be the seller only when the organization is explicitly taking Merchant responsibility for the transaction and fulfillment.

## Stakeholder roles around commerce

### Participant
Discover → save/want → claim/reserve/buy → receive/use → keep receipt/access on PromoCard → review/refer/return.

### Merchant
Own the commercial availability and fulfillment. Merchant is the seller/operator boundary by default.

### Brand
Commission the outcome, supply product/creative/funding, choose approved claims, select participating sellers and judge evidence. Brand does not automatically become seller.

### Creator
Distribute attributable paths and create approved work. A view, click or share is not a sale. Creator earning requires the governing attribution and settlement record.

### Host
Create the Moment/context in which commerce can happen. A Host does not become seller merely because a product or offer appears in the Moment.

### Community / Scene
Create relevance, trusted context and distribution. Community interest does not imply inventory, endorsement, purchase or fulfillment.

### Agency
Coordinate client context, merchant/seller relationships, creator/host execution and evidence. Client ownership and merchant responsibility remain explicit.

### PROMORANG
Coordinate market signal, programme, distribution, transaction state, proof, attribution and return without blurring ownership.

## State law

- saw ≠ wanted
- wanted ≠ available
- available ≠ reserved
- reserved ≠ paid
- paid ≠ fulfilled
- fulfilled ≠ satisfied
- referral ≠ attributed purchase
- attributed purchase ≠ creator paid
- offer claim ≠ purchase
- validation ≠ purchase unless the authoritative purchase record exists
- Brand-funded incentive ≠ Merchant payment
- Host attendance ≠ commerce purchase

## Outcome routing

The Outcome Navigator must ask what needs to become real, not assume Campaign.

Execution rail examples:

- Recorded purchases → Commerce
- Product/service trial → Commerce + activation (Mixed)
- Validated visits → Offer / Place response
- Attendance → Moment
- Demand learning → Demand Test
- Referrals/reviews → Distribution
- Complex launch → Mixed

## Commerce staging

A commerce-oriented programme should carry:
- subject type: product, service, offer, ticket, booking, experience or other;
- subject label / SKU / commercial priority where known;
- seller responsibility:
  - existing PROMORANG merchant;
  - merchant not yet on PROMORANG;
  - current organization accepts Merchant responsibility;
  - undecided;
- programme outcome and success action;
- target, timeframe, geography, audience and participant reason to act.

This staging brief is planning context until real commerce/product/offer records exist.

## Product handoff

Merchant-owned supply should route to the existing authoritative product/offer/inventory surfaces.

Do not create a second product database or checkout.

Existing authority includes:
- public commerce directory;
- merchant product catalogue;
- merchant storefront;
- CommerceDetail;
- OfferDetail;
- Merchant Commerce Console;
- payment order / Stripe / Gem commerce routes;
- receipts;
- scanner/validation;
- fulfillment, refund/cancel and commerce-case operations.

## PromoCard relationship

PromoCard should carry participant relationship state around commerce:

```
WANTED / SAVED
→ OPEN
→ ACTIVE (reserved / claimed / purchased awaiting follow-through)
→ KEPT (fulfilled / used / retained history)
→ RETURN
```

The card must not fabricate these states. It should link to the authoritative commerce/offer/receipt record.

## UX rule

A Programme recommendation should show:
1. the outcome;
2. the recommended Programme;
3. the execution rail;
4. who owns which responsibility;
5. the next authoritative action.

The user should not need to infer whether they should create a campaign, product, offer or Moment.
