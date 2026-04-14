const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://promorang.co';

// ─── Helper: Extract user from Authorization header ────────────────────────
async function getUser(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return user;
}

// ═══════════════════════════════════════════════════════════════════════════
// SHOPIFY
// ═══════════════════════════════════════════════════════════════════════════

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_SCOPES = 'read_products,read_inventory,read_orders';
const SHOPIFY_REDIRECT_URI = `${process.env.API_BASE_URL || 'https://api.promorang.co'}/api/integrations/shopify/callback`;

// Initiate Shopify OAuth
router.get('/shopify/connect', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { shop } = req.query; // e.g., "mystore.myshopify.com"
        if (!shop) return res.status(400).json({ error: 'Shop domain is required' });

        // Normalize shop domain
        const shopDomain = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');

        // Generate a nonce for CSRF protection, include user ID
        const state = Buffer.from(JSON.stringify({
            userId: user.id,
            nonce: Math.random().toString(36).substring(7),
            timestamp: Date.now()
        })).toString('base64');

        const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
            `client_id=${SHOPIFY_CLIENT_ID}` +
            `&scope=${SHOPIFY_SCOPES}` +
            `&redirect_uri=${encodeURIComponent(SHOPIFY_REDIRECT_URI)}` +
            `&state=${state}`;

        res.json({ url: authUrl, state });
    } catch (error) {
        console.error('Shopify connect error:', error);
        res.status(500).json({ error: 'Failed to initiate Shopify connection' });
    }
});

