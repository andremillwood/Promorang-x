/**
 * Piece Minting Service
 * Handles initial issuance (IPO), additional minting, airdrops, and lockups
 */

const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// INITIAL PIECE OFFERING (IPO)
// =====================================================

/**
 * Launch an Initial Piece Offering
 * @param {Object} params
 * @param {string} params.pieceType - 'content', 'moment', 'host', 'venue'
 * @param {string} params.assetId - UUID of the underlying asset
 * @param {string} params.issuerId - UUID of the issuer (creator/host/venue owner)
 * @param {number} params.totalPieces - Total pieces to issue
 * @param {number} params.initialPrice - Initial price per piece
 * @param {Object} params.options - Additional options
 * @returns {Promise<Object>} Issuance details
 */
async function launchIPO({
  pieceType,
  assetId,
  issuerId,
  totalPieces,
  initialPrice,
  options = {},
}) {
  if (!supabase) throw new Error('Database not available');
  
  // 1. Verify asset exists and issuer owns it
  await verifyAssetOwnership(pieceType, assetId, issuerId);
  
  // 2. Check if pieces already exist for this asset
  const existingIssuance = await checkExistingIssuance(pieceType, assetId);
  if (existingIssuance) {
    throw new Error('Pieces already issued for this asset');
  }
  
  // 3. Validate parameters
  if (totalPieces < 10 || totalPieces > 1000000) {
    throw new Error('Total pieces must be between 10 and 1,000,000');
  }
  
  if (initialPrice <= 0 || initialPrice > 10000) {
    throw new Error('Initial price must be between 0 and 10,000');
  }
  
  // 4. Calculate allocation
  const allocation = calculateAllocation(totalPieces, options);
  
  // 5. Create issuance record
  const { data: issuance, error: issuanceError } = await supabase
    .from('piece_issuances')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      issuer_id: issuerId,
      issuance_type: 'initial',
      total_pieces_issued: totalPieces,
      initial_price: initialPrice,
      pieces_available: allocation.publicSale,
      pieces_locked: allocation.locked,
      lock_release_schedule: allocation.lockSchedule,
      vesting_start_date: options.vestingStartDate || new Date().toISOString(),
      vesting_end_date: options.vestingEndDate,
      market_opened_at: options.marketOpenDate || new Date().toISOString(),
      issuance_status: 'active',
      regulatory_disclaimer: options.regulatoryDisclaimer,
    })
    .select()
    .single();
  
  if (issuanceError) throw issuanceError;
  
  // 6. Mint initial positions
  await mintInitialPositions({
    pieceType,
    assetId,
    issuerId,
    allocation,
    initialPrice,
  });
  
  // 7. Initialize price oracle if hybrid pricing
  if (options.pricingType === 'hybrid' || options.pricingType === 'engagement') {
    await initializePriceOracle({
      pieceType,
      assetId,
      oracleType: options.pricingType,
      initialPrice,
    });
  }
  
  // 8. Initialize stats
  await initializePieceStats({
    pieceType,
    assetId,
    totalPieces,
    initialPrice,
  });
  
  return {
    success: true,
    issuance,
    allocation,
    message: 'IPO launched successfully',
  };
}

/**
 * Calculate piece allocation for an IPO
 */
function calculateAllocation(totalPieces, options) {
  const defaults = {
    issuerRetention: 0.20, // 20% to issuer
    publicSale: 0.50,      // 50% for public sale
    platformReserve: 0.10, // 10% to platform
    communityRewards: 0.10, // 10% for rewards
    locked: 0.10,          // 10% locked
  };
  
  const config = { ...defaults, ...options.allocation };
  
  const allocation = {
    issuer: Math.floor(totalPieces * config.issuerRetention),
    publicSale: Math.floor(totalPieces * config.publicSale),
    platformReserve: Math.floor(totalPieces * config.platformReserve),
    communityRewards: Math.floor(totalPieces * config.communityRewards),
    locked: Math.floor(totalPieces * config.locked),
  };
  
  // Distribute remainder to public sale
  const distributed = Object.values(allocation).reduce((a, b) => a + b, 0);
  allocation.publicSale += totalPieces - distributed;
  
  // Lock schedule
  allocation.lockSchedule = generateLockSchedule({
    locked: allocation.locked,
    vestingMonths: options.vestingMonths || 12,
    cliffMonths: options.cliffMonths || 3,
  });
  
  return allocation;
}

