import { Session } from '@supabase/supabase-js';

declare module '@/react-app/services/tokenService' {
  class TokenService {
    /**
     * Refresh the current session token
     */
    static refreshToken(): Promise<Session | null>;
    
    /**
     * Schedule a token refresh before it expires
     * @param expiresAt - The expiration timestamp of the current token (in seconds since epoch)
     */
    static scheduleTokenRefresh(expiresAt: number): void;
    
    /**
     * Clear any pending token refresh
     */
    static clearTokenRefresh(): void;
  }
  
  export { TokenService };
}
