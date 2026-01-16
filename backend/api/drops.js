const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { trackDropCompletion } = require('../utils/referralTracker');
const { requireAuth, resolveAdvertiserContext } = require('../middleware/auth');
const { ADVERTISER_TIERS, MOVE_RULES } = require('../constants/pricing');
const dailyLayerService = require('../services/dailyLayerService');
const { sendDropApprovedEmail, sendDropRejectedEmail, sendDropCompletedEmail } = require('../services/resendService');
const merchantSamplingService = require('../services/merchantSamplingService');

/**
 * Check if advertiser has available Moves for the requested action.
 * Returns { allowed: boolean, remaining: number, tier: object, error?: string }
 */
const checkMoveAvailability = async (userId, userTier = 'free') => {
  const tier = ADVERTISER_TIERS[userTier] || ADVERTISER_TIERS.free;

  // Enterprise has custom limits - always allow
  if (tier.isCustom) {
    return { allowed: true, remaining: 999, tier };
  }

  const movesLimit = tier.moves?.amount || 50;
  const period = tier.moves?.period || 'month';

  // In production, fetch from database
  // For now, return allowed with mock data
  if (!supabase) {
    return { allowed: true, remaining: movesLimit, tier };
  }

  try {
    // Calculate period start
    const now = new Date();
    let periodStart;
    if (period === 'week') {
      const dayOfWeek = now.getDay();
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - dayOfWeek);
      periodStart.setHours(0, 0, 0, 0);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Count moves used in current period
    // Check both legacy creator_id and new advertiser_account_id
    const { count, error } = await supabase
      .from('drops')
      .select('*', { count: 'exact', head: true })
      .or(`creator_id.eq.${userId},advertiser_account_id.eq.${userId}`)
      .gte('created_at', periodStart.toISOString());

    if (error) {
      console.error('Error checking move availability:', error);
      // Fail open for now
      return { allowed: true, remaining: movesLimit, tier };
    }

    const movesUsed = count || 0;
    const movesRemaining = Math.max(0, movesLimit - movesUsed);

    if (movesRemaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        tier,
        error: `Move limit reached. You've used all ${movesLimit} Moves for this ${period}. Upgrade or wait for your next billing cycle to continue.`
      };
    }

    return { allowed: true, remaining: movesRemaining, tier };
  } catch (err) {
    console.error('Error in checkMoveAvailability:', err);
    return { allowed: true, remaining: movesLimit, tier };
  }
};

const DEFAULT_CACHE_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 15000);
const cacheStore = new Map();

const getCachedValue = async (key, fetcher, ttl = DEFAULT_CACHE_TTL_MS) => {
  const now = Date.now();
  const cached = cacheStore.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await fetcher();
  if (value !== undefined) {
    cacheStore.set(key, {
      value,
      expiresAt: now + ttl
    });
  }
  return value;
};

const invalidateCache = (prefix) => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};

