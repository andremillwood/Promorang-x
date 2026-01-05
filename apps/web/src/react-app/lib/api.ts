// API Response type
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  details?: any;
  [key: string]: any; // Allow additional properties
};

class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  endpoint: string;
  timestamp: string;
  response?: any;
  statusText?: string;
  originalMessage?: string;

  constructor(
    message: string, 
    status: number, 
    options: {
      code?: string;
      details?: any;
      endpoint: string;
      response?: any;
      statusText?: string;
      originalMessage?: string;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code;
    this.details = options.details;
    this.endpoint = options.endpoint;
    this.response = options.response;
    this.statusText = options.statusText;
    this.originalMessage = options.originalMessage;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      endpoint: this.endpoint,
      timestamp: this.timestamp,
      response: this.response,
      statusText: this.statusText,
      originalMessage: this.originalMessage
    };
  }
}

// Base URL with /api/ prefix to match backend routes
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

// Get the current access token
export function getAccessToken(): string | null {
  const token = localStorage.getItem('access_token');
  if (process.env.NODE_ENV === 'development') {
    console.log('getAccessToken called, token exists:', token ? 'YES' : 'NO');
  }
  return token;
}

// Set the access token
export function setAccessToken(token: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('setAccessToken called with token:', token.substring(0, 20) + '...');
  }
  localStorage.setItem('access_token', token);
  if (process.env.NODE_ENV === 'development') {
    console.log('Token saved to localStorage');
  }
}

// Remove the access token
export function removeAccessToken(): void {
  localStorage.removeItem('access_token');
}

// Get auth headers
export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  if (token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Including auth token in request headers');
    }
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn('No auth token available for request');
  }
  return { 'Content-Type': 'application/json' };
}


interface ApiFetchOptions extends RequestInit {
  returnRawResponse?: boolean;
}

// Main API fetch function with JWT authentication
export async function apiFetch<T = any>(
  endpoint: string, 
  options: ApiFetchOptions = {}
): Promise<T> {
  const { returnRawResponse = false, ...fetchOptions } = options;
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    // Always get fresh token for each request
    const authHeaders = getAuthHeaders();
    
    // Prepare headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {})
    });
    
    // Log request details for debugging
    console.log('Request headers:', Object.fromEntries(headers.entries()));
    
    // Make the request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });
    
    // Log response status and headers for debugging
    console.log(`API Response: ${response.status} ${response.statusText} for ${url}`);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Log response status
    console.log(`API Response: ${response.status} ${response.statusText} for ${url}`);

    // For raw responses (like file downloads), return the response as is
    if (returnRawResponse) {
      return response as unknown as T;
    }

    // Clone the response so we can read it multiple times
    const responseClone = response.clone();
    let responseBody: any;
    
    try {
      const text = await responseClone.text();
      // Try to parse as JSON if possible
      try {
        responseBody = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn('Response is not JSON:', text);
        responseBody = { message: text };
      }
    } catch (e) {
      console.error('Failed to read response body:', e);
      responseBody = { message: 'Failed to read response' };
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      removeAccessToken();
      // Don't force redirect here - let the calling code handle it
      // This prevents redirect loops during session checks
      throw new ApiError(
        responseBody.message || 'Unauthorized - Please log in again', 
        response.status, 
        { 
          code: responseBody.code || 'UNAUTHORIZED',
          details: responseBody.details || 'Authentication required',
          endpoint,
          response: responseBody,
          statusText: response.statusText
        }
      );
    }

    // Handle other error statuses
    if (!response.ok) {
      const errorMessage = responseBody?.message || 
                         responseBody?.error || 
                         response.statusText || 
                         'An error occurred';
      
      throw new ApiError(
        errorMessage,
        response.status,
        {
          code: responseBody?.code || 'API_ERROR',
          details: responseBody,
          endpoint,
          statusText: response.statusText
        }
      );
    }

    // Return the parsed response body if available
    if (responseBody) {
      // If the response has a data property, use that (common in REST APIs)
      if (responseBody.data !== undefined) {
        return responseBody.data as T;
      }
      // Otherwise return the whole response
      return responseBody as T;
    }

    // If no body, return the response status as data
    return { status: response.status } as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error);
      throw error;
    }
    
    console.error('API request failed:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500,
      {
        code: 'REQUEST_FAILED',
        details: error,
        endpoint,
        originalMessage: error instanceof Error ? error.message : 'Failed to process request'
      }
    );
  }
}

// Helper methods for common HTTP methods
const api = {
  get: <T = any>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<ApiResponse<T>>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) => 
    apiFetch<ApiResponse<T>>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined
    }),

  put: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) => 
    apiFetch<ApiResponse<T>>(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined
    }),

  delete: <T = any>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<ApiResponse<T>>(endpoint, { 
      ...options, 
      method: 'DELETE' 
    }),

  patch: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) => 
    apiFetch<ApiResponse<T>>(endpoint, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined
    }),

  // Raw fetch for non-JSON responses or custom handling
  raw: <T = any>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { 
      ...options, 
      returnRawResponse: true 
    })
};

export { api as default, ApiError };

export type { ApiResponse };
