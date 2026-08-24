const { describe, it } = require('node:test');
const assert = require('node:assert');
const { hashApiKey, generateApiKey } = require('../middleware/apiKeyAuth');

describe('Developer API Key Authentication & Hashing', () => {
  it('should generate valid API key pairs with secret and hash', () => {
    const { rawKey, record } = generateApiKey({
      prefix: 'pk_live_',
      name: 'Agent Test Key',
      scopes: ['feed:read', 'coupons:claim'],
      environment: 'production',
      userId: 'test-user-123'
    });

    assert.ok(rawKey.startsWith('pk_live_'), 'Raw key must start with prefix');
    assert.strictEqual(record.name, 'Agent Test Key');
    assert.deepStrictEqual(record.scopes, ['feed:read', 'coupons:claim']);
    assert.strictEqual(record.is_active, true);

    const calculatedHash = hashApiKey(rawKey);
    assert.strictEqual(calculatedHash, record.key_hash, 'Calculated hash must match record hash');
  });

  it('should generate distinct hashes for different keys', () => {
    const key1 = generateApiKey({ userId: 'u1' });
    const key2 = generateApiKey({ userId: 'u2' });
    assert.notStrictEqual(key1.rawKey, key2.rawKey);
    assert.notStrictEqual(key1.record.key_hash, key2.record.key_hash);
  });
});
