export type RegionCategory = "all" | "jamaica" | "caribbean" | "latam" | "africa" | "diaspora";

export interface CityOption {
  id: string;
  name: string;
  region?: string;
  countryCode: string;
  countryName: string;
  category: "jamaica" | "caribbean" | "latam" | "africa" | "diaspora";
  badge?: string;
}

export type LocationLike = {
  city?: string | null;
  city_slug?: string | null;
  location?: string | null;
  venue_name?: string | null;
  country?: string | null;
  country_slug?: string | null;
  country_code?: string | null;
  title?: string | null;
  description?: string | null;
};

export const CITY_STORAGE_KEY = "promorang:selected_city";
export const DEFAULT_CITY_HUB_ID = "kingston";

export const ALL_CITY_HUBS: CityOption[] = [
  { id: "all-jamaica", name: "All Jamaica", region: "Island-Wide", countryCode: "JM", countryName: "Jamaica", category: "jamaica", badge: "Island-Wide" },
  { id: "kingston", name: "Kingston & St. Andrew", region: "Corporate Area", countryCode: "JM", countryName: "Jamaica", category: "jamaica", badge: "Live Pulse" },
  { id: "montego-bay", name: "Montego Bay", region: "St. James", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "ocho-rios", name: "Ocho Rios", region: "St. Ann", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "negril", name: "Negril", region: "Westmoreland & Hanover", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "port-antonio", name: "Port Antonio & Boston", region: "Portland", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "treasure-beach", name: "South Coast & Treasure Beach", region: "St. Elizabeth", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "portmore", name: "Portmore & Hellshire", region: "St. Catherine", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "mandeville", name: "Mandeville", region: "Manchester", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "falmouth", name: "Falmouth", region: "Trelawny", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "blue-mountains", name: "Blue Mountains & Holywell", region: "St. Andrew / Portland", countryCode: "JM", countryName: "Jamaica", category: "jamaica" },
  { id: "trinidad", name: "Port of Spain", region: "Trinidad & Tobago", countryCode: "TT", countryName: "Trinidad & Tobago", category: "caribbean", badge: "Pilot" },
  { id: "barbados", name: "Bridgetown", region: "Barbados", countryCode: "BB", countryName: "Barbados", category: "caribbean", badge: "Pilot" },
  { id: "bahamas", name: "Nassau", region: "The Bahamas", countryCode: "BS", countryName: "The Bahamas", category: "caribbean", badge: "Pilot" },
  { id: "guyana", name: "Georgetown", region: "Guyana", countryCode: "GY", countryName: "Guyana", category: "caribbean", badge: "Pilot" },
  { id: "dominican-republic", name: "Santo Domingo", region: "Dominican Republic", countryCode: "DO", countryName: "Dominican Republic", category: "caribbean", badge: "Pilot" },
  { id: "puerto-rico", name: "San Juan", region: "Puerto Rico", countryCode: "PR", countryName: "Puerto Rico", category: "caribbean", badge: "Beta" },
  { id: "cuba", name: "Havana", region: "Cuba", countryCode: "CU", countryName: "Cuba", category: "caribbean", badge: "Beta" },
  { id: "haiti", name: "Port-au-Prince", region: "Haiti", countryCode: "HT", countryName: "Haiti", category: "caribbean", badge: "Beta" },
  { id: "curacao", name: "Willemstad", region: "Curaçao", countryCode: "CW", countryName: "Curaçao", category: "caribbean", badge: "Beta" },
  { id: "antigua", name: "St. John's", region: "Antigua & Barbuda", countryCode: "AG", countryName: "Antigua & Barbuda", category: "caribbean", badge: "Beta" },
  { id: "st-lucia", name: "Castries", region: "Saint Lucia", countryCode: "LC", countryName: "Saint Lucia", category: "caribbean", badge: "Beta" },
  { id: "cayman", name: "George Town", region: "Cayman Islands", countryCode: "KY", countryName: "Cayman Islands", category: "caribbean", badge: "Beta" },
  { id: "belize", name: "Belize City", region: "Belize", countryCode: "BZ", countryName: "Belize", category: "caribbean", badge: "Beta" },
  { id: "grenada", name: "St. George's", region: "Grenada", countryCode: "GD", countryName: "Grenada", category: "caribbean", badge: "Beta" },
  { id: "bermuda", name: "Hamilton", region: "Bermuda", countryCode: "BM", countryName: "Bermuda", category: "caribbean", badge: "Beta" },
  { id: "medellin", name: "Medellín", region: "Antioquia", countryCode: "CO", countryName: "Colombia", category: "latam", badge: "Pilot" },
  { id: "bogota", name: "Bogotá", region: "Distrito Capital", countryCode: "CO", countryName: "Colombia", category: "latam", badge: "Pilot" },
  { id: "panama-city", name: "Panama City", region: "Panamá", countryCode: "PA", countryName: "Panama", category: "latam", badge: "Pilot" },
  { id: "mexico-city", name: "Mexico City (CDMX)", region: "Distrito Federal", countryCode: "MX", countryName: "Mexico", category: "latam", badge: "Beta" },
  { id: "sao-paulo", name: "São Paulo", region: "Estado de São Paulo", countryCode: "BR", countryName: "Brazil", category: "latam", badge: "Beta" },
  { id: "rio", name: "Rio de Janeiro", region: "Estado do Rio", countryCode: "BR", countryName: "Brazil", category: "latam", badge: "Beta" },
  { id: "buenos-aires", name: "Buenos Aires", region: "Capital Federal", countryCode: "AR", countryName: "Argentina", category: "latam", badge: "Beta" },
  { id: "lima", name: "Lima", region: "Provincia de Lima", countryCode: "PE", countryName: "Peru", category: "latam", badge: "Beta" },
  { id: "santiago", name: "Santiago", region: "Región Metropolitana", countryCode: "CL", countryName: "Chile", category: "latam", badge: "Beta" },
  { id: "san-jose", name: "San José", region: "San José", countryCode: "CR", countryName: "Costa Rica", category: "latam", badge: "Beta" },
  { id: "quito", name: "Quito", region: "Pichincha", countryCode: "EC", countryName: "Ecuador", category: "latam", badge: "Beta" },
  { id: "guatemala-city", name: "Guatemala City", region: "Guatemala", countryCode: "GT", countryName: "Guatemala", category: "latam", badge: "Beta" },
  { id: "montevideo", name: "Montevideo", region: "Montevideo", countryCode: "UY", countryName: "Uruguay", category: "latam", badge: "Beta" },
  { id: "caracas", name: "Caracas", region: "Distrito Capital", countryCode: "VE", countryName: "Venezuela", category: "latam", badge: "Beta" },
  { id: "accra", name: "Accra", region: "Greater Accra", countryCode: "GH", countryName: "Ghana", category: "africa", badge: "Pilot" },
  { id: "lagos", name: "Lagos", region: "Lagos State", countryCode: "NG", countryName: "Nigeria", category: "africa", badge: "Pilot" },
  { id: "nairobi", name: "Nairobi", region: "Nairobi County", countryCode: "KE", countryName: "Kenya", category: "africa", badge: "Beta" },
  { id: "johannesburg", name: "Johannesburg", region: "Gauteng", countryCode: "ZA", countryName: "South Africa", category: "africa", badge: "Beta" },
  { id: "cape-town", name: "Cape Town", region: "Western Cape", countryCode: "ZA", countryName: "South Africa", category: "africa", badge: "Beta" },
  { id: "dakar", name: "Dakar", region: "Dakar", countryCode: "SN", countryName: "Senegal", category: "africa", badge: "Beta" },
  { id: "kigali", name: "Kigali", region: "Kigali Province", countryCode: "RW", countryName: "Rwanda", category: "africa", badge: "Beta" },
  { id: "miami", name: "Miami & South Florida", region: "Florida", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "new-york", name: "New York (NYC)", region: "New York", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "atlanta", name: "Atlanta", region: "Georgia", countryCode: "US", countryName: "United States", category: "diaspora", badge: "Beta" },
  { id: "toronto", name: "Toronto", region: "Ontario", countryCode: "CA", countryName: "Canada", category: "diaspora", badge: "Beta" },
  { id: "london", name: "London", region: "Greater London", countryCode: "GB", countryName: "United Kingdom", category: "diaspora", badge: "Beta" },
];

