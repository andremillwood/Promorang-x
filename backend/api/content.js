const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const supabase = require('../lib/supabase');

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

// Demo media assets used when the CDN is unavailable locally
const DEMO_MEDIA = [
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1587614295999-6c0c1a6eac2d?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1080&q=80',
];

const CONTENT_STORAGE_BUCKET = process.env.SUPABASE_CONTENT_BUCKET || 'content-media';
const STORAGE_PREFIX = process.env.CONTENT_UPLOAD_PREFIX || 'uploads';

// Mock auth middleware
const authMiddleware = (req, res, next) => {
  req.user = { id: 'mock-user-id', email: 'user@example.com' };
  next();
};

// Apply auth to protected routes
router.use(authMiddleware);

const normalizeMediaUrl = (url, index = 0) => {
  if (!url || typeof url !== 'string') {
    return DEMO_MEDIA[index % DEMO_MEDIA.length];
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('cdn.promorang.com')) {
      return DEMO_MEDIA[index % DEMO_MEDIA.length];
    }
    return url;
  } catch (error) {
    return DEMO_MEDIA[index % DEMO_MEDIA.length];
  }
};

const sanitizeFileName = (fileName = 'upload.jpg') => {
  const name = fileName.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  if (!name.includes('.')) {
    return `${name || 'upload'}.jpg`;
  }
  const [base, ext] = name.split(/\.(?=[^.]+$)/);
  return `${base || 'upload'}.${ext || 'jpg'}`;
};

