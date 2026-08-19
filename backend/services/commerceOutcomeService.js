const { supabase: serviceSupabase } = require('../lib/supabase');
const promoShareService = require('./promoShareService');
const pieceEarningService = require('./pieceEarningService');
const demandEventService = require('./demandEventService');

const supabase = global.supabase || serviceSupabase || null;

async function processReceipt(receipt) {
  if (!supabase || !receipt?.id || !receipt?.user_id) return { processed: false };
  const attribution = receipt.attribution || {};
  if (attribution.outcomes_processed_at) return { processed: true, idempotent: true };
  const momentId = receipt.moment_id || attribution.moment_id || attribution.linked_moment_id || null;
  const contentId = receipt.content_id || attribution.content_id || attribution.source_content_id || null;
  const outcomes = { ticket: null, moment_piece: null, content_piece: null };

  try { outcomes.ticket = await promoShareService.awardTicket(receipt.user_id, 'purchase', receipt.id, 1); } catch (error) { console.warn('[Commerce Outcome] Ticket skipped:', error.message); }
  if (momentId) {
    try { outcomes.moment_piece = await pieceEarningService.recordEarning({ userId: receipt.user_id, pieceType: 'moment', assetId: momentId, quantity: 1, reason: 'moment_purchase', sourceType: 'commerce_receipt', sourceId: receipt.id, metadata: { listing_id: receipt.listing_id, amount: receipt.amount } }); } catch (error) { console.warn('[Commerce Outcome] Moment Piece skipped:', error.message); }
  }
  if (contentId) {
    try { outcomes.content_piece = await pieceEarningService.recordEarning({ userId: receipt.user_id, pieceType: 'content', assetId: contentId, quantity: 1, reason: 'content_attributed_purchase', sourceType: 'commerce_receipt', sourceId: receipt.id, metadata: { moment_id: momentId, listing_id: receipt.listing_id } }); } catch (error) { console.warn('[Commerce Outcome] Content Piece skipped:', error.message); }
  }

  const commerceOutcomes = {
    promoshare_ticket: outcomes.ticket ? { awarded: true, id: outcomes.ticket.id || null, quantity: 1 } : { awarded: false },
    moment_piece: outcomes.moment_piece ? { awarded: true, event_id: outcomes.moment_piece.event?.id || null, quantity: 1, asset_id: momentId } : { awarded: false },
    content_piece: outcomes.content_piece ? { awarded: true, event_id: outcomes.content_piece.event?.id || null, quantity: 1, asset_id: contentId } : { awarded: false },
  };
  await supabase.from('commerce_receipts').update({ attribution: { ...attribution, moment_id: momentId, content_id: contentId, outcomes_processed_at: new Date().toISOString(), promoshare_ticket_id: outcomes.ticket?.id || null, commerce_outcomes: commerceOutcomes } }).eq('id', receipt.id);
  const campaignId = receipt.campaign_id || attribution.campaign_id || null;
  if (campaignId) {
    try {
      const recorded = await demandEventService.recordEvent({
        campaignId,
        actorUserId: receipt.user_id,
        eventType: 'purchase_completed',
        sourceSystem: 'commerce_receipts',
        sourceReference: receipt.id,
        channel: attribution.source || 'promorang_commerce',
        valueAmount: Number(receipt.amount || 0),
        valueCurrency: receipt.currency || attribution.currency || 'JMD',
        verified: true,
        properties: { moment_id: momentId, content_id: contentId, listing_id: receipt.listing_id || null },
      });
      if (recorded.event?.demand_plan_id) {
        const { count, error: countError } = await supabase.from('demand_events').select('id', { count: 'exact', head: true }).eq('demand_plan_id', recorded.event.demand_plan_id).eq('actor_user_id', receipt.user_id).eq('event_type', 'purchase_completed').eq('verified', true);
        if (countError) throw countError;
        if (Number(count || 0) > 1) await demandEventService.recordEvent({ campaignId, actorUserId: receipt.user_id, eventType: 'repeat_purchase', sourceSystem: 'commerce_receipts', sourceReference: receipt.id, channel: attribution.source || 'promorang_commerce', verified: true, properties: { purchase_event_id: recorded.event.id } });
      }
    } catch (error) { console.warn('[Commerce Outcome] Demand event skipped:', error.message); }
  }
  return { processed: true, outcomes };
}

module.exports = { processReceipt };
