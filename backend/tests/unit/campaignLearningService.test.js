const { templateBlueprint, confidenceFor, buildRecommendations } = require('../../services/campaignLearningService');

describe('Campaign learning', () => {
  test('removes dates, locations, audiences and outcome claims from reusable patterns', () => {
    const blueprint = templateBlueprint({ version: '1', intent: { goal: 'drive_sales', location: 'Kingston', timeframe: 'Friday' }, people: { audience: 'students' }, experience: { publicType: 'promotion', actions: [{ type: 'buy' }] }, shared_value: [{ type: 'promopoints', amount: 50 }], distribution: [{ channel: 'qr', enabled: true }], return_path: { reviewPrompt: true }, measurement: { successEvent: 'purchase_completed' } });
    expect(blueprint.goal).toBe('drive_sales');
    expect(JSON.stringify(blueprint)).not.toContain('Kingston');
    expect(JSON.stringify(blueprint)).not.toContain('Friday');
    expect(JSON.stringify(blueprint)).not.toContain('students');
    expect(JSON.stringify(blueprint)).not.toContain('50');
  });

  test('refuses confidence before enough behavior exists', () => {
    expect(confidenceFor(9)).toBe('insufficient');
    expect(confidenceFor(30)).toBe('medium');
    expect(confidenceFor(100)).toBe('high');
  });

  test('diagnoses instrumentation before suggesting campaign optimization', () => {
    const items = buildRecommendations({ total_events: 0, counts: {}, rates: {} }, {});
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ category: 'instrumentation', confidence: 'insufficient' });
  });

  test('uses funnel evidence to recommend the constrained step', () => {
    const items = buildRecommendations({ total_events: 100, counts: { discovery: 100, interest: 10, participation: 2, conversion: 0, review: 0, loyalty: 0 }, rates: { discovery_to_interest: 10, interest_to_participation: 20, participation_to_conversion: 0, conversion_to_review: 0, conversion_to_loyalty: 0 } }, {});
    expect(items.map((item) => item.recommendationKey)).toContain('strengthen-invitation');
    expect(items.find((item) => item.recommendationKey === 'strengthen-invitation').confidence).toBe('high');
  });
});