const buildStorageObjectKey = (userId, fileName) => {
  const safeName = sanitizeFileName(fileName);
  const suffix = crypto.randomUUID();
  const now = new Date();
  const datePrefix = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${String(now.getUTCDate()).padStart(2, '0')}`;
  const owner = userId || 'anonymous';
  return `${STORAGE_PREFIX}/${owner}/${datePrefix}/${suffix}-${safeName}`;
};

const pickPlaceholderImage = (seed = 'placeholder') => {
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  const index = parseInt(hash.slice(0, 8), 16) % DEMO_MEDIA.length;
  return DEMO_MEDIA[index];
};

const deriveEngagementRateFromSharePrice = (sharePrice) => {
  const price = Number(sharePrice || 0);
  if (!Number.isFinite(price) || price <= 0) {
    return 0.05; // baseline rate for default pricing
  }
  return Number((price / 10).toFixed(4));
};

const looksLikeUuid = (value) => typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);

const isMissingRelationError = (error) => {
  if (!error) return false;
  return error.code === '42P01' || /relation .* does not exist/i.test(error.message || '');
};

const mintInitialSharePosition = async ({
  contentItemsId,
  shareCount,
  userId
}) => {
  if (!supabase || !looksLikeUuid(userId) || !contentItemsId || !looksLikeUuid(contentItemsId) || !shareCount || shareCount <= 0) {
    return { minted: false, reason: 'Invalid context for share minting' };
  }

  try {
    const { error } = await supabase
      .from('content_share_positions')
      .insert({
        content_id: contentItemsId,
        holder_id: userId,
        shares_owned: shareCount,
        total_invested: 0
      });

    if (error) {
      if (isMissingRelationError(error)) {
        console.warn('content_share_positions table unavailable; skipping initial share mint.');
        return { minted: false, reason: 'positions_table_missing' };
      }
      console.error('Error minting initial share position:', error);
      return { minted: false, reason: error.message || 'mint_failed' };
    }

    return { minted: true, table: 'content_share_positions' };
  } catch (error) {
    console.error('Unexpected error minting initial share position:', error);
    return { minted: false, reason: 'unexpected_error' };
  }
};

const buildContentResponse = (rows = []) => {
  return rows.map((row, index) => {
    const impressions = Number(row.impressions) || 0;
    const clicks = Number(row.clicks) || 0;
    const engagements = Number(row.engagements) || 0;
    const shares = Number(row.shares) || 0;
    const explicitTotalShares = Number(row.total_shares);
    const conversions = Number(row.conversions) || 0;
    const engagementRate = Number(row.engagement_rate) || 0;

    const totalShares = Number.isFinite(explicitTotalShares) && explicitTotalShares >= 0
      ? explicitTotalShares
      : shares || Math.max(Math.round(impressions / 100), 0);

    const explicitAvailable = Number(row.available_shares);
    const availableShares = Number.isFinite(explicitAvailable) && explicitAvailable >= 0
      ? explicitAvailable
      : Math.max(totalShares - Math.round(engagements / 5), 0);

    const explicitEngagementTotal = Number(row.engagement_shares_total);
    const engagementSharesTotal = Number.isFinite(explicitEngagementTotal) && explicitEngagementTotal >= 0
      ? explicitEngagementTotal
      : engagements || totalShares;

    const explicitEngagementRemaining = Number(row.engagement_shares_remaining);
    const engagementSharesRemaining = Number.isFinite(explicitEngagementRemaining) && explicitEngagementRemaining >= 0
      ? explicitEngagementRemaining
      : Math.max(availableShares, 0);

    const baseMediaUrl = row.media_url || row.thumbnail_url;
    const mediaUrl = normalizeMediaUrl(baseMediaUrl, index);

    const sharePrice = Number.isFinite(Number(row.share_price))
      ? Number(row.share_price)
      : Number((Math.max(engagementRate, 0.05) * 10).toFixed(2));

    return {
      id: row.id || `${index + 1}`,
      creator_id: row.creator_id || null,
      creator_username: row.creator_username || row.creator_handle || null,
      creator_name: row.creator_name || row.creator_display_name || 'Demo Creator',
      creator_avatar: row.creator_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
      platform: row.platform || 'instagram',
      platform_url: row.platform_url || row.media_url || 'https://promorang.com',
      title: row.title,
      description: row.description,
      media_url: mediaUrl,
      total_shares: totalShares,
      available_shares: availableShares,
      engagement_shares_total: engagementSharesTotal,
      engagement_shares_remaining: engagementSharesRemaining,
      share_price: sharePrice,
      current_revenue: Number(row.current_revenue) || Number((conversions * 5).toFixed(2)),
      performance_metrics: JSON.stringify({
        impressions,
        clicks,
        conversions,
        engagement_rate: engagementRate
      }),
      views_count: impressions,
      likes_count: Math.round(engagements * 0.6),
      comments_count: Math.round(engagements * 0.25),
      reposts_count: shares,
      is_demo: row.is_demo || false,
      is_sponsored: row.is_sponsored || row.status === 'sponsored' || false,
      created_at: row.created_at || row.posted_at || new Date().toISOString(),
      updated_at: row.updated_at || row.posted_at || new Date().toISOString()
    };
  });
};

// Media upload endpoint for Create flow
router.post('/upload-image', async (req, res) => {
  try {
    const { fileName, fileType, fileData } = req.body || {};

    if (!fileType || !fileData) {
      return res.status(400).json({
        success: false,
        error: 'fileType and fileData are required'
      });
    }

    let fileBuffer;
    try {
      fileBuffer = Buffer.from(fileData, 'base64');
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid base64 payload'
      });
    }

    if (!fileBuffer || !fileBuffer.length) {
      return res.status(400).json({
        success: false,
        error: 'Empty file payload'
      });
    }

    // If Supabase is not wired up locally, immediately return fallback media
    if (!supabase) {
      const fallbackImage = pickPlaceholderImage(fileName || fileType);
      return res.status(201).json({
        success: true,
        imageUrl: fallbackImage,
        fallback: true,
        fallbackReason: 'Supabase storage is not configured in this environment'
      });
    }

    const objectKey = buildStorageObjectKey(req.user?.id, fileName || `content-${Date.now()}.jpg`);

    try {
      const { error: uploadError } = await supabase.storage
        .from(CONTENT_STORAGE_BUCKET)
        .upload(objectKey, fileBuffer, {
          contentType: fileType,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(CONTENT_STORAGE_BUCKET)
        .getPublicUrl(objectKey);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Unable to generate public URL for uploaded asset');
      }

      return res.status(201).json({
        success: true,
        imageUrl: publicUrlData.publicUrl
      });
    } catch (storageError) {
      console.error('Storage upload failed:', storageError);
      const fallbackImage = pickPlaceholderImage(fileName || fileType);
      return res.status(201).json({
        success: true,
        imageUrl: fallbackImage,
        fallback: true,
        fallbackReason: storageError?.message || 'Storage unavailable'
      });
    }
  } catch (error) {
    console.error('Unexpected upload error:', error);
    const fallbackImage = pickPlaceholderImage();
    res.status(201).json({
      success: true,
      imageUrl: fallbackImage,
      fallback: true,
      fallbackReason: 'Unexpected error, using fallback media'
    });
  }
});

// Placeholder generator for UI fallback
router.post('/generate-placeholder', (req, res) => {
  const { description, platform } = req.body || {};
  const seed = `${platform || 'generic'}-${description || Date.now()}`;
  const imageUrl = pickPlaceholderImage(seed);

  res.json({
    success: true,
    imageUrl,
    fallback: true,
    fallbackReason: 'Generated placeholder asset'
  });
});

// Get all content
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    const cacheKey = `content:list:${page}:${limit}:${type || 'all'}`;

    const responsePayload = await getCachedValue(cacheKey, async () => {
      if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
        const placeholder = Array.from({ length: limit }, (_, i) => ({
          id: `${i + 1}`,
          title: `Demo Content ${i + 1}`,
          description: `This is a demo content item ${i + 1}.`,
          platform: ['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin'][Math.floor(Math.random() * 5)],
          media_url: i % 2 === 0 ? `https://picsum.photos/seed/${i}/800/450` : null,
          impressions: 1000 + i * 150,
          clicks: 200 + i * 20,
          engagements: 300 + i * 25,
          shares: 50 + i * 5,
          conversions: 10 + i,
          engagement_rate: 0.045 + i * 0.001,
          creator_name: `Demo Creator ${i + 1}`,
          creator_username: `demo_creator_${i + 1}`,
          status: i % 3 === 0 ? 'sponsored' : 'published',
          posted_at: new Date(Date.now() - i * 86400000).toISOString()
        }));
        return buildContentResponse(placeholder);
      }

      const queryStart = Date.now();
      let query = supabase
        .from('content_items')
        .select('*')
        .order('posted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) {
        query = query.eq('platform', type);
      }

      const { data: rows, error } = await query;
      const durationMs = Date.now() - queryStart;
      if (durationMs > 250) {
        console.log(`[content:list] Supabase query took ${durationMs}ms`);
      }

      if (error) {
        console.error('Database error fetching content:', error);
        throw new Error('Failed to fetch content');
      }

      return buildContentResponse(rows || []);
    });

    res.json(responsePayload);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content' });
  }
});

