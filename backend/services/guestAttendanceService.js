const { supabase } = require('../lib/supabase');
const promoShareService = require('./promoShareService');
const pieceEarningService = require('./pieceEarningService');
const notificationService = require('./notificationService');
const demandEventService = require('./demandEventService');

async function recordVerifiedAttendance(rsvp, operatorId, method = 'manual') {
  const now = rsvp.checked_in_at || new Date().toISOString();
  const { data, error } = await supabase.from('guest_attendance_receipts').upsert({ rsvp_id: rsvp.id, moment_id: rsvp.moment_id, user_id: rsvp.user_id || null, status: rsvp.user_id ? 'claimed' : 'verified', verification_method: method, verified_by: operatorId, verified_at: now, claimed_at: rsvp.user_id ? now : null, updated_at: now }, { onConflict: 'rsvp_id' }).select().single();
  if (error) throw error;
  try {
    await demandEventService.recordEvent({
      momentId: rsvp.moment_id,
      actorUserId: rsvp.user_id || null,
      anonymousId: rsvp.user_id ? null : `guest-rsvp:${rsvp.id}`,
      eventType: 'checked_in',
      sourceSystem: 'guest_attendance_receipts',
      sourceReference: data.id,
      channel: method,
      verified: true,
      properties: { guest_count: rsvp.guest_count || 1, claimed: Boolean(rsvp.user_id) },
    });
  } catch (demandError) { console.warn('[Guest Attendance] demand attendance mirror skipped:', demandError.message); }
  if (rsvp.user_id) return processClaimedAttendance(data, rsvp.user_id);
  return data;
}

async function processClaimedAttendance(receiptOrId, userId) {
  const { data: receipt, error } = typeof receiptOrId === 'string'
    ? await supabase.from('guest_attendance_receipts').select('*').eq('id', receiptOrId).single()
    : { data: receiptOrId, error: null };
  if (error || !receipt) throw error || new Error('Attendance receipt not found');
  if (receipt.outcomes?.processed_at) return receipt;
  const outcomes = { promoshare_ticket: { awarded: false }, moment_piece: { awarded: false } };
  try {
    const ticket = await promoShareService.awardTicket(userId, 'moment_attendance', receipt.id, 1);
    if (ticket) outcomes.promoshare_ticket = { awarded: true, id: ticket.id, quantity: 1, cycle_id: ticket.cycle_id };
  } catch (error) { console.warn('[Guest Attendance] PromoShare ticket skipped:', error.message); }
  try {
    const pieces = await pieceEarningService.awardMomentCheckIn({ momentId: receipt.moment_id, userId, metadata: { guest_rsvp_id: receipt.rsvp_id, attendance_receipt_id: receipt.id } });
    const momentAward = pieces.find(item => item?.event?.piece_type === 'moment');
    if (momentAward) outcomes.moment_piece = { awarded: true, event_id: momentAward.event.id, quantity: momentAward.event.quantity, asset_id: receipt.moment_id };
  } catch (error) { console.warn('[Guest Attendance] Moment Piece skipped:', error.message); }
  outcomes.processed_at = new Date().toISOString();
  const { data, error: updateError } = await supabase.from('guest_attendance_receipts').update({ user_id: userId, status: 'claimed', claimed_at: new Date().toISOString(), outcomes, updated_at: new Date().toISOString() }).eq('id', receipt.id).select().single();
  if (updateError) throw updateError;
  notificationService.sendToUser(userId, { title: 'Your attendance counted', body: 'Your verified Moment receipt and anything it opened are now in your Promorang account.', data: { type: 'guest_attendance_claimed', route: `/moment/${receipt.moment_id}`, receipt_id: receipt.id } }).catch(() => {});
  return data;
}

async function claimForRsvp(rsvpId, userId) {
  const { data, error } = await supabase.from('guest_attendance_receipts').select('*').eq('rsvp_id', rsvpId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return processClaimedAttendance(data, userId);
}

module.exports = { recordVerifiedAttendance, processClaimedAttendance, claimForRsvp };