export const POPULAR_CITIES = ALL_CITY_HUBS;

const CITY_HUB_CENTERS: Record<string, { lat: number; lng: number }> = {
  kingston: { lat: 18.0179, lng: -76.8099 },
  "all-jamaica": { lat: 18.1096, lng: -77.2975 },
  "montego-bay": { lat: 18.4762, lng: -77.9188 },
  "ocho-rios": { lat: 18.4074, lng: -77.1031 },
  negril: { lat: 18.268, lng: -78.3489 },
  "port-antonio": { lat: 18.18, lng: -76.45 },
  "treasure-beach": { lat: 17.884, lng: -77.761 },
  portmore: { lat: 17.95, lng: -76.879 },
  mandeville: { lat: 18.0333, lng: -77.5 },
  falmouth: { lat: 18.4936, lng: -77.6559 },
  "blue-mountains": { lat: 18.0833, lng: -76.65 },
  trinidad: { lat: 10.6596, lng: -61.5086 },
  barbados: { lat: 13.0975, lng: -59.6167 },
  bahamas: { lat: 25.0443, lng: -77.3504 },
  guyana: { lat: 6.8013, lng: -58.1551 },
  "dominican-republic": { lat: 18.4861, lng: -69.9312 },
  "puerto-rico": { lat: 18.4655, lng: -66.1057 },
  cuba: { lat: 23.1136, lng: -82.3666 },
  haiti: { lat: 18.5944, lng: -72.3074 },
  curacao: { lat: 12.1222, lng: -68.8824 },
  antigua: { lat: 17.1274, lng: -61.8468 },
  "st-lucia": { lat: 14.0101, lng: -60.9875 },
  cayman: { lat: 19.2869, lng: -81.3674 },
  belize: { lat: 17.5046, lng: -88.1962 },
  grenada: { lat: 12.0561, lng: -61.7486 },
  bermuda: { lat: 32.2949, lng: -64.7814 },
  medellin: { lat: 6.2476, lng: -75.5658 },
  bogota: { lat: 4.711, lng: -74.0721 },
  "panama-city": { lat: 8.9824, lng: -79.5199 },
  "mexico-city": { lat: 19.4326, lng: -99.1332 },
  "sao-paulo": { lat: -23.5505, lng: -46.6333 },
  rio: { lat: -22.9068, lng: -43.1729 },
  "buenos-aires": { lat: -34.6037, lng: -58.3816 },
  lima: { lat: -12.0464, lng: -77.0428 },
  santiago: { lat: -33.4489, lng: -70.6693 },
  "san-jose": { lat: 9.9281, lng: -84.0907 },
  quito: { lat: -0.1807, lng: -78.4678 },
  "guatemala-city": { lat: 14.6349, lng: -90.5069 },
  montevideo: { lat: -34.9011, lng: -56.1645 },
  caracas: { lat: 10.4806, lng: -66.9036 },
  accra: { lat: 5.6037, lng: -0.187 },
  lagos: { lat: 6.5244, lng: 3.3792 },
  nairobi: { lat: -1.2921, lng: 36.8219 },
  johannesburg: { lat: -26.2041, lng: 28.0473 },
  "cape-town": { lat: -33.9249, lng: 18.4241 },
  dakar: { lat: 14.7167, lng: -17.4677 },
  kigali: { lat: -1.9441, lng: 30.0619 },
  miami: { lat: 25.7617, lng: -80.1918 },
  "new-york": { lat: 40.7128, lng: -74.006 },
  atlanta: { lat: 33.749, lng: -84.388 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  london: { lat: 51.5074, lng: -0.1278 },
};

const EXTRA_TOKENS: Record<string, string[]> = {
  kingston: [
    "kingston",
    "st. andrew",
    "st andrew",
    "new kingston",
    "liguanea",
    "barbican",
    "halfway tree",
    "half way tree",
    "jack's hill",
    "red hills",
    "hope rd",
    "hope road",
    "downtown kgn",
    "knutsford",
    "constant spring",
    "devon house",
  ],
  "montego-bay": ["montego", "mo bay", "st. james", "st james", "hip strip", "rose hall", "howard cooke"],
  "ocho-rios": ["ocho rios", "st. ann", "st ann", "plantation cove", "priory"],
  negril: ["negril", "westmoreland", "seven mile", "west end"],
  "port-antonio": ["port antonio", "boston bay", "portland", "san san"],
  "treasure-beach": ["treasure beach", "st. elizabeth", "st elizabeth", "black river", "parottee"],
  portmore: ["portmore", "hellshire", "st. catherine", "st catherine"],
  mandeville: ["mandeville", "manchester"],
  falmouth: ["falmouth", "trelawny"],
  "blue-mountains": ["blue mountain", "holywell", "irish town"],
  "all-jamaica": ["jamaica"],
  trinidad: ["port of spain", "trinidad"],
  barbados: ["bridgetown", "barbados"],
  bahamas: ["nassau", "bahamas"],
  guyana: ["georgetown", "guyana"],
  "dominican-republic": ["santo domingo", "dominican"],
  "puerto-rico": ["san juan", "puerto rico"],
  cuba: ["havana", "habana", "cuba"],
  haiti: ["port-au-prince", "haiti"],
  curacao: ["willemstad", "curacao", "curaçao"],
  antigua: ["st. john's", "st john's", "antigua"],
  "st-lucia": ["castries", "saint lucia", "st lucia"],
  cayman: ["george town", "cayman"],
  belize: ["belize city", "belize"],
  grenada: ["st. george's", "st george's", "grenada"],
  bermuda: ["hamilton", "bermuda"],
  miami: ["miami", "south florida"],
  "new-york": ["new york", "nyc", "brooklyn"],
};

const JAMAICA_CITY_IDS = ALL_CITY_HUBS
  .filter((hub) => hub.category === "jamaica" && hub.id !== "all-jamaica")
  .map((hub) => hub.id);

export function resolveCityHub(value?: string | null): CityOption | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return ALL_CITY_HUBS.find((hub) => hub.id === normalized) ?? null;
}