// =====================================================
// PUBLIC LIST ENDPOINT - No auth required (for homepage/marketing)
// Includes sampling activations from merchants alongside regular drops
// =====================================================
router.get('/public', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);

    const cacheKey = `drops:public:list:${limit}`;
    const payload = await getCachedValue(cacheKey, async () => {
      // Get active sampling activations for deals surface
      let samplingDeals = [];
      try {
        samplingDeals = await merchantSamplingService.getActiveSamplingForSurface('deals');
      } catch (err) {
        console.error('Error fetching sampling activations:', err);
      }

      // Transform sampling activations to drop format
      const samplingDrops = samplingDeals.map(activation => ({
        id: `sampling-${activation.id}`,
        title: activation.name,
        description: activation.description || 'Special merchant offer',
        preview_image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
        creator_name: activation.advertiser_profiles?.company_name || 'Local Business',
        promo_points_reward: 25, // Base points for sampling participation
        current_participants: activation.current_redemptions || 0,
        status: 'active',
        is_sampling: true,
        sampling_activation_id: activation.id,
        value_type: activation.value_type,
        max_redemptions: activation.max_redemptions,
        expires_at: activation.expires_at
      }));

      if (!supabase || process.env.USE_DEMO_DROPS === 'true') {
        // Return demo drops + sampling drops for homepage
        const demoDrops = [
          {
            id: 'demo-1',
            title: 'Summer Fashion Drop',
            description: 'Share this look with your followers',
            preview_image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
            creator_name: 'StyleCo',
            promo_points_reward: 50,
            current_participants: 127,
            status: 'active'
          },
          {
            id: 'demo-2',
            title: 'Tech Review Campaign',
            description: 'Review our latest product',
            preview_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
            creator_name: 'TechBrand',
            promo_points_reward: 100,
            current_participants: 89,
            status: 'active'
          },
          {
            id: 'demo-3',
            title: 'Local Eats Promo',
            description: 'Share your meal experience',
            preview_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
            creator_name: 'FoodieHub',
            promo_points_reward: 25,
            current_participants: 234,
            status: 'active'
          },
          {
            id: 'demo-4',
            title: 'Fitness Challenge',
            description: 'Join the movement',
            preview_image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
            creator_name: 'FitLife',
            promo_points_reward: 75,
            current_participants: 156,
            status: 'active'
          }
        ];
        // Combine sampling drops with demo drops, sampling first
        return [...samplingDrops, ...demoDrops].slice(0, limit);
      }

      const { data: drops, error } = await supabase
        .from('drops')
        .select(`
          id,
          title,
          description,
          preview_image,
          creator_name,
          gem_reward_base,
          current_participants,
          status,
          created_at
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching public drops:', error);
        return [];
      }

      const regularDrops = drops.map(drop => ({
        id: drop.id,
        title: drop.title,
        description: drop.description,
        preview_image: drop.preview_image,
        creator_name: drop.creator_name,
        promo_points_reward: drop.gem_reward_base || 0,
        current_participants: drop.current_participants || 0,
        status: drop.status
      }));

      // Combine sampling drops with regular drops, sampling first
      return [...samplingDrops, ...regularDrops].slice(0, limit);
    });

    res.json(payload);
  } catch (error) {
    console.error('Error fetching public drops list:', error);
    res.status(500).json({ error: 'Failed to fetch drops' });
  }
});

// =====================================================
// PUBLIC DETAIL ENDPOINT - No auth required (for SEO/sharing)
// =====================================================
router.get('/:id/public', async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `drops:public:${id}`;
    const payload = await getCachedValue(cacheKey, async () => {
      if (!supabase || process.env.USE_DEMO_DROPS === 'true') {
        return {
          id: id,
          title: `Special Drop #${id}`,
          description: `This is a detailed description of drop ${id}. Complete this task to earn rewards!`,
          preview_image: `https://images.unsplash.com/photo-1503376780200?auto=format&fit=crop&w=1200&q=80`,
          creator_name: `Creator ${id}`,
          creator_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=creator${id}`,
          views_count: Math.floor(Math.random() * 10000),
          likes_count: Math.floor(Math.random() * 1000),
          shares_count: Math.floor(Math.random() * 500),
          promo_points_reward: Math.floor(Math.random() * 100) + 10,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          key_cost: Math.floor(Math.random() * 10) + 1
        };
      }

      const { data: drop, error } = await supabase
        .from('drops')
        .select(`
          id,
          title,
          description,
          preview_image,
          creator_name,
          status,
          gem_reward_base,
          key_cost,
          created_at,
          creator:users!creator_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error fetching public drop:', error);
        throw new Error('Drop not found');
      }

      // Return only public-safe fields
      return {
        id: drop.id,
        title: drop.title,
        description: drop.description,
        preview_image: drop.preview_image,
        creator_name: drop.creator?.display_name || drop.creator?.username || drop.creator_name || 'Anonymous Creator',
        creator_avatar: drop.creator?.avatar_url || null,
        promo_points_reward: drop.gem_reward_base || 0,
        key_cost: drop.key_cost || 0,
        created_at: drop.created_at,
        status: drop.status,
        // These would come from analytics in a real implementation
        views_count: 0,
        likes_count: 0,
        shares_count: 0
      };
    });

    if (!payload) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    res.json(payload);
  } catch (error) {
    console.error('Error fetching public drop:', error);
    if (error.message === 'Drop not found') {
      return res.status(404).json({ error: 'Drop not found' });
    }
    res.status(500).json({ error: 'Failed to fetch drop' });
  }
});

