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

async function handleResponse<T = any>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = new Error(data.error || 'API request failed');
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }
  
  return data;
}

export async function apiFetch<T = any>(
  input: RequestInfo | URL,
  init: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, headers, ...rest } = init;
  const authToken = typeof window !== 'undefined' && !skipAuth ? localStorage.getItem('auth_token') : null;

  const finalHeaders = new Headers({
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> || {})
  });
  
  if (authToken && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  const url = getFullUrl(input);
  
  // Log the request for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Request: ${rest.method || 'GET'} ${url}`);
  }

  try {
    const response = await fetch(url, { 
      ...rest, 
      headers: finalHeaders,
      credentials: 'include'
    });
    
    return await handleResponse<T>(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const api = {
  get: <T = any>(url: string, init?: RequestInit) => 
    apiFetch<T>(url, { ...init, method: 'GET' }),
    
  post: <T = any>(url: string, body?: any, init?: RequestInit) =>
    apiFetch<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    }),
};
