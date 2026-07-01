const { supabase } = require('../lib/supabase');
const promoShareService = require('./promoShareService');

const ACTION_WEIGHTS = {
  impression: 0.05,
  view: 0.25,
  click: 0.75,
  like: 1,
  engage: 1,
  share: 3,
  repost: 3,
  comment: 2,
  save: 1.5,
  signup: 5,
  conversion: 8,
  purchase: 10,
  proof_verified: 12
};

const VERIFIED_ACTIONS = new Set(['share', 'repost', 'signup', 'conversion', 'purchase', 'proof_verified']);
const ORGANIC_POINTS = { view: 0.25, like: 1, save: 1, comment: 2, share: 3 };
const ORGANIC_DAILY_CAPS = { view: 5, like: 20, save: 10, comment: 10, share: 10 };

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function calculatePoints(actionType, campaign, metadata = {}) {
  const rewards = campaign?.reward_config || {};
  const explicit = rewards?.points_by_action?.[actionType];
  if (Number.isFinite(Number(explicit))) return Number(explicit);

  const base = Number(rewards?.base_points || 0);
  const weight = ACTION_WEIGHTS[actionType] || 0;
  const multiplier = Number(metadata.multiplier || rewards?.point_multiplier || 1);
  return Math.max(0, Math.round((base || weight) * multiplier));
}

function shouldAwardPromoShare(actionType, campaign) {
  const config = campaign?.promoshare_config || {};
  if (config.enabled === false) return false;

  const actions = Array.isArray(config.actions) && config.actions.length > 0
    ? new Set(config.actions)
    : VERIFIED_ACTIONS;

  return actions.has(actionType);
}