// =====================================================
// PROTECTED ROUTES - Auth required below this line
// =====================================================
router.use(requireAuth);
router.use(resolveAdvertiserContext);

// Get all drops
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, type, interests } = req.query;

    // Parse interests if provided (comma-separated string or array)
    let userInterests = [];
    if (interests) {
      userInterests = typeof interests === 'string' ? interests.split(',').map(i => i.trim().toLowerCase()) : interests;
    }

    const cacheKey = `drops:list:${limit}:${offset}:${type || 'all'}:${userInterests.join(',') || 'none'}`;

    const drops = await getCachedValue(cacheKey, async () => {
      if (!supabase || process.env.USE_DEMO_DROPS === 'true') {
        const demoDrops = Array.from({ length: parseInt(limit) }, (_, i) => ({
          id: i + parseInt(offset) + 1,
          creator_id: Math.floor(Math.random() * 100) + 1,
          creator_name: `Drop Creator ${i + parseInt(offset) + 1}`,
          creator_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=creator${i + parseInt(offset) + 1}`,
          title: `Earn ${Math.floor(Math.random() * 100) + 10} Gems - ${['Instagram Post', 'TikTok Video', 'YouTube Review', 'Twitter Thread'][Math.floor(Math.random() * 4)]}`,
          description: `Complete this task to earn gems and boost your profile. ${['Share your experience', 'Create engaging content', 'Review a product', 'Participate in discussion'][Math.floor(Math.random() * 4)]} and get rewarded!`,
          drop_type: ['content_clipping', 'reviews', 'ugc_creation', 'affiliate_referral'][Math.floor(Math.random() * 4)],
          category: ['food', 'tech', 'fashion', 'entertainment', 'fitness', 'beauty', 'travel'][Math.floor(Math.random() * 7)],
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
          key_cost: Math.floor(Math.random() * 10) + 1,
          gem_reward_base: Math.floor(Math.random() * 50) + 10,
          gem_pool_total: Math.floor(Math.random() * 500) + 100,
          gem_pool_remaining: Math.floor(Math.random() * 300) + 50,
          reward_logic: 'completion_based',
          follower_threshold: Math.floor(Math.random() * 1000),
          time_commitment: ['15 minutes', '30 minutes', '1 hour', '2 hours'][Math.floor(Math.random() * 4)],
          requirements: 'Follow the instructions and submit proof of completion',
          deliverables: 'Screenshot or link to completed work',
          deadline_at: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
          max_participants: Math.floor(Math.random() * 50) + 10,
          current_participants: Math.floor(Math.random() * 20) + 1,
          status: Math.random() > 0.3 ? 'active' : 'completed',
          platform: ['instagram', 'tiktok', 'youtube', 'twitter'][Math.floor(Math.random() * 4)],
          content_url: `https://example.com/drop/${i + parseInt(offset) + 1}`,
          preview_image: i % 3 === 0 ? '/assets/demo/tiktok-drop.png' : `https://images.unsplash.com/photo-${1503376780353 + i + parseInt(offset)}?auto=format&fit=crop&w=1200&q=80&sat=-20&sig=${i + parseInt(offset) + 1}`,
          move_cost_points: Math.floor(Math.random() * 5) + 1,
          key_reward_amount: Math.floor(Math.random() * 5) + 1,
          is_proof_drop: Math.random() > 0.7,
          is_paid_drop: Math.random() > 0.5,
          created_at: new Date(Date.now() - (i + parseInt(offset)) * 3600000).toISOString(),
          updated_at: new Date(Date.now() - (i + parseInt(offset)) * 3600000).toISOString()
        }));

        // Client-side preference sorting for demo data
        if (userInterests.length > 0) {
          demoDrops.sort((a, b) => {
            const aMatch = userInterests.includes(a.category);
            const bMatch = userInterests.includes(b.category);
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
          });
        }

        return demoDrops;
      }

      let query = supabase
        .from('drops')
        .select(`
          *,
          creator:users!creator_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (type) {
        query = query.eq('drop_type', type);
      }

      // Note: For true preference-based filtering, we'd need a `category` or `tags` column on drops.
      // For now, we fetch all and sort client-side. In a production system, add a GIN index on tags.

      const queryStart = Date.now();
      const { data: rows, error } = await query;
      const durationMs = Date.now() - queryStart;
      if (durationMs > 250) {
        console.log(`[drops:list] Supabase query took ${durationMs}ms`);
      }

      if (error) {
        console.error('Database error fetching drops:', error);
        throw new Error('Failed to fetch drops');
      }

      let processedDrops = (rows || []).map(drop => ({
        ...drop,
        creator_name: drop.creator?.display_name || drop.creator?.username || drop.creator_name || 'Unknown Creator',
        creator_avatar: drop.creator?.avatar_url || drop.creator_avatar
      }));

      // Preference-aware sorting: Prioritize drops matching user interests
      if (userInterests.length > 0 && processedDrops.length > 0) {
        processedDrops.sort((a, b) => {
          // Check if drop category or tags match user interests
          const aCategory = (a.category || a.drop_type || '').toLowerCase();
          const bCategory = (b.category || b.drop_type || '').toLowerCase();
          const aTags = (a.tags || []).map(t => t.toLowerCase());
          const bTags = (b.tags || []).map(t => t.toLowerCase());

          const aMatch = userInterests.includes(aCategory) || userInterests.some(i => aTags.includes(i));
          const bMatch = userInterests.includes(bCategory) || userInterests.some(i => bTags.includes(i));

          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0; // Keep original order for ties
        });
      }

      return processedDrops;
    });

    res.json(drops);
  } catch (error) {
    console.error('Error fetching drops:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch drops' });
  }
});

// Get single drop
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `drops:item:${id}`;
    const payload = await getCachedValue(cacheKey, async () => {
      if (!supabase || process.env.USE_DEMO_DROPS === 'true') {
        // Handle both numeric and UUID format IDs
        const numericId = isNaN(parseInt(id, 10)) ?
          parseInt(id.replace(/[^0-9]/g, '').substring(0, 4), 10) || 1 :
          parseInt(id, 10);

        return {
          id: id, // Keep the original ID for consistency
          creator_id: Math.floor(Math.random() * 100) + 1,
          creator_name: `Drop Creator ${id}`,
          creator_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=creator${id}`,
          title: `Special Drop #${id}`,
          description: `This is a detailed description of drop ${id}. Complete this task to earn rewards!`,
          drop_type: 'content_clipping',
          difficulty: 'medium',
          key_cost: 5,
          gem_reward_base: 25,
          gem_pool_total: 250,
          gem_pool_remaining: 150,
          reward_logic: 'completion_based',
          follower_threshold: 100,
          time_commitment: '30 minutes',
          requirements: 'Complete the task and submit proof',
          deliverables: 'Screenshot or link',
          deadline_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          max_participants: 20,
          current_participants: 8,
          status: 'active',
          platform: 'instagram',
          content_url: `https://example.com/drop/${id}`,
          preview_image: `https://images.unsplash.com/photo-${1503376780200 + parseInt(id, 10)}?auto=format&fit=crop&w=1200&q=80&sat=-20&sig=drop-${id}`,
          move_cost_points: 2,
          key_reward_amount: 3,
          is_proof_drop: false,
          is_paid_drop: true,
          created_at: new Date(Date.now() - parseInt(id) * 3600000).toISOString(),
          updated_at: new Date(Date.now() - parseInt(id) * 3600000).toISOString()
        };
      }

      const queryStart = Date.now();
      const { data: drop, error } = await supabase
        .from('drops')
        .select(`
          *,
          creator:users!creator_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();
      const durationMs = Date.now() - queryStart;
      if (durationMs > 250) {
        console.log(`[drops:item:${id}] Supabase query took ${durationMs}ms`);
      }

      if (error) {
        console.error('Database error fetching drop:', error);
        throw new Error('Drop not found');
      }

      // Enhance with resolved creator name
      const processedDrop = {
        ...drop,
        creator_name: drop.creator?.display_name || drop.creator?.username || drop.creator_name || 'Unknown Creator',
        creator_avatar: drop.creator?.avatar_url || drop.creator_avatar
      };

      return processedDrop;
    });

    if (!payload) {
      console.log(`Drop not found for ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Drop not found',
        code: 'DROP_NOT_FOUND'
      });
    }

    res.json(payload);
  } catch (error) {
    console.error('Error fetching drop:', error);
    if (error.message === 'Drop not found') {
      return res.status(404).json({
        success: false,
        error: 'Drop not found',
        code: 'DROP_NOT_FOUND'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drop',
      code: 'SERVER_ERROR'
    });
  }
});

