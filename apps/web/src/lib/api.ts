const CONFIGURED_API_BASE = (import.meta.env.VITE_API_URL || "https://api.promorang.co").replace(/\/$/, "");

// Production browser requests use a same-origin Vercel proxy. This avoids an
// otherwise unnecessary CORS dependency between promorang.co and its API while
// leaving local development and preview deployments pointed at their configured
// backends.
const shouldUseProductionProxy = typeof window !== "undefined"
  && /(^|\.)promorang\.co$/i.test(window.location.hostname)
  && /^https:\/\/api\.promorang\.co(?:\/api)?$/i.test(CONFIGURED_API_BASE);

const RAW_API_BASE = shouldUseProductionProxy ? "/api/backend" : CONFIGURED_API_BASE;

export const API_BASE_URL = RAW_API_BASE === "/api/backend" || RAW_API_BASE.endsWith("/api")
  ? RAW_API_BASE
  : `${RAW_API_BASE}/api`;
