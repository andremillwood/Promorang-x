import { supabase } from './supabaseClient';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
}

const MAX_RETRIES = 1;
const RETRY_DELAY = 1000; // 1 second
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Debug log function with timestamp
function debugLog(message: string, data?: any) {
  if (import.meta.env.DEV) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
  }
}

// Error class for API errors
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  endpoint: string;
  timestamp: string;

  constructor(message: string, status: number, options: {
    code?: string;
    details?: any;
    endpoint: string;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code;
    this.details = options.details;
    this.endpoint = options.endpoint;
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
    };
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get the current session with token refresh if needed
 */
async function getSession() {
  try {
    // First try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      debugLog('Session error, attempting to refresh...', sessionError);
      throw sessionError;
    }

    // If we have a session with a valid token, return it
    if (session?.access_token) {
      // Verify token expiration
      const tokenExpiry = JSON.parse(atob(session.access_token.split('.')[1])).exp * 1000;
      const now = Date.now();
      
      // If token is expired or will expire in the next 5 minutes, refresh it
      if (tokenExpiry - now < 5 * 60 * 1000) {
        debugLog('Access token expired or expiring soon, refreshing...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          debugLog('Error refreshing session:', refreshError);
          throw refreshError;
        }
        
        if (!refreshedSession) {
          throw new Error('No session returned after refresh');
        }
        
        return refreshedSession;
      }
      
      return session;
    }
    
    // No valid session, try to refresh
    debugLog('No valid session, attempting to refresh...');
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      debugLog('Error refreshing session:', refreshError);
      throw refreshError;
    }
    
    if (!refreshedSession) {
      throw new Error('No session available after refresh');
    }
    
    return refreshedSession;
  } catch (error) {
    debugLog('Error in getSession:', error);
    throw error;
  }
}

async function apiFetch<T = any>(
  endpoint: string, 
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const requestId = Math.random().toString(36).substring(2, 9);
  
  debugLog(`[${requestId}] API Request: ${options.method || 'GET'} ${endpoint}`);
  
  try {
    // Get or refresh the session
    const session = await getSession();
    
    // Prepare headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(session?.access_token ? { 
        'Authorization': `Bearer ${session.access_token}` 
      } : {}),
      'X-Request-ID': requestId,
      ...options.headers,
    });
    
    debugLog(`[${requestId}] Request headers:`, Object.fromEntries(headers.entries()));
    
    // Make the request
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    // Parse response
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json().catch(() => ({}));
    } else {
      responseData = await response.text();
    }
    
    debugLog(`[${requestId}] Response status: ${response.status}`, responseData);
    
    // Handle 401 Unauthorized - try to refresh token once
    if (response.status === 401 && retryCount < MAX_RETRIES) {
      debugLog(`[${requestId}] Received 401, attempting token refresh (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      // Force refresh the session
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (!refreshError && newSession) {
        // Retry with new token after a small delay
        await delay(RETRY_DELAY);
        return apiFetch<T>(endpoint, options, retryCount + 1);
      }
      
      debugLog(`[${requestId}] Token refresh failed or no new session available`);
    }
    
    // Handle error responses
    if (!response.ok) {
      const errorData = typeof responseData === 'object' ? responseData : { message: responseData };
      
      throw new ApiError(
        errorData.message || response.statusText || 'API request failed',
        response.status,
        {
          code: errorData.code || `HTTP_${response.status}`,
          details: errorData.details || errorData,
          endpoint
        }
      );
    }
    
    return responseData as T;
  } catch (error: any) {
    // If it's already an ApiError, just rethrow it
    if (error instanceof ApiError) {
      debugLog(`[${requestId}] API Error:`, error);
      throw error;
    }
    
    // Handle network errors and other unexpected errors
    const errorMessage = error.message || 'An unexpected error occurred';
    debugLog(`[${requestId}] Request failed:`, error);
    
    throw new ApiError(
      errorMessage,
      error.status || 500,
      {
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || error,
        endpoint
      }
    );
  }
}

// Helper methods for common HTTP methods
const api = {
  get: <T = any>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  // Raw fetch for non-JSON responses or custom handling
  raw: <T = any>(endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    return apiFetch<T>(endpoint, {
      ...options,
      headers,
    });
  },
};

// Export the API client and error class
export { api as default, ApiError as ApiErrorClass };

export type { ApiResponse };
