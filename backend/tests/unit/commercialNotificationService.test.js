jest.mock('../../lib/supabase', () => ({ supabase: null }));

const service = require('../../services/commercialNotificationService');

describe('commercial notification consent', () => {
  afterEach(() => { delete global.supabase; });

  test('demand response requires explicit consent', async () => {
    global.supabase = fakeDb({ demand_response_enabled: false, activation_lifecycle_enabled: true });
    await expect(service.emit({ userId: 'person', kind: 'demand_response', type: 'response', title: 'Response', dedupeKey: 'one' })).resolves.toEqual({ sent: false, reason: 'consent' });
  });

  test('lifecycle notifications respect an explicit opt out', async () => {
    global.supabase = fakeDb({ demand_response_enabled: true, activation_lifecycle_enabled: false });
    await expect(service.emit({ userId: 'person', kind: 'activation_lifecycle', type: 'funded', title: 'Funded', dedupeKey: 'two' })).resolves.toEqual({ sent: false, reason: 'consent' });
  });
});

function fakeDb(preferences) {
  return { from(table) { if (table !== 'commercial_notification_preferences') throw new Error('unexpected table'); return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: preferences, error: null }) }; } };
}
