/**
 * Type declarations for the authToken service
 */

declare module '@/react-app/services/authToken' {
  /**
   * Get the access token from storage
   */
  export function getAccessToken(): string | null;

  /**
   * Get the refresh token from storage
   */
  export function getRefreshToken(): string | null;

  /**
   * Set the access token in storage
   * @param token - The JWT access token
   */
  export function setAccessToken(token: string): void;

  /**
   * Set the refresh token in storage
   * @param token - The JWT refresh token
   */
  export function setRefreshToken(token: string): void;

  /**
   * Remove all auth tokens from storage
   */
  export function clearTokens(): void;

  /**
   * Check if the current user is authenticated
   * Note: This only checks for the presence of a token, not its validity
   */
  export function isAuthenticated(): boolean;

  /**
   * Parse a JWT token to extract its payload
   * @param token - The JWT token to parse
   * @returns The decoded token payload or null if invalid
   */
  export function parseJwt<T = any>(token: string): T | null;

  /**
   * Check if a JWT token is expired
   * @param token - The JWT token to check
   * @returns True if the token is expired or invalid, false otherwise
   */
  export function isTokenExpired(token: string): boolean;

  /**
   * Get the remaining time until the token expires in seconds
   * @returns Time in seconds until token expires, or null if token is invalid/expired
   */
  export function getTokenExpirationTime(token: string): number | null;

  /**
   * Get the current user's ID from the access token if available
   * @returns The user ID or null if not available
   */
  export function getUserIdFromToken(): string | null;
}
