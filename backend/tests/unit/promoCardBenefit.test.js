const {
  toPromoCardBenefit,
  canUseBenefit,
  selectUseThis,
  selectNextBenefit,
  summarizeRepeatUse,
  contributorRewardAmount,
  loopProgress,
} = require('../../services/peopleExperienceService');

test('every card benefit carries issuer, eligibility, quantity, expiry, fulfillment and redemption', () => {
  const benefit = toPromoCardBenefit({
    id: 'iss-1',
    offer: {
      id: 'offer-1',
      title: 'Friday tasting',
      description: 'One complimentary tasting',
      owner_user_id: 'merchant-1',
      owner_type: 'merchant',
      fulfillment_type: 'merchant_validation',
      quantity_total: 20,
      quantity_reserved: 4,
      quantity_redeemed: 3,
      per_user_limit: 1,
      value_amount: 15,
      value_currency: 'JMD',
      reward_type: 'coupon',
      ends_at: '2026-12-01T00:00:00.000Z',
      metadata: { location: 'Barbican', min_spend: 3000, merchant_name: 'Yardbird' },
    },
    issuance: {
      id: 'iss-1',
      status: 'claimed',
      redemption_code: 'PR-ABC123',
      expires_at: '2026-10-01T00:00:00.000Z',
      metadata: { contributor_id: 'amb-1' },
    },
    issuerName: 'Yardbird',
    sharedBy: { id: 'amb-1', name: 'Keisha' },
  });

  expect(benefit.issuer).toMatchObject({ id: 'merchant-1', type: 'merchant', name: 'Yardbird' });
  expect(benefit.rewardType).toBe('coupon');
  expect(benefit.valueAmount).toBe(15);
  expect(benefit.valueCurrency).toBe('JMD');
  expect(benefit.locationLabel).toBe('Barbican');
  expect(benefit.minSpend).toBe(3000);
  expect(benefit.eligibility.remaining).toBe(13);
  expect(benefit.availableQuantity).toBe(13);
  expect(benefit.budget).toBe(195);
  expect(benefit.expiresAt).toBe('2026-10-01T00:00:00.000Z');
  expect(benefit.fulfillmentState).toBe('claimed');
  expect(benefit.redemption).toEqual({
    recorded: false,
    code: 'PR-ABC123',
    redeemedAt: null,
    redeemedBy: null,
  });
  expect(canUseBenefit(benefit)).toBe(true);
});

test('issued journeys hide the door code; shipping is still an actionable card perk', () => {
  const issued = toPromoCardBenefit({
    id: 'iss-issued',
    offer: { id: 'offer-2', owner_user_id: 'm1', fulfillment_type: 'merchant_validation' },
    issuance: { id: 'iss-issued', status: 'issued', redemption_code: 'PR-HIDDEN' },
  });
  const shipping = toPromoCardBenefit({
    id: 'iss-ship',
    offer: { id: 'offer-3', owner_user_id: 'm1', fulfillment_type: 'shipping' },
    issuance: { id: 'iss-ship', status: 'claimed', redemption_code: 'PR-SHIP01' },
  });
  expect(issued.redemption.code).toBe(null);
  expect(canUseBenefit(issued)).toBe(false);
  expect(shipping.redemption.code).toBe(null);
  expect(canUseBenefit(shipping)).toBe(true);
  expect(issued.issuance.redemption_code).toBe('PR-HIDDEN');
  expect(shipping.issuance).toMatchObject({
    id: 'iss-ship',
    redemption_code: 'PR-SHIP01',
    offers: { fulfillment_type: 'shipping' },
  });
});

