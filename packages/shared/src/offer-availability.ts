export const OFFER_AVAILABILITIES = ["local", "anywhere"] as const;
export type OfferAvailability = (typeof OFFER_AVAILABILITIES)[number];

export const OFFER_SURFACES = ["place", "commerce", "digital", "release"] as const;
export type OfferSurface = (typeof OFFER_SURFACES)[number];

export type OfferPlace = {
  city?: string | null;
  citySlug?: string | null;
  country?: string | null;
  countryCode?: string | null;
  location?: string | null;
};

export type OfferReach = OfferPlace & {
  availability: OfferAvailability;
  surface: OfferSurface;
  locationLabel?: string | null;
};

export type OfferReachSource = {
  fulfillment_type?: string | null;
  venue_id?: string | null;
  title?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  city?: string | null;
  city_slug?: string | null;
  country?: string | null;
  country_code?: string | null;
  location?: string | null;
};

const DEFAULT_LOCAL_HUB = "kingston";
const JAMAICA_CODES = new Set(["jm", "jamaica"]);

const SURFACE_LABELS: Record<OfferSurface, string> = {
  place: "This place",
  commerce: "Shop anywhere",
  digital: "Digital",
  release: "On streaming",
};

const HUB_TOKENS: Record<string, string[]> = {
  kingston: ["kingston", "st andrew", "new kingston", "liguanea", "barbican", "halfway tree", "half way tree", "downtown kgn", "knutsford", "constant spring", "devon house"],
  "montego-bay": ["montego", "mo bay", "st james", "hip strip", "rose hall"],
  "ocho-rios": ["ocho rios", "st ann", "plantation cove"],
  negril: ["negril", "westmoreland", "seven mile"],
  "port-antonio": ["port antonio", "boston bay", "portland"],
  "treasure-beach": ["treasure beach", "st elizabeth", "black river"],
  portmore: ["portmore", "hellshire", "st catherine"],
  mandeville: ["mandeville", "manchester"],
  falmouth: ["falmouth", "trelawny"],
  "blue-mountains": ["blue mountain", "holywell"],
  "all-jamaica": ["jamaica"],
  trinidad: ["port of spain", "trinidad"],
  barbados: ["bridgetown", "barbados"],
  bahamas: ["nassau", "bahamas"],
  guyana: ["georgetown", "guyana"],
  miami: ["miami", "south florida"],
  "new-york": ["new york", "nyc", "brooklyn"],
  atlanta: ["atlanta"],
  toronto: ["toronto"],
  london: ["london"],
};

const RELEASE_HINTS = ["spotify", "apple music", "audiomack", "youtube music", "tidal", "deezer", "dsp", "pre-save", "presave", "streaming", "new single", "new album"];
const DIGITAL_HINTS = ["livestream", "live stream", "webinar", "virtual", "online event", "zoom", "digital event", "watch party"];
const COMMERCE_HINTS = ["shopify", "ecommerce", "e-commerce", "online store", "ships worldwide", "ships anywhere", "web store"];

function compact(value?: string | null) {
  const text = String(value || "").trim();
  return text || null;
}

