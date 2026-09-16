# Merchant Experience Implementation Checklist v1

This checklist translates the merchant overhaul into code work while preserving the existing offer/commerce engine.

## Phase 1 — Merchant shell

- [ ] Identify role-based merchant landing route
- [ ] Create a single merchant home route
- [ ] Replace merchant primary navigation with Home / Promotions / Customers / Sales & Results / Business
- [ ] Keep legacy merchant surfaces reachable only as advanced/admin fallback during migration
- [ ] Ensure merchant login redirects to merchant home

## Phase 2 — Merchant home

- [ ] Business header
- [ ] Outcome chooser
- [ ] Results strip
- [ ] Recommended next move
- [ ] Live promotions summary
- [ ] Recent customer activity
- [ ] Public storefront link
- [ ] Empty states that drive setup or first promotion

## Phase 3 — Outcome-first promotion builder

- [ ] Goal step
- [ ] Timing step
- [ ] Customer value step
- [ ] Capacity step
- [ ] Plain-language review step
- [ ] Existing `useCreateOffer` integration
- [ ] Map merchant outcome to channel/trigger/verification/fulfillment defaults
- [ ] Advanced settings disclosure
- [ ] Preserve liability/funding validation
- [ ] Customer-facing preview before publish

## Phase 4 — Promotions

- [ ] Active
- [ ] Scheduled
- [ ] Draft
- [ ] Completed
- [ ] Per-promotion results
- [ ] Duplicate
- [ ] Pause/resume
- [ ] Share/distribution tools
- [ ] Staff redemption instructions

## Phase 5 — Customers

- [ ] New customers
- [ ] Returning customers
- [ ] Repeat rate
- [ ] Customer activity timeline
- [ ] Segments where supported
- [ ] Re-engagement action into Promotion Builder

## Phase 6 — Sales & Results

- [ ] Attributed sales
- [ ] Redemptions
- [ ] Conversion
- [ ] Promotion ROI
- [ ] Value issued
- [ ] Historical trend
- [ ] Move useful ROI components from MerchantCouponHub here

## Phase 7 — Business

- [ ] Business profile
- [ ] Public storefront
- [ ] Locations
- [ ] Products/services
- [ ] Staff scanner/access
- [ ] Merchant settings

## Phase 8 — Migration

- [ ] MerchantActionStudio no longer appears in merchant primary navigation
- [ ] MerchantCouponHub no longer appears as a merchant primary concept
- [ ] Merchant-facing OfferStudio entry opens the outcome-first builder
- [ ] Advanced/admin route still exposes low-level offer controls
- [ ] Existing URLs redirect where safe
- [ ] Old functionality has explicit parity mapping before removal

## Acceptance rule

A first-time merchant must be able to:

1. Sign in
2. Understand what Promorang can do for the business
3. Choose a business goal
4. Configure a promotion
5. Preview it
6. Publish it
7. Understand how customers redeem it
8. See results

without learning Promorang's internal object model.
