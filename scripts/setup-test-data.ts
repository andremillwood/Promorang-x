/**
 * Test Data Setup Script for Pieces Trading
 * Run this to populate the database with sample data for testing
 */

import { supabase } from '@/integrations/supabase/client';

// Test content asset UUID
const TEST_ASSET_ID = '12345678-1234-1234-1234-123456789abc';
const TEST_USER_ID = 'demo-participant-001';

export async function setupTestData() {
  console.log('Setting up test data for pieces trading...\n');

  try {
    // 1. Create test revenue source
    console.log('1. Creating revenue source...');
    const { data: revenue, error: revenueError } = await supabase
      .from('piece_revenue_sources')
      .upsert({
        piece_type: 'content',
        asset_id: TEST_ASSET_ID,
        revenue_type: 'trading_fees',
        gross_revenue: 10000.00,
        net_revenue: 9500.00,
        period_start: '2025-01-01T00:00:00Z',
        period_end: '2025-03-31T23:59:59Z',
        transaction_count: 150
      })
      .select()
      .single();

    if (revenueError) throw revenueError;
    console.log('✅ Revenue source created:', revenue.id);

    // 2. Create test piece holdings for multiple users
    console.log('\n2. Creating piece holdings...');
    const holdings = [
      { holder_id: TEST_USER_ID, pieces: 1000 },
      { holder_id: 'demo-participant-002', pieces: 500 },
      { holder_id: 'demo-participant-003', pieces: 250 },
      { holder_id: 'demo-venue-001', pieces: 750 }
    ];

    for (const holding of holdings) {
      const { error } = await supabase
        .from('piece_holdings')
        .upsert({
          piece_type: 'content',
          asset_id: TEST_ASSET_ID,
          holder_id: holding.holder_id,
          pieces: holding.pieces
        });

      if (error) throw error;
      console.log(`✅ Holdings for ${holding.holder_id}: ${holding.pieces} pieces`);
    }

    // 3. Create liquidity pool
    console.log('\n3. Creating AMM liquidity pool...');
    const { data: pool, error: poolError } = await supabase
      .from('piece_liquidity_pools')
      .upsert({
        piece_type: 'content',
        asset_id: TEST_ASSET_ID,
        pieces_reserve: 10000,
        currency_reserve: 50000,
        k_constant: 10000 * 50000,
        last_price: 5.00,
        price_24h_ago: 4.80,
        volume_24h: 2500,
        swap_fee_percent: 0.0030,
        lp_fee_percent: 0.0025,
        protocol_fee_percent: 0.0005,
        status: 'active',
        created_by: TEST_USER_ID
      })
      .select()
      .single();

    if (poolError) throw poolError;
    console.log('✅ Liquidity pool created:', pool.id);

    // 4. Create LP position
    console.log('\n4. Creating LP position...');
    const { error: lpError } = await supabase
      .from('piece_lp_positions')
      .upsert({
        pool_id: pool.id,
        provider_id: TEST_USER_ID,
        lp_tokens: 1000,
        pieces_deposited: 5000,
        currency_deposited: 25000,
        fees_earned_pieces: 25.50,
        fees_earned_currency: 127.50
      });

    if (lpError) throw lpError;
    console.log('✅ LP position created');

    // 5. Create circuit breaker
    console.log('\n5. Creating circuit breaker...');
    const { error: breakerError } = await supabase
      .from('piece_circuit_breakers')
      .upsert({
        pool_id: pool.id,
        max_price_change_1h_percent: 20.00,
        max_price_change_24h_percent: 100.00,
        cooldown_minutes: 15,
        is_triggered: false,
        triggered_count: 0
      });

    if (breakerError) throw breakerError;
    console.log('✅ Circuit breaker configured');

    // 6. Create sample swap transaction
    console.log('\n6. Creating sample swap transaction...');
    const { error: swapError } = await supabase
      .from('piece_amm_swaps')
      .insert({
        pool_id: pool.id,
        swap_type: 'pieces_to_currency',
        trader_id: TEST_USER_ID,
        amount_in: 100,
        amount_out: 498.50,
        swap_fee: 1.50,
        protocol_fee: 0.25,
        lp_fee: 1.25,
        price_before: 5.00,
        price_after: 4.99,
        price_impact_percent: 0.20,
        expected_amount_out: 500,
        minimum_amount_out: 495,
        slippage_percent: 0.01,
        status: 'completed',
        completed_at: new Date().toISOString()
      });

    if (swapError) throw swapError;
    console.log('✅ Sample swap recorded');

    // 7. Create governance proposal
    console.log('\n7. Creating governance proposal...');
    const { data: proposal, error: proposalError } = await supabase
      .from('piece_governance_proposals')
      .insert({
        piece_type: 'content',
        asset_id: TEST_ASSET_ID,
        proposal_type: 'fee_adjustment',
        title: 'Reduce Trading Fees to 2%',
        description: 'Proposal to reduce swap fees from 3% to 2% to increase trading volume.',
        proposed_by: TEST_USER_ID,
        voting_starts_at: new Date().toISOString(),
        voting_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        execution_threshold_percent: 50,
        min_participation_percent: 10,
        status: 'active'
      })
      .select()
      .single();

    if (proposalError) throw proposalError;
    console.log('✅ Governance proposal created:', proposal.id);

    // 8. Create piece issuance
    console.log('\n8. Creating piece issuance record...');
    const { error: issuanceError } = await supabase
      .from('piece_issuances')
      .insert({
        piece_type: 'content',
        asset_id: TEST_ASSET_ID,
        issuer_id: TEST_USER_ID,
        issuance_type: 'initial',
        total_pieces_issued: 10000,
        initial_price: 1.00,
        pieces_available: 2000,
        pieces_locked: 0,
        issuance_status: 'active',
        market_opened_at: new Date().toISOString()
      });

    if (issuanceError) throw issuanceError;
    console.log('✅ Piece issuance recorded');

    console.log('\n🎉 Test data setup complete!');
    console.log('\nTest IDs for reference:');
    console.log(`- Asset ID: ${TEST_ASSET_ID}`);
    console.log(`- Pool ID: ${pool.id}`);
    console.log(`- Proposal ID: ${proposal.id}`);

    return {
      assetId: TEST_ASSET_ID,
      poolId: pool.id,
      proposalId: proposal.id,
      revenueId: revenue.id
    };

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupTestData();
}
