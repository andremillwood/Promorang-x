const CONFIGURED_API_BASE = (import.meta.env.VITE_API_URL || "https://api.promorang.co").replace(/\/$/, "");

// Production browser requests always use the same-origin Vercel proxy. The
// public site is served from both promorang.co and www.promorang.co, so making
// this independent of the configured API origin prevents a production env
// override from re-introducing cross-origin/CORS failures. Local development
// and Vercel previews continue to use their configured backend directly.
const shouldUseProductionProxy = typeof window !== "undefined"
  && /(^|\.)promorang\.co$/i.test(window.location.hostname);

const RAW_API_BASE = shouldUseProductionProxy ? "/api/backend" : CONFIGURED_API_BASE;

export const API_BASE_URL = RAW_API_BASE === "/api/backend" || RAW_API_BASE.endsWith("/api")
  ? RAW_API_BASE
  : `${RAW_API_BASE}/api`;
