const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { supabase: serviceSupabase } = require('../lib/supabase');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SHARE_SECRET = process.env.SHARE_SECRET || 'development-share-secret';
const PUBLIC_WEB_ORIGIN = process.env.PUBLIC_WEB_ORIGIN || 'http://localhost:5173';

const supabase = global.supabase || serviceSupabase || null;

const inMemoryShares = new Map();
const inMemoryRewardEvents = new Map();

const DEFAULT_REWARD = { points: 10, gems: 0 };

const ACTION_REWARD_RULES = {
  view: { points: 2, gems: 0 },
  click: { points: 5, gems: 0 },
  impression: { points: 3, gems: 0 },
  signup: { points: 50, gems: 5 },
  registration: { points: 50, gems: 5 },
  purchase: { points: 125, gems: 10 },
  conversion: { points: 60, gems: 6 },
  engagement: { points: 15, gems: 1 },
  share: { points: 20, gems: 2 },
};

const signShare = (userId, targetUrl, campaignId = '') => {
  const base = `${userId}|${targetUrl}|${campaignId}`;
  return crypto.createHmac('sha256', SHARE_SECRET).update(base).digest('hex');
};

const normaliseAction = (action) => {
  if (!action) return 'engagement';
  return String(action).trim().toLowerCase();
};

const resolveRewardForAction = (action) => {
  const normalised = normaliseAction(action);
  const base = ACTION_REWARD_RULES[normalised] || DEFAULT_REWARD;
  const points = base.points || 0;
  const gems = base.gems || 0;
  return {
    type: normalised,
    value: points > 0 ? points : gems,
    points,
    gems,
    meta: {
      points,
      gems,
    },
  };
};

const buildRewardKey = (linkId, action, actorUserId) => {
  return `${linkId}:${normaliseAction(action)}:${actorUserId || 'anonymous'}`;
};

async function findExistingRewardEvent(linkId, action, actorUserId) {
  const key = buildRewardKey(linkId, action, actorUserId);

  if (supabase) {
    try {
      let query = supabase
        .from('share_reward_events')
        .select('*')
        .eq('share_id', linkId)
        .eq('reward_type', normaliseAction(action))
        .order('created_at', { ascending: false })
        .limit(1);

      if (actorUserId) {
        query = query.eq('actor_user_id', actorUserId);
      } else {
        query = query.is('actor_user_id', null);
      }

      const { data, error } = await query;
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('[shares.verify] failed to fetch reward event', error);
        }
        return null;
      }

      const existing = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (existing) {
        inMemoryRewardEvents.set(key, existing);
      }
      return existing;
    } catch (error) {
      console.error('[shares.verify] reward lookup failed', error);
      return null;
    }
  }

  return inMemoryRewardEvents.get(key) || null;
}

async function persistRewardEvent({ share, reward, actorUserId, metadata }) {
  if (!supabase) {
    console.warn('[shares.verify] Supabase client unavailable, reward event not persisted');
    return { ok: false, reason: 'supabase_unavailable' };
  }

  try {
    const insertPayload = {
      share_id: share.id,
      user_id: share.user_id,
      reward_type: reward.type,
      reward_value: reward.value,
      actor_user_id: actorUserId || null,
      metadata: {
        source: 'share_verification',
        ...(reward.meta || {}),
        ...(metadata || {}),
      },
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('share_reward_events')
      .insert([insertPayload])
      .select('id, created_at')
      .single();

    if (error) {
      const errorMessage = `${error.message || ''} ${error.details || ''}`;
      if (/duplicate key|already exists|duplicate entry/i.test(errorMessage)) {
        return { ok: true, duplicate: true };
      }
      console.error('[shares.verify] reward event insert failed', error);
      return { ok: false, error };
    }

    const key = buildRewardKey(share.id, reward.type, actorUserId);
    if (data) {
      inMemoryRewardEvents.set(key, data);
    }

    return { ok: true, id: data?.id || null, created_at: data?.created_at || null };
  } catch (error) {
    console.error('[shares.verify] reward event persist error', error);
    return { ok: false, error };
  }
}

async function logTelemetryEvent(eventType, payload, req, sessionId, userId) {
  if (!supabase) {
    console.log(`[shares.telemetry] ${eventType}`, payload);
    return;
  }

  try {
    await supabase.from('telemetry.events').insert({
      session_id: sessionId || `share-${Date.now()}`,
      event_type: eventType,
      user_id: userId || null,
      payload,
      user_agent: req.headers['user-agent'] || null,
      ip: req.headers['x-forwarded-for'] || req.ip || null,
    });
  } catch (error) {
    console.error(`[shares.telemetry] failed to record ${eventType}`, error);
  }
}

const decodeToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

router.use((req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const decoded = decodeToken(authHeader.substring(7));
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'creator@demo.com',
    username: 'demo_creator',
    display_name: 'Demo Creator',
    user_type: 'creator',
  };
  return next();
});