// Sponsored content feed
router.get('/sponsored', async (req, res) => {
  try {
    const cacheKey = 'content:sponsored';
    const payload = await getCachedValue(cacheKey, async () => {
      if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
        return buildContentResponse([
          {
            id: 'sponsored-demo-1',
            title: 'Sponsored Demo Content',
            description: 'Showcase of a sponsored activation on Promorang.',
            platform: 'instagram',
            media_url: 'https://picsum.photos/seed/sponsored/800/450',
            impressions: 22000,
            clicks: 1800,
            engagements: 5400,
            shares: 720,
            conversions: 260,
            engagement_rate: 0.062,
            creator_name: 'Promorang Creator',
            creator_username: 'promorang_creator',
            status: 'sponsored',
            posted_at: new Date(Date.now() - 2 * 86400000).toISOString()
          }
        ]);
      }

      const queryStart = Date.now();
      const { data: rows, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('status', 'sponsored')
        .order('posted_at', { ascending: false })
        .limit(10);
      const durationMs = Date.now() - queryStart;
      if (durationMs > 250) {
        console.log(`[content:sponsored] Supabase query took ${durationMs}ms`);
      }

      if (error) {
        console.error('Database error fetching sponsored content:', error);
        throw new Error('Failed to fetch sponsored content');
      }

      return buildContentResponse(rows || []);
    });

    res.json(payload);
  } catch (error) {
    console.error('Error fetching sponsored content:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sponsored content' });
  }
});

// Get single content item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `content:item:${id}`;
    const payload = await getCachedValue(cacheKey, async () => {
      if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
        const content = {
          id: parseInt(id),
          title: `Content Item ${id}`,
          description: `This is the full description for content item ${id}`,
          type: 'post',
          author: {
            id: 'user_1',
            username: 'sample_user',
            avatar: 'https://via.placeholder.com/40'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          media: ['https://via.placeholder.com/600x400'],
          tags: ['sample', 'content', 'api']
        };

        return { success: true, content };
      }

      const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);

      let query = supabase
        .from('content_items')
        .select('*');

      if (isUuid) {
        query = query.eq('id', id).single();
      } else {
        const numericId = Number(id);
        if (!Number.isNaN(numericId) && numericId > 0) {
          query = query.order('posted_at', { ascending: false }).range(numericId - 1, numericId - 1).limit(1);
        } else {
          throw new Error('Invalid content identifier');
        }
      }

      const queryStart = Date.now();
      const { data: contentRows, error } = await query;
      const durationMs = Date.now() - queryStart;
      if (durationMs > 250) {
        console.log(`[content:item:${id}] Supabase query took ${durationMs}ms`);
      }

      const content = Array.isArray(contentRows) ? contentRows[0] : contentRows;

      if (error || !content) {
        console.error('Database error fetching content:', error || 'No content row');
        throw new Error('Content not found');
      }

      return { success: true, content: buildContentResponse([content])[0] };
    }, DEFAULT_CACHE_TTL_MS);

    res.json(payload);
  } catch (error) {
    console.error('Error fetching content item:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content item' });
  }
});

// Get content metrics
router.get('/:id/metrics', async (req, res) => {
  const { id } = req.params;
  
  // Input validation
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Content ID is required' 
    });
  }

  try {
    const cacheKey = `content:metrics:${id}`;
    
    const metrics = await getCachedValue(cacheKey, async () => {
      // Demo data fallback
      if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
        return {
          success: true,
          data: {
            likes: Math.floor(Math.random() * 5000) + 100,
            comments: Math.floor(Math.random() * 500) + 10,
            shares: Math.floor(Math.random() * 200) + 5,
            views: Math.floor(Math.random() * 50000) + 1000,
            internal_moves: Math.floor(Math.random() * 100) + 5,
            external_moves: Math.floor(Math.random() * 50) + 2,
            total_engagement: Math.floor(Math.random() * 10000) + 500
          }
        };
      }

      try {
        const queryStart = Date.now();
        const { data: actions, error } = await supabase
          .from('social_actions')
          .select('action_type, points_earned')
          .eq('reference_id', id)
          .eq('reference_type', 'content');
          
        const durationMs = Date.now() - queryStart;
        if (durationMs > 250) {
          console.log(`[content:metrics:${id}] Supabase query took ${durationMs}ms`);
        }

        if (error) {
          console.error(`Database error fetching metrics for content ${id}:`, error);
          throw new Error('Failed to fetch metrics from database');
        }

        return {
          success: true,
          data: {
            likes: actions?.filter(a => a.action_type === 'like').length || 0,
            comments: actions?.filter(a => a.action_type === 'comment').length || 0,
            shares: actions?.filter(a => a.action_type === 'share').length || 0,
            views: Math.floor(Math.random() * 50000) + 1000,
            internal_moves: Math.floor(Math.random() * 100) + 5,
            external_moves: Math.floor(Math.random() * 50) + 2,
            total_engagement: actions?.length || 0
          }
        };
      } catch (dbError) {
        console.error(`Error in metrics cache function for content ${id}:`, dbError);
        throw dbError; // Re-throw to be caught by the outer catch
      }
    }, DEFAULT_CACHE_TTL_MS);

    // If we got a successful response from cache or DB, return it
    if (metrics && metrics.success) {
      return res.json(metrics.data);
    }
    
    // If we got here, there was an issue with the data
    throw new Error('Failed to process metrics data');
    
  } catch (error) {
    console.error(`Error in /api/content/${id}/metrics:`, error);
    
    // Return appropriate status code based on error type
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      error: error.message || 'Failed to fetch content metrics',
      code: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Get user status for content (like, save status)
router.get('/:id/user-status', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.json({
        has_liked: Math.random() > 0.5,
        has_saved: Math.random() > 0.7
      });
    }

    // Mock user status since we don't have proper auth yet
    const userId = 1;

    const { data: actions, error } = await supabase
      .from('social_actions')
      .select('action_type')
      .eq('user_id', userId)
      .eq('reference_id', id)
      .eq('reference_type', 'content');

    if (error) {
      console.error('Database error fetching user status:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch user status' });
    }

    res.json({
      has_liked: actions?.some(a => a.action_type === 'like') || false,
      has_saved: actions?.some(a => a.action_type === 'save') || false
    });
  } catch (error) {
    console.error('Error fetching user status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user status' });
  }
});

