# Unified Offers

Unified Offers gives brands, merchants, venues, hosts, creators, and the platform one reward definition that can be distributed through multiple Promorang systems.

## Supported value

- Coupons and vouchers
- Products and physical giveaways
- Experiences and access
- Cash, Gems, Points, and Keys
- Manual or custom rewards

## Distribution channels

- `direct`: participant claims while inventory remains
- `moment`: join, check-in, or verified proof
- `content`: view, click, like, comment, or share
- `promoshare`: qualified winner selection
- `campaign`, `referral`, and `manual`: schema/API-ready extension channels

Every channel creates an `offer_issuances` record. The participant then claims the issuance and receives one redemption code. Merchant validation moves it to `redeemed` and records the actor, time, venue, and audit event.

## Main surfaces

- Business and participant UI: `/dashboard/offers` or `/offers`
- API: `/api/offers`
- Migration: `supabase/migrations/202606150001_unified_offers.sql`

## Compatibility

`offers.coupon_id` and `offers.merchant_product_id` allow the existing coupon checkout and merchant product systems to remain the final fulfillment adapters. Moment IDs, content IDs, campaign IDs, and PromoShare cycle IDs are stored as distribution sources rather than duplicated entities.

## Deployment

1. Apply the Supabase migration.
2. Deploy the backend so `/api/offers` and activity integrations are live.
3. Deploy the web app.
4. Create one test offer for each channel and verify issuance, claim, and redemption.

## Production hardening

- Move inventory reservation into a database RPC or transaction before high-volume campaigns.
- Add shipping address collection and fulfillment-provider integration for physical products.
- Add scheduled expiry processing to release reserved inventory.
- Add moderation/approval for publicly discoverable offers.
- Add role/organization permission checks beyond owner identity for larger teams.
- Add notification delivery for issued, expiring, and redeemed offers.
