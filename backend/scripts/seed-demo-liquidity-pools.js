#!/usr/bin/env node

require('dotenv').config({ path: '../.env' });
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const demoUserId = '00000000-0000-0000-0000-000000000001';

const contentItems = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    creator_id: demoUserId,
    title: 'Morning Productivity Stack',
    description: 'Breaking down the tools that fuel my morning routine.',
    media_url: 'https://cdn.promorang.com/content/morning-stack.mp4',
    platform: 'youtube',
    status: 'published',
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    impressions: 18250,
    clicks: 1240,
    engagements: 8600,
    shares: 520,
    conversions: 180,
    engagement_rate: 0.0472,
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    creator_id: demoUserId,
    title: '30-Day Wellness Challenge Recap',
    description: 'Highlights from the wellness challenge participants.',
    media_url: 'https://cdn.promorang.com/content/wellness-recap.mp4',
    platform: 'tiktok',
    status: 'published',
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    impressions: 9800,
    clicks: 740,
    engagements: 5200,
    shares: 315,
    conversions: 140,
    engagement_rate: 0.0531,
  },
];

const pools = [
  {
    id: '91000000-0000-0000-0000-000000000001',
    piece_type: 'content',
    asset_id: '50000000-0000-0000-0000-000000000001',
    pieces_reserve: 12000,
    currency_reserve: 60000,
    k_constant: 720000000,
    swap_fee_percent: 0.003,
    protocol_fee_percent: 0.0005,
    lp_fee_percent: 0.0025,
    status: 'active',
    last_price: 5,
    price_24h_ago: 4.85,
    volume_24h: 18500,
    created_by: demoUserId,
  },
  {
    id: '91000000-0000-0000-0000-000000000002',
    piece_type: 'content',
    asset_id: '50000000-0000-0000-0000-000000000002',
    pieces_reserve: 9000,
    currency_reserve: 31500,
    k_constant: 283500000,
    swap_fee_percent: 0.003,
    protocol_fee_percent: 0.0005,
    lp_fee_percent: 0.0025,
    status: 'active',
    last_price: 3.5,
    price_24h_ago: 3.65,
    volume_24h: 9700,
    created_by: demoUserId,
  },
];

const contentStats = [
  {
    content_id: '50000000-0000-0000-0000-000000000001',
    current_price: 5,
    previous_close: 4.85,
    day_open: 4.85,
    day_high: 5.15,
    day_low: 4.7,
    week_high: 5.25,
    week_low: 4.5,
    total_pieces: 12000,
    available_pieces: 8300,
    market_cap: 60000,
    volume_24h: 18500,
    volume_7d: 74200,
    trade_count_24h: 42,
    change_24h: 3.0928,
    holder_count: 18,
  },
  {
    content_id: '50000000-0000-0000-0000-000000000002',
    current_price: 3.5,
    previous_close: 3.65,
    day_open: 3.65,
    day_high: 3.76,
    day_low: 3.4,
    week_high: 3.95,
    week_low: 3.2,
    total_pieces: 9000,
    available_pieces: 6200,
    market_cap: 31500,
    volume_24h: 9700,
    volume_7d: 38100,
    trade_count_24h: 27,
    change_24h: -4.1096,
    holder_count: 13,
  },
];

const contentPositions = [
  {
    content_id: '50000000-0000-0000-0000-000000000001',
    holder_id: demoUserId,
    pieces_owned: 45,
    total_invested: 180,
    avg_purchase_price: 4,
  },
  {
    content_id: '50000000-0000-0000-0000-000000000002',
    holder_id: demoUserId,
    pieces_owned: 30,
    total_invested: 120,
    avg_purchase_price: 4,
  },
];

const positions = [
  {
    pool_id: '91000000-0000-0000-0000-000000000001',
    provider_id: demoUserId,
    lp_tokens: 26832.81572999,
    pieces_deposited: 12000,
    currency_deposited: 60000,
    fees_earned_pieces: 42.25,
    fees_earned_currency: 211.25,
  },
  {
    pool_id: '91000000-0000-0000-0000-000000000002',
    provider_id: demoUserId,
    lp_tokens: 16837.45824048,
    pieces_deposited: 9000,
    currency_deposited: 31500,
    fees_earned_pieces: 27.5,
    fees_earned_currency: 96.25,
  },
];

async function upsertOrThrow(table, rows, options) {
  const { error } = await supabase.from(table).upsert(rows, options);
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

async function main() {
  await upsertOrThrow('users', [{
    id: demoUserId,
    email: 'demo@promorang.com',
    username: 'demouser',
    display_name: 'Demo User',
    user_type: 'creator',
  }], { onConflict: 'id' });

  await upsertOrThrow('content_items', contentItems, { onConflict: 'id' });
  await upsertOrThrow('content_piece_stats', contentStats, { onConflict: 'content_id' });
  await upsertOrThrow('content_piece_positions', contentPositions, { onConflict: 'content_id,holder_id' });
  await upsertOrThrow('piece_liquidity_pools', pools, { onConflict: 'piece_type,asset_id' });
  await upsertOrThrow('piece_lp_positions', positions, { onConflict: 'pool_id,provider_id' });

  const { data: activePools, error } = await supabase
    .from('piece_liquidity_pools')
    .select('id,piece_type,asset_id,status,last_price,volume_24h')
    .eq('status', 'active')
    .order('volume_24h', { ascending: false });

  if (error) throw new Error(`verify: ${error.message}`);

  console.log(JSON.stringify({
    success: true,
    seeded_pools: pools.length,
    active_pool_count: activePools?.length || 0,
    active_pools: activePools || [],
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
