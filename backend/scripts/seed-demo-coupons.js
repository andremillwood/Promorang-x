/**
 * SEED DEMO COUPONS & GIVEAWAYS
 * Creates advertiser coupons that appear in home feed
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

async function seedDemoCoupons() {
  if (!supabase) {
    console.error('❌ Supabase not available');
    return;
  }

  console.log('🎫 Seeding demo coupons and giveaways...\n');

  try {
    // Get demo advertiser
    const { data: advertiser } = await supabase
      .from('users')
      .select('id')
      .or('username.eq.demo_advertiser,email.eq.demo-advertiser@example.com')
      .maybeSingle();

    if (!advertiser) {
      console.error('❌ Demo advertiser not found');
      return;
    }

    console.log('✅ Found demo advertiser:', advertiser.id);

    // Get demo campaign
    const { data: campaign } = await supabase
      .from('advertiser_campaigns')
      .select('id, name')
      .eq('advertiser_id', advertiser.id)
      .limit(1)
      .maybeSingle();

    let campaignId = campaign?.id;
    
    // Create demo campaign if none exists
    if (!campaign) {
      const { data: newCampaign, error: campaignError } = await supabase
        .from('advertiser_campaigns')
        .insert({
          advertiser_id: advertiser.id,
          name: 'Holiday Mega Giveaway',
          objective: 'Drive engagement and reward loyal creators',
          status: 'active',
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_budget: 10000,
          budget_spent: 2500,
          target_audience: { persona: 'all_creators', focus: 'high_engagement' }
        })
        .select()
        .single();

      if (campaignError) {
        console.error('❌ Error creating campaign:', campaignError);
        return;
      }

      campaignId = newCampaign.id;
      console.log('✅ Created demo campaign:', newCampaign.name);
    }

    // Get merchant store for product discounts
    const { data: store } = await supabase
      .from('merchant_stores')
      .select('id')
      .eq('store_slug', 'promorang-official')
      .maybeSingle();

    const storeId = store?.id;

    // Demo coupons to create
    const demoCoupons = [
      {
        code: 'WELCOME50',
        name: '🎉 New Creator Welcome Bonus',
        description: 'Get 50% off your first marketplace purchase! Complete any drop to unlock this exclusive discount.',
        discount_type: 'percentage',
        discount_value: 50,
        max_uses: 100,
        max_uses_per_user: 1,
        campaign_id: campaignId,
        source_type: 'advertiser',
        created_by: advertiser.id,
        store_id: storeId,
        starts_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        metadata: {
          badge: 'NEW',
          highlight: true,
          requirement: 'Complete any drop',
          value_display: '50% OFF'
        }
      },
      {
        code: 'FLASH100',
        name: '⚡ Flash Sale - $100 Off',
        description: 'Limited time! Get $100 off orders over $200. Only 25 redemptions available!',
        discount_type: 'fixed_usd',
        discount_value: 100,
        min_purchase_usd: 200,
        max_uses: 25,
        max_uses_per_user: 1,
        campaign_id: campaignId,
        source_type: 'advertiser',
        created_by: advertiser.id,
        store_id: storeId,
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        metadata: {
          badge: 'FLASH',
          highlight: true,
          urgency: 'high',
          value_display: '$100 OFF'
        }
      },
      {
        code: 'GEMS500',
        name: '💎 Gem Spender Reward',
        description: 'Spent gems on content? Get 500 gems back on your next marketplace order!',
        discount_type: 'fixed_gems',
        discount_value: 500,
        max_uses: 50,
        max_uses_per_user: 1,
        campaign_id: campaignId,
        source_type: 'advertiser',
        created_by: advertiser.id,
        store_id: storeId,
        starts_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        metadata: {
          badge: 'GEMS',
          highlight: false,
          requirement: 'Active gem user',
          value_display: '500 💎'
        }
      },
      {
        code: 'FREESHIP',
        name: '🚚 Free Shipping Weekend',
        description: 'All weekend long - free shipping on any order, no minimum!',
        discount_type: 'free_shipping',
        discount_value: 0,
        max_uses: 200,
        max_uses_per_user: 2,
        campaign_id: campaignId,
        source_type: 'platform',
        created_by: advertiser.id,
        store_id: storeId,
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        metadata: {
          badge: 'WEEKEND',
          highlight: false,
          value_display: 'FREE SHIPPING'
        }
      },
      {
        code: 'TOP10REWARD',
        name: '👑 Leaderboard Elite Discount',
        description: 'Exclusive for top 10 performers! Get 75% off any item in the marketplace.',
        discount_type: 'percentage',
        discount_value: 75,
        max_uses: 10,
        max_uses_per_user: 1,
        campaign_id: campaignId,
        source_type: 'advertiser',
        created_by: advertiser.id,
        store_id: storeId,
        starts_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        metadata: {
          badge: 'ELITE',
          highlight: true,
          requirement: 'Top 10 on leaderboard',
          exclusivity: 'high',
          value_display: '75% OFF'
        }
      },
      {
        code: 'CREATOR25',
        name: '🎨 Creator Appreciation',
        description: 'Thank you for being a creator! Enjoy 25% off all digital products.',
        discount_type: 'percentage',
        discount_value: 25,
        applies_to: 'all',
        max_uses: 500,
        max_uses_per_user: 3,
        campaign_id: campaignId,
        source_type: 'platform',
        created_by: advertiser.id,
        store_id: storeId,
        starts_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        metadata: {
          badge: 'CREATOR',
          highlight: false,
          value_display: '25% OFF'
        }
      }
    ];

    // Insert coupons
    for (const coupon of demoCoupons) {
      // Check if coupon already exists
      const { data: existing } = await supabase
        .from('coupons')
        .select('id, code')
        .eq('code', coupon.code)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Coupon ${coupon.code} already exists, skipping...`);
        continue;
      }

      const { data: created, error } = await supabase
        .from('coupons')
        .insert(coupon)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating coupon ${coupon.code}:`, error.message);
      } else {
        console.log(`✅ Created coupon: ${coupon.code} - ${coupon.name}`);
        console.log(`   💰 Value: ${coupon.metadata.value_display}`);
        console.log(`   📅 Expires: ${new Date(coupon.expires_at).toLocaleDateString()}`);
        console.log(`   🎯 Max uses: ${coupon.max_uses}\n`);
      }
    }

    // Create some advertiser_coupons entries for backward compatibility
    const advertiserCoupons = [
      {
        advertiser_id: advertiser.id,
        title: 'Drop Completion Bonus',
        description: 'Complete 3 drops this week and unlock a special mystery reward!',
        reward_type: 'coupon',
        value: 30,
        value_unit: 'percentage',
        quantity_total: 50,
        quantity_remaining: 50,
        status: 'active',
        start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        conditions: {
          min_drops_completed: 3,
          time_window: '1_week'
        }
      },
      {
        advertiser_id: advertiser.id,
        title: 'Referral Mega Bonus',
        description: 'Refer 5 friends and get $200 in marketplace credits!',
        reward_type: 'discount',
        value: 200,
        value_unit: 'usd',
        quantity_total: 20,
        quantity_remaining: 20,
        status: 'active',
        start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        conditions: {
          min_referrals: 5,
          referrals_must_be_active: true
        }
      }
    ];

    for (const advCoupon of advertiserCoupons) {
      const { data: created, error } = await supabase
        .from('advertiser_coupons')
        .insert(advCoupon)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating advertiser coupon:`, error.message);
      } else {
        console.log(`✅ Created advertiser coupon: ${created.title}`);
      }
    }

    console.log('\n✨ Demo coupons seeding complete!');
    console.log('\n📋 Summary:');
    console.log(`   - ${demoCoupons.length} marketplace coupons created`);
    console.log(`   - ${advertiserCoupons.length} advertiser reward coupons created`);
    console.log(`   - All linked to campaign: ${campaign?.name || 'Holiday Mega Giveaway'}`);
    console.log('\n💡 These coupons will now appear in:');
    console.log('   - Home feed "Rewards" tab');
    console.log('   - "For You" personalized feed');
    console.log('   - Marketplace checkout');
    console.log('   - Campaign dashboard\n');

  } catch (error) {
    console.error('❌ Error seeding coupons:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoCoupons()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDemoCoupons };
