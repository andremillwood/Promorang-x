const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { trackDropCompletion } = require('../utils/referralTracker');
const { requireAuth } = require('./_core/auth');

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

router.use(requireAuth);

// Get all drops
router.get('/', async (req, res) => {
  try {
    const { limit = 10, type } = req.query;
    const cacheKey = `drops:list:${limit}:${type || 'all'}`;

    const drops = await getCachedValue(cacheKey, async () => {
      if (!supabase || process.env.USE_DEMO_DROPS === 'true') {
        return Array.from({ length: parseInt(limit) }, (_, i) => ({
          id: i + 1,
          creator_id: Math.floor(Math.random() * 100) + 1,
          creator_name: `Drop Creator ${i + 1}`,
          creator_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=creator${i + 1}`,
          title: `Earn ${Math.floor(Math.random() * 100) + 10} Gems - ${['Instagram Post', 'TikTok Video', 'YouTube Review', 'Twitter Thread'][Math.floor(Math.random() * 4)]}`,
        description: `Complete this task to earn gems and boost your profile. ${['Share your experience', 'Create engaging content', 'Review a product', 'Participate in discussion'][Math.floor(Math.random() * 4)]} and get rewarded!`,
        drop_type: ['content_clipping', 'reviews', 'ugc_creation', 'affiliate_referral'][Math.floor(Math.random() * 4)],
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
        content_url: `https://example.com/drop/${i + 1}`,
        preview_image: `https://images.unsplash.com/photo-${1503376780353 + i}?auto=format&fit=crop&w=1200&q=80&sat=-20&sig=${i + 1}`,
        move_cost_points: Math.floor(Math.random() * 5) + 1,
        key_reward_amount: Math.floor(Math.random() * 5) + 1,
        is_proof_drop: Math.random() > 0.7,
        is_paid_drop: Math.random() > 0.5,
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
        updated_at: new Date(Date.now() - i * 3600000).toISOString()
        }));
      }

      let query = supabase
        .from('drops')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (type) {
        query = query.eq('drop_type', type);
      }

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

      return rows || [];
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
        .select('*')
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

      return drop;
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

// Get drops created by current user
router.get('/my-drops', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }

    const { data: drops, error } = await supabase
      .from('drops')
      .select('*')
      .eq('creator_id', 1) // TODO: Get from authenticated user
      .order('created_at', { ascending: false });

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

    // Create application
    const { data: application, error } = await supabase
      .from('drop_applications')
      .insert({
        drop_id: parseInt(id),
        user_id: 1, // TODO: Get from authenticated user
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

    invalidateCache('drops:list');
    invalidateCache(`drops:item:${id}`);

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

    const { data: drop, error } = await supabase
      .from('drops')
      .insert({
        creator_id: 1, // TODO: Get from authenticated user
        creator_name: 'Demo User',
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
      } catch (referralError) {
        console.error('Error tracking referral commission:', referralError);
        // Don't fail the request if referral tracking fails
      }
    }

    res.json({
      success: true,
      application,
      message: `Application ${action}d successfully`
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ success: false, error: 'Failed to update application' });
  }
});

module.exports = router;
