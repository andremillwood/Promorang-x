const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { queueAndDeliver, retryDelivery } = require('../services/guestRsvpMessagingService');
const guestAttendanceService = require('../services/guestAttendanceService');
const demandEventService = require('../services/demandEventService');
const clean = (value, max = 160) => String(value || '').trim().slice(0, max);
const passCode = () => `PR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

async function loadMoment(momentId) {
  const { data, error } = await supabase.from('moments').select('id,title,starts_at,ends_at,location,venue_id,status,max_participants,cover_image').eq('id', momentId).single();
  if (error || !data) throw Object.assign(new Error('Moment not found'), { status: 404 });
  return data;
}

async function ensureCapacity(moment, count) {
  if (!moment.max_participants) return;
  const [{ data: guests, error: guestError }, { data: participants, error: participantError }] = await Promise.all([
    supabase.from('guest_moment_rsvps').select('guest_count,user_id').eq('moment_id', moment.id).in('status', ['confirmed','checked_in']),
    supabase.from('moment_participants').select('user_id').eq('moment_id', moment.id).in('status', ['joined','going','confirmed','checked_in','attended']),
  ]);
  if (guestError || participantError) throw guestError || participantError;
  const claimedGuestUsers = new Set((guests || []).map(row => row.user_id).filter(Boolean));
  const guestPlaces = (guests || []).reduce((sum, row) => sum + Number(row.guest_count || 1), 0);
  const independentParticipants = (participants || []).filter(row => !claimedGuestUsers.has(row.user_id)).length;
  if (guestPlaces + independentParticipants + count > moment.max_participants) throw Object.assign(new Error('This Moment no longer has enough space for that group'), { status: 409 });
}

async function requireMomentOperator(momentId, userId) {
  const { data: moment, error } = await supabase.from('moments').select('id,title,starts_at,ends_at,location,status,max_participants,host_id,organizer_id').eq('id', momentId).single();
  if (error || !moment) throw Object.assign(new Error('Moment not found'), { status: 404 });
  if (moment.host_id !== userId && moment.organizer_id !== userId) throw Object.assign(new Error('Only this Moment’s host can manage guest arrivals'), { status: 403 });
  return moment;
}

function extractPassCode(value) {
  const decoded = clean(value, 500).toUpperCase();
  const match = decoded.match(/PR-[A-F0-9]{8}/);
  return match ? match[0] : decoded;
}

router.post('/', async (req, res) => {
  try {
    const { moment_id, full_name, mobile, email, guest_count = 1, group_name, meeting_point, consent_whatsapp = false, consent_sms = false, consent_email = false } = req.body || {};
    if (!moment_id || !clean(full_name) || clean(mobile).length < 7) return res.status(422).json({ error: 'Moment, full name, and mobile number are required' });
    const count = Math.min(12, Math.max(1, Number(guest_count) || 1));
    const moment = await loadMoment(moment_id);
    if (['cancelled', 'completed'].includes(moment.status)) return res.status(409).json({ error: 'This Moment is not accepting reservations' });
    await ensureCapacity(moment, count);
    const { data, error } = await supabase.from('guest_moment_rsvps').insert({ moment_id, full_name: clean(full_name), mobile: clean(mobile, 40), email: clean(email, 200) || null, guest_count: count, group_name: clean(group_name) || null, meeting_point: clean(meeting_point) || null, consent_whatsapp: !!consent_whatsapp, consent_sms: !!consent_sms, consent_email: !!consent_email, pass_code: passCode(), schedule_snapshot: { title: moment.title, starts_at: moment.starts_at, ends_at: moment.ends_at, location: moment.location, venue_id: moment.venue_id } }).select().single();
    if (error) { if (error.code === '23505') return res.status(409).json({ error: 'This mobile number already has an active reservation for the Moment' }); throw error; }
    const guestIdentity = `guest-rsvp:${data.id}`;
    try {
      await demandEventService.recordEvent({ momentId: moment_id, anonymousId: guestIdentity, eventType: 'rsvp_confirmed', sourceSystem: 'guest_moment_rsvps', sourceReference: data.id, channel: 'guest_pass', verified: true, properties: { guest_count: count } });
      if (consent_whatsapp || consent_sms || consent_email) await demandEventService.recordEvent({ momentId: moment_id, anonymousId: guestIdentity, eventType: 'message_consent_granted', sourceSystem: 'guest_moment_rsvps', sourceReference: data.id, channel: consent_whatsapp ? 'whatsapp' : consent_sms ? 'sms' : 'email', verified: true, consentBasis: 'explicit_opt_in' });
    } catch (demandError) { console.warn('[Guest RSVP] demand reservation mirror skipped:', demandError.message); }
    const delivery = await queueAndDeliver(data, moment, 'confirmation');
    res.status(201).json({ rsvp: data, moment, delivery });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || 'Could not reserve your place' }); }
});

router.get('/moments/:momentId/operations', requireAuth, async (req, res) => {
  try {
    const moment = await requireMomentOperator(req.params.momentId, req.user.id);
    const [{ data: guests, error: guestError }, { data: deliveries, error: deliveryError }] = await Promise.all([
      supabase.from('guest_moment_rsvps').select('id,full_name,mobile,email,guest_count,group_name,meeting_point,status,pass_code,consent_whatsapp,consent_sms,consent_email,checked_in_at,verification_method,parent_rsvp_id,created_at').eq('moment_id', moment.id).order('created_at', { ascending: false }),
      supabase.from('guest_rsvp_deliveries').select('id,rsvp_id,event_type,channel,status,destination_masked,error_message,attempted_at,delivered_at,created_at,updated_at').in('rsvp_id', (await supabase.from('guest_moment_rsvps').select('id').eq('moment_id', moment.id)).data?.map(row => row.id) || ['00000000-0000-0000-0000-000000000000']).order('created_at', { ascending: false }).limit(500),
    ]);
    if (guestError) throw guestError;
    if (deliveryError) throw deliveryError;
    const rows = guests || [];
    const summary = {
      reservations: rows.filter(row => row.status === 'confirmed').length,
      places_held: rows.filter(row => row.status === 'confirmed').reduce((sum, row) => sum + Number(row.guest_count || 1), 0),
      checked_in: rows.filter(row => row.status === 'checked_in').reduce((sum, row) => sum + Number(row.guest_count || 1), 0),
      checked_in_passes: rows.filter(row => row.status === 'checked_in').length,
      cancelled: rows.filter(row => ['cancelled','refunded'].includes(row.status)).length,
      capacity: moment.max_participants || null,
      delivery_failures: (deliveries || []).filter(row => row.status === 'failed').length,
    };
    res.json({ moment, summary, guests: rows, deliveries: deliveries || [] });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || 'Could not load guest operations' }); }
});

router.post('/moments/:momentId/check-in', requireAuth, async (req, res) => {
  try {
    const moment = await requireMomentOperator(req.params.momentId, req.user.id);
    const code = extractPassCode(req.body?.code);
    if (!code) return res.status(422).json({ error: 'A guest pass code is required' });
    const { data: guest, error: findError } = await supabase.from('guest_moment_rsvps').select('*').eq('moment_id', moment.id).eq('pass_code', code).maybeSingle();
    if (findError) throw findError;
    if (!guest) return res.status(404).json({ error: 'This pass does not belong to the selected Moment' });
    if (['cancelled','refunded'].includes(guest.status)) return res.status(409).json({ error: `This pass is ${guest.status} and cannot be checked in` });
    if (guest.status === 'checked_in') {
      const receipt = await guestAttendanceService.recordVerifiedAttendance(guest, guest.checked_in_by || req.user.id, guest.verification_method || 'manual');
      return res.json({ success: true, already_checked_in: true, guest, moment, receipt });
    }
    const now = new Date().toISOString();
    const method = ['qr','manual'].includes(req.body?.verification_method) ? req.body.verification_method : 'manual';
    const { data, error } = await supabase.from('guest_moment_rsvps').update({ status: 'checked_in', checked_in_at: now, checked_in_by: req.user.id, verification_method: method, check_in_note: clean(req.body?.note, 300) || null, updated_at: now }).eq('id', guest.id).eq('status', 'confirmed').select().single();
    if (error || !data) return res.status(409).json({ error: 'This pass changed while it was being checked in. Refresh and try again.' });
    if (data.user_id) await supabase.from('moment_participants').upsert({ moment_id: moment.id, user_id: data.user_id, status: 'checked_in', joined_at: data.created_at, checked_in_at: now }, { onConflict: 'moment_id,user_id' });
    const receipt = await guestAttendanceService.recordVerifiedAttendance(data, req.user.id, method);
    res.json({ success: true, already_checked_in: false, guest: data, moment, receipt });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || 'Could not check in this guest' }); }
});

router.post('/moments/:momentId/deliveries/:deliveryId/retry', requireAuth, async (req, res) => {
  try {
    await requireMomentOperator(req.params.momentId, req.user.id);
    const { data: delivery, error } = await supabase.from('guest_rsvp_deliveries').select('id,rsvp:guest_moment_rsvps(moment_id)').eq('id', req.params.deliveryId).single();
    if (error || !delivery) return res.status(404).json({ error: 'Delivery not found' });
    const rsvp = Array.isArray(delivery.rsvp) ? delivery.rsvp[0] : delivery.rsvp;
    if (rsvp?.moment_id !== req.params.momentId) return res.status(404).json({ error: 'Delivery not found for this Moment' });
    const result = await retryDelivery(req.params.deliveryId);
    res.status(result.status === 'failed' ? 502 : 200).json({ success: result.status === 'sent', result });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || 'Could not retry delivery' }); }
});

router.post('/delivery-status', async (req, res) => {
  try {
    const provided = req.headers['x-messaging-webhook-secret'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!process.env.MESSAGING_WEBHOOK_SECRET || provided !== process.env.MESSAGING_WEBHOOK_SECRET) return res.status(401).json({ error: 'Invalid delivery callback secret' });
    const reference = clean(req.body?.provider_reference || req.body?.id || req.body?.message_id, 200);
    if (!reference) return res.status(422).json({ error: 'provider_reference is required' });
    const providerStatus = clean(req.body?.status, 60).toLowerCase();
    const delivered = ['delivered','read'].includes(providerStatus);
    const failed = ['failed','undelivered','rejected'].includes(providerStatus);
    const update = { provider_status: providerStatus || 'unknown', provider_payload: req.body || {}, updated_at: new Date().toISOString(), ...(delivered ? { status: 'sent', delivered_at: new Date().toISOString(), error_message: null } : {}), ...(failed ? { status: 'failed', error_message: clean(req.body?.error || req.body?.reason, 500) || 'Provider reported delivery failure', next_attempt_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() } : {}) };
    const { data, error } = await supabase.from('guest_rsvp_deliveries').update(update).eq('provider_reference', reference).select('id,rsvp_id,channel,status,provider_status').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Delivery reference not found' });
    if (delivered) {
      try {
        const { data: rsvp } = await supabase.from('guest_moment_rsvps').select('id,moment_id,user_id').eq('id', data.rsvp_id).single();
        if (rsvp) await demandEventService.recordEvent({ momentId: rsvp.moment_id, actorUserId: rsvp.user_id || null, anonymousId: rsvp.user_id ? null : `guest-rsvp:${rsvp.id}`, eventType: 'message_delivered', sourceSystem: 'guest_rsvp_deliveries', sourceReference: data.id, channel: data.channel, verified: true, properties: { provider_status: providerStatus } });
      } catch (demandError) { console.warn('[Guest RSVP] demand delivery mirror skipped:', demandError.message); }
    }
    res.json({ success: true, delivery: data });
  } catch (error) { res.status(500).json({ error: error.message || 'Could not update delivery status' }); }
});

router.get('/me/attendance-receipts', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('guest_attendance_receipts')
      .select('id, rsvp_id, moment_id, status, verification_method, verified_at, claimed_at, outcomes, moments(id, title, location, start_date, image_url)')
      .eq('user_id', req.user.id)
      .order('verified_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return res.json({ receipts: data || [] });
  } catch (error) {
    console.error('Guest attendance receipt list error:', error);
    return res.status(500).json({ error: 'Unable to load attendance receipts' });
  }
});

router.get('/:token', async (req, res) => {
  try {
    const { data, error } = await supabase.from('guest_moment_rsvps').select('*,moment:moments(id,title,starts_at,ends_at,location,status,cover_image)').eq('invite_token', req.params.token).single();
    if (error || !data) return res.status(404).json({ error: 'Invitation not found' });
    const snapshot = data.schedule_snapshot || {};
    const changes = ['starts_at', 'ends_at', 'location'].filter((field) => String(snapshot[field] || '') !== String(data.moment?.[field] || '')).map((field) => ({ field, previous: snapshot[field] || null, current: data.moment?.[field] || null }));
    if (data.moment?.status === 'cancelled' && data.status === 'confirmed') data.status = 'cancelled';
    const canManage = Boolean(req.query.manage_token) && String(req.query.manage_token) === String(data.manage_token);
    const { mobile, email, manage_token, ...publicRsvp } = data;
    if (canManage) publicRsvp.has_email = Boolean(email);
    if (!canManage) {
      delete publicRsvp.pass_code;
      delete publicRsvp.consent_whatsapp;
      delete publicRsvp.consent_sms;
      delete publicRsvp.consent_email;
      delete publicRsvp.preferences_updated_at;
      delete publicRsvp.user_id;
      delete publicRsvp.claimed_at;
    }
    let attendanceReceipt = null;
    if (canManage) {
      const { data: receipt } = await supabase.from('guest_attendance_receipts').select('id,status,verification_method,verified_at,claimed_at,outcomes').eq('rsvp_id', data.id).maybeSingle();
      attendanceReceipt = receipt || null;
    }
    res.json({ rsvp: publicRsvp, can_manage: canManage, schedule_changes: changes, attendance_receipt: attendanceReceipt });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.patch('/:token/preferences', async (req, res) => {
  try {
    const { manage_token, consent_whatsapp, consent_sms, consent_email } = req.body || {};
    if (!manage_token) return res.status(403).json({ error: 'The private management token is required' });
    const updates = { preferences_updated_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    if (typeof consent_whatsapp === 'boolean') updates.consent_whatsapp = consent_whatsapp;
    if (typeof consent_sms === 'boolean') updates.consent_sms = consent_sms;
    if (typeof consent_email === 'boolean') updates.consent_email = consent_email;
    const { data, error } = await supabase.from('guest_moment_rsvps').update(updates).eq('invite_token', req.params.token).eq('manage_token', manage_token).select('id,moment_id,user_id,consent_whatsapp,consent_sms,consent_email,preferences_updated_at').single();
    if (error || !data) return res.status(404).json({ error: 'Private guest pass not found' });
    const grantedChannel = consent_whatsapp ? 'whatsapp' : consent_sms ? 'sms' : consent_email ? 'email' : null;
    if (grantedChannel) {
      try { await demandEventService.recordEvent({ momentId: data.moment_id, actorUserId: data.user_id || null, anonymousId: data.user_id ? null : `guest-rsvp:${data.id}`, eventType: 'message_consent_granted', sourceSystem: 'guest_moment_rsvps', sourceReference: data.id, channel: grantedChannel, verified: true, consentBasis: 'explicit_opt_in' }); }
      catch (demandError) { console.warn('[Guest RSVP] demand consent mirror skipped:', demandError.message); }
    }
    res.json({ success: true, preferences: data });
  } catch (error) { res.status(500).json({ error: error.message || 'Could not update communication preferences' }); }
});

/** A friend follows the private invitation and receives an independent pass in the same named group. */
router.post('/:token/join', async (req, res) => {
  try {
    const { full_name, mobile, email, consent_whatsapp = false, consent_sms = false, consent_email = false } = req.body || {};
    if (!clean(full_name) || clean(mobile).length < 7) return res.status(422).json({ error: 'Full name and mobile number are required' });
    const { data: inviter, error } = await supabase.from('guest_moment_rsvps').select('*').eq('invite_token', req.params.token).eq('status', 'confirmed').single();
    if (error || !inviter) return res.status(404).json({ error: 'This invitation is no longer active' });
    const moment = await loadMoment(inviter.moment_id); await ensureCapacity(moment, 1);
    const { data, error: insertError } = await supabase.from('guest_moment_rsvps').insert({ moment_id: inviter.moment_id, parent_rsvp_id: inviter.id, full_name: clean(full_name), mobile: clean(mobile, 40), email: clean(email, 200) || null, guest_count: 1, group_name: inviter.group_name || `${inviter.full_name}'s group`, meeting_point: inviter.meeting_point, consent_whatsapp: !!consent_whatsapp, consent_sms: !!consent_sms, consent_email: !!consent_email && !!clean(email), pass_code: passCode(), schedule_snapshot: inviter.schedule_snapshot }).select().single();
    if (insertError) { if (insertError.code === '23505') return res.status(409).json({ error: 'This mobile number already has a pass for the Moment' }); throw insertError; }
    try {
      const guestIdentity = `guest-rsvp:${data.id}`;
      await demandEventService.recordEvent({ momentId: inviter.moment_id, anonymousId: guestIdentity, eventType: 'rsvp_confirmed', sourceSystem: 'guest_moment_rsvps', sourceReference: data.id, channel: 'private_invitation', verified: true });
      await demandEventService.recordEvent({ momentId: inviter.moment_id, anonymousId: guestIdentity, eventType: 'referral_converted', sourceSystem: 'guest_moment_rsvps', sourceReference: data.id, channel: 'private_invitation', verified: true, properties: { parent_rsvp_id: inviter.id } });
      if (consent_whatsapp || consent_sms || consent_email) await demandEventService.recordEvent({ momentId: inviter.moment_id, anonymousId: guestIdentity, eventType: 'message_consent_granted', sourceSystem: 'guest_moment_rsvps', sourceReference: data.id, channel: consent_whatsapp ? 'whatsapp' : consent_sms ? 'sms' : 'email', verified: true, consentBasis: 'explicit_opt_in' });
    } catch (demandError) { console.warn('[Guest RSVP] demand referred reservation mirror skipped:', demandError.message); }
    const delivery = await queueAndDeliver(data, moment, 'confirmation');
    res.status(201).json({ rsvp: data, moment, delivery });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || 'Could not join this group' }); }
});

