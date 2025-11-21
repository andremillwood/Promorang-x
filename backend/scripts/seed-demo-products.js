#!/usr/bin/env node
/**
 * PROMORANG DEMO PRODUCTS SEEDER
 * Seeds the database with demo products, reviews, and shopping data
 */

const fs = require('fs');
const path = require('path');
const { supabase } = require('../lib/supabase');

async function seedDemoProducts() {
  console.log('🌱 Starting demo products seed...\n');

  try {
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'seed-demo-products.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📦 Creating merchant store and products...');
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (sqlError) {
      // If RPC doesn't exist, try direct query
      const { error: directError } = await supabase.from('_exec').select(sql);
      if (directError) {
        console.log('⚠️  Could not execute via Supabase RPC. Running manual insert...');
        await manualSeed();
      }
    } else {
      console.log('✅ Products seeded successfully via SQL\n');
    }

    // Add product reviews
    await seedProductReviews();

    // Add some items to demo user carts
    await seedDemoCartItems();

    console.log('\n✨ Demo products seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Merchant store: Promorang Official Store');
    console.log('   - Products: 16 items across 4 categories');
    console.log('   - Categories: Digital Products, Services, Merch, Featured');
    console.log('   - Reviews: Added for popular products');
    console.log('   - Demo carts: Populated for testing\n');

  } catch (error) {
    console.error('❌ Error seeding demo products:', error);
    process.exit(1);
  }
}

async function manualSeed() {
  // Get merchant user - try various identifiers
  let { data: merchantUser } = await supabase
    .from('users')
    .select('id')
    .or('username.eq.merchant_demo,username.eq.demo_merchant,email.eq.demo-merchant@example.com,email.eq.merchant@promorang.co')
    .maybeSingle();

  // If still not found, use the advertiser demo as merchant for testing
  if (!merchantUser) {
    const { data: advertiserUser } = await supabase
      .from('users')
      .select('id')
      .or('username.eq.demo_advertiser,email.eq.demo-advertiser@example.com')
      .maybeSingle();
    
    if (advertiserUser) {
      console.log('ℹ️  Using demo_advertiser as merchant for testing');
      merchantUser = advertiserUser;
    }
  }

  if (!merchantUser) {
    console.log('⚠️  No suitable demo user found for merchant.');
    console.log('💡 Please ensure demo users exist (run: npm run create-demo-users)');
    return;
  }

  console.log('✅ Found merchant user:', merchantUser.id);

  // Check if store exists
  let { data: existingStore } = await supabase
    .from('merchant_stores')
    .select('id, store_name')
    .eq('user_id', merchantUser.id)
    .maybeSingle();

  let store;
  if (existingStore) {
    console.log('✅ Store already exists:', existingStore.store_name);
    store = existingStore;
  } else {
    // Create new store
    const { data: newStore, error: storeError} = await supabase
      .from('merchant_stores')
      .insert({
        user_id: merchantUser.id,
        store_name: 'Promorang Official Store',
        store_slug: 'promorang-official',
        description: 'Official merchandise and digital products from Promorang. Premium quality items for creators and fans.',
        logo_url: 'https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png',
        status: 'active'
      })
      .select()
      .single();

    if (storeError) {
      console.error('Error creating store:', storeError);
      return;
    }

    console.log('✅ Store created:', newStore.store_name);
    store = newStore;
  }

  // Sample products - with required slug field
  const products = [
    {
      store_id: store.id,
      name: 'Creator Starter Pack',
      slug: 'creator-starter-pack',
      description: 'Everything you need to kickstart your creator journey. Includes templates, guides, and exclusive resources.',
      price_usd: 29.99,
      price_gems: 150
    },
    {
      store_id: store.id,
      name: 'Premium Content Templates',
      slug: 'premium-content-templates',
      description: '50+ professional templates for social media, YouTube thumbnails, and promotional materials.',
      price_usd: 49.99,
      price_gems: 250
    },
    {
      store_id: store.id,
      name: 'Promorang Logo T-Shirt',
      slug: 'promorang-logo-tshirt',
      description: 'Premium cotton t-shirt with embroidered Promorang logo. Available in multiple sizes.',
      price_usd: 34.99,
      price_gems: 175
    },
    {
      store_id: store.id,
      name: 'Creator Hoodie',
      slug: 'creator-hoodie',
      description: 'Comfortable pullover hoodie with "Creator" embroidery. Perfect for content creation sessions.',
      price_usd: 59.99,
      price_gems: 300
    },
    {
      store_id: store.id,
      name: 'Content Strategy Session',
      slug: 'content-strategy-session',
      description: '1-hour personalized content strategy consultation with industry experts.',
      price_usd: 149.99,
      price_gems: 750
    },
    {
      store_id: store.id,
      name: 'Ultimate Creator Bundle',
      slug: 'ultimate-creator-bundle',
      description: 'Everything you need: Digital templates, brand kit, 3 strategy sessions, and exclusive merch. Best value!',
      price_usd: 499.99,
      price_gems: 2500,
      price_gold: 100
    }
  ];

  const { error: productsError } = await supabase
    .from('products')
    .insert(products);

  if (productsError) {
    console.error('Error creating products:', productsError);
  } else {
    console.log(`✅ Created ${products.length} demo products`);
  }
}

