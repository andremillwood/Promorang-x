# Demo Data Seeding Scripts

This directory contains scripts to populate the database with demo data for testing the Promorang platform.

## Available Scripts

### 1. Seed Demo Products (`seed-demo-products.js`)

Seeds the database with a complete e-commerce experience including:
- **Merchant Store**: "Promorang Official Store"
- **16 Demo Products** across 4 categories:
  - **Digital Products** (4 items): Templates, guides, brand kits, analytics access
  - **Services** (3 items): Strategy sessions, brand audits, video editing
  - **Creator Merch** (6 items): T-shirts, hoodies, caps, stickers, laptop sleeves
  - **Featured Picks** (3 items): Bundles and exclusive items
- **Product Reviews**: Realistic reviews from demo users
- **Shopping Cart Items**: Pre-populated cart for creator_demo user

## Usage

### Prerequisites

1. Ensure you have the demo users created:
   ```bash
   npm run create-demo-users
   ```

2. Make sure your `.env` file has the correct Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   ```

### Running the Product Seeder

From the `backend` directory:

```bash
npm run seed-products
```

This will:
1. Create or update the "Promorang Official Store" for the merchant_demo user
2. Insert 16 demo products with images, pricing, and inventory
3. Add product reviews from other demo users
4. Populate the creator_demo user's shopping cart with sample items

## Product Details

### Digital Products ($29.99 - $99.99)
- Creator Starter Pack - $29.99 / 150 gems
- Premium Content Templates - $49.99 / 250 gems
- Brand Kit Bundle - $79.99 / 400 gems
- Analytics Dashboard Access - $99.99 / 500 gems

### Services ($149.99 - $499.99)
- Content Strategy Session - $149.99 / 750 gems
- Brand Audit & Review - $299.99 / 1500 gems
- Video Editing Package - $499.99 / 2500 gems

### Creator Merch ($9.99 - $59.99)
- Promorang Logo T-Shirt - $34.99 / 175 gems
- Creator Hoodie - $59.99 / 300 gems
- Promorang Cap - $24.99 / 125 gems
- Sticker Pack - $9.99 / 50 gems
- Laptop Sleeve - $39.99 / 200 gems

### Featured Items ($49.99 - $999.99)
- Ultimate Creator Bundle - $499.99 / 2500 gems / 100 gold
- Limited Edition Founder Pack - $999.99 / 5000 gems / 500 gold
- Monthly Creator Box - $49.99 / 250 gems

## Testing the E-Commerce Experience

After seeding, you can test the following flows:

### As Creator Demo User
1. Browse products at `/marketplace/browse`
2. View product details
3. Add items to cart (some already pre-added)
4. Proceed to checkout
5. Complete purchase with gems/points/USD
6. View order history at `/orders`
7. Leave product reviews

### As Merchant Demo User
1. View store dashboard at `/merchant/dashboard`
2. See product listings
3. Manage inventory
4. View sales analytics
5. Process orders

### As Advertiser/Investor Demo Users
1. Browse and purchase products
2. Leave reviews
3. Build wishlists

## Database Tables Affected

- `merchant_stores` - Store information
- `products` - Product catalog
- `product_reviews` - Customer reviews
- `shopping_carts` - User shopping carts
- `cart_items` - Items in carts
- `orders` - Completed orders (when users checkout)
- `order_items` - Individual order line items

## Troubleshooting

### "Merchant demo user not found"
Run the demo users creation script first:
```bash
npm run create-demo-users
```

### "Database not available"
Check your `.env` file has valid Supabase credentials.

### Products not showing up
1. Check that the merchant_demo user exists
2. Verify the merchant_stores table has the store
3. Check products table for entries with the correct merchant_store_id

### Re-seeding
The script uses `ON CONFLICT` clauses and deletes existing products before inserting, so you can safely re-run it to refresh the demo data.

## Customization

To add more products, edit `seed-demo-products.sql` and add new INSERT statements following the existing pattern. Make sure to:
- Use valid category slugs
- Set appropriate pricing (USD, gems, gold)
- Use high-quality image URLs
- Set `is_digital` correctly
- Set reasonable `stock_quantity`
- Use `status = 'active'`

## Support

For issues or questions, check the main project documentation or create an issue in the repository.
