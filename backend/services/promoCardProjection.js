// A card credential is an issued benefit, never a browser balance.
function projectCardPerk(row, now = Date.now()) {
  const offer = row.offers || {};
  const expiry = row.expires_at ? Date.parse(row.expires_at) : null;
  const active = ['issued', 'claimed', 'fulfillment_pending'].includes(row.status);
  const expired = active && expiry !== null && (!Number.isFinite(expiry) || expiry <= now);
  const status = expired ? 'expired' : row.status;
  const ready = Boolean(offer.id) && status === 'claimed'
    && ['code', 'merchant_validation'].includes(offer.fulfillment_type || 'code')
    && Boolean(row.redemption_code);
  return {
    id: row.id,
    offerId: row.offer_id,
    title: offer.title || 'Perk',
    detail: offer.description || '',
    terms: offer.terms || null,
    issuerId: offer.owner_user_id || null,
    issuerName: row.issuer_name || null,
    kind: offer.reward_type || 'custom',
    status,
    ready,
    section: ready ? 'ready' : ['issued', 'claimed', 'fulfillment_pending'].includes(status) ? 'pending' : 'history',
    redemptionCode: ready ? row.redemption_code : null,
    expiresAt: row.expires_at || null,
    redeemedAt: row.redeemed_at || null,
    fulfillmentType: offer.fulfillment_type || 'code',
  };
}

function summarizeAttributedValue(actions) {
  // Face value is not commission. Never add unlike currencies/reward units,
  // or assign a currency to older activity that did not record one.
  const totals = new Map();
  for (const row of actions) {
    const unit = row.action_metadata?.value_unit;
    const amount = Number(row.amount);
    if (!unit || !Number.isFinite(amount) || amount <= 0) continue;
    totals.set(unit, (totals.get(unit) || 0) + amount);
  }
  return Object.fromEntries(totals);
}

module.exports = { projectCardPerk, summarizeAttributedValue };
