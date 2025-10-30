import { API_BASE_URL } from '../config';
import { buildAuthHeaders } from '../utils/api';

// Enable debug logging
const DEBUG = true;
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log('[API]', ...args);
  }
};

type ApiResponse<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  status: number;
};

class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  debugLog(`Handling response from ${response.url} [${response.status}]`);
  
  let data;
  try {
    data = await response.json();
    debugLog('Response data:', data);
  } catch (error) {
    debugLog('Failed to parse JSON response:', error);
    data = {};
  }
  
  if (!response.ok) {
    const error = {
      code: data?.error?.code || 'UNKNOWN_ERROR',
      message: data?.error?.message || `HTTP Error ${response.status}: ${response.statusText}`,
      details: data?.error?.details || { status: response.status, statusText: response.statusText },
    };
    
    console.error(`API Error [${response.status}]:`, {
      url: response.url,
      status: response.status,
      error,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    });
    
    throw new ApiError(error.message, error.code, response.status, error.details);
  }
  
  return { data, status: response.status };
};

export const api = {
  get: async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const fullUrl = `${API_BASE_URL}${url}`;
    debugLog(`GET ${fullUrl}`, { options });
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(),
        ...options.headers,
      };
      
      debugLog('Request headers:', headers);
      
      const response = await fetch(fullUrl, {
        ...options,
        method: 'GET',
        headers,
        credentials: 'include',
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
    body: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
        body: JSON.stringify(body),
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
    body: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
        body: JSON.stringify(body),
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
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
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
