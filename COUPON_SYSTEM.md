# Promorang Coupon & Discount System

Comprehensive coupon management system for the Promorang marketplace with multi-currency support, usage tracking, and merchant analytics.

## Features

### ✅ Discount Types
- **Percentage** - Discount by percentage (e.g., 10% off)
- **Fixed USD** - Fixed dollar amount off (e.g., $50 off)
- **Fixed Gems** - Fixed gems discount (e.g., 100 gems off)
- **Fixed Gold** - Fixed gold discount (e.g., 50 gold off)
- **Free Shipping** - Waive shipping costs

### ✅ Applicability Rules
- **All Products** - Apply to entire cart
- **Specific Products** - Target specific product IDs
- **Specific Categories** - Target product categories
- **Minimum Purchase** - Require minimum cart value (USD/gems)

### ✅ Usage Controls
- **Max Uses** - Total redemption limit across all users
- **Max Uses Per User** - Per-user redemption limit
- **Start/Expiry Dates** - Time-bound promotions
- **Active/Inactive** - Toggle coupon availability
- **Max Discount Cap** - Cap percentage discounts at a max amount

### ✅ Store Integration
- **Store-Specific** - Coupons can be tied to specific merchant stores
- **Platform-Wide** - Or available across all stores
- **Merchant Management** - Store owners can create and manage their own coupons

### ✅ Tracking & Analytics
- **Usage History** - Track every coupon redemption
- **Discount Amounts** - Record savings per order
- **User Analytics** - See who's using coupons
- **Time-Series Data** - Usage trends over time
- **Revenue Impact** - Calculate total discounts given

## Database Schema

### `coupons` Table
```sql
- id (UUID, PK)
- code (VARCHAR, UNIQUE) - The coupon code users enter
- name (VARCHAR) - Display name
- description (TEXT) - User-facing description
- store_id (UUID, FK) - NULL for platform-wide coupons
- created_by (UUID, FK) - User who created it
- discount_type (ENUM) - percentage, fixed_usd, fixed_gems, fixed_gold, free_shipping
- discount_value (DECIMAL) - Amount or percentage
- max_discount_usd (DECIMAL) - Cap for percentage discounts
- applies_to (ENUM) - all, specific_products, specific_categories, minimum_purchase
- product_ids (UUID[]) - Array of product IDs
- category_ids (UUID[]) - Array of category IDs
- min_purchase_usd (DECIMAL) - Minimum cart value in USD
- min_purchase_gems (INTEGER) - Minimum cart value in gems
- max_uses (INTEGER) - NULL = unlimited
- max_uses_per_user (INTEGER) - Default 1
- current_uses (INTEGER) - Incremented on each use
- starts_at (TIMESTAMP) - When coupon becomes valid
- expires_at (TIMESTAMP) - When coupon expires
- is_active (BOOLEAN) - Toggle availability
- metadata (JSONB) - Flexible additional data
- created_at, updated_at (TIMESTAMP)
```

### `coupon_usage` Table
```sql
- id (UUID, PK)
- coupon_id (UUID, FK)
- user_id (UUID, FK)
- order_id (UUID, FK)
- discount_amount_usd (DECIMAL)
- discount_amount_gems (INTEGER)
- discount_amount_gold (INTEGER)
- original_total_usd (DECIMAL)
- final_total_usd (DECIMAL)
- used_at (TIMESTAMP)
```

### `orders` Table (Extended)
```sql
Added columns:
- coupon_code (VARCHAR) - Code that was applied
- discount_amount_usd (DECIMAL)
- discount_amount_gems (INTEGER)
- discount_amount_gold (INTEGER)
```

## API Endpoints

### Coupon Validation & Application

#### `POST /api/coupons/validate`
Validate a coupon code and preview discount.

**Request:**
```json
{
  "code": "WELCOME10",
  "cart_total": {
    "usd": 100.00,
    "gems": 500,
    "gold": 50
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "coupon": { /* coupon object */ },
    "discount": {
      "usd": 10.00,
      "gems": 0,
      "gold": 0
    }
  }
}
```

### Coupon Management (Merchant/Admin)

#### `POST /api/coupons`
Create a new coupon.

**Request:**
```json
{
  "code": "FLASH25",
  "name": "Flash Sale",
  "description": "Limited time 25% off!",
  "store_id": "uuid-here", // optional, null for platform-wide
  "discount_type": "percentage",
  "discount_value": 25.00,
  "max_discount_usd": 100.00,
  "applies_to": "all",
  "max_uses": 100,
  "max_uses_per_user": 1,
  "expires_at": "2025-12-31T23:59:59Z"
}
```

#### `GET /api/coupons/store/:storeId`
Get all coupons for a store.

#### `GET /api/coupons/:couponId`
Get coupon details with analytics.

#### `PATCH /api/coupons/:couponId`
Update coupon settings.

#### `DELETE /api/coupons/:couponId`
Deactivate a coupon (soft delete).

#### `GET /api/coupons/:couponId/analytics`
Get detailed usage analytics.

### Order Creation (Updated)

#### `POST /api/marketplace/orders`
Now accepts `coupon_code` field:

**Request:**
```json
{
  "store_id": "uuid-here",
  "payment_method": "gems",
  "coupon_code": "WELCOME10", // optional
  "shipping_address": { /* ... */ },
  "customer_notes": "..."
}
```

