import { API_BASE_URL } from '../config';
import { buildAuthHeaders } from '../utils/api';

// Enable debug logging
const DEBUG = true;
const debugLog = (...args: unknown[]) => {
  if (DEBUG) {
    console.log('[API]', ...args);
  }
};

export type ApiResponse<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  status: number;
};

class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  debugLog(`Handling response from ${response.url} [${response.status}]`);
  
  let data: unknown;
  try {
    data = await response.json();
    debugLog('Response data:', data);
  } catch (error) {
    debugLog('Failed to parse JSON response:', error);
    data = undefined;
  }
  
  if (!response.ok) {
    const envelope = (typeof data === 'object' && data !== null ? (data as ErrorEnvelope) : {});
    const errorInfo = envelope.error ?? {};
    const error = {
      code: errorInfo.code ?? 'UNKNOWN_ERROR',
      message: errorInfo.message ?? `HTTP Error ${response.status}: ${response.statusText}`,
      details: errorInfo.details ?? { status: response.status, statusText: response.statusText },
    };
    
    console.error(`API Error [${response.status}]:`, {
      url: response.url,
      status: response.status,
      error,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    });
    
    throw new ApiError(error.message, error.code, response.status, error.details);
  }
  
  return { data: data as T, status: response.status };
};

const mergeHeaders = (...headerSets: Array<HeadersInit | undefined>): Headers => {
  const headers = new Headers();
  headerSets.forEach(set => {
    if (!set) return;
    const incoming = new Headers(set);
    incoming.forEach((value, key) => {
      headers.set(key, value);
    });
  });
  return headers;
};

const isJsonSerializableBody = (body: unknown): body is Record<string, unknown> => {
  if (body === null || body === undefined) return false;
  if (typeof body !== 'object') return false;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return false;
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return false;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return false;
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return false;
  return true;
};

const prepareBody = (body: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === 'string') {
    return body;
  }

  if (typeof body === 'object') {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      return body;
    }
    if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
      return body;
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
      return body;
    }
    if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
      return body;
    }
  }

  if (isJsonSerializableBody(body)) {
    return JSON.stringify(body);
  }

  return JSON.stringify(body);
};

export const api = {
  get: async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const fullUrl = `${API_BASE_URL}${url}`;
    debugLog(`GET ${fullUrl}`, { options });
    
    try {
      const headers = mergeHeaders(
        { 'Content-Type': 'application/json' },
        buildAuthHeaders(),
        options.headers
      );

      debugLog('Request headers:', Object.fromEntries(headers.entries()));

      const response = await fetch(fullUrl, {
        ...options,
        method: 'GET',
        headers,
        credentials: options.credentials ?? 'include',
      });
      
      debugLog(`Response received for GET ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      return handleResponse<T>(response);
    } catch (error) {
      debugLog(`Error in GET ${url}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Network error occurred',
        'NETWORK_ERROR',
        0,
        { 
          url,
          method: 'GET',
          originalError: error instanceof Error ? error.message : String(error)
        }
      );
    }
  },

  post: async <T>(
    url: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const serializedBody = prepareBody(body);
      const headers = mergeHeaders(
        serializedBody instanceof FormData || body instanceof FormData
          ? undefined
          : { 'Content-Type': 'application/json' },
        buildAuthHeaders(),
        options.headers
      );

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        method: 'POST',
        headers,
        credentials: options.credentials ?? 'include',
        body: serializedBody,
      });
      
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Network error occurred',
        'NETWORK_ERROR',
        0,
        { originalError: error }
      );
    }
  },

  put: async <T>(
    url: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const serializedBody = prepareBody(body);
      const headers = mergeHeaders(
        serializedBody instanceof FormData || body instanceof FormData
          ? undefined
          : { 'Content-Type': 'application/json' },
        buildAuthHeaders(),
        options.headers
      );

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        method: 'PUT',
        headers,
        credentials: options.credentials ?? 'include',
        body: serializedBody,
      });
      
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Network error occurred',
        'NETWORK_ERROR',
        0,
        { originalError: error }
      );
    }
  },

  delete: async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const headers = mergeHeaders(
        { 'Content-Type': 'application/json' },
        buildAuthHeaders(),
        options.headers
      );

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        method: 'DELETE',
        headers,
        credentials: options.credentials ?? 'include',
      });
      
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Network error occurred',
        'NETWORK_ERROR',
        0,
        { originalError: error }
      );
    }
  },
};

export default api;
