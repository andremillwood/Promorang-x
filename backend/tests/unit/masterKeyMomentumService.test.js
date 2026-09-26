const service = require('../../services/masterKeyMomentumService');

describe('masterKeyMomentumService', () => {
  test('does not unlock from repetitive low-trust activity', () => {
    const rows = Array.from({ length: 60 }, (_, index) => ({
      id: String(index),
      action_type: 'DISCOVERY_RESPONSE',
      created_at: new Date().toISOString(),
    }));
    const status = service.summarize(rows);
    expect(status.qualificationCredits).toBe(120);
    expect(status.behaviourCategories).toBe(1);
    expect(status.earned).toBe(false);
  });

  test('earns only with varied verified participation and downstream movement', () => {
    const now = new Date().toISOString();
    const rows = [
      ...Array.from({ length: 20 }, (_, i) => ({ id: `d-${i}`, action_type: 'DISCOVERY_RESPONSE', created_at: now })),
      ...Array.from({ length: 5 }, (_, i) => ({ id: `c-${i}`, action_type: 'CONTENT_POST', created_at: now })),
      { id: 'a1', action_type: 'MOMENT_ATTENDANCE', created_at: now },
      { id: 'a2', action_type: 'PURCHASE', created_at: now },
      { id: 'a3', action_type: 'PERK_REDEMPTION', created_at: now },
      { id: 'r1', action_type: 'referral_activated', created_at: now },
    ];
    const status = service.summarize(rows);
    expect(status.earned).toBe(true);
    expect(status.status).toBe('active');
    expect(status.verifiedMoves).toBeGreaterThanOrEqual(3);
    expect(status.downstreamActions).toBeGreaterThanOrEqual(1);
  });

  test('keeps earned achievement but makes stale activity dormant', () => {
    const old = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
    const rows = [
      ...Array.from({ length: 20 }, (_, i) => ({ id: `d-${i}`, action_type: 'DISCOVERY_RESPONSE', created_at: old })),
      ...Array.from({ length: 5 }, (_, i) => ({ id: `c-${i}`, action_type: 'CONTENT_POST', created_at: old })),
      { id: 'a1', action_type: 'MOMENT_ATTENDANCE', created_at: old },
      { id: 'a2', action_type: 'PURCHASE', created_at: old },
      { id: 'a3', action_type: 'PERK_REDEMPTION', created_at: old },
      { id: 'r1', action_type: 'referral_activated', created_at: old },
    ];
    const status = service.summarize(rows);
    expect(status.earned).toBe(true);
    expect(status.momentum).toBe(0);
    expect(status.status).toBe('dormant');
  });
});
