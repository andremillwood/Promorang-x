const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Demo categories for fallback
const DEMO_CATEGORIES = [
  { id: 'cat-tech', name: 'Technology', slug: 'tech', description: 'Tech reviews, tutorials, and innovation content', icon: 'Cpu', color: '#3B82F6', display_order: 1 },
  { id: 'cat-fashion', name: 'Fashion', slug: 'fashion', description: 'Style, clothing, and fashion trends', icon: 'Shirt', color: '#EC4899', display_order: 2 },
  { id: 'cat-music', name: 'Music', slug: 'music', description: 'Music performances, reviews, and artist content', icon: 'Music', color: '#8B5CF6', display_order: 3 },
  { id: 'cat-comedy', name: 'Comedy', slug: 'comedy', description: 'Humor, sketches, and entertainment', icon: 'Laugh', color: '#F59E0B', display_order: 4 },
  { id: 'cat-inspiration', name: 'Inspiration', slug: 'inspiration', description: 'Motivational and inspirational content', icon: 'Sparkles', color: '#10B981', display_order: 5 },
  { id: 'cat-business', name: 'Business', slug: 'business', description: 'Entrepreneurship, finance, and business insights', icon: 'Briefcase', color: '#6366F1', display_order: 6 },
  { id: 'cat-gaming', name: 'Gaming', slug: 'gaming', description: 'Video game content, streams, and reviews', icon: 'Gamepad2', color: '#EF4444', display_order: 7 },
  { id: 'cat-fitness', name: 'Fitness', slug: 'fitness', description: 'Health, workout, and wellness content', icon: 'Dumbbell', color: '#14B8A6', display_order: 8 },
  { id: 'cat-food', name: 'Food', slug: 'food', description: 'Cooking, recipes, and food reviews', icon: 'UtensilsCrossed', color: '#F97316', display_order: 9 },
  { id: 'cat-travel', name: 'Travel', slug: 'travel', description: 'Travel vlogs, destinations, and adventures', icon: 'Plane', color: '#0EA5E9', display_order: 10 },
  { id: 'cat-education', name: 'Education', slug: 'education', description: 'Learning, tutorials, and educational content', icon: 'GraduationCap', color: '#8B5CF6', display_order: 11 },
  { id: 'cat-lifestyle', name: 'Lifestyle', slug: 'lifestyle', description: 'Daily life, vlogs, and personal content', icon: 'Heart', color: '#F43F5E', display_order: 12 },
];

// Generate demo OHLC data for candlestick charts
const generateDemoOHLC = (basePrice, periods, volatility = 0.05) => {
  const data = [];
  let currentPrice = basePrice;
  const now = Date.now();
  
  for (let i = periods - 1; i >= 0; i--) {
    const periodStart = new Date(now - i * 60 * 60 * 1000); // hourly periods
    const change = (Math.random() - 0.5) * 2 * volatility;
    const open = currentPrice;
    const close = currentPrice * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = Math.floor(Math.random() * 500) + 50;
    
    data.push({
      period_start: periodStart.toISOString(),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume,
    });
    
    currentPrice = close;
  }
  
  return data;
};

