const RAW_API_BASE = (import.meta.env.VITE_API_URL || "https://api.promorang.co").replace(/\/$/, "");

export const API_BASE_URL = RAW_API_BASE.endsWith("/api")
  ? RAW_API_BASE
  : `${RAW_API_BASE}/api`;
