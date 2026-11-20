// Stripe handlers must merge onto commerce order metadata.
// Replacing the object drops moment_id and the PromoCard benefit fields.

function mergeCommerceOrderMetadata(existing, patch) {
  const base = existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {};
  return { ...base, ...(patch || {}) };
}

module.exports = { mergeCommerceOrderMetadata };