The order will automatically:
1. Validate the coupon
2. Calculate discount
3. Apply to totals
4. Track usage
5. Increment coupon usage count

## Service Functions

### `couponService.js`

- **`validateCoupon(code, userId, cartTotal)`** - Check if coupon is valid
- **`calculateDiscount(coupon, cartTotal)`** - Compute discount amounts
- **`applyCoupon(code, userId, orderData)`** - Full validation + calculation
- **`trackCouponUsage(couponId, userId, orderId, ...)`** - Record usage
- **`createCoupon(userId, couponData)`** - Create new coupon
- **`getStoreCoupons(storeId, filters)`** - List store coupons
- **`updateCoupon(couponId, userId, updates)`** - Modify coupon
- **`deleteCoupon(couponId, userId)`** - Deactivate coupon
- **`getCouponAnalytics(couponId)`** - Get usage stats

## Demo Coupons

The migration includes 5 demo coupons for testing:

| Code | Type | Value | Description |
|------|------|-------|-------------|
| `WELCOME10` | Percentage | 10% | First purchase discount, 1 use per user |
| `CREATOR50` | Fixed USD | $50 | Creator bundle discount, 100 total uses |
| `GEMS100` | Fixed Gems | 100 gems | Gems discount, 3 uses per user |
| `FREESHIP` | Free Shipping | N/A | Free shipping, unlimited uses |
| `FLASH25` | Percentage | 25% | Flash sale, 50 total uses, expires in 7 days |

## Usage Flow

### Customer Journey

1. **Browse & Add to Cart**
   - User adds products to cart
   - Cart calculates subtotals (USD, gems, gold)

2. **Apply Coupon**
   - User enters coupon code at checkout
   - Frontend calls `POST /api/coupons/validate`
   - Shows discount preview

3. **Complete Order**
   - User proceeds with checkout
   - Frontend sends `POST /api/marketplace/orders` with `coupon_code`
   - Backend:
     - Validates coupon again
     - Calculates discount
     - Creates order with discount applied
     - Tracks coupon usage
     - Increments usage count

4. **Order Confirmation**
   - Order shows original subtotal
   - Shows discount amount
   - Shows final total after discount

### Merchant Journey

1. **Create Coupon**
   - Merchant goes to coupon management UI
   - Fills out coupon form
   - Sets discount type, value, rules
   - Publishes coupon

2. **Monitor Usage**
   - View coupon list with usage stats
   - Click coupon for detailed analytics
   - See redemption timeline
   - Track revenue impact

3. **Manage Coupons**
   - Edit coupon settings
   - Extend expiry dates
   - Adjust usage limits
   - Deactivate underperforming coupons

## Integration Points

### Backend
- ✅ Database migration (`20251120_add_coupons.sql`)
- ✅ Coupon service (`services/couponService.js`)
- ✅ Coupon API (`api/coupons.js`)
- ✅ Marketplace service updated (`services/marketplaceService.js`)
- ✅ Routes mounted (`api/index.js`)

### Frontend (To Be Added)
- ⏳ Coupon input component for cart/checkout
- ⏳ Discount display in cart summary
- ⏳ Merchant coupon management page
- ⏳ Coupon analytics dashboard
- ⏳ Coupon list/browse for customers

## Testing

### Manual Testing Steps

1. **Run Migration**
   ```bash
   # Execute migration in Supabase SQL editor or via CLI
   psql -f backend/migrations/20251120_add_coupons.sql
   ```

2. **Test Validation**
   ```bash
   curl -X POST https://api.promorang.co/api/coupons/validate \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"code":"WELCOME10","cart_total":{"usd":100}}'
   ```

3. **Test Order with Coupon**
   ```bash
   curl -X POST https://api.promorang.co/api/marketplace/orders \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"store_id":"...","payment_method":"gems","coupon_code":"WELCOME10"}'
   ```

4. **Check Analytics**
   ```bash
   curl https://api.promorang.co/api/coupons/COUPON_ID/analytics \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Deployment Checklist

- [x] Database migration created
- [x] Coupon service implemented
- [x] API endpoints created
- [x] Marketplace integration complete
- [x] Routes mounted
- [ ] Run migration on production DB
- [ ] Deploy backend
- [ ] Add frontend UI components
- [ ] Deploy frontend
- [ ] Test end-to-end flow
- [ ] Create merchant documentation

## Future Enhancements

- **Coupon Stacking** - Allow multiple coupons per order
- **Auto-Apply** - Automatically apply best available coupon
- **Referral Coupons** - Generate unique codes for referrals
- **Tiered Discounts** - Progressive discounts based on cart value
- **Product Bundles** - Special pricing for product combinations
- **First-Time Buyer** - Auto-detect and apply first purchase discount
- **Abandoned Cart** - Send coupon codes to recover abandoned carts
- **Loyalty Rewards** - Generate coupons based on purchase history
- **A/B Testing** - Test different coupon strategies
- **Social Sharing** - Unlock coupons by sharing

## Support

For questions or issues:
- Check backend logs for coupon validation errors
- Verify coupon is active and not expired
- Confirm user hasn't exceeded usage limits
- Check cart meets minimum purchase requirements

---

**Status:** ✅ Backend Complete | ⏳ Frontend Pending
**Version:** 1.0.0
**Last Updated:** November 20, 2025
