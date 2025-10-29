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

  return fetch(input, { ...rest, headers: finalHeaders });
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
