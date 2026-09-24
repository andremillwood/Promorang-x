const { supabase: serviceSupabase } = require('../lib/supabase');

const EVIDENCE_ORDER = ['view', 'vote', 'want', 'share', 'rsvp', 'reservation', 'purchase', 'attendance', 'redemption', 'repeat_purchase'];
const PAYOUT_BUCKETS = new Set(['distributor', 'service_provider', 'agency', 'operator']);

function evidenceAtLeast(actual, required) {
  return EVIDENCE_ORDER.indexOf(actual) >= EVIDENCE_ORDER.indexOf(required);
}

function evidenceFromReceipt(receipt = {}) {
  if (receipt.receipt_type === 'redemption' || receipt.status === 'fulfilled') return 'redemption';
  if (receipt.receipt_type === 'purchase') return 'purchase';
  if (receipt.receipt_type === 'reservation') return 'reservation';
  return receipt.receipt_type === 'refund' ? 'purchase' : 'view';
}

function normalizeAttribution(receipt = {}) {
  const metadata = receipt.attribution || {};
  return {
    proposalId: receipt.proposal_id || metadata.proposal_id || metadata.activation_proposal_id || null,
    promoPushCampaignId: receipt.promopush_campaign_id || metadata.promopush_campaign_id || metadata.campaign_id || null,
    promoPushChannelId: receipt.promopush_channel_id || metadata.promopush_channel_id || metadata.channel_id || null,
    trackingCode: metadata.promopush_tracking_code || metadata.tracking_code || null,
    referralCode: receipt.referral_code || metadata.referral_code || null,
  };
}

function ruleAmount(rule, grossAmount) {
  if (rule.amount != null) return Number(rule.amount);
  if (rule.percentage != null) return Number((Number(grossAmount) * Number(rule.percentage) / 100).toFixed(2));
  return 0;
}

function planAllocations({ receipt, rules = [] }) {
  const evidence = evidenceFromReceipt(receipt);
  const gross = Number(receipt.amount || 0);
  if (receipt.receipt_type === 'refund') return [];

  const allocations = rules
    .filter((rule) => rule.active !== false && rule.funded === true)
    .filter((rule) => evidenceAtLeast(evidence, rule.required_evidence || 'purchase'))
    .map((rule) => ({
      rule_id: rule.id,
      bucket: rule.bucket,
      recipient_user_id: rule.recipient_user_id || null,
      amount: ruleAmount(rule, gross),
      currency: receipt.currency,
      evidence_level: evidence,
      status: 'earned',
    }))
    .filter((allocation) => allocation.amount > 0);

  const allocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  if (allocated > gross + 0.0001) throw new Error('Configured commercial allocations exceed the transaction amount');
  return allocations;
}

async function resolveProposal(db, attribution) {
  if (attribution.proposalId) return attribution.proposalId;
  if (!attribution.promoPushCampaignId && !attribution.promoPushChannelId && !attribution.trackingCode) return null;

  let campaignId = attribution.promoPushCampaignId;
  if (!campaignId) {
    let query = db.from('promopush_channels').select('campaign_id');
    query = attribution.promoPushChannelId
      ? query.eq('id', attribution.promoPushChannelId)
      : query.eq('tracking_code', attribution.trackingCode);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    campaignId = data?.campaign_id || null;
  }
  if (!campaignId) return null;
  const { data, error } = await db.from('promopush_campaigns').select('proposal_id').eq('id', campaignId).maybeSingle();
  if (error) throw error;
  return data?.proposal_id || null;
}

