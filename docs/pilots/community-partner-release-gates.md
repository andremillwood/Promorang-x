# Community Partner release gate — PR #165

Do not merge, migrate, or deploy until every gate below has an observed result.

## Schema and security
- [ ] Apply migrations 202611060002, 003 and 004 to a disposable PostgreSQL/Supabase database using existing core commerce/referral migrations.
- [ ] Confirm schema privileges and RLS: anon/authenticated cannot read or write partner tables or execute record_verified_partner_order.
- [ ] Confirm service_role can execute the function; confirm no function privileges leak via PUBLIC.
- [ ] Verify trigger execution on commerce_orders under ordinary merchant and platform update paths.

## Real order integration
- [ ] Merchant-direct order: attribution attached at creation, merchant confirms receipt, order delivered, verified margin supplied by trusted operator, outcome/commission recorded.
- [ ] Online order: processor-backed payment confirmation, delivered order, identical attribution and reward logic.
- [ ] Verify native currency; do not use a converted display quote as a payment amount.
- [ ] Confirm merchant payment confirmation is not spoofable and online payment ID corresponds to authoritative payment state.

## Financial and concurrency
- [ ] Same order twice: exactly one outcome and commission.
- [ ] Same order with different partner/campaign/margin: reject replay; no duplicate or silently changed award.
- [ ] Two concurrent requests: exactly one outcome and commission.
- [ ] Unpaid, unfulfilled, partially refunded, disputed, cancelled, self-referral, revoked code, expired code, unknown partner: reject.
- [ ] Refund after commission creation: unpaid commission reversed; already paid requires explicit manual recovery and reconciliation.
- [ ] Approvals and payouts require independent authorization, audit trail and funding checks before being enabled.

## Product
- [ ] JMD online payment provider support confirmed for merchant account.
- [ ] Live FX provider, rate freshness, display preference and approximate pricing implemented separately from settlement.
- [ ] Munchies pilot campaign and one partner verified with real records.
- [ ] Event, lead, vehicle, subscription and shipment adapters stay disabled until independently verified.

## Current known blockers
No verified CI runs. No disposable database migration tests. No real checkout-to-outcome integration. No payout approval workflow. The code is development-only.
