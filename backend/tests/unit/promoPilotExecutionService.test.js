const { buildExecutionSpecs, summarize } = require('../../services/promoPilotExecutionService');

const plan = {
  intent: { goal: 'bring_people', timeframe: 'Friday evening', location: 'Kingston' },
  people: { audience: 'Nearby food lovers', participantLimit: 20 },
  experience: { invitation: 'Join Friday dinner', actions: [{ id: 'visit', type: 'visit', label: 'Visit', required: true, proof: 'qr' }] },
  shared_value: [
    { type: 'gems', amount: 10, fundingRequired: true, enabled: true },
    { type: 'promopoints', amount: 50, fundingRequired: false, enabled: true },
    { type: 'piece', fundingRequired: false, optional: true, enabled: true },
  ],
  distribution: [
    { channel: 'pulse', enabled: true },
    { channel: 'whatsapp', enabled: true },
    { channel: 'qr', enabled: true },
    { channel: 'promopush', enabled: false },
  ],
  return_path: { reviewPrompt: true, loyaltyFollowUp: true, nextInvitation: 'Come back next Friday' },
  measurement: { primaryOutcome: 'Verified visits', successEvent: 'verified_visit' },
};

describe('PromoPilot execution manifest', () => {
  test('materializes selected systems without enabling unselected channels', () => {
    const specs = buildExecutionSpecs(plan);
    expect(specs.map((item) => item.systemName)).toEqual(expect.arrayContaining(['pulse', 'whatsapp', 'qr', 'gems', 'promopoints', 'pieces', 'reviews', 'journeys', 'growth_events']));
    expect(specs.map((item) => item.systemName)).not.toContain('promopush');
    expect(specs.every((item) => ['ready', 'blocked'].includes(item.status))).toBe(true);
  });

  test('blocks funded value without a configured amount', () => {
    const specs = buildExecutionSpecs({ ...plan, shared_value: [{ type: 'gems', amount: 0, fundingRequired: true, enabled: true }] });
    expect(specs.find((item) => item.systemName === 'gems')).toMatchObject({ status: 'blocked', required: true });
  });

  test('summarizes operational state', () => {
    expect(summarize([{ status: 'ready', required: true }, { status: 'blocked', required: false }])).toMatchObject({ total: 2, required: 1, ready: 1, blocked: 1 });
  });
});