// Shopify OAuth Callback
router.get('/shopify/callback', async (req, res) => {
    try {
        const { code, shop, state } = req.query;

        if (!code || !shop || !state) {
            return res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&error=missing_params`);
        }

        // Decode state to get user ID
        let stateData;
        try {
            stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        } catch {
            return res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&error=invalid_state`);
        }

        const { userId } = stateData;

        // Exchange code for access token
        const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: SHOPIFY_CLIENT_ID,
                client_secret: SHOPIFY_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error('Shopify token exchange failed:', tokenData);
            return res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&error=token_failed`);
        }

        // Fetch shop info
        const shopResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
            headers: { 'X-Shopify-Access-Token': tokenData.access_token },
        });
        const shopData = await shopResponse.json();

        // Store the integration
        await supabase.rpc('upsert_merchant_integration', {
            p_user_id: userId,
            p_provider: 'shopify',
            p_status: 'connected',
            p_access_token: tokenData.access_token,
            p_external_store_id: shop,
            p_external_store_name: shopData.shop?.name || shop,
            p_scopes: tokenData.scope?.split(',') || [],
        });

        res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&connected=shopify`);
    } catch (error) {
        console.error('Shopify callback error:', error);
        res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&error=shopify_failed`);
    }
});

// Sync Shopify products
router.post('/shopify/sync', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // Get integration
        const { data: integration, error: intError } = await supabase
            .from('merchant_integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'shopify')
            .eq('status', 'connected')
            .single();

        if (intError || !integration) {
            return res.status(404).json({ error: 'Shopify not connected' });
        }

        // Update sync status
        await supabase
            .from('merchant_integrations')
            .update({ sync_status: 'syncing' })
            .eq('id', integration.id);

        // Fetch products from Shopify
        const productsResponse = await fetch(
            `https://${integration.external_store_id}/admin/api/2024-01/products.json?limit=250`,
            { headers: { 'X-Shopify-Access-Token': integration.access_token } }
        );
        const productsData = await productsResponse.json();

        if (!productsData.products) {
            await supabase
                .from('merchant_integrations')
                .update({ sync_status: 'error', sync_error: 'Failed to fetch products' })
                .eq('id', integration.id);
            return res.status(500).json({ error: 'Failed to fetch Shopify products' });
        }

        let syncedCount = 0;

        for (const product of productsData.products) {
            const variant = product.variants?.[0];

            await supabase.from('synced_products').upsert({
                integration_id: integration.id,
                user_id: user.id,
                external_product_id: String(product.id),
                external_variant_id: variant ? String(variant.id) : null,
                title: product.title,
                description: product.body_html?.replace(/<[^>]*>/g, '').substring(0, 500) || null,
                image_url: product.image?.src || product.images?.[0]?.src || null,
                price: variant?.price ? parseFloat(variant.price) : null,
                currency: 'USD',
                sku: variant?.sku || null,
                inventory_quantity: variant?.inventory_quantity || null,
                is_available: product.status === 'active',
                external_updated_at: product.updated_at,
                last_synced_at: new Date().toISOString(),
                sync_action: 'imported',
            }, {
                onConflict: 'integration_id,external_product_id',
            });

            syncedCount++;
        }

        // Update integration status
        await supabase
            .from('merchant_integrations')
            .update({
                sync_status: 'success',
                sync_error: null,
                products_synced: syncedCount,
                last_synced_at: new Date().toISOString(),
            })
            .eq('id', integration.id);

        res.json({ success: true, products_synced: syncedCount });
    } catch (error) {
        console.error('Shopify sync error:', error);
        res.status(500).json({ error: 'Product sync failed' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// SQUARE
// ═══════════════════════════════════════════════════════════════════════════

const SQUARE_APP_ID = process.env.SQUARE_APP_ID;
const SQUARE_APP_SECRET = process.env.SQUARE_APP_SECRET;
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || 'production';
const SQUARE_BASE_URL = SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';
const SQUARE_API_BASE = SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';
const SQUARE_REDIRECT_URI = `${process.env.API_BASE_URL || 'https://api.promorang.co'}/api/integrations/square/callback`;

// Initiate Square OAuth
router.get('/square/connect', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const state = Buffer.from(JSON.stringify({
            userId: user.id,
            nonce: Math.random().toString(36).substring(7),
            timestamp: Date.now()
        })).toString('base64');

        const authUrl = `${SQUARE_BASE_URL}/oauth2/authorize?` +
            `client_id=${SQUARE_APP_ID}` +
            `&scope=ITEMS_READ+ORDERS_READ+MERCHANT_PROFILE_READ` +
            `&session=false` +
            `&state=${state}`;

        res.json({ url: authUrl, state });
    } catch (error) {
        console.error('Square connect error:', error);
        res.status(500).json({ error: 'Failed to initiate Square connection' });
    }
});

// Square OAuth Callback
router.get('/square/callback', async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&error=missing_params`);
        }

        let stateData;
        try {
            stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        } catch {
            return res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&error=invalid_state`);
        }

        const { userId } = stateData;

        // Exchange code for tokens
        const tokenResponse = await fetch(`${SQUARE_API_BASE}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: SQUARE_APP_ID,
                client_secret: SQUARE_APP_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: SQUARE_REDIRECT_URI,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error('Square token exchange failed:', tokenData);
            return res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&error=token_failed`);
        }

        // Fetch merchant info
        const merchantResponse = await fetch(`${SQUARE_API_BASE}/v2/merchants/me`, {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
        });
        const merchantData = await merchantResponse.json();

        // Store the integration
        await supabase.rpc('upsert_merchant_integration', {
            p_user_id: userId,
            p_provider: 'square',
            p_status: 'connected',
            p_access_token: tokenData.access_token,
            p_refresh_token: tokenData.refresh_token || null,
            p_token_expires_at: tokenData.expires_at || null,
            p_external_store_id: tokenData.merchant_id || merchantData.merchant?.[0]?.id,
            p_external_store_name: merchantData.merchant?.[0]?.business_name || 'Square Store',
            p_scopes: ['ITEMS_READ', 'ORDERS_READ', 'MERCHANT_PROFILE_READ'],
        });

        res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&connected=square`);
    } catch (error) {
        console.error('Square callback error:', error);
        res.redirect(`${FRONTEND_URL}/dashboard?tab=integrations&error=square_failed`);
    }
});

// Sync Square catalog
router.post('/square/sync', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { data: integration } = await supabase
            .from('merchant_integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'square')
            .eq('status', 'connected')
            .single();

        if (!integration) {
            return res.status(404).json({ error: 'Square not connected' });
        }

        await supabase
            .from('merchant_integrations')
            .update({ sync_status: 'syncing' })
            .eq('id', integration.id);

        // Fetch catalog from Square
        const catalogResponse = await fetch(`${SQUARE_API_BASE}/v2/catalog/list?types=ITEM`, {
            headers: { 'Authorization': `Bearer ${integration.access_token}` },
        });
        const catalogData = await catalogResponse.json();

        if (!catalogData.objects) {
            await supabase
                .from('merchant_integrations')
                .update({ sync_status: 'error', sync_error: 'No catalog items found' })
                .eq('id', integration.id);
            return res.json({ success: true, products_synced: 0 });
        }

        let syncedCount = 0;

        for (const item of catalogData.objects) {
            const variation = item.item_data?.variations?.[0];
            const priceMoney = variation?.item_variation_data?.price_money;

            await supabase.from('synced_products').upsert({
                integration_id: integration.id,
                user_id: user.id,
                external_product_id: item.id,
                external_variant_id: variation?.id || null,
                title: item.item_data?.name || 'Untitled',
                description: item.item_data?.description || null,
                image_url: null, // Square images require separate API call
                price: priceMoney ? priceMoney.amount / 100 : null,
                currency: priceMoney?.currency || 'USD',
                sku: variation?.item_variation_data?.sku || null,
                is_available: !item.is_deleted,
                external_updated_at: item.updated_at,
                last_synced_at: new Date().toISOString(),
                sync_action: 'imported',
            }, {
                onConflict: 'integration_id,external_product_id',
            });

            syncedCount++;
        }

        await supabase
            .from('merchant_integrations')
            .update({
                sync_status: 'success',
                sync_error: null,
                products_synced: syncedCount,
                last_synced_at: new Date().toISOString(),
            })
            .eq('id', integration.id);

        res.json({ success: true, products_synced: syncedCount });
    } catch (error) {
        console.error('Square sync error:', error);
        res.status(500).json({ error: 'Catalog sync failed' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// WOOCOMMERCE
// ═══════════════════════════════════════════════════════════════════════════

// Connect WooCommerce (API key-based, no OAuth)
router.post('/woocommerce/connect', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { siteUrl, consumerKey, consumerSecret } = req.body;

        if (!siteUrl || !consumerKey || !consumerSecret) {
            return res.status(400).json({ error: 'Site URL, Consumer Key, and Consumer Secret are required' });
        }

        // Normalize site URL
        const normalizedUrl = siteUrl.replace(/\/$/, '');

        // Verify the credentials work
        const testUrl = `${normalizedUrl}/wp-json/wc/v3/system_status?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
        const testResponse = await fetch(testUrl);

        if (!testResponse.ok) {
            return res.status(400).json({
                error: 'Invalid credentials',
                message: 'Could not connect to your WooCommerce store. Please check your URL and API keys.',
            });
        }

        // Store the integration
        await supabase.rpc('upsert_merchant_integration', {
            p_user_id: user.id,
            p_provider: 'woocommerce',
            p_status: 'connected',
            p_external_store_id: normalizedUrl,
            p_external_store_name: normalizedUrl.replace(/^https?:\/\//, ''),
            p_api_key: consumerKey,
            p_api_secret: consumerSecret,
            p_scopes: ['read_products', 'read_orders'],
        });

        res.json({ success: true, store: normalizedUrl });
    } catch (error) {
        console.error('WooCommerce connect error:', error);
        res.status(500).json({ error: 'Failed to connect WooCommerce store' });
    }
});