// Get content sponsorship data
router.get('/:id/sponsorship', async (req, res) => {
  const { id } = req.params;
  
  // Input validation
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Content ID is required',
      code: 'MISSING_CONTENT_ID'
    });
  }

  try {
    // Demo data fallback when not connected to Supabase
    if (!supabase) {
      return res.json({
        success: true,
        data: {
          sponsor_count: Math.floor(Math.random() * 3) + 1,
          total_boost_multiplier: parseFloat((Math.random() * 2 + 1).toFixed(1)),
          total_gems_allocated: Math.floor(Math.random() * 5000) + 1000,
          sponsor_names: ['Demo Brand', 'Sample Sponsor'],
          primary_sponsor: 'Demo Brand',
          gems_allocated: Math.floor(Math.random() * 1000) + 500,
          boost_multiplier: parseFloat((Math.random() * 2 + 1).toFixed(1))
        }
      });
    }

    // Check if content exists first
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id')
      .eq('id', id)
      .single();

    if (contentError || !content) {
      console.error(`Content not found: ${id}`, contentError);
      return res.status(404).json({ 
        success: false, 
        error: 'Content not found',
        code: 'CONTENT_NOT_FOUND'
      });
    }

    // Fetch active sponsorships
    const { data: sponsorships, error } = await supabase
      .from('sponsorships')
      .select('*')
      .eq('content_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }); // Get most recent first

    if (error) {
      console.error(`Database error fetching sponsorships for content ${id}:`, error);
      throw new Error('Failed to fetch sponsorship data from database');
    }

    // Return null if no sponsorships found
    if (!sponsorships || sponsorships.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active sponsorships found for this content'
      });
    }

    // Calculate aggregated metrics
    const totalGems = sponsorships.reduce((sum, s) => sum + (s.gems_allocated || 0), 0);
    const avgBoost = sponsorships.length > 0 
      ? sponsorships.reduce((sum, s) => sum + (s.boost_multiplier || 0), 0) / sponsorships.length 
      : 0;

    // Prepare response
    const response = {
      success: true,
      data: {
        sponsor_count: sponsorships.length,
        total_boost_multiplier: parseFloat(avgBoost.toFixed(1)),
        total_gems_allocated: totalGems,
        sponsor_names: sponsorships.map(s => s.advertiser_name).filter(Boolean),
        primary_sponsor: sponsorships[0]?.advertiser_name || null,
        gems_allocated: sponsorships[0]?.gems_allocated || 0,
        boost_multiplier: sponsorships[0]?.boost_multiplier || 0,
        sponsorships: sponsorships.map(s => ({
          id: s.id,
          advertiser_name: s.advertiser_name,
          gems_allocated: s.gems_allocated,
          boost_multiplier: s.boost_multiplier,
          start_date: s.start_date,
          end_date: s.end_date,
          status: s.status
        }))
      }
    };

    res.json(response.data);
    
  } catch (error) {
    console.error(`Error in /api/content/${id}/sponsorship:`, error);
    
    // Determine appropriate status code
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      error: error.message || 'Failed to fetch sponsorship data',
      code: statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Create content sponsorship
router.post('/:id/sponsor', async (req, res) => {
  try {
    const { id } = req.params;
    const { gems_allocated, boost_multiplier, duration_hours } = req.body;

    if (!supabase) {
      return res.json({
        success: true,
        message: `Content sponsored successfully! It will receive ${boost_multiplier}x visibility boost for ${duration_hours} hours.`
      });
    }

    // Mock sponsorship creation
    const expiresAt = new Date(Date.now() + duration_hours * 60 * 60 * 1000);

    const { error } = await supabase
      .from('sponsorships')
      .insert({
        content_id: parseInt(id),
        sponsor_id: 1, // TODO: Get from authenticated user
        advertiser_name: 'Demo Brand',
        gems_allocated,
        boost_multiplier,
        duration_hours,
        expires_at: expiresAt.toISOString(),
        status: 'active'
      });

    if (error) {
      console.error('Database error creating sponsorship:', error);
      return res.status(500).json({ success: false, error: 'Failed to create sponsorship' });
    }

    res.json({
      success: true,
      message: `Content sponsored successfully! It will receive ${boost_multiplier}x visibility boost for ${duration_hours} hours.`
    });
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    res.status(500).json({ success: false, error: 'Failed to create sponsorship' });
  }
});

// Buy shares in content
router.post('/buy-shares', async (req, res) => {
  try {
    const { content_id, shares_count } = req.body;

    if (!supabase) {
      return res.json({
        success: true,
        message: `Successfully purchased ${shares_count} shares!`,
        transaction_id: `mock_txn_${Date.now()}`
      });
    }

    // Check if content exists and has available shares (legacy table)
    const { data: content, error: contentError } = await supabase
      .from('content_pieces')
      .select('*')
      .eq('id', content_id)
      .single();

    const missingLegacy = contentError?.code === '42P01' || /relation .* does not exist/i.test(contentError?.message || '');

    if (!missingLegacy && (contentError || !content)) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    if (!missingLegacy && content.available_shares < shares_count) {
      return res.status(400).json({ success: false, error: 'Not enough shares available' });
    }

    if (!missingLegacy) {
      // Create share purchase record
      const { error: shareError } = await supabase
        .from('content_shares')
        .insert({
          content_id,
          user_id: looksLikeUuid(req.user?.id) ? req.user.id : null,
          shares_owned: shares_count,
          total_invested: shares_count * Number(content.share_price || 0)
        });

      if (shareError) {
        console.error('Database error buying shares:', shareError);
        return res.status(500).json({ success: false, error: 'Failed to buy shares' });
      }

      // Update content available shares
      const { error: updateError } = await supabase
        .from('content_pieces')
        .update({ available_shares: content.available_shares - shares_count })
        .eq('id', content_id);

      if (updateError) {
        console.error('Database error updating content shares:', updateError);
      }

      return res.json({
        success: true,
        message: `Successfully purchased ${shares_count} shares!`,
        transaction_id: `txn_${Date.now()}`
      });
    }

    // Fallback path when legacy table is unavailable – simply acknowledge purchase
    const { data: modernContent, error: modernError } = await supabase
      .from('content_items')
      .select('id')
      .eq('id', content_id)
      .single();

    if (modernError || !modernContent) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    console.warn('content_pieces table missing; returning simulated share purchase response.');
    return res.json({
      success: true,
      message: `Share purchase recorded (simulation). Legacy share accounting unavailable.`,
      transaction_id: `sim_${Date.now()}`,
      fallback: true
    });
  } catch (error) {
    console.error('Error buying shares:', error);
    res.status(500).json({ success: false, error: 'Failed to buy shares' });
  }
});

// Record social action (like, comment, share, save)
router.post('/social-action', async (req, res) => {
  try {
    const { action_type, reference_id, reference_type } = req.body;

    if (!supabase) {
      const pointsEarned = action_type === 'like' ? 1 : action_type === 'comment' ? 3 : action_type === 'share' ? 5 : 2;
      return res.json({
        success: true,
        points_earned: pointsEarned,
        multiplier: 1.0
      });
    }

    const userId = 1; // TODO: Get from authenticated user

    // Check if user already performed this action
    const { data: existingAction, error: checkError } = await supabase
      .from('social_actions')
      .select('*')
      .eq('user_id', userId)
      .eq('action_type', action_type)
      .eq('reference_id', reference_id)
      .eq('reference_type', reference_type)
      .single();

    if (existingAction && !checkError) {
      return res.status(400).json({ success: false, error: `You have already ${action_type}d this content!` });
    }

    // Calculate points based on action type
    const pointsMap = { like: 1, comment: 3, save: 2, share: 5 };
    const basePoints = pointsMap[action_type] || 1;
    const multiplier = 1.0; // TODO: Calculate based on user tier and streak
    const pointsEarned = basePoints * multiplier;

    // Record the social action
    const { error } = await supabase
      .from('social_actions')
      .insert({
        user_id: userId,
        action_type,
        reference_id,
        reference_type,
        points_earned: pointsEarned,
        multiplier
      });

    if (error) {
      console.error('Database error recording social action:', error);
      return res.status(500).json({ success: false, error: 'Failed to record action' });
    }

    // Update user points
    const { error: updateError } = await supabase
      .from('users')
      .update({
        points_balance: supabase.raw(`points_balance + ${pointsEarned}`),
        xp_points: supabase.raw(`xp_points + ${pointsEarned}`)
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Database error updating user points:', updateError);
    }

    res.json({
      success: true,
      points_earned: pointsEarned,
      multiplier
    });
  } catch (error) {
    console.error('Error recording social action:', error);
    res.status(500).json({ success: false, error: 'Failed to record social action' });
  }
});

// Get sponsored content
router.get('/sponsored', async (req, res) => {
  try {
    if (!supabase) {
      // Mock sponsored content data
      const sponsoredContent = Array.from({ length: 3 }, (_, i) => ({
        id: 100 + i + 1,
        creator_id: Math.floor(Math.random() * 100) + 1,
        creator_username: `sponsor_user_${i + 1}`,
        creator_name: `Sponsored Creator ${i + 1}`,
        creator_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sponsor${i + 1}`,
        platform: ['instagram', 'tiktok', 'youtube', 'twitter'][Math.floor(Math.random() * 4)],
        platform_url: `https://sponsored.example.com/content/${100 + i + 1}`,
        title: `🚀 Sponsored: Premium Content ${i + 1}`,
        description: `This is sponsored content featuring premium opportunities. Invest and share to earn bonus rewards!`,
        media_url: `https://picsum.photos/400/300?random=${100 + i}`,
        total_shares: 200,
        available_shares: Math.floor(Math.random() * 100) + 20,
        engagement_shares_total: Math.floor(Math.random() * 100) + 50,
        engagement_shares_remaining: Math.floor(Math.random() * 50) + 10,
        share_price: parseFloat((Math.random() * 10 + 2).toFixed(2)),
        current_revenue: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
        performance_metrics: JSON.stringify({
          likes: Math.floor(Math.random() * 10000) + 1000,
          comments: Math.floor(Math.random() * 1000) + 100,
          shares: Math.floor(Math.random() * 500) + 50,
          views: Math.floor(Math.random() * 100000) + 10000
        }),
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
        updated_at: new Date(Date.now() - i * 3600000).toISOString()
      }));

      return res.json(sponsoredContent);
    }

    // Get content with active sponsorships
    const { data: sponsoredContent, error } = await supabase
      .from('content_pieces')
      .select(`
        *,
        sponsorships!inner(*)
      `)
      .eq('sponsorships.status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error fetching sponsored content:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch sponsored content' });
    }

    res.json(sponsoredContent || []);
  } catch (error) {
    console.error('Error fetching sponsored content:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sponsored content' });
  }
});

