import { API_BASE_URL } from '../config';

export const buildAuthHeaders = (headers: Record<string, string> = {}) => {
  if (typeof window === 'undefined') {
    return { ...headers };
  }

  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    return {
      ...headers,
      Authorization: `Bearer ${authToken}`
    };
  }

  return { ...headers };
};

export const resolveApiUrl = (path: string) => {
  if (!path) {
    return API_BASE_URL;
  }

  // Absolute URLs should pass through unchanged
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = API_BASE_URL || '';
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalisedPath}`;
};

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(resolveApiUrl(path), options);
};

if (typeof window !== 'undefined' && !(window as any).__PROMORANG_FETCH_PATCHED__) {
  const originalFetch = window.fetch.bind(window);
  (window as any).__PROMORANG_FETCH_PATCHED__ = true;

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api')) {
        return originalFetch(resolveApiUrl(input), init);
      }
      return originalFetch(input, init);
    }

    if (input instanceof Request) {
      const url = new URL(input.url, window.location.origin);
      if (url.origin === window.location.origin && url.pathname.startsWith('/api')) {
        const redirectedRequest = new Request(resolveApiUrl(url.pathname + url.search), input);
        return originalFetch(redirectedRequest, init);
      }
      return originalFetch(input, init);
    }

    if (input instanceof URL) {
      if (input.origin === window.location.origin && input.pathname.startsWith('/api')) {
        const rewritten = new URL(resolveApiUrl(input.pathname + input.search));
        return originalFetch(rewritten, init);
      }
      return originalFetch(input, init);
    }

    return originalFetch(input, init);
  };
}
