/**
 * Piece Trading Service
 * Handles order matching, trade execution, fee distribution, and liquidity
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const creatorEconomicsService = require('./creatorEconomicsService');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// CONFIGURATION
// =====================================================

const DEFAULT_PLATFORM_FEE = 0.01; // 1%
const DEFAULT_CREATOR_ROYALTY = 0.005; // 0.5%
const DEFAULT_LIQUIDITY_FEE = 0.005; // 0.5%

// Map piece types to their respective position/stats tables
const TABLE_MAP = {
  content: {
    positions: 'content_piece_positions',
    stats: 'content_piece_stats',
    idColumn: 'content_id',
    assetTable: 'content_items',
    ownerColumn: 'creator_id', // who gets royalties
  },
  moment: {
    positions: 'moment_piece_positions',
    stats: 'moment_piece_stats',
    idColumn: 'moment_id',
    assetTable: 'moments',
    ownerColumn: 'organizer_id',
  },
  host: {
    positions: 'host_piece_positions',
    stats: 'host_piece_stats',
    idColumn: 'host_id',
    assetTable: 'host_profiles',
    ownerColumn: 'user_id',
  },
  venue: {
    positions: 'venue_piece_positions',
    stats: 'venue_piece_stats',
    idColumn: 'venue_id',
    assetTable: 'venue_profiles',
    ownerColumn: null, // venues don't have a direct owner
  },
};

// =====================================================
// TRADE EXECUTION
// =====================================================

/**
 * Execute a market buy order
 * @param {Object} params
 * @param {string} params.pieceType - 'content', 'moment', 'host', 'venue'
 * @param {string} params.assetId - UUID of the asset
 * @param {string} params.buyerId - UUID of buyer
 * @param {number} params.quantity - Number of pieces to buy
 * @param {number} params.maxPrice - Maximum price per piece willing to pay
 * @returns {Promise<Object>} Trade result
 */
async function executeMarketBuy({ pieceType, assetId, buyerId, quantity, maxPrice }) {
  if (!supabase) throw new Error('Database not available');
  
  const config = TABLE_MAP[pieceType];
  if (!config) throw new Error('Invalid piece type');
  
  // 1. Get matching sell listings (lowest price first)
  const { data: listings, error: listingsError } = await supabase
    .from('piece_listings')
    .select('*')
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .eq('listing_type', 'sell')
    .eq('status', 'active')
    .lte('price_per_piece', maxPrice)
    .order('price_per_piece', { ascending: true });
  
  if (listingsError) throw listingsError;
  
  if (!listings || listings.length === 0) {
    throw new Error('No sellers available at this price');
  }
  
  // 2. Match orders
  let remainingQuantity = quantity;
  const trades = [];
  const fees = {
    platform: 0,
    creator: 0,
    liquidity: 0,
    total: 0,
  };
  
  for (const listing of listings) {
    if (remainingQuantity <= 0) break;
    
    const tradeQuantity = Math.min(remainingQuantity, listing.quantity);
    const tradeValue = tradeQuantity * listing.price_per_piece;
    
    // Calculate fees
    const platformFee = tradeValue * DEFAULT_PLATFORM_FEE;
    const creatorFee = tradeValue * DEFAULT_CREATOR_ROYALTY;
    const liquidityFee = tradeValue * DEFAULT_LIQUIDITY_FEE;
    const totalFees = platformFee + creatorFee + liquidityFee;
    
    // Execute trade
    const trade = await executeSingleTrade({
      pieceType,
      assetId,
      buyerId,
      sellerId: listing.seller_id,
      quantity: tradeQuantity,
      pricePerPiece: listing.price_per_piece,
      totalValue: tradeValue,
      fees: {
        platform: platformFee,
        creator: creatorFee,
        liquidity: liquidityFee,
      },
      listingId: listing.id,
    });
    
    trades.push(trade);
    fees.platform += platformFee;
    fees.creator += creatorFee;
    fees.liquidity += liquidityFee;
    fees.total += totalFees;
    
    remainingQuantity -= tradeQuantity;
    
    // Update or close listing
    if (tradeQuantity >= listing.quantity) {
      await closeListing(listing.id, 'filled');
    } else {
      await updateListingQuantity(listing.id, listing.quantity - tradeQuantity);
    }
  }
  
  if (remainingQuantity > 0) {
    // Partial fill - could create remainder as limit order
    console.warn(`[PieceTrading] Partial fill: ${remainingQuantity} pieces remaining unfilled`);
  }
  
  return {
    success: true,
    filledQuantity: quantity - remainingQuantity,
    remainingQuantity,
    trades,
    fees,
    totalCost: trades.reduce((sum, t) => sum + t.total_value, 0) + fees.total,
  };
}

