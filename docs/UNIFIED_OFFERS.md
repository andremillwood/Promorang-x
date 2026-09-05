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

Every channel creates an `offer_issuances` record. The participant then claims the issuance and receives one redemption code.

## Fulfillment journeys

| Type | What the participant does | What completes it |
| --- | --- | --- |
| `code` | Shows the redemption code | Merchant or staff submits the code |
| `qr` | Shows a scannable pass (`promorang://offer/redeem/PR-…`) | Issuing business scans or types the code |
| `merchant_validation` | Shows the code at the counter | Issuing business validates the code |
| `automatic` | Claims the issuance | Value is marked redeemed immediately; Gems credit when the reward type is `gems` |
| `manual` | Claims and waits | Business confirms the handoff from the pending queue |
| `shipping` | Leaves a delivery address | Business marks shipped (carrier + tracking), then delivered |

Surfaces:

- Participant wallet: `/offers` → My offers
- Merchant scan + pending queue: `/offers` → Validate redemption, `/staff/scanner`
- Mobile merchant camera: `apps/mobile/app/merchant/scan.tsx`

## Main surfaces

- Business and participant UI: `/dashboard/offers` or `/offers`
- API: `/api/offers`
- Migration: `supabase/migrations/202606150001_unified_offers.sql`
- Atomic claim/redeem: `supabase/migrations/202609050001_atomic_offer_claim_redemption.sql`
- QR owner gate: `supabase/migrations/202609050003_offer_qr_owner_redemption.sql`

## Compatibility

`offers.coupon_id` and `offers.merchant_product_id` allow the existing coupon checkout and merchant product systems to remain the final fulfillment adapters. Moment IDs, content IDs, campaign IDs, and PromoShare cycle IDs are stored as distribution sources rather than duplicated entities.

## Deployment

1. Apply the Supabase migrations.
2. Deploy the backend so `/api/offers` and activity integrations are live.
3. Deploy the web app.
4. Create one test offer for each fulfillment journey and verify issuance, claim, and completion.

## Production hardening

- Move inventory reservation into a database RPC or transaction before high-volume campaigns.
- Connect a shipping provider for label purchase and tracking webhooks.
- Add scheduled expiry processing to release reserved inventory.
- Add moderation/approval for publicly discoverable offers.
- Add role/organization permission checks beyond owner identity for larger teams.
- Add notification delivery for issued, expiring, shipped, and redeemed offers.
