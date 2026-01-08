const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Handle case where supabase module exports null
const supabaseModule = require('../lib/supabase');
const serviceSupabase = supabaseModule?.supabase || supabaseModule || null;

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

router.get('/listings', async (req, res) => {
  const ownerOnly = req.query.owner === 'true';

  if (!supabase) {
    return res.json({ listings: mockListings() });
  }

  try {
    let query = supabase
      .from('share_listings')
      .select(`
        *,
        seller:seller_id (username, display_name)
      `)
      .eq('status', 'active');

    if (ownerOnly) {
      query = query.eq('seller_id', req.user.id);
    }

    const objectType = req.query.object_type;
    if (objectType) {
      query = query.eq('object_type', objectType);
    }

    const { data: listings, error } = await query;
    if (error) throw error;

    // For products, we want to join with product details
    // This is a simplified merge for now
    const enrichedListings = await Promise.all((listings || []).map(async (listing) => {
      if (listing.object_type === 'product') {
        const { data: product } = await supabase.from('products').select('name, images').eq('id', listing.object_id).single();
        return {
          ...listing,
          content_title: product?.name || 'Product Share',
          content_thumbnail: product?.images?.[0] || '/assets/demo/placeholder.png',
          owner_name: listing.seller?.display_name || listing.seller?.username || 'Seller'
        };
      }
      return {
        ...listing,
        owner_name: listing.seller?.display_name || listing.seller?.username || 'Seller'
      };
    }));

    return res.json({ listings: enrichedListings });
  } catch (error) {
    console.error('[shares.listings] error:', error);
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.post('/listings', async (req, res) => {
  const { object_id, object_type, quantity, ask_price } = req.body || {};
  if (!object_id || !object_type || !quantity || !ask_price) {
    return res.status(400).json({ error: 'Missing listing fields' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database unavailable' });
  }

  try {
    // 1. Check if user has enough shares to list
    const { data: shareBalance } = await supabase
      .from('user_shares')
      .select('total_shares, locked_shares')
      .eq('user_id', req.user.id)
      .eq('object_id', object_id)
      .eq('object_type', object_type)
      .single();

    const available = (shareBalance?.total_shares || 0) - (shareBalance?.locked_shares || 0);
    if (available < quantity) {
      return res.status(400).json({ error: 'Insufficient shares available to list' });
    }

    // 2. Lock the shares
    await supabase
      .from('user_shares')
      .update({ locked_shares: (shareBalance.locked_shares || 0) + quantity })
      .eq('id', shareBalance.id);

    // 3. Create listing
    const { data: listing, error } = await supabase
      .from('share_listings')
      .insert({
        seller_id: req.user.id,
        object_id,
        object_type,
        quantity,
        remaining_quantity: quantity,
        price_per_share: ask_price,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, listing });
  } catch (error) {
    console.error('[shares.postListing] error:', error);
    return res.status(500).json({ error: 'Failed to create listing' });
  }
});

router.get('/offers', async (req, res) => {
  const role = req.query.role;

  if (!supabase) {
    return res.json({ offers: mockOffers(req.user) });
  }

  try {
    let query = supabase
      .from('share_offers') // We'll assume a share_offers table exists or create it
      .select(`
        *,
        buyer:buyer_id (username, display_name),
        seller:seller_id (username, display_name)
      `);

    if (role === 'seller') {
      query = query.eq('seller_id', req.user.id);
    } else if (role === 'buyer') {
      query = query.eq('buyer_id', req.user.id);
    } else {
      query = query.or(`seller_id.eq.${req.user.id},buyer_id.eq.${req.user.id}`);
    }

    const { data: offers, error } = await query;
    if (error) throw error;

    return res.json({ offers });
  } catch (error) {
    console.error('[shares.offers] error:', error);
    return res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

router.post('/offers', async (req, res) => {
  const { listing_id, object_id, object_type, quantity, bid_price } = req.body || {};
  if (!quantity || !bid_price) {
    return res.status(400).json({ error: 'Missing offer fields' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database unavailable' });
  }

  try {
    // 1. If it's an offer on a listing, get seller_id
    let seller_id = req.body.seller_id || null;
    if (listing_id) {
      const { data: listing } = await supabase.from('share_listings').select('seller_id').eq('id', listing_id).single();
      seller_id = listing?.seller_id;
    }

    // 2. Create offer
    const { data: offer, error } = await supabase
      .from('share_offers')
      .insert({
        buyer_id: req.user.id,
        seller_id,
        listing_id: listing_id || null,
        object_id: object_id || null,
        object_type: object_type || null,
        quantity,
        bid_price,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, offer });
  } catch (error) {
    console.error('[shares.postOffer] error:', error);
    return res.status(500).json({ error: 'Failed to create offer' });
  }
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

// Export router directly for app.use() compatibility
// Also attach helpers to router for external access if needed
router.redirectHandler = redirectHandler;
router.signShare = signShare;

module.exports = router;
