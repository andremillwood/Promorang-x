const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const roleService = require('../services/roleService');

const CHANNELS = [
  { type: 'qr_code', label: 'QR Code' },
  { type: 'meta_ads', label: 'Meta Ads' },
  { type: 'direct_link', label: 'Direct Link' },
  { type: 'creator_link', label: 'Creator Link' },
  { type: 'street_activation', label: 'Street Activation' },
];

function isAdmin(user = {}) {
  const roles = [user.role, user.user_type, ...(Array.isArray(user.roles) ? user.roles : [])].filter(Boolean);
  return roles.some((role) => ['admin', 'master_admin', 'moderator'].includes(role)) ||
    ['andremillwood@gmail.com', 'admin@promorang.com', 'demo@promorang.com'].includes(user.email);
}

function requireAdmin(req, res, next) {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

function requireDb(res) {
  if (supabase) return true;
  res.status(503).json({ error: 'Supabase is not configured' });
  return false;
}

function publicBaseUrl(req) {
  return (
    process.env.FRONTEND_URL ||
    req.headers.origin ||
    'https://promorang.co'
  ).split(',')[0].replace(/\/$/, '');
}

function hashIp(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  return crypto.createHash('sha256').update(String(ip)).digest('hex');
}

function codeFor(channelType) {
  return `${channelType.replace(/_/g, '-')}-${crypto.randomBytes(5).toString('hex')}`;
}

function normalizeEventType(value, fallback = 'click') {
  const allowed = new Set([
    'impression',
    'click',
    'scan',
    'join',
    'move_completed',
    'proof_submitted',
    'proof_verified',
    'reward_issued',
    'geo_interaction',
  ]);
  return allowed.has(value) ? value : fallback;
}

function isDuplicateError(error) {
  return error?.code === '23505' || /duplicate key/i.test(error?.message || '');
}

function nullableEq(query, column, value) {
  return value ? query.eq(column, value) : query.is(column, null);
}

async function findExistingEvent({ campaignId, channelId, eventType, userId, moveId, proofSubmissionId, rewardId }) {
  let query = supabase
    .from('promopush_events')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('event_type', eventType)
    .order('created_at', { ascending: false })
    .limit(1);

  query = nullableEq(query, 'channel_id', channelId || null);

  if (eventType === 'move_completed' && userId && moveId) {
    query = query.eq('user_id', userId).eq('move_id', moveId);
  } else if (['proof_submitted', 'proof_verified'].includes(eventType) && proofSubmissionId) {
    query = query.eq('proof_submission_id', proofSubmissionId);
  } else if (eventType === 'reward_issued' && rewardId) {
    query = query.eq('reward_id', rewardId);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data || null;
}

async function createCreatorEarning({ campaignId, channel, event }) {
  if (event.event_type !== 'proof_verified' || !channel?.owner_user_id || Number(channel.reward_per_verified_action) <= 0) {
    return;
  }

  const { error } = await supabase.from('promopush_creator_earnings').insert({
    campaign_id: campaignId,
    channel_id: channel.id,
    creator_id: channel.owner_user_id,
    event_id: event.id,
    amount: channel.reward_per_verified_action,
  });

  if (error && !isDuplicateError(error)) throw error;
}

function roleForApplicant(applicantRole) {
  if (applicantRole === 'promoter') return 'promoter';
  if (applicantRole === 'creator') return 'creator';
  if (applicantRole === 'marketing') return 'marketing';
  return null;
}

async function grantPromoPushRole(userId, role, grantedBy) {
  if (!userId || !role) return;

  try {
    await roleService.grantRole(userId, role, grantedBy);
  } catch (rpcError) {
    console.warn('[PromoPush] role RPC grant failed, falling back to table update:', rpcError.message);
    try {
      const { data: existingRole, error: existingRoleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .maybeSingle();
      if (existingRoleError) throw existingRoleError;
      if (!existingRole) {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
      }
    } catch (roleTableError) {
      console.warn('[PromoPush] user_roles fallback skipped:', roleTableError.message);
    }
  }

  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('roles, user_type')
      .eq('id', userId)
      .maybeSingle();

    const roles = Array.from(new Set([...(userRow?.roles || []), role]));
    await supabase
      .from('users')
      .update({
        roles,
        user_type: userRow?.user_type || role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (userUpdateError) {
    console.warn('[PromoPush] users role mirror skipped:', userUpdateError.message);
  }
}

async function getChannelWithCampaign(code) {
  const { data, error } = await supabase
    .from('promopush_channels')
    .select(`
      *,
      campaign:promopush_campaigns(*)
    `)
    .eq('tracking_code', code)
    .maybeSingle();

  if (error) throw error;
  return data;
}

router.get('/campaigns', requireAuth, async (req, res) => {
  try {
    if (!requireDb(res)) return;

    const { data: campaigns, error } = await supabase
      .from('promopush_campaigns')
      .select(`
        *,
        moment:moments(id, title, starts_at, location, venue_name),
        channels:promopush_channels(*)
      `)
      .or(`host_id.eq.${req.user.id},brand_id.eq.${req.user.id},created_by.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const campaignIds = (campaigns || []).map((campaign) => campaign.id);
    let metrics = [];
    if (campaignIds.length) {
      const { data: metricRows, error: metricError } = await supabase
        .from('promopush_channel_metrics')
        .select('*')
        .in('campaign_id', campaignIds);
      if (metricError) throw metricError;
      metrics = metricRows || [];
    }

    const metricsByChannel = new Map(metrics.map((row) => [row.channel_id, row]));
    res.json((campaigns || []).map((campaign) => ({
      ...campaign,
      channels: (campaign.channels || []).map((channel) => ({
        ...channel,
        metrics: metricsByChannel.get(channel.id) || {
          clicks: 0,
          joins: 0,
          moves_completed: 0,
          proof_submissions: 0,
          proof_verified: 0,
          rewards_issued: 0,
        },
      })),
    })));
  } catch (error) {
    console.error('PromoPush campaigns error:', error);
    res.status(500).json({ error: 'Failed to load PromoPush campaigns' });
  }
});

router.get('/moments', requireAuth, async (req, res) => {
  try {
    if (!requireDb(res)) return;

    const { data, error } = await supabase
      .from('moments')
      .select('id, title, starts_at, location, venue_name, host_id, organizer_id')
      .or(`host_id.eq.${req.user.id},organizer_id.eq.${req.user.id}`)
      .order('starts_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('PromoPush moments error:', error);
    res.status(500).json({ error: 'Failed to load moments' });
  }
});

router.post('/campaigns', requireAuth, async (req, res) => {
  try {
    if (!requireDb(res)) return;

    const {
      title,
      linked_moment_id,
      brand_id,
      geo_radius_meters,
      geo_center_lat,
      geo_center_lng,
      geo_label,
      start_time,
      end_time,
      budget,
      reward_rules,
      request_creative_support,
      status = 'active',
    } = req.body || {};

    if (!title || !linked_moment_id || !geo_radius_meters || geo_center_lat === undefined || geo_center_lng === undefined || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required PromoPush campaign fields' });
    }

    const { data: moment, error: momentError } = await supabase
      .from('moments')
      .select('id, host_id, organizer_id')
      .eq('id', linked_moment_id)
      .maybeSingle();

    if (momentError) throw momentError;
    if (!moment) return res.status(404).json({ error: 'Linked Moment not found' });

    const hostId = moment.host_id || moment.organizer_id || req.user.id;
    const { data: campaign, error: campaignError } = await supabase
      .from('promopush_campaigns')
      .insert({
        title,
        linked_moment_id,
        host_id: hostId,
        brand_id: brand_id || req.user.id,
        geo_radius_meters,
        geo_center_lat,
        geo_center_lng,
        geo_label,
        start_time,
        end_time,
        budget,
        reward_rules: reward_rules || {},
        request_creative_support: !!request_creative_support,
        status,
        created_by: req.user.id,
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    const origin = publicBaseUrl(req);
    const channels = CHANNELS.map((channel) => {
      const trackingCode = codeFor(channel.type);
      return {
        campaign_id: campaign.id,
        channel_type: channel.type,
        label: channel.label,
        tracking_code: trackingCode,
        tracking_link: `${origin}/go/${trackingCode}`,
        moment_entry_endpoint: `/moments/${linked_moment_id}?campaign=${campaign.id}&channel=${trackingCode}`,
        reward_per_verified_action: Number(reward_rules?.creator_verified_action_jmd || 0),
      };
    });

    const { data: insertedChannels, error: channelError } = await supabase
      .from('promopush_channels')
      .insert(channels)
      .select();

    if (channelError) throw channelError;

    let creativeTasks = [];
    if (request_creative_support) {
      const { data: tasks, error: taskError } = await supabase
        .from('promopush_creative_tasks')
        .insert(['flyer_design', 'qr_layout', 'ad_creative'].map((task_type) => ({
          campaign_id: campaign.id,
          task_type,
        })))
        .select();
      if (taskError) throw taskError;
      creativeTasks = tasks || [];
    }

    res.status(201).json({ campaign, channels: insertedChannels || [], creative_tasks: creativeTasks });
  } catch (error) {
    console.error('Create PromoPush error:', error);
    res.status(500).json({ error: 'Failed to create PromoPush campaign' });
  }
});

router.get('/active-campaigns', requireAuth, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { data, error } = await supabase
      .from('promopush_campaigns')
      .select('id, title, linked_moment_id, geo_label, geo_radius_meters, reward_rules, start_time, end_time, status')
      .eq('status', 'active')
      .lte('start_time', new Date().toISOString())
      .gte('end_time', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('PromoPush active campaigns error:', error);
    res.status(500).json({ error: 'Failed to load active PromoPush campaigns' });
  }
});

router.get('/creator-links', requireAuth, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { data: channels, error } = await supabase
      .from('promopush_channels')
      .select(`
        *,
        campaign:promopush_campaigns(id, title, linked_moment_id, geo_label, reward_rules, status)
      `)
      .eq('owner_user_id', req.user.id)
      .eq('channel_type', 'creator_link')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const channelIds = (channels || []).map((channel) => channel.id);
    const metricsByChannel = new Map();
    const earningsByChannel = new Map();
    if (channelIds.length) {
      const [{ data: metrics, error: metricsError }, { data: earnings, error: earningsError }] = await Promise.all([
        supabase.from('promopush_channel_metrics').select('*').in('channel_id', channelIds),
        supabase.from('promopush_creator_earnings').select('channel_id, amount, status').in('channel_id', channelIds),
      ]);
      if (metricsError) throw metricsError;
      if (earningsError) throw earningsError;
      for (const metric of metrics || []) metricsByChannel.set(metric.channel_id, metric);
      for (const earning of earnings || []) {
        const current = earningsByChannel.get(earning.channel_id) || { pending: 0, approved: 0, paid: 0, total: 0 };
        current[earning.status] = Number(current[earning.status] || 0) + Number(earning.amount || 0);
        current.total += Number(earning.amount || 0);
        earningsByChannel.set(earning.channel_id, current);
      }
    }

    res.json((channels || []).map((channel) => ({
      ...channel,
      metrics: metricsByChannel.get(channel.id) || {
        clicks: 0,
        joins: 0,
        moves_completed: 0,
        proof_submissions: 0,
        proof_verified: 0,
        rewards_issued: 0,
      },
      earnings: earningsByChannel.get(channel.id) || { pending: 0, approved: 0, paid: 0, total: 0 },
    })));
  } catch (error) {
    console.error('PromoPush creator links error:', error);
    res.status(500).json({ error: 'Failed to load creator links' });
  }
});

router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!requireDb(res)) return;

    const [
      campaignsResult,
      applicationsResult,
      tasksResult,
      assignmentsResult,
    ] = await Promise.all([
      supabase
        .from('promopush_campaigns')
        .select('id, title, linked_moment_id, geo_label, status, start_time, end_time')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('promopush_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('promopush_creative_tasks')
        .select('*, campaign:promopush_campaigns(id, title)')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('promopush_promoter_assignments')
        .select('*, campaign:promopush_campaigns(id, title), channel:promopush_channels(id, label, tracking_link, tracking_code)')
        .order('assigned_at', { ascending: false })
        .limit(100),
    ]);

    for (const result of [campaignsResult, applicationsResult, tasksResult, assignmentsResult]) {
      if (result.error) throw result.error;
    }

    res.json({
      campaigns: campaignsResult.data || [],
      applications: applicationsResult.data || [],
      creative_tasks: tasksResult.data || [],
      assignments: assignmentsResult.data || [],
    });
  } catch (error) {
    console.error('PromoPush admin load error:', error);
    res.status(500).json({ error: 'Failed to load PromoPush admin workspace' });
  }
});

router.post('/admin/assignments', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { campaign_id, promoter_id, flyer_url = null } = req.body || {};
    if (!campaign_id || !promoter_id) {
      return res.status(400).json({ error: 'campaign_id and promoter_id are required' });
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('promopush_campaigns')
      .select('id, linked_moment_id, reward_rules')
      .eq('id', campaign_id)
      .maybeSingle();
    if (campaignError) throw campaignError;
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const origin = publicBaseUrl(req);
    let { data: channel, error: existingChannelError } = await supabase
      .from('promopush_channels')
      .select('*')
      .eq('campaign_id', campaign_id)
      .eq('owner_user_id', promoter_id)
      .eq('channel_type', 'street_activation')
      .maybeSingle();

    if (existingChannelError) throw existingChannelError;

    if (!channel) {
      const trackingCode = codeFor('street_activation');
      const { data: insertedChannel, error: channelError } = await supabase
        .from('promopush_channels')
        .insert({
          campaign_id,
          channel_type: 'street_activation',
          owner_user_id: promoter_id,
          label: 'Street Activation Promoter',
          tracking_code: trackingCode,
          tracking_link: `${origin}/go/${trackingCode}`,
          moment_entry_endpoint: `/moments/${campaign.linked_moment_id}?campaign=${campaign.id}&channel=${trackingCode}`,
          reward_per_verified_action: Number(campaign.reward_rules?.street_verified_action_jmd || campaign.reward_rules?.creator_verified_action_jmd || 0),
        })
        .select()
        .single();

      if (channelError) throw channelError;
      channel = insertedChannel;
    }

    const { data: assignment, error } = await supabase
      .from('promopush_promoter_assignments')
      .upsert({
        campaign_id,
        promoter_id,
        channel_id: channel.id,
        flyer_url,
        status: 'assigned',
      }, { onConflict: 'campaign_id,promoter_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ assignment, channel });
  } catch (error) {
    console.error('PromoPush admin assignment error:', error);
    res.status(500).json({ error: 'Failed to assign promoter' });
  }
});

router.patch('/admin/creative-tasks/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { status, assigned_to, notes, asset_url } = req.body || {};
    const patch = {
      updated_at: new Date().toISOString(),
    };
    if (status) patch.status = status;
    if (assigned_to !== undefined) patch.assigned_to = assigned_to || null;
    if (notes !== undefined) patch.notes = notes || null;
    if (asset_url !== undefined) patch.asset_url = asset_url || null;

    const { data, error } = await supabase
      .from('promopush_creative_tasks')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ creative_task: data });
  } catch (error) {
    console.error('PromoPush creative task update error:', error);
    res.status(500).json({ error: 'Failed to update creative task' });
  }
});

router.patch('/admin/applications/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { status, user_id } = req.body || {};
    const patch = {};
    if (status) patch.status = status;
    if (user_id !== undefined) patch.user_id = user_id || null;

    const { data, error } = await supabase
      .from('promopush_applications')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (data.status === 'approved' && data.user_id) {
      await grantPromoPushRole(data.user_id, roleForApplicant(data.applicant_role), req.user.id);
    }
    res.json({ application: data });
  } catch (error) {
    console.error('PromoPush application update error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.post('/creator-links', requireAuth, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { campaign_id } = req.body || {};
    if (!campaign_id) return res.status(400).json({ error: 'campaign_id is required' });

    const { data: campaign, error: campaignError } = await supabase
      .from('promopush_campaigns')
      .select('id, linked_moment_id, reward_rules, status')
      .eq('id', campaign_id)
      .maybeSingle();
    if (campaignError) throw campaignError;
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const { data: existing, error: existingError } = await supabase
      .from('promopush_channels')
      .select('*')
      .eq('campaign_id', campaign_id)
      .eq('owner_user_id', req.user.id)
      .eq('channel_type', 'creator_link')
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return res.json({ channel: existing });

    const trackingCode = codeFor('creator_link');
    const origin = publicBaseUrl(req);
    const { data: channel, error } = await supabase
      .from('promopush_channels')
      .insert({
        campaign_id,
        channel_type: 'creator_link',
        owner_user_id: req.user.id,
        label: `${req.user.display_name || req.user.username || 'Creator'} Link`,
        tracking_code: trackingCode,
        tracking_link: `${origin}/go/${trackingCode}`,
        moment_entry_endpoint: `/moments/${campaign.linked_moment_id}?campaign=${campaign.id}&channel=${trackingCode}`,
        reward_per_verified_action: Number(campaign.reward_rules?.creator_verified_action_jmd || 0),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ channel });
  } catch (error) {
    console.error('Create PromoPush creator link error:', error);
    res.status(500).json({ error: 'Failed to create creator link' });
  }
});

router.get('/entry/:code', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const channel = await getChannelWithCampaign(req.params.code);
    if (!channel || !channel.campaign) {
      return res.status(404).json({ error: 'Tracking link not found' });
    }

    const eventType = normalizeEventType(req.query.event === 'scan' ? 'scan' : 'click');
    await supabase.from('promopush_events').insert({
      campaign_id: channel.campaign_id,
      channel_id: channel.id,
      event_type: eventType,
      moment_id: channel.campaign.linked_moment_id,
      user_agent: req.headers['user-agent'] || null,
      referrer: req.headers.referer || null,
      ip_hash: hashIp(req),
      metadata: { source: 'entry_endpoint' },
    });

    res.json({
      campaign_id: channel.campaign_id,
      channel_id: channel.id,
      tracking_code: channel.tracking_code,
      moment_id: channel.campaign.linked_moment_id,
      entry_endpoint: channel.moment_entry_endpoint,
      redirect_url: channel.moment_entry_endpoint,
    });
  } catch (error) {
    console.error('PromoPush entry error:', error);
    res.status(500).json({ error: 'Failed to resolve tracking link' });
  }
});

router.post('/events', async (req, res) => {
  try {
    if (!requireDb(res)) return;

    const token = (req.headers.authorization || '').startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    let userId = null;
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      userId = data?.user?.id || null;
    }

    const { tracking_code, channel_id, campaign_id, event_type, latitude, longitude, metadata = {} } = req.body || {};
    let channel = null;
    if (tracking_code) {
      channel = await getChannelWithCampaign(tracking_code);
    } else if (channel_id) {
      const { data, error } = await supabase
        .from('promopush_channels')
        .select('*, campaign:promopush_campaigns(*)')
        .eq('id', channel_id)
        .maybeSingle();
      if (error) throw error;
      channel = data;
    }

    const resolvedCampaign = channel?.campaign;
    const resolvedCampaignId = campaign_id || channel?.campaign_id;
    if (!resolvedCampaignId) {
      return res.status(400).json({ error: 'campaign_id or tracking_code is required' });
    }

    let distance = null;
    let withinRadius = null;
    if (resolvedCampaign && latitude !== undefined && longitude !== undefined) {
      const { data: distanceData, error: distanceError } = await supabase.rpc('promopush_distance_meters', {
        lat1: Number(latitude),
        lng1: Number(longitude),
        lat2: Number(resolvedCampaign.geo_center_lat),
        lng2: Number(resolvedCampaign.geo_center_lng),
      });
      if (!distanceError && distanceData !== null) {
        distance = Number(distanceData);
        withinRadius = distance <= Number(resolvedCampaign.geo_radius_meters);
      }
    }

    const eventType = normalizeEventType(event_type);
    const eventPayload = {
      campaign_id: resolvedCampaignId,
      channel_id: channel?.id || channel_id || null,
      user_id: userId,
      event_type: eventType,
      moment_id: resolvedCampaign?.linked_moment_id || metadata.moment_id || null,
      move_id: metadata.move_id || null,
      proof_submission_id: metadata.proof_submission_id || null,
      reward_id: metadata.reward_id || null,
      latitude,
      longitude,
      distance_meters: distance,
      within_radius: withinRadius,
      user_agent: req.headers['user-agent'] || null,
      referrer: req.headers.referer || null,
      ip_hash: hashIp(req),
      metadata,
    };

    let { data: event, error } = await supabase
      .from('promopush_events')
      .insert(eventPayload)
      .select()
      .single();

    if (error && isDuplicateError(error)) {
      event = await findExistingEvent({
        campaignId: resolvedCampaignId,
        channelId: eventPayload.channel_id,
        eventType,
        userId,
        moveId: eventPayload.move_id,
        proofSubmissionId: eventPayload.proof_submission_id,
        rewardId: eventPayload.reward_id,
      });
    }
    if (error && !event) throw error;

    await createCreatorEarning({ campaignId: resolvedCampaignId, channel, event });

    res.status(error ? 200 : 201).json({ event });
  } catch (error) {
    console.error('PromoPush event error:', error);
    res.status(500).json({ error: 'Failed to log PromoPush event' });
  }
});

router.post('/careers', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { applicant_role, name, location, phone, availability, area_coverage, email } = req.body || {};
    if (!applicant_role || !name || !location || !phone) {
      return res.status(400).json({ error: 'Role, name, location, and phone are required' });
    }

    const { data, error } = await supabase
      .from('promopush_applications')
      .insert({ applicant_role, name, location, phone, availability, area_coverage, email })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ application: data });
  } catch (error) {
    console.error('PromoPush career application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

router.get('/promoter', requireAuth, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const { data: assignments, error } = await supabase
      .from('promopush_promoter_assignments')
      .select(`
        *,
        campaign:promopush_campaigns(*),
        channel:promopush_channels(*)
      `)
      .eq('promoter_id', req.user.id)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    const channelIds = (assignments || []).map((assignment) => assignment.channel_id).filter(Boolean);
    let metrics = [];
    if (channelIds.length) {
      const { data: metricRows, error: metricError } = await supabase
        .from('promopush_channel_metrics')
        .select('*')
        .in('channel_id', channelIds);
      if (metricError) throw metricError;
      metrics = metricRows || [];
    }

    const metricsByChannel = new Map(metrics.map((row) => [row.channel_id, row]));
    res.json((assignments || []).map((assignment) => ({
      ...assignment,
      channel: assignment.channel ? {
        ...assignment.channel,
        metrics: metricsByChannel.get(assignment.channel.id) || {
          clicks: 0,
          joins: 0,
          moves_completed: 0,
          proof_submissions: 0,
          proof_verified: 0,
          rewards_issued: 0,
        },
      } : null,
    })));
  } catch (error) {
    console.error('PromoPush promoter portal error:', error);
    res.status(500).json({ error: 'Failed to load promoter assignments' });
  }
});

module.exports = router;
