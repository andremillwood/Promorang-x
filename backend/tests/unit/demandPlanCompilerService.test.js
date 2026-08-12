const { classifyGoal, compileDemandPlan } = require('../../services/demandPlanCompilerService');

describe('demand plan compiler', () => {
  test('classifies human demand intent', () => {
    expect(classifyGoal('Bring 20 people to lunch on Tuesday')).toBe('bring_people');
    expect(classifyGoal('Get existing guests to come back')).toBe('build_loyalty');
    expect(classifyGoal('Mobilize our church community to volunteer')).toBe('mobilize_community');
  });

  test('keeps the Promorang economy distinct inside one executable plan', () => {
    const plan = compileDemandPlan({ statement: 'Bring 20 people to lunch on Tuesday', businessName: "Pat's Place", location: 'Kingston', timeframe: 'Tuesday lunch' });
    expect(plan.intent.targetCount).toBe(20);
    expect(plan.experience.actions.some((action) => action.proof)).toBe(true);
    expect(plan.sharedValue.map((value) => value.type)).toEqual(expect.arrayContaining(['gems', 'promopoints', 'piece', 'promokey', 'memory', 'promoshare']));
    expect(new Set(plan.sharedValue.map((value) => value.type)).size).toBe(plan.sharedValue.length);
    expect(plan.distribution.map((item) => item.channel)).toEqual(expect.arrayContaining(['pulse', 'promopush', 'whatsapp', 'qr']));
    expect(plan.measurement.successEvent).toBe('verified_visit');
  });

  test('does not duplicate the primary value system', () => {
    const community = compileDemandPlan({ statement: 'Mobilize our community to volunteer this weekend' });
    expect(community.sharedValue.filter((value) => value.type === 'promopoints')).toHaveLength(1);
  });
});