const mockListings = () => [
  {
    id: 'listing-demo-1',
    content_id: 'content-demo-1',
    content_title: 'Launch Campaign: Social Buzz',
    content_thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80',
    owner_id: '00000000-0000-0000-0000-000000000001',
    owner_name: 'Demo Creator',
    quantity: 60,
    remaining_quantity: 40,
    ask_price: 12.5,
    market_price: 12.2,
    status: 'active',
  },
];

const mockOffers = (currentUser) => [
  {
    id: 'offer-demo-1',
    content_id: 'content-demo-1',
    content_title: 'Launch Campaign: Social Buzz',
    buyer_id: currentUser.id,
    seller_id: '00000000-0000-0000-0000-000000000002',
    quantity: 10,
    bid_price: 12.75,
    status: 'pending',
  },
];

router.get('/listings', (req, res) => {
  const ownerOnly = req.query.owner === 'true';
  const listings = mockListings();

  if (ownerOnly) {
    return res.json({ listings: listings.filter((listing) => listing.owner_id === req.user.id) });
  }

  return res.json({ listings });
});

router.post('/listings', (req, res) => {
  const { content_id, quantity, ask_price } = req.body || {};
  if (!content_id || !quantity || !ask_price) {
    return res.status(400).json({ error: 'Missing listing fields' });
  }

  const listing = {
    id: `listing-${Date.now()}`,
    content_id,
    content_title: req.body.content_title || 'Content Listing',
    content_thumbnail: req.body.content_thumbnail || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80',
    owner_id: req.user.id,
    owner_name: req.user.display_name || req.user.username || 'Portfolio Owner',
    quantity,
    remaining_quantity: quantity,
    ask_price,
    market_price: ask_price,
    status: 'active',
  };

  return res.status(201).json({ success: true, listing });
});

router.get('/offers', (req, res) => {
  const role = req.query.role;
  const offers = mockOffers(req.user);

  let filtered = offers;
  if (role === 'seller') {
    filtered = offers.filter((offer) => offer.seller_id === req.user.id);
  } else if (role === 'buyer') {
    filtered = offers.filter((offer) => offer.buyer_id === req.user.id);
  }

  return res.json({ offers: filtered });
});

router.post('/offers', (req, res) => {
  const { content_id, quantity, bid_price } = req.body || {};
  if (!content_id || !quantity || !bid_price) {
    return res.status(400).json({ error: 'Missing offer fields' });
  }

  const offer = {
    id: `offer-${Date.now()}`,
    content_id,
    buyer_id: req.user.id,
    quantity,
    bid_price,
    status: 'pending',
  };

  return res.status(201).json({ success: true, offer });
});

router.post('/create', async (req, res) => {
  const userId = req.user?.id;
  const { target_url, campaign_id, content_id } = req.body || {};

  if (!userId || !target_url) {
    return res.status(400).json({ error: 'target_url is required' });
  }

  const signature = signShare(userId, target_url, campaign_id);

  if (supabase) {
    const { data, error } = await supabase
      .from('shares.links')
      .insert({
        user_id: userId,
        target_url,
        campaign_id: campaign_id || null,
        sig: signature,
      })
      .select()
      .single();

    if (error) {
      console.error('[shares.create] supabase insert failed', error);
      return res.status(500).json({ error: 'Failed to create share link' });
    }

    const shareUrl = `${PUBLIC_WEB_ORIGIN}/s/${data.id}?u=${encodeURIComponent(userId)}&c=${encodeURIComponent(campaign_id || '')}&sig=${signature}`;

    return res.status(201).json({
      status: 'success',
      data: {
        id: data.id,
        url: shareUrl,
        signature,
        task: {
          type: 'share',
          reward: { points: 10, gems: 0 },
          contentId: content_id || null,
        },
      },
    });
  }

  const id = crypto.randomUUID();
  inMemoryShares.set(id, {
    id,
    user_id: userId,
    target_url,
    campaign_id: campaign_id || null,
    sig: signature,
  });

  const shareUrl = `${PUBLIC_WEB_ORIGIN}/s/${id}?u=${encodeURIComponent(userId)}&c=${encodeURIComponent(campaign_id || '')}&sig=${signature}`;

  return res.status(201).json({
    status: 'success',
    data: {
      id,
      url: shareUrl,
      signature,
      task: {
        type: 'share',
        reward: { points: 10, gems: 0 },
        contentId: content_id || null,
      },
    },
  });
});

