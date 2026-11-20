const { supabase: serviceSupabase } = require('../lib/supabase');

function roundMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

// A Stripe refund reverses the PromoCard benefit spend, not the cash total.
// Full refunds return the whole spend. Partial refunds return the same share.
function promoCardReversalTarget({ spendAmount, orderTotal, refundedAmount, fullyRefunded = false }) {
  const spend = roundMoney(Math.abs(Number(spendAmount)));
  if (spend <= 0) return 0;
  const total = roundMoney(orderTotal);
  const refunded = roundMoney(refundedAmount);
  if (fullyRefunded || (total > 0 && refunded >= total)) return spend;
  if (total <= 0 || refunded <= 0) return 0;
  return roundMoney(Math.min(spend, (spend * refunded) / total));
}

function ledgerUnavailable(error) {
  const code = error?.code || '';
  const message = error?.message || '';
  return code === 'PGRST202'
    || code === 'PGRST205'
    || code === '42P01'
    || code === '42883'
    || /schema cache/i.test(message)
    || /post_promocard_ledger/i.test(message)
    || (/promocard_ledger/i.test(message) && /does not exist/i.test(message));
}

async function postPromoCardSpendReversal({
  db = serviceSupabase,
  order,
  refundedAmount,
  fullyRefunded = false,
} = {}) {
  if (!db || !order?.id) return { posted: false, reason: 'missing_order' };

  const spendResult = await db
    .from('promocard_ledger')
    .select('id,user_id,amount,is_test,moment_id,venue_id,issuance_id')
    .eq('order_id', order.id)
    .eq('entry_type', 'spend')
    .maybeSingle();
  if (spendResult.error) {
    if (ledgerUnavailable(spendResult.error)) return { posted: false, reason: 'ledger_unavailable' };
    throw spendResult.error;
  }
  const spend = spendResult.data;
  if (!spend) return { posted: false, reason: 'no_spend' };

  const prior = await db
    .from('promocard_ledger')
    .select('amount')
    .eq('related_entry_id', spend.id)
    .eq('entry_type', 'reversal_refund');
  if (prior.error) {
    if (ledgerUnavailable(prior.error)) return { posted: false, reason: 'ledger_unavailable' };
    throw prior.error;
  }
  const already = roundMoney((prior.data || []).reduce((sum, row) => sum + Number(row.amount || 0), 0));
  const target = promoCardReversalTarget({
    spendAmount: spend.amount,
    orderTotal: order.total_amount,
    refundedAmount,
    fullyRefunded,
  });
  const delta = roundMoney(target - already);
  if (delta <= 0) return { posted: false, reason: 'already_reversed', target, already };

  const cents = Math.round(roundMoney(refundedAmount) * 100);
  const posted = await db.rpc('post_promocard_ledger', {
    p_user_id: spend.user_id,
    p_entry_type: 'reversal_refund',
    p_amount: delta,
    p_idempotency_key: `reversal_refund:${order.id}:${cents}`,
    p_order_id: order.id,
    p_issuance_id: spend.issuance_id,
    p_related_entry_id: spend.id,
    p_moment_id: spend.moment_id,
    p_venue_id: spend.venue_id,
    p_is_test: Boolean(spend.is_test),
    p_created_by: 'system',
    p_metadata: {
      reason: 'order_refund',
      refunded_amount: roundMoney(refundedAmount),
      fully_refunded: Boolean(fullyRefunded) || roundMoney(refundedAmount) >= roundMoney(order.total_amount),
    },
  });
  if (posted.error) {
    if (ledgerUnavailable(posted.error)) return { posted: false, reason: 'ledger_unavailable' };
    throw posted.error;
  }
  return { posted: true, entry: posted.data, delta, target };
}

module.exports = {
  roundMoney,
  promoCardReversalTarget,
  postPromoCardSpendReversal,
};
