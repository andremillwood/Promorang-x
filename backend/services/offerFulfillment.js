function encodeOfferRedeemPayload(code) {
  return `promorang://offer/redeem/${String(code || '').trim().toUpperCase()}`;
}

function decodeOfferRedeemPayload(raw) {
  if (raw == null) return '';
  const text = String(raw).trim();
  if (!text) return '';
  const urlMatch = text.match(/(?:promorang:\/\/offer\/redeem\/|\/offers\/redeem\?code=|[?&]code=)([A-Z0-9-]+)/i);
  if (urlMatch && urlMatch[1]) return urlMatch[1].toUpperCase();
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const nested = parsed.code || parsed.redemption_code || parsed.redemptionCode;
      if (nested) return String(nested).trim().toUpperCase();
    } catch {
      // keep raw text
    }
  }
  return text.toUpperCase();
}

function isShippingAddressComplete(address) {
  if (!address || typeof address !== 'object') return false;
  return ['name', 'line1', 'city', 'postal_code', 'country'].every((key) => String(address[key] || '').trim());
}

function resolveClaimPlan(fulfillmentType, fulfillmentData = {}) {
  const type = fulfillmentType || 'code';
  if (type === 'automatic') {
    return { nextStatus: 'claimed', autoRedeem: true, requiresShippingAddress: false, shippingStage: null };
  }
  if (type === 'manual') {
    return { nextStatus: 'fulfillment_pending', autoRedeem: false, requiresShippingAddress: false, shippingStage: null };
  }
  if (type === 'shipping') {
    const complete = isShippingAddressComplete(fulfillmentData.shipping_address);
    return {
      nextStatus: 'fulfillment_pending',
      autoRedeem: false,
      requiresShippingAddress: !complete,
      shippingStage: complete ? 'ready_to_ship' : 'awaiting_address',
    };
  }
  return { nextStatus: 'claimed', autoRedeem: false, requiresShippingAddress: false, shippingStage: null };
}

function resolveFulfillPlan(fulfillmentType, action, fulfillmentData = {}) {
  const type = fulfillmentType || 'code';
  if (type === 'manual' && (action === 'confirm' || action === 'redeem')) {
    return { redeem: true, event: 'redeemed', stage: 'confirmed' };
  }
  if (type === 'shipping' && action === 'ship') {
    if (!isShippingAddressComplete(fulfillmentData.shipping_address)) {
      throw new Error('A delivery address is required before shipping');
    }
    if (!String(fulfillmentData.tracking_number || '').trim()) {
      throw new Error('Add a tracking number to mark this shipped');
    }
    return { redeem: false, event: 'fulfillment_updated', stage: 'shipped' };
  }
  if (type === 'shipping' && action === 'deliver') {
    return { redeem: true, event: 'redeemed', stage: 'delivered' };
  }
  throw new Error('This fulfillment action is not available');
}

function requiresOwnerToRedeem(fulfillmentType) {
  return fulfillmentType === 'merchant_validation' || fulfillmentType === 'qr';
}

function promoCardPerkFromIssuance(row) {
  const offers = row.offers || {};
  const issuance = {
    id: row.id,
    status: row.status,
    redemption_code: row.redemption_code || '',
    issued_at: row.issued_at,
    claimed_at: row.claimed_at,
    redeemed_at: row.redeemed_at,
    expires_at: row.expires_at,
    fulfillment_data: row.fulfillment_data || {},
    offers: {
      id: offers.id,
      title: offers.title || 'Perk',
      description: offers.description || '',
      reward_type: offers.reward_type,
      fulfillment_type: offers.fulfillment_type || 'code',
      value_amount: offers.value_amount ?? null,
      value_currency: offers.value_currency ?? null,
    },
  };
  return {
    id: row.id,
    source: 'offer_issuance',
    title: issuance.offers.title,
    detail: issuance.offers.description || '',
    kind: issuance.offers.reward_type || 'custom',
    status: row.status,
    redemptionCode: issuance.redemption_code || null,
    expiresAt: row.expires_at || null,
    fulfillmentType: issuance.offers.fulfillment_type,
    fulfillmentData: issuance.fulfillment_data,
    valueAmount: issuance.offers.value_amount,
    valueCurrency: issuance.offers.value_currency,
    issuance,
  };
}

module.exports = {
  encodeOfferRedeemPayload,
  decodeOfferRedeemPayload,
  isShippingAddressComplete,
  resolveClaimPlan,
  resolveFulfillPlan,
  requiresOwnerToRedeem,
  promoCardPerkFromIssuance,
};
