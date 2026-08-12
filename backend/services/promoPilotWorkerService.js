const crypto = require('crypto');
const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;
const TERMINAL = new Set(['completed', 'cancelled']);

function tokenFor(job) {
  const secret = process.env.PROMOPILOT_SIGNING_SECRET || process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;
  return crypto.createHmac('sha256', secret).update(job.idempotency_key).digest('base64url').slice(0, 32);
}

async function loadContext(jobId, ownerUserId) {
  if (!supabase) throw new Error('Database not available');
  const { data: job, error } = await supabase.from('promopilot_execution_jobs').select('*').eq('id', jobId).eq('owner_user_id', ownerUserId).maybeSingle();
  if (error) throw error;
  if (!job) throw new Error('Execution job not found or not owned by this user');
  const [{ data: plan, error: planError }, { data: campaign, error: campaignError }] = await Promise.all([
    supabase.from('demand_plans').select('*').eq('id', job.demand_plan_id).single(),
    supabase.from('campaigns').select('*').eq('id', job.campaign_id).maybeSingle(),
  ]);
  if (planError) throw planError;
  if (campaignError) throw campaignError;
  return { job, plan, campaign };
}

async function artifact(context, type, label, referenceType, referenceId, publicUrl = null, metadata = {}) {
  const { job, plan } = context;
  const { data, error } = await supabase.from('promopilot_execution_artifacts').upsert({ execution_job_id: job.id, demand_plan_id: plan.id, campaign_id: job.campaign_id, owner_user_id: job.owner_user_id, artifact_type: type, label, reference_type: referenceType, reference_id: String(referenceId), public_url: publicUrl, metadata, status: 'ready' }, { onConflict: 'execution_job_id,artifact_type' }).select().single();
  if (error) throw error;
  return data;
}

async function upsertRule(context, status = 'active') {
  const { job, plan } = context;
  const triggerEvent = job.payload?.successEvent || plan.measurement?.successEvent || plan.measurement?.success_event || 'verified_outcome';
  const { data, error } = await supabase.from('promopilot_campaign_rules').upsert({ demand_plan_id: plan.id, campaign_id: job.campaign_id, owner_user_id: job.owner_user_id, system_name: job.system_name, trigger_event: triggerEvent, status, configuration: job.payload, updated_at: new Date().toISOString() }, { onConflict: 'demand_plan_id,system_name' }).select().single();
  if (error) throw error;
  return data;
}

async function publishPulse(context) {
  const { job, plan } = context;
  const intent = plan.intent || {};
  const people = plan.people || {};
  const experience = plan.experience || {};
  const path = `/activate?campaign=${job.campaign_id}`;
  const { data, error } = await supabase.from('promopilot_publications').upsert({ demand_plan_id: plan.id, campaign_id: job.campaign_id, owner_user_id: job.owner_user_id, surface: 'pulse', title: plan.title, promise: plan.promise, public_type: experience.publicType || experience.public_type || 'program', location: intent.location || null, starts_at: null, ends_at: null, participant_limit: people.participantLimit || people.participant_limit || null, public_path: path, status: 'active', metadata: { timeframe: intent.timeframe, audience: people.audience }, updated_at: new Date().toISOString() }, { onConflict: 'demand_plan_id,surface' }).select().single();
  if (error) throw error;
  await artifact(context, 'pulse_publication', 'Pulse publication', 'promopilot_publication', data.id, path);
  return { state: 'completed', result: { publication_id: data.id, public_path: path } };
}

async function createSignedQr(context) {
  const token = tokenFor(context.job);
  if (!token) return { state: 'blocked', blocker: 'PROMOPILOT_SIGNING_SECRET or JWT signing secret is required' };
  const targetPath = `/api/demand-plans/go/${token}`;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const action = context.job.payload?.action?.type || 'campaign_entry';
  const { data, error } = await supabase.from('promopilot_signed_links').upsert({ demand_plan_id: context.plan.id, campaign_id: context.job.campaign_id, owner_user_id: context.job.owner_user_id, token_hash: tokenHash, target_path: `/activate?campaign=${context.job.campaign_id}`, action_type: action, metadata: context.job.payload, status: 'active' }, { onConflict: 'demand_plan_id,action_type' }).select().single();
  if (error) throw error;
  await artifact(context, 'signed_qr', 'Signed campaign QR', 'promopilot_signed_link', data.id, targetPath, { token });
  return { state: 'completed', result: { signed_link_id: data.id, public_path: targetPath } };
}

async function prepareMessageJourney(context) {
  const channel = context.job.system_name === 'whatsapp' ? 'whatsapp' : 'email';
  const { data, error } = await supabase.from('promopilot_message_journeys').upsert({ demand_plan_id: context.plan.id, campaign_id: context.job.campaign_id, owner_user_id: context.job.owner_user_id, channel, status: 'awaiting_consent', audience_policy: { consent_required: true, source: 'promopilot' }, templates: [{ stage: 'invitation', text: context.job.payload?.invitation || context.plan.promise }, { stage: 'reminder', text: 'A reminder for the experience you chose to join.' }, { stage: 'return', text: context.plan.return_path?.nextInvitation || 'Come back for what is next.' }], updated_at: new Date().toISOString() }, { onConflict: 'demand_plan_id,channel' }).select().single();
  if (error) throw error;
  await artifact(context, `${channel}_journey`, `${channel} journey`, 'promopilot_message_journey', data.id);
  return { state: 'running', result: { journey_id: data.id, waiting_for: 'consented_audience' } };
}

