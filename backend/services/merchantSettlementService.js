const { supabase: serviceSupabase } = require('../lib/supabase');
const stripeService = require('./stripeService');

const supabase = global.supabase || serviceSupabase || null;

async function releaseOrderSettlement(orderId) {
  if (!supabase || !orderId) return null;
  const { data, error } = await supabase.from('merchant_settlement_ledger').update({
    status: 'pending',
    updated_at: new Date().toISOString(),
  }).eq('order_id', orderId).eq('entry_type', 'sale').eq('status', 'blocked').select().maybeSingle();
  if (error) throw error;
  return data;
}

async function processDueSettlements(limit = 25) {
  if (!supabase || !stripeService.isStripeConfigured()) return { processed: 0, paid: 0, blocked: 0 };
  const { data: entries, error } = await supabase.from('merchant_settlement_ledger')
    .select('*').eq('status', 'pending').lte('available_at', new Date().toISOString())
    .order('available_at', { ascending: true }).limit(limit);
  if (error) throw error;

  const result = { processed: 0, paid: 0, blocked: 0, failed: 0 };
  for (const entry of entries || []) {
    result.processed += 1;
    try {
      const { data: method, error: methodError } = await supabase.from('user_payout_methods')
        .select('stripe_account_id').eq('user_id', entry.merchant_id)
        .eq('method_type', 'stripe_connect').eq('stripe_account_status', 'active')
        .eq('stripe_payouts_enabled', true).order('is_default', { ascending: false })
        .limit(1).maybeSingle();
      if (methodError) throw methodError;
      if (!method?.stripe_account_id) {
        await supabase.from('merchant_settlement_ledger').update({
          status: 'blocked',
          metadata: { ...(entry.metadata || {}), blocked_reason: 'stripe_connect_not_ready' },
          updated_at: new Date().toISOString(),
        }).eq('id', entry.id);
        result.blocked += 1;
        continue;
      }

      const transfer = await stripeService.createPayout(
        method.stripe_account_id,
        Number(entry.net_amount),
        entry.currency,
        { settlement_id: entry.id, order_id: entry.order_id },
        { idempotencyKey: entry.idempotency_key },
      );
      await supabase.from('merchant_settlement_ledger').update({
        status: 'paid',
        stripe_connected_account_id: method.stripe_account_id,
        stripe_transfer_id: transfer.transferId,
        updated_at: new Date().toISOString(),
      }).eq('id', entry.id);
      result.paid += 1;
    } catch (error) {
      await supabase.from('merchant_settlement_ledger').update({
        status: 'failed',
        metadata: { ...(entry.metadata || {}), failure: error.message },
        updated_at: new Date().toISOString(),
      }).eq('id', entry.id);
      result.failed += 1;
    }
  }
  return result;
}

async function reverseOrderSettlement(orderId, amount = null) {
  if (!supabase || !orderId) return null;
  const { data: sale, error } = await supabase.from('merchant_settlement_ledger')
    .select('*').eq('order_id', orderId).eq('entry_type', 'sale').maybeSingle();
  if (error) throw error;
  if (!sale) return null;

  const reversalAmount = Math.min(Number(amount ?? sale.net_amount), Number(sale.net_amount));
  let reversal = null;
  if (sale.status === 'paid' && sale.stripe_transfer_id) {
    reversal = await stripeService.reverseTransfer(
      sale.stripe_transfer_id,
      reversalAmount,
      { settlement_id: sale.id, order_id: orderId },
      { idempotencyKey: `settlement:${sale.id}:reversal:${reversalAmount}` },
    );
  }
  await supabase.from('merchant_settlement_ledger').update({
    status: reversalAmount >= Number(sale.net_amount) ? 'reversed' : sale.status,
    stripe_transfer_reversal_id: reversal?.id || sale.stripe_transfer_reversal_id,
    updated_at: new Date().toISOString(),
  }).eq('id', sale.id);
  await supabase.from('merchant_settlement_ledger').upsert({
    order_id: orderId,
    merchant_id: sale.merchant_id,
    entry_type: 'refund',
    gross_amount: -reversalAmount,
    platform_fee: 0,
    net_amount: -reversalAmount,
    currency: sale.currency,
    status: reversal ? 'paid' : 'reversed',
    available_at: new Date().toISOString(),
    stripe_connected_account_id: sale.stripe_connected_account_id,
    stripe_transfer_reversal_id: reversal?.id || null,
    idempotency_key: `commerce-order:${orderId}:refund:${reversalAmount}`,
  }, { onConflict: 'idempotency_key' });
  return reversal;
}

module.exports = { releaseOrderSettlement, processDueSettlements, reverseOrderSettlement };
