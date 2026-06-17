const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

const TABLES = {
  content: { positions: 'content_piece_positions', stats: 'content_piece_stats', idColumn: 'content_id' },
  moment: { positions: 'moment_piece_positions', stats: 'moment_piece_stats', idColumn: 'moment_id' },
  host: { positions: 'host_piece_positions', stats: 'host_piece_stats', idColumn: 'host_id' },
  venue: { positions: 'venue_piece_positions', stats: 'venue_piece_stats', idColumn: 'venue_id' },
};

const EARNING_RULES = {
  moment_join: { pieceType: 'moment', quantity: 1, reason: 'early_participant' },
  moment_checkin: { pieceType: 'moment', quantity: 4, reason: 'verified_attendance' },
  moment_referral_join: { pieceType: 'moment', quantity: 2, reason: 'invited_participant_joined' },
  moment_referral_checkin: { pieceType: 'moment', quantity: 6, reason: 'invited_participant_checked_in' },
  content_mission_join: { pieceType: 'content', quantity: 1, reason: 'content_attributed_join' },
  content_distribution_checkin: { pieceType: 'content', quantity: 3, reason: 'content_attributed_checkin' },
  content_proof_verified: { pieceType: 'content', quantity: 5, reason: 'content_proof_verified' },
};

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function ensureStats(pieceType, assetId, earnedQuantity, holderDelta = 0) {
  const config = TABLES[pieceType];
  if (!config) throw new Error(`Unsupported piece type: ${pieceType}`);

  const { data: existing, error: readError } = await supabase
    .from(config.stats)
    .select('*')
    .eq(config.idColumn, assetId)
    .maybeSingle();

  if (readError) throw readError;

  const currentPrice = toNumber(existing?.current_price, 1);
  const totalPieces = toNumber(existing?.total_pieces, 0) + earnedQuantity;
  const holderCount = toNumber(existing?.holder_count, 0) + holderDelta;

  const payload = {
    [config.idColumn]: assetId,
    current_price: currentPrice,
    total_pieces: totalPieces,
    available_pieces: Math.max(toNumber(existing?.available_pieces, 0), 0),
    market_cap: Number((totalPieces * currentPrice).toFixed(8)),
    holder_count: holderCount,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(config.stats)
    .upsert(payload, { onConflict: config.idColumn });

  if (error) throw error;
}

async function updatePosition({ pieceType, assetId, userId, quantity }) {
  const config = TABLES[pieceType];
  if (!config) throw new Error(`Unsupported piece type: ${pieceType}`);

  const { data: existing, error: readError } = await supabase
    .from(config.positions)
    .select('*')
    .eq(config.idColumn, assetId)
    .eq('holder_id', userId)
    .maybeSingle();

  if (readError) throw readError;

  const piecesOwned = toNumber(existing?.pieces_owned, 0) + quantity;
  const payload = {
    [config.idColumn]: assetId,
    holder_id: userId,
    pieces_owned: piecesOwned,
    total_invested: toNumber(existing?.total_invested, 0),
    avg_purchase_price: toNumber(existing?.avg_purchase_price, 0),
    last_trade_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!existing) {
    payload.first_acquired_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from(config.positions)
    .upsert(payload, { onConflict: `${config.idColumn},holder_id` })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    _was_new_holder: !existing,
  };
}

async function recordEarning({ userId, pieceType, assetId, quantity, reason, sourceType, sourceId, metadata = {} }) {
  if (!supabase || !userId || !assetId || !sourceType || !sourceId) return null;

  const normalizedQuantity = toNumber(quantity);
  if (normalizedQuantity <= 0) return null;

  const { data: event, error: eventError } = await supabase
    .from('piece_earning_events')
    .insert({
      user_id: userId,
      piece_type: pieceType,
      asset_id: assetId,
      quantity: normalizedQuantity,
      reason,
      source_type: sourceType,
      source_id: String(sourceId),
      metadata,
    })
    .select()
    .single();

  if (eventError) {
    if (eventError.code === '23505') {
      return { duplicate: true };
    }
    throw eventError;
  }

  const position = await updatePosition({
    pieceType,
    assetId,
    userId,
    quantity: normalizedQuantity,
  });

  await ensureStats(pieceType, assetId, normalizedQuantity, position?._was_new_holder ? 1 : 0);

  return {
    event,
    position: position ? Object.fromEntries(Object.entries(position).filter(([key]) => key !== '_was_new_holder')) : null,
  };
}

async function awardRule(ruleKey, { userId, assetId, sourceId, metadata = {}, quantity } = {}) {
  const rule = EARNING_RULES[ruleKey];
  if (!rule) throw new Error(`Unknown piece earning rule: ${ruleKey}`);

  return recordEarning({
    userId,
    pieceType: rule.pieceType,
    assetId,
    quantity: quantity || rule.quantity,
    reason: rule.reason,
    sourceType: ruleKey,
    sourceId,
    metadata,
  });
}

async function awardMomentJoin({ momentId, userId, invitedByUserId = null, sourceContentId = null, metadata = {} }) {
  const awards = [];

  awards.push(await awardRule('moment_join', {
    userId,
    assetId: momentId,
    sourceId: `${momentId}:${userId}`,
    metadata,
  }));

  if (sourceContentId) {
    awards.push(await awardRule('content_mission_join', {
      userId,
      assetId: sourceContentId,
      sourceId: `${momentId}:${userId}`,
      metadata,
    }));
  }

  if (invitedByUserId && invitedByUserId !== userId) {
    awards.push(await awardRule('moment_referral_join', {
      userId: invitedByUserId,
      assetId: momentId,
      sourceId: `${momentId}:${userId}`,
      metadata: { ...metadata, referred_user_id: userId },
    }));
  }

  return awards.filter(Boolean);
}

async function awardMomentCheckIn({ momentId, userId, invitedByUserId = null, sourceContentId = null, metadata = {} }) {
  const awards = [];

  awards.push(await awardRule('moment_checkin', {
    userId,
    assetId: momentId,
    sourceId: `${momentId}:${userId}`,
    metadata,
  }));

  if (sourceContentId) {
    awards.push(await awardRule('content_distribution_checkin', {
      userId,
      assetId: sourceContentId,
      sourceId: `${momentId}:${userId}`,
      metadata,
    }));
  }

  if (invitedByUserId && invitedByUserId !== userId) {
    awards.push(await awardRule('moment_referral_checkin', {
      userId: invitedByUserId,
      assetId: momentId,
      sourceId: `${momentId}:${userId}`,
      metadata: { ...metadata, referred_user_id: userId },
    }));
  }

  return awards.filter(Boolean);
}

async function awardContentProofVerified({ contentId, userId, proofSubmissionId, metadata = {} }) {
  if (!contentId) return null;

  return awardRule('content_proof_verified', {
    userId,
    assetId: contentId,
    sourceId: proofSubmissionId,
    metadata,
  });
}

module.exports = {
  EARNING_RULES,
  recordEarning,
  awardRule,
  awardMomentJoin,
  awardMomentCheckIn,
  awardContentProofVerified,
};
