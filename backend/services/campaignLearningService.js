const crypto = require('crypto');
const { supabase: serviceSupabase } = require('../lib/supabase');
const demandEventService = require('./demandEventService');

const supabase = global.supabase || serviceSupabase || null;

function slugify(value) {
  return String(value || 'campaign-pattern').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'campaign-pattern';
}

function templateBlueprint(plan) {
  return {
    version: plan.version,
    goal: plan.intent?.goal || 'bring_people',
    experience: {
      publicType: plan.experience?.publicType || plan.experience?.public_type || 'experience',
      actions: plan.experience?.actions || [],
    },
    sharedValue: (plan.shared_value || []).map((item) => ({ type: item.type, enabled: item.enabled !== false, optional: item.optional === true, fundingRequired: item.fundingRequired === true })),
    distribution: (plan.distribution || []).map((item) => ({ channel: item.channel, enabled: item.enabled === true })),
    returnPath: {
      reviewPrompt: Boolean(plan.return_path?.reviewPrompt),
      referralPrompt: Boolean(plan.return_path?.referralPrompt),
      loyaltyFollowUp: Boolean(plan.return_path?.loyaltyFollowUp),
    },
    measurement: {
      successEvent: plan.measurement?.successEvent || plan.measurement?.success_event,
      supportingEvents: plan.measurement?.supportingEvents || plan.measurement?.supporting_events || [],
    },
  };
}

function confidenceFor(denominator) {
  if (denominator < 10) return 'insufficient';
  if (denominator < 30) return 'low';
  if (denominator < 100) return 'medium';
  return 'high';
}

function recommendation(key, category, title, rationale, denominator, evidence, suggestedPatch = {}) {
  return { recommendationKey: key, category, title, rationale, confidence: confidenceFor(denominator), evidence, suggestedPatch };
}

function buildRecommendations(summary, benchmark = {}) {
  const counts = summary.counts || {};
  const rates = summary.rates || {};
  const items = [];
  if (!summary.total_events || !counts.discovery) {
    items.push(recommendation('instrument-discovery', 'instrumentation', 'Establish a trustworthy discovery baseline', 'Promorang cannot distinguish weak reach from missing measurement yet. Verify Pulse, PromoPush, QR and message delivery instrumentation before changing the campaign idea.', 0, { total_events: summary.total_events || 0, discovery: counts.discovery || 0 }));
    return items;
  }
  if (counts.discovery >= 20 && rates.discovery_to_interest < 20) items.push(recommendation('strengthen-invitation', 'invitation', 'Make the invitation easier to understand', 'Enough people encountered the campaign, but too few showed interest. Test the promise and first action before buying more reach.', counts.discovery, { discovery: counts.discovery, interest: counts.interest, rate: rates.discovery_to_interest }, { experience: { invitation: 'clarify' } }));
  if (counts.interest >= 20 && rates.interest_to_participation < 25) items.push(recommendation('reduce-participation-friction', 'participation', 'Remove one step before participation', 'Interest is present, but participation is not following. Review access, timing, location and proof expectations.', counts.interest, { interest: counts.interest, participation: counts.participation, rate: rates.interest_to_participation }, { experience: { participationFriction: 'reduce' } }));
  if (counts.participation >= 10 && rates.participation_to_conversion < 20) items.push(recommendation('align-proof-and-value', 'conversion', 'Realign the action, proof and participant value', 'People participate but too few reach the verified outcome. The action may be unclear, the proof may be too demanding, or the value may arrive too late.', counts.participation, { participation: counts.participation, conversion: counts.conversion, rate: rates.participation_to_conversion }, { experience: { proofAndValue: 'review' } }));
  if (counts.conversion >= 10 && rates.conversion_to_review < 25) items.push(recommendation('invite-honest-review', 'review', 'Ask for reflection at the moment of earned trust', 'Verified outcomes are occurring without enough review evidence. Trigger a neutral review request after fulfillment, without requiring a positive rating.', counts.conversion, { conversion: counts.conversion, review: counts.review, rate: rates.conversion_to_review }, { returnPath: { reviewPrompt: true } }));
  if (counts.conversion >= 10 && rates.conversion_to_loyalty < 15) items.push(recommendation('design-next-invitation', 'loyalty', 'Give successful participants a relevant next step', 'Conversion is not yet becoming return behavior. Use the outcome to shape the next invitation rather than sending a generic reminder.', counts.conversion, { conversion: counts.conversion, loyalty: counts.loyalty, rate: rates.conversion_to_loyalty }, { returnPath: { loyaltyFollowUp: true } }));
  if (benchmark.eligible && Number(benchmark.difference_points) <= -10) items.push(recommendation('below-own-benchmark', 'conversion', 'Investigate why this campaign trails your own pattern', 'This campaign is materially below the merchant’s median for the same goal. Compare audience, timing, action and proof—not the category average.', Math.max(counts.participation || 0, 10), benchmark));
  return items;
}

