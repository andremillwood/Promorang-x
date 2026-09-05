/**
 * PromoCard Return from verified action.
 *
 * Records eligibility on the existing attention_recharge_events table.
 * Does not invent a dollar refill. Financial available_balance stays in the
 * canonical PromoCard row until a clearinghouse processor applies it.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');

async function recordEligibleReturn({ userId, actionType = 'check_in', referenceEntityId = null, db = serviceSupabase }) {
  if (!db || !userId) return { eligible: false, label: null, event: null };

  const card = await db.from('user_promo_cards').select('id, available_balance, monthly_limit').eq('user_id', userId).maybeSingle();
  if (card.error || !card.data) {
    return { eligible: false, label: null, event: null };
  }

  if (referenceEntityId) {
    const existing = await db
      .from('attention_recharge_events')
      .select('id, action_type, created_at')
      .eq('user_id', userId)
      .eq('reference_entity_id', referenceEntityId)
      .eq('action_type', actionType)
      .maybeSingle();
    if (existing.data) {
      return {
        eligible: true,
        label: 'PromoCard · eligible refill already recorded',
        event: existing.data,
        alreadyRecorded: true,
      };
    }
  }

  const inserted = await db
    .from('attention_recharge_events')
    .insert({
      user_id: userId,
      action_type: actionType,
      recharge_amount: 0,
      reference_entity_id: referenceEntityId,
    })
    .select()
    .maybeSingle();

  if (inserted.error) {
    console.warn('[PromoCard Return] eligibility write skipped:', inserted.error.message);
    return { eligible: false, label: null, event: null };
  }

  return {
    eligible: true,
    label: 'PromoCard · eligible refill',
    event: inserted.data,
    alreadyRecorded: false,
  };
}

module.exports = { recordEligibleReturn };