router.post('/verify', async (req, res) => {
  const { link_id, action, actor_user_id, metadata = {} } = req.body || {};
  const safeMetadata = metadata && typeof metadata === 'object' ? metadata : {};

  if (!link_id) {
    return res.status(400).json({ error: 'link_id is required' });
  }

  const normalisedAction = normaliseAction(action);
  const link = await fetchShareLink(link_id);

  if (!link) {
    return res.status(404).json({ error: 'Share link not found' });
  }

  const reward = resolveRewardForAction(normalisedAction);
  const existingReward = await findExistingRewardEvent(link_id, normalisedAction, actor_user_id);
  const share = {
    id: link.id,
    user_id: link.user_id,
  };

  await logTelemetryEvent(
    'share_verified',
    {
      action: normalisedAction,
      actor_user_id: actor_user_id || null,
      share_id: link_id,
      duplicate: Boolean(existingReward),
      reward,
      metadata: safeMetadata,
    },
    req,
    link_id,
    link.user_id || null,
  );

  if (existingReward) {
    return res.json({
      status: 'success',
      data: {
        granted: false,
        reason: 'already_granted',
        action: normalisedAction,
        actor_user_id: actor_user_id || null,
        reward: { points: 0, gems: 0 },
        previous_reward: {
          id: existingReward.id || null,
          created_at: existingReward.created_at || null,
        },
      },
    });
  }

  const rewardPersistResult = await persistRewardEvent({
    share,
    actorUserId: actor_user_id,
    reward,
    metadata: safeMetadata,
  });

  if (!supabase) {
    const record = inMemoryShares.get(link_id);
    if (record) {
      record.status = 'verified';
      record.verified_at = new Date().toISOString();
    }
  }

  const responseData = {
    granted: true,
    action: normalisedAction,
    actor_user_id: actor_user_id || null,
    owner_user_id: link.user_id || null,
    reward,
    reward_event_id: rewardPersistResult?.id || null,
    persisted: Boolean(rewardPersistResult?.ok && rewardPersistResult?.id),
    metadata: safeMetadata,
  };

  if (rewardPersistResult?.duplicate) {
    responseData.warning = 'reward_already_recorded';
  } else if (!responseData.persisted) {
    responseData.warning = 'reward_not_persisted';

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('share_reward_events')
          .insert([
            {
              share_id: share.id,
              user_id: share.user_id,
              reward_type: reward.type,
              reward_value: reward.value,
              metadata: { source: 'share_verification', ...(reward.meta || {}), ...(safeMetadata || {}) },
              actor_user_id: actor_user_id || null,
              created_at: new Date().toISOString(),
            },
          ])
          .select('id')
          .single();

        if (error) {
          console.error('❌ reward insert failed:', error.message);
          await logTelemetryEvent(
            'reward_persist_failed',
            {
              share_id: share.id,
              user_id: share.user_id,
              error: error.message,
            },
            req,
            link_id,
            share.user_id || null,
          );
        } else {
          console.log('✅ reward persisted:', data);
          await logTelemetryEvent(
            'reward_persisted',
            {
              share_id: share.id,
              user_id: share.user_id,
              reward_type: reward.type,
              reward_value: reward.value,
            },
            req,
            link_id,
            share.user_id || null,
          );
          responseData.persisted = true;
          responseData.reward_event_id = data?.id || responseData.reward_event_id;
          responseData.warning = null;
        }
      } catch (err) {
        console.error('⚠️ reward persistence exception:', err);
        await logTelemetryEvent(
          'reward_persist_exception',
          {
            share_id: share.id,
            message: err.message,
          },
          req,
          link_id,
          share.user_id || null,
        );
      }
    }
  }

  await logTelemetryEvent(
    'share_reward_granted',
    {
      action: normalisedAction,
      actor_user_id: actor_user_id || null,
      share_id: link_id,
      reward,
      reward_event_id: rewardPersistResult?.id || null,
      persisted: responseData.persisted,
      warning: responseData.warning || null,
    },
    req,
    link_id,
    link.user_id || null,
  );

  return res.json({
    status: 'success',
    data: responseData,
  });
});

async function fetchShareLink(id) {
  if (supabase) {
    const { data, error } = await supabase.from('shares.links').select('*').eq('id', id).single();
    if (error) {
      return null;
    }
    return data;
  }

  return inMemoryShares.get(id) || null;
}

async function recordShareClick(linkId, req) {
  if (supabase) {
    await supabase.from('shares.clicks').insert({
      link_id: linkId,
      user_agent: req.headers['user-agent'] || null,
      ip: req.headers['x-forwarded-for'] || req.ip || null,
      referer: req.headers.referer || null,
    });
  }
}

async function redirectHandler(req, res) {
  const { id } = req.params;
  const { u, c, sig } = req.query;

  const link = await fetchShareLink(id);
  if (!link) {
    return res.status(404).send('Share link not found');
  }

  const expectedSig = signShare(u || link.user_id, link.target_url, c || link.campaign_id || '');
  if (expectedSig !== sig) {
    return res.status(400).send('Invalid signature');
  }

  await recordShareClick(link.id, req);
  return res.redirect(302, link.target_url);
}

module.exports = {
  router,
  redirectHandler,
  signShare,
};