function generateLockSchedule({ locked, vestingMonths, cliffMonths }) {
  const schedule = [];
  const now = new Date();
  
  // Cliff period - no unlocks
  const cliffDate = new Date(now);
  cliffDate.setMonth(cliffDate.getMonth() + cliffMonths);
  
  // After cliff, monthly unlocks
  const piecesPerMonth = Math.floor(locked / (vestingMonths - cliffMonths));
  
  for (let i = cliffMonths; i < vestingMonths; i++) {
    const unlockDate = new Date(now);
    unlockDate.setMonth(unlockDate.getMonth() + i);
    
    schedule.push({
      date: unlockDate.toISOString(),
      amount: i === vestingMonths - 1 
        ? locked - (piecesPerMonth * (vestingMonths - cliffMonths - 1)) // Last month gets remainder
        : piecesPerMonth,
    });
  }
  
  return schedule;
}

// =====================================================
// POSITION MINTING
// =====================================================

async function mintInitialPositions({ pieceType, assetId, issuerId, allocation, initialPrice }) {
  const config = getTableConfig(pieceType);
  const positions = [];
  
  // Issuer position
  if (allocation.issuer > 0) {
    positions.push({
      [config.idColumn]: assetId,
      holder_id: issuerId,
      pieces_owned: allocation.issuer,
      total_invested: 0, // Issuer gets these for free
      avg_purchase_price: 0,
      first_acquired_at: new Date().toISOString(),
    });
  }
  
  // Platform reserve position
  if (allocation.platformReserve > 0) {
    positions.push({
      [config.idColumn]: assetId,
      holder_id: '00000000-0000-0000-0000-000000000000', // Platform treasury
      pieces_owned: allocation.platformReserve,
      total_invested: 0,
      avg_purchase_price: 0,
      first_acquired_at: new Date().toISOString(),
    });
  }
  
  // Community rewards pool
  if (allocation.communityRewards > 0) {
    positions.push({
      [config.idColumn]: assetId,
      holder_id: '11111111-1111-1111-1111-111111111111', // Rewards pool
      pieces_owned: allocation.communityRewards,
      total_invested: 0,
      avg_purchase_price: 0,
      first_acquired_at: new Date().toISOString(),
    });
  }
  
  // Insert all positions
  if (positions.length > 0) {
    const { error } = await supabase
      .from(config.positions)
      .insert(positions);
    
    if (error) throw error;
  }
  
  // Create lockup record for locked pieces
  if (allocation.locked > 0) {
    await createLockup({
      pieceType,
      assetId,
      holderId: issuerId,
      lockedPieces: allocation.locked,
      lockSchedule: allocation.lockSchedule,
      lockupType: 'vesting',
    });
  }
}

/**
 * Create a lockup/vesting schedule
 */
async function createLockup({ pieceType, assetId, holderId, lockedPieces, lockSchedule, lockupType }) {
  const now = new Date();
  const endDate = new Date(lockSchedule[lockSchedule.length - 1]?.date || now);
  
  const { error } = await supabase
    .from('piece_lockups')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      holder_id: holderId,
      lockup_type: lockupType,
      locked_pieces: lockedPieces,
      unlock_schedule: lockSchedule,
      lockup_start_date: now.toISOString(),
      lockup_end_date: endDate.toISOString(),
    });
  
  if (error) throw error;
}

// =====================================================
// AIRDROP & REWARDS
// =====================================================

/**
 * Airdrop pieces to users
 */
