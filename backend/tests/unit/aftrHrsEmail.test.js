const {
  buildAftrHrsRsvpEmailHtml,
  canonicalizePromorangFrontendUrl,
} = require('../../services/resendService');

test('AftrHrs email links stay on www and open the dedicated pass page', () => {
  expect(canonicalizePromorangFrontendUrl('https://promorang.co')).toBe('https://www.promorang.co');
  expect(canonicalizePromorangFrontendUrl('https://www.promorang.co/')).toBe('https://www.promorang.co');

  const html = buildAftrHrsRsvpEmailHtml({
    userName: 'Adam',
    kind: 'pass',
    activationCode: 'AH-PREVIEW01',
  });

  expect(html).toContain('https://www.promorang.co/aftrhrs/pass');
  expect(html).toContain('Open my pass');
  expect(html).toContain('Your AftrHrs pass is ready');
  expect(html).toContain('not the Promorang membership card');
  expect(html).toContain('top of your wallet');
  expect(html).toContain('Every Friday');
  expect(html).toContain('AH-PREVIEW01');
  expect(html).not.toContain('September 11');
  expect(html).not.toContain('https://promorang.co/moments/aftrhrs/pass');
  expect(html).not.toContain('RSVP is locked');
});
