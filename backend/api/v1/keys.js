const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { generateApiKey } = require('../../middleware/apiKeyAuth');
const { supabase } = require('../../lib/supabase');

const VALID_ENVIRONMENTS = new Set(['development', 'staging', 'production']);
const VALID_SCOPES = new Set([
  'feed:read',
  'coupons:claim',
  'campaigns:read',
  'campaigns:write',
  'merchants:read',
  'merchants:write'
]);

function sourceUnavailable(res) {
  return res.status(503).json({
    success: false,
    error: 'Developer API key store unavailable',
    code: 'API_KEY_STORE_UNAVAILABLE'
  });
}

/**
 * GET /api/v1/keys
 * List active API keys for the authenticated user/organization (masked).
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!supabase) return sourceUnavailable(res);

    const { data: keys, error } = await supabase
      .from('developer_api_keys')
      .select('id, name, masked_key, scopes, is_active, environment, last_used_at, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: keys || [] });
  } catch (err) {
    console.error('[API v1 /keys GET] Error:', err);
    return res.status(500).json({ success: false, error: err.message, code: 'FETCH_KEYS_FAILED' });
  }
});

/**
 * POST /api/v1/keys
 * Generate a new Developer API Key (shows plaintext key only once in response).
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      name = 'API Key',
      scopes = ['feed:read', 'coupons:claim'],
      environment = 'production',
      organizationId
    } = req.body || {};

    if (!supabase) return sourceUnavailable(res);

    const normalizedName = String(name || '').trim();
    const normalizedScopes = Array.isArray(scopes) ? Array.from(new Set(scopes.map(String))) : [];
    if (!normalizedName) {
      return res.status(400).json({ success: false, error: 'name is required', code: 'INVALID_KEY_NAME' });
    }
    if (!VALID_ENVIRONMENTS.has(environment)) {
      return res.status(400).json({ success: false, error: 'invalid environment', code: 'INVALID_KEY_ENVIRONMENT' });
    }
    if (!normalizedScopes.length || normalizedScopes.some((scope) => !VALID_SCOPES.has(scope))) {
      return res.status(400).json({ success: false, error: 'invalid permission scopes', code: 'INVALID_KEY_SCOPES' });
    }

    const prefix = environment === 'production' ? 'pk_live_' : 'pk_test_';
    const { rawKey, record } = generateApiKey({
      prefix,
      name: normalizedName,
      scopes: normalizedScopes,
      environment,
      userId,
      organizationId
    });

    const { data: inserted, error } = await supabase
      .from('developer_api_keys')
      .insert(record)
      .select('id, name, masked_key, scopes, environment, created_at')
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data: {
        ...inserted,
        apiKey: rawKey // Plaintext returned once!
      },
      message: 'API Key generated successfully. Save this secret key now as you will not be able to view it again.'
    });
  } catch (err) {
    console.error('[API v1 /keys POST] Error:', err);
    return res.status(500).json({ success: false, error: err.message, code: 'CREATE_KEY_FAILED' });
  }
});

/**
 * DELETE /api/v1/keys/:id
 * Revoke an API Key.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!supabase) return sourceUnavailable(res);

    const { data: revoked, error } = await supabase
      .from('developer_api_keys')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!revoked) {
      return res.status(404).json({ success: false, error: 'API key not found or already revoked', code: 'API_KEY_NOT_FOUND' });
    }

    return res.json({ success: true, message: 'API key revoked successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'REVOKE_KEY_FAILED' });
  }
});

module.exports = router;