// Get drops created by current user or active advertiser account
router.get('/my-drops', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }

    const advertiserId = req.advertiserAccount ? req.advertiserAccount.id : null;

    let query = supabase.from('drops').select('*');

    if (advertiserId) {
      query = query.eq('advertiser_account_id', advertiserId);
    } else {
      query = query.eq('creator_id', req.user.id);
    }

    const { data: drops, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching user drops:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch user drops' });
    }

    res.json(drops || []);
  } catch (error) {
    console.error('Error fetching user drops:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user drops' });
  }
});

// Apply to drop
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { application_message } = req.body;

    if (!supabase) {
      // Mock application response
      return res.json({
        success: true,
        application: {
          id: Math.floor(Math.random() * 1000),
          drop_id: parseInt(id),
          user_id: 1,
          status: 'pending',
          application_message,
          gems_earned: 0,
          applied_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        message: 'Application submitted successfully'
      });
    }

    // Check if drop exists and is active
    const { data: drop, error: dropError } = await supabase
      .from('drops')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (dropError || !drop) {
      return res.status(404).json({ success: false, error: 'Drop not found or not active' });
    }

    // Check if user already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('drop_applications')
      .select('*')
      .eq('drop_id', id)
      .eq('user_id', 1) // TODO: Get from authenticated user
      .single();

    if (existingApplication && !checkError) {
      return res.status(400).json({ success: false, error: 'You have already applied to this drop' });
    }

    // Economy: Check Master Key and Deduct PromoKeys
    const economyService = require('../services/economyService');
    const { drops: dropConfig } = economyService.CONFIG;

    // 1. Check Master Key
    if (dropConfig.access_rule?.includes('Master Key')) {
      const masterKeyStatus = await economyService.getMasterKeyStatus(req.user.id);
      if (!masterKeyStatus.active) {
        return res.status(403).json({ success: false, error: 'Master Key required to apply for Drops', code: 'MASTER_KEY_REQUIRED' });
      }
    }

    // 2. Determine Cost
    const dropTypeConfig = dropConfig.types[drop.drop_type] || {};
    const cost = dropTypeConfig.promokey_cost || drop.key_cost || 0; // Fallback to drop property if config missing

    // 3. Spend Currency
    if (cost > 0) {
      try {
        await economyService.spendCurrency(req.user.id, 'promokeys', cost, 'drop_entry', id, `Applied to drop: ${drop.title}`);
      } catch (ecoError) {
        return res.status(402).json({ success: false, error: ecoError.message, code: 'INSUFFICIENT_FUNDS' });
      }
    }

    // Create application
    const { data: application, error } = await supabase
      .from('drop_applications')
      .insert({
        drop_id: parseInt(id),
        user_id: req.user.id,
        status: 'pending',
        application_message
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating application:', error);
      return res.status(500).json({ success: false, error: 'Failed to submit application' });
    }

    // Update drop participant count
    const { error: updateError } = await supabase
      .from('drops')
      .update({ current_participants: drop.current_participants + 1 })
      .eq('id', id);

    if (updateError) {
      console.error('Database error updating participant count:', updateError);
    }

    // 4. Sound Attribution (if applicable)
    if (drop.required_sound_id) {
      const soundService = require('../services/soundService');
      await soundService.incrementUsage(drop.required_sound_id).catch(err => {
        console.error('Error incrementing sound usage:', err);
      });
    }

    invalidateCache('drops:list');
    invalidateCache(`drops:item:${id}`);

    // Record verified action for Daily Layer (ecosystem integration)
    // Fire and forget - don't block response
    dailyLayerService.recordVerifiedAction({
      userId: req.user.id,
      actionType: 'PROMORANG_DROP',
      verificationMode: 'SYSTEM_EVENT',
      actionLabel: 'apply_drop',
      referenceType: 'drop',
      referenceId: parseInt(id), // drops use numeric IDs currently? mixed? parseInt just in case
      metadata: { dropTitle: drop.title }
    }).catch(err => console.warn('[Drops] Failed to record verified action:', err));

    res.json({
      success: true,
      application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error applying to drop:', error);
    res.status(500).json({ success: false, error: 'Failed to apply to drop' });
  }
});

// Create new drop
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      drop_type,
      difficulty,
      key_cost,
      gem_reward_base,
      gem_pool_total,
      follower_threshold,
      time_commitment,
      requirements,
      deliverables,
      deadline_at,
      max_participants,
      platform,
      content_url,
      is_proof_drop,
      is_paid_drop,
      move_cost_points,
      key_reward_amount
    } = req.body;

    if (!title || !description || !drop_type) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and drop_type are required'
      });
    }

    // MOVE ENFORCEMENT: Only applies to Drops that request ENGAGEMENT actions
    // (likes, comments, shares on campaign content)
    // 
    // Does NOT count as Moves:
    // - Content creation / UGC requests
    // - Content clipping
    // - Reviews
    // - Affiliate link promotion
    // - Product promotion without engagement request
    //
    const engagementTypes = ['engagement', 'like', 'comment', 'share', 'follow', 'subscribe', 'view'];
    const isEngagementDrop = engagementTypes.includes(drop_type) ||
      (drop_type === 'social_engagement') ||
      (req.body.requires_engagement === true);

    if (isEngagementDrop) {
      const userId = req.user?.id;
      const advertiserId = req.advertiserAccount ? req.advertiserAccount.id : null;
      const userTier = req.user?.advertiser_tier || req.user?.user_tier || 'free';

      // If we have an advertiser account, use its ID for move tracking
      const checkId = advertiserId || userId;
      const moveCheck = await checkMoveAvailability(checkId, userTier);

      if (!moveCheck.allowed) {
        return res.status(403).json({
          success: false,
          error: moveCheck.error,
          code: 'MOVE_LIMIT_REACHED',
          movesRemaining: 0,
          tier: userTier
        });
      }
    }

    // GEM ESCROW: Validate that gem_pool_total is provided for escrow
    const escrowAmount = gem_pool_total || gem_reward_base || 0;
    if (escrowAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Gem escrow amount (gem_pool_total) is required. All Drops must have Gems in escrow.',
        code: 'ESCROW_REQUIRED'
      });
    }

    if (!supabase) {
      invalidateCache('drops:list');
      invalidateCache('drops:item');

      return res.status(201).json({
        success: true,
        drop: {
          id: Date.now(),
          creator_id: 1,
          title,
          description,
          drop_type,
          difficulty: difficulty || 'easy',
          key_cost: key_cost || 0,
          gem_reward_base: gem_reward_base || 0,
          gem_pool_total: gem_pool_total || 0,
          gem_pool_remaining: gem_pool_total || 0,
          status: 'active',
          current_participants: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        message: 'Drop created successfully'
      });
    }

    // Fetch user details for creator_name
    let creatorName = 'Friendly Creator';
    if (req.user && req.user.id) {
      const { data: u } = await supabase
        .from('users')
        .select('display_name, username')
        .eq('id', req.user.id)
        .single();
      if (u) {
        creatorName = u.display_name || u.username;
      }
    }

    const advertiserId = req.advertiserAccount ? req.advertiserAccount.id : null;

    const { data: drop, error } = await supabase
      .from('drops')
      .insert({
        creator_id: req.user.id,
        advertiser_account_id: advertiserId,
        creator_name: creatorName,
        title,
        description,
        drop_type,
        difficulty: difficulty || 'easy',
        key_cost: key_cost || 0,
        gem_reward_base: gem_reward_base || 0,
        gem_pool_total: gem_pool_total || 0,
        gem_pool_remaining: gem_pool_total || 0,
        follower_threshold: follower_threshold || 0,
        time_commitment,
        requirements,
        deliverables,
        deadline_at,
        max_participants,
        platform,
        content_url,
        move_cost_points: move_cost_points || 0,
        key_reward_amount: key_reward_amount || 0,
        is_proof_drop: is_proof_drop || false,
        is_paid_drop: is_paid_drop || false,
        status: 'active',
        current_participants: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating drop:', error);
      return res.status(500).json({ success: false, error: 'Failed to create drop' });
    }

    invalidateCache('drops:list');
    invalidateCache('drops:item');

    res.status(201).json({
      success: true,
      drop,
      message: 'Drop created successfully'
    });
  } catch (error) {
    console.error('Error creating drop:', error);
    res.status(500).json({ success: false, error: 'Failed to create drop' });
  }
});

