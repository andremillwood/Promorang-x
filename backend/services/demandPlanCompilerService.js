const VERSION = '2026-08-06';

const includesAny = (text, words) => words.some((word) => text.includes(word));

function classifyGoal(statement) {
  const text = statement.toLowerCase();
  if (includesAny(text, ['return', 'come back', 'repeat', 'loyal'])) return 'build_loyalty';
  if (includesAny(text, ['community', 'volunteer', 'donate', 'church', 'cause', 'awareness'])) return 'mobilize_community';
  if (includesAny(text, ['refer', 'invite', 'friend', 'word of mouth'])) return 'grow_referrals';
  if (includesAny(text, ['post', 'content', 'video', 'share', 'reaction'])) return 'create_content';
  if (includesAny(text, ['sell', 'sales', 'purchase', 'buy', 'orders', 'revenue'])) return 'drive_sales';
  return 'bring_people';
}

function extractTargetCount(statement) {
  const match = statement.match(/\b(\d{1,5})\b/);
  return match ? Number(match[1]) : null;
}

function goalConfig(goal) {
  const configs = {
    bring_people: { title: 'Bring the right people in', publicType: 'moment', action: 'visit', actionLabel: 'Visit and take part', proof: 'qr', outcome: 'Verified visits', event: 'verified_visit' },
    drive_sales: { title: 'Turn interest into real purchases', publicType: 'offer', action: 'purchase', actionLabel: 'Make a qualifying purchase', proof: 'receipt', outcome: 'Verified purchases', event: 'verified_purchase' },
    create_content: { title: 'Invite people to tell the story', publicType: 'mission', action: 'create', actionLabel: 'Create and submit original content', proof: 'link', outcome: 'Verified published stories', event: 'verified_content' },
    grow_referrals: { title: 'Help good experiences travel', publicType: 'program', action: 'refer', actionLabel: 'Invite someone who participates', proof: 'api', outcome: 'Activated referrals', event: 'referral_activated' },
    build_loyalty: { title: 'Give people a reason to return', publicType: 'program', action: 'return', actionLabel: 'Return for the next experience', proof: 'qr', outcome: 'Verified return visits', event: 'repeat_outcome' },
    mobilize_community: { title: 'Bring the community together', publicType: 'program', action: 'join', actionLabel: 'Join and complete the community action', proof: 'human_review', outcome: 'Verified community participation', event: 'verified_participation' },
  };
  return configs[goal];
}