/**
 * Execute a single trade between buyer and seller
 */
async function executeSingleTrade({ pieceType, assetId, buyerId, sellerId, quantity, pricePerPiece, totalValue, fees, listingId }) {
  const config = TABLE_MAP[pieceType];
  
  // 1. Get asset owner for royalty payment
  let assetOwnerId = null;
  if (config.ownerColumn) {
    const { data: asset } = await supabase
      .from(config.assetTable)
      .select(config.ownerColumn)
      .eq('id', assetId)
      .single();
    assetOwnerId = asset?.[config.ownerColumn];
  }
  
  // 2. Update buyer position (add pieces)
  await updatePosition(pieceType, assetId, buyerId, quantity, pricePerPiece, 'buy');
  
  // 3. Update seller position (remove pieces)
  await updatePosition(pieceType, assetId, sellerId, -quantity, pricePerPiece, 'sell');
  
  // 4. Record the trade
  const { data: trade, error: tradeError } = await supabase
    .from('piece_trades')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      buyer_id: buyerId,
      seller_id: sellerId,
      quantity,
      price_per_piece: pricePerPiece,
      total_value: totalValue,
      trade_type: 'market',
      listing_id: listingId,
    })
    .select()
    .single();
  
  if (tradeError) throw tradeError;
  
  // 5. Distribute creator royalty (if applicable)
  if (fees.creator > 0 && assetOwnerId) {
    await recordCreatorRoyalty({
      pieceType,
      assetId,
      creatorId: assetOwnerId,
      tradeId: trade.id,
      amount: fees.creator,
    });
  }
  
  // 6. Record revenue for dividends
  await recordTradingRevenue({
    pieceType,
    assetId,
    tradeValue: totalValue,
    fees,
  });
  
  return trade;
}

/**
 * Update a user's piece position
 */
