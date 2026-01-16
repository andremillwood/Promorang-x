const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Helper for fuzzy search
const fuzzySearch = (query) => `%${query}%`;

/**
 * GET /api/search
 * Global search across Users, Drops, Products, and Stores
 * Query params: q (search term), type (optional filter)
 */
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: { users: [], drops: [], products: [], stores: [] }
            });
        }

        const searchTerm = fuzzySearch(q);
        const limit = 5; // Limit per category for "All" view

        // Run queries in parallel
        const [usersResult, dropsResult, productsResult, storesResult, eventsResult] = await Promise.all([
            // 1. Search Users
            supabase
                .from('users')
                .select('id, username, display_name, avatar_url, role')
                .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
                .limit(limit),

            // 2. Search Drops
            supabase
                .from('drops')
                .select('id, title, description, preview_image, gem_reward_base, status')
                .eq('status', 'active')
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
                .limit(limit),

            // 3. Search Products
            supabase
                .from('products')
                .select('id, name, price_usd, price_gems, images, store_id')
                .eq('status', 'active')
                .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
                .limit(limit),

            // 4. Search Stores
            supabase
                .from('merchant_stores')
                .select('id, store_name, store_slug, logo_url, rating')
                .eq('status', 'active')
                .ilike('store_name', searchTerm)
                .limit(limit),

            // 5. Search Events
            supabase
                .from('events')
                .select('id, title, description, event_date, location_name, banner_url')
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location_name.ilike.${searchTerm}`)
                .limit(limit)
        ]);

        // Aggregate results
        const results = {
            users: usersResult.data || [],
            drops: dropsResult.data || [],
            products: productsResult.data || [],
            stores: storesResult.data || [],
            events: eventsResult.data || []
        };

        // Mock data logic if Supabase returns nothing or errors out (Dev/Demo mode)
        const hasResults = results.users.length > 0 || results.drops.length > 0 || results.products.length > 0 || results.stores.length > 0 || results.events.length > 0;

        if (!hasResults && process.env.NODE_ENV === 'development') {
            // Mock Users
            if (q.toLowerCase().includes('creator') || q.toLowerCase().includes('demo') || q.toLowerCase().includes('advertiser')) {
                results.users.push({
                    id: 'demo-creator-1',
                    username: 'demo_creator',
                    display_name: 'Demo Creator',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
                    role: 'creator'
                });
                if (q.toLowerCase().includes('advertiser')) {
                    results.users.push({
                        id: 'demo-advertiser-1',
                        username: 'demo_brand',
                        display_name: 'Demo Brand',
                        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=brand',
                        role: 'advertiser'
                    });
                }
            }

            // Mock Drops
            if (q.toLowerCase().includes('drop') || q.toLowerCase().includes('earn')) {
                results.drops.push({
                    id: 'demo-drop-1',
                    title: 'Example Drop Campaign',
                    description: 'Earn gems by creating content',
                    preview_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
                    gem_reward_base: 50,
                    status: 'active'
                });
            }

            // Mock Products
            if (q.toLowerCase().includes('product') || q.toLowerCase().includes('shop') || q.toLowerCase().includes('shoe')) {
                results.products.push({
                    id: 'demo-product-1',
                    name: 'Limited Edition Sneakers',
                    price_usd: 120,
                    price_gems: 1200,
                    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'],
                    store_id: 'demo-store-1'
                });
            }
        }

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ success: false, error: 'Search failed' });
    }
});

module.exports = router;
