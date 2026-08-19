describe('PromoPilot worker signing', () => {
  const originalSecret = process.env.PROMOPILOT_SIGNING_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.PROMOPILOT_SIGNING_SECRET;
    else process.env.PROMOPILOT_SIGNING_SECRET = originalSecret;
    jest.resetModules();
  });

  test('creates a stable opaque token from the idempotency key', () => {
    process.env.PROMOPILOT_SIGNING_SECRET = 'test-signing-secret';
    const { tokenFor } = require('../../services/promoPilotWorkerService');
    const first = tokenFor({ idempotency_key: 'campaign:qr:v1' });
    const second = tokenFor({ idempotency_key: 'campaign:qr:v1' });

    expect(first).toBe(second);
    expect(first).toHaveLength(32);
    expect(first).not.toContain('campaign');
  });

  test('separates tokens for different execution jobs', () => {
    process.env.PROMOPILOT_SIGNING_SECRET = 'test-signing-secret';
    const { tokenFor } = require('../../services/promoPilotWorkerService');

    expect(tokenFor({ idempotency_key: 'campaign:qr:v1' }))
      .not.toBe(tokenFor({ idempotency_key: 'campaign:qr:v2' }));
  });
});
