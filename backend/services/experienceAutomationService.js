const crypto = require('crypto');
const { supabase: serviceSupabase } = require('../lib/supabase');
const couponService = require('./couponService');

const supabase = global.supabase || serviceSupabase || null;
const AUTOMATED_RELATIONSHIPS = new Set(['rewards', 'unlocks', 'eligible_for']);

const makeCode = (prefix = 'ULK') => `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

async function findLinks(refs = []) {
  if (!supabase || refs.length === 0) return [];
  const results = await Promise.all(refs.map(async (ref) => {
    const { data, error } = await supabase
      .from('experience_commerce_links')
      .select('*')
      .eq('source_type', ref.type)
      .eq('source_id', ref.id)
      .in('relationship', [...AUTOMATED_RELATIONSHIPS]);
    if (error) throw error;
    return data || [];
  }));
  return [...new Map(results.flat().map((link) => [link.id, link])).values()];
}

async function getRun(automationKey) {
  const { data, error } = await supabase
    .from('experience_automation_runs')
    .select('*')
    .eq('automation_key', automationKey)
    .maybeSingle();
  if (error) {
    if (/experience_automation_runs.*does not exist|schema cache/i.test(error.message || '')) return null;
    throw error;
  }
  return data;
}

async function writeRun(payload) {
  const { data, error } = await supabase
    .from('experience_automation_runs')
    .upsert(payload, { onConflict: 'automation_key' })
    .select()
    .single();
  if (error) {
    if (/experience_automation_runs.*does not exist|schema cache/i.test(error.message || '')) return null;
    throw error;
  }
  return data;
}

async function unlockCoupon({ link, userId, proof, missionId, campaignId }) {
  const { data: coupon } = await supabase
    .from('coupons')
    .select('id')
    .eq('id', link.target_id)
    .maybeSingle();
  if (!coupon) return null;

  let redemption;
  try {
    redemption = await couponService.redeemCoupon(userId, coupon.id);
  } catch (error) {
    if (!/already claimed|maximum number/i.test(error.message || '')) throw error;
    const { data: existing } = await supabase
      .from('coupon_redemptions')
      .select('*')
      .eq('user_id', userId)
      .eq('coupon_id', coupon.id)
      .in('status', ['claimed', 'redeemed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    redemption = existing;
  }

  if (redemption?.claim_code) {
    const { data: receipt } = await supabase
      .from('commerce_receipts')
      .select('id,attribution')
      .eq('user_id', userId)
      .eq('coupon_id', coupon.id)
      .eq('redemption_code', redemption.claim_code)
      .maybeSingle();
    if (receipt) {
      await supabase.from('commerce_receipts').update({
        moment_id: proof.moment_id,
        mission_id: missionId,
        campaign_id: campaignId,
        attribution: {
          ...(receipt.attribution || {}),
          source: 'verified_proof_unlock',
          proof_submission_id: proof.id,
          experience_link_id: link.id,
        },
      }).eq('id', receipt.id);
    }
  }

  return { kind: 'coupon', coupon_id: coupon.id, redemption_id: redemption?.id, redemption_code: redemption?.claim_code };
}

async function unlockListing({ link, userId, proof, missionId, campaignId }) {
  const { data: product } = await supabase
    .from('merchant_products')
    .select('id,merchant_id,name,currency,discount_value')
    .eq('id', link.target_id)
    .maybeSingle();
  if (!product) return null;

  const { data: existing } = await supabase
    .from('commerce_receipts')
    .select('id,redemption_code,status')
    .eq('user_id', userId)
    .eq('listing_id', product.id)
    .eq('receipt_type', 'claim')
    .contains('attribution', { proof_submission_id: proof.id, experience_link_id: link.id })
    .maybeSingle();
  if (existing) return { kind: 'listing', listing_id: product.id, receipt_id: existing.id, redemption_code: existing.redemption_code };

  const { data: receipt, error } = await supabase
    .from('commerce_receipts')
    .insert({
      user_id: userId,
      merchant_id: product.merchant_id,
      listing_id: product.id,
      moment_id: proof.moment_id,
      mission_id: missionId,
      campaign_id: campaignId,
      receipt_type: 'claim',
      status: 'issued',
      amount: 0,
      currency: product.currency || 'USD',
      redemption_code: makeCode('ULK'),
      attribution: {
        source: 'verified_proof_unlock',
        proof_submission_id: proof.id,
        experience_link_id: link.id,
        relationship: link.relationship,
        product_name: product.name,
        discount_value: product.discount_value,
      },
    })
    .select()
    .single();
  if (error) throw error;
  return { kind: 'listing', listing_id: product.id, receipt_id: receipt.id, redemption_code: receipt.redemption_code };
}

async function executeLink(context) {
  const { link } = context;
  if (['coupon', 'offer'].includes(link.target_type)) {
    const couponResult = await unlockCoupon(context);
    if (couponResult) return couponResult;
  }
  if (['merchant_listing', 'product', 'offer'].includes(link.target_type)) {
    const listingResult = await unlockListing(context);
    if (listingResult) return listingResult;
  }
  return { kind: 'eligibility', target_type: link.target_type, target_id: link.target_id };
}

async function processVerifiedProof({ proof, missionId = null, campaignId = null }) {
  if (!supabase || !proof?.id || !proof?.user_id) return [];

  const bundle = proof.proof_bundle || {};
  const resolvedMissionId = missionId || bundle.source_mission_id || bundle.mission_id || null;
  const resolvedCampaignId = campaignId || bundle.campaign_id || null;
  const refs = [
    proof.moment_id && { type: 'moment', id: proof.moment_id },
    resolvedMissionId && { type: 'mission', id: resolvedMissionId },
    (bundle.source_content_id || bundle.content_id) && { type: 'content', id: bundle.source_content_id || bundle.content_id },
    resolvedCampaignId && { type: 'campaign', id: resolvedCampaignId },
  ].filter(Boolean);
  const links = await findLinks(refs);
  const outcomes = [];

  for (const link of links) {
    const automationKey = `proof:${proof.id}:link:${link.id}`;
    const existing = await getRun(automationKey);
    if (existing?.status === 'completed' || existing?.status === 'skipped') {
      outcomes.push(existing);
      continue;
    }

    const baseRun = {
      automation_key: automationKey,
      trigger_type: 'proof_verified',
      trigger_id: proof.id,
      user_id: proof.user_id,
      link_id: link.id,
      source_type: link.source_type,
      source_id: link.source_id,
      target_type: link.target_type,
      target_id: link.target_id,
      action: link.relationship,
      status: 'processing',
      error_message: null,
      updated_at: new Date().toISOString(),
    };
    await writeRun(baseRun);

    try {
      const result = await executeLink({ link, userId: proof.user_id, proof, missionId: resolvedMissionId, campaignId: resolvedCampaignId });
      const completed = await writeRun({ ...baseRun, status: 'completed', result, completed_at: new Date().toISOString() });
      outcomes.push(completed || { ...baseRun, status: 'completed', result });
    } catch (error) {
      const failed = await writeRun({ ...baseRun, status: 'failed', result: {}, error_message: error.message, completed_at: new Date().toISOString() });
      outcomes.push(failed || { ...baseRun, status: 'failed', error_message: error.message });
    }
  }

  return outcomes;
}

async function retryAutomationRun(runId) {
  if (!supabase) throw new Error('Database not available');
  const { data: run, error: runError } = await supabase
    .from('experience_automation_runs')
    .select('*')
    .eq('id', runId)
    .single();
  if (runError || !run) throw new Error('Automation run not found');
  if (run.trigger_type !== 'proof_verified') throw new Error('Only verified proof automations can be retried here');

  const { data: proof, error: proofError } = await supabase
    .from('proof_submissions')
    .select('*')
    .eq('id', run.trigger_id)
    .single();
  if (proofError || !proof) throw new Error('Triggering proof was not found');
  if (proof.submission_state !== 'verified') throw new Error('The triggering proof is no longer verified');

  await supabase
    .from('experience_automation_runs')
    .update({ status: 'processing', error_message: null, completed_at: null, updated_at: new Date().toISOString() })
    .eq('id', run.id);

  return processVerifiedProof({
    proof,
    missionId: proof.proof_bundle?.source_mission_id || proof.proof_bundle?.mission_id || null,
    campaignId: proof.proof_bundle?.campaign_id || null,
  });
}

async function reconcileVerifiedProofs({ limit = 100 } = {}) {
  if (!supabase) throw new Error('Database not available');
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const { data: proofs, error } = await supabase
    .from('proof_submissions')
    .select('*')
    .eq('submission_state', 'verified')
    .order('reviewed_at', { ascending: false })
    .limit(safeLimit);
  if (error) throw error;

  const summary = { proofs_checked: 0, completed: 0, failed: 0, skipped: 0 };
  for (const proof of proofs || []) {
    const outcomes = await processVerifiedProof({
      proof,
      missionId: proof.proof_bundle?.source_mission_id || proof.proof_bundle?.mission_id || null,
      campaignId: proof.proof_bundle?.campaign_id || null,
    });
    summary.proofs_checked += 1;
    summary.completed += outcomes.filter((item) => item?.status === 'completed').length;
    summary.failed += outcomes.filter((item) => item?.status === 'failed').length;
    summary.skipped += outcomes.filter((item) => item?.status === 'skipped').length;
  }
  return summary;
}

module.exports = { processVerifiedProof, retryAutomationRun, reconcileVerifiedProofs };
