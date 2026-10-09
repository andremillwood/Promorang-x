const OUTCOMES = new Set(['bring-people-in','try-it','launch','move-this','quiet-period','bring-back','learn-demand','word-of-mouth']);
const TYPES = new Set(['place','consumer-brand','online','event','service','other']);
const ACTIONS = new Set(['visits','purchases','trials','registrations','reservations','attendance','reviews','referrals','repeat-visits','other']);
const text = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';

function validateBusinessBrief(input) {
  if (!input || !OUTCOMES.has(input.outcomeId) || !TYPES.has(input.businessType) || !ACTIONS.has(input.successAction)) {
    throw new Error('Choose a valid business outcome, business type, and success action');
  }
  const target = input.target == null ? null : Number(input.target);
  if (target !== null && (!Number.isFinite(target) || target < 1 || target > 1000000)) throw new Error('Enter a target between 1 and 1,000,000');
  const role = input.businessType === 'event' ? 'host' : ['place','service'].includes(input.businessType) ? 'merchant' : 'brand';
  const brief = {
    version: 1, id: text(input.id, 160), createdAt: new Date().toISOString(), outcomeId: input.outcomeId,
    businessType: input.businessType, successAction: input.successAction, target,
    timeframe: text(input.timeframe, 200), geography: text(input.geography, 200),
    audience: text(input.audience, 1000), availableValue: text(input.availableValue, 2000),
    programmeId: input.outcomeId === 'bring-people-in' ? (input.businessType === 'event' ? 'fill-the-room' : 'first-50')
      : ({ 'try-it': 'try-this', launch: 'first-50', 'move-this': 'move-this', 'quiet-period': 'quiet-hours', 'bring-back': 'bring-them-back', 'learn-demand': 'what-do-they-want', 'word-of-mouth': 'tell-somebody' }[input.outcomeId]),
  };
  return { role, funnelKey: { merchant: 'demand', host: 'moment', brand: 'sponsor' }[role], brief };
}

module.exports = { validateBusinessBrief };
