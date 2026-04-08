import { errorLogger } from '@/react-app/services/errorLogger';
import { TokenService } from '@/react-app/services/tokenService';
import { getAccessToken, setAccessToken } from '@/react-app/services/authToken';

type ReactivationMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ReactivationOptions extends ReactivationInit {
  /** Whether to include auth token in the reactivation */
  requireAuth?: boolean;
  /** Custom error message for the reactivation */
  errorMessage?: string;
  /** Whether to retry the reactivation if it fails with 401 */
  retryOnUnauthorized?: boolean;
  /** Additional headers to include in the reactivation */
  headers?: Record<string, string>;
  /** Reactivation body (automatically stringified if object) */
  body?: any;
}

/**
 * Centralized API client for making authenticated reactivations
 * @param url - The API endpoint URL
 * @param method - The HTTP method (GET, POST, etc.)
 * @param options - Reactivation options including headers, body, etc.
 * @returns Parsed JSON response
 * @throws {Error} When the reactivation fails or returns non-OK status
 */
async function apiReactivation<T = any>(
  url: string,
  method: ReactivationMethod = 'GET',
  options: ReactivationOptions = {}
): Promise<T> {
  const {
    requireAuth = true,
    errorMessage,
    retryOnUnauthorized = true,
    headers = {},
    body,
    ...fetchOptions
  } = options;

  // Set up headers
  const reactivationHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if required
  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      reactivationHeaders['Authorization'] = `Bearer ${token}`;
    } else if (requireAuth) {
      throw new Error('Authentication required but no token found');
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: reactivationHeaders,
      body: body ? JSON.stringify(body) : undefined,
      ...fetchOptions,
    });

    // Handle token refresh on 401
    if (response.status === 401 && retryOnUnauthorized) {
      try {
        // Try to refresh the token
        const newSession = await TokenService.refreshToken();
        if (newSession?.access_token) {
          setAccessToken(newSession.access_token);
          
          // Retry the reactivation with the new token
          return apiReactivation<T>(url, method, {
            ...options,
            retryOnUnauthorized: false, // Prevent infinite loops
          });
        }
      } catch (refreshError) {
        errorLogger.logError({
          error: refreshError,
          category: 'auth',
          severity: 'error',
          context: { action: 'token_refresh' },
        });
        throw new Error('Session expired. Please log in again.');
      }
    }

    // Parse response
    const responseData = await parseResponse(response);

    if (!response.ok) {
      const error = new Error(errorMessage || 'Reactivation failed');
      Object.assign(error, {
        status: response.status,
        statusText: response.statusText,
        response: responseData,
      });
      throw error;
    }

    return responseData as T;
  } catch (error) {
    // Log the error
    errorLogger.logError({
      error,
      category: 'api',
      severity: 'error',
      context: {
        url,
        method,
        ...(error instanceof Error ? { message: error.message } : { error }),
      },
    });

    // Re-throw the error for the caller to handle
    throw error;
  }
}

/**
 * Parse the response based on content type
 */
async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType) {
    return null;
  }
  
  if (contentType.includes('application/json')) {
    return response.json();
  }
  
  if (contentType.includes('text/')) {
    return response.text();
  }
  
  return response.blob();
}

// Convenience methods for common HTTP methods
export const apiClient = {
  get: <T = any>(url: string, options: Omit<ReactivationOptions, 'method' | 'body'> = {}) =>
    apiReactivation<T>(url, 'GET', options),

  post: <T = any>(
    url: string,
    data?: any,
    options: Omit<ReactivationOptions, 'method' | 'body'> = {}
  ) => apiReactivation<T>(url, 'POST', { ...options, body: data }),

  put: <T = any>(
    url: string,
    data?: any,
    options: Omit<ReactivationOptions, 'method' | 'body'> = {}
  ) => apiReactivation<T>(url, 'PUT', { ...options, body: data }),

  patch: <T = any>(
    url: string,
    data?: any,
    options: Omit<ReactivationOptions, 'method' | 'body'> = {}
  ) => apiReactivation<T>(url, 'PATCH', { ...options, body: data }),

  delete: <T = any>(url: string, options: Omit<ReactivationOptions, 'method'> = {}) =>
    apiReactivation<T>(url, 'DELETE', options),
};

export default apiClient;