async function preparePartnerBrief(context) {
  const partnerType = context.job.system_name === 'creator_marketplace' ? 'creator' : 'community';
  const { data, error } = await supabase.from('promopilot_partner_briefs').upsert({ demand_plan_id: context.plan.id, campaign_id: context.job.campaign_id, owner_user_id: context.job.owner_user_id, partner_type: partnerType, title: `${context.plan.title} — ${partnerType} brief`, brief: context.job.payload, status: 'open', updated_at: new Date().toISOString() }, { onConflict: 'demand_plan_id,partner_type' }).select().single();
  if (error) throw error;
  await artifact(context, `${partnerType}_brief`, `${partnerType} brief`, 'promopilot_partner_brief', data.id);
  return { state: 'completed', result: { brief_id: data.id, status: data.status } };
}

async function prepareRule(context) {
  const fundingSystems = new Set(['gems', 'promoshare']);
  const approvalSystems = new Set(['pieces']);
  const status = fundingSystems.has(context.job.system_name) ? 'awaiting_funding' : approvalSystems.has(context.job.system_name) ? 'awaiting_approval' : 'active';
  const rule = await upsertRule(context, status);
  await artifact(context, `${context.job.system_name}_rule`, context.job.label, 'promopilot_campaign_rule', rule.id);
  if (status === 'awaiting_funding') return { state: 'running', result: { rule_id: rule.id, waiting_for: 'funding_reserve' } };
  if (status === 'awaiting_approval') return { state: 'running', result: { rule_id: rule.id, waiting_for: 'piece_terms_approval' } };
  return { state: 'completed', result: { rule_id: rule.id, status } };
}

async function preparePromoPush(context) {
  const { data: existingArtifact, error: existingArtifactError } = await supabase.from('promopilot_execution_artifacts').select('*').eq('execution_job_id', context.job.id).eq('artifact_type', 'promopush_campaign').maybeSingle();
  if (existingArtifactError) throw existingArtifactError;
  if (existingArtifact) return { state: 'completed', result: { promopush_campaign_id: existingArtifact.reference_id, status: 'draft', reused: true } };
  const campaign = context.campaign;
  const momentId = campaign?.moment_id;
  if (!momentId) return { state: 'blocked', blocker: 'Link a Moment before PromoPush can create attributable distribution' };
  const latitude = Number(campaign.geo_center_lat);
  const longitude = Number(campaign.geo_center_lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { state: 'blocked', blocker: 'Set campaign map coordinates before PromoPush preparation' };
  const start = campaign.distribution_starts_at || campaign.start_date;
  const end = campaign.distribution_ends_at || campaign.end_date;
  if (!start || !end) return { state: 'blocked', blocker: 'Set a valid PromoPush distribution window' };

  const { data, error } = await supabase.from('promopush_campaigns').insert({ title: campaign.title, linked_moment_id: momentId, host_id: context.job.owner_user_id, brand_id: campaign.brand_id || context.job.owner_user_id, geo_radius_meters: campaign.geo_radius_meters || 5000, geo_center_lat: latitude, geo_center_lng: longitude, geo_label: campaign.geo_label, start_time: start, end_time: end, budget: campaign.budget, reward_rules: {}, status: 'draft', created_by: context.job.owner_user_id }).select().single();
  if (error) throw error;
  await artifact(context, 'promopush_campaign', 'PromoPush draft', 'promopush_campaign', data.id);
  return { state: 'completed', result: { promopush_campaign_id: data.id, status: 'draft' } };
}

const adapters = {
  pulse: publishPulse,
  qr: createSignedQr,
  whatsapp: prepareMessageJourney,
  email: prepareMessageJourney,
  creator_marketplace: preparePartnerBrief,
  communities: preparePartnerBrief,
  promopush: preparePromoPush,
  referrals: prepareRule,
  reviews: prepareRule,
  journeys: prepareRule,
  growth_events: prepareRule,
  gems: prepareRule,
  promopoints: prepareRule,
  pieces: prepareRule,
  promokeys: prepareRule,
  memories: prepareRule,
  promoshare: prepareRule,
};

async function processJob(jobId, ownerUserId) {
  const context = await loadContext(jobId, ownerUserId);
  if (TERMINAL.has(context.job.status)) return context.job;
  if (!['queued', 'failed', 'blocked'].includes(context.job.status)) throw new Error(`Job cannot be processed from ${context.job.status}`);
  const adapter = adapters[context.job.system_name];
  if (!adapter) throw new Error(`No authoritative adapter for ${context.job.system_name}`);

  const now = new Date().toISOString();
  const { error: claimError } = await supabase.from('promopilot_execution_jobs').update({ status: 'running', started_at: now, blocker: null, error_message: null, updated_at: now }).eq('id', context.job.id).eq('owner_user_id', ownerUserId);
  if (claimError) throw claimError;

  try {
    const outcome = await adapter(context);
    const update = { status: outcome.state, result: outcome.result || {}, blocker: outcome.blocker || null, updated_at: new Date().toISOString() };
    if (outcome.state === 'completed') update.completed_at = update.updated_at;
    const { data, error } = await supabase.from('promopilot_execution_jobs').update(update).eq('id', context.job.id).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    await supabase.from('promopilot_execution_jobs').update({ status: 'failed', error_message: error.message, failed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', context.job.id);
    throw error;
  }
}

async function processCampaign(campaignId, ownerUserId) {
  const { data: jobs, error } = await supabase.from('promopilot_execution_jobs').select('id').eq('campaign_id', campaignId).eq('owner_user_id', ownerUserId).eq('status', 'queued').order('created_at');
  if (error) throw error;
  const results = [];
  for (const job of jobs || []) {
    try { results.push(await processJob(job.id, ownerUserId)); }
    catch (error) { results.push({ id: job.id, status: 'failed', error_message: error.message }); }
  }
  return results;
}

module.exports = { tokenFor, processJob, processCampaign };