// Create new content
router.post('/', async (req, res) => {
  try {
    const {
      platform,
      title,
      description,
      platform_url,
      media_url,
      total_shares,
      share_price
    } = req.body;

    if (!platform || !title || !platform_url) {
      return res.status(400).json({
        success: false,
        error: 'Platform, title, and platform_url are required'
      });
    }

    const shareCount = Number.isFinite(Number(total_shares)) && Number(total_shares) > 0
      ? Number(total_shares)
      : 100;
    const sharePrice = Number.isFinite(Number(share_price)) && Number(share_price) >= 0
      ? Number(share_price)
      : 0;
    const engagementRate = deriveEngagementRateFromSharePrice(sharePrice);
    const nowIso = new Date().toISOString();
    const userId = looksLikeUuid(req.user?.id) ? req.user.id : null;
    const creatorName = req.user?.name || req.user?.fullName || req.user?.email || 'Promorang Creator';
    const creatorUsername = req.user?.username || req.user?.handle || null;
    const creatorAvatar = req.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator';

    if (!supabase) {
      const mockContent = {
        id: Date.now(),
        creator_id: userId,
        creator_name: creatorName,
        creator_username: creatorUsername,
        creator_avatar: creatorAvatar,
        platform,
        platform_url,
        title,
        description,
        media_url,
        total_shares: shareCount,
        available_shares: shareCount,
        share_price: sharePrice,
        current_revenue: 0,
        created_at: nowIso,
        updated_at: nowIso
      };

      return res.status(201).json({
        success: true,
        content: mockContent,
        message: 'Content created successfully (mock)'
      });
    }

    let primaryRecord = null;
    let primarySource = null;
    let creationError = null;
    let contentItemsRecord = null;
    let legacyRecord = null;

    // Attempt to persist in the normalized content_items table first (Supabase schema)
    const contentItemsPayload = {
      creator_id: userId,
      title,
      description,
      media_url,
      platform,
      status: 'published',
      posted_at: nowIso,
      impressions: 0,
      clicks: 0,
      engagements: 0,
      shares: shareCount,
      conversions: 0,
      engagement_rate: engagementRate
    };

    const { data: itemData, error: itemError } = await supabase
      .from('content_items')
      .insert(contentItemsPayload)
      .select()
      .single();

    if (!itemError && itemData) {
      contentItemsRecord = itemData;
      primaryRecord = {
        ...itemData,
        platform_url,
        share_price: sharePrice,
        total_shares: shareCount,
        available_shares: shareCount,
        current_revenue: 0,
        engagement_rate: engagementRate
      };
      primarySource = 'content_items';
    } else if (itemError) {
      const isMissingRelation = itemError?.code === '42P01' || /relation .* does not exist/i.test(itemError?.message || '');
      if (isMissingRelation) {
        console.warn('content_items table unavailable, continuing with legacy content_pieces:', itemError.message);
      } else {
        console.error('Database error creating content in content_items:', itemError);
        creationError = itemError;
      }
    }

    // Legacy fallback for environments still using content_pieces
    const contentPiecesPayload = {
      creator_id: null, // legacy schema expects BIGINT; unset when running without numeric IDs
      creator_username: creatorUsername,
      creator_name: creatorName,
      creator_avatar: creatorAvatar,
      platform,
      platform_url,
      title,
      description,
      media_url,
      total_shares: shareCount,
      available_shares: shareCount,
      engagement_shares_total: shareCount,
      engagement_shares_remaining: shareCount,
      share_price: sharePrice,
      current_revenue: 0,
      performance_metrics: JSON.stringify({
        impressions: 0,
        clicks: 0,
        conversions: 0,
        engagement_rate: engagementRate
      }),
      created_at: nowIso,
      updated_at: nowIso
    };

    let legacyError = null;
    if (!primaryRecord || creationError) {
      const { data: legacyData, error: legacyInsertError } = await supabase
        .from('content_pieces')
        .insert(contentPiecesPayload)
        .select()
        .single();

      if (!legacyInsertError && legacyData) {
        legacyRecord = legacyData;
        primaryRecord = {
          ...legacyData,
          platform_url,
          share_price: sharePrice,
          total_shares: shareCount,
          available_shares: shareCount,
          engagement_rate: engagementRate
        };
        primarySource = 'content_pieces';
        creationError = null;
      } else if (legacyInsertError) {
        const isMissingLegacy = legacyInsertError?.code === '42P01' || /relation .* does not exist/i.test(legacyInsertError?.message || '');
        if (isMissingLegacy) {
          console.warn('content_pieces table unavailable; only content_items will be used.');
        } else {
          legacyError = legacyInsertError;
        }
      }
    } else {
      // Even if content_items succeeded, try to keep legacy table in sync without failing the request
      const { error: legacySyncError } = await supabase
        .from('content_pieces')
        .insert(contentPiecesPayload);

      if (legacySyncError && !(legacySyncError?.code === '42P01' || /relation .* does not exist/i.test(legacySyncError?.message || ''))) {
        console.warn('Unable to sync content_pieces legacy table:', legacySyncError);
      }
    }

    if (!primaryRecord) {
      const rootError = creationError || legacyError || new Error('Unknown content creation failure');
      console.error('Failed to create content record:', rootError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create content'
      });
    }

    const responseContent = buildContentResponse([{
      ...primaryRecord,
      platform,
      platform_url,
      media_url: primaryRecord.media_url || media_url,
      shares: shareCount,
      total_shares: shareCount,
      available_shares: shareCount,
      engagement_shares_total: shareCount,
      engagement_shares_remaining: shareCount,
      share_price: sharePrice,
      current_revenue: 0,
      impressions: primaryRecord.impressions || 0,
      clicks: primaryRecord.clicks || 0,
      engagements: primaryRecord.engagements || 0,
      conversions: primaryRecord.conversions || 0,
      creator_name: primaryRecord.creator_name || creatorName,
      creator_username: primaryRecord.creator_username || creatorUsername,
      creator_avatar: primaryRecord.creator_avatar || creatorAvatar
    }])[0];

    const mintResult = await mintInitialSharePosition({
      contentItemsId: contentItemsRecord?.id || (primarySource === 'content_items' ? primaryRecord?.id : null),
      shareCount,
      userId
    });

    invalidateCache('content:list');
    invalidateCache('content:item');
    invalidateCache('content:metrics');
    invalidateCache('content:sponsored');

    return res.status(201).json({
      success: true,
      content: {
        ...responseContent,
        share_price: sharePrice,
        total_shares: shareCount,
        available_shares: shareCount
      },
      source: primarySource,
      minted_shares: mintResult,
      message: 'Content created successfully'
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ success: false, error: 'Failed to create content' });
  }
});

