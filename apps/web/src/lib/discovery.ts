export const DEFAULT_SITE_URL = "https://www.promorang.co";

export function slugifySegment(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deslugifySegment(value: string | null | undefined) {
  if (!value) return "";
  return value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getSiteUrl(path = "") {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }

  return `${DEFAULT_SITE_URL}${path}`;
}

export function buildMomentPath(moment: { id: string; slug?: string | null }) {
  return `/moments/${moment.slug || moment.id}`;
}

export function buildBrandPath(brand: { id: string; slug?: string | null }) {
  return `/brands/${brand.slug || brand.id}`;
}

export function buildVenuePath(venue: { id: string; slug?: string | null }) {
  return `/venues/${venue.slug || venue.id}`;
}

export function buildLocationPath(countrySlug: string, citySlug?: string | null) {
  return citySlug ? `/locations/${countrySlug}/${citySlug}` : `/locations/${countrySlug}`;
}

export function formatLocationLabel(city?: string | null, country?: string | null) {
  return [city, country].filter(Boolean).join(", ");
}
