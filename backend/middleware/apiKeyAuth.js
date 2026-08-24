const crypto = require('crypto');
const { supabase } = require('../lib/supabase');

/**
 * Valid scopes for Developer APIs:
 * - feed:read       : View promotions, moments, active campaigns, drops
 * - coupons:claim   : Claim coupons, execute redemption receipts
 * - campaigns:read  : Read campaign telemetry, drafts, drops
 * - campaigns:write : Create drafts, publish campaigns, mobilize creators
 * - merchants:read  : View merchant live-ops, budget, products
 * - merchants:write : Update inventory, demand plans
 * - admin:*         : Full admin capabilities
 */

/**
 * Hashes an incoming plaintext API key using SHA-256
 */
function hashApiKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Generates a new API key pair: the raw secret (shown only once) and DB fields
 */
function generateApiKey({ prefix = 'pk_live_', name = 'Default API Key', scopes = ['feed:read', 'coupons:claim'], environment = 'production', userId, organizationId }) {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const secretKey = `${prefix}${randomBytes}`;
  const keyHash = hashApiKey(secretKey);
  const maskedKey = `${secretKey.substring(0, 10)}...${secretKey.substring(secretKey.length - 4)}`;

  return {
    rawKey: secretKey,
    record: {
      user_id: userId,
      organization_id: organizationId || null,
      name,
      key_prefix: prefix,
      key_hash: keyHash,
      masked_key: maskedKey,
      scopes,
      is_active: true,
      environment,
      rate_limit_per_minute: environment === 'production' ? 120 : 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
}

/**
 * Middleware: requireApiKeyOrAuth
 * Accepts either:
 * 1. An API Key via 'x-api-key' or Bearer 'pk_live_...' / 'pk_test_...'
 * 2. Standard Supabase JWT session (Bearer JWT)
 */
const requireApiKeyOrAuth = (requiredScopes = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'] || '';
      const apiKeyHeader = req.headers['x-api-key'] || '';

      let rawApiKey = apiKeyHeader;
      if (!rawApiKey && authHeader.startsWith('Bearer pk_')) {
        rawApiKey = authHeader.replace(/^Bearer\s+/i, '').trim();
      }

      // 1. Authenticate via Developer API Key
      if (rawApiKey) {
        const keyHash = hashApiKey(rawApiKey);

        // Fallback for development/demo without active Supabase DB
        if (!supabase) {
          req.authType = 'api_key';
          req.apiKey = {
            id: 'mock-key-id',
            scopes: ['*'],
            environment: 'development'
          };
          req.user = { id: '00000000-0000-0000-0000-000000000001', role: 'developer' };
          return next();
        }

        const { data: keyRecord, error } = await supabase
          .from('developer_api_keys')
          .select('*')
          .eq('key_hash', keyHash)
          .eq('is_active', true)
          .maybeSingle();

        if (error || !keyRecord) {
          return res.status(401).json({
            success: false,
            error: 'Invalid or revoked API key.',
            code: 'INVALID_API_KEY'
          });
        }

        // Check expiration
        if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
          return res.status(401).json({
            success: false,
            error: 'API key has expired.',
            code: 'API_KEY_EXPIRED'
          });
        }

        // Check scopes
        const keyScopes = keyRecord.scopes || [];
        const hasAllScopes = requiredScopes.every(reqScope => {
          return keyScopes.includes('*') ||
                 keyScopes.includes(reqScope) ||
                 keyScopes.some(s => s.endsWith(':*') && reqScope.startsWith(s.replace(':*', '')));
        });

        if (!hasAllScopes) {
          return res.status(403).json({
            success: false,
            error: `API key lacks required permission scopes: ${requiredScopes.join(', ')}`,
            code: 'INSUFFICIENT_SCOPES',
            requiredScopes,
            providedScopes: keyScopes
          });
        }

        // Update last_used_at asynchronously
        supabase
          .from('developer_api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', keyRecord.id)
          .then(() => {})
          .catch(() => {});

        req.authType = 'api_key';
        req.apiKey = keyRecord;
        req.user = { id: keyRecord.user_id, organizationId: keyRecord.organization_id, role: 'developer' };
        return next();
      }

      // 2. Fallback to existing Session / JWT Auth
      const { requireAuth } = require('./auth');
      return requireAuth(req, res, next);
    } catch (err) {
      console.error('[APIKeyAuth] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_INTERNAL_ERROR'
      });
    }
  };
};

module.exports = {
  hashApiKey,
  generateApiKey,
  requireApiKeyOrAuth
};
