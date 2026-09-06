const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { projectCardPerk, summarizeAttributedValue } = require('../services/promoCardProjection');

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

// Load the real service with isolated dependencies. No network or live database.
function loadService(db) {
  const filename = path.resolve(__dirname, '../services/peopleExperienceService.js');
  const localModule = { exports: {} };
  const localRequire = (id) => {
    if (id === '../lib/supabase') return { supabase: db };
    if (id === './offerService') return {};
    if (id === './promoCardProjection') return { projectCardPerk, summarizeAttributedValue };
    return require(id);
  };
  vm.runInThisContext(`(function(require, module, exports) { ${fs.readFileSync(filename, 'utf8')}\n})`, { filename })(localRequire, localModule, localModule.exports);
  return localModule.exports;
}

function cardDb({ failTable, active = [], history = [], drops = [] } = {}) {
  const reads = [];
  return {
    reads,
    from(table) {
      let statuses;
      let ids;
      let unlinkedOnly = false;
      const query = {
        select() { return query; }, eq() { return query; }, order() { return query; },
        limit() { return query; }, maybeSingle() { return query; },
        in(field, value) { if (field === 'status') statuses = value; if (field === 'id') ids = value; return query; },
        is(field, value) { if (field === 'offer_issuance_id' && value === null) unlinkedOnly = true; return query; },
        then(resolve, reject) {
          reads.push({ table, statuses, unlinkedOnly });
          let data = null;
          if (table === 'offer_issuances') data = statuses.includes('claimed') ? active : history;
          if (table === 'scene_memberships') data = [];
          if (table === 'community_drop_claims') data = drops.filter((row) => !unlinkedOnly || row.offer_issuance_id == null);
          if (table === 'users') data = ids ? ids.map((id) => ({ id, full_name: 'Issuer' })) : { id: 'member-1', full_name: 'Member' };
          return Promise.resolve({ data, error: table === failTable ? new Error('Ledger unavailable') : null }).then(resolve, reject);
        },
      };
      return query;
    },
  };
}

for (const table of ['offer_issuances', 'user_promo_cards', 'community_drop_claims']) {
  test(`${table} failure is an error rather than an empty card`, async () => {
    const db = cardDb({ failTable: table });
    await assert.rejects(loadService(db).createPeopleExperienceService(db).getCard('member-1'), /Ledger unavailable/);
  });
}

test('history does not resurrect linked community claims as usable perks', async () => {
  const db = cardDb({
    active: [{ ...issued, expires_at: null }],
    history: [{ ...issued, id: 'used-1', status: 'redeemed' }],
    drops: [
      { id: 'duplicate-claim', offer_issuance_id: 'used-1' },
      { id: 'legacy-claim', offer_issuance_id: null, community_drops: { title: 'Legacy perk' } },
    ],
  });
  const card = await loadService(db).createPeopleExperienceService(db).getCard('member-1');
  assert.equal(card.perks.length, 3);
  assert.equal(card.perks.filter((perk) => perk.ready).length, 1);
  assert.equal(card.perks.find((perk) => perk.id === 'used-1').section, 'history');
  assert.equal(card.perks.find((perk) => perk.id === 'legacy-claim').section, 'pending');
  assert.ok(!card.perks.some((perk) => perk.id === 'duplicate-claim'));
});

test('contributor outcomes count verified use rather than treating offer value as pay', () => {
  const result = loadService(cardDb()).accountStakeholderOutcomes({ role: 'contributor', earned: 9999, buckets: { used: 2 } });
  assert.ok(!result.cards.some((card) => card.key === 'earned'));
  assert.equal(result.cards.find((card) => card.key === 'used').value, 2);
  assert.equal(result.ledger.earned, undefined);
});

test('missing offer records never produce a usable credential', () => {
  assert.equal(projectCardPerk({ ...issued, offers: null }, now).redemptionCode, null);
});