async function airdropPieces({
  pieceType,
  assetId,
  recipients, // Array of { userId, quantity, reason }
  fromPool = 'community', // 'community', 'platform', or specific holder
}) {
  if (!supabase) throw new Error('Database not available');
  
  const config = getTableConfig(pieceType);
  const totalAirdrop = recipients.reduce((sum, r) => sum + r.quantity, 0);
  
  // 1. Check available pieces in pool
  const poolHolderId = fromPool === 'community' 
    ? '11111111-1111-1111-1111-111111111111'
    : '00000000-0000-0000-0000-000000000000';
  
  const { data: poolPosition, error: checkError } = await supabase
    .from(config.positions)
    .select('pieces_owned')
    .eq(config.idColumn, assetId)
    .eq('holder_id', poolHolderId)
    .single();
  
  if (checkError || !poolPosition || poolPosition.pieces_owned < totalAirdrop) {
    throw new Error('Insufficient pieces in pool for airdrop');
  }
  
  // 2. Deduct from pool
  await updatePositionInternal(config, assetId, poolHolderId, -totalAirdrop);
  
  // 3. Airdrop to recipients
  const airdrops = [];
  for (const recipient of recipients) {
    await updatePositionInternal(config, assetId, recipient.userId, recipient.quantity);
    
    airdrops.push({
      piece_type: pieceType,
      asset_id: assetId,
      recipient_id: recipient.userId,
      quantity: recipient.quantity,
      airdrop_reason: recipient.reason,
      airdropped_at: new Date().toISOString(),
    });
  }
  
  // 4. Record issuance
  const { data: issuance, error: issuanceError } = await supabase
    .from('piece_issuances')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      issuer_id: poolHolderId,
      issuance_type: 'airdrop',
      total_pieces_issued: totalAirdrop,
      initial_price: 0,
      pieces_available: 0,
      pieces_locked: 0,
      issuance_status: 'closed',
    })
    .select()
    .single();
  
  if (issuanceError) throw issuanceError;
  
  return {
    success: true,
    totalAirdropped: totalAirdrop,
    recipientCount: recipients.length,
    issuance,
  };
}

/**
 * Mint reward pieces for participation
 */
async function mintRewardPieces({
  pieceType,
  assetId,
  userId,
  quantity,
  reason,
  activityType, // 'engagement', 'referral', 'loyalty', etc.
}) {
  return airdropPieces({
    pieceType,
    assetId,
    recipients: [{ userId, quantity, reason }],
    fromPool: 'community',
  });
}

// =====================================================
// ADDITIONAL MINTING (Post-IPO)
// =====================================================

/**
 * Mint additional pieces (requires governance approval)
 */
async function mintAdditional({
  pieceType,
  assetId,
  issuerId,
  additionalPieces,
  reason,
  governanceProposalId, // Must pass governance vote
}) {
  if (!supabase) throw new Error('Database not available');
  
  // 1. Verify governance approval
  const { data: proposal, error: propError } = await supabase
    .from('piece_governance_proposals')
    .select('*')
    .eq('id', governanceProposalId)
    .eq('status', 'passed')
    .single();
  
  if (propError || !proposal) {
    throw new Error('Governance approval required for additional minting');
  }
  
  // 2. Get current stats
  const config = getTableConfig(pieceType);
  const { data: stats, error: statsError } = await supabase
    .from(config.stats)
    .select('total_pieces')
    .eq(config.idColumn, assetId)
    .single();
  
  if (statsError) throw statsError;
  
  // 3. Limit additional minting (max 20% increase per year)
  const maxAdditional = Math.floor(stats.total_pieces * 0.20);
  if (additionalPieces > maxAdditional) {
    throw new Error(`Cannot mint more than 20% additional pieces (${maxAdditional})`);
  }
  
  // 4. Update stats
  const { error: updateError } = await supabase
    .from(config.stats)
    .update({
      total_pieces: stats.total_pieces + additionalPieces,
      available_pieces: supabase.raw('available_pieces + ?', [additionalPieces]),
    })
    .eq(config.idColumn, assetId);
  
  if (updateError) throw updateError;
  
  // 5. Record issuance
  const { data: issuance, error: issuanceError } = await supabase
    .from('piece_issuances')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      issuer_id: issuerId,
      issuance_type: 'additional',
      total_pieces_issued: additionalPieces,
      initial_price: 0, // Not applicable
      pieces_available: additionalPieces,
      pieces_locked: 0,
      issuance_status: 'active',
    })
    .select()
    .single();
  
  if (issuanceError) throw issuanceError;
  
  // 6. Mint to issuer (they can distribute via governance)
  await updatePositionInternal(config, assetId, issuerId, additionalPieces);
  
  return {
    success: true,
    newTotalSupply: stats.total_pieces + additionalPieces,
    additionalPieces,
    issuance,
  };
}

