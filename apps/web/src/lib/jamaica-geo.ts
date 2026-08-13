const JAMAICA_CITY_HINTS = [
  "kingston",
  "new kingston",
  "half way tree",
  "halfway tree",
  "montego bay",
  "spanish town",
  "portmore",
  "may pen",
  "negril",
  "ocho rios",
  "mandeville",
];

export type PlaceGeo = {
  city: string | null;
  country: string | null;
  country_code: string | null;
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

function extractCity(city?: string | null, location?: string | null) {
  const explicit = clean(city);
  if (explicit) return explicit;
  const loc = clean(location);
  if (!loc) return null;
  const parts = loc.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return loc;
  const withoutCountry = parts.filter((part) => !/^(jamaica|jm|united states|usa|us)$/i.test(part));
  const kingstonPart = withoutCountry.find((part) => /kingston/i.test(part));
  if (kingstonPart) return "Kingston";
  return withoutCountry[0] || parts[0];
}

/**
 * Kingston always maps to Jamaica (JM). Do not use America/Jamaica TZ as geo.
 */
export function resolvePlaceGeo(input: {
  city?: string | null;
  location?: string | null;
  country?: string | null;
  countryCode?: string | null;
  timezone?: string | null;
} = {}): PlaceGeo {
  void input.timezone;
  const extractedCity = extractCity(input.city, input.location);
  const haystack = [input.city, input.location, input.country, input.countryCode, extractedCity]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const kingston = /\bkingston\b/.test(haystack);
  const jamaicaHint =
    clean(input.countryCode).toUpperCase() === "JM" ||
    /^jamaica$/i.test(clean(input.country)) ||
    JAMAICA_CITY_HINTS.some((hint) => haystack.includes(hint)) ||
    /\bjamaica\b/.test(haystack) ||
    /\bjm\b/.test(haystack);

  if (kingston || jamaicaHint) {
    return {
      city: kingston ? "Kingston" : extractedCity || clean(input.city) || null,
      country: "Jamaica",
      country_code: "JM",
    };
  }

  return {
    city: extractedCity || clean(input.city) || null,
    country: clean(input.country) || null,
    country_code: clean(input.countryCode).toUpperCase() || null,
  };
}

/** Live gold_regions.id for Jamaica. moments has no gold_region column. */
export const JAMAICA_GOLD_REGION_ID = "a6a363f4-32d2-4f3b-b8bc-013255851621";

/** Live mechanic_proof_type labels (moments.proof_type). Title Case, exact strings. */
export const MECHANIC_PROOF_TYPES = [
  "QR",
  "GPS",
  "Photo",
  "Video",
  "API",
  "Code",
  "Share",
  "Screenshot",
  "Link",
] as const;

export type MechanicProofType = (typeof MECHANIC_PROOF_TYPES)[number];

/** Live moment_move_proof_type labels (moment_moves.proof_type). Lowercase only. */
export type MoveProofType = "code" | "photo" | "video" | "referral" | "link";

const MOMENT_PROOF_TYPE_ALIASES: Record<string, MechanicProofType> = {
  qr: "QR",
  gps: "GPS",
  photo: "Photo",
  image: "Photo",
  video: "Video",
  api: "API",
  code: "Code",
  referral: "Code",
  share: "Share",
  screenshot: "Screenshot",
  link: "Link",
  url: "Link",
};

export const LOCAL_DROP_PROOF_OPTIONS = [
  { value: "Screenshot", label: "Screenshot", description: "Upload a photo or screenshot as proof." },
  { value: "Share", label: "Share proof", description: "Show the share you made with a screenshot or link." },
  { value: "Link", label: "Link", description: "Paste the public post or completed-action URL." },
  { value: "QR", label: "QR / code", description: "Venue code or QR scan. Secondary for Local Drops." },
  { value: "GPS", label: "Location", description: "Confirm presence at the venue." },
  { value: "Photo", label: "Photo", description: "On-site photo mark." },
  { value: "Video", label: "Video", description: "Short video mark." },
  { value: "Code", label: "Code", description: "Staff or check-in code." },
] as const;

export function toMomentProofEnum(proofType?: string | null): MechanicProofType {
  const raw = String(proofType || "Screenshot").trim();
  if ((MECHANIC_PROOF_TYPES as readonly string[]).includes(raw)) {
    return raw as MechanicProofType;
  }
  const key = raw.toLowerCase();
  return MOMENT_PROOF_TYPE_ALIASES[key] || "Screenshot";
}

export function toMoveProofType(proofType?: string | null): MoveProofType {
  const key = String(proofType || "Screenshot").trim().toLowerCase();
  if (key === "screenshot" || key === "share" || key === "photo" || key === "image") return "photo";
  if (key === "link" || key === "url" || key === "api") return "link";
  if (key === "video") return "video";
  if (key === "referral") return "referral";
  return "code";
}
