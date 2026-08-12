const { supabase } = require('../lib/supabase');
const resend = require('./resendService');

const mask = (value = '') => value.includes('@') ? value.replace(/^(.).+(@.+)$/, '$1•••$2') : `••••${value.replace(/\D/g, '').slice(-4)}`;
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[char]));

function messageFor(eventType, rsvp, moment) {
  const passUrl = `${resend.EMAIL_CONFIG.frontendUrl.replace(/\/$/, '')}/guest-pass/${rsvp.invite_token}?manage=${encodeURIComponent(rsvp.manage_token)}`;
  const when = moment.starts_at ? new Date(moment.starts_at).toLocaleString('en-JM', { timeZone: 'America/Jamaica' }) : 'Schedule to be announced';
  const title = eventType === 'confirmation' ? `Your place at ${moment.title} is confirmed` : eventType === 'reminder' ? `${moment.title} is coming up` : eventType === 'cancelled' ? `${moment.title} was cancelled` : eventType === 'refunded' ? `Your ${moment.title} reservation was refunded` : eventType === 'location_changed' ? `${moment.title} has a new location` : `${moment.title} has a schedule update`;
  const body = eventType === 'cancelled' ? 'Your guest pass is no longer active.' : eventType === 'refunded' ? 'Any eligible value has been returned. Keep this message for your records.' : `${when} · ${moment.location || 'Location to be announced'} · Pass ${rsvp.pass_code}`;
  return { title, body, passUrl, text: `${title}. ${body} ${passUrl}` };
}