// Generate demo content shares for a category
const generateDemoShares = (category, count = 8) => {
  const creators = ['TechGuru', 'StyleQueen', 'MusicMaster', 'ComedyKing', 'FitnessPro', 'FoodieChef', 'TravelNomad', 'BizMogul'];
  const platforms = ['instagram', 'tiktok', 'youtube', 'twitter'];
  
  return Array.from({ length: count }, (_, i) => {
    const basePrice = 5 + Math.random() * 45;
    const change24h = (Math.random() - 0.5) * 20;
    const volume = Math.floor(Math.random() * 10000) + 500;
    
    return {
      id: `share-${category.slug}-${i + 1}`,
      content_id: `content-${category.slug}-${i + 1}`,
      title: `${category.name} Content #${i + 1}`,
      creator_name: creators[i % creators.length],
      creator_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${category.slug}${i}`,
      platform: platforms[i % platforms.length],
      category_id: category.id,
      category_name: category.name,
      category_slug: category.slug,
      current_price: parseFloat(basePrice.toFixed(2)),
      previous_close: parseFloat((basePrice / (1 + change24h / 100)).toFixed(2)),
      change_24h: parseFloat(change24h.toFixed(2)),
      change_7d: parseFloat(((Math.random() - 0.4) * 30).toFixed(2)),
      volume_24h: volume,
      market_cap: parseFloat((basePrice * (1000 + Math.random() * 9000)).toFixed(2)),
      total_shares: 1000 + Math.floor(Math.random() * 9000),
      available_shares: Math.floor(Math.random() * 500) + 50,
      holder_count: Math.floor(Math.random() * 200) + 10,
      day_high: parseFloat((basePrice * 1.05).toFixed(2)),
      day_low: parseFloat((basePrice * 0.95).toFixed(2)),
      all_time_high: parseFloat((basePrice * 1.5).toFixed(2)),
      thumbnail: `/assets/demo/${['tech-summit', 'neon-festival', 'streetwear-hoodie', 'headphones', 'tiktok-drop'][i % 5]}.png`,
    };
  });
};

// Generate demo market index data
const generateDemoMarketIndex = () => {
  const baseValue = 1000;
  const change = (Math.random() - 0.45) * 5;
  
  return {
    index_value: parseFloat((baseValue * (1 + change / 100)).toFixed(2)),
    change_percent: parseFloat(change.toFixed(2)),
    total_market_cap: parseFloat((Math.random() * 5000000 + 1000000).toFixed(2)),
    total_volume: Math.floor(Math.random() * 100000) + 10000,
    active_shares: Math.floor(Math.random() * 500) + 100,
    top_gainers: [
      { content_id: 'gainer-1', title: 'Viral Dance Challenge', change_percent: 45.2, price: 28.50 },
      { content_id: 'gainer-2', title: 'Tech Review: New Phone', change_percent: 32.8, price: 15.75 },
      { content_id: 'gainer-3', title: 'Cooking Tutorial', change_percent: 28.4, price: 12.30 },
    ],
    top_losers: [
      { content_id: 'loser-1', title: 'Old Meme Compilation', change_percent: -18.5, price: 3.20 },
      { content_id: 'loser-2', title: 'Outdated Tutorial', change_percent: -12.3, price: 5.80 },
      { content_id: 'loser-3', title: 'Controversial Take', change_percent: -8.7, price: 8.40 },
    ],
    most_traded: [
      { content_id: 'traded-1', title: 'Breaking News Coverage', volume: 15420, price: 22.10 },
      { content_id: 'traded-2', title: 'Celebrity Interview', volume: 12850, price: 35.60 },
      { content_id: 'traded-3', title: 'Sports Highlights', volume: 9870, price: 18.90 },
    ],
  };
};

// =====================================================
// PUBLIC ENDPOINTS
// =====================================================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ categories: DEMO_CATEGORIES });
    }

    const { data: categories, error } = await supabase
      .from('content_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json({ categories: categories || DEMO_CATEGORIES });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.json({ categories: DEMO_CATEGORIES });
  }
});

// Get market overview (overall index)
router.get('/overview', async (req, res) => {
  try {
    if (!supabase) {
      const overview = generateDemoMarketIndex();
      const categoryIndices = DEMO_CATEGORIES.slice(0, 6).map(cat => ({
        category_id: cat.id,
        category_name: cat.name,
        category_slug: cat.slug,
        category_color: cat.color,
        index_value: parseFloat((1000 + (Math.random() - 0.5) * 200).toFixed(2)),
        change_percent: parseFloat(((Math.random() - 0.45) * 10).toFixed(2)),
        total_volume: Math.floor(Math.random() * 50000) + 5000,
      }));
      
      return res.json({
        market: overview,
        category_indices: categoryIndices,
        last_updated: new Date().toISOString(),
      });
    }

    // Fetch latest market snapshot
    const { data: snapshot, error: snapshotError } = await supabase
      .from('market_index_snapshots')
      .select('*')
      .eq('period_type', '1d')
      .order('period_start', { ascending: false })
      .limit(1)
      .single();

    // Fetch category indices
    const { data: categoryIndices, error: catError } = await supabase
      .from('category_market_indices')
      .select(`
        *,
        category:category_id (name, slug, color)
      `)
      .eq('period_type', '1d')
      .order('period_start', { ascending: false })
      .limit(12);

    if (snapshotError && snapshotError.code !== 'PGRST116') {
      console.error('Error fetching market snapshot:', snapshotError);
    }

    const overview = snapshot || generateDemoMarketIndex();
    const indices = categoryIndices?.map(idx => ({
      category_id: idx.category_id,
      category_name: idx.category?.name,
      category_slug: idx.category?.slug,
      category_color: idx.category?.color,
      index_value: idx.index_value,
      change_percent: idx.change_percent,
      total_volume: idx.total_volume,
    })) || DEMO_CATEGORIES.slice(0, 6).map(cat => ({
      category_id: cat.id,
      category_name: cat.name,
      category_slug: cat.slug,
      category_color: cat.color,
      index_value: parseFloat((1000 + (Math.random() - 0.5) * 200).toFixed(2)),
      change_percent: parseFloat(((Math.random() - 0.45) * 10).toFixed(2)),
      total_volume: Math.floor(Math.random() * 50000) + 5000,
    }));

    res.json({
      market: overview,
      category_indices: indices,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.json({
      market: generateDemoMarketIndex(),
      category_indices: [],
      last_updated: new Date().toISOString(),
    });
  }
});

// Get shares by category
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { sort = 'volume', order = 'desc', limit = 20, offset = 0 } = req.query;

    const category = DEMO_CATEGORIES.find(c => c.slug === slug);
    if (!category && !supabase) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!supabase) {
      const shares = generateDemoShares(category, parseInt(limit));
      const indexData = generateDemoOHLC(1000, 24);
      
      return res.json({
        category,
        shares,
        index: {
          current_value: indexData[indexData.length - 1].close,
          change_percent: parseFloat(((indexData[indexData.length - 1].close / indexData[0].open - 1) * 100).toFixed(2)),
          history: indexData,
        },
        total: shares.length,
      });
    }

    // Fetch category
    const { data: dbCategory, error: catError } = await supabase
      .from('content_categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (catError || !dbCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Fetch shares in this category
    const { data: shares, error: sharesError } = await supabase
      .from('content_category_links')
      .select(`
        content:content_id (
          id, title, creator_name, creator_avatar, platform,
          stats:content_share_stats (*)
        )
      `)
      .eq('category_id', dbCategory.id)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (sharesError) throw sharesError;

    // Fetch category index history
    const { data: indexHistory } = await supabase
      .from('category_market_indices')
      .select('*')
      .eq('category_id', dbCategory.id)
      .eq('period_type', '1h')
      .order('period_start', { ascending: true })
      .limit(24);

    const formattedShares = (shares || []).map(s => ({
      id: s.content?.id,
      content_id: s.content?.id,
      title: s.content?.title,
      creator_name: s.content?.creator_name,
      creator_avatar: s.content?.creator_avatar,
      platform: s.content?.platform,
      category_id: dbCategory.id,
      category_name: dbCategory.name,
      category_slug: dbCategory.slug,
      ...s.content?.stats,
    }));

    res.json({
      category: dbCategory,
      shares: formattedShares,
      index: {
        current_value: indexHistory?.[indexHistory.length - 1]?.close_value || 1000,
        change_percent: indexHistory?.length > 0 
          ? ((indexHistory[indexHistory.length - 1].close_value / indexHistory[0].open_value - 1) * 100).toFixed(2)
          : 0,
        history: indexHistory || [],
      },
      total: formattedShares.length,
    });
  } catch (error) {
    console.error('Error fetching category shares:', error);
    const category = DEMO_CATEGORIES.find(c => c.slug === req.params.slug) || DEMO_CATEGORIES[0];
    res.json({
      category,
      shares: generateDemoShares(category),
      index: { current_value: 1000, change_percent: 2.5, history: [] },
      total: 8,
    });
  }
});

// Get price history for a content share (OHLC data for candlestick)
router.get('/shares/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '1d', limit = 100 } = req.query;

    if (!supabase) {
      const basePrice = 10 + Math.random() * 40;
      const periods = period === '1w' ? 168 : period === '1d' ? 24 : period === '4h' ? 24 : 60;
      const history = generateDemoOHLC(basePrice, Math.min(periods, parseInt(limit)));
      
      return res.json({
        content_id: id,
        period_type: period,
        history,
        current_price: history[history.length - 1].close,
      });
    }

    const { data: history, error } = await supabase
      .from('content_share_price_history')
      .select('*')
      .eq('content_id', id)
      .eq('period_type', period)
      .order('period_start', { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    const { data: stats } = await supabase
      .from('content_share_stats')
      .select('current_price')
      .eq('content_id', id)
      .single();

    res.json({
      content_id: id,
      period_type: period,
      history: history || [],
      current_price: stats?.current_price || history?.[history.length - 1]?.close_price || 0,
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    const basePrice = 10 + Math.random() * 40;
    res.json({
      content_id: req.params.id,
      period_type: req.query.period || '1d',
      history: generateDemoOHLC(basePrice, 24),
      current_price: basePrice,
    });
  }
});

// Get market index history (overall market OHLC)
router.get('/index/history', async (req, res) => {
  try {
    const { period = '1d', limit = 100 } = req.query;

    if (!supabase) {
      const history = generateDemoOHLC(1000, Math.min(168, parseInt(limit)), 0.02);
      return res.json({
        period_type: period,
        history,
        current_value: history[history.length - 1].close,
      });
    }

    const { data: history, error } = await supabase
      .from('market_index_snapshots')
      .select('*')
      .eq('period_type', period)
      .order('period_start', { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({
      period_type: period,
      history: (history || []).map(h => ({
        period_start: h.period_start,
        open: h.open_value,
        high: h.high_value,
        low: h.low_value,
        close: h.close_value,
        volume: h.total_volume,
      })),
      current_value: history?.[history.length - 1]?.close_value || 1000,
    });
  } catch (error) {
    console.error('Error fetching index history:', error);
    res.json({
      period_type: req.query.period || '1d',
      history: generateDemoOHLC(1000, 24, 0.02),
      current_value: 1000,
    });
  }
});

// Get top movers (gainers, losers, most traded)
router.get('/movers', async (req, res) => {
  try {
    const { type = 'all', limit = 10 } = req.query;

    if (!supabase) {
      const overview = generateDemoMarketIndex();
      return res.json({
        gainers: overview.top_gainers,
        losers: overview.top_losers,
        most_traded: overview.most_traded,
      });
    }

    // Fetch from content_share_stats ordered by change
    const { data: gainers } = await supabase
      .from('content_share_stats')
      .select(`
        content_id,
        current_price,
        change_24h,
        volume_24h,
        content:content_id (title, creator_name, platform)
      `)
      .order('change_24h', { ascending: false })
      .limit(parseInt(limit));

    const { data: losers } = await supabase
      .from('content_share_stats')
      .select(`
        content_id,
        current_price,
        change_24h,
        volume_24h,
        content:content_id (title, creator_name, platform)
      `)
      .order('change_24h', { ascending: true })
      .limit(parseInt(limit));

    const { data: mostTraded } = await supabase
      .from('content_share_stats')
      .select(`
        content_id,
        current_price,
        change_24h,
        volume_24h,
        content:content_id (title, creator_name, platform)
      `)
      .order('volume_24h', { ascending: false })
      .limit(parseInt(limit));

    const formatMover = (item) => ({
      content_id: item.content_id,
      title: item.content?.title,
      creator_name: item.content?.creator_name,
      platform: item.content?.platform,
      price: item.current_price,
      change_percent: item.change_24h,
      volume: item.volume_24h,
    });

    res.json({
      gainers: (gainers || []).map(formatMover),
      losers: (losers || []).map(formatMover),
      most_traded: (mostTraded || []).map(formatMover),
    });
  } catch (error) {
    console.error('Error fetching movers:', error);
    const overview = generateDemoMarketIndex();
    res.json({
      gainers: overview.top_gainers,
      losers: overview.top_losers,
      most_traded: overview.most_traded,
    });
  }
});

// Search shares
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;

    if (!supabase || !q) {
      const allShares = DEMO_CATEGORIES.flatMap(cat => generateDemoShares(cat, 3));
      const filtered = q 
        ? allShares.filter(s => s.title.toLowerCase().includes(q.toLowerCase()) || s.creator_name.toLowerCase().includes(q.toLowerCase()))
        : allShares.slice(0, parseInt(limit));
      
      return res.json({ results: filtered, total: filtered.length });
    }

    let query = supabase
      .from('content_items')
      .select(`
        id, title, creator_name, creator_avatar, platform,
        stats:content_share_stats (*),
        categories:content_category_links (
          category:category_id (id, name, slug, color)
        )
      `)
      .or(`title.ilike.%${q}%,creator_name.ilike.%${q}%`)
      .limit(parseInt(limit));

    if (category) {
      // Filter by category would require a join
    }

    const { data: results, error } = await query;

    if (error) throw error;

    res.json({
      results: (results || []).map(r => ({
        id: r.id,
        content_id: r.id,
        title: r.title,
        creator_name: r.creator_name,
        creator_avatar: r.creator_avatar,
        platform: r.platform,
        category_name: r.categories?.[0]?.category?.name,
        category_slug: r.categories?.[0]?.category?.slug,
        ...r.stats,
      })),
      total: results?.length || 0,
    });
  } catch (error) {
    console.error('Error searching shares:', error);
    res.json({ results: [], total: 0 });
  }
});

module.exports = router;
