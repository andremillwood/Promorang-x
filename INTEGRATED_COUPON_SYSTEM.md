# Integrated Coupon System - Advertiser & Marketplace

**Unified coupon system** connecting advertiser campaigns, drops, and marketplace purchases.

## System Overview

The Promorang platform now has a **single unified coupon table** that serves three purposes:

1. **Merchant Coupons** - Store owners create discounts for their products
2. **Advertiser Coupons** - Campaign managers create promotional codes
3. **Platform Coupons** - Admin-created platform-wide discounts

All coupons can be redeemed in the marketplace checkout flow, with automatic tracking across both systems.

## How Integration Works

### Automatic Sync
When an advertiser creates a coupon in their dashboard:
1. Coupon is inserted into `advertiser_coupons` table
2. **Trigger automatically creates** matching entry in `coupons` table
3. Both tables are linked via `marketplace_coupon_id`
4. Updates to advertiser coupon sync to marketplace coupon
5. Redemptions are tracked in both systems

### Cross-System Flow

```
Advertiser Creates Coupon
         ↓
advertiser_coupons table (source)
         ↓
[TRIGGER: create_marketplace_coupon_from_advertiser]
         ↓
coupons table (marketplace)
         ↓
User applies at checkout
         ↓
coupon_usage table
         ↓
[TRIGGER: track_cross_redemption]
         ↓
advertiser_coupon_redemptions table
```

## Database Schema

### New Columns in `coupons`

```sql
campaign_id UUID          -- Link to advertiser_campaigns
drop_id UUID              -- Link to specific drop
source_type VARCHAR(20)   -- 'merchant', 'advertiser', or 'platform'
```

### New Columns in `advertiser_coupons`

```sql
marketplace_coupon_id UUID  -- Link to unified coupons table
```

### New Columns in `coupon_usage`

```sql
campaign_id UUID    -- Track which campaign drove the purchase
drop_id UUID        -- Track which drop drove the purchase
source VARCHAR(20)  -- 'marketplace', 'campaign', or 'drop'
```

## Coupon Types & Sources

| Source Type | Created By | Used For | Example |
|-------------|-----------|----------|---------|
| **merchant** | Store owners | Product discounts | "20% off all creator merch" |
| **advertiser** | Campaign managers | Campaign incentives | "Complete drop, get $50 off" |
| **platform** | Platform admin | Platform-wide promos | "New user welcome discount" |

## Use Cases

### 1. Campaign Reward Coupons
**Scenario:** Advertiser wants to reward users who complete a campaign

```javascript
// Advertiser creates campaign coupon
POST /api/coupons/campaign/:campaignId
{
  "code": "CAMPAIGN2025",
  "name": "Campaign Completion Reward",
  "description": "Get 25% off for completing our campaign!",
  "discount_type": "percentage",
  "discount_value": 25,
  "max_uses": 100,
  "expires_at": "2025-12-31"
}

// Auto-creates marketplace coupon
// Users can redeem at checkout
```

### 2. Drop Participation Coupons
**Scenario:** Reward creators who complete a specific drop

```javascript
// Create drop-specific coupon
POST /api/coupons/drop/:dropId
{
  "code": "DROPREWARD",
  "name": "Drop Completion Bonus",
  "discount_type": "fixed_usd",
  "discount_value": 50,
  "max_uses_per_user": 1
}

// Only users who completed the drop can use it
```

### 3. Leaderboard Incentives
**Scenario:** Top performers get exclusive discounts

```javascript
// Advertiser creates tiered coupons
POST /api/coupons/campaign/:campaignId
{
  "code": "TOP10",
  "name": "Top 10 Leaderboard Reward",
  "discount_type": "percentage",
  "discount_value": 50,
  "max_uses": 10,
  "metadata": {
    "leaderboard_position_max": 10
  }
}
```

### 4. Cross-Promotion
**Scenario:** Engage with ad campaign, get marketplace discount

```javascript
// User watches advertiser content
// Receives coupon code
// Applies at marketplace checkout
// Advertiser tracks conversion
```

## API Endpoints

### Campaign Coupons

```bash
# Get all coupons for a campaign
GET /api/coupons/campaign/:campaignId

# Create campaign coupon
POST /api/coupons/campaign/:campaignId
{
  "code": "CAMPAIGN50",
  "name": "Campaign Reward",
  "discount_type": "fixed_usd",
  "discount_value": 50,
  "max_uses": 100
}
```

### Drop Coupons

```bash
# Get all coupons for a drop
GET /api/coupons/drop/:dropId

# Create drop coupon
POST /api/coupons/drop/:dropId
{
  "code": "DROPCOMPLETE",
  "name": "Drop Completion Reward",
  "discount_type": "percentage",
  "discount_value": 20
}
```

### Unified Analytics

```bash
# Get analytics across all coupon types
GET /api/coupons/analytics/unified?source_type=advertiser

# Get campaign-specific analytics
GET /api/coupons/analytics/unified?campaign_id=xxx
```

## Validation Rules

### Campaign Coupons
- ✅ Must be linked to active campaign
- ✅ User must have participated in campaign (optional)
- ✅ Standard coupon validation (expiry, usage limits)

### Drop Coupons
- ✅ Must be linked to specific drop
- ✅ User must have completed drop (optional)
- ✅ Standard coupon validation

### Context Validation
```javascript
// Validate with campaign context
POST /api/coupons/validate
{
  "code": "CAMPAIGN50",
  "cart_total": { "usd": 100 },
  "context": {
    "campaign_id": "xxx",
    "source": "campaign"
  }
}
```

