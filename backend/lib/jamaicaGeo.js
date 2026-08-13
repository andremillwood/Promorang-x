'use strict';

const JAMAICA_CITY_HINTS = [
  'kingston',
  'new kingston',
  'half way tree',
  'halfway tree',
  'montego bay',
  'spanish town',
  'portmore',
  'may pen',
  'negril',
  'ocho rios',
  'mandeville',
];

const JAMAICA_GOLD_REGION_ID = 'a6a363f4-32d2-4f3b-b8bc-013255851621';

const MECHANIC_PROOF_TYPES = ['QR', 'GPS', 'Photo', 'Video', 'API', 'Code', 'Share', 'Screenshot', 'Link'];
const MOMENT_PROOF_TYPE_ALIASES = new Map([
  ['qr', 'QR'],
  ['gps', 'GPS'],
  ['photo', 'Photo'],
  ['image', 'Photo'],
  ['screenshot', 'Screenshot'],
  ['share', 'Share'],
  ['video', 'Video'],
  ['api', 'API'],
  ['code', 'Code'],
  ['referral', 'Code'],
  ['link', 'Link'],
  ['url', 'Link'],
]);

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function extractCity(city, location) {
  const explicit = clean(city);
  if (explicit) return explicit;
  const loc = clean(location);
  if (!loc) return null;
  const parts = loc.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return loc;
  const withoutCountry = parts.filter((part) => !/^(jamaica|jm|united states|usa|us)$/i.test(part));
  const kingstonPart = withoutCountry.find((part) => /kingston/i.test(part));
  if (kingstonPart) return /kingston/i.test(kingstonPart) && kingstonPart.toLowerCase() !== 'kingston'
    ? 'Kingston'
    : (kingstonPart.toLowerCase() === 'kingston' ? 'Kingston' : kingstonPart);
  return withoutCountry[0] || parts[0];
}

function looksLikeJamaica(haystack, country, countryCode) {
  const code = clean(countryCode).toUpperCase();
  if (code === 'JM') return true;
  if (/^jamaica$/i.test(clean(country))) return true;
  return JAMAICA_CITY_HINTS.some((hint) => haystack.includes(hint)) || /\bjamaica\b/.test(haystack) || /\bjm\b/.test(haystack);
}

/**
 * Resolve city / country / country_code for Jamaica Local Drop.
 * Kingston always maps to JM. America/Jamaica timezone is NOT used as geo.
 */
function resolvePlaceGeo({ city, location, country, countryCode, timezone } = {}) {
  void timezone;
  const extractedCity = extractCity(city, location);
  const haystack = [city, location, country, countryCode, extractedCity]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const kingston = /\bkingston\b/.test(haystack);

  if (kingston || looksLikeJamaica(haystack, country, countryCode)) {
    return {
      city: kingston ? 'Kingston' : (extractedCity || clean(city) || null),
      country: 'Jamaica',
      country_code: 'JM',
    };
  }

  const resolvedCountry = clean(country) || null;
  const resolvedCode = clean(countryCode).toUpperCase() || null;
  if (resolvedCountry && /^united states|usa|us$/i.test(resolvedCountry) && kingston) {
    return { city: 'Kingston', country: 'Jamaica', country_code: 'JM' };
  }

  return {
    city: extractedCity || clean(city) || null,
    country: resolvedCountry,
    country_code: resolvedCode,
  };
}

function geoProperties(moment = {}, extra = {}) {
  const geo = resolvePlaceGeo({
    city: moment.city,
    location: moment.location,
    country: moment.country,
    countryCode: moment.country_code,
  });
  const properties = {
    city: geo.city,
    country: geo.country,
    country_code: geo.country_code,
  };
  if (geo.country_code === 'JM') {
    properties.gold_region_id = JAMAICA_GOLD_REGION_ID;
  }
  return {
    ...properties,
    ...extra,
  };
}

function toMomentProofEnum(proofType, fallback = 'Screenshot') {
  const raw = String(proofType || fallback || 'Screenshot').trim();
  if (MECHANIC_PROOF_TYPES.includes(raw)) return raw;
  const key = raw.toLowerCase();
  return MOMENT_PROOF_TYPE_ALIASES.get(key) || null;
}

function toMoveProofType(proofType) {
  const key = String(proofType || '').trim().toLowerCase();
  if (key === 'screenshot' || key === 'share' || key === 'photo' || key === 'image') return 'photo';
  if (key === 'link' || key === 'url' || key === 'api') return 'link';
  if (key === 'video') return 'video';
  if (key === 'referral') return 'referral';
  if (key === 'code' || key === 'qr' || key === 'gps') return 'code';
  return null;
}

module.exports = {
  JAMAICA_GOLD_REGION_ID,
  MECHANIC_PROOF_TYPES,
  resolvePlaceGeo,
  geoProperties,
  extractCity,
  toMomentProofEnum,
  toMoveProofType,
};
