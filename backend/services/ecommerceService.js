/**
 * E-COMMERCE INTEGRATION SERVICE
 * Unified service for Shopify, WooCommerce, Etsy, etc.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const marketplaceService = require('./marketplaceService');

// ==========================================
// ADAPTERS
// ==========================================

const adapters = {
    shopify: {
        apiVersion: '2024-01',
        getAuthUrl: (shopUrl, redirectUri) => {
            const apiKey = process.env.SHOPIFY_API_KEY;
            const scopes = 'read_products,read_inventory';
            const shop = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
            return `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${Math.random().toString(36).substring(7)}`;
        },
        exchangeCode: async (shop, code) => {
            const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: process.env.SHOPIFY_API_KEY,
                    client_secret: process.env.SHOPIFY_API_SECRET,
                    code
                })
            });
            return await response.json();
        },
        fetchProducts: async (shop, accessToken) => {
            const url = `https://${shop}/admin/api/2024-01/products.json`;
            const response = await fetch(url, {
                headers: { 'X-Shopify-Access-Token': accessToken }
            });
            const data = await response.json();
            return data.products.map(p => ({
                id: p.id.toString(),
                title: p.title,
                description: p.body_html || '',
                price: parseFloat(p.variants[0].price),
                inventory: p.variants[0].inventory_quantity || 0,
                images: p.images.map(img => img.src),
                metadata: { handle: p.handle, vendor: p.vendor }
            }));
        }
    },

    woocommerce: {
        // WooCommerce uses API Keys directly, no redirect needed for standard REST
        getAuthUrl: () => null,
        fetchProducts: async (siteUrl, credentials) => {
            const { apiKey, apiSecret } = credentials;
            const url = `${siteUrl.replace(/\/$/, '')}/wp-json/wc/v3/products`;
            const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

            const response = await fetch(url, {
                headers: { 'Authorization': `Basic ${auth}` }
            });

            if (!response.ok) throw new Error('WooCommerce API failed');

            const products = await response.json();
            return products.map(p => ({
                id: p.id.toString(),
                title: p.name,
                description: p.description || '',
                price: parseFloat(p.price),
                inventory: p.stock_quantity || 0,
                images: p.images.map(img => img.src),
                metadata: { slug: p.slug, sku: p.sku }
            }));
        }
    }
};

// ==========================================
// CORE SERVICE
// ==========================================

async function getAuthUrl(platform, shopUrl, redirectUri) {
    const adapter = adapters[platform];
    if (!adapter || !adapter.getAuthUrl) return null;
    return adapter.getAuthUrl(shopUrl, redirectUri);
}

async function saveIntegration(storeId, platform, data) {
    const { data: result, error } = await supabase
        .from('merchant_external_stores')
        .upsert({
            store_id: storeId,
            platform,
            external_store_url: data.shopUrl || data.external_store_url,
            access_token: data.accessToken,
            api_key: data.apiKey,
            api_secret: data.apiSecret,
            store_hash: data.storeHash,
            sync_status: 'idle',
            last_synced_at: new Date().toISOString()
        }, { onConflict: 'store_id, platform' })
        .select()
        .single();

    if (error) throw error;
    return result;
}

async function fetchExternalProducts(storeId, platform) {
    const { data: integration } = await supabase
        .from('merchant_external_stores')
        .select('*')
        .eq('store_id', storeId)
        .eq('platform', platform)
        .single();

    if (!integration) throw new Error('Integration not found');

    const adapter = adapters[platform];
    if (platform === 'shopify') {
        return await adapter.fetchProducts(integration.external_store_url, integration.access_token);
    } else if (platform === 'woocommerce') {
        return await adapter.fetchProducts(integration.external_store_url, {
            apiKey: integration.api_key,
            apiSecret: integration.api_secret
        });
    }

    throw new Error(`Platform ${platform} not supported for fetching`);
}

async function importProducts(storeId, platform, externalIds) {
    const products = await fetchExternalProducts(storeId, platform);
    const toImport = products.filter(p => externalIds.includes(p.id));

    const results = [];
    for (const p of toImport) {
        const promorangProduct = {
            store_id: storeId,
            name: p.title,
            description: p.description,
            short_description: p.title,
            price_usd: p.price,
            images: p.images,
            inventory_count: p.inventory,
            external_platform: platform,
            external_id: p.id,
            external_metadata: p.metadata
        };

        // Logic for upsert
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('store_id', storeId)
            .eq('external_platform', platform)
            .eq('external_id', p.id)
            .maybeSingle();

        let result;
        if (existing) {
            const { data, error } = await supabase.from('products').update(promorangProduct).eq('id', existing.id).select().single();
            if (error) continue;
            result = data;
        } else {
            result = await marketplaceService.createProduct(storeId, promorangProduct);
        }
        results.push(result);
    }
    return results;
}

module.exports = {
    getAuthUrl,
    saveIntegration,
    fetchExternalProducts,
    importProducts,
    adapters // Exporting adapters for direct access if needed
};
