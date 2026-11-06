'use strict';
const { verifyOrderOutcome } = require('./partnerOutcomeVerification');

// Server-only adapter: load authoritative records before verification.
// Never trust buyer-supplied order status, partner ID, or margin.
async function preparePartnerOrderOutcome({ db, campaignId, orderId, contributionMargin }) {
  if (!db || !campaignId || !orderId) throw new TypeError('Database and identifiers required');
  const { data: campaign, error: campaignError } = await db.from('partner_campaigns')
    .select('id,merchant_id,currency,rate_bps,margin_cap_bps,active').eq('id', campaignId).single();
  if (campaignError) throw campaignError;
  const { data: order, error: orderError } = await db.from('commerce_orders')
    .select('id,buyer_id,merchant_id,currency,subtotal,payment_status,fulfillment_status,payment_collection,merchant_payment_confirmed_at,merchant_payment_reference,stripe_payment_intent_id,metadata')
    .eq('id', orderId).single();
  if (orderError) throw orderError;
  const partnerId = order?.metadata?.referrer_id;
  const referralCode = order?.metadata?.referral_code;
  const { data: memberships, error: membershipError } = await db.from('partner_campaign_members')
    .select('partner_id').eq('campaign_id', campaignId).eq('partner_id', partnerId || '00000000-0000-0000-0000-000000000000');
  if (membershipError) throw membershipError;
  const { data: codes, error: codesError } = await db.from('referral_codes')
     .select('user_id,code,is_active,expires_at').eq('user_id', partnerId || '00000000-0000-0000-0000-000000000000').eq('code', referralCode || '');
  if (codesError) throw codesError;
  const verifiedCode = codes?.some(row => row.user_id === partnerId && row.is_active === true && (!row.expires_at || Date.parse(row.expires_at) > Date.now()) && row.code?.toUpperCase() === referralCode?.toUpperCase());
  const result = verifyOrderOutcome({
    order, campaign, partnerId, referralCode: verifiedCode ? referralCode : null,
    approvedPartnerIds: (memberships || []).map(row => row.partner_id), contributionMargin,
  });
  if (!result.verified) return result;
  return { ...result, persisted: false, requiresAtomicSettlement: true };
}
module.exports = { preparePartnerOrderOutcome };
