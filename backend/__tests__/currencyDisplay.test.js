'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { convertDisplayQuote } = require('../services/currencyDisplay');
const base = { amount: 3500, fromCurrency: 'JMD', toCurrency: 'USD', rate: 0.0063, rateAsOf: '2026-11-05T12:00:00Z', provider: 'test-fixture' };
test('converts for display while preserving merchant settlement currency', () => {
  const q = convertDisplayQuote(base);
  assert.equal(q.displayAmount, 22.05);
  assert.equal(q.originalAmount, 3500);
  assert.equal(q.settlementCurrency, 'JMD');
  assert.equal(q.purpose, 'display_only');
  assert.equal(q.approximate, true);
});
test('supports zero-decimal display currencies', () => {
  const q = convertDisplayQuote({ ...base, toCurrency: 'JPY', rate: 0.91 });
  assert.equal(q.displayAmount, 3185);
});
test('same currency must use unit rate', () => {
  assert.throws(() => convertDisplayQuote({ ...base, toCurrency: 'JMD' }));
  assert.equal(convertDisplayQuote({ ...base, toCurrency: 'JMD', rate: 1 }).displayAmount, 3500);
});
test('rejects invalid inputs and missing rate provenance', () => {
  for (const changes of [{ rate: 0 }, { rate: Infinity }, { amount: -1 }, { fromCurrency: 'JM' }, { rateAsOf: 'bad' }, { provider: '' }])
    assert.throws(() => convertDisplayQuote({ ...base, ...changes }));
});