router.post('/:token/cancel', async (req, res) => {
  try { const now = new Date().toISOString(); const { manage_token } = req.body || {}; if (!manage_token) return res.status(403).json({ error: 'The private management token is required' }); const { data, error } = await supabase.from('guest_moment_rsvps').update({ status: 'cancelled', cancelled_at: now, updated_at: now }).eq('invite_token', req.params.token).eq('manage_token', manage_token).eq('status', 'confirmed').select().single(); if (error || !data) return res.status(409).json({ error: 'This reservation cannot be cancelled' }); const moment = await loadMoment(data.moment_id); const delivery = await queueAndDeliver(data, moment, 'cancelled', now); res.json({ rsvp: data, delivery }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

/** Convert a guest RSVP into the signed-in user's durable Moment participation. */
router.post('/:token/claim', requireAuth, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const { manage_token } = req.body || {}; if (!manage_token) return res.status(403).json({ error: 'The private management token is required' });
    const { data: rsvp, error } = await supabase.from('guest_moment_rsvps').select('*').eq('invite_token', req.params.token).eq('manage_token', manage_token).in('status', ['confirmed', 'checked_in']).single();
    if (error || !rsvp) return res.status(404).json({ error: 'Active guest pass not found' });
    if (rsvp.user_id && rsvp.user_id !== req.user.id) return res.status(409).json({ error: 'This pass is already claimed' });
    await supabase.from('moment_participants').upsert({ moment_id: rsvp.moment_id, user_id: req.user.id, status: rsvp.status === 'checked_in' ? 'checked_in' : 'joined', joined_at: rsvp.created_at, checked_in_at: rsvp.checked_in_at }, { onConflict: 'moment_id,user_id' });
    const { data, error: updateError } = await supabase.from('guest_moment_rsvps').update({ user_id: req.user.id, claimed_at: now, updated_at: now }).eq('id', rsvp.id).select().single();
    if (updateError) throw updateError;
    const attendanceReceipt = await guestAttendanceService.claimForRsvp(rsvp.id, req.user.id);
    res.json({ success: true, rsvp: data, attendance_receipt: attendanceReceipt, destination: `/moment/${rsvp.moment_id}` });
  } catch (error) { res.status(500).json({ error: error.message || 'Could not claim guest pass' }); }
});

module.exports = router;