async function seedProductReviews() {
  console.log('\n⭐ Adding product reviews...');

  try {
    // Get some products
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .limit(5);

    if (!products || products.length === 0) {
      console.log('⚠️  No products found for reviews');
      return;
    }

    // Get demo users - try various identifiers
    const { data: users } = await supabase
      .from('users')
      .select('id, username, email')
      .or('username.in.(demo_creator,demo_advertiser,demo_investor),email.in.(demo-creator@example.com,demo-advertiser@example.com,demo-investor@example.com)')
      .limit(10);

    if (!users || users.length === 0) {
      console.log('⚠️  No demo users found for reviews');
      return;
    }

    const reviews = [
      {
        product_id: products[0].id,
        user_id: users[0]?.id,
        rating: 5,
        review_text: 'Absolutely amazing! This starter pack has everything I needed to launch my creator journey. Highly recommend!',
        is_verified_purchase: true
      },
      {
        product_id: products[0].id,
        user_id: users[1]?.id,
        rating: 4,
        review_text: 'Great value for money. The templates are professional and easy to customize.',
        is_verified_purchase: true
      },
      {
        product_id: products[1]?.id,
        user_id: users[2]?.id,
        rating: 5,
        review_text: 'Perfect fit and excellent quality! The embroidery is top-notch.',
        is_verified_purchase: true
      },
      {
        product_id: products[2]?.id,
        user_id: users[0]?.id,
        rating: 5,
        review_text: 'The consultation was incredibly valuable. Got actionable insights that I implemented immediately.',
        is_verified_purchase: true
      }
    ].filter(r => r.product_id && r.user_id);

    if (reviews.length > 0) {
      const { error } = await supabase
        .from('product_reviews')
        .upsert(reviews, { onConflict: 'product_id,user_id' });

      if (error) {
        console.log('⚠️  Could not add reviews:', error.message);
      } else {
        console.log(`✅ Added ${reviews.length} product reviews`);
      }
    }
  } catch (error) {
    console.log('⚠️  Error adding reviews:', error.message);
  }
}

async function seedDemoCartItems() {
  console.log('\n🛒 Adding items to demo user carts...');

  try {
    // Get creator demo user - try various identifiers
    const { data: creatorUser } = await supabase
      .from('users')
      .select('id')
      .or('username.eq.demo_creator,email.eq.demo-creator@example.com')
      .maybeSingle();

    if (!creatorUser) {
      console.log('⚠️  Creator demo user not found');
      return;
    }

    // Get or create shopping cart
    let { data: cart } = await supabase
      .from('shopping_carts')
      .select('id')
      .eq('user_id', creatorUser.id)
      .single();

    if (!cart) {
      const { data: newCart } = await supabase
        .from('shopping_carts')
        .insert({ user_id: creatorUser.id })
        .select()
        .single();
      cart = newCart;
    }

    if (!cart) {
      console.log('⚠️  Could not create cart');
      return;
    }

    // Get some products
    const { data: products } = await supabase
      .from('products')
      .select('id, price_usd')
      .limit(3);

    if (!products || products.length === 0) {
      console.log('⚠️  No products found for cart');
      return;
    }

    const cartItems = products.map((product, index) => ({
      cart_id: cart.id,
      product_id: product.id,
      quantity: index === 0 ? 2 : 1,
      price_at_addition: product.price_usd
    }));

    const { error } = await supabase
      .from('cart_items')
      .upsert(cartItems, { onConflict: 'cart_id,product_id' });

    if (error) {
      console.log('⚠️  Could not add cart items:', error.message);
    } else {
      console.log(`✅ Added ${cartItems.length} items to creator demo cart`);
    }
  } catch (error) {
    console.log('⚠️  Error adding cart items:', error.message);
  }
}

// Run the seeder
if (require.main === module) {
  seedDemoProducts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDemoProducts };
