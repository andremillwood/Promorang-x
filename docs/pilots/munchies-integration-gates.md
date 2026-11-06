# Munchies pilot integration gates — November 2026

## Findings from current main
- The existing PromoCard merchant checkout RPC `reserve_promocard_cart` **only supports USD** and checks merchant product currency for USD. Munchies' intended menu is in **JMD**. Do not route JMD Munchies orders through USD checkout or fake currency conversion.
- Existing merchant checkout can retain a verified referral code and referrer ID in commerce order metadata. It also exposes attributed paid/refunded orders in the referral dashboard, but **does not create payable affiliate commission**.
- Existing `communityPartnerCommission` returns a quote only. This branch adds `communityPartnerEligibility`, a pure read-only gate requiring trusted attribution, approved partner, paid and fulfilled order, JMD currency and zero refunds.

## Before first real order
1. Choose a verified JMD order capture/collection and fulfillment source for Munchies (existing platform JMD path only if demonstrated; otherwise operator-recorded order IDs with payment/fulfillment evidence).
2. Verify partner identity, explicit participation terms, merchant identity and single attribution per order. A signup or WhatsApp share is not evidence of a sale.
3. Capture a consent-aware partner identifier at order creation, server-side; do not accept arbitrary attribution edits after settlement.
4. Implement durable idempotent commission entries keyed by order ID + partner ID + campaign ID, with approved/paid/reversed states and a refund reconciliation process. Never use a quote as a balance.
5. Obtain real ingredient, packaging, transaction and fulfillment costs to calculate verified contribution margin.
6. Run tests, sandbox payment/fulfillment/reversal, and review security before any public pilot.

## Excluded from this branch
No new customer checkout, no fake JMD Stripe support, no new public dashboard, no automatic payout, no database migration, no deployment. These are blockers, not features to simulate.
