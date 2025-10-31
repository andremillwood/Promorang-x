// API Configuration
const LOCAL_API_URL = 'http://localhost:3001';

// Use VITE_API_URL from environment, fallback to local development URL
const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || LOCAL_API_URL;

// Log environment and configuration for debugging
console.group('API Configuration');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('Using API Base URL:', DEFAULT_API_BASE);
console.groupEnd();

// Add to global scope for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).__API_CONFIG = {
    env: import.meta.env.MODE,
    viteApiUrl: import.meta.env.VITE_API_URL,
    apiBase: DEFAULT_API_BASE,
    timestamp: new Date().toISOString()
  };
}

// Honour VITE_API_URL when provided in the environment
const configuredApiBase = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;
const resolvedBase = configuredApiBase;

const sanitizedBase = (() => {
  if (!resolvedBase) return '';
  const trimmed = resolvedBase.replace(/\/+$/, '');
  // Remove a trailing "/api" to avoid creating "/api/api/*" routes
  return trimmed.replace(/\/api$/, '');
})();

export const API_BASE_URL = sanitizedBase;
const prefix = sanitizedBase;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${prefix}/api/auth/login`,
    REGISTER: `${prefix}/api/auth/register`,
    DEMO: (type: string) => `${prefix}/api/auth/demo/${type}`,
    OAUTH: (provider: string) => `${prefix}/api/auth/oauth/${provider}`,
    LOGOUT: `${prefix}/api/auth/logout`,
    ME: `${prefix}/api/auth/me`
  },
  // Add other API endpoints as needed
};