async function reverseAllocations(db, receipt) {
  const sourceReceiptId = receipt.source_receipt_id || receipt.attribution?.source_receipt_id || (receipt.status === 'refunded' ? receipt.id : null);
  if (!sourceReceiptId) return { reversed: 0 };
  const { data: allocations, error } = await db.from('activation_commercial_allocations').select('*').eq('receipt_id', sourceReceiptId).neq('status', 'reversed');
  if (error) throw error;
  let reversed = 0;
  for (const allocation of allocations || []) {
    const { error: updateError } = await db.from('activation_commercial_allocations').update({
      status: 'reversed',
      reversed_by_receipt_id: receipt.id,
      reversed_at: new Date().toISOString(),
    }).eq('id', allocation.id).neq('status', 'reversed');
    if (updateError) throw updateError;
    if (allocation.payout_allocation_id) {
      const { error: payoutError } = await db.from('activation_payout_allocations').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', allocation.payout_allocation_id).in('status', ['planned', 'funded', 'earned', 'queued']);
      if (payoutError) throw payoutError;
    }
    reversed += 1;
  }
  return { reversed };
}

async function processCommerceReceipt(receipt, options = {}) {
  const db = options.db || global.supabase || serviceSupabase;
  if (!db || !receipt?.id) return { processed: false };
  if (receipt.receipt_type === 'refund' || receipt.status === 'refunded') return { processed: true, ...(await reverseAllocations(db, receipt)) };

  const attribution = normalizeAttribution(receipt);
  const proposalId = await resolveProposal(db, attribution);
  if (!proposalId) return { processed: false, reason: 'no_activation' };

  const receiptPatch = {
    proposal_id: proposalId,
    promopush_campaign_id: attribution.promoPushCampaignId,
    promopush_channel_id: attribution.promoPushChannelId,
    referral_code: attribution.referralCode,
  };
  const { error: receiptError } = await db.from('commerce_receipts').update(receiptPatch).eq('id', receipt.id);
  if (receiptError) throw receiptError;

  const { data: rules, error: rulesError } = await db.from('activation_commercial_rules').select('*').eq('proposal_id', proposalId).eq('active', true);
  if (rulesError) throw rulesError;
  const allocations = planAllocations({ receipt, rules: rules || [] });
  const created = [];

  for (const allocation of allocations) {
    let payoutId = null;
    if (PAYOUT_BUCKETS.has(allocation.bucket) && allocation.recipient_user_id) {
      const { data: existingPayout, error: existingPayoutError } = await db.from('activation_payout_allocations')
        .select('id').eq('proposal_id', proposalId).eq('recipient_user_id', allocation.recipient_user_id)
        .contains('metadata', { commerce_receipt_id: receipt.id, commercial_rule_id: allocation.rule_id }).maybeSingle();
      if (existingPayoutError) throw existingPayoutError;
      if (existingPayout) payoutId = existingPayout.id;
      else {
        const { data: payout, error: payoutError } = await db.from('activation_payout_allocations').insert({
          proposal_id: proposalId,
          recipient_user_id: allocation.recipient_user_id,
          purpose: `${allocation.bucket} allocation for receipt ${receipt.id}`,
          amount: allocation.amount,
          currency: allocation.currency,
          release_condition: `Verified ${allocation.evidence_level} recorded on commerce receipt`,
          status: 'earned',
          earned_at: new Date().toISOString(),
          metadata: { commerce_receipt_id: receipt.id, commercial_rule_id: allocation.rule_id },
        }).select('id').maybeSingle();
        if (payoutError) throw payoutError;
        payoutId = payout?.id || null;
      }
    }
    const { data, error } = await db.from('activation_commercial_allocations').upsert({
      proposal_id: proposalId,
      receipt_id: receipt.id,
      rule_id: allocation.rule_id,
      payout_allocation_id: payoutId,
      bucket: allocation.bucket,
      recipient_user_id: allocation.recipient_user_id,
      amount: allocation.amount,
      currency: allocation.currency,
      evidence_level: allocation.evidence_level,
      status: allocation.status,
      earned_at: new Date().toISOString(),
    }, { onConflict: 'receipt_id,rule_id' }).select().maybeSingle();
    if (error) throw error;
    if (data) created.push(data);
  }
  return { processed: true, proposalId, allocations: created };
}

module.exports = { evidenceAtLeast, evidenceFromReceipt, normalizeAttribution, planAllocations, processCommerceReceipt };