function normalize(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function textOf(source: OfferReachSource, meta: Record<string, unknown>) {
  return [
    source.title,
    source.description,
    source.location,
    source.city,
    meta.location,
    meta.venue,
    meta.venue_name,
    meta.city,
    meta.kind,
    meta.surface,
    meta.channel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function asAvailability(value?: string | null): OfferAvailability | null {
  const key = normalize(value).replace(/\s+/g, "");
  if (key === "local" || key === "nearby" || key === "place") return "local";
  if (key === "anywhere" || key === "global" || key === "nationwide" || key === "digital" || key === "online") return "anywhere";
  return null;
}

function asSurface(value?: string | null): OfferSurface | null {
  const key = normalize(value).replace(/\s+/g, "");
  if (key === "place" || key === "venue" || key === "local") return "place";
  if (key === "commerce" || key === "ecommerce" || key === "shop" || key === "product") return "commerce";
  if (key === "digital" || key === "online" || key === "virtual") return "digital";
  if (key === "release" || key === "music" || key === "dsp" || key === "streaming") return "release";
  return null;
}

function inferSurface(source: OfferReachSource, meta: Record<string, unknown>, haystack: string): OfferSurface {
  const explicit = asSurface(pickString(meta.surface, meta.kind, meta.offer_kind, meta.channel));
  if (explicit) return explicit;
  if (RELEASE_HINTS.some((hint) => haystack.includes(hint))) return "release";
  if (COMMERCE_HINTS.some((hint) => haystack.includes(hint)) || source.fulfillment_type === "shipping") return "commerce";
  if (DIGITAL_HINTS.some((hint) => haystack.includes(hint))) return "digital";
  if (source.fulfillment_type === "automatic" && !source.venue_id && !pickString(meta.venue, meta.venue_name, meta.city)) {
    return "digital";
  }
  return "place";
}

function inferAvailability(
  source: OfferReachSource,
  meta: Record<string, unknown>,
  surface: OfferSurface,
  locationLabel: string | null,
): OfferAvailability {
  const explicit = asAvailability(pickString(meta.availability, meta.reach, meta.geo_scope));
  if (explicit) return explicit;
  if (surface === "commerce" || surface === "digital" || surface === "release") return "anywhere";
  if (source.fulfillment_type === "shipping") return "anywhere";
  if (source.fulfillment_type === "automatic" && !source.venue_id && !locationLabel) return "anywhere";
  return "local";
}

export function resolveOfferReach(source: OfferReachSource = {}, drop: OfferReachSource = {}): OfferReach {
  const meta = { ...asRecord(drop.metadata), ...asRecord(source.metadata) };
  const haystack = `${textOf(source, meta)} ${textOf(drop, asRecord(drop.metadata))}`;
  const surface = inferSurface(source, meta, haystack);
  const city = pickString(meta.city, source.city, drop.city);
  const citySlug = pickString(meta.city_slug, source.city_slug, drop.city_slug);
  const country = pickString(meta.country, source.country, drop.country);
  const countryCode = pickString(meta.country_code, source.country_code, drop.country_code)?.toUpperCase() || null;
  const location = pickString(meta.location, meta.venue, meta.venue_name, meta.area, source.location, drop.location);
  const locationLabel = location || city;
  const availability = inferAvailability(source, meta, surface, locationLabel);

  return {
    availability,
    surface,
    city,
    citySlug,
    country,
    countryCode,
    location,
    locationLabel: availability === "anywhere" ? SURFACE_LABELS[surface] : locationLabel,
  };
}

function placeHaystack(place: OfferPlace) {
  return normalize([place.citySlug, place.city, place.location, place.country, place.countryCode].filter(Boolean).join(" "));
}

function tokensForSlug(slug?: string | null) {
  const key = normalize(slug).replace(/\s+/g, "-");
  return HUB_TOKENS[key] || (key ? [key.replace(/-/g, " ")] : []);
}

function isJamaicaPlace(place: OfferPlace) {
  const code = compact(place.countryCode)?.toLowerCase();
  const country = normalize(place.country);
  const slug = normalize(place.citySlug).replace(/\s+/g, "-");
  return JAMAICA_CODES.has(code || "") || JAMAICA_CODES.has(country) || slug === "all-jamaica" || slug === "kingston";
}

function isUntagged(reach: OfferReach) {
  return !compact(reach.city) && !compact(reach.citySlug) && !compact(reach.location) && !compact(reach.country) && !compact(reach.countryCode);
}

export function offerMatchesPlace(reach: OfferReach, place?: OfferPlace | null) {
  if (reach.availability === "anywhere") return true;
  if (!place || (!compact(place.city) && !compact(place.citySlug) && !compact(place.countryCode))) return true;

  const visitorSlug = normalize(place.citySlug).replace(/\s+/g, "-");
  if (visitorSlug === "all-jamaica") {
    return isJamaicaPlace(reach) || isUntagged(reach) || normalize(reach.country).includes("jamaica") || Boolean(reach.locationLabel && /kingston|montego|negril|ocho rios|jamaica/i.test(reach.locationLabel));
  }

  if (isUntagged(reach)) {
    return visitorSlug === DEFAULT_LOCAL_HUB || isJamaicaPlace(place);
  }

  const visitorText = placeHaystack(place);
  const offerText = placeHaystack(reach);
  const visitorTokens = tokensForSlug(place.citySlug || place.city);
  const offerTokens = tokensForSlug(reach.citySlug || reach.city);

  if (visitorSlug && reach.citySlug && visitorSlug === normalize(reach.citySlug).replace(/\s+/g, "-")) return true;
  if (visitorTokens.some((token) => offerText.includes(token))) return true;
  if (offerTokens.some((token) => visitorText.includes(token))) return true;
  if (compact(reach.location) && visitorTokens.some((token) => normalize(reach.location).includes(token))) return true;
  return false;
}

export function rankOffersForPlace<T extends { reach?: OfferReach | null }>(
  items: T[],
  place?: OfferPlace | null,
): T[] {
  return [...items].sort((left, right) => {
    const leftReach = left.reach || { availability: "local" as const, surface: "place" as const };
    const rightReach = right.reach || { availability: "local" as const, surface: "place" as const };
    const leftLocal = leftReach.availability === "local" && offerMatchesPlace(leftReach, place);
    const rightLocal = rightReach.availability === "local" && offerMatchesPlace(rightReach, place);
    if (leftLocal !== rightLocal) return leftLocal ? -1 : 1;
    if (leftReach.availability !== rightReach.availability) {
      return leftReach.availability === "local" ? -1 : 1;
    }
    return 0;
  });
}

export function selectOffersForPlace<T>(
  items: T[],
  reachOf: (item: T) => OfferReach,
  place?: OfferPlace | null,
): Array<T & { reach: OfferReach }> {
  const visible = items
    .map((item) => ({ ...item, reach: reachOf(item) }))
    .filter((item) => offerMatchesPlace(item.reach, place));
  return rankOffersForPlace(visible, place);
}

export function offerSurfaceLabel(surface: OfferSurface) {
  return SURFACE_LABELS[surface];
}

export function offerAvailabilityCopy(reach: OfferReach) {
  if (reach.availability === "anywhere") {
    if (reach.surface === "release") return "Works anywhere — new music, streams, and DSP drops.";
    if (reach.surface === "commerce") return "Works anywhere — shops, shipping, and online brands.";
    return "Works anywhere — digital events and online access.";
  }
  return reach.locationLabel ? `For people in ${reach.locationLabel}.` : "For people near this place.";
}
