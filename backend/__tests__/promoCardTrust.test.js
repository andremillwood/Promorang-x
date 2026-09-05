const { test } = require('node:test');
const assert = require('node:assert/strict');
const { projectCardPerk, summarizeAttributedValue } = require('../services/promoCardProjection');
const {
  createPeopleExperienceService,
  accountStakeholderOutcomes,
  toPromoCardBenefit,
  canUseBenefit,
} = require('../services/peopleExperienceService');

const now = Date.parse('2026-09-05T12:00:00Z');
const issued = {
  id: 'issuance-1', offer_id: 'offer-1', status: 'claimed',
  redemption_code: 'PR-REAL', expires_at: '2026-09-06T12:00:00Z',
  offers: { id: 'offer-1', title: 'Entry', owner_user_id: 'host-1', terms: 'Before 10pm', fulfillment_type: 'code' },
};

test('a claimed benefit exposes its real credential, issuer and terms', () => {
  const perk = projectCardPerk(issued, now);
  assert.equal(perk.redemptionCode, 'PR-REAL');
  assert.equal(perk.issuerId, 'host-1');
  assert.equal(perk.terms, 'Before 10pm');
  assert.equal(perk.section, 'ready');
});

for (const status of ['issued', 'redeemed', 'cancelled', 'fulfillment_pending', 'expired']) {
  test(`${status} benefits cannot present a redemption credential`, () => {
    const perk = projectCardPerk({ ...issued, status }, now);
    assert.equal(perk.ready, false);
    assert.equal(perk.redemptionCode, null);
  });
}

for (const expires_at of ['2026-09-05T12:00:00Z', '2026-09-04T12:00:00Z', 'invalid']) {
  test(`expiry ${expires_at} fails closed`, () => {
    const perk = projectCardPerk({ ...issued, expires_at }, now);
    assert.equal(perk.status, 'expired');
    assert.equal(perk.section, 'history');
    assert.equal(perk.redemptionCode, null);
  });
}

for (const fulfillment_type of ['shipping', 'manual', 'automatic', 'qr']) {
  test(`${fulfillment_type} does not masquerade as a completed code journey`, () => {
    const perk = projectCardPerk({ ...issued, offers: { ...issued.offers, fulfillment_type } }, now);
    assert.equal(perk.section, 'pending');
    assert.equal(perk.redemptionCode, null);
  });
}

test('activity value keeps units separate and never creates earnings', () => {
  const values = summarizeAttributedValue([
    { amount: 1000, action_metadata: { value_unit: 'JMD' } },
    { amount: 25, action_metadata: { value_unit: 'USD' } },
    { amount: 250, action_metadata: { value_unit: 'Gems' } },
    { amount: 500, action_metadata: { value_unit: 'JMD' } },
    { amount: 9000 }, // Unknown legacy units must not become dollars.
    { amount: -5, action_metadata: { value_unit: 'USD' } },
    { amount: 'bad', action_metadata: { value_unit: 'USD' } },
  ]);
  assert.deepEqual(values, { JMD: 1500, USD: 25, Gems: 250 });
  assert.equal(values.earned, undefined);
});

test('missing offer records never produce a usable credential', () => {
  assert.equal(projectCardPerk({ ...issued, offers: null }, now).redemptionCode, null);
});

test('live benefits hide the code until a claimed, unexpired code journey is ready', () => {
  const live = { ...issued, expires_at: '2027-09-06T12:00:00Z' };
  const claimed = toPromoCardBenefit({
    id: 'iss-1',
    offer: issued.offers,
    issuance: live,
  });
  const redeemed = toPromoCardBenefit({
    id: 'used-1',
    offer: issued.offers,
    issuance: { ...issued, id: 'used-1', status: 'redeemed', redeemed_at: '2026-09-05T11:00:00Z' },
  });
  const shipping = toPromoCardBenefit({
    id: 'ship-1',
    offer: { ...issued.offers, fulfillment_type: 'shipping' },
    issuance: live,
  });
  assert.equal(claimed.redemption.code, 'PR-REAL');
  assert.equal(canUseBenefit(claimed), true);
  assert.equal(redeemed.redemption.code, null);
  assert.equal(canUseBenefit(redeemed), false);
  assert.equal(shipping.redemption.code, null);
  assert.equal(canUseBenefit(shipping), false);
  assert.equal(shipping.issuance.redemption_code, 'PR-REAL');
  assert.equal(shipping.issuance.offers.fulfillment_type, 'shipping');
});

