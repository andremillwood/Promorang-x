// API Configuration
const LOCAL_API_URL = 'http://localhost:3001';

const isLocalAddress = (value: string) => /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(value);

const resolveApiBase = () => {
  // Use separate API domain in production
  const envUrl = import.meta.env.PROD
    ? 'https://api.promorang.co'
    : import.meta.env.VITE_API_URL;

  if (envUrl && !isLocalAddress(envUrl)) {
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    const { origin } = window.location;
    const isBrowserLocal = isLocalAddress(origin);

    if (envUrl && isBrowserLocal) {
      return envUrl;
    }

    return isBrowserLocal ? LOCAL_API_URL : origin;
  }

  return envUrl || LOCAL_API_URL;
};

const DEFAULT_API_BASE = resolveApiBase();

// Log environment and configuration for debugging
console.group('API Configuration');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('Resolved API Base URL:', DEFAULT_API_BASE);
console.groupEnd();

const PAYMENT_CONFIG = {
  defaultProvider: import.meta.env.VITE_PAYMENT_PROVIDER || 'mock',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  coinbaseCommerceKey: import.meta.env.VITE_COINBASE_COMMERCE_KEY || '',
  enabled: import.meta.env.VITE_PAYMENTS_ENABLED !== 'false',
};

// Add to global scope for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).__API_CONFIG = {
    env: import.meta.env.MODE,
    viteApiUrl: import.meta.env.VITE_API_URL,
    apiBase: DEFAULT_API_BASE,
    payments: PAYMENT_CONFIG,
    timestamp: new Date().toISOString()
  };
}

// Honour explicit env config and ensure trailing slashes/API suffix are handled
const sanitizedBase = (() => {
  const resolvedBase = DEFAULT_API_BASE;
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
    ME: `${prefix}/api/users/me`
  },
  // Add other API endpoints as needed
};

export { PAYMENT_CONFIG };
