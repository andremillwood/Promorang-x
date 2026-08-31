const crypto = require('crypto');
const { supabase } = require('../lib/supabase');

const ACTIVE_ISSUANCE_STATUSES = ['issued', 'claimed', 'fulfillment_pending', 'redeemed'];

function code() {
  return `PR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function assertOwner(offerId, userId) {
  const { data, error } = await supabase.from('offers').select('*').eq('id', offerId).single();
  if (error || !data) throw new Error('Offer not found');
  if (data.owner_user_id !== userId) throw new Error('Not authorized to manage this offer');
  return data;
}

async function createOffer(userId, payload) {
  const distributions = payload.distributions || [];
  const { data: offer, error } = await supabase.from('offers').insert({
    owner_user_id: userId,
    organization_id: payload.organization_id || null,
    owner_type: payload.owner_type || 'business',
    title: payload.title,
    description: payload.description || null,
    terms: payload.terms || null,
    image_url: payload.image_url || null,
    reward_type: payload.reward_type,
    fulfillment_type: payload.fulfillment_type || 'code',
    value_amount: payload.value_amount || null,
    value_currency: payload.value_currency || null,
    coupon_id: payload.coupon_id || null,
    merchant_product_id: payload.merchant_product_id || null,
    venue_id: payload.venue_id || null,
    quantity_total: payload.quantity_total ?? null,
    per_user_limit: payload.per_user_limit || 1,
    starts_at: payload.starts_at || new Date().toISOString(),
    ends_at: payload.ends_at || null,
    claim_expires_days: payload.claim_expires_days || 30,
    status: payload.status || 'draft',
    metadata: payload.metadata || {},
  }).select().single();
  if (error) throw error;

  if (distributions.length) {
    const { error: distributionError } = await supabase.from('offer_distributions').insert(
      distributions.map((item) => ({
        offer_id: offer.id,
        channel: item.channel,
        trigger_event: item.trigger_event,
        source_id: item.source_id || null,
        source_label: item.source_label || null,
        qualification_rules: item.qualification_rules || {},
        allocation_limit: item.allocation_limit ?? null,
        is_active: item.is_active !== false,
      })),
    );
    if (distributionError) {
      await supabase.from('offers').delete().eq('id', offer.id);
      throw distributionError;
    }
  }
  return getOffer(offer.id, userId);
}

async function getOffer(offerId, userId) {
  const { data, error } = await supabase
    .from('offers')
    .select('*, offer_distributions(*)')
    .eq('id', offerId)
    .single();
  if (error) throw error;
  if (data.status !== 'active' && data.owner_user_id !== userId) throw new Error('Offer not available');
  return data;
}

async function listOwnerOffers(userId) {
  const { data, error } = await supabase
    .from('offers')
    .select('*, offer_distributions(*), offer_issuances(id,status,issued_at,claimed_at,redeemed_at)')
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function updateOffer(userId, offerId, payload) {
  await assertOwner(offerId, userId);
  const allowed = ['title', 'description', 'terms', 'image_url', 'status', 'ends_at', 'quantity_total', 'per_user_limit', 'fulfillment_type', 'metadata'];
  const updates = Object.fromEntries(allowed.filter((key) => payload[key] !== undefined).map((key) => [key, payload[key]]));
  const { error } = await supabase.from('offers').update(updates).eq('id', offerId);
  if (error) throw error;
  return getOffer(offerId, userId);
}

async function listPublicOffers(filters = {}) {
  let query = supabase
    .from('offers')
    .select('*, offer_distributions!inner(*)')
    .eq('status', 'active')
    .lte('starts_at', new Date().toISOString())
    .order('created_at', { ascending: false });
  if (filters.channel) query = query.eq('offer_distributions.channel', filters.channel);
  if (filters.source_id) query = query.eq('offer_distributions.source_id', filters.source_id);
  const { data, error } = await query.limit(Math.min(Number(filters.limit) || 50, 100));
  if (error) throw error;
  const now = Date.now();
  return (data || []).filter((offer) => !offer.ends_at || new Date(offer.ends_at).getTime() > now);
}

function rulesMatch(rules, context) {
  if (!rules || !Object.keys(rules).length) return true;
  if (rules.required_events && !rules.required_events.includes(context.event)) return false;
  if (rules.minimum_count && Number(context.count || 1) < Number(rules.minimum_count)) return false;
  if (rules.proof_required && !context.proof_verified) return false;
  return true;
}

async function issueForEvent({ userId, channel, event, sourceId, sourceEventId, context = {} }) {
  let query = supabase
    .from('offer_distributions')
    .select('*, offers(*)')
    .eq('channel', channel)
    .eq('trigger_event', event)
    .eq('is_active', true);
  if (sourceId) query = query.or(`source_id.eq.${sourceId},source_id.is.null`);
  else query = query.is('source_id', null);

  const { data: distributions, error } = await query;
  if (error) throw error;
  const issued = [];
  for (const distribution of distributions || []) {
    const offer = distribution.offers;
    const now = Date.now();
    if (!offer || offer.status !== 'active' || new Date(offer.starts_at).getTime() > now || (offer.ends_at && new Date(offer.ends_at).getTime() <= now)) continue;
    if (!rulesMatch(distribution.qualification_rules, { ...context, event })) continue;
    if (distribution.allocation_limit !== null && distribution.allocation_count >= distribution.allocation_limit) continue;

    const { count } = await supabase.from('offer_issuances').select('*', { count: 'exact', head: true })
      .eq('offer_id', offer.id).eq('user_id', userId).in('status', ACTIVE_ISSUANCE_STATUSES);
    if ((count || 0) >= offer.per_user_limit) continue;
    if (offer.quantity_total !== null && offer.quantity_reserved + offer.quantity_redeemed >= offer.quantity_total) continue;

    const expiresAt = new Date(Date.now() + offer.claim_expires_days * 86400000).toISOString();
    const { data: issuance, error: issuanceError } = await supabase.from('offer_issuances').insert({
      offer_id: offer.id,
      distribution_id: distribution.id,
      user_id: userId,
      source_event_id: sourceEventId || `${channel}:${event}:${sourceId || 'any'}`,
      redemption_code: code(),
      expires_at: expiresAt,
      metadata: context,
    }).select().single();
    if (issuanceError) {
      if (issuanceError.code === '23505') continue;
      throw issuanceError;
    }

    await Promise.all([
      supabase.from('offers').update({ quantity_reserved: offer.quantity_reserved + 1 }).eq('id', offer.id),
      supabase.from('offer_distributions').update({ allocation_count: distribution.allocation_count + 1 }).eq('id', distribution.id),
      supabase.from('offer_redemption_events').insert({ issuance_id: issuance.id, event_type: 'issued', actor_user_id: userId, metadata: { channel, event, source_id: sourceId } }),
    ]);
    issued.push({ ...issuance, offer });
  }
  return issued;
}

async function directClaim(userId, offerId) {
  const offer = await getOffer(offerId, userId);
  const distribution = (offer.offer_distributions || []).find((item) => item.channel === 'direct' && item.is_active);
  if (!distribution) throw new Error('This offer is not available for direct claim');
  const rows = await issueForEvent({ userId, channel: 'direct', event: distribution.trigger_event, sourceId: distribution.source_id, sourceEventId: `direct:${offerId}:${userId}` });
  if (!rows.length) throw new Error('Offer unavailable, already claimed, or out of stock');
  return rows[0];
}

async function claimIssuance(userId, issuanceId) {
  const { data: issuance, error } = await supabase.from('offer_issuances').select('*, offers(*)').eq('id', issuanceId).eq('user_id', userId).single();
  if (error || !issuance) throw new Error('Issued offer not found');
  if (issuance.status !== 'issued') throw new Error('Offer has already been claimed or closed');
  if (issuance.expires_at && new Date(issuance.expires_at) <= new Date()) throw new Error('Offer has expired');
  const fulfillmentData = { ...issuance.fulfillment_data };
  if (issuance.offers.coupon_id) fulfillmentData.coupon_id = issuance.offers.coupon_id;
  if (issuance.offers.merchant_product_id) fulfillmentData.merchant_product_id = issuance.offers.merchant_product_id;
  const nextStatus = ['shipping', 'manual'].includes(issuance.offers.fulfillment_type) ? 'fulfillment_pending' : 'claimed';
  const { data, error: updateError } = await supabase.from('offer_issuances').update({ status: nextStatus, claimed_at: new Date().toISOString(), fulfillment_data: fulfillmentData }).eq('id', issuanceId).select('*, offers(*)').single();
  if (updateError) throw updateError;
  await supabase.from('offer_redemption_events').insert({ issuance_id: issuanceId, event_type: 'claimed', actor_user_id: userId });
  const revenueFunnels = require('./revenueFunnelService');
  await revenueFunnels.record({
    userId,
    funnel: 'marketplace',
    stage: nextStatus === 'fulfillment_pending' ? 'qualified' : 'fulfilled',
    entityType: 'offer_issuance',
    entityId: issuanceId,
    idempotencyKey: `offer:${issuanceId}:${nextStatus}`,
    metadata: { offer_id: issuance.offer_id, fulfillment_type: issuance.offers.fulfillment_type },
  });
  return data;
}

async function listUserIssuances(userId) {
  const { data, error } = await supabase.from('offer_issuances').select('*, offers(*)').eq('user_id', userId).order('issued_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function redeemByCode(actorUserId, redemptionCode, venueId, notes) {
  const { data: issuance, error } = await supabase.from('offer_issuances').select('*, offers(*)').eq('redemption_code', redemptionCode.toUpperCase()).single();
  if (error || !issuance) throw new Error('Redemption code not found');
  if (!['claimed', 'issued', 'fulfillment_pending'].includes(issuance.status)) throw new Error('Offer is not redeemable');
  if (issuance.expires_at && new Date(issuance.expires_at) <= new Date()) throw new Error('Offer has expired');
  const offer = issuance.offers;
  if (offer.owner_user_id !== actorUserId && offer.fulfillment_type === 'merchant_validation') {
    throw new Error('Only the issuing business can validate this offer');
  }
  const { data, error: updateError } = await supabase.from('offer_issuances').update({ status: 'redeemed', redeemed_at: new Date().toISOString(), redeemed_by: actorUserId }).eq('id', issuance.id).select('*, offers(*)').single();
  if (updateError) throw updateError;
  await Promise.all([
    supabase.from('offers').update({ quantity_reserved: Math.max(0, offer.quantity_reserved - 1), quantity_redeemed: offer.quantity_redeemed + 1 }).eq('id', offer.id),
    supabase.from('offer_redemption_events').insert({ issuance_id: issuance.id, event_type: 'redeemed', actor_user_id: actorUserId, venue_id: venueId || null, notes: notes || null }),
  ]);
  const revenueFunnels = require('./revenueFunnelService');
  await revenueFunnels.record({
    userId: issuance.user_id,
    funnel: 'marketplace',
    stage: 'fulfilled',
    entityType: 'offer_issuance',
    entityId: issuance.id,
    idempotencyKey: `offer:${issuance.id}:redeemed`,
    metadata: { offer_id: offer.id, venue_id: venueId || null },
  });
  try {
    const peopleExperience = require('./peopleExperienceService');
    await peopleExperience.recordVerifiedAction({
      userId: issuance.user_id,
      actionType: 'PERK_REDEMPTION',
      merchantId: offer.owner_user_id || null,
      sceneId: issuance.metadata?.scene_id || issuance.metadata?.sceneId || null,
      contributorId: issuance.metadata?.contributor_id || issuance.metadata?.referrer_id || null,
      referrerId: issuance.metadata?.referrer_id || null,
      dropId: issuance.metadata?.drop_id || null,
      amount: offer.value_amount != null ? Number(offer.value_amount) : null,
      verificationMethod: 'redemption',
      metadata: {
        issuance_id: issuance.id,
        offer_id: offer.id,
        venue_id: venueId || null,
      },
    });
    if (issuance.metadata?.drop_id) {
      const { supabase: db } = require('../lib/supabase');
      if (db) {
        await db.from('community_drop_claims').update({ status: 'redeemed' }).eq('offer_issuance_id', issuance.id);
      }
    }
  } catch (experienceError) {
    console.warn('[offerService] people experience redemption skipped:', experienceError.message);
  }
  return data;
}

async function analytics(userId, offerId) {
  await assertOwner(offerId, userId);
  const { data, error } = await supabase.from('offer_issuances').select('status, issued_at, claimed_at, redeemed_at, distribution_id').eq('offer_id', offerId);
  if (error) throw error;
  const rows = data || [];
  return {
    issued: rows.length,
    claimed: rows.filter((row) => ['claimed', 'fulfillment_pending', 'redeemed'].includes(row.status)).length,
    redeemed: rows.filter((row) => row.status === 'redeemed').length,
    expired: rows.filter((row) => row.status === 'expired').length,
  };
}

module.exports = { createOffer, getOffer, listOwnerOffers, updateOffer, listPublicOffers, issueForEvent, directClaim, claimIssuance, listUserIssuances, redeemByCode, analytics };