// Update drop
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!supabase) {
      return res.json({
        success: true,
        drop: { id: parseInt(id), ...updates, updated_at: new Date().toISOString() },
        message: 'Drop updated successfully'
      });
    }

    const { data: drop, error } = await supabase
      .from('drops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating drop:', error);
      return res.status(500).json({ success: false, error: 'Failed to update drop' });
    }

    res.json({ success: true, drop, message: 'Drop updated successfully' });
  } catch (error) {
    console.error('Error updating drop:', error);
    res.status(500).json({ success: false, error: 'Failed to update drop' });
  }
});

// Get drop applications for creator
router.get('/:id/applications', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.json([]);
    }

    const { data: applications, error } = await supabase
      .from('drop_applications')
      .select(`
        *,
        users!inner(username, display_name, avatar_url)
      `)
      .eq('drop_id', id)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Database error fetching applications:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch applications' });
    }

    res.json(applications || []);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

// Approve/reject application
router.post('/:dropId/applications/:applicationId', async (req, res) => {
  try {
    const { dropId, applicationId } = req.params;
    const { action, review_score } = req.body; // 'approve' or 'reject'

    if (!supabase) {
      return res.json({
        success: true,
        message: `Application ${action}d successfully`
      });
    }

    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      review_score: review_score || null
    };

    if (action === 'approve') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: application, error } = await supabase
      .from('drop_applications')
      .update(updateData)
      .eq('id', applicationId)
      .eq('drop_id', dropId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating application:', error);
      return res.status(500).json({ success: false, error: 'Failed to update application' });
    }

    // Track referral commission if drop is approved
    if (action === 'approve' && application.user_id) {
      const promoShareService = require('../services/promoShareService'); // Lazy load
      try {
        // Get drop details to find reward amount
        const { data: drop } = await supabase
          .from('drops')
          .select('gem_reward_base')
          .eq('id', dropId)
          .single();

        if (drop && drop.gem_reward_base) {
          await trackDropCompletion(application.user_id, drop.gem_reward_base, dropId);
        }

        // Award PromoShare Ticket
        await promoShareService.awardTicket(application.user_id, 'drop_completion', dropId);

      } catch (referralError) {
        console.error('Error tracking referral/ticket:', referralError);
        // Don't fail the request
      }
    }

    res.json({
      success: true,
      application,
      message: `Application ${action}d successfully`
    });

    // Send email notification (async, after response)
    try {
      // Fetch user email and drop details
      const { data: user } = await supabase
        .from('users')
        .select('email, display_name, username')
        .eq('id', application.user_id)
        .single();

      const { data: drop } = await supabase
        .from('drops')
        .select('title, gem_reward_base, deadline_at')
        .eq('id', dropId)
        .single();

      if (user?.email && drop) {
        const userName = user.display_name || user.username;
        if (action === 'approve') {
          sendDropApprovedEmail(user.email, userName, {
            title: drop.title,
            gemReward: drop.gem_reward_base,
            deadline: drop.deadline_at,
          }).catch(err => console.error('Failed to send drop approved email:', err));
        } else {
          sendDropRejectedEmail(user.email, userName, {
            title: drop.title,
            reason: req.body.rejection_reason || null,
          }).catch(err => console.error('Failed to send drop rejected email:', err));
        }
      }
    } catch (emailErr) {
      console.error('Error sending application email:', emailErr);
    }
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ success: false, error: 'Failed to update application' });
  }
});

module.exports = router;
