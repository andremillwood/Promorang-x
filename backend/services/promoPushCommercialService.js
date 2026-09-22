const OBJECTIVES = new Set([
  'awareness', 'signups', 'foot_traffic', 'ticket_sales', 'redemptions',
  'product_trial', 'leads', 'content_creation', 'sales',
]);
const PUSH_MODES = new Set(['organic', 'geo', 'people', 'live', 'full']);
const REWARD_TYPES = new Set(['discount', 'free_item', 'ticket', 'sample', 'upgrade', 'gems', 'exclusive_access', 'none']);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePromoPushCommercialInput(body = {}) {
  const objectiveType = text(body.objective_type);
  const pushMode = text(body.push_mode);
  const rewardType = text(body.reward_type || 'none');
  const fulfillmentKit = body.fulfillment_kit && typeof body.fulfillment_kit === 'object'
    ? body.fulfillment_kit
    : {};

  return {
    objective_type: objectiveType,
    push_mode: pushMode,
    reward_type: rewardType,
    package_code: text(body.package_code) || pushMode,
    fulfillment_kit: fulfillmentKit,
    distribution_config: body.distribution_config && typeof body.distribution_config === 'object'
      ? body.distribution_config
      : {},
    evidence_config: body.evidence_config && typeof body.evidence_config === 'object'
      ? body.evidence_config
      : {},
    pricing: body.pricing && typeof body.pricing === 'object' ? body.pricing : {},
    proposal_id: body.proposal_id || null,
  };
}

function validatePromoPushCommercialInput(input) {
  const errors = [];
  if (!OBJECTIVES.has(input.objective_type)) errors.push('Choose the outcome you want to make happen');
  if (!PUSH_MODES.has(input.push_mode)) errors.push('Choose how PROMORANG should help distribute this');
  if (!REWARD_TYPES.has(input.reward_type)) errors.push('Choose what people receive, including no reward');
  if (!text(input.fulfillment_kit?.cta)) errors.push('Add the action people should take');
  if (!text(input.fulfillment_kit?.landing_url)) errors.push('Add the destination people should reach');
  if (input.reward_type !== 'none' && !text(input.fulfillment_kit?.inventory_reference)) {
    errors.push('Connect reward inventory before launch');
  }
  return errors;
}

function isPaidPushMode(mode) {
  return mode !== 'organic';
}

module.exports = {
  OBJECTIVES,
  PUSH_MODES,
  REWARD_TYPES,
  normalizePromoPushCommercialInput,
  validatePromoPushCommercialInput,
  isPaidPushMode,
};
