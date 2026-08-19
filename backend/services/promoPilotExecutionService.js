const crypto = require('crypto');
const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

const stableKey = (planId, jobKey) => crypto.createHash('sha256').update(`promopilot:${planId}:${jobKey}`).digest('hex');

function enabledValues(plan) {
  return (plan.shared_value || plan.sharedValue || []).filter((value) => value.enabled !== false);
}

function enabledChannels(plan) {
  return (plan.distribution || []).filter((channel) => channel.enabled);
}

function spec({ key, type, system, label, required = false, blocker = null, payload = {} }) {
  return { jobKey: key, jobType: type, systemName: system, label, required, status: blocker ? 'blocked' : 'ready', blocker, payload };
}

function buildExecutionSpecs(plan) {
  const intent = plan.intent || {};
  const people = plan.people || {};
  const experience = plan.experience || {};
  const values = enabledValues(plan);
  const channels = enabledChannels(plan);
  const specs = [];

  const publicBlocker = !intent.timeframe ? 'Campaign timing is required' : (!people.participantLimit ? 'Participation target is required' : null);
  if (channels.some((item) => item.channel === 'pulse')) specs.push(spec({ key: 'distribution:pulse', type: 'distribution', system: 'pulse', label: 'Publish the experience to Pulse', required: true, blocker: publicBlocker, payload: { experience, intent, people } }));
  if (channels.some((item) => item.channel === 'promopush')) specs.push(spec({ key: 'distribution:promopush', type: 'distribution', system: 'promopush', label: 'Prepare managed PromoPush distribution', blocker: !intent.timeframe ? 'Distribution window is required' : null, payload: { intent, people } }));
  if (channels.some((item) => item.channel === 'whatsapp')) specs.push(spec({ key: 'distribution:whatsapp', type: 'distribution', system: 'whatsapp', label: 'Prepare consent-aware WhatsApp invitations', payload: { invitation: experience.invitation, consentRequired: true } }));
  if (channels.some((item) => item.channel === 'qr')) specs.push(spec({ key: 'distribution:qr', type: 'fulfillment', system: 'qr', label: 'Create signed QR campaign assets', blocker: !intent.location ? 'A place is required for physical QR fulfillment' : null, payload: { location: intent.location, action: (experience.actions || []).find((action) => action.required) } }));
  if (channels.some((item) => item.channel === 'creator')) specs.push(spec({ key: 'distribution:creator', type: 'distribution', system: 'creator_marketplace', label: 'Open a creator brief', payload: { audience: people.audience, invitation: experience.invitation, rightsApprovalRequired: true } }));
  if (channels.some((item) => item.channel === 'community')) specs.push(spec({ key: 'distribution:community', type: 'distribution', system: 'communities', label: 'Prepare community partner invitations', payload: { audience: people.audience, sponsorConsentRequired: true } }));
  if (channels.some((item) => item.channel === 'referral')) specs.push(spec({ key: 'relationship:referral', type: 'relationship', system: 'referrals', label: 'Create the campaign referral path', payload: { qualificationEvent: plan.measurement?.successEvent || plan.measurement?.success_event } }));

  for (const value of values) {
    const amountMissing = value.fundingRequired && (!value.amount || Number(value.amount) <= 0);
    const systemMap = { gems: 'gems', promopoints: 'promopoints', piece: 'pieces', promokey: 'promokeys', memory: 'memories', promoshare: 'promoshare' };
    const labelMap = { gems: 'Reserve funded Gems', promopoints: 'Create the PromoPoints contribution rule', piece: 'Prepare Piece earning terms', promokey: 'Create the PromoKey unlock rule', memory: 'Create the Memory issuance rule', promoshare: 'Prepare the PromoShare pool' };
    specs.push(spec({
      key: `value:${value.type}`,
      type: 'value',
      system: systemMap[value.type] || value.type,
      label: labelMap[value.type] || `Prepare ${value.type}`,
      required: value.optional !== true,
      blocker: amountMissing ? `${labelMap[value.type] || value.type} requires an amount` : null,
      payload: { ...value, successEvent: plan.measurement?.successEvent || plan.measurement?.success_event, participantLimit: people.participantLimit },
    }));
  }

  if (plan.return_path?.reviewPrompt || plan.returnPath?.reviewPrompt) specs.push(spec({ key: 'relationship:review', type: 'relationship', system: 'reviews', label: 'Schedule the honest review request', payload: { positiveRatingNotRequired: true } }));
  if (plan.return_path?.loyaltyFollowUp || plan.returnPath?.loyaltyFollowUp) specs.push(spec({ key: 'relationship:return', type: 'relationship', system: 'journeys', label: 'Prepare the return invitation', payload: { invitation: plan.return_path?.nextInvitation || plan.returnPath?.nextInvitation } }));
  specs.push(spec({ key: 'measurement:impact', type: 'measurement', system: 'growth_events', label: 'Open the Impact measurement stream', required: true, blocker: !plan.measurement?.successEvent && !plan.measurement?.success_event ? 'A success event is required' : null, payload: plan.measurement || {} }));

  return specs;
}

