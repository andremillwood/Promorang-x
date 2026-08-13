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

export const LOCAL_DROP_PROOF_OPTIONS = [
  { value: "screenshot", label: "Screenshot", description: "Upload a photo or screenshot as proof." },
  { value: "share", label: "Share proof", description: "Show the share you made with a screenshot or link." },
  { value: "link", label: "Link", description: "Paste the public post or completed-action URL." },
  { value: "QR", label: "QR / code", description: "Venue code or QR scan. Secondary for Local Drops." },
  { value: "GPS", label: "Location", description: "Confirm presence at the venue." },
  { value: "Photo", label: "Photo", description: "On-site photo mark." },
  { value: "Video", label: "Video", description: "Short video mark." },
  { value: "Code", label: "Code", description: "Staff or check-in code." },
] as const;

export function toMomentProofEnum(proofType?: string | null) {
  const key = String(proofType || "screenshot").trim().toLowerCase();
  if (key === "screenshot" || key === "share" || key === "photo" || key === "image") return "Photo";
  if (key === "link" || key === "url" || key === "api") return "API";
  if (key === "video") return "Video";
  if (key === "gps") return "GPS";
  if (key === "qr") return "QR";
  if (key === "code" || key === "referral") return "Code";
  return "Photo";
}

export function toMoveProofType(proofType?: string | null) {
  const key = String(proofType || "screenshot").trim().toLowerCase();
  if (key === "screenshot" || key === "share" || key === "photo" || key === "image") return "photo";
  if (key === "link" || key === "url" || key === "api") return "link";
  if (key === "video") return "video";
  if (key === "referral") return "referral";
  return "code";
}