## Tracking & Analytics

### Unified View
```sql
-- See all coupons across systems
SELECT * FROM unified_coupons;

-- Campaign coupons only
SELECT * FROM unified_coupons 
WHERE system = 'advertiser' AND campaign_id IS NOT NULL;

-- Analytics by source
SELECT * FROM coupon_analytics 
WHERE source_type = 'advertiser';
```

### Cross-System Metrics

Track how advertiser campaigns drive marketplace sales:

```sql
SELECT 
  ac.name as campaign_name,
  c.code as coupon_code,
  COUNT(cu.id) as redemptions,
  SUM(cu.discount_amount_usd) as total_discount,
  SUM(o.total_usd) as revenue_generated
FROM advertiser_campaigns ac
JOIN coupons c ON c.campaign_id = ac.id
JOIN coupon_usage cu ON cu.coupon_id = c.id
JOIN orders o ON o.id = cu.order_id
GROUP BY ac.id, c.id;
```

## Benefits of Integration

### For Advertisers
- **Direct ROI Tracking** - See exactly how campaigns drive sales
- **Seamless Rewards** - Automatically give marketplace discounts
- **Unified Dashboard** - Manage all coupons in one place
- **Cross-Promotion** - Link campaigns to product sales

### For Merchants
- **Increased Traffic** - Benefit from advertiser campaigns
- **Co-Marketing** - Partner with advertisers on promotions
- **Shared Analytics** - See campaign-driven sales

### For Users
- **Single Checkout** - All coupons work the same way
- **More Rewards** - Earn discounts from multiple sources
- **Clear Value** - See savings from campaigns and purchases

### For Platform
- **Unified System** - One coupon table, less complexity
- **Better Analytics** - Track full user journey
- **Revenue Attribution** - Know what drives sales

## Migration Path

### Existing Advertiser Coupons
1. Run migration `20251121_integrate_advertiser_marketplace_coupons.sql`
2. Trigger auto-creates marketplace coupons for existing advertiser coupons
3. Both systems stay in sync going forward

### Backward Compatibility
- Old `advertiser_coupons` table still works
- Redemptions tracked in both places
- No breaking changes to existing code

## Example Workflows

### Workflow 1: Campaign → Purchase

1. User completes advertiser campaign
2. Receives coupon code "CAMPAIGN50"
3. Browses marketplace
4. Adds products to cart
5. Applies "CAMPAIGN50" at checkout
6. Gets $50 off
7. **Both systems track the redemption**
8. Advertiser sees conversion in dashboard

### Workflow 2: Drop → Reward

1. Creator completes drop
2. Automatically receives "DROPREWARD" coupon
3. Can use on any marketplace purchase
4. Drop completion + purchase tracked together

### Workflow 3: Leaderboard → Exclusive Discount

1. User ranks in top 10 on leaderboard
2. Unlocks "TOP10" coupon (50% off)
3. Limited to 10 uses total
4. Creates urgency and exclusivity

## Testing

### Test Campaign Coupon

```bash
# 1. Create campaign
POST /api/advertisers/campaigns
{
  "name": "Test Campaign",
  "total_budget": 1000
}

# 2. Create campaign coupon
POST /api/coupons/campaign/CAMPAIGN_ID
{
  "code": "TEST50",
  "name": "Test Reward",
  "discount_type": "fixed_usd",
  "discount_value": 50
}

# 3. Validate coupon
POST /api/coupons/validate
{
  "code": "TEST50",
  "cart_total": { "usd": 100 }
}

# 4. Use in order
POST /api/marketplace/orders
{
  "store_id": "xxx",
  "coupon_code": "TEST50",
  "payment_method": "usd"
}

# 5. Check both systems
GET /api/coupons/campaign/CAMPAIGN_ID
GET /api/advertisers/coupons
```

## Future Enhancements

- [ ] **Auto-reward** - Automatically apply coupons on campaign completion
- [ ] **Tiered rewards** - Different discounts based on performance
- [ ] **Conditional coupons** - Unlock based on user actions
- [ ] **Bundle coupons** - Combine campaign + merchant discounts
- [ ] **Referral coupons** - Generate unique codes per user
- [ ] **Time-limited** - Flash sales triggered by campaign milestones
- [ ] **Geo-targeted** - Location-based campaign coupons
- [ ] **A/B testing** - Test different coupon strategies

## Monitoring

### Key Metrics

```sql
-- Campaign coupon performance
SELECT 
  source_type,
  COUNT(*) as total_coupons,
  SUM(current_uses) as total_redemptions,
  AVG(discount_value) as avg_discount
FROM coupons
GROUP BY source_type;

-- Cross-system redemption rate
SELECT 
  COUNT(DISTINCT cu.user_id) as unique_users,
  COUNT(cu.id) as total_redemptions,
  SUM(cu.discount_amount_usd) as total_savings
FROM coupon_usage cu
JOIN coupons c ON cu.coupon_id = c.id
WHERE c.source_type = 'advertiser';
```

---

## Summary

The integrated coupon system creates a **seamless connection** between:
- Advertiser campaigns & drops
- Marketplace product sales
- User rewards & incentives

**One coupon table. Multiple sources. Unified tracking.**

Advertisers can now directly drive marketplace revenue while rewarding their campaign participants with real, usable discounts.

**Status:** ✅ Ready to deploy
**Migration:** `20251121_integrate_advertiser_marketplace_coupons.sql`
**Documentation:** This file + `COUPON_SYSTEM.md`