// Sync WooCommerce products
router.post('/woocommerce/sync', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { data: integration } = await supabase
            .from('merchant_integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'woocommerce')
            .eq('status', 'connected')
            .single();

        if (!integration) {
            return res.status(404).json({ error: 'WooCommerce not connected' });
        }

        await supabase
            .from('merchant_integrations')
            .update({ sync_status: 'syncing' })
            .eq('id', integration.id);

        // Fetch products
        const productsUrl = `${integration.external_store_id}/wp-json/wc/v3/products?per_page=100&consumer_key=${integration.api_key}&consumer_secret=${integration.api_secret}`;
        const productsResponse = await fetch(productsUrl);

        if (!productsResponse.ok) {
            await supabase
                .from('merchant_integrations')
                .update({ sync_status: 'error', sync_error: 'Failed to fetch products' })
                .eq('id', integration.id);
            return res.status(500).json({ error: 'Failed to fetch WooCommerce products' });
        }

        const products = await productsResponse.json();
        let syncedCount = 0;

        for (const product of products) {
            await supabase.from('synced_products').upsert({
                integration_id: integration.id,
                user_id: user.id,
                external_product_id: String(product.id),
                title: product.name,
                description: product.short_description?.replace(/<[^>]*>/g, '').substring(0, 500) || null,
                image_url: product.images?.[0]?.src || null,
                price: product.price ? parseFloat(product.price) : null,
                currency: 'USD',
                sku: product.sku || null,
                inventory_quantity: product.stock_quantity,
                is_available: product.status === 'publish' && product.purchasable,
                external_updated_at: product.date_modified,
                last_synced_at: new Date().toISOString(),
                sync_action: 'imported',
            }, {
                onConflict: 'integration_id,external_product_id',
            });

            syncedCount++;
        }

        await supabase
            .from('merchant_integrations')
            .update({
                sync_status: 'success',
                sync_error: null,
                products_synced: syncedCount,
                last_synced_at: new Date().toISOString(),
            })
            .eq('id', integration.id);

        res.json({ success: true, products_synced: syncedCount });
    } catch (error) {
        console.error('WooCommerce sync error:', error);
        res.status(500).json({ error: 'Product sync failed' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// SHARED ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// Get all integrations for the current user
router.get('/status', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { data: integrations } = await supabase
            .from('merchant_integrations')
            .select('id, provider, status, external_store_name, external_store_id, last_synced_at, sync_status, sync_error, products_synced, created_at')
            .eq('user_id', user.id);

        res.json({ integrations: integrations || [] });
    } catch (error) {
        console.error('Integration status error:', error);
        res.status(500).json({ error: 'Failed to fetch integration status' });
    }
});

// Get synced products for an integration
router.get('/:provider/products', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { provider } = req.params;

        const { data: products } = await supabase
            .from('synced_products')
            .select('*')
            .eq('user_id', user.id)
            .order('title');

        // Filter by provider via integration
        const { data: integration } = await supabase
            .from('merchant_integrations')
            .select('id')
            .eq('user_id', user.id)
            .eq('provider', provider)
            .single();

        const filtered = integration
            ? (products || []).filter(p => p.integration_id === integration.id)
            : [];

        res.json({ products: filtered });
    } catch (error) {
        console.error('Products fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Disconnect an integration
router.delete('/:provider/disconnect', async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { provider } = req.params;

        // Delete synced products first (cascade should handle this, but be explicit)
        const { data: integration } = await supabase
            .from('merchant_integrations')
            .select('id')
            .eq('user_id', user.id)
            .eq('provider', provider)
            .single();

        if (integration) {
            await supabase
                .from('synced_products')
                .delete()
                .eq('integration_id', integration.id);

            await supabase
                .from('merchant_integrations')
                .update({
                    status: 'disconnected',
                    access_token: null,
                    refresh_token: null,
                    api_key: null,
                    api_secret: null,
                    products_synced: 0,
                })
                .eq('id', integration.id);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Disconnect error:', error);
        res.status(500).json({ error: 'Failed to disconnect integration' });
    }
});

module.exports = router;
