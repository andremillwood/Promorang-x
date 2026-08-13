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
  return {
    city: geo.city,
    country: geo.country,
    country_code: geo.country_code,
    ...extra,
  };
}

module.exports = {
  resolvePlaceGeo,
  geoProperties,
  extractCity,
};
