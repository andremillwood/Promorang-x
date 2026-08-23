export const MARKET_FEATURES = [
  "cityDiscovery",
  "momentCreation",
  "localOffers",
  "sponsoredRewards",
  "gemPurchases",
  "gemWithdrawals",
  "pieces",
  "liquidity",
  "cityStewards",
] as const;

export type MarketFeature = (typeof MARKET_FEATURES)[number];
export type MarketLaunchStage = "live" | "pilot" | "planned";

export type CityMarket = {
  slug: string;
  name: string;
  timezone: string;
  headline: string;
  description: string;
};

export type CountryMarket = {
  code: string;
  slug: string;
  name: string;
  currency: string;
  locale: "en" | "es-419" | "pt-BR";
  timezone: string;
  launchStage: MarketLaunchStage;
  features: Record<MarketFeature, boolean>;
  cities: readonly CityMarket[];
};

const safePilotFeatures: Record<MarketFeature, boolean> = {
  cityDiscovery: true,
  momentCreation: true,
  localOffers: true,
  sponsoredRewards: true,
  gemPurchases: false,
  gemWithdrawals: false,
  pieces: false,
  liquidity: false,
  cityStewards: true,
};

const plannedFeatures: Record<MarketFeature, boolean> = {
  ...safePilotFeatures,
  momentCreation: false,
  localOffers: false,
  sponsoredRewards: false,
};

