const {
  EMAIL_TRANSLATIONS,
  getEmailContent,
  localeFromRequest,
  normalizeEmailLocale,
} = require('../../services/emailI18n');

const REQUIRED_TEMPLATES = [
  'welcome',
  'passwordReset',
  'dropApproved',
  'dropCompleted',
  'dropRejected',
  'kycApproved',
  'ticketPurchase',
  'eventReminder',
  'securityAlert',
  'supportTicket',
  'aftrHrsPass',
  'aftrHrsGuestPass',
  'aftrHrsRsvp',
  'referralSignup',
  'referralActivation',
  'referralCommission',
  'withdrawalRequested',
  'withdrawalCompleted',
  'weeklyDigest',
];

test('every email locale has the same templates and keys', () => {
  const english = EMAIL_TRANSLATIONS.en;
  expect(Object.keys(english).sort()).toEqual(REQUIRED_TEMPLATES.slice().sort());

  for (const locale of ['en', 'es-419', 'pt-BR']) {
    const catalog = EMAIL_TRANSLATIONS[locale];
    expect(Object.keys(catalog).sort()).toEqual(Object.keys(english).sort());
    for (const templateKey of REQUIRED_TEMPLATES) {
      expect(Object.keys(catalog[templateKey]).sort()).toEqual(Object.keys(english[templateKey]).sort());
      for (const [field, value] of Object.entries(catalog[templateKey])) {
        if (Array.isArray(value)) {
          expect(value.every(Boolean)).toBe(true);
        } else {
          expect(String(value).length).toBeGreaterThan(0);
        }
      }
    }
  }
});

test('localeFromRequest prefers the UI header over Accept-Language', () => {
  expect(localeFromRequest({
    headers: {
      'x-promorang-locale': 'pt-BR',
      'accept-language': 'es-MX,es;q=0.9',
    },
  })).toBe('pt-BR');
  expect(localeFromRequest({
    headers: { cookie: 'promorang_locale=es-419' },
  })).toBe('es-419');
  expect(normalizeEmailLocale('es-CO')).toBe('es-419');
});

test('AftrHrs English copy stays stable for the existing email fixture', () => {
  const pass = getEmailContent('aftrHrsPass', 'en', { name: 'Adam' });
  expect(pass.subject).toContain('Your AftrHrs pass is ready');
  expect(pass.ctaText).toBe('Open my pass');
  expect(pass.title).toBe('Your AftrHrs pass is ready');
});
