const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { generateApiKey } = require('../../middleware/apiKeyAuth');
const { supabase } = require('../../lib/supabase');

/**
 * GET /api/v1/keys
 * List active API keys for the authenticated user/organization (masked).
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!supabase) {
      return res.json({
        success: true,
        data: [
          {
            id: 'mock-key-1',
            name: 'Production AI Agent Key',
            maskedKey: 'pk_live_a1b2...9f8e',
            scopes: ['feed:read', 'coupons:claim', 'campaigns:write'],
            environment: 'production',
            createdAt: new Date().toISOString()
          }
        ]
      });
    }

    const { data: keys, error } = await supabase
      .from('developer_api_keys')
      .select('id, name, masked_key, scopes, is_active, environment, last_used_at, created_at')
      .eq('user_id', userId)
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
    const { name = 'API Key', scopes = ['feed:read', 'coupons:claim'], environment = 'production', organizationId } = req.body || {};

    const prefix = environment === 'production' ? 'pk_live_' : 'pk_test_';
    const { rawKey, record } = generateApiKey({
      prefix,
      name,
      scopes,
      environment,
      userId,
      organizationId
    });

    if (!supabase) {
      return res.json({
        success: true,
        data: {
          id: 'demo-key-id',
          name,
          apiKey: rawKey, // Plaintext returned once!
          maskedKey: record.masked_key,
          scopes,
          environment,
          createdAt: record.created_at
        },
        message: 'API Key generated successfully. Save this secret key now as you will not be able to view it again.'
      });
    }

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

    if (!supabase) {
      return res.json({ success: true, message: 'API key revoked successfully (demo mode)' });
    }

    const { error } = await supabase
      .from('developer_api_keys')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return res.json({ success: true, message: 'API key revoked successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'REVOKE_KEY_FAILED' });
  }
});

module.exports = router;
