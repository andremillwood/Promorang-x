import { createHash } from 'node:crypto';

const CATEGORY_RULES = [
  ['restaurant', ['restaurant', 'fast_food', 'food_court']],
  ['cafe', ['cafe', 'ice_cream']],
  ['nightlife', ['bar', 'pub', 'nightclub']],
  ['arts_culture', ['arts_centre', 'theatre', 'museum', 'gallery']],
  ['attraction', ['attraction', 'theme_park', 'zoo', 'aquarium']],
  ['accommodation', ['hotel', 'guest_house', 'hostel', 'resort']],
  ['fitness_wellness', ['fitness_centre', 'sports_centre', 'spa']],
  ['shopping', ['mall', 'department_store', 'clothes', 'gift']],
];

export function normalizeText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanUrl(value) {
  if (!value) return null;
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function categoryFor(tags) {
  const values = [tags.amenity, tags.tourism, tags.leisure, tags.shop].filter(Boolean);
  for (const [category, matches] of CATEGORY_RULES) {
    if (values.some((value) => matches.includes(value))) return category;
  }
  return 'other';
}

function buildAddress(tags, defaults = {}) {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  return [street, tags['addr:suburb'], tags['addr:city'] || defaults.city || defaults.region || defaults.parish, tags['addr:country'] || defaults.country || 'Jamaica']
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(', ');
}

function coordinates(element) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
    return { latitude: element.lat, longitude: element.lon };
  }
  if (Number.isFinite(element.center?.lat) && Number.isFinite(element.center?.lon)) {
    return { latitude: element.center.lat, longitude: element.center.lon };
  }
  return { latitude: null, longitude: null };
}

export function fingerprintVenue({ name, address, latitude, longitude }) {
  const roundedLocation = Number.isFinite(latitude) && Number.isFinite(longitude)
    ? `${latitude.toFixed(3)},${longitude.toFixed(3)}`
    : normalizeText(address);
  return createHash('sha256')
    .update(`${normalizeText(name)}|${roundedLocation}`)
    .digest('hex');
}

export function normalizeOsmElement(element, checkedAt = new Date().toISOString(), defaults = { city: 'Kingston', region: 'Kingston / St. Andrew', parish: 'Kingston / St. Andrew', country: 'Jamaica', country_code: 'JM' }) {
  const tags = element.tags || {};
  const name = tags.name?.trim();
  if (!name) return null;

  const { latitude, longitude } = coordinates(element);
  const address = buildAddress(tags, defaults);
  const website = cleanUrl(tags.website || tags['contact:website']);
  const phone = tags.phone || tags['contact:phone'] || null;
  const socialProfiles = {
    facebook: cleanUrl(tags['contact:facebook'] || tags.facebook),
    instagram: cleanUrl(tags['contact:instagram'] || tags.instagram),
  };
  Object.keys(socialProfiles).forEach((key) => !socialProfiles[key] && delete socialProfiles[key]);

  let confidence = 0.45;
  if (latitude !== null) confidence += 0.15;
  if (tags['addr:street'] || tags['addr:suburb']) confidence += 0.1;
  if (website) confidence += 0.1;
  if (phone) confidence += 0.1;
  if (tags.opening_hours) confidence += 0.05;
  if (Object.keys(socialProfiles).length) confidence += 0.05;
  confidence = Math.min(1, Number(confidence.toFixed(3)));

  const sourceRecordId = `${element.type}/${element.id}`;
  const normalizedData = {
    name,
    address,
    city: tags['addr:city'] || tags['addr:suburb'] || defaults.city || defaults.region || defaults.parish || defaults.country || 'Jamaica',
    region: defaults.region || defaults.parish || tags['addr:state'] || defaults.country,
    parish: defaults.parish || defaults.region || tags['addr:state'] || null,
    country: defaults.country || tags['addr:country'] || 'Jamaica',
    country_code: defaults.country_code || (defaults.country ? null : 'JM'),
    latitude,
    longitude,
    category: categoryFor(tags),
    phone,
    website,
    opening_hours: tags.opening_hours || null,
    social_profiles: socialProfiles,
    tags: Object.entries(tags)
      .filter(([key]) => ['cuisine', 'amenity', 'tourism', 'leisure', 'shop'].includes(key))
      .map(([, value]) => value),
    listing_status: 'unclaimed',
  };

  return {
    entity_type: 'venue',
    source_record_id: sourceRecordId,
    source_url: `https://www.openstreetmap.org/${sourceRecordId}`,
    source_last_checked_at: checkedAt,
    raw_data: element,
    normalized_data: normalizedData,
    fingerprint: fingerprintVenue(normalizedData),
    confidence,
    review_status: confidence >= 0.8 ? 'pending' : 'needs_research',
  };
}

export function normalizeOsmResponse(payload, checkedAt = new Date().toISOString(), defaults = { city: 'Kingston', region: 'Kingston / St. Andrew', parish: 'Kingston / St. Andrew', country: 'Jamaica', country_code: 'JM' }) {
  if (!payload || !Array.isArray(payload.elements)) {
    throw new TypeError('Expected an OpenStreetMap Overpass response with an elements array.');
  }

  const candidates = payload.elements
    .map((element) => normalizeOsmElement(element, checkedAt, defaults))
    .filter(Boolean);

  const seen = new Map();
  return candidates.map((candidate) => {
    const duplicate = seen.get(candidate.fingerprint);
    if (!duplicate) {
      seen.set(candidate.fingerprint, candidate.source_record_id);
      return candidate;
    }
    return {
      ...candidate,
      review_status: 'needs_research',
      duplicate_source_record_id: duplicate,
    };
  });
}