function compileDemandPlan(input = {}) {
  const statement = String(input.statement || input.prompt || '').trim();
  if (statement.length < 10) throw new Error('Describe what you want to make happen in at least 10 characters');

  const goal = input.goal || classifyGoal(statement);
  const config = goalConfig(goal);
  if (!config) throw new Error(`Unsupported campaign goal: ${goal}`);

  const targetCount = input.targetCount || extractTargetCount(statement);
  const businessName = String(input.businessName || '').trim() || undefined;
  const audience = String(input.audience || '').trim() || 'People who are a natural fit for this experience';
  const primaryValue = goal === 'mobilize_community' ? 'promopoints' : goal === 'build_loyalty' ? 'promokey' : 'gems';
  const confidence = input.comparableCampaignCount >= 10 ? 'medium' : 'low';
  const expected = targetCount || null;

  const plan = {
    version: VERSION,
    status: 'draft',
    title: businessName ? `${config.title} — ${businessName}` : config.title,
    promise: String(input.promise || '').trim() || statement,
    intent: {
      statement,
      goal,
      businessName,
      targetCount,
      timeframe: input.timeframe || undefined,
      location: input.location || undefined,
      audience: input.audience || undefined,
      constraints: Array.isArray(input.constraints) ? input.constraints : [],
    },
    people: { audience, participantLimit: targetCount, eligibility: Array.isArray(input.eligibility) ? input.eligibility : [] },
    experience: {
      publicType: config.publicType,
      invitation: statement,
      actions: [
        { id: 'discover', type: 'discover', label: 'Discover the invitation', required: false },
        { id: config.action, type: config.action, label: config.actionLabel, required: true, proof: config.proof },
        { id: 'review', type: 'review', label: 'Share an honest reflection', required: false, proof: 'api' },
        { id: 'refer', type: 'refer', label: 'Invite someone who would value it', required: false, proof: 'api' },
      ],
    },
    sharedValue: [
      { type: primaryValue, reason: primaryValue === 'promopoints' ? 'Recognize meaningful contribution' : primaryValue === 'promokey' ? 'Unlock the next relationship benefit' : 'Fund a clear participant benefit', amount: primaryValue === 'promopoints' ? (input.promoPoints || 50) : (input.rewardAmount || null), unit: primaryValue, fundingRequired: primaryValue === 'gems', enabled: true },
      { type: 'promopoints', reason: 'Record verified contribution and progress', amount: input.promoPoints || 50, unit: 'points', fundingRequired: false, enabled: true },
      { type: 'memory', reason: 'Keep a record of verified participation', fundingRequired: false, enabled: true },
      { type: 'piece', reason: 'Optionally recognize a stake in what participants help grow', fundingRequired: false, optional: true, enabled: false },
      { type: 'promokey', reason: 'Optionally unlock access or a return benefit', fundingRequired: false, optional: true, enabled: primaryValue === 'promokey' },
      { type: 'promoshare', reason: 'Optionally share campaign upside with qualified participation', fundingRequired: true, optional: true, enabled: false },
    ],
    distribution: [
      { channel: 'pulse', reason: 'Help relevant people discover it', enabled: true },
      { channel: 'promopush', reason: 'Add managed reach when organic demand is insufficient', enabled: false },
      { channel: 'creator', reason: 'Use trusted category voices', enabled: goal === 'create_content' },
      { channel: 'community', reason: 'Reach groups with a natural reason to participate', enabled: goal === 'mobilize_community' },
      { channel: 'whatsapp', reason: 'Coordinate direct and group invitations', enabled: true },
      { channel: 'qr', reason: 'Connect physical discovery and fulfillment', enabled: ['bring_people', 'drive_sales', 'build_loyalty'].includes(goal) },
      { channel: 'referral', reason: 'Let satisfied participants bring the next person', enabled: true },
    ],
    returnPath: { reviewPrompt: true, referralPrompt: true, loyaltyFollowUp: true, nextInvitation: 'Invite verified participants into the next relevant experience' },
    measurement: {
      primaryOutcome: config.outcome,
      successEvent: config.event,
      supportingEvents: ['campaign_viewed', 'campaign_saved', 'campaign_joined', 'proof_submitted', 'review_created', 'referral_activated'],
      guardrails: ['proof_rejected', 'reward_reversed', 'participant_complaint', 'capacity_exceeded'],
      forecast: {
        low: expected ? Math.max(1, Math.round(expected * 0.6)) : null,
        expected,
        high: expected ? Math.round(expected * 1.2) : null,
        unit: config.outcome.toLowerCase(),
        confidence,
        basis: confidence === 'low' ? 'Intent target only; comparable verified campaign evidence is not yet sufficient' : 'Comparable verified campaign cohort',
      },
    },
    readiness: { state: 'needs_details', missing: [], warnings: ['Forecasts are planning ranges, not guarantees'] },
    generatedAt: new Date().toISOString(),
  };

  const seenValueTypes = new Set();
  plan.sharedValue = plan.sharedValue.filter((value) => {
    if (seenValueTypes.has(value.type)) return false;
    seenValueTypes.add(value.type);
    return true;
  });

  if (!businessName) plan.readiness.missing.push('Confirm the organization running this campaign');
  if (!input.timeframe) plan.readiness.missing.push('Confirm when this should happen');
  if (!input.location && ['bring_people', 'drive_sales'].includes(goal)) plan.readiness.missing.push('Confirm where people should go');
  if (plan.sharedValue.some((value) => value.enabled && value.fundingRequired && value.optional !== true)) plan.readiness.missing.push('Choose and secure funded campaign value');
  plan.readiness.state = plan.readiness.missing.includes('Choose and secure funded campaign value') ? 'needs_funding' : plan.readiness.missing.length ? 'needs_approval' : 'ready';

  return plan;
}

module.exports = { VERSION, classifyGoal, compileDemandPlan };