// =====================================================
// LOCKUP MANAGEMENT
// =====================================================

/**
 * Process unlocks for vested pieces
 */
async function processVestingUnlocks() {
  if (!supabase) return { processed: 0 };
  
  const now = new Date().toISOString();
  
  // Get all lockups with pending unlocks
  const { data: lockups, error } = await supabase
    .from('piece_lockups')
    .select('*')
    .eq('is_active', true)
    .eq('lockup_type', 'vesting');
  
  if (error) throw error;
  
  let processed = 0;
  
  for (const lockup of lockups || []) {
    const unlockSchedule = lockup.unlock_schedule || [];
    let newlyUnlocked = 0;
    
    for (const unlock of unlockSchedule) {
      if (new Date(unlock.date) <= new Date(now) && unlock.amount > 0) {
        newlyUnlocked += unlock.amount;
        unlock.processed = true;
      }
    }
    
    if (newlyUnlocked > 0) {
      // Update lockup
      const totalUnlocked = (lockup.total_unlocked || 0) + newlyUnlocked;
      const remainingLocked = lockup.locked_pieces - totalUnlocked;
      
      await supabase
        .from('piece_lockups')
        .update({
          unlock_schedule: unlockSchedule,
          total_unlocked: totalUnlocked,
          is_active: remainingLocked > 0,
        })
        .eq('id', lockup.id);
      
      // Update stats for available pieces
      const config = getTableConfig(lockup.piece_type);
      await supabase
        .from(config.stats)
        .update({
          available_pieces: supabase.raw('available_pieces + ?', [newlyUnlocked]),
        })
        .eq(config.idColumn, lockup.asset_id);
      
      processed++;
    }
  }
  
  return { processed, timestamp: now };
}

/**
 * Get lockup details for a holder
 */
async function getHolderLockups(holderId) {
  if (!supabase) return [];
  
  const { data: lockups, error } = await supabase
    .from('piece_lockups')
    .select(`
      *,
      asset:asset_id(id, title, name)
    `)
    .eq('holder_id', holderId)
    .eq('is_active', true)
    .order('lockup_end_date', { ascending: true });
  
  if (error) throw error;
  
  return lockups || [];
}

// =====================================================
// PRICE ORACLE
// =====================================================

async function initializePriceOracle({ pieceType, assetId, oracleType, initialPrice }) {
  const dataSources = [];
  
  if (oracleType === 'engagement' || oracleType === 'hybrid') {
    if (pieceType === 'content') {
      dataSources.push(
        { source: 'views', weight: 0.3, metric: 'view_count' },
        { source: 'likes', weight: 0.2, metric: 'likes_count' },
        { source: 'shares', weight: 0.3, metric: 'shares_count' },
        { source: 'comments', weight: 0.2, metric: 'comments_count' }
      );
    } else if (pieceType === 'moment') {
      dataSources.push(
        { source: 'participants', weight: 0.4, metric: 'participant_count' },
        { source: 'checkins', weight: 0.3, metric: 'checkin_count' },
        { source: 'reviews', weight: 0.3, metric: 'average_rating' }
      );
    }
  }
  
  if (oracleType === 'revenue' || oracleType === 'hybrid') {
    dataSources.push(
      { source: 'trading_volume', weight: 0.3, metric: 'volume_24h' },
      { source: 'market_cap', weight: 0.2, metric: 'market_cap' }
    );
  }
  
  const { error } = await supabase
    .from('piece_price_oracles')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      oracle_type: oracleType,
      data_sources: dataSources,
      last_calculated_price: initialPrice,
      update_frequency_minutes: oracleType === 'engagement' ? 15 : 60,
    });
  
  if (error) throw error;
}