async function getCampaign(campaignId) {
  if (!supabase || !isUuid(campaignId)) return null;

  const { data, error } = await supabase
    .from('content_distribution_campaigns')
    .select('*')
    .eq('id', campaignId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getCampaignDetail(campaignId) {
  if (!supabase || !isUuid(campaignId)) return null;

  const { data, error } = await supabase
    .from('content_distribution_campaigns')
    .select('*, content_distribution_assets(*)')
    .eq('id', campaignId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createCampaign(ownerId, payload) {
  if (!supabase) throw new Error('Database not available');

  const insertPayload = {
    owner_id: ownerId,
    sponsor_id: isUuid(payload.sponsor_id) ? payload.sponsor_id : null,
    linked_moment_id: isUuid(payload.linked_moment_id) ? payload.linked_moment_id : null,
    title: payload.title,
    description: payload.description || null,
    objective_type: payload.objective_type || 'engagement',
    status: payload.status || 'draft',
    starts_at: payload.starts_at || null,
    ends_at: payload.ends_at || null,
    reward_config: payload.reward_config || {},
    promoshare_config: payload.promoshare_config || {},
    attribution_config: payload.attribution_config || {},
    budget_amount: Number(payload.budget_amount || 0),
    budget_currency: payload.budget_currency || 'USD',
    metadata: payload.metadata || {}
  };

  const { data, error } = await supabase
    .from('content_distribution_campaigns')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function addAsset(campaignId, payload, actorId) {
  if (!supabase) throw new Error('Database not available');

  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error('Content distribution campaign not found');
  if (campaign.owner_id !== actorId) throw new Error('Not authorized to manage this campaign');

  const { data, error } = await supabase
    .from('content_distribution_assets')
    .insert({
      campaign_id: campaignId,
      content_item_id: isUuid(payload.content_item_id) ? payload.content_item_id : null,
      creator_id: isUuid(payload.creator_id) ? payload.creator_id : null,
      title: payload.title,
      description: payload.description || null,
      asset_type: payload.asset_type || 'content',
      target_url: payload.target_url || null,
      media_url: payload.media_url || null,
      status: payload.status || 'active',
      attribution_slug: payload.attribution_slug || null,
      metadata: payload.metadata || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function listCampaigns({ ownerId = null, status = 'active', limit = 25 } = {}) {
  if (!supabase) return [];

  let query = supabase
    .from('content_distribution_campaigns')
    .select('*, content_distribution_assets(*)')
    .order('created_at', { ascending: false })
    .limit(Math.min(Number(limit) || 25, 100));

  if (ownerId) query = query.eq('owner_id', ownerId);
  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function recordAction(userId, payload) {
  if (!supabase) throw new Error('Database not available');

  const campaign = await getCampaign(payload.campaign_id);
  if (!campaign) throw new Error('Content distribution campaign not found');
  if (campaign.status !== 'active' && campaign.owner_id !== userId) {
    throw new Error('Content distribution campaign is not active');
  }

  const actionType = payload.action_type || 'engage';
  const verified = Boolean(payload.verified || VERIFIED_ACTIONS.has(actionType));
  const pointsAwarded = calculatePoints(actionType, campaign, payload.metadata);
  const promoshareEntries = shouldAwardPromoShare(actionType, campaign)
    ? Number(campaign.promoshare_config?.entries_by_action?.[actionType] || campaign.promoshare_config?.entries_per_action || 1)
    : 0;

  const { data: action, error } = await supabase
    .from('content_distribution_actions')
    .insert({
      campaign_id: campaign.id,
      asset_id: isUuid(payload.asset_id) ? payload.asset_id : null,
      user_id: userId || null,
      parent_action_id: isUuid(payload.parent_action_id) ? payload.parent_action_id : null,
      action_type: actionType,
      channel: payload.channel || null,
      attribution_code: payload.attribution_code || null,
      source_url: payload.source_url || null,
      destination_url: payload.destination_url || null,
      value_amount: Number(payload.value_amount || 0),
      value_currency: payload.value_currency || campaign.budget_currency || 'USD',
      promoshare_entries_awarded: promoshareEntries,
      points_awarded: pointsAwarded,
      verified,
      metadata: payload.metadata || {}
    })
    .select()
    .single();

  if (error) throw error;

  if (userId) {
    await updateUserStats({ campaignId: campaign.id, userId, actionType, pointsAwarded, promoshareEntries, verified });
    await issueRewards({ campaign, action, userId, pointsAwarded, promoshareEntries, actionType, verified });
  }

  return action;
}

async function recordOrganicAction(userId, payload) {
  if (!supabase) throw new Error('Database not available');
  const actionType = payload.action_type;
  if (!Object.prototype.hasOwnProperty.call(ORGANIC_POINTS, actionType)) {
    throw new Error('Unsupported engagement action');
  }
  if (!payload.reference_id || !payload.reference_type) throw new Error('Content reference is required');

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count, error: countError } = await supabase
    .from('engagement_reward_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .gte('created_at', startOfDay.toISOString());
  if (countError) throw countError;

  const cap = ORGANIC_DAILY_CAPS[actionType];
  if ((count || 0) >= cap) {
    return { rewarded: false, capped: true, points_earned: 0, promoshare_entries: 0 };
  }

  const verified = actionType === 'share' && Boolean(payload.attribution_code || payload.destination_url);
  const entries = verified ? 1 : 0;
  const { data: event, error } = await supabase
    .from('engagement_reward_events')
    .insert({
      user_id: userId,
      action_type: actionType,
      reference_type: String(payload.reference_type),
      reference_id: String(payload.reference_id),
      points_awarded: ORGANIC_POINTS[actionType],
      promoshare_entries: entries,
      verified,
      metadata: payload.metadata || {}
    })
    .select()
    .single();

  if (error?.code === '23505') {
    return { rewarded: false, duplicate: true, points_earned: 0, promoshare_entries: 0 };
  }
  if (error) throw error;

  const { error: creditError } = await supabase.rpc('credit_user_earning', {
    p_user_id: userId,
    p_earning_type: `organic_${actionType}`,
    p_amount: ORGANIC_POINTS[actionType],
    p_currency: 'points',
    p_source_table: 'engagement_reward_events',
    p_source_transaction_id: event.id,
    p_metadata: { reference_type: payload.reference_type, reference_id: String(payload.reference_id), verified }
  });
  if (creditError) throw creditError;

  if (entries > 0) {
    await promoShareService.recordVerifiedAction(userId, `organic_${actionType}`, {
      source_type: 'engagement_reward',
      source_id: event.id,
      entry_count: entries,
      weight_value: ACTION_WEIGHTS[actionType] || 1,
      verified
    });
  }
  return { rewarded: true, event, points_earned: ORGANIC_POINTS[actionType], promoshare_entries: entries };
}

async function updateUserStats({ campaignId, userId, actionType, pointsAwarded, promoshareEntries, verified }) {
  const now = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from('content_distribution_user_stats')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) throw existingError;

  const counters = {
    impressions_count: actionType === 'impression' ? 1 : 0,
    views_count: actionType === 'view' ? 1 : 0,
    clicks_count: actionType === 'click' ? 1 : 0,
    engagements_count: ['engage', 'comment', 'save'].includes(actionType) ? 1 : 0,
    shares_count: ['share', 'repost'].includes(actionType) ? 1 : 0,
    conversions_count: ['signup', 'conversion', 'purchase'].includes(actionType) ? 1 : 0,
    verified_actions_count: verified ? 1 : 0
  };

  const distributionScore = ACTION_WEIGHTS[actionType] || 0;

  if (!existing) {
    const { error } = await supabase
      .from('content_distribution_user_stats')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        first_action_at: now,
        last_action_at: now,
        ...counters,
        points_earned: pointsAwarded,
        promoshare_entries_earned: promoshareEntries,
        distribution_score: distributionScore
      });

    if (error) throw error;
    return;
  }

  const next = {
    last_action_at: now,
    impressions_count: Number(existing.impressions_count || 0) + counters.impressions_count,
    views_count: Number(existing.views_count || 0) + counters.views_count,
    clicks_count: Number(existing.clicks_count || 0) + counters.clicks_count,
    engagements_count: Number(existing.engagements_count || 0) + counters.engagements_count,
    shares_count: Number(existing.shares_count || 0) + counters.shares_count,
    conversions_count: Number(existing.conversions_count || 0) + counters.conversions_count,
    verified_actions_count: Number(existing.verified_actions_count || 0) + counters.verified_actions_count,
    points_earned: Number(existing.points_earned || 0) + pointsAwarded,
    promoshare_entries_earned: Number(existing.promoshare_entries_earned || 0) + promoshareEntries,
    distribution_score: Number(existing.distribution_score || 0) + distributionScore,
    updated_at: now
  };

  const { error } = await supabase
    .from('content_distribution_user_stats')
    .update(next)
    .eq('id', existing.id);

  if (error) throw error;
}

async function issueRewards({ campaign, action, userId, pointsAwarded, promoshareEntries, actionType, verified }) {
  const ledgers = [];

  if (pointsAwarded > 0) {
    ledgers.push({
      campaign_id: campaign.id,
      action_id: action.id,
      user_id: userId,
      reward_type: 'points',
      reward_amount: pointsAwarded,
      status: 'issued',
      issued_at: new Date().toISOString(),
      metadata: { action_type: actionType }
    });

    const { error: creditError } = await supabase.rpc('credit_user_earning', {
      p_user_id: userId,
      p_earning_type: `content_distribution_${actionType}`,
      p_amount: pointsAwarded,
      p_currency: 'points',
      p_source_table: 'content_distribution_actions',
      p_source_transaction_id: action.id,
      p_metadata: { campaign_id: campaign.id, verified }
    });
    if (creditError) throw creditError;
  }

  if (promoshareEntries > 0) {
    ledgers.push({
      campaign_id: campaign.id,
      action_id: action.id,
      user_id: userId,
      reward_type: 'promoshare_entry',
      reward_amount: promoshareEntries,
      status: 'issued',
      issued_at: new Date().toISOString(),
      metadata: { action_type: actionType, verified }
    });

    await promoShareService.recordVerifiedAction(userId, `content_distribution_${actionType}`, {
      source_type: 'content_distribution',
      source_id: action.id,
      campaign_id: campaign.id,
      linked_moment_id: campaign.linked_moment_id,
      entry_count: promoshareEntries,
      weight_value: ACTION_WEIGHTS[actionType] || 1,
      verified
    });
  }

  const fundedGems = verified
    ? Number(campaign.reward_config?.gems_by_action?.[actionType] || 0)
    : 0;
  if (fundedGems > 0) {
    const { data: gemsIssued, error: gemsError } = await supabase.rpc('award_funded_campaign_gems', {
      p_campaign_id: campaign.id,
      p_action_id: action.id,
      p_user_id: userId,
      p_amount: fundedGems
    });
    if (gemsError) throw gemsError;
    if (gemsIssued) {
      ledgers.push({
        campaign_id: campaign.id,
        action_id: action.id,
        user_id: userId,
        reward_type: 'gems',
        reward_amount: fundedGems,
        status: 'issued',
        issued_at: new Date().toISOString(),
        metadata: { action_type: actionType, funded: true }
      });
    }
  }

  if (ledgers.length > 0) {
    const { error } = await supabase
      .from('content_distribution_reward_ledger')
      .insert(ledgers);

    if (error) throw error;
  }
}

async function getLeaderboard(campaignId, limit = 25) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('content_distribution_user_stats')
    .select('*, user:user_id(id, username, display_name, avatar_url)')
    .eq('campaign_id', campaignId)
    .order('distribution_score', { ascending: false })
    .limit(Math.min(Number(limit) || 25, 100));

  if (error) throw error;
  return (data || []).map((row, index) => ({ ...row, rank_position: index + 1 }));
}

module.exports = {
  createCampaign,
  addAsset,
  getCampaignDetail,
  listCampaigns,
  recordAction,
  recordOrganicAction,
  getLeaderboard
};
