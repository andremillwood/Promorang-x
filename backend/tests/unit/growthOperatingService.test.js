const growth = require('../../services/growthOperatingService');

describe('growth operating system contracts', () => {
  test('accepts a canonical anonymous acquisition event', () => {
    expect(() => growth.validateEvent({
      eventName: 'page_view', journey: 'participant', stage: 'acquired', anonymousId: 'anon-1',
    }, { publicRequest: true })).not.toThrow();
  });

  test('rejects sensitive outcome events from anonymous public ingestion', () => {
    expect(() => growth.validateEvent({
      eventName: 'verified_outcome', journey: 'participant', stage: 'outcome', anonymousId: 'anon-1',
    }, { publicRequest: true })).toThrow('Authentication required');
  });

  test('requires a stable anonymous or authenticated identity', () => {
    expect(() => growth.validateEvent({
      eventName: 'cta_clicked', journey: 'participant', stage: 'captured',
    })).toThrow('anonymousId or authenticated user');
  });

  test('assigns experiment variants deterministically', () => {
    const experiment = {
      experiment_key: 'activation-copy', allocation_percent: 100,
      variants: [{ key: 'control', weight: 1 }, { key: 'treatment', weight: 1 }],
    };
    const first = growth.chooseVariant('anon-42', experiment);
    expect(['control', 'treatment']).toContain(first);
    expect(growth.chooseVariant('anon-42', experiment)).toBe(first);
  });

  test('honors zero experiment allocation', () => {
    expect(growth.chooseVariant('anon-42', {
      experiment_key: 'off', allocation_percent: 0, variants: ['control', 'treatment'],
    })).toBeNull();
  });
});
