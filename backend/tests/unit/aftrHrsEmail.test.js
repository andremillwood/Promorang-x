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
  expect(html).toContain('this Friday only');
  expect(html).toContain('AH-PREVIEW01');
  expect(html).not.toContain('September 11');
  expect(html).not.toContain('https://promorang.co/moments/aftrhrs/pass');
  expect(html).not.toContain('RSVP is locked');
});

test('guest digital pass email opens a ticket without signing in', () => {
  const html = buildAftrHrsRsvpEmailHtml({
    userName: 'Ada',
    kind: 'guest-pass',
    activationCode: 'AH-GUEST001',
    ticketPath: '/aftrhrs/ticket/AH-GUEST001',
  });
  expect(html).toContain('https://www.promorang.co/aftrhrs/ticket/AH-GUEST001');
  expect(html).toContain('Open my ticket');
  expect(html).toContain('No Promorang account');
  expect(html).not.toContain('https://www.promorang.co/aftrhrs/pass');
  expect(html).not.toContain('If you are asked to sign in');
});

test('Friday RSVP email tells guests to give their name at the door', () => {
  const html = buildAftrHrsRsvpEmailHtml({
    userName: 'Ada',
    kind: 'rsvp',
  });
  expect(html).toContain('You are on this Friday');
  expect(html).toContain('no Promorang account');
  expect(html).toContain('https://www.promorang.co/aftrhrs');
  expect(html).not.toContain('https://www.promorang.co/aftrhrs/pass');
});