export const COUNTRY_MARKETS = [
  {
    code: "JM", slug: "jamaica", name: "Jamaica", currency: "JMD", locale: "en", timezone: "America/Jamaica", launchStage: "live",
    features: { ...safePilotFeatures, gemPurchases: true },
    cities: [
      { slug: "kingston", name: "Kingston", timezone: "America/Jamaica", headline: "Kingston decides what moves next.", description: "Follow the Scenes, food, music, nightlife, and people shaping the city this week." },
      { slug: "montego-bay", name: "Montego Bay", timezone: "America/Jamaica", headline: "Meet the real Montego Bay.", description: "Discover local culture, trusted places, and Moments beyond the familiar route." },
    ],
  },
  {
    code: "TT", slug: "trinidad-and-tobago", name: "Trinidad & Tobago", currency: "TTD", locale: "en", timezone: "America/Port_of_Spain", launchStage: "pilot",
    features: safePilotFeatures,
    cities: [{ slug: "port-of-spain", name: "Port of Spain", timezone: "America/Port_of_Spain", headline: "Port of Spain is always in motion.", description: "Find the music, food, fetes, creators, and communities carrying the city forward." }],
  },
  {
    code: "BB", slug: "barbados", name: "Barbados", currency: "BBD", locale: "en", timezone: "America/Barbados", launchStage: "pilot",
    features: safePilotFeatures,
    cities: [{ slug: "bridgetown", name: "Bridgetown", timezone: "America/Barbados", headline: "See Bridgetown through local eyes.", description: "Discover the island's active Scenes, independent places, and Moments worth joining." }],
  },
  {
    code: "BS", slug: "the-bahamas", name: "The Bahamas", currency: "BSD", locale: "en", timezone: "America/Nassau", launchStage: "pilot",
    features: safePilotFeatures,
    cities: [{ slug: "nassau", name: "Nassau", timezone: "America/Nassau", headline: "Discover the Nassau locals live.", description: "Follow the food, music, art, island communities, and experiences moving beyond the resort map." }],
  },
  {
    code: "GY", slug: "guyana", name: "Guyana", currency: "GYD", locale: "en", timezone: "America/Guyana", launchStage: "pilot",
    features: safePilotFeatures,
    cities: [{ slug: "georgetown", name: "Georgetown", timezone: "America/Guyana", headline: "Georgetown brings worlds together.", description: "Discover the food, music, heritage, creators, and communities shaping Guyana's capital." }],
  },
  {
    code: "AG", slug: "antigua-and-barbuda", name: "Antigua & Barbuda", currency: "XCD", locale: "en", timezone: "America/Antigua", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "st-johns", name: "St. John's", timezone: "America/Antigua", headline: "Find the rhythm of St. John's.", description: "Meet the places, people, and island Moments that deserve a wider signal." }],
  },
  {
    code: "BZ", slug: "belize", name: "Belize", currency: "BZD", locale: "en", timezone: "America/Belize", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "belize-city", name: "Belize City", timezone: "America/Belize", headline: "Belize City is a cultural crossroads.", description: "Discover local food, music, heritage, and community experiences across the city." }],
  },
  {
    code: "DM", slug: "dominica", name: "Dominica", currency: "XCD", locale: "en", timezone: "America/Dominica", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "roseau", name: "Roseau", timezone: "America/Dominica", headline: "Roseau opens into the Nature Island.", description: "Find community, culture, food, music, and experiences rooted in Dominica." }],
  },
  {
    code: "GD", slug: "grenada", name: "Grenada", currency: "XCD", locale: "en", timezone: "America/Grenada", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "st-georges", name: "St. George's", timezone: "America/Grenada", headline: "St. George's has more to share.", description: "Follow the Spice Island's local Scenes, gathering places, and creative energy." }],
  },
  {
    code: "KN", slug: "saint-kitts-and-nevis", name: "Saint Kitts & Nevis", currency: "XCD", locale: "en", timezone: "America/St_Kitts", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "basseterre", name: "Basseterre", timezone: "America/St_Kitts", headline: "Basseterre is ready to be explored locally.", description: "Discover trusted places, island culture, and Moments built by the people who live here." }],
  },
  {
    code: "LC", slug: "saint-lucia", name: "Saint Lucia", currency: "XCD", locale: "en", timezone: "America/St_Lucia", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "castries", name: "Castries", timezone: "America/St_Lucia", headline: "See what is moving Castries.", description: "Find local culture, community, food, music, and experiences across Saint Lucia." }],
  },
  {
    code: "VC", slug: "saint-vincent-and-the-grenadines", name: "Saint Vincent & the Grenadines", currency: "XCD", locale: "en", timezone: "America/St_Vincent", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "kingstown", name: "Kingstown", timezone: "America/St_Vincent", headline: "Kingstown carries the Vincy signal.", description: "Discover the people, places, and Moments connecting Saint Vincent and the Grenadines." }],
  },
  {
    code: "CU", slug: "cuba", name: "Cuba", currency: "CUP", locale: "es-419", timezone: "America/Havana", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "havana", name: "Havana", timezone: "America/Havana", headline: "La Habana se vive desde adentro.", description: "Descubre sus escenas, espacios, creadores y momentos a través de las comunidades locales." }],
  },
  {
    code: "HT", slug: "haiti", name: "Haiti", currency: "HTG", locale: "en", timezone: "America/Port-au-Prince", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "port-au-prince", name: "Port-au-Prince", timezone: "America/Port-au-Prince", headline: "Port-au-Prince creates its own signal.", description: "Discover the artists, communities, places, and cultural Moments shaping the capital." }],
  },
  {
    code: "SR", slug: "suriname", name: "Suriname", currency: "SRD", locale: "en", timezone: "America/Paramaribo", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "paramaribo", name: "Paramaribo", timezone: "America/Paramaribo", headline: "Paramaribo brings cultures together.", description: "Find the city's food, heritage, nightlife, creators, and community gatherings." }],
  },
  {
    code: "PR", slug: "puerto-rico", name: "Puerto Rico", currency: "USD", locale: "es-419", timezone: "America/Puerto_Rico", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "san-juan", name: "San Juan", timezone: "America/Puerto_Rico", headline: "San Juan se descubre participando.", description: "Conecta con la música, la comida, los espacios y las comunidades que mueven la ciudad." }],
  },
  {
    code: "AW", slug: "aruba", name: "Aruba", currency: "AWG", locale: "en", timezone: "America/Aruba", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "oranjestad", name: "Oranjestad", timezone: "America/Aruba", headline: "Meet the Oranjestad beyond the postcard.", description: "Discover local culture, food, gatherings, and independent places across Aruba." }],
  },
  {
    code: "CW", slug: "curacao", name: "Curaçao", currency: "XCG", locale: "en", timezone: "America/Curacao", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "willemstad", name: "Willemstad", timezone: "America/Curacao", headline: "Willemstad moves in many languages.", description: "Follow the local culture, food, music, and communities that give Curaçao its rhythm." }],
  },
  {
    code: "SX", slug: "sint-maarten", name: "Sint Maarten", currency: "XCG", locale: "en", timezone: "America/Lower_Princes", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "philipsburg", name: "Philipsburg", timezone: "America/Lower_Princes", headline: "Philipsburg connects the island.", description: "Discover local Moments, gathering places, and communities across Sint Maarten." }],
  },
  {
    code: "VI", slug: "us-virgin-islands", name: "U.S. Virgin Islands", currency: "USD", locale: "en", timezone: "America/St_Thomas", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "charlotte-amalie", name: "Charlotte Amalie", timezone: "America/St_Thomas", headline: "See Charlotte Amalie through local eyes.", description: "Find island culture, community, food, music, and experiences beyond the visitor trail." }],
  },
  {
    code: "VG", slug: "british-virgin-islands", name: "British Virgin Islands", currency: "USD", locale: "en", timezone: "America/Tortola", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "road-town", name: "Road Town", timezone: "America/Tortola", headline: "Road Town is the BVI's local signal.", description: "Discover community gatherings, places, and island experiences built from the ground up." }],
  },
  {
    code: "KY", slug: "cayman-islands", name: "Cayman Islands", currency: "KYD", locale: "en", timezone: "America/Cayman", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "george-town", name: "George Town", timezone: "America/Cayman", headline: "George Town has a local story.", description: "Meet the creators, places, communities, and Moments shaping life in Cayman." }],
  },
  {
    code: "TC", slug: "turks-and-caicos-islands", name: "Turks & Caicos Islands", currency: "USD", locale: "en", timezone: "America/Grand_Turk", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "cockburn-town", name: "Cockburn Town", timezone: "America/Grand_Turk", headline: "Discover Turks & Caicos locally.", description: "Find trusted island places, gatherings, and cultural experiences beyond the familiar view." }],
  },
  {
    code: "AI", slug: "anguilla", name: "Anguilla", currency: "XCD", locale: "en", timezone: "America/Anguilla", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "the-valley", name: "The Valley", timezone: "America/Anguilla", headline: "The Valley carries Anguilla's signal.", description: "Discover the island's local food, music, community, and Moments worth joining." }],
  },
  {
    code: "MS", slug: "montserrat", name: "Montserrat", currency: "XCD", locale: "en", timezone: "America/Montserrat", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "brades", name: "Brades", timezone: "America/Montserrat", headline: "Montserrat keeps creating.", description: "Follow the people, places, heritage, and gatherings carrying the island forward." }],
  },
  {
    code: "BM", slug: "bermuda", name: "Bermuda", currency: "BMD", locale: "en", timezone: "Atlantic/Bermuda", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "hamilton", name: "Hamilton", timezone: "Atlantic/Bermuda", headline: "Hamilton is more than a destination.", description: "Discover Bermuda's local communities, independent places, and cultural calendar." }],
  },
  {
    code: "GP", slug: "guadeloupe", name: "Guadeloupe", currency: "EUR", locale: "en", timezone: "America/Guadeloupe", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "pointe-a-pitre", name: "Pointe-à-Pitre", timezone: "America/Guadeloupe", headline: "Pointe-à-Pitre moves with Guadeloupe.", description: "Discover local culture, food, music, places, and community experiences." }],
  },
  {
    code: "MQ", slug: "martinique", name: "Martinique", currency: "EUR", locale: "en", timezone: "America/Martinique", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "fort-de-france", name: "Fort-de-France", timezone: "America/Martinique", headline: "Fort-de-France has its own rhythm.", description: "Find the places, communities, and cultural Moments moving Martinique." }],
  },
  {
    code: "BQ", slug: "caribbean-netherlands", name: "Caribbean Netherlands", currency: "USD", locale: "en", timezone: "America/Kralendijk", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "kralendijk", name: "Kralendijk", timezone: "America/Kralendijk", headline: "Discover Bonaire from the inside.", description: "Follow local places, communities, nature, food, and island experiences around Kralendijk." }],
  },
  {
    code: "GF", slug: "french-guiana", name: "French Guiana", currency: "EUR", locale: "en", timezone: "America/Cayenne", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "cayenne", name: "Cayenne", timezone: "America/Cayenne", headline: "Cayenne connects Caribbean and Amazonian worlds.", description: "Discover local culture, food, creators, places, and community gatherings." }],
  },
  {
    code: "GH", slug: "ghana", name: "Ghana", currency: "GHS", locale: "en", timezone: "Africa/Accra", launchStage: "pilot",
    features: safePilotFeatures,
    cities: [{ slug: "accra", name: "Accra", timezone: "Africa/Accra", headline: "Accra sets the pace.", description: "Follow the music, food, fashion, campus life, and creative communities moving Accra." }],
  },
  {
    code: "NG", slug: "nigeria", name: "Nigeria", currency: "NGN", locale: "en", timezone: "Africa/Lagos", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "lagos", name: "Lagos", timezone: "Africa/Lagos", headline: "Lagos moves at full volume.", description: "Get closer to the creators, places, and communities defining what happens next." }],
  },
  {
    code: "DO", slug: "dominican-republic", name: "Dominican Republic", currency: "DOP", locale: "es-419", timezone: "America/Santo_Domingo", launchStage: "pilot",
    features: safePilotFeatures,
    cities: [{ slug: "santo-domingo", name: "Santo Domingo", timezone: "America/Santo_Domingo", headline: "Santo Domingo se mueve contigo.", description: "Descubre la música, la comida, los espacios y las comunidades que le dan vida a la ciudad." }],
  },
  {
    code: "CO", slug: "colombia", name: "Colombia", currency: "COP", locale: "es-419", timezone: "America/Bogota",
    features: safePilotFeatures,
    launchStage: "pilot",
    cities: [
      { slug: "medellin", name: "Medellín", timezone: "America/Bogota", headline: "Medellín se descubre participando.", description: "Conecta con los espacios, creadores y Momentos que están transformando la ciudad." },
      { slug: "bogota", name: "Bogotá", timezone: "America/Bogota", headline: "Bogotá siempre tiene otra escena.", description: "Descubre la música, la comida, el arte, los barrios y las comunidades que mueven la capital." },
    ],
  },
  {
    code: "BR", slug: "brazil", name: "Brazil", currency: "BRL", locale: "pt-BR", timezone: "America/Sao_Paulo", launchStage: "planned",
    features: plannedFeatures,
    cities: [
      { slug: "sao-paulo", name: "São Paulo", timezone: "America/Sao_Paulo", headline: "São Paulo acontece por toda parte.", description: "Encontre cenas, espaços e pessoas que fazem a cidade se mover." },
      { slug: "rio-de-janeiro", name: "Rio de Janeiro", timezone: "America/Sao_Paulo", headline: "O Rio acontece em muitas cenas.", description: "Descubra música, cultura, comida, bairros e experiências através de quem vive a cidade." },
    ],
  },
  {
    code: "PA", slug: "panama", name: "Panama", currency: "PAB", locale: "es-419", timezone: "America/Panama", launchStage: "pilot",
    features: safePilotFeatures,
    cities: [{ slug: "panama-city", name: "Panama City", timezone: "America/Panama", headline: "Ciudad de Panamá conecta la región.", description: "Descubre las escenas, espacios, sabores y comunidades que se encuentran en la ciudad." }],
  },
  {
    code: "MX", slug: "mexico", name: "Mexico", currency: "MXN", locale: "es-419", timezone: "America/Mexico_City", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "mexico-city", name: "Mexico City", timezone: "America/Mexico_City", headline: "La Ciudad de México nunca tiene una sola escena.", description: "Encuentra cultura, comida, música, barrios y Momentos a través de las comunidades que los crean." }],
  },
  {
    code: "GT", slug: "guatemala", name: "Guatemala", currency: "GTQ", locale: "es-419", timezone: "America/Guatemala", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "guatemala-city", name: "Guatemala City", timezone: "America/Guatemala", headline: "Ciudad de Guatemala está creando nuevas escenas.", description: "Descubre espacios, creadores, comida, arte y comunidades que están moviendo la capital." }],
  },
  {
    code: "HN", slug: "honduras", name: "Honduras", currency: "HNL", locale: "es-419", timezone: "America/Tegucigalpa", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "tegucigalpa", name: "Tegucigalpa", timezone: "America/Tegucigalpa", headline: "Tegucigalpa se descubre desde sus comunidades.", description: "Encuentra cultura, espacios locales y Momentos creados por las personas que viven la ciudad." }],
  },
  {
    code: "SV", slug: "el-salvador", name: "El Salvador", currency: "USD", locale: "es-419", timezone: "America/El_Salvador", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "san-salvador", name: "San Salvador", timezone: "America/El_Salvador", headline: "San Salvador tiene una señal propia.", description: "Descubre sus espacios, sabores, creadores y comunidades a través de Momentos locales." }],
  },
  {
    code: "NI", slug: "nicaragua", name: "Nicaragua", currency: "NIO", locale: "es-419", timezone: "America/Managua", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "managua", name: "Managua", timezone: "America/Managua", headline: "Managua se mueve con su gente.", description: "Encuentra lugares, cultura, comida y comunidades que están dando forma a la ciudad." }],
  },
  {
    code: "CR", slug: "costa-rica", name: "Costa Rica", currency: "CRC", locale: "es-419", timezone: "America/Costa_Rica", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "san-jose", name: "San José", timezone: "America/Costa_Rica", headline: "San José tiene mucho por descubrir.", description: "Conecta con la cultura, la comida, los espacios y las comunidades que mueven la ciudad." }],
  },
  {
    code: "AR", slug: "argentina", name: "Argentina", currency: "ARS", locale: "es-419", timezone: "America/Argentina/Buenos_Aires", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "buenos-aires", name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", headline: "Buenos Aires siempre abre otra puerta.", description: "Descubre música, gastronomía, arte, barrios y comunidades a través de Momentos locales." }],
  },
  {
    code: "BO", slug: "bolivia", name: "Bolivia", currency: "BOB", locale: "es-419", timezone: "America/La_Paz", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "la-paz", name: "La Paz", timezone: "America/La_Paz", headline: "La Paz conecta altura, cultura y comunidad.", description: "Encuentra espacios, tradiciones, creadores y Momentos que muestran cómo se vive la ciudad." }],
  },
  {
    code: "CL", slug: "chile", name: "Chile", currency: "CLP", locale: "es-419", timezone: "America/Santiago", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "santiago", name: "Santiago", timezone: "America/Santiago", headline: "Santiago tiene muchas ciudades dentro.", description: "Descubre barrios, música, comida, cultura y comunidades que están creando lo próximo." }],
  },
  {
    code: "EC", slug: "ecuador", name: "Ecuador", currency: "USD", locale: "es-419", timezone: "America/Guayaquil", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "quito", name: "Quito", timezone: "America/Guayaquil", headline: "Quito se descubre caminando y participando.", description: "Conecta con espacios, cultura, comida y comunidades que dan vida a la capital." }],
  },
  {
    code: "PY", slug: "paraguay", name: "Paraguay", currency: "PYG", locale: "es-419", timezone: "America/Asuncion", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "asuncion", name: "Asunción", timezone: "America/Asuncion", headline: "Asunción está construyendo su próxima escena.", description: "Descubre lugares, creadores, gastronomía y comunidades que mueven la ciudad." }],
  },
  {
    code: "PE", slug: "peru", name: "Peru", currency: "PEN", locale: "es-419", timezone: "America/Lima", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "lima", name: "Lima", timezone: "America/Lima", headline: "Lima se entiende a través de sus escenas.", description: "Encuentra gastronomía, música, arte, espacios y comunidades que conectan la ciudad." }],
  },
  {
    code: "UY", slug: "uruguay", name: "Uruguay", currency: "UYU", locale: "es-419", timezone: "America/Montevideo", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "montevideo", name: "Montevideo", timezone: "America/Montevideo", headline: "Montevideo tiene un ritmo cercano.", description: "Descubre cultura, música, gastronomía y comunidades a través de Momentos locales." }],
  },
  {
    code: "VE", slug: "venezuela", name: "Venezuela", currency: "VES", locale: "es-419", timezone: "America/Caracas", launchStage: "planned",
    features: plannedFeatures,
    cities: [{ slug: "caracas", name: "Caracas", timezone: "America/Caracas", headline: "Caracas crea incluso cuando todo cambia.", description: "Encuentra las escenas, espacios, creadores y comunidades que mantienen la ciudad en movimiento." }],
  },
] as const satisfies readonly CountryMarket[];

export const DEFAULT_COUNTRY_CODE = "JM";

export function getCountryMarket(value?: string | null): CountryMarket {
  const normalized = value?.trim().toLowerCase();
  return COUNTRY_MARKETS.find((market) => market.code.toLowerCase() === normalized || market.slug === normalized || market.name.toLowerCase() === normalized)
    ?? COUNTRY_MARKETS[0];
}

export function getCityMarket(country: CountryMarket, citySlug?: string | null) {
  return country.cities.find((city) => city.slug === citySlug) ?? null;
}

export function isMarketFeatureEnabled(country: CountryMarket, feature: MarketFeature) {
  return country.features[feature];
}

export function formatMarketCurrency(value: number, country: CountryMarket, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat(country.locale, { style: "currency", currency: country.currency, ...options }).format(value);
}

export function formatMarketDate(value: Date | string | number, country: CountryMarket, timezone = country.timezone, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(country.locale, { timeZone: timezone, ...options }).format(new Date(value));
}