export function getDefaultCityHub(): CityOption {
  return resolveCityHub(DEFAULT_CITY_HUB_ID) ?? ALL_CITY_HUBS[1] ?? ALL_CITY_HUBS[0];
}

export function getCityHubByCountry(countryCode: string): CityOption | null {
  const code = countryCode.trim().toUpperCase();
  if (code === "JM") return getDefaultCityHub();
  return ALL_CITY_HUBS.find((hub) => hub.countryCode === code) ?? null;
}

export function getCityHubCenter(hub: CityOption): { lat: number; lng: number } {
  return CITY_HUB_CENTERS[hub.id] ?? CITY_HUB_CENTERS.kingston;
}

export function isNationwideHub(hub: CityOption): boolean {
  return hub.id === "all-jamaica";
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "'");
}

function tokensFor(hub: CityOption): string[] {
  const extras = EXTRA_TOKENS[hub.id] ?? [];
  const derived = [hub.name, hub.region, hub.id.replace(/-/g, " ")]
    .filter(Boolean)
    .flatMap((part) => String(part).split(/[,&/]/))
    .map((part) => normalizeText(part).trim())
    .filter((part) => part.length >= 4 && part !== "island-wide" && part !== "all jamaica");

  return [...new Set([...extras.map(normalizeText), ...derived])];
}

