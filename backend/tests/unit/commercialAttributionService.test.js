const service = require('../../services/commercialAttributionService');

describe('commercial attribution service', () => {
  test('does not allocate for attribution without a funded rule', () => {
    const receipt = { receipt_type: 'purchase', amount: 100, currency: 'EUR' };
    expect(service.planAllocations({ receipt, rules: [] })).toEqual([]);
    expect(service.planAllocations({ receipt, rules: [{ id: 'share', bucket: 'distributor', funded: false, amount: 10, required_evidence: 'share' }] })).toEqual([]);
  });

  test('requires the configured evidence level', () => {
    const rule = { id: 'attendance', bucket: 'distributor', funded: true, amount: 10, required_evidence: 'attendance' };
    expect(service.planAllocations({ receipt: { receipt_type: 'purchase', amount: 100, currency: 'GBP' }, rules: [rule] })).toEqual([]);
    expect(service.planAllocations({ receipt: { receipt_type: 'redemption', status: 'fulfilled', amount: 100, currency: 'GBP' }, rules: [rule] })).toHaveLength(1);
  });

  test('calculates configured fixed and percentage allocations without assuming a currency', () => {
    const allocations = service.planAllocations({
      receipt: { receipt_type: 'purchase', amount: 200, currency: 'CAD' },
      rules: [
        { id: 'platform', bucket: 'platform_revenue', funded: true, amount: 20, required_evidence: 'purchase' },
        { id: 'operator', bucket: 'operator', funded: true, percentage: 80, required_evidence: 'purchase', recipient_user_id: 'merchant' },
      ],
    });
    expect(allocations.map(({ bucket, amount, currency }) => ({ bucket, amount, currency }))).toEqual([
      { bucket: 'platform_revenue', amount: 20, currency: 'CAD' },
      { bucket: 'operator', amount: 160, currency: 'CAD' },
    ]);
  });

  test('rejects allocations that exceed gross money received', () => {
    expect(() => service.planAllocations({
      receipt: { receipt_type: 'purchase', amount: 100, currency: 'USD' },
      rules: [
        { id: 'one', bucket: 'platform_revenue', funded: true, amount: 60 },
        { id: 'two', bucket: 'operator', funded: true, amount: 60 },
      ],
    })).toThrow(/exceed the transaction amount/i);
  });

  test('keeps reservation, purchase, and redemption evidence distinct', () => {
    expect(service.evidenceFromReceipt({ receipt_type: 'reservation' })).toBe('reservation');
    expect(service.evidenceFromReceipt({ receipt_type: 'purchase' })).toBe('purchase');
    expect(service.evidenceFromReceipt({ receipt_type: 'redemption' })).toBe('redemption');
  });
});
