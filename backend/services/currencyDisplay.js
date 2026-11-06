'use strict';

// Currency conversion for display only. This module cannot select checkout
// currency, modify an order, or initiate a payment.
const ISO_CURRENCY = /^[A-Z]{3}$/;
function currencyCode(code) {
  if (typeof code !== 'string' || !ISO_CURRENCY.test(code)) throw new TypeError('ISO 4217 currency code required');
  try { new Intl.NumberFormat('en', { style: 'currency', currency: code }); }
  catch { throw new RangeError('Unsupported currency'); }
  return code;
}
function currencyDigits(code) {
  return new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode(code) }).resolvedOptions().maximumFractionDigits;
}
function convertDisplayQuote({ amount, fromCurrency, toCurrency, rate, rateAsOf, provider }) {
  const from = currencyCode(fromCurrency);
  const to = currencyCode(toCurrency);
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) throw new RangeError('Invalid amount');
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) throw new RangeError('Invalid exchange rate');
  if (typeof rateAsOf !== 'string' || !Number.isFinite(Date.parse(rateAsOf))) throw new TypeError('Valid rate timestamp required');
  if (typeof provider !== 'string' || !provider.trim()) throw new TypeError('Exchange rate provider required');
  if (from === to && rate !== 1) throw new RangeError('Same currency must use rate 1');
  const digits = currencyDigits(to);
  const multiplier = 10 ** digits;
  const converted = Math.round((amount * rate + Number.EPSILON) * multiplier) / multiplier;
  if (!Number.isFinite(converted) || !Number.isSafeInteger(Math.round(converted * multiplier))) throw new RangeError('Converted amount is too large');
  return Object.freeze({
    originalAmount: amount,
    originalCurrency: from,
    displayAmount: converted,
    displayCurrency: to,
    exchangeRate: rate,
    rateAsOf: new Date(rateAsOf).toISOString(),
    provider: provider.trim(),
    approximate: from !== to,
    settlementCurrency: from,
    purpose: 'display_only',
  });
}
module.exports = { convertDisplayQuote, currencyDigits };