async function refreshLearning(campaignId, ownerUserId) {
  if (!supabase) throw new Error('Database not available');
  const intelligence = await demandEventService.getCampaignIntelligence(campaignId, ownerUserId);
  const recommendations = buildRecommendations(intelligence.summary, intelligence.benchmark);
  const snapshot = { demand_plan_id: intelligence.plan.id, campaign_id: campaignId, owner_user_id: ownerUserId, event_watermark: intelligence.summary.last_event_at, summary: intelligence.summary, benchmark: intelligence.benchmark };
  const { error: snapshotError } = await supabase.from('campaign_learning_snapshots').insert(snapshot);
  if (snapshotError) throw snapshotError;
  for (const item of recommendations) {
    const fingerprint = crypto.createHash('sha256').update(`${intelligence.plan.id}:${item.recommendationKey}`).digest('hex').slice(0, 24);
    const { error } = await supabase.from('campaign_recommendations').upsert({ demand_plan_id: intelligence.plan.id, campaign_id: campaignId, owner_user_id: ownerUserId, recommendation_key: fingerprint, category: item.category, title: item.title, rationale: item.rationale, confidence: item.confidence, evidence: item.evidence, suggested_patch: item.suggestedPatch, status: 'proposed', updated_at: new Date().toISOString() }, { onConflict: 'demand_plan_id,recommendation_key' });
    if (error) throw error;
  }
  return { ...intelligence, recommendations };
}

async function saveTemplate(campaignId, ownerUserId, input = {}) {
  if (!supabase) throw new Error('Database not available');
  const intelligence = await demandEventService.getCampaignIntelligence(campaignId, ownerUserId);
  const title = String(input.title || `${intelligence.plan.title} pattern`).trim().slice(0, 120);
  const slug = slugify(input.slug || title);
  const { data, error } = await supabase.from('demand_plan_templates').upsert({ owner_user_id: ownerUserId, organization_id: intelligence.plan.organization_id || null, source_demand_plan_id: intelligence.plan.id, title, slug, description: input.description || null, goal: intelligence.plan.intent?.goal || 'bring_people', visibility: input.visibility || 'private', blueprint: templateBlueprint(intelligence.plan), evidence_summary: { summary: intelligence.summary, benchmark: intelligence.benchmark }, updated_at: new Date().toISOString() }, { onConflict: 'owner_user_id,slug' }).select().single();
  if (error) throw error;
  return data;
}

async function listTemplates(ownerUserId) {
  if (!supabase) throw new Error('Database not available');
  const { data, error } = await supabase.from('demand_plan_templates').select('*').or(`owner_user_id.eq.${ownerUserId},visibility.eq.public`).eq('status', 'active').order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getLearning(campaignId, ownerUserId) {
  if (!supabase) throw new Error('Database not available');
  const intelligence = await demandEventService.getCampaignIntelligence(campaignId, ownerUserId);
  const { data, error } = await supabase.from('campaign_recommendations').select('*').eq('demand_plan_id', intelligence.plan.id).order('created_at', { ascending: false });
  if (error) throw error;
  return { ...intelligence, recommendations: data || [] };
}

module.exports = { slugify, templateBlueprint, confidenceFor, buildRecommendations, refreshLearning, saveTemplate, listTemplates, getLearning };
