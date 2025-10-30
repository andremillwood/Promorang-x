const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function getFullUrl(input: RequestInfo | URL): string {
  // If input is already a full URL, return it as is
  if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
    return input;
  }
  
  // If input is a URL object, convert it to string
  const path = input.toString();
  
  // If the path already starts with the base URL, return it as is
  if (path.startsWith(API_BASE_URL)) {
    return path;
  }
  
  // Otherwise, prepend the base URL
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit & { skipAuth?: boolean } = {}
) {
  const { skipAuth, headers, ...rest } = init;
  const authToken = typeof window !== 'undefined' && !skipAuth ? localStorage.getItem('authToken') : null;

  const finalHeaders = new Headers(headers);
  if (authToken && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  const url = getFullUrl(input);
  
  // Log the request for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Request: ${rest.method || 'GET'} ${url}`);
  }

  return fetch(url, { ...rest, headers: finalHeaders });
}

export const api = {
  get: (url: string, init?: RequestInit) => apiFetch(url, { ...init, method: 'GET' }),
  post: (url: string, body?: any, init?: RequestInit) =>
    apiFetch(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      ...init,
    }),
};