function haystack(record: LocationLike): string {
  return normalizeText(
    [
      record.city_slug,
      record.city,
      record.location,
      record.venue_name,
      record.country,
      record.country_slug,
      record.country_code,
      record.title,
      record.description,
    ]
      .filter(Boolean)
      .join(" | "),
  );
}

function isUntagged(record: LocationLike): boolean {
  return haystack(record).trim().length === 0;
}

function matchesAnyToken(text: string, tokens: string[]): boolean {
  return tokens.some((token) => token.length >= 3 && text.includes(token));
}

export function matchesCityHub(record: LocationLike, hub: CityOption): boolean {
  if (isUntagged(record)) {
    return hub.id === DEFAULT_CITY_HUB_ID || isNationwideHub(hub);
  }

  const text = haystack(record);
  const slug = record.city_slug?.trim().toLowerCase() || "";

  if (slug && slug === hub.id) return true;

  if (isNationwideHub(hub)) {
    if (record.country_code?.toUpperCase() === "JM") return true;
    if (record.country_slug?.toLowerCase() === "jamaica") return true;
    if (text.includes("jamaica")) return true;
    return JAMAICA_CITY_IDS.some((id) => matchesAnyToken(text, tokensFor(resolveCityHub(id)!)));
  }

  if (slug) {
    const slugHub = resolveCityHub(slug);
    if (slugHub && slugHub.id !== hub.id) return false;
  }

  return matchesAnyToken(text, tokensFor(hub));
}

export function firstCityHubForSlug(countrySlug?: string | null, citySlug?: string | null): CityOption | null {
  if (citySlug) {
    const byId = resolveCityHub(citySlug);
    if (byId) return byId;
    const byToken = ALL_CITY_HUBS.find((hub) => tokensFor(hub).includes(normalizeText(citySlug.replace(/-/g, " "))));
    if (byToken) return byToken;
  }
  if (!countrySlug) return null;
  const normalized = countrySlug.trim().toLowerCase();
  if (normalized === "jamaica") return getDefaultCityHub();
  return ALL_CITY_HUBS.find((hub) => hub.countryName.toLowerCase().replace(/[^a-z]+/g, "-").includes(normalized) || hub.id === normalized) ?? null;
}
