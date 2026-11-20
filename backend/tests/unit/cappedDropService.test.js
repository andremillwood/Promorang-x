const {
  resolveCap,
  assertInsideLaunchWindow,
  slugify,
  mapClaimError,
} = require('../../services/cappedDropService');

describe('capped drop create rules', () => {
  it('defaults the cap to 100', () => {
    expect(resolveCap(undefined)).toBe(100);
    expect(resolveCap(null)).toBe(100);
    expect(resolveCap('')).toBe(100);
    expect(resolveCap(25)).toBe(25);
    expect(() => resolveCap(0)).toThrow('Cap must be a positive whole number');
    expect(() => resolveCap(1.5)).toThrow('Cap must be a positive whole number');
  });

  it('keeps closes_at inside the launch window config', () => {
    expect(() => assertInsideLaunchWindow('2027-01-31T21:00:00-05:00', 'Close time')).not.toThrow();
    expect(() => assertInsideLaunchWindow('2027-02-01T08:00:00-05:00', 'Close time')).toThrow('launch window');
  });

  it('maps a sold-out claim to the miss message', () => {
    const error = mapClaimError(new Error('SOLD_OUT'));
    expect(error.code).toBe('SOLD_OUT');
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Just missed it');
  });

  it('builds a url slug from the drop name', () => {
    expect(slugify('Friday 100')).toBe('friday-100');
  });
});