test('QR stays off the copy-code path but is still the card’s use-this pass', () => {
  const qr = toPromoCardBenefit({
    id: 'iss-qr',
    offer: { id: 'offer-qr', title: 'Slow-hour coffee', owner_user_id: 'm1', fulfillment_type: 'qr' },
    issuance: { id: 'iss-qr', status: 'claimed', redemption_code: 'PR-QR01' },
  });
  expect(qr.redemption.code).toBe(null);
  expect(canUseBenefit(qr)).toBe(true);
  expect(qr.issuance.redemption_code).toBe('PR-QR01');
  expect(qr.issuance.offers.fulfillment_type).toBe('qr');
});

test('a claimed perk is not complete until the merchant records redemption', () => {
  const claimed = toPromoCardBenefit({
    id: 'iss-2',
    offer: { id: 'offer-2', owner_user_id: 'm1', fulfillment_type: 'merchant_validation' },
    issuance: { id: 'iss-2', status: 'claimed', redemption_code: 'PR-USED01' },
  });
  const redeemed = toPromoCardBenefit({
    id: 'iss-3',
    offer: { id: 'offer-2', owner_user_id: 'm1', fulfillment_type: 'merchant_validation' },
    issuance: { id: 'iss-3', status: 'redeemed', redeemed_at: '2026-09-05T12:00:00.000Z', redeemed_by: 'm1' },
  });
  expect(canUseBenefit(claimed)).toBe(true);
  expect(canUseBenefit(redeemed)).toBe(false);
  expect(redeemed.redemption.recorded).toBe(true);
});

test('card actions prefer use this, then nearby, then the next benefit', () => {
  const useThis = toPromoCardBenefit({
    id: 'iss-1',
    offer: { id: 'offer-1', owner_user_id: 'm1' },
    issuance: { status: 'claimed', redemption_code: 'PR-1' },
  });
  const nearby = [toPromoCardBenefit({
    id: 'offer-2',
    offer: { id: 'offer-2', owner_user_id: 'm2', status: 'active', quantity_total: 5, quantity_reserved: 0, quantity_redeemed: 0 },
  })];
  expect(selectUseThis([useThis])).toEqual(useThis);
  expect(selectNextBenefit(nearby, useThis).offerId).toBe('offer-2');
});

test('an aimed card prefers the matching claimed perk', () => {
  const nightlife = toPromoCardBenefit({
    id: 'iss-night',
    offer: { id: 'offer-night', title: '20% tab after dark', owner_user_id: 'm3', fulfillment_type: 'code' },
    issuance: { status: 'claimed', redemption_code: 'PR-NIGHT' },
    issuerName: 'Tracks',
  });
  const food = toPromoCardBenefit({
    id: 'iss-food',
    offer: { id: 'offer-food', title: 'Jerk platter', owner_user_id: 'm4', fulfillment_type: 'code' },
    issuance: { status: 'claimed', redemption_code: 'PR-FOOD' },
    issuerName: 'Yardbird',
  });
  expect(selectUseThis([food, nightlife], { keywords: ['after dark', 'tab'] }).id).toBe('iss-night');
  expect(selectUseThis([food, nightlife]).id).toBe('iss-food');
});

test('repeat-use proof counts first redemption, second use, referred redeemers and contributor rewards', () => {
  const proof = summarizeRepeatUse([
    { userId: 'a', merchantId: 'm1', referrerId: 'amb-1', contributorId: 'amb-1', contributorPoints: 25 },
    { userId: 'a', merchantId: 'm1', referrerId: 'amb-1', contributorId: 'amb-1', contributorPoints: 25 },
    { userId: 'b', merchantId: 'm2' },
  ]);
  expect(proof).toMatchObject({
    firstRedemptions: 1,
    secondUses: 1,
    referredUsersWhoRedeem: 1,
    merchantOutcomes: { participatingBusinesses: 2, verifiedRedemptions: 3, uniqueCustomers: 2 },
    contributorRewards: { rewardedContributors: 1, pointsAwarded: 50 },
  });
  expect(contributorRewardAmount({ value_amount: 12 })).toBe(12);
  expect(loopProgress({ supplied: true, shared: true }).current).toBe('member_claimed');
});
