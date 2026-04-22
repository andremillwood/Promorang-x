/**
 * Multi-Asset Pieces Market API
 * Handles tradable pieces for: content, moments, hosts, venues
 * Rebranded from "shares" to "pieces" to avoid securities terminology
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase: serviceSupabase } = require('../lib/supabase');
const pieceTradingService = require('../services/pieceTradingService');
const pieceMintingService = require('../services/pieceMintingService');
const pieceDividendService = require('../services/pieceDividendService');
const pieceGovernanceService = require('../services/pieceGovernanceService');
const pieceAMMService = require('../services/pieceAMMService');
const marketMakerService = require('../services/marketMakerService');
const gemsService = require('../services/gemsService');
const simpleKYCService = require('../services/simpleKYCService');

const supabase = global.supabase || serviceSupabase || null;
const USE_DEMO = process.env.USE_DEMO_CONTENT === 'true';

// Cache helpers (simple in-memory with TTL)
const cache = new Map();
const DEFAULT_CACHE_TTL = 15000; // 15 seconds

function getCachedValue(key, fetcher, ttl = DEFAULT_CACHE_TTL) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < ttl) {
    return Promise.resolve(cached.value);
  }
  return fetcher().then(value => {
    cache.set(key, { value, ts: Date.now() });
    return value;
  });
}

function invalidateCache(pattern) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

// =====================================================
// DEMO DATA GENERATORS
// =====================================================

const PIECE_TYPES = ['content', 'moment', 'host', 'venue'];

const DEMO_CATEGORIES = {
  content: [
    { id: 'cat-1', name: 'Technology', slug: 'tech', icon: 'Cpu', color: '#3B82F6', piece_count: 12 },
    { id: 'cat-2', name: 'Fashion', slug: 'fashion', icon: 'Shirt', color: '#EC4899', piece_count: 8 },
    { id: 'cat-3', name: 'Music', slug: 'music', icon: 'Music', color: '#8B5CF6', piece_count: 15 },
    { id: 'cat-4', name: 'Comedy', slug: 'comedy', icon: 'Laugh', color: '#F59E0B', piece_count: 6 },
  ],
  moment: [
    { id: 'cat-m1', name: 'Gatherings', slug: 'gatherings', icon: 'Users', color: '#3B82F6', piece_count: 20 },
    { id: 'cat-m2', name: 'Experiences', slug: 'experiences', icon: 'Zap', color: '#8B5CF6', piece_count: 15 },
    { id: 'cat-m3', name: 'Drops', slug: 'drops', icon: 'Package', color: '#F97316', piece_count: 10 },
    { id: 'cat-m4', name: 'Performances', slug: 'performances', icon: 'Mic2', color: '#EC4899', piece_count: 8 },
  ],
  host: [
    { id: 'cat-h1', name: 'Verified Hosts', slug: 'verified', icon: 'BadgeCheck', color: '#10B981', piece_count: 25 },
    { id: 'cat-h2', name: 'Rising Hosts', slug: 'rising', icon: 'TrendingUp', color: '#3B82F6', piece_count: 18 },
    { id: 'cat-h3', name: 'Top Rated', slug: 'top-rated', icon: 'Star', color: '#F59E0B', piece_count: 12 },
  ],
  venue: [
    { id: 'cat-v1', name: 'Cafes', slug: 'cafes', icon: 'Coffee', color: '#8B5CF6', piece_count: 30 },
    { id: 'cat-v2', name: 'Restaurants', slug: 'restaurants', icon: 'UtensilsCrossed', color: '#F97316', piece_count: 22 },
    { id: 'cat-v3', name: 'Bars & Clubs', slug: 'bars-clubs', icon: 'Wine', color: '#EC4899', piece_count: 16 },
    { id: 'cat-v4', name: 'Galleries', slug: 'galleries', icon: 'Palette', color: '#8B5CF6', piece_count: 10 },
  ],
};

function generateDemoOHLC(basePrice, periods = 24) {
  const history = [];
  let price = basePrice;
  const now = Date.now();
  
  for (let i = periods; i >= 0; i--) {
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * 2 * volatility;
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 1000) + 100;
    
    history.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(low.toFixed(4)),
      close: Number(close.toFixed(4)),
      volume,
    });
    
    price = close;
  }
  
  return history;
}

function generateDemoPieceStats(basePrice = 10) {
  const currentPrice = basePrice + (Math.random() - 0.5) * basePrice * 0.2;
  const dayOpen = basePrice;
  
  return {
    current_price: Number(currentPrice.toFixed(4)),
    previous_close: Number((basePrice * 0.98).toFixed(4)),
    day_open: Number(dayOpen.toFixed(4)),
    day_high: Number((dayOpen * 1.05).toFixed(4)),
    day_low: Number((dayOpen * 0.95).toFixed(4)),
    week_high: Number((dayOpen * 1.15).toFixed(4)),
    week_low: Number((dayOpen * 0.85).toFixed(4)),
    all_time_high: Number((dayOpen * 2.5).toFixed(4)),
    all_time_low: Number((dayOpen * 0.5).toFixed(4)),
    total_pieces: 100,
    available_pieces: Math.floor(Math.random() * 80) + 10,
    market_cap: Number((currentPrice * 100).toFixed(2)),
    volume_24h: Math.floor(Math.random() * 5000) + 500,
    volume_7d: Math.floor(Math.random() * 25000) + 2500,
    trade_count_24h: Math.floor(Math.random() * 200) + 20,
    change_24h: Number(((currentPrice - dayOpen) / dayOpen * 100).toFixed(4)),
    change_7d: Number(((Math.random() - 0.5) * 20).toFixed(4)),
    change_30d: Number(((Math.random() - 0.5) * 40).toFixed(4)),
    holder_count: Math.floor(Math.random() * 50) + 5,
  };
}

// =====================================================
// CATEGORIES ENDPOINTS
// =====================================================

// GET /api/pieces/categories/:pieceType - Get categories for a piece type
router.get('/categories/:pieceType', async (req, res) => {
  try {
    const { pieceType } = req.params;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!supabase || USE_DEMO) {
      return res.json({ 
        piece_type: pieceType,
        categories: DEMO_CATEGORIES[pieceType] || []
      });
    }
    
    const { data: categories, error } = await supabase
      .from('piece_categories')
      .select('*')
      .eq('piece_type', pieceType)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      piece_type: pieceType,
      categories: categories || [],
    });
  } catch (error) {
    console.error(`[Pieces API] categories error:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch categories' });
  }
});

// GET /api/pieces/categories - Get all categories across all types
router.get('/categories', async (req, res) => {
  try {
    if (!supabase || USE_DEMO) {
      return res.json({
        piece_types: DEMO_CATEGORIES,
      });
    }
    
    const { data: categories, error } = await supabase
      .from('piece_categories')
      .select('*')
      .eq('is_active', true)
      .order('piece_type', { ascending: true })
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    // Group by piece_type
    const grouped = categories.reduce((acc, cat) => {
      if (!acc[cat.piece_type]) acc[cat.piece_type] = [];
      acc[cat.piece_type].push(cat);
      return acc;
    }, {});
    
    res.json({ piece_types: grouped });
  } catch (error) {
    console.error('[Pieces API] all categories error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch categories' });
  }
});

// =====================================================
// MARKET OVERVIEW ENDPOINTS
// =====================================================

// GET /api/pieces/overview/:pieceType - Market overview for a specific piece type
router.get('/overview/:pieceType', async (req, res) => {
  try {
    const { pieceType } = req.params;
    const { period = '1d' } = req.query;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!supabase || USE_DEMO) {
      // Generate demo market overview
      const baseIndex = 1000 + Math.random() * 200;
      const categoryIndices = (DEMO_CATEGORIES[pieceType] || []).map(cat => ({
        category_id: cat.id,
        category_name: cat.name,
        category_slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        index_value: Number((baseIndex * (0.8 + Math.random() * 0.4)).toFixed(4)),
        change_percent: Number(((Math.random() - 0.5) * 10).toFixed(4)),
        volume_24h: Math.floor(Math.random() * 10000) + 1000,
        market_cap: Number((baseIndex * cat.piece_count * 10).toFixed(2)),
      }));
      
      return res.json({
        piece_type: pieceType,
        market: {
          index_value: Number(baseIndex.toFixed(4)),
          change_percent: Number(((Math.random() - 0.5) * 5).toFixed(4)),
          volume_24h: categoryIndices.reduce((sum, c) => sum + c.volume_24h, 0),
          total_market_cap: categoryIndices.reduce((sum, c) => sum + c.market_cap, 0),
          active_assets: categoryIndices.reduce((sum, c) => sum + c.piece_count, 0),
          avg_price: Number((baseIndex / 100).toFixed(4)),
        },
        category_indices: categoryIndices,
        last_updated: new Date().toISOString(),
      });
    }
    
    // Fetch market index
    const { data: marketIndex, error: marketError } = await supabase
      .from('piece_market_indices')
      .select('*')
      .eq('piece_type', pieceType)
      .eq('period_type', period)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (marketError) throw marketError;
    
    // Fetch category indices
    const { data: categoryIndices, error: catError } = await supabase
      .from('piece_category_indices')
      .select(`
        *,
        category:piece_categories!inner(id, name, slug, icon, color)
      `)
      .eq('piece_type', pieceType)
      .eq('period_type', period)
      .order('period_start', { ascending: false });
    
    if (catError) throw catError;
    
    res.json({
      piece_type: pieceType,
      market: marketIndex || null,
      category_indices: categoryIndices || [],
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[Pieces API] overview error:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch market overview' });
  }
});

// GET /api/pieces/overview - All piece type overviews
router.get('/overview', async (req, res) => {
  try {
    if (!supabase || USE_DEMO) {
      const overviews = {};
      for (const pieceType of PIECE_TYPES) {
        const baseIndex = 1000 + Math.random() * 200;
        overviews[pieceType] = {
          index_value: Number(baseIndex.toFixed(4)),
          change_percent: Number(((Math.random() - 0.5) * 5).toFixed(4)),
          volume_24h: Math.floor(Math.random() * 50000) + 5000,
          total_market_cap: Number((baseIndex * 1000).toFixed(2)),
          active_assets: Math.floor(Math.random() * 200) + 50,
        };
      }
      return res.json({ markets: overviews, last_updated: new Date().toISOString() });
    }
    
    const { data: indices, error } = await supabase
      .from('piece_market_indices')
      .select('*')
      .eq('period_type', '1d')
      .order('period_start', { ascending: false });
    
    if (error) throw error;
    
    // Get latest for each piece_type
    const latestByType = {};
    for (const idx of indices || []) {
      if (!latestByType[idx.piece_type]) {
        latestByType[idx.piece_type] = idx;
      }
    }
    
    res.json({
      markets: latestByType,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Pieces API] all overviews error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch market overviews' });
  }
});

// =====================================================
// PIECE LISTINGS BY CATEGORY
// =====================================================

// GET /api/pieces/:pieceType/category/:slug - Pieces in a category
router.get('/:pieceType/category/:slug', async (req, res) => {
  try {
    const { pieceType, slug } = req.params;
    const { page = 1, limit = 20, sort = 'price_desc' } = req.query;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!supabase || USE_DEMO) {
      // Generate demo pieces
      const demoPieces = Array.from({ length: parseInt(limit) }, (_, i) => ({
        id: `demo-${pieceType}-${i}`,
        name: `${pieceType.charAt(0).toUpperCase() + pieceType.slice(1)} ${i + 1}`,
        category_slug: slug,
        piece_type: pieceType,
        stats: generateDemoPieceStats(10 + Math.random() * 40),
        metadata: pieceType === 'content' 
          ? { creator_name: `Creator ${i + 1}`, platform: 'instagram' }
          : pieceType === 'moment'
          ? { venue_name: 'Central Cafe', reward: 'Free Coffee' }
          : pieceType === 'host'
          ? { total_moments: 15, rating: 4.5 }
          : { venue_type: 'cafe', city: 'Kingston' },
      }));
      
      return res.json({
        piece_type: pieceType,
        category_slug: slug,
        pieces: demoPieces,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 100,
        },
      });
    }
    
    // Get category ID
    const { data: category, error: catError } = await supabase
      .from('piece_categories')
      .select('id')
      .eq('piece_type', pieceType)
      .eq('slug', slug)
      .single();
    
    if (catError || !category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Fetch pieces based on type
    let pieces = [];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    switch (pieceType) {
      case 'content': {
        const { data, error } = await supabase
          .from('content_items')
          .select(`
            id, title, creator_name, creator_avatar, platform,
            stats:content_piece_stats(*)
          `)
          .range(offset, offset + parseInt(limit) - 1);
        if (!error) pieces = data || [];
        break;
      }
      case 'moment': {
        const { data, error } = await supabase
          .from('moments')
          .select(`
            id, title, venue_name, location, reward, pulse_state,
            stats:moment_piece_stats(*)
          `)
          .range(offset, offset + parseInt(limit) - 1);
        if (!error) pieces = data || [];
        break;
      }
      case 'host': {
        const { data, error } = await supabase
          .from('host_profiles')
          .select(`
            id, display_name, avatar_url, verification_status, reputation_score,
            stats:host_piece_stats(*)
          `)
          .range(offset, offset + parseInt(limit) - 1);
        if (!error) pieces = data || [];
        break;
      }
      case 'venue': {
        const { data, error } = await supabase
          .from('venue_profiles')
          .select(`
            id, name, venue_type, city, images,
            stats:venue_piece_stats(*)
          `)
          .range(offset, offset + parseInt(limit) - 1);
        if (!error) pieces = data || [];
        break;
      }
    }
    
    res.json({
      piece_type: pieceType,
      category_slug: slug,
      pieces: pieces.map(p => ({
        ...p,
        piece_type: pieceType,
        category_slug: slug,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 100, // Estimate
      },
    });
  } catch (error) {
    console.error(`[Pieces API] category pieces error:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch pieces' });
  }
});

// =====================================================
// INDIVIDUAL PIECE ENDPOINTS
// =====================================================

// GET /api/pieces/:pieceType/:id - Single piece details
router.get('/:pieceType/:id', async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!supabase || USE_DEMO) {
      const basePrice = 10 + Math.random() * 40;
      const demoPiece = {
        id,
        piece_type: pieceType,
        name: `${pieceType.charAt(0).toUpperCase() + pieceType.slice(1)} ${id}`,
        stats: generateDemoPieceStats(basePrice),
        price_history: generateDemoOHLC(basePrice, 24),
        metadata: pieceType === 'content'
          ? { creator_name: 'Demo Creator', platform: 'instagram', description: 'Demo content piece' }
          : pieceType === 'moment'
          ? { venue_name: 'Central Cafe', location: 'Downtown', reward: 'Free Coffee', starts_at: new Date().toISOString() }
          : pieceType === 'host'
          ? { display_name: 'Demo Host', bio: 'Experienced event host', total_moments_hosted: 25, rating: 4.7 }
          : { name: 'Demo Venue', venue_type: 'cafe', city: 'Kingston', capacity: 50 },
      };
      return res.json(demoPiece);
    }
    
    // Fetch based on piece type
    let piece = null;
    let stats = null;
    
    switch (pieceType) {
      case 'content': {
        const [{ data: content }, { data: contentStats }] = await Promise.all([
          supabase.from('content_items').select('*').eq('id', id).single(),
          supabase.from('content_piece_stats').select('*').eq('content_id', id).single(),
        ]);
        piece = content;
        stats = contentStats;
        break;
      }
      case 'moment': {
        const [{ data: moment }, { data: momentStats }] = await Promise.all([
          supabase.from('moments').select('*').eq('id', id).single(),
          supabase.from('moment_piece_stats').select('*').eq('moment_id', id).single(),
        ]);
        piece = moment;
        stats = momentStats;
        break;
      }
      case 'host': {
        const [{ data: host }, { data: hostStats }] = await Promise.all([
          supabase.from('host_profiles').select('*').eq('id', id).single(),
          supabase.from('host_piece_stats').select('*').eq('host_id', id).single(),
        ]);
        piece = host;
        stats = hostStats;
        break;
      }
      case 'venue': {
        const [{ data: venue }, { data: venueStats }] = await Promise.all([
          supabase.from('venue_profiles').select('*').eq('id', id).single(),
          supabase.from('venue_piece_stats').select('*').eq('venue_id', id).single(),
        ]);
        piece = venue;
        stats = venueStats;
        break;
      }
    }
    
    if (!piece) {
      return res.status(404).json({ error: 'Piece not found' });
    }
    
    res.json({
      ...piece,
      piece_type: pieceType,
      stats,
    });
  } catch (error) {
    console.error(`[Pieces API] single piece error:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch piece' });
  }
});

// GET /api/pieces/:pieceType/:id/history - Price history (OHLC)
router.get('/:pieceType/:id/history', async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    const { period = '1d', limit = 100 } = req.query;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!supabase || USE_DEMO) {
      const basePrice = 10 + Math.random() * 40;
      const periods = { '1m': 60, '5m': 24, '15m': 24, '1h': 24, '4h': 12, '1d': 30, '1w': 12 };
      const periodCount = periods[period] || 24;
      const history = generateDemoOHLC(basePrice, Math.min(periodCount, parseInt(limit)));
      
      return res.json({
        piece_type: pieceType,
        asset_id: id,
        period_type: period,
        history,
        current_price: history[history.length - 1]?.close || basePrice,
      });
    }
    
    // Determine which price history table to use
    const tableMap = {
      content: 'content_piece_price_history',
      moment: 'moment_piece_price_history',
      host: 'host_piece_price_history',
      venue: 'venue_piece_price_history',
    };
    
    const idColumnMap = {
      content: 'content_id',
      moment: 'moment_id',
      host: 'host_id',
      venue: 'venue_id',
    };
    
    const { data: history, error } = await supabase
      .from(tableMap[pieceType])
      .select('*')
      .eq(idColumnMap[pieceType], id)
      .eq('period_type', period)
      .order('period_start', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    // Also fetch current price from stats
    const statsTableMap = {
      content: 'content_piece_stats',
      moment: 'moment_piece_stats',
      host: 'host_piece_stats',
      venue: 'venue_piece_stats',
    };
    
    const { data: stats } = await supabase
      .from(statsTableMap[pieceType])
      .select('current_price')
      .eq(idColumnMap[pieceType], id)
      .single();
    
    res.json({
      piece_type: pieceType,
      asset_id: id,
      period_type: period,
      history: history || [],
      current_price: stats?.current_price || 0,
    });
  } catch (error) {
    console.error(`[Pieces API] price history error:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch price history' });
  }
});

// =====================================================
// TOP MOVERS
// =====================================================

// GET /api/pieces/:pieceType/movers - Top gainers, losers, most traded
router.get('/:pieceType/movers', async (req, res) => {
  try {
    const { pieceType } = req.params;
    const { type = 'all', limit = 10 } = req.query;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!supabase || USE_DEMO) {
      const generateMover = (i) => ({
        id: `demo-${pieceType}-${i}`,
        name: `${pieceType} ${i + 1}`,
        piece_type: pieceType,
        current_price: Number((10 + Math.random() * 40).toFixed(4)),
        change_24h: Number(((Math.random() - 0.5) * 30).toFixed(4)),
        volume_24h: Math.floor(Math.random() * 10000),
      });
      
      const gainers = Array.from({ length: parseInt(limit) }, (_, i) => generateMover(i))
        .map(p => ({ ...p, change_24h: Math.abs(p.change_24h) }))
        .sort((a, b) => b.change_24h - a.change_24h);
      
      const losers = Array.from({ length: parseInt(limit) }, (_, i) => generateMover(i + 100))
        .map(p => ({ ...p, change_24h: -Math.abs(p.change_24h) }))
        .sort((a, b) => a.change_24h - b.change_24h);
      
      const mostTraded = Array.from({ length: parseInt(limit) }, (_, i) => generateMover(i + 200))
        .sort((a, b) => b.volume_24h - a.volume_24h);
      
      return res.json({
        piece_type: pieceType,
        gainers,
        losers,
        most_traded: mostTraded,
        last_updated: new Date().toISOString(),
      });
    }
    
    // Fetch from stats tables ordered by change/volume
    const statsTableMap = {
      content: { table: 'content_piece_stats', idCol: 'content_id' },
      moment: { table: 'moment_piece_stats', idCol: 'moment_id' },
      host: { table: 'host_piece_stats', idCol: 'host_id' },
      venue: { table: 'venue_piece_stats', idCol: 'venue_id' },
    };
    
    const config = statsTableMap[pieceType];
    
    const [gainersResult, losersResult, volumeResult] = await Promise.all([
      type === 'all' || type === 'gainers' 
        ? supabase.from(config.table).select(`*, asset_id:${config.idCol}`).order('change_24h', { ascending: false }).limit(parseInt(limit))
        : { data: [] },
      type === 'all' || type === 'losers'
        ? supabase.from(config.table).select(`*, asset_id:${config.idCol}`).order('change_24h', { ascending: true }).limit(parseInt(limit))
        : { data: [] },
      type === 'all' || type === 'volume'
        ? supabase.from(config.table).select(`*, asset_id:${config.idCol}`).order('volume_24h', { ascending: false }).limit(parseInt(limit))
        : { data: [] },
    ]);
    
    res.json({
      piece_type: pieceType,
      gainers: gainersResult.data || [],
      losers: losersResult.data || [],
      most_traded: volumeResult.data || [],
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[Pieces API] movers error:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch movers' });
  }
});

// =====================================================
// SEARCH
// =====================================================

// GET /api/pieces/search - Search across all piece types
router.get('/search', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }
    
    if (!supabase || USE_DEMO) {
      // Generate demo search results
      const types = type ? [type] : PIECE_TYPES;
      const results = [];
      
      for (const pieceType of types) {
        for (let i = 0; i < 5; i++) {
          results.push({
            id: `demo-${pieceType}-${i}`,
            piece_type: pieceType,
            name: `${pieceType} matching "${q}" ${i + 1}`,
            current_price: Number((10 + Math.random() * 40).toFixed(4)),
            change_24h: Number(((Math.random() - 0.5) * 10).toFixed(4)),
          });
        }
      }
      
      return res.json({
        query: q,
        results: results.slice(0, parseInt(limit)),
        total: results.length,
      });
    }
    
    // Search across tables
    const types = type ? [type] : PIECE_TYPES;
    const searchPromises = [];
    
    for (const pieceType of types) {
      switch (pieceType) {
        case 'content':
          searchPromises.push(
            supabase.from('content_items').select('id, title, creator_name, current_price:share_price').ilike('title', `%${q}%`).limit(parseInt(limit))
              .then(({ data }) => (data || []).map(p => ({ ...p, piece_type: 'content', name: p.title })))
          );
          break;
        case 'moment':
          searchPromises.push(
            supabase.from('moments').select('id, title, venue_name').ilike('title', `%${q}%`).limit(parseInt(limit))
              .then(({ data }) => (data || []).map(p => ({ ...p, piece_type: 'moment', name: p.title })))
          );
          break;
        case 'host':
          searchPromises.push(
            supabase.from('host_profiles').select('id, display_name, reputation_score').ilike('display_name', `%${q}%`).limit(parseInt(limit))
              .then(({ data }) => (data || []).map(p => ({ ...p, piece_type: 'host', name: p.display_name })))
          );
          break;
        case 'venue':
          searchPromises.push(
            supabase.from('venue_profiles').select('id, name, venue_type, city').ilike('name', `%${q}%`).limit(parseInt(limit))
              .then(({ data }) => (data || []).map(p => ({ ...p, piece_type: 'venue', name: p.name })))
          );
          break;
      }
    }
    
    const results = (await Promise.all(searchPromises)).flat();
    
    res.json({
      query: q,
      results: results.slice(0, parseInt(limit)),
      total: results.length,
    });
  } catch (error) {
    console.error('[Pieces API] search error:', error);
    res.status(500).json({ error: error.message || 'Failed to search pieces' });
  }
});

// =====================================================
// USER PORTFOLIO
// =====================================================

// GET /api/pieces/portfolio/me - Current user's piece portfolio
router.get('/portfolio/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!supabase || USE_DEMO) {
      return res.json({
        user_id: userId,
        portfolio: {
          content: Array.from({ length: 3 }, (_, i) => ({
            piece_id: `demo-content-${i}`,
            name: `Content ${i + 1}`,
            pieces_owned: Math.floor(Math.random() * 20) + 1,
            avg_purchase_price: Number((10 + Math.random() * 30).toFixed(4)),
            current_price: Number((15 + Math.random() * 35).toFixed(4)),
            pnl: Number(((Math.random() - 0.3) * 50).toFixed(2)),
          })),
          moment: Array.from({ length: 2 }, (_, i) => ({
            piece_id: `demo-moment-${i}`,
            name: `Moment ${i + 1}`,
            pieces_owned: Math.floor(Math.random() * 15) + 1,
            avg_purchase_price: Number((20 + Math.random() * 40).toFixed(4)),
            current_price: Number((25 + Math.random() * 45).toFixed(4)),
            pnl: Number(((Math.random() - 0.3) * 40).toFixed(2)),
          })),
        },
        total_value: Number((1000 + Math.random() * 2000).toFixed(2)),
        total_pnl: Number(((Math.random() - 0.3) * 500).toFixed(2)),
      });
    }
    
    // Fetch all position types for user
    const [contentPositions, momentPositions, hostPositions, venuePositions] = await Promise.all([
      supabase.from('content_piece_positions').select(`*, piece:content_items!inner(id, title, creator_name), stats:content_piece_stats!inner(current_price)`).eq('holder_id', userId),
      supabase.from('moment_piece_positions').select(`*, piece:moments!inner(id, title, venue_name), stats:moment_piece_stats!inner(current_price)`).eq('holder_id', userId),
      supabase.from('host_piece_positions').select(`*, piece:host_profiles!inner(id, display_name), stats:host_piece_stats!inner(current_price)`).eq('holder_id', userId),
      supabase.from('venue_piece_positions').select(`*, piece:venue_profiles!inner(id, name), stats:venue_piece_stats!inner(current_price)`).eq('holder_id', userId),
    ]);
    
    const portfolio = {
      content: (contentPositions.data || []).map(p => ({
        ...p,
        piece_type: 'content',
        current_price: p.stats?.current_price,
        pnl: Number(((p.stats?.current_price - p.avg_purchase_price) * p.pieces_owned).toFixed(2)),
      })),
      moment: (momentPositions.data || []).map(p => ({
        ...p,
        piece_type: 'moment',
        current_price: p.stats?.current_price,
        pnl: Number(((p.stats?.current_price - p.avg_purchase_price) * p.pieces_owned).toFixed(2)),
      })),
      host: (hostPositions.data || []).map(p => ({
        ...p,
        piece_type: 'host',
        current_price: p.stats?.current_price,
        pnl: Number(((p.stats?.current_price - p.avg_purchase_price) * p.pieces_owned).toFixed(2)),
      })),
      venue: (venuePositions.data || []).map(p => ({
        ...p,
        piece_type: 'venue',
        current_price: p.stats?.current_price,
        pnl: Number(((p.stats?.current_price - p.avg_purchase_price) * p.pieces_owned).toFixed(2)),
      })),
    };
    
    // Calculate totals
    let totalValue = 0;
    let totalPnl = 0;
    
    for (const type of PIECE_TYPES) {
      for (const pos of portfolio[type]) {
        totalValue += (pos.current_price || 0) * pos.pieces_owned;
        totalPnl += pos.pnl || 0;
      }
    }
    
    res.json({
      user_id: userId,
      portfolio,
      total_value: Number(totalValue.toFixed(2)),
      total_pnl: Number(totalPnl.toFixed(2)),
    });
  } catch (error) {
    console.error('[Pieces API] portfolio error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch portfolio' });
  }
});

// =====================================================
// WATCHLIST
// =====================================================

// GET /api/pieces/watchlist/me - User's watchlist
router.get('/watchlist/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!supabase || USE_DEMO) {
      return res.json({
        user_id: userId,
        watchlists: [
          {
            id: 'demo-watchlist',
            name: 'My Watchlist',
            is_default: true,
            items: Array.from({ length: 5 }, (_, i) => ({
              id: `demo-item-${i}`,
              piece_type: PIECE_TYPES[i % 4],
              asset_id: `demo-${PIECE_TYPES[i % 4]}-${i}`,
              name: `${PIECE_TYPES[i % 4]} ${i + 1}`,
              added_price: Number((10 + Math.random() * 40).toFixed(4)),
              current_price: Number((15 + Math.random() * 35).toFixed(4)),
              change_since_added: Number(((Math.random() - 0.5) * 20).toFixed(4)),
            })),
          },
        ],
      });
    }
    
    const { data: watchlists, error } = await supabase
      .from('user_piece_watchlists')
      .select(`
        *,
        items:piece_watchlist_items(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json({
      user_id: userId,
      watchlists: watchlists || [],
    });
  } catch (error) {
    console.error('[Pieces API] watchlist error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch watchlist' });
  }
});

// =====================================================
// TRADING ENDPOINTS (Protected)
// =====================================================

// POST /api/pieces/:pieceType/:id/buy - Buy pieces (market order)
router.post('/:pieceType/:id/buy', requireAuth, async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    const { quantity, max_price, listing_id } = req.body;
    const userId = req.user.id;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    // Use demo mode if configured
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Trade executed (demo mode)',
        trade: {
          piece_type: pieceType,
          asset_id: id,
          buyer_id: userId,
          quantity,
          price_per_piece: max_price || 10.00,
          total_value: (max_price || 10.00) * quantity,
          fees: {
            platform: (max_price || 10.00) * quantity * 0.01,
            creator: (max_price || 10.00) * quantity * 0.005,
            liquidity: (max_price || 10.00) * quantity * 0.005,
            total: (max_price || 10.00) * quantity * 0.02,
          },
          executed_at: new Date().toISOString(),
        },
      });
    }
    
    // Execute real trade
    const result = await pieceTradingService.executeMarketBuy({
      pieceType,
      assetId: id,
      buyerId: userId,
      quantity,
      maxPrice: max_price || 10000, // Default high max
    });
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[Pieces API] buy error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to execute buy' 
    });
  }
});

// POST /api/pieces/:pieceType/:id/sell - Create sell listing
router.post('/:pieceType/:id/sell', requireAuth, async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    const { quantity, min_price, expires_at } = req.body;
    const userId = req.user.id;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    if (!min_price || min_price <= 0) {
      return res.status(400).json({ error: 'Minimum price required' });
    }
    
    // Use demo mode if configured
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Listing created (demo mode)',
        listing: {
          id: 'demo-listing-' + Date.now(),
          piece_type: pieceType,
          asset_id: id,
          seller_id: userId,
          quantity,
          price_per_piece: min_price,
          listing_type: 'sell',
          status: 'active',
          expires_at: expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        },
      });
    }
    
    // Create real listing
    const listing = await pieceTradingService.createSellListing({
      pieceType,
      assetId: id,
      sellerId: userId,
      quantity,
      pricePerPiece: min_price,
      expiresAt: expires_at,
    });
    
    res.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('[Pieces API] sell error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to create listing' 
    });
  }
});

// GET /api/pieces/:pieceType/:id/listings - Active listings for a piece
router.get('/:pieceType/:id/listings', async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (!supabase || USE_DEMO) {
      return res.json({
        piece_type: pieceType,
        asset_id: id,
        sell_listings: Array.from({ length: 5 }, (_, i) => ({
          id: `demo-sell-${i}`,
          seller_id: `demo-user-${i}`,
          quantity: Math.floor(Math.random() * 20) + 1,
          price_per_piece: Number((15 + i * 0.5).toFixed(4)),
        })),
        buy_listings: Array.from({ length: 3 }, (_, i) => ({
          id: `demo-buy-${i}`,
          buyer_id: `demo-user-${i + 10}`,
          quantity: Math.floor(Math.random() * 30) + 5,
          price_per_piece: Number((10 - i * 0.5).toFixed(4)),
        })),
      });
    }
    
    const { data: listings, error } = await supabase
      .from('piece_listings')
      .select('*')
      .eq('piece_type', pieceType)
      .eq('asset_id', id)
      .eq('status', 'active')
      .order('price_per_piece', { ascending: true });
    
    if (error) throw error;
    
    const sellListings = (listings || []).filter(l => l.listing_type === 'sell');
    const buyListings = (listings || []).filter(l => l.listing_type === 'buy');
    
    res.json({
      piece_type: pieceType,
      asset_id: id,
      sell_listings: sellListings,
      buy_listings: buyListings,
    });
  } catch (error) {
    console.error('[Pieces API] listings error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch listings' });
  }
});

// DELETE /api/pieces/listings/:id - Cancel a listing
router.delete('/listings/:id', requireAuth, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Listing cancelled (demo mode)',
      });
    }
    
    await pieceTradingService.cancelListing(listingId, userId);
    
    res.json({
      success: true,
      message: 'Listing cancelled successfully',
    });
  } catch (error) {
    console.error('[Pieces API] cancel listing error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cancel listing',
    });
  }
});

// =====================================================
// AMM LIQUIDITY POOL ENDPOINTS
// =====================================================

// GET /api/pieces/pools - Get all liquidity pools
router.get('/pools', async (req, res) => {
  try {
    const { status = 'active', piece_type } = req.query;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        pools: Array.from({ length: 5 }, (_, i) => ({
          id: `demo-pool-${i}`,
          piece_type: piece_type || 'content',
          asset_id: `demo-asset-${i}`,
          pieces_reserve: 10000,
          currency_reserve: 50000,
          last_price: 5.00,
          volume_24h: 15000,
          status: 'active',
        })),
      });
    }
    
    let query = supabase
      .from('piece_liquidity_pools')
      .select(`
        *,
        asset:asset_id(id, title, name, image_url)
      `)
      .eq('status', status)
      .order('volume_24h', { ascending: false });
    
    if (piece_type) {
      query = query.eq('piece_type', piece_type);
    }
    
    const { data: pools, error } = await query;
    
    if (error) throw error;
    
    res.json({
      pools: pools || [],
      count: pools?.length || 0,
    });
  } catch (error) {
    console.error('[Pieces API] pools error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch pools',
    });
  }
});

// GET /api/pieces/:pieceType/:id/pool - Get pool for specific piece
router.get('/:pieceType/:id/pool', async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        pool: {
          id: `demo-pool-${pieceType}-${id}`,
          piece_type: pieceType,
          asset_id: id,
          pieces_reserve: 10000,
          currency_reserve: 50000,
          last_price: 5.00,
          k_constant: 500000000,
          swap_fee_percent: 0.003,
          volume_24h: 15000,
          status: 'active',
        },
      });
    }
    
    const pool = await pieceAMMService.getPoolByAsset(pieceType, id);
    
    if (!pool) {
      return res.status(404).json({
        error: 'No liquidity pool found for this piece',
      });
    }
    
    res.json({ pool });
  } catch (error) {
    console.error('[Pieces API] pool error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch pool',
    });
  }
});

// POST /api/pieces/:pieceType/:id/pool/create - Create liquidity pool
router.post('/:pieceType/:id/pool/create', requireAuth, async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    const { initial_pieces, initial_currency, swap_fee_percent } = req.body;
    const userId = req.user.id;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Pool created (demo mode)',
        pool: {
          id: `demo-pool-${Date.now()}`,
          piece_type: pieceType,
          asset_id: id,
          pieces_reserve: initial_pieces,
          currency_reserve: initial_currency,
          last_price: initial_currency / initial_pieces,
          lp_tokens: Math.sqrt(initial_pieces * initial_currency),
        },
      });
    }
    
    const result = await pieceAMMService.createPool({
      pieceType,
      assetId: id,
      initialPieces: initial_pieces,
      initialCurrency: initial_currency,
      swapFeePercent: swap_fee_percent,
      createdBy: userId,
    });
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] create pool error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create pool',
    });
  }
});

// POST /api/pieces/pools/:id/add-liquidity - Add liquidity to pool
router.post('/pools/:id/add-liquidity', requireAuth, async (req, res) => {
  try {
    const poolId = req.params.id;
    const { pieces_to_add, max_currency, slippage_tolerance } = req.body;
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Liquidity added (demo mode)',
        lp_tokens_received: Math.sqrt(pieces_to_add * max_currency * 0.5),
      });
    }
    
    const result = await pieceAMMService.addLiquidity({
      poolId,
      providerId: userId,
      piecesToAdd: pieces_to_add,
      maxCurrencyToAdd: max_currency,
      slippageTolerance: slippage_tolerance,
    });
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] add liquidity error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to add liquidity',
    });
  }
});

// POST /api/pieces/pools/:id/remove-liquidity - Remove liquidity from pool
router.post('/pools/:id/remove-liquidity', requireAuth, async (req, res) => {
  try {
    const poolId = req.params.id;
    const { lp_tokens, min_pieces_out, min_currency_out } = req.body;
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Liquidity removed (demo mode)',
        pieces_out: 100,
        currency_out: 500,
      });
    }
    
    const result = await pieceAMMService.removeLiquidity({
      poolId,
      providerId: userId,
      lpTokensToRemove: lp_tokens,
      minPiecesOut: min_pieces_out,
      minCurrencyOut: min_currency_out,
    });
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] remove liquidity error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to remove liquidity',
    });
  }
});

// GET /api/pieces/pools/:id/quote - Get swap quote
router.get('/pools/:id/quote', async (req, res) => {
  try {
    const poolId = req.params.id;
    const { type, amount, slippage_tolerance } = req.query;
    
    if (!type || !amount) {
      return res.status(400).json({ error: 'Type and amount required' });
    }
    
    if (USE_DEMO || !supabase) {
      const amountNum = parseFloat(amount);
      return res.json({
        pool_id: poolId,
        swap_type: type,
        amount_in: amountNum,
        amount_out: type === 'currency_to_pieces' ? amountNum / 5 : amountNum * 5,
        price_impact_percent: 0.5,
        slippage_percent: 1.0,
        minimum_amount_out: type === 'currency_to_pieces' ? (amountNum / 5) * 0.99 : amountNum * 5 * 0.99,
      });
    }
    
    const quote = await pieceAMMService.getSwapQuote(
      poolId,
      type,
      parseFloat(amount),
      parseFloat(slippage_tolerance || 0.01)
    );
    
    if (!quote) {
      return res.status(404).json({ error: 'Pool not found' });
    }
    
    res.json(quote);
  } catch (error) {
    console.error('[Pieces API] quote error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get quote',
    });
  }
});

// POST /api/pieces/pools/:id/swap - Execute AMM swap
router.post('/pools/:id/swap', requireAuth, async (req, res) => {
  try {
    const poolId = req.params.id;
    const { type, amount_in, min_amount_out, slippage_tolerance } = req.body;
    const userId = req.user.id;
    
    if (!type || !amount_in) {
      return res.status(400).json({ error: 'Type and amount_in required' });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Swap executed (demo mode)',
        swap: {
          id: `demo-swap-${Date.now()}`,
          pool_id: poolId,
          swap_type: type,
          amount_in: amount_in,
          amount_out: type === 'currency_to_pieces' ? amount_in / 5 : amount_in * 5,
          price_impact_percent: 0.5,
        },
      });
    }
    
    let result;
    if (type === 'currency_to_pieces') {
      result = await pieceAMMService.swapCurrencyForPieces({
        poolId,
        traderId: userId,
        currencyIn: amount_in,
        minPiecesOut: min_amount_out,
        slippageTolerance: slippage_tolerance,
      });
    } else {
      result = await pieceAMMService.swapPiecesForCurrency({
        poolId,
        traderId: userId,
        piecesIn: amount_in,
        minCurrencyOut: min_amount_out,
        slippageTolerance: slippage_tolerance,
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] swap error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to execute swap',
    });
  }
});

// GET /api/pieces/pools/:id/lp-position - Get user's LP position
router.get('/pools/:id/lp-position', requireAuth, async (req, res) => {
  try {
    const poolId = req.params.id;
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        user_id: userId,
        pool_id: poolId,
        lp_tokens: 1000,
        pieces_deposited: 5000,
        currency_deposited: 25000,
        fees_earned_pieces: 50,
        fees_earned_currency: 250,
      });
    }
    
    const position = await pieceAMMService.getLpPosition(poolId, userId);
    
    res.json({
      user_id: userId,
      pool_id: poolId,
      ...position,
    });
  } catch (error) {
    console.error('[Pieces API] lp position error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch LP position',
    });
  }
});

// =====================================================
// GEMS TRADING ENDPOINTS
// =====================================================

// GET /api/pieces/gems/balance - Get user's Gems balance
router.get('/gems/balance', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        user_id: userId,
        balance: 50,
        currency: 'GEMS',
        usd_value: 50.00,
        exchange_rate: 1.00,
      });
    }
    
    const balance = await gemsService.getGemsBalance(userId);
    
    res.json({
      ...balance,
      exchange_rate: gemsService.GEMS_EXCHANGE_RATE,
    });
  } catch (error) {
    console.error('[Pieces API] gems balance error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch Gems balance',
    });
  }
});

// POST /api/pieces/gems/purchase - Buy Gems with Stripe
router.post('/gems/purchase', requireAuth, async (req, res) => {
  try {
    const { usd_amount } = req.body;
    const userId = req.user.id;
    
    if (!usd_amount || usd_amount <= 0) {
      return res.status(400).json({ error: 'USD amount required' });
    }
    
    // Check KYC for purchases over $100
    if (usd_amount >= 100) {
      const kycCheck = await simpleKYCService.checkUserCanTrade(userId);
      if (!kycCheck.can_trade) {
        return res.status(403).json({
          error: 'KYC verification required for purchases over $100',
          kyc_status: kycCheck.kyc_status,
          needs_kyc: true,
        });
      }
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        client_secret: 'demo_secret',
        gems_amount: Math.floor(usd_amount / 1.00),
        usd_amount: usd_amount,
        exchange_rate: 1.00,
      });
    }
    
    const result = await gemsService.createPurchaseIntent(userId, usdAmount);
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] gems purchase error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create Gems purchase',
    });
  }
});

// GET /api/pieces/gems/transactions - Get Gems transaction history
router.get('/gems/transactions', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        transactions: [
          {
            id: 'demo-tx-1',
            transaction_type: 'purchase',
            amount: 50,
            balance_after: 50,
            fiat_amount: 50.00,
            created_at: new Date().toISOString(),
          },
          {
            id: 'demo-tx-2',
            transaction_type: 'trade_out',
            amount: -5,
            balance_after: 45,
            pieces_amount: 5,
            created_at: new Date().toISOString(),
          },
        ],
        total: 2,
        has_more: false,
      });
    }
    
    const result = await gemsService.getTransactionHistory(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] gems transactions error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch transactions',
    });
  }
});

// POST /api/pieces/pools/:id/trade/gems-to-pieces - Trade Gems for Pieces
router.post('/pools/:id/trade/gems-to-pieces', requireAuth, async (req, res) => {
  try {
    const poolId = req.params.id;
    const { gems_amount, min_pieces_out, slippage_tolerance } = req.body;
    const userId = req.user.id;
    
    if (!gems_amount || gems_amount <= 0) {
      return res.status(400).json({ error: 'Gems amount required' });
    }
    
    // Check KYC
    const kycCheck = await simpleKYCService.checkUserCanTrade(userId);
    if (!kycCheck.can_trade) {
      return res.status(403).json({
        error: 'KYC verification required for trading',
        kyc_status: kycCheck.kyc_status,
        needs_kyc: true,
        pending_review: kycCheck.pending_review,
      });
    }
    
    // Check trading limits
    const { data: limits } = await supabase
      .rpc('check_transaction_limits', {
        p_user_id: userId,
        p_transaction_type: 'trade_buy',
        p_amount: gems_amount * 0.10, // Convert to USD value
      });
    
    if (!limits.allowed) {
      return res.status(403).json({
        error: limits.reason,
        daily_limit: limits.daily_limit,
        current_total: limits.current_daily_total,
        remaining: limits.remaining_limit,
      });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Trade executed (demo mode)',
        gems_spent: gems_amount,
        pieces_received: gems_amount,  // 1:1 ratio for simplicity
        effective_price: 1.00,
        new_gems_balance: 45,
      });
    }
    
    const result = await gemsService.tradeGemsForPieces(
      userId,
      poolId,
      gems_amount,
      min_pieces_out,
      slippage_tolerance
    );
    
    // Record for limits
    await simpleKYCService.recordTransaction(userId, 'trade_buy', gems_amount * 0.10);
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] gems to pieces trade error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to execute trade',
    });
  }
});

// POST /api/pieces/pools/:id/trade/pieces-to-gems - Trade Pieces for Gems
router.post('/pools/:id/trade/pieces-to-gems', requireAuth, async (req, res) => {
  try {
    const poolId = req.params.id;
    const { pieces_amount, min_gems_out, slippage_tolerance } = req.body;
    const userId = req.user.id;
    
    if (!pieces_amount || pieces_amount <= 0) {
      return res.status(400).json({ error: 'Pieces amount required' });
    }
    
    // Check KYC
    const kycCheck = await simpleKYCService.checkUserCanTrade(userId);
    if (!kycCheck.can_trade) {
      return res.status(403).json({
        error: 'KYC verification required for trading',
        kyc_status: kycCheck.kyc_status,
        needs_kyc: true,
      });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Trade executed (demo mode)',
        pieces_sold: pieces_amount,
        gems_received: pieces_amount,  // 1:1 ratio for simplicity
        effective_price: 1.00,
        new_gems_balance: 55,
      });
    }
    
    const result = await gemsService.tradePiecesForGems(
      userId,
      poolId,
      pieces_amount,
      min_gems_out,
      slippage_tolerance
    );
    
    // Record for limits
    const usdValue = result.gems_received * 0.10;
    await simpleKYCService.recordTransaction(userId, 'trade_sell', usdValue);
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] pieces to gems trade error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to execute trade',
    });
  }
});

// POST /api/pieces/gems/withdrawal - Request Gems withdrawal
router.post('/gems/withdrawal', requireAuth, async (req, res) => {
  try {
    const { gems_amount, withdrawal_method } = req.body;
    const userId = req.user.id;
    
    if (!gems_amount || gems_amount <= 0) {
      return res.status(400).json({ error: 'Gems amount required' });
    }
    
    // Check KYC (required for all withdrawals)
    const kycCheck = await simpleKYCService.checkUserCanTrade(userId);
    if (!kycCheck.can_trade) {
      return res.status(403).json({
        error: 'KYC verification required for withdrawals',
        kyc_status: kycCheck.kyc_status,
        needs_kyc: true,
      });
    }
    
    // Check withdrawal limits
    const usdAmount = gems_amount * 0.10;
    const { data: limits } = await supabase
      .rpc('check_transaction_limits', {
        p_user_id: userId,
        p_transaction_type: 'withdrawal',
        p_amount: usdAmount,
      });
    
    if (!limits.allowed) {
      return res.status(403).json({
        error: limits.reason,
        daily_limit: limits.daily_limit,
        current_total: limits.current_daily_total,
        remaining: limits.remaining_limit,
      });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        withdrawal_id: 'demo-withdrawal-id',
        gems_amount: gems_amount,
        usd_amount: usdAmount,
        status: 'pending',
        estimated_time: '1-3 business days',
      });
    }
    
    const result = await gemsService.requestWithdrawal(
      userId,
      gems_amount,
      withdrawal_method
    );
    
    // Record for limits
    await simpleKYCService.recordTransaction(userId, 'withdrawal', usdAmount);
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] gems withdrawal error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to request withdrawal',
    });
  }
});

// =====================================================
// SIMPLE KYC ENDPOINTS
// =====================================================

// GET /api/pieces/kyc/status - Get user's KYC status
router.get('/kyc/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        user_id: userId,
        kyc_status: 'verified',
        kyc_level: 'intermediate',
        can_trade: true,
        limits: {
          daily_deposit: { limit: 10000, used: 0, remaining: 10000 },
          daily_withdrawal: { limit: 5000, used: 0, remaining: 5000 },
          daily_trade: { limit: 50000, used: 0, remaining: 50000 },
          max_single_trade: 10000,
        },
      });
    }
    
    const status = await simpleKYCService.getUserKYCStatus(userId);
    
    res.json(status);
  } catch (error) {
    console.error('[Pieces API] KYC status error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch KYC status',
    });
  }
});

// POST /api/pieces/kyc/submit - Submit KYC application
router.post('/kyc/submit', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const submissionData = req.body;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        status: 'pending_review',
        message: 'KYC submitted for manual review (demo mode)',
        submission_id: 'demo-submission-id',
      });
    }
    
    const result = await simpleKYCService.submitKYC(userId, submissionData);
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] KYC submit error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to submit KYC',
    });
  }
});

// GET /api/pieces/kyc/submissions - Get user's KYC submissions (user view)
router.get('/kyc/submissions', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        submissions: [
          {
            id: 'demo-submission',
            status: 'approved',
            submitted_at: new Date().toISOString(),
            assigned_level: 'intermediate',
          },
        ],
      });
    }
    
    const { data: submissions, error } = await supabase
      .from('simple_kyc_submissions')
      .select('id, status, submitted_at, approved_at, assigned_level, rejection_reason')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ submissions: submissions || [] });
  } catch (error) {
    console.error('[Pieces API] KYC submissions error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch submissions',
    });
  }
});

// =====================================================
// ADMIN KYC ENDPOINTS (Protected by admin role)
// =====================================================

// GET /api/pieces/admin/kyc/pending - Get pending KYC submissions
router.get('/admin/kyc/pending', requireAuth, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { status } = req.query;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        submissions: [
          {
            id: 'demo-pending',
            user_id: 'demo-user',
            user_email: 'user@example.com',
            status: 'pending_review',
            submitted_at: new Date().toISOString(),
            days_waiting: 0,
            first_name: 'John',
            last_name: 'Doe',
          },
        ],
        count: 1,
      });
    }
    
    const result = await simpleKYCService.getPendingSubmissions({ status });
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] admin pending KYC error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch pending submissions',
    });
  }
});

// GET /api/pieces/admin/kyc/:id - Get single submission details
router.get('/admin/kyc/:id', requireAuth, async (req, res) => {
  try {
    const submissionId = req.params.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        id: submissionId,
        status: 'pending_review',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        nationality: 'US',
        id_document_type: 'passport',
        id_document_front_url: 'https://example.com/id-front.jpg',
        id_document_back_url: 'https://example.com/id-back.jpg',
        selfie_url: 'https://example.com/selfie.jpg',
        submitted_at: new Date().toISOString(),
      });
    }
    
    const submission = await simpleKYCService.getSubmission(submissionId);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('[Pieces API] admin KYC detail error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch submission',
    });
  }
});

// POST /api/pieces/admin/kyc/:id/approve - Approve KYC
router.post('/admin/kyc/:id/approve', requireAuth, async (req, res) => {
  try {
    const submissionId = req.params.id;
    const { level, notes } = req.body;
    const adminId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        status: 'approved',
        level: level || 'intermediate',
      });
    }
    
    const result = await simpleKYCService.approveKYC(submissionId, adminId, level, notes);
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] admin KYC approve error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to approve KYC',
    });
  }
});

// POST /api/pieces/admin/kyc/:id/reject - Reject KYC
router.post('/admin/kyc/:id/reject', requireAuth, async (req, res) => {
  try {
    const submissionId = req.params.id;
    const { reason, category } = req.body;
    const adminId = req.user.id;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        status: 'rejected',
        rejection_reason: reason,
      });
    }
    
    const result = await simpleKYCService.rejectKYC(submissionId, adminId, reason, category);
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] admin KYC reject error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to reject KYC',
    });
  }
});

// =====================================================
// MINTING/ISSUANCE ENDPOINTS (Protected)
// =====================================================

// POST /api/pieces/mint/ipo - Launch Initial Piece Offering
router.post('/mint/ipo', requireAuth, async (req, res) => {
  try {
    const {
      piece_type,
      asset_id,
      total_pieces,
      initial_price,
      allocation,
      vesting_months,
      cliff_months,
      pricing_type,
    } = req.body;
    
    const issuerId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'IPO launched (demo mode)',
        issuance: {
          id: 'demo-issuance-' + Date.now(),
          piece_type,
          asset_id,
          issuer_id: issuerId,
          total_pieces_issued: total_pieces,
          initial_price,
          issuance_status: 'active',
        },
      });
    }
    
    const result = await pieceMintingService.launchIPO({
      pieceType: piece_type,
      assetId,
      issuerId,
      totalPieces: total_pieces,
      initialPrice: initial_price,
      options: {
        allocation,
        vestingMonths: vesting_months,
        cliffMonths: cliff_months,
        pricingType: pricing_type,
      },
    });
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] IPO error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to launch IPO',
    });
  }
});

// POST /api/pieces/mint/airdrop - Airdrop pieces to users
router.post('/mint/airdrop', requireAuth, async (req, res) => {
  try {
    const { piece_type, asset_id, recipients, from_pool } = req.body;
    
    if (USE_DEMO || !supabase) {
      const totalAirdropped = recipients.reduce((sum, r) => sum + r.quantity, 0);
      return res.json({
        success: true,
        message: 'Airdrop completed (demo mode)',
        total_airdropped: totalAirdropped,
        recipient_count: recipients.length,
      });
    }
    
    const result = await pieceMintingService.airdropPieces({
      pieceType: piece_type,
      assetId,
      recipients,
      fromPool: from_pool || 'community',
    });
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] airdrop error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to execute airdrop',
    });
  }
});

// GET /api/pieces/lockups/me - Get user's vesting lockups
router.get('/lockups/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        user_id: userId,
        lockups: [],
      });
    }
    
    const lockups = await pieceMintingService.getHolderLockups(userId);
    
    res.json({
      user_id: userId,
      lockups,
    });
  } catch (error) {
    console.error('[Pieces API] lockups error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch lockups',
    });
  }
});

// =====================================================
// DIVIDEND ENDPOINTS
// =====================================================

// GET /api/pieces/dividends/me - Get user's unclaimed dividends
router.get('/dividends/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        user_id: userId,
        available_dividends: [],
        total_available: 0,
      });
    }
    
    const dividends = await pieceDividendService.getAvailableDividends(userId);
    const totalAvailable = dividends.reduce((sum, d) => sum + parseFloat(d.dividend_amount), 0);
    
    res.json({
      user_id: userId,
      available_dividends: dividends,
      total_available: totalAvailable,
    });
  } catch (error) {
    console.error('[Pieces API] dividends error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch dividends',
    });
  }
});

// GET /api/pieces/dividends/history - Get dividend history
router.get('/dividends/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        user_id: userId,
        dividend_history: [],
        total_claimed: 0,
      });
    }
    
    const history = await pieceDividendService.getDividendHistory(userId, parseInt(limit));
    const totalClaimed = history.reduce((sum, h) => sum + parseFloat(h.dividend_amount), 0);
    
    res.json({
      user_id: userId,
      dividend_history: history,
      total_claimed: totalClaimed,
    });
  } catch (error) {
    console.error('[Pieces API] dividend history error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch dividend history',
    });
  }
});

// POST /api/pieces/dividends/claim - Claim unclaimed dividends
router.post('/dividends/claim', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dividend_ids } = req.body;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Dividends claimed (demo mode)',
        claimed: 0,
        total_amount: 0,
      });
    }
    
    const result = await pieceDividendService.claimDividends(userId, dividend_ids);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[Pieces API] claim dividends error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to claim dividends',
    });
  }
});

// GET /api/pieces/:pieceType/:id/dividends - Get asset dividend history
router.get('/:pieceType/:id/dividends', async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    const { limit = 12 } = req.query;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        piece_type: pieceType,
        asset_id: id,
        dividend_history: [],
      });
    }
    
    const history = await pieceDividendService.getAssetDividendHistory(
      pieceType,
      id,
      parseInt(limit)
    );
    
    res.json({
      piece_type: pieceType,
      asset_id: id,
      dividend_history: history,
    });
  } catch (error) {
    console.error('[Pieces API] asset dividends error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch asset dividends',
    });
  }
});

// =====================================================
// GOVERNANCE ENDPOINTS
// =====================================================

// GET /api/pieces/:pieceType/:id/proposals - Get active proposals
router.get('/:pieceType/:id/proposals', async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        piece_type: pieceType,
        asset_id: id,
        proposals: [],
      });
    }
    
    const proposals = await pieceGovernanceService.getActiveProposals(pieceType, id);
    
    res.json({
      piece_type: pieceType,
      asset_id: id,
      proposals,
    });
  } catch (error) {
    console.error('[Pieces API] proposals error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch proposals',
    });
  }
});

// POST /api/pieces/:pieceType/:id/proposals - Create governance proposal
router.post('/:pieceType/:id/proposals', requireAuth, async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    const {
      proposal_type,
      title,
      description,
      execution_threshold,
      min_participation,
      voting_duration_days,
    } = req.body;
    
    const proposerId = req.user.id;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Proposal created (demo mode)',
        proposal: {
          id: 'demo-proposal-' + Date.now(),
          piece_type: pieceType,
          asset_id: id,
          proposal_type,
          title,
          status: 'active',
        },
      });
    }
    
    const result = await pieceGovernanceService.createProposal({
      pieceType,
      assetId: id,
      proposerId,
      proposalType: proposal_type,
      title,
      description,
      executionThreshold: execution_threshold,
      minParticipation: min_participation,
      votingDurationDays: voting_duration_days,
    });
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] create proposal error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create proposal',
    });
  }
});

// GET /api/pieces/proposals/:id - Get proposal details
router.get('/proposals/:id', async (req, res) => {
  try {
    const proposalId = req.params.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        proposal: null,
        stats: {},
      });
    }
    
    const proposal = await pieceGovernanceService.getProposalDetails(proposalId);
    
    res.json(proposal);
  } catch (error) {
    console.error('[Pieces API] proposal details error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch proposal details',
    });
  }
});

// POST /api/pieces/proposals/:id/vote - Cast vote
router.post('/proposals/:id/vote', requireAuth, async (req, res) => {
  try {
    const proposalId = req.params.id;
    const { vote, reason } = req.body;
    const voterId = req.user.id;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        success: true,
        message: 'Vote cast (demo mode)',
        vote: {
          proposal_id: proposalId,
          voter_id: voterId,
          vote,
          voting_power: 100,
        },
      });
    }
    
    const result = await pieceGovernanceService.castVote({
      proposalId,
      voterId,
      vote,
      voteReason: reason,
    });
    
    res.json(result);
  } catch (error) {
    console.error('[Pieces API] vote error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cast vote',
    });
  }
});

// GET /api/pieces/votes/me - Get user's votes
router.get('/votes/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'active' } = req.query;
    
    if (USE_DEMO || !supabase) {
      return res.json({
        user_id: userId,
        votes: [],
      });
    }
    
    const votes = await pieceGovernanceService.getUserVotes(userId, status);
    
    res.json({
      user_id: userId,
      votes,
    });
  } catch (error) {
    console.error('[Pieces API] user votes error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch votes',
    });
  }
});

// GET /api/pieces/:pieceType/:id/governance/stats - Get governance stats
router.get('/:pieceType/:id/governance/stats', async (req, res) => {
  try {
    const { pieceType, id } = req.params;
    
    if (!PIECE_TYPES.includes(pieceType)) {
      return res.status(400).json({ error: 'Invalid piece type' });
    }
    
    if (USE_DEMO || !supabase) {
      return res.json({
        piece_type: pieceType,
        asset_id: id,
        total_proposals: 0,
        passed: 0,
        failed: 0,
        executed: 0,
        pass_rate: 0,
      });
    }
    
    const stats = await pieceGovernanceService.getGovernanceStats(pieceType, id);
    
    res.json({
      piece_type: pieceType,
      asset_id: id,
      ...stats,
    });
  } catch (error) {
    console.error('[Pieces API] governance stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch governance stats',
    });
  }
});

module.exports = router;