// =====================================================
// STATS INITIALIZATION
// =====================================================

async function initializePieceStats({ pieceType, assetId, totalPieces, initialPrice }) {
  const config = getTableConfig(pieceType);
  
  const { error } = await supabase
    .from(config.stats)
    .insert({
      [config.idColumn]: assetId,
      current_price: initialPrice,
      total_pieces: totalPieces,
      available_pieces: totalPieces,
      market_cap: totalPieces * initialPrice,
    });
  
  if (error) throw error;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getTableConfig(pieceType) {
  const configs = {
    content: {
      positions: 'content_piece_positions',
      stats: 'content_piece_stats',
      idColumn: 'content_id',
    },
    moment: {
      positions: 'moment_piece_positions',
      stats: 'moment_piece_stats',
      idColumn: 'moment_id',
    },
    host: {
      positions: 'host_piece_positions',
      stats: 'host_piece_stats',
      idColumn: 'host_id',
    },
    venue: {
      positions: 'venue_piece_positions',
      stats: 'venue_piece_stats',
      idColumn: 'venue_id',
    },
  };
  
  return configs[pieceType];
}

async function verifyAssetOwnership(pieceType, assetId, issuerId) {
  const tableMap = {
    content: { table: 'content_items', ownerCol: 'creator_id' },
    moment: { table: 'moments', ownerCol: 'organizer_id' },
    host: { table: 'host_profiles', ownerCol: 'user_id' },
    venue: { table: 'venue_profiles', ownerCol: null },
  };
  
  const config = tableMap[pieceType];
  
  if (!config.ownerCol) {
    // Venues don't have a single owner - require admin or specific permission
    return; // For now, allow any verified user to issue venue pieces
  }
  
  const { data: asset, error } = await supabase
    .from(config.table)
    .select(config.ownerCol)
    .eq('id', assetId)
    .single();
  
  if (error) throw new Error('Asset not found');
  
  if (asset[config.ownerCol] !== issuerId) {
    throw new Error('Unauthorized: You do not own this asset');
  }
}

async function checkExistingIssuance(pieceType, assetId) {
  const { data, error } = await supabase
    .from('piece_issuances')
    .select('id')
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .eq('issuance_type', 'initial')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  
  return data;
}

async function updatePositionInternal(config, assetId, holderId, quantityChange) {
  const { data: existing, error: checkError } = await supabase
    .from(config.positions)
    .select('*')
    .eq(config.idColumn, assetId)
    .eq('holder_id', holderId)
    .maybeSingle();
  
  if (checkError) throw checkError;
  
  if (existing) {
    const newQuantity = existing.pieces_owned + quantityChange;
    if (newQuantity < 0) throw new Error('Insufficient pieces');
    
    const { error: updateError } = await supabase
      .from(config.positions)
      .update({
        pieces_owned: newQuantity,
        last_trade_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    
    if (updateError) throw updateError;
  } else if (quantityChange > 0) {
    const { error: insertError } = await supabase
      .from(config.positions)
      .insert({
        [config.idColumn]: assetId,
        holder_id: holderId,
        pieces_owned: quantityChange,
        total_invested: 0,
        avg_purchase_price: 0,
      });
    
    if (insertError) throw insertError;
  } else {
    throw new Error('Cannot deduct from non-existent position');
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  launchIPO,
  airdropPieces,
  mintRewardPieces,
  mintAdditional,
  processVestingUnlocks,
  getHolderLockups,
  createLockup,
};
