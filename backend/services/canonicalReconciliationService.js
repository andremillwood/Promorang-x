const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

async function countQuery(query) {
  const { count, error } = await query;
  if (error) throw error;
  return Number(count || 0);
}

async function domainCount(spec, since) {
  switch (spec.key) {
    case 'offer_redemption':
      return countQuery(supabase.from('offer_issuances').select('*', { count: 'exact', head: true }).eq('status', 'redeemed').gte('redeemed_at', since));
    case 'proof_submitted':
      return countQuery(supabase.from('proof_submissions').select('*', { count: 'exact', head: true }).gte('created_at', since));
    case 'proof_verified':
      return countQuery(supabase.from('proof_submissions').select('*', { count: 'exact', head: true }).eq('submission_state', 'verified').gte('reviewed_at', since));
    case 'proof_rejected':
      return countQuery(supabase.from('proof_submissions').select('*', { count: 'exact', head: true }).eq('submission_state', 'rejected').gte('reviewed_at', since));
    case 'payout_queued':
      return countQuery(supabase.from('manual_payout_queue').select('*', { count: 'exact', head: true }).gte('created_at', since));
    case 'payout_paid':
      return countQuery(supabase.from('manual_payout_queue').select('*', { count: 'exact', head: true }).eq('status', 'paid').gte('paid_at', since));
    case 'guest_rsvp':
      return countQuery(supabase.from('guest_moment_rsvps').select('*', { count: 'exact', head: true }).gte('created_at', since));
    case 'guest_attendance':
      return countQuery(supabase.from('guest_attendance_receipts').select('*', { count: 'exact', head: true }).in('status', ['verified', 'claimed']).gte('verified_at', since));
    case 'commerce_purchase_recorded':
      return countQuery(supabase.from('commerce_receipts').select('*', { count: 'exact', head: true }).eq('receipt_type', 'purchase').gte('occurred_at', since));
    case 'commerce_purchase_fulfilled':
      return countQuery(supabase.from('commerce_receipts').select('*', { count: 'exact', head: true }).eq('receipt_type', 'purchase').eq('status', 'fulfilled').gte('occurred_at', since));
    case 'creator_value':
      return countQuery(supabase.from('creator_earnings_ledger').select('*', { count: 'exact', head: true }).gte('created_at', since));
    default:
      throw new Error(`Unsupported reconciliation key: ${spec.key}`);
  }
}

async function canonicalCount(eventName, since) {
  return countQuery(
    supabase.from('canonical_events').select('*', { count: 'exact', head: true }).eq('event_name', eventName).gte('occurred_at', since),
  );
}

const RECONCILIATION_SPECS = Object.freeze([
  { key: 'offer_redemption', event: 'offer.redemption.verified' },
  { key: 'proof_submitted', event: 'proof.submission.observed' },
  { key: 'proof_verified', event: 'proof.review.verified' },
  { key: 'proof_rejected', event: 'proof.review.rejected' },
  { key: 'payout_queued', event: 'settlement.payout.queued' },
  { key: 'payout_paid', event: 'settlement.payout.paid' },
  { key: 'guest_rsvp', event: 'attendance.rsvp.observed' },
  { key: 'guest_attendance', event: 'attendance.guest.verified' },
  { key: 'commerce_purchase_recorded', event: 'commerce.purchase.recorded' },
  { key: 'commerce_purchase_fulfilled', event: 'commerce.purchase.fulfilled' },
  { key: 'creator_value', event: 'creator.value.attributed' },
]);

function evaluateRow(spec, sourceCount, eventCount) {
  const delta = eventCount - sourceCount;
  const coverage = sourceCount === 0 ? (eventCount === 0 ? 1 : 0) : Math.min(eventCount / sourceCount, 1);
  return {
    key: spec.key,
    event_name: spec.event,
    source_count: sourceCount,
    canonical_count: eventCount,
    delta,
    coverage: Number(coverage.toFixed(4)),
    status: delta === 0 ? 'reconciled' : eventCount < sourceCount ? 'missing_events' : 'extra_events',
  };
}

async function reconcile({ since }) {
  if (!supabase) throw new Error('Database not available');
  if (!since) throw new Error('Reconciliation requires an explicit since timestamp');
  const parsed = new Date(since);
  if (Number.isNaN(parsed.getTime())) throw new Error('Invalid reconciliation since timestamp');
  const isoSince = parsed.toISOString();

  const rows = [];
  for (const spec of RECONCILIATION_SPECS) {
    const [sourceCount, eventCount] = await Promise.all([
      domainCount(spec, isoSince),
      canonicalCount(spec.event, isoSince),
    ]);
    rows.push(evaluateRow(spec, sourceCount, eventCount));
  }

  const missing = rows.filter((row) => row.status === 'missing_events');
  const extra = rows.filter((row) => row.status === 'extra_events');
  return {
    since: isoSince,
    checked_at: new Date().toISOString(),
    status: missing.length === 0 && extra.length === 0 ? 'reconciled' : 'attention_required',
    missing_event_families: missing.length,
    extra_event_families: extra.length,
    rows,
  };
}

module.exports = { RECONCILIATION_SPECS, evaluateRow, reconcile };