async function deliverChannel(channel, destination, message) {
  if (channel === 'email') {
    const result = await resend.sendEmail({ to: destination, subject: message.title, text: message.text, html: resend.getBaseTemplate({ title: escapeHtml(message.title), preheader: escapeHtml(message.body), content: `<p>${escapeHtml(message.body)}</p>`, ctaUrl: message.passUrl, ctaText: 'Open guest pass', footerNote: 'You received this because you requested operational updates for this RSVP.' }), emailType: 'guest-rsvp-operational', metadata: { operational: true } });
    if (!result.success) throw new Error(result.error || 'Email provider rejected delivery');
    return result.messageId;
  }
  if (!process.env.MESSAGING_WEBHOOK_URL) throw new Error('Messaging provider is not configured');
  const response = await fetch(process.env.MESSAGING_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type':'application/json', ...(process.env.MESSAGING_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.MESSAGING_WEBHOOK_SECRET}` } : {}) }, body: JSON.stringify({ channel, to: destination, message: message.text }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `${channel} provider rejected delivery`);
  return data.id || data.message_id || null;
}

function destinationFor(rsvp, channel) {
  if (channel === 'email') return rsvp.consent_email ? rsvp.email : null;
  if (channel === 'sms') return rsvp.consent_sms ? rsvp.mobile : null;
  if (channel === 'whatsapp') return rsvp.consent_whatsapp ? rsvp.mobile : null;
  return null;
}

function retryDelay(retryCount) {
  return new Date(Date.now() + Math.min(6 * 60 * 60 * 1000, 15 * 60 * 1000 * (2 ** retryCount))).toISOString();
}

async function retryDelivery(deliveryOrId) {
  const query = supabase.from('guest_rsvp_deliveries').select('*,rsvp:guest_moment_rsvps(*,moment:moments(id,title,starts_at,ends_at,location,status))');
  const { data: delivery, error } = typeof deliveryOrId === 'string'
    ? await query.eq('id', deliveryOrId).single()
    : { data: deliveryOrId, error: null };
  if (error || !delivery) throw error || new Error('Delivery not found');
  const rsvp = delivery.rsvp;
  const destination = destinationFor(rsvp, delivery.channel);
  if (!destination) {
    await supabase.from('guest_rsvp_deliveries').update({ status: 'skipped', error_message: 'Guest opted out of this channel', updated_at: new Date().toISOString() }).eq('id', delivery.id);
    return { id: delivery.id, channel: delivery.channel, status: 'skipped' };
  }
  const message = messageFor(delivery.event_type, rsvp, rsvp.moment);
  const nextCount = Number(delivery.retry_count || 0) + 1;
  try {
    const reference = await deliverChannel(delivery.channel, destination, message);
    await supabase.from('guest_rsvp_deliveries').update({ status: 'sent', provider_reference: reference || delivery.provider_reference, provider_status: 'accepted', error_message: null, retry_count: nextCount, next_attempt_at: null, attempted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', delivery.id);
    return { id: delivery.id, channel: delivery.channel, status: 'sent' };
  } catch (sendError) {
    await supabase.from('guest_rsvp_deliveries').update({ status: 'failed', error_message: String(sendError.message).slice(0, 500), retry_count: nextCount, next_attempt_at: nextCount < 3 ? retryDelay(nextCount) : null, attempted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', delivery.id);
    return { id: delivery.id, channel: delivery.channel, status: 'failed', error: sendError.message };
  }
}

async function retryFailedDeliveries(limit = 100) {
  const now = new Date().toISOString();
  const { data, error } = await supabase.from('guest_rsvp_deliveries').select('*,rsvp:guest_moment_rsvps(*,moment:moments(id,title,starts_at,ends_at,location,status))').eq('status', 'failed').lt('retry_count', 3).or(`next_attempt_at.is.null,next_attempt_at.lte.${now}`).order('created_at', { ascending: true }).limit(limit);
  if (error) throw error;
  const results = [];
  for (const delivery of data || []) results.push(await retryDelivery(delivery));
  return { scanned: (data || []).length, sent: results.filter(item => item.status === 'sent').length, failed: results.filter(item => item.status === 'failed').length, skipped: results.filter(item => item.status === 'skipped').length };
}

async function queueAndDeliver(rsvp, moment, eventType, version = '1') {
  const message = messageFor(eventType, rsvp, moment);
  const destinations = [
    rsvp.consent_whatsapp && rsvp.mobile ? ['whatsapp', rsvp.mobile] : null,
    rsvp.consent_sms && rsvp.mobile ? ['sms', rsvp.mobile] : null,
    rsvp.consent_email && rsvp.email ? ['email', rsvp.email] : null,
  ].filter(Boolean);
  const results = [];
  for (const [channel, destination] of destinations) {
    const key = `guest-rsvp:${rsvp.id}:${eventType}:${channel}:${version}`;
    const { data: delivery, error } = await supabase.from('guest_rsvp_deliveries').upsert({ rsvp_id: rsvp.id, event_type: eventType, channel, destination_masked: mask(destination), payload: { title: message.title, body: message.body, pass_url: message.passUrl }, idempotency_key: key }, { onConflict: 'idempotency_key', ignoreDuplicates: true }).select().maybeSingle();
    if (error) { results.push({ channel, status: 'failed', error: error.message }); continue; }
    if (!delivery) { results.push({ channel, status: 'duplicate' }); continue; }
    try { const reference = await deliverChannel(channel, destination, message); await supabase.from('guest_rsvp_deliveries').update({ status:'sent',provider_reference:reference,attempted_at:new Date().toISOString(),delivered_at:new Date().toISOString(),updated_at:new Date().toISOString() }).eq('id',delivery.id); results.push({ channel,status:'sent' }); }
    catch (sendError) { await supabase.from('guest_rsvp_deliveries').update({ status:'failed',error_message:String(sendError.message).slice(0,500),retry_count:0,next_attempt_at:retryDelay(0),attempted_at:new Date().toISOString(),updated_at:new Date().toISOString() }).eq('id',delivery.id); results.push({ channel,status:'failed',error:sendError.message }); }
  }
  return results;
}

async function processMomentChanges() {
  const { data: rows, error } = await supabase.from('guest_moment_rsvps').select('*,moment:moments(id,title,starts_at,ends_at,location,status)').in('status',['confirmed','refunded']).limit(500);
  if (error) throw error;
  const summary = { scanned:(rows||[]).length,changed:0,deliveries:0 };
  for (const rsvp of rows || []) {
    const moment=rsvp.moment; if(!moment) continue; const snapshot=rsvp.schedule_snapshot||{};
    let eventType=null; if(moment.status==='cancelled'&&rsvp.status==='confirmed') eventType='cancelled'; else if(rsvp.status==='refunded') eventType='refunded'; else if(String(snapshot.location||'')!==String(moment.location||'')) eventType='location_changed'; else if(String(snapshot.starts_at||'')!==String(moment.starts_at||'')||String(snapshot.ends_at||'')!==String(moment.ends_at||'')) eventType='schedule_changed';
    if(!eventType) continue; summary.changed += 1; const version=[moment.status,moment.starts_at,moment.ends_at,moment.location,rsvp.status].join(':'); const deliveries=await queueAndDeliver(rsvp,moment,eventType,Buffer.from(version).toString('base64url').slice(0,40)); summary.deliveries += deliveries.filter(item=>item.status==='sent').length;
    await supabase.from('guest_moment_rsvps').update({ schedule_snapshot:{title:moment.title,starts_at:moment.starts_at,ends_at:moment.ends_at,location:moment.location}, ...(eventType==='cancelled'?{status:'cancelled',cancelled_at:new Date().toISOString()}:{}), updated_at:new Date().toISOString() }).eq('id',rsvp.id);
  }
  return summary;
}

async function processUpcomingReminders() {
  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const { data: rows, error } = await supabase.from('guest_moment_rsvps').select('*,moment:moments!inner(id,title,starts_at,ends_at,location,status)').eq('status', 'confirmed').gte('moment.starts_at', now.toISOString()).lte('moment.starts_at', horizon).limit(500);
  if (error) throw error;
  const summary = { scanned: 0, due: 0, sent: 0 };
  for (const rsvp of rows || []) {
    const moment = rsvp.moment;
    if (!moment?.starts_at || ['cancelled','completed'].includes(moment.status)) continue;
    summary.scanned += 1;
    const hours = (new Date(moment.starts_at).getTime() - now.getTime()) / 3600000;
    if (hours < 0 || hours > 24) continue;
    const tier = hours <= 2 ? '2h' : '24h';
    summary.due += 1;
    const deliveries = await queueAndDeliver(rsvp, moment, 'reminder', `${tier}:${String(moment.starts_at)}`);
    summary.sent += deliveries.filter(item => item.status === 'sent').length;
  }
  return summary;
}

module.exports={queueAndDeliver,processMomentChanges,processUpcomingReminders,retryDelivery,retryFailedDeliveries};
