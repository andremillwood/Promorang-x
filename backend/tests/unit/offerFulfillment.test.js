const {
  decodeOfferRedeemPayload,
  encodeOfferRedeemPayload,
  isShippingAddressComplete,
  resolveClaimPlan,
  resolveFulfillPlan,
  requiresOwnerToRedeem,
  promoCardPerkFromIssuance,
} = require('../../services/offerFulfillment');

describe('offer fulfillment helpers', () => {
  test('decodes typed codes, QR URLs, and JSON payloads', () => {
    expect(encodeOfferRedeemPayload('pr-ab12cd34')).toBe('promorang://offer/redeem/PR-AB12CD34');
    expect(decodeOfferRedeemPayload('promorang://offer/redeem/PR-AB12CD34')).toBe('PR-AB12CD34');
    expect(decodeOfferRedeemPayload('{"redemption_code":"pr-99aa"}')).toBe('PR-99AA');
    expect(decodeOfferRedeemPayload('  code-1  ')).toBe('CODE-1');
  });

  test('automatic claims redeem themselves; manual and shipping stay pending', () => {
    expect(resolveClaimPlan('automatic').autoRedeem).toBe(true);
    expect(resolveClaimPlan('manual').nextStatus).toBe('fulfillment_pending');
    expect(resolveClaimPlan('shipping').requiresShippingAddress).toBe(true);
    expect(isShippingAddressComplete({ name: 'Ada', line1: '1 Harbour', city: 'Kingston', postal_code: '1', country: 'JM' })).toBe(true);
  });

  test('shipping and manual actions are explicit journeys', () => {
    expect(resolveFulfillPlan('manual', 'confirm').redeem).toBe(true);
    expect(() => resolveFulfillPlan('shipping', 'ship', {})).toThrow(/delivery address/);
    expect(requiresOwnerToRedeem('qr')).toBe(true);
    expect(requiresOwnerToRedeem('automatic')).toBe(false);
  });

  test('PromoCard perks carry the live offer journey', () => {
    const perk = promoCardPerkFromIssuance({
      id: 'iss-9',
      status: 'claimed',
      redemption_code: 'PR-CARD09',
      fulfillment_data: {},
      offers: { title: 'Welcome drink', fulfillment_type: 'qr', reward_type: 'voucher' },
    });
    expect(perk.issuance.offers.fulfillment_type).toBe('qr');
    expect(perk.redemptionCode).toBe('PR-CARD09');
  });
});
