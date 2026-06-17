const { supabase: serviceSupabase } = require('../lib/supabase');
const economyService = require('./economyService');

const supabase = global.supabase || serviceSupabase || null;

function normalizeObjectId(objectId) {
  return String(objectId);
}

function normalizeAccessQuote(row, fallbackKeyCost = 0) {
  if (!row) return null;

  const keyCostMultiplier = Number(row.key_cost_multiplier || 1);
  const hasRule = Boolean(row.rule_id);
  const fallbackRawCost = Math.max(0, Number(fallbackKeyCost || 0));
  const fallbackFinalCost = Math.ceil(fallbackRawCost * keyCostMultiplier);

  if (!hasRule && fallbackRawCost > 0) {
    return {
      ...row,
      base_key_cost: fallbackRawCost,
      raw_key_cost: fallbackRawCost,
      final_key_cost: row.already_unlocked ? 0 : fallbackFinalCost,
      fallback_applied: true,
    };
  }

  return {
    ...row,
    base_key_cost: Number(row.base_key_cost || 0),
    raw_key_cost: Number(row.raw_key_cost || 0),
    final_key_cost: Number(row.final_key_cost || 0),
    fallback_applied: false,
  };
}

async function getAccessQuote({
  userId,
  objectType,
  objectId,
  accessType = 'join',
  fallbackKeyCost = 0,
}) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase.rpc('calculate_access_key_cost', {
    p_user_id: userId,
    p_object_type: objectType,
    p_object_id: normalizeObjectId(objectId),
    p_access_type: accessType,
  });

  if (error) throw error;
  return normalizeAccessQuote(Array.isArray(data) ? data[0] : data, fallbackKeyCost);
}

async function consumeAccess({
  userId,
  objectType,
  objectId,
  accessType = 'join',
  fallbackKeyCost = 0,
  source = null,
  description = null,
  metadata = {},
}) {
  const quote = await getAccessQuote({
    userId,
    objectType,
    objectId,
    accessType,
    fallbackKeyCost,
  });

  if (!quote) throw new Error('Unable to calculate access cost');

  if (!quote.allowed) {
    const error = new Error(quote.denial_reason || 'Access is not available');
    error.statusCode = quote.denial_reason === 'capacity_full' ? 409 : 403;
    error.code = quote.denial_reason || 'ACCESS_DENIED';
    error.payload = { access_quote: quote };
    throw error;
  }

  let spentKeys = 0;
  if (!quote.already_unlocked && quote.final_key_cost > 0) {
    spentKeys = quote.final_key_cost;
    try {
      await economyService.spendCurrency(
        userId,
        'promokeys',
        quote.final_key_cost,
        source || `access_${accessType}`,
        `${objectType}:${normalizeObjectId(objectId)}`,
        description || `Unlocked ${accessType} access`
      );
    } catch (spendError) {
      if (String(spendError?.message || '').toLowerCase().includes('insufficient')) {
        const error = new Error('Not enough Keys to unlock this access');
        error.statusCode = 402;
        error.code = 'ACCESS_KEYS_REQUIRED';
        error.payload = { access_quote: quote };
        throw error;
      }
      throw spendError;
    }
  }

  const { data, error } = await supabase.rpc('record_access_unlock', {
    p_user_id: userId,
    p_object_type: objectType,
    p_object_id: normalizeObjectId(objectId),
    p_access_type: accessType,
    p_keys_spent: quote.already_unlocked ? 0 : quote.final_key_cost,
    p_tier_key: quote.tier_key,
    p_metadata: {
      ...metadata,
      access_quote: quote,
    },
  });

  if (error) {
    if (spentKeys > 0) {
      try {
        await economyService.addCurrency(
          userId,
          'promokeys',
          spentKeys,
          'access_unlock_refund',
          `${objectType}:${normalizeObjectId(objectId)}`,
          `Refunded failed ${accessType} access unlock`
        );
      } catch (refundError) {
        console.error('[Access Rules] Failed to refund Keys after access unlock record error:', refundError);
      }
    }
    throw error;
  }

  return {
    quote,
    unlock: Array.isArray(data) ? data[0] : data,
  };
}

module.exports = {
  getAccessQuote,
  consumeAccess,
};