test('contributor outcomes count verified use rather than treating offer value as pay', () => {
  const result = accountStakeholderOutcomes({ role: 'contributor', earned: 9999, buckets: { used: 2 } });
  assert.equal(result.ledger.used, 2);
  assert.equal(summarizeAttributedValue([{ amount: 9000 }]).earned, undefined);
});

function cardDb({ failTable, active = [], history = [], drops = [] } = {}) {
  return {
    from(table) {
      let statuses;
      let statusEq;
      let ids;
      const query = {
        select() { return query; },
        eq(field, value) {
          if (field === 'status') statusEq = value;
          return query;
        },
        in(field, value) {
          if (field === 'status') statuses = value;
          if (field === 'id') ids = value;
          return query;
        },
        not() { return query; },
        order() { return query; },
        limit() { return query; },
        maybeSingle() { return query; },
        is() { return query; },
        then(resolve, reject) {
          const error = table === failTable ? new Error('Ledger unavailable') : null;
          let data = null;
          if (table === 'offer_issuances') {
            data = statusEq === 'redeemed' ? history : active;
          }
          if (table === 'user_promo_cards') data = { id: 'card-1', user_id: 'member-1' };
          if (table === 'community_drop_claims') data = drops;
          if (table === 'community_drops') data = [];
          if (table === 'offers') data = [];
          if (table === 'scene_memberships') data = [];
          if (table === 'economy_wallets') data = { points: 0, promokeys: 0, gems: 0 };
          if (table === 'users') {
            data = ids
              ? ids.map((id) => ({ id, full_name: 'Issuer' }))
              : { id: 'member-1', full_name: 'Ada Lovelace' };
          }
          if (table === 'profiles') data = null;
          if (table === 'verified_actions') data = [];
          if (table === 'user_referrals') data = [];
          return Promise.resolve({ data, error }).then(resolve, reject);
        },
      };
      return query;
    },
  };
}

for (const table of ['offer_issuances', 'user_promo_cards', 'community_drop_claims']) {
  test(`${table} failure is an error rather than an empty card`, async () => {
    const db = cardDb({ failTable: table, active: [{ ...issued, expires_at: null }] });
    await assert.rejects(
      createPeopleExperienceService(db).getCard('member-1'),
      /Ledger unavailable/,
    );
  });
}

test('history does not resurrect linked community claims as usable perks', async () => {
  const db = cardDb({
    active: [{ ...issued, expires_at: null }],
    history: [{ ...issued, id: 'used-1', status: 'redeemed', redeemed_at: '2026-09-05T11:00:00Z' }],
    drops: [
      { id: 'duplicate-claim', offer_issuance_id: 'used-1' },
      { id: 'legacy-claim', offer_issuance_id: null, community_drops: { title: 'Legacy perk' } },
    ],
  });
  const card = await createPeopleExperienceService(db).getCard('member-1', { fullName: 'Ada Lovelace' });
  assert.equal(card.perks.length, 2);
  assert.equal(card.used.length, 1);
  assert.equal(card.used[0].id, 'used-1');
  assert.equal(card.used[0].redemption.recorded, true);
  assert.equal(card.used[0].redemption.code, null);
  assert.ok(card.perks.some((perk) => perk.id === 'issuance-1' && perk.redemptionCode === 'PR-REAL'));
  assert.ok(card.perks.some((perk) => perk.id === 'legacy-claim' && !perk.redemptionCode));
  assert.ok(!card.perks.some((perk) => perk.id === 'duplicate-claim'));
  assert.equal(card.useThis?.id, 'issuance-1');
  assert.equal(card.givenName, 'Ada');
});