// Update content
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    if (!supabase) {
      invalidateCache('content:list');
      invalidateCache('content:item');
      invalidateCache('content:metrics');
      invalidateCache('content:sponsored');

      return res.json({
        success: true,
        content: { id: parseInt(id), ...updates, updated_at: new Date().toISOString() },
        message: 'Content updated successfully'
      });
    }

    const shareCountUpdate = updates.total_shares !== undefined ? Number(updates.total_shares) : undefined;
    const sharePriceUpdate = updates.share_price !== undefined ? Number(updates.share_price) : undefined;
    const engagementRate = sharePriceUpdate !== undefined
      ? deriveEngagementRateFromSharePrice(sharePriceUpdate)
      : undefined;

    let updatedRecord = null;
    let updateSource = null;
    let lastError = null;

    // Prepare content_items updates if relevant
    const contentItemsUpdates = {};
    if (updates.title !== undefined) contentItemsUpdates.title = updates.title;
    if (updates.description !== undefined) contentItemsUpdates.description = updates.description;
    if (updates.media_url !== undefined) contentItemsUpdates.media_url = updates.media_url;
    if (updates.platform !== undefined) contentItemsUpdates.platform = updates.platform;
    if (updates.status !== undefined) contentItemsUpdates.status = updates.status;
    if (updates.posted_at !== undefined) contentItemsUpdates.posted_at = updates.posted_at;
    if (shareCountUpdate !== undefined && Number.isFinite(shareCountUpdate)) contentItemsUpdates.shares = shareCountUpdate;
    if (engagementRate !== undefined && Number.isFinite(engagementRate)) contentItemsUpdates.engagement_rate = engagementRate;

    if (Object.keys(contentItemsUpdates).length > 0) {
      const { data, error } = await supabase
        .from('content_items')
        .update(contentItemsUpdates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        updatedRecord = {
          ...data,
          platform_url: updates.platform_url || data.platform_url,
          share_price: sharePriceUpdate !== undefined ? sharePriceUpdate : data.share_price,
          total_shares: shareCountUpdate !== undefined ? shareCountUpdate : data.shares
        };
        updateSource = 'content_items';
      } else if (error) {
        const missingRelation = error?.code === '42P01' || /relation .* does not exist/i.test(error?.message || '');
        if (!missingRelation) {
          console.error('Error updating content_items:', error);
          lastError = error;
        }
      }
    }

    // Prepare legacy table updates
    const legacyUpdates = {};
    ['creator_username', 'creator_name', 'creator_avatar', 'platform', 'platform_url', 'title', 'description', 'media_url', 'current_revenue']
      .forEach((key) => {
        if (updates[key] !== undefined) {
          legacyUpdates[key] = updates[key];
        }
      });
    if (shareCountUpdate !== undefined && Number.isFinite(shareCountUpdate)) {
      legacyUpdates.total_shares = shareCountUpdate;
      legacyUpdates.available_shares = shareCountUpdate;
      legacyUpdates.engagement_shares_total = shareCountUpdate;
      legacyUpdates.engagement_shares_remaining = shareCountUpdate;
    }
    if (sharePriceUpdate !== undefined && Number.isFinite(sharePriceUpdate)) {
      legacyUpdates.share_price = sharePriceUpdate;
      if (updates.performance_metrics !== undefined) {
        legacyUpdates.performance_metrics = typeof updates.performance_metrics === 'string'
          ? updates.performance_metrics
          : JSON.stringify({
              ...updates.performance_metrics,
              engagement_rate: engagementRate
            });
      }
    }
    if (updates.performance_metrics !== undefined && legacyUpdates.performance_metrics === undefined) {
      legacyUpdates.performance_metrics = typeof updates.performance_metrics === 'string'
        ? updates.performance_metrics
        : JSON.stringify(updates.performance_metrics);
    }

    if (Object.keys(legacyUpdates).length > 0) {
      const { data: legacyData, error: legacyError } = await supabase
        .from('content_pieces')
        .update(legacyUpdates)
        .eq('id', id)
        .select()
        .single();

      if (!legacyError && legacyData && !updatedRecord) {
        updatedRecord = {
          ...legacyData,
          share_price: sharePriceUpdate !== undefined ? sharePriceUpdate : legacyData.share_price,
          total_shares: shareCountUpdate !== undefined ? shareCountUpdate : legacyData.total_shares
        };
        updateSource = 'content_pieces';
      } else if (legacyError) {
        const missingLegacy = legacyError?.code === '42P01' || /relation .* does not exist/i.test(legacyError?.message || '');
        if (!missingLegacy) {
          console.error('Error updating content_pieces:', legacyError);
          lastError = legacyError;
        }
      }
    }

    if (!updatedRecord) {
      if (lastError) {
        return res.status(500).json({ success: false, error: 'Failed to update content' });
      }
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    const response = buildContentResponse([{
      ...updatedRecord,
      platform: updates.platform || updatedRecord.platform,
      platform_url: updates.platform_url || updatedRecord.platform_url,
      media_url: updates.media_url || updatedRecord.media_url,
      shares: updatedRecord.shares || updatedRecord.total_shares,
      total_shares: updatedRecord.total_shares || updatedRecord.shares,
      available_shares: updatedRecord.available_shares,
      engagement_shares_total: updatedRecord.engagement_shares_total,
      engagement_shares_remaining: updatedRecord.engagement_shares_remaining,
      share_price: sharePriceUpdate !== undefined ? sharePriceUpdate : updatedRecord.share_price,
      impressions: updatedRecord.impressions,
      clicks: updatedRecord.clicks,
      conversions: updatedRecord.conversions
    }])[0];

    invalidateCache('content:list');
    invalidateCache('content:item');
    invalidateCache('content:metrics');
    invalidateCache('content:sponsored');

    res.json({
      success: true,
      content: {
        ...response,
        share_price: sharePriceUpdate !== undefined ? sharePriceUpdate : response.share_price,
        total_shares: shareCountUpdate !== undefined ? shareCountUpdate : response.total_shares
      },
      source: updateSource,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, error: 'Failed to update content' });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      invalidateCache('content:list');
      invalidateCache('content:item');
      invalidateCache('content:metrics');
      invalidateCache('content:sponsored');

      return res.json({
        success: true,
        message: `Content ${id} deleted successfully`
      });
    }

    let deleted = false;
    let lastError = null;

    const tables = ['content_items', 'content_pieces'];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (!error) {
        deleted = true;
      } else {
        const missingRelation = error?.code === '42P01' || /relation .* does not exist/i.test(error?.message || '');
        if (!missingRelation) {
          lastError = error;
          console.error(`Database error deleting content from ${table}:`, error);
        }
      }
    }

    if (!deleted) {
      if (lastError) {
        return res.status(500).json({ success: false, error: 'Failed to delete content' });
      }
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    invalidateCache('content:list');
    invalidateCache('content:item');
    invalidateCache('content:metrics');
    invalidateCache('content:sponsored');

    res.json({ success: true, message: `Content ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ success: false, error: 'Failed to delete content' });
  }
});

// Tip creator
router.post('/tip', async (req, res) => {
  try {
    const { content_id, tip_amount } = req.body;

    if (!supabase) {
      return res.json({
        success: true,
        message: `Successfully tipped ${tip_amount} gems! Creator will receive the tip.`,
        transaction_id: `tip_txn_${Date.now()}`
      });
    }

    // Mock tip functionality
    const userId = 1; // TODO: Get from authenticated user

    // Create tip record
    const { error } = await supabase
      .from('tips')
      .insert({
        content_id,
        tipper_id: userId,
        tip_amount,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Database error creating tip:', error);
      return res.status(500).json({ success: false, error: 'Failed to send tip' });
    }

    // Update user gems balance (subtract from tipper)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        gems_balance: supabase.raw(`gems_balance - ${tip_amount}`)
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Database error updating tipper balance:', updateError);
    }

    // Update content creator revenue
    const { data: content, error: contentError } = await supabase
      .from('content_pieces')
      .select('creator_id')
      .eq('id', content_id)
      .single();

    if (content && !contentError) {
      const { error: creatorUpdateError } = await supabase
        .from('users')
        .update({
          gems_balance: supabase.raw(`gems_balance + ${tip_amount}`)
        })
        .eq('id', content.creator_id);

      if (creatorUpdateError) {
        console.error('Database error updating creator balance:', creatorUpdateError);
      }
    }

    res.json({
      success: true,
      message: `Successfully tipped ${tip_amount} gems!`,
      transaction_id: `tip_${Date.now()}`
    });
  } catch (error) {
    console.error('Error sending tip:', error);
    res.status(500).json({ success: false, error: 'Failed to send tip' });
  }
});

module.exports = router;
