# PROMORANG Commercial Chain Convergence v1

## Purpose

Converge the Participant and operator experiences around one real commercial truth without making their interfaces look or behave the same.

Canonical chain:

`PERK → OFFER → PROMOKEY → VALIDATION → RECEIPT → PURCHASE / FULFILLMENT → RETURN`

This is not one screen and not one database object. It is a chain of distinct product objects and boundaries.

## Production truth already present

The existing Offer system is substantial and should be reused.

### Offer

`apps/web/src/hooks/useOffers.ts`

Real Offer records already include:
- title / description / terms
- reward type
- fulfillment type
- value amount / currency
- total quantity
- reserved quantity
- redeemed quantity
- status
- starts / ends
- distribution channel + qualification rules

### OfferIssuance

Real OfferIssuance records already include:
- issuance id
- status
- redemption code
- issued timestamp
- claimed timestamp
- redeemed timestamp
- expiry
- fulfillment data
- shipping / delivery state where relevant
- associated Offer

Existing hooks already expose:
- public offers
- owner offers
- participant offer wallet
- direct claim
- claim issuance
- redemption
- pending fulfillment
- fulfillment actions

### Merchant validation

`MerchantScannerStation` already performs a real `useRedeemOffer()` mutation.

Its current truth language is correct:

**A successful validation proves the offer was used at this merchant station; it does not create a purchase or revenue record.**

That distinction must survive every redesign.

## Canonical product vocabulary

### Perk
The benefit itself.

Examples:
- complimentary wings
- 20% lunch benefit
- priority test drive
- reserved workshop seat

Participant-facing question:
**What do I actually get?**

### Offer
The commercial instrument around the Perk.

Contains:
- issuer
- place
- validity
- inventory
- eligibility
- one-use / repeat rules
- fulfillment type
- distribution source

Participant may not need to see every Offer rule. Merchant/Brand/Admin often do.

### PromoKey
The carried entitlement to unlock/use a Perk or gated right.

In production convergence, a PromoKey may be represented by the participant's OfferIssuance/redemption credential while the product language remains PromoKey.

Storage vocabulary does not need to become participant vocabulary.

### Validation
Confirmation that the entitlement was successfully used at the validation boundary.

Validation proves:
- a specific issuance/code
- was accepted
- at a specific validating merchant/context
- at a specific time

Validation does **not** by itself prove:
- purchase
- revenue amount
- fulfillment beyond the validated benefit
- repeat behavior

### Receipt
Human-readable durable residue of a confirmed state transition.

A Validation Receipt and Commerce Receipt are related but not interchangeable.

### Purchase
A separate commerce event. It requires its own transaction/commerce record.

### Fulfillment
Proof that the promised benefit/order was actually delivered or completed.

### Return
A downstream consequence that comes back after verified history exists.

Examples:
- repeat benefit
- recommendation
- Scene relevance
- loyalty/repeat history
- next PromoKey
- retained participant trail

Return never rewrites prior truth.

## Participant expression

Review route:

`/participant-next.html#/commercial/aftrhrs-wing-key`

Review states:

`AVAILABLE → HELD → PRESENTED → VALIDATED → FULFILLED → RETURNED`

Participant experience should remain:
- useful first
- benefit-led
- object-based
- low jargon
- media/place aware
- clear about what changed

Participant visual objects:
- Perk = benefit token
- Offer = mostly-background rules instrument
- PromoKey = carried entitlement/fob
- Receipt = paper residue
- Return = consequence object

The Participant should not be asked to operate inventory, reconciliation, fulfillment queues or rule configuration.

## Merchant expression

Merchant sees the same truth through an operational lens:

`OFFER → INVENTORY → VALIDATION DEVICE → VALIDATION SLIP → FULFILLMENT → ORDER / REPEAT HISTORY`

Merchant should emphasize:
- offer status
- inventory / remaining allocation
- validity
- scanner/manual code input
- online/offline write readiness
- duplicate/invalid exception states
- last confirmed validation
- pending fulfillment
- commerce receipt/order only when a separate purchase exists

Existing real components to preserve/recompose:
- `MerchantScannerStation`
- `OfferQrScanner`
- `OfferFulfillmentQueue`
- `useRedeemOffer`
- `usePendingFulfillments`
- `useFulfillOffer`

## Brand expression

Brand cares about:
- funded / configured Offer
- audience / distribution source
- allocation
- claim / validation evidence
- fulfillment status
- downstream commerce only where real transaction data exists
- unresolved evidence before scale decisions

Brand should not see participant QR/presentation UX or merchant scanner mechanics.

## Host expression

Host cares about attached Perks/Offers as part of a Moment:
- what is available
- allocation
- access/benefit relationship
- venue/merchant dependency
- exception visibility

Host should not own merchant purchase truth unless the Host is also the commerce operator.

## Agency expression

Agency manages the chain on behalf of a client while preserving client ownership boundaries:
- setup/configuration
- distribution
- execution status
- proof packaging
- managed result

## Admin expression

Admin sees the authoritative chain:
- Offer source record
- issuance
- credential / redemption event
- validating actor/place
- fulfillment state
- commerce record if it exists
- exceptions / reversals / correction history

## Truth gates

The following are prohibited UX collapses:

`CLAIM = VALIDATION`

`VALIDATION = PURCHASE`

`PURCHASE = FULFILLMENT`

`FULFILLMENT = REPEAT`

Each boundary requires its own evidence.

## Shape grammar

Do not render the chain as six generic cards.

Signature forms:
- Perk — compact token/chip
- Offer — ruled commercial instrument
- PromoKey — entitlement fob/key
- Validation — device/action boundary
- Receipt — narrow retained paper record
- Commerce Receipt — distinct transaction record
- Return — fold-back / consequence object

## Next implementation

1. Review Participant commercial chain.
2. Recompose MerchantScannerStation and Merchant Offer surfaces around the canonical vocabulary while preserving real mutations.
3. Add the same Offer/Issuance identity to Brand evidence views without inventing ROI/purchase data.
4. Connect Moment-attached PromoKey/Perk to the same chain.
5. Only add backend state where an intended UX boundary is genuinely not representable from current records.
