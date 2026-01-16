/**
 * Service for managing authentication tokens in the browser's storage
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Get the access token from storage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get the refresh token from storage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set the access token in storage
 * @param token - The JWT access token
 */
export function setAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

/**
 * Set the refresh token in storage
 * @param token - The JWT refresh token
 */
export function setRefreshToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

/**
 * Remove all auth tokens from storage
 */
export function clearTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

/**
 * Check if the current user is authenticated
 * Note: This only checks for the presence of a token, not its validity
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Parse a JWT token to extract its payload
 * @param token - The JWT token to parse
 * @returns The decoded token payload or null if invalid
 */
export function parseJwt<T>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as T;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param token - The JWT token to check
 * @returns True if the token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = parseJwt<{ exp?: number }>(token);
  if (!decoded?.exp) return true;

  // Convert exp to milliseconds and check if it's in the past
  return Date.now() >= decoded.exp * 1000;
}

/**
 * Get the remaining time until the token expires in seconds
 * @returns Time in seconds until token expires, or null if token is invalid/expired
 */
export function getTokenExpirationTime(token: string): number | null {
  const decoded = parseJwt<{ exp?: number }>(token);
  if (!decoded?.exp) return null;

  const expiresIn = decoded.exp * 1000 - Date.now();
  return expiresIn > 0 ? Math.floor(expiresIn / 1000) : null;
}

/**
 * Get the current user's ID from the access token if available
 * @returns The user ID or null if not available
 */
export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = parseJwt<{ sub?: string }>(token);
  return decoded?.sub || null;
}