async function updatePosition(pieceType, assetId, holderId, quantityChange, pricePerPiece, side) {
  const config = TABLE_MAP[pieceType];
  
  // Check if position exists
  const { data: existing, error: checkError } = await supabase
    .from(config.positions)
    .select('*')
    .eq(config.idColumn, assetId)
    .eq('holder_id', holderId)
    .maybeSingle();
  
  if (checkError) throw checkError;
  
  if (existing) {
    // Update existing position
    const newQuantity = existing.pieces_owned + quantityChange;
    if (newQuantity < 0) throw new Error('Insufficient pieces to sell');
    
    const newTotalInvested = side === 'buy' 
      ? existing.total_invested + (quantityChange * pricePerPiece)
      : existing.total_invested * (newQuantity / existing.pieces_owned); // Reduce cost basis proportionally
    
    const newAvgPrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0;
    
    const { error: updateError } = await supabase
      .from(config.positions)
      .update({
        pieces_owned: newQuantity,
        total_invested: Math.max(0, newTotalInvested),
        avg_purchase_price: newAvgPrice,
        last_trade_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    
    if (updateError) throw updateError;
  } else if (quantityChange > 0) {
    // Create new position (buy only)
    const { error: insertError } = await supabase
      .from(config.positions)
      .insert({
        [config.idColumn]: assetId,
        holder_id: holderId,
        pieces_owned: quantityChange,
        total_invested: quantityChange * pricePerPiece,
        avg_purchase_price: pricePerPiece,
      });
    
    if (insertError) throw insertError;
  } else {
    throw new Error('Cannot sell pieces - no position exists');
  }
}

/**
 * Close a listing
 */
async function closeListing(listingId, status) {
  const { error } = await supabase
    .from('piece_listings')
    .update({
      status,
      filled_at: status === 'filled' ? new Date().toISOString() : null,
    })
    .eq('id', listingId);
  
  if (error) throw error;
}

/**
 * Update listing quantity after partial fill
 */
async function updateListingQuantity(listingId, newQuantity) {
  const { error } = await supabase
    .from('piece_listings')
    .update({ quantity: newQuantity })
    .eq('id', listingId);
  
  if (error) throw error;
}

// =====================================================
// LISTING MANAGEMENT
// =====================================================

/**
 * Create a sell listing
 */
async function createSellListing({ pieceType, assetId, sellerId, quantity, pricePerPiece, expiresAt }) {
  if (!supabase) throw new Error('Database not available');
  
  // Verify seller has enough pieces
  const config = TABLE_MAP[pieceType];
  const { data: position, error: posError } = await supabase
    .from(config.positions)
    .select('pieces_owned')
    .eq(config.idColumn, assetId)
    .eq('holder_id', sellerId)
    .single();
  
  if (posError || !position || position.pieces_owned < quantity) {
    throw new Error('Insufficient pieces to list');
  }
  
  // Create listing
  const { data: listing, error } = await supabase
    .from('piece_listings')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      seller_id: sellerId,
      quantity,
      price_per_piece: pricePerPiece,
      listing_type: 'sell',
      expires_at: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return listing;
}

/**
 * Create a buy listing (limit order)
 */
async function createBuyListing({ pieceType, assetId, buyerId, quantity, pricePerPiece, expiresAt }) {
  if (!supabase) throw new Error('Database not available');
  
  // Create listing
  const { data: listing, error } = await supabase
    .from('piece_listings')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      seller_id: buyerId, // Using seller_id column as "creator" of the order
      quantity,
      price_per_piece: pricePerPiece,
      listing_type: 'buy',
      expires_at: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return listing;
}

/**
 * Cancel a listing
 */
async function cancelListing(listingId, userId) {
  if (!supabase) throw new Error('Database not available');
  
  // Verify ownership
  const { data: listing, error: checkError } = await supabase
    .from('piece_listings')
    .select('*')
    .eq('id', listingId)
    .eq('seller_id', userId)
    .single();
  
  if (checkError || !listing) {
    throw new Error('Listing not found or not authorized');
  }
  
  const { error } = await supabase
    .from('piece_listings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', listingId);
  
  if (error) throw error;
  
  return { success: true };
}

// =====================================================
// REVENUE & ROYALTIES
// =====================================================

/**
 * Record creator royalty payment
 */
async function recordCreatorRoyalty({ pieceType, assetId, creatorId, tradeId, amount }) {
  try {
    // Record in creator economics ledger
    await creatorEconomicsService.recordCreatorLedgerEntry({
      creatorId,
      sourceType: 'piece_trade_royalty',
      unitCount: 1,
      unitAmount: amount,
      grossAmount: amount,
      creatorSharePercent: 100, // Full amount goes to creator
      creatorShareAmount: amount,
      metadata: {
        piece_type: pieceType,
        asset_id: assetId,
        trade_id: tradeId,
        royalty_type: 'secondary_sale',
      },
    });
  } catch (error) {
    console.error('[PieceTrading] Failed to record creator royalty:', error);
    // Don't throw - trade still succeeded, just log for reconciliation
  }
}

/**
 * Record trading revenue for dividend calculations
 */
async function recordTradingRevenue({ pieceType, assetId, tradeValue, fees }) {
  try {
    const periodStart = new Date();
    periodStart.setHours(0, 0, 0, 0);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 1);
    
    // Upsert revenue record for today
    const { error } = await supabase
      .from('piece_revenue_sources')
      .upsert({
        piece_type: pieceType,
        asset_id: assetId,
        revenue_type: 'trading_fees',
        gross_revenue: fees.total,
        net_revenue: fees.total * 0.5, // 50% goes to holders
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      }, {
        onConflict: 'piece_type,asset_id,revenue_type,period_start',
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('[PieceTrading] Failed to record revenue:', error);
  }
}

// =====================================================
// ORDER BOOK
// =====================================================

/**
 * Get order book for a piece
 */
async function getOrderBook(pieceType, assetId) {
  if (!supabase) return { sellOrders: [], buyOrders: [] };
  
  const [sellResult, buyResult] = await Promise.all([
    supabase
      .from('piece_listings')
      .select(`
        *,
        seller:seller_id(id, username, display_name)
      `)
      .eq('piece_type', pieceType)
      .eq('asset_id', assetId)
      .eq('listing_type', 'sell')
      .eq('status', 'active')
      .order('price_per_piece', { ascending: true }),
    supabase
      .from('piece_listings')
      .select(`
        *,
        seller:seller_id(id, username, display_name)
      `)
      .eq('piece_type', pieceType)
      .eq('asset_id', assetId)
      .eq('listing_type', 'buy')
      .eq('status', 'active')
      .order('price_per_piece', { ascending: false }),
  ]);
  
  return {
    sellOrders: sellResult.data || [],
    buyOrders: buyResult.data || [],
    spread: calculateSpread(sellResult.data, buyResult.data),
  };
}

function calculateSpread(sellOrders, buyOrders) {
  const lowestAsk = sellOrders?.[0]?.price_per_piece;
  const highestBid = buyOrders?.[0]?.price_per_piece;
  
  if (!lowestAsk || !highestBid) return null;
  
  return {
    lowestAsk,
    highestBid,
    spread: lowestAsk - highestBid,
    spreadPercent: ((lowestAsk - highestBid) / lowestAsk * 100).toFixed(2),
  };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  executeMarketBuy,
  createSellListing,
  createBuyListing,
  cancelListing,
  getOrderBook,
  TABLE_MAP,
};