async function getOwnedPlan(campaignId, ownerUserId) {
  if (!supabase) throw new Error('Database not available');
  const { data, error } = await supabase.from('demand_plans').select('*').eq('campaign_id', campaignId).eq('owner_user_id', ownerUserId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('PromoPilot plan not found or not owned by this user');
  return data;
}

async function getManifest(campaignId, ownerUserId) {
  const plan = await getOwnedPlan(campaignId, ownerUserId);
  const { data: jobs, error } = await supabase.from('promopilot_execution_jobs').select('*').eq('demand_plan_id', plan.id).order('created_at');
  if (error) throw error;
  return { plan, jobs: jobs || [], summary: summarize(jobs || []) };
}

function summarize(jobs) {
  return jobs.reduce((summary, job) => { summary.total += 1; summary[job.status] = (summary[job.status] || 0) + 1; if (job.required) summary.required += 1; return summary; }, { total: 0, required: 0, blocked: 0, ready: 0, queued: 0, running: 0, completed: 0, failed: 0 });
}

async function prepare(campaignId, ownerUserId) {
  const plan = await getOwnedPlan(campaignId, ownerUserId);
  const specs = buildExecutionSpecs(plan);
  const { data: existing, error: existingError } = await supabase.from('promopilot_execution_jobs').select('*').eq('demand_plan_id', plan.id);
  if (existingError) throw existingError;
  const byKey = new Map((existing || []).map((job) => [job.job_key, job]));

  for (const item of specs) {
    const current = byKey.get(item.jobKey);
    if (current && ['queued', 'running', 'completed'].includes(current.status)) continue;
    const payload = {
      demand_plan_id: plan.id,
      campaign_id: campaignId,
      owner_user_id: ownerUserId,
      job_key: item.jobKey,
      job_type: item.jobType,
      system_name: item.systemName,
      label: item.label,
      required: item.required,
      status: item.status,
      blocker: item.blocker,
      payload: item.payload,
      idempotency_key: stableKey(plan.id, item.jobKey),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('promopilot_execution_jobs').upsert(payload, { onConflict: 'demand_plan_id,job_key' });
    if (error) throw error;
  }

  await supabase.from('promopilot_execution_history').insert({ demand_plan_id: plan.id, campaign_id: campaignId, actor_user_id: ownerUserId, action: 'prepared', from_status: plan.status, to_status: 'ready', metadata: { job_count: specs.length } });
  await supabase.from('demand_plans').update({ status: specs.some((item) => item.required && item.status === 'blocked') ? 'draft' : 'ready', updated_at: new Date().toISOString() }).eq('id', plan.id);
  return getManifest(campaignId, ownerUserId);
}

async function queueLaunch(campaignId, ownerUserId, confirmation) {
  if (confirmation !== true) throw new Error('Explicit launch confirmation is required');
  const manifest = await getManifest(campaignId, ownerUserId);
  if (!manifest.jobs.length) throw new Error('Prepare the execution manifest before launch');
  const requiredBlockers = manifest.jobs.filter((job) => job.required && job.status === 'blocked');
  if (requiredBlockers.length) throw new Error(`Resolve required blockers before launch: ${requiredBlockers.map((job) => job.label).join(', ')}`);

  const now = new Date().toISOString();
  const { error } = await supabase.from('promopilot_execution_jobs').update({ status: 'queued', queued_at: now, updated_at: now }).eq('demand_plan_id', manifest.plan.id).eq('status', 'ready');
  if (error) throw error;
  await supabase.from('demand_plans').update({ status: 'active', updated_at: now }).eq('id', manifest.plan.id);
  await supabase.from('promopilot_execution_history').insert({ demand_plan_id: manifest.plan.id, campaign_id: campaignId, actor_user_id: ownerUserId, action: 'launch_queued', from_status: manifest.plan.status, to_status: 'active', note: 'Explicitly confirmed by plan owner' });
  return getManifest(campaignId, ownerUserId);
}

module.exports = { buildExecutionSpecs, summarize, getManifest, prepare, queueLaunch };
