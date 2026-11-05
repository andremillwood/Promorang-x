# Munchies Community Partner pilot (development only)

Status: experimental. No production deployment, commission liability, or partner entitlement is created by this branch.

## Commercial terms proposed, not yet contracted
- One manually approved partner, one Munchies campaign.
- Commission = **5% of eligible net fulfilled order value**, capped at **25% of verified contribution margin** per order.
- Eligible net value excludes delivery fees, taxes, discounts, refunds, and canceled items.
- Contribution margin must be calculated after food, packaging, payment processing, and variable fulfillment costs, before commission. Unknown margin => no automatic commission quote.
- Example: J$3,500 eligible sale, J$1,000 contribution margin before commission: quote J$175, leaving J$825 margin before other overhead.
- No payout for joins, likes, message volume, self-referrals, canceled or refunded orders.
- Manual finance approval and payout reconciliation remain mandatory. Do not treat a quote as money owed.

## Minimal pilot sequence
1. Approve one community partner and agree to written terms.
2. Publish one Munchies offer using existing merchant flows.
3. Issue a unique campaign+partner referral identifier; record the identifier server-side with customer consent at order creation.
4. Validate paid and fulfilled order, unique attribution, and return/refund window.
5. Calculate commission quote using the pure service in this branch.
6. Operator records approval and payout externally during pilot; reconcile each record to order ID and payment evidence.
7. Produce a partner report with attributed fulfilled orders, eligible sales, quotes, reversals, and payments.

## Existing system boundaries
- Reuse Scenes and community access; do not add new public group creation.
- Reuse merchant order and offer verification, not social engagement as proof of a sale.
- PromoPoints and Gems are not cash commission and must never be represented as such.
- Never put personal WhatsApp contact details in public referral links.
- Attribution must be server validated and immutable after settlement, with duplicate/refund safeguards.

## Release gates
- Confirm Munchies actual menu, variable costs, delivery costs, payment terms, and legal agreement.
- Audit checkout/order state transitions and design idempotent server-side attribution and commission ledger migration.
- Implement and test end-to-end customer purchase, partner attribution, settlement, refund reversal, and reporting.
- Verify deployed database migrations, access controls, and production reconciliation.
- Review and approve PR before merging or deploying.

## Deliberately excluded
Partner marketplace, multi-level referrals, new reward currencies, automated payouts, WhatsApp replacement, gamified message counts, and general-purpose commission tiers.
