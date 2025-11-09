import { supabase } from '../lib/supabaseClient';
import { errorLogger } from './errorLogger';
import type { Session } from '../types/auth';

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before token expires

export class TokenService {
  private static refreshTimeout: NodeJS.Timeout | null = null;
  private static readonly SESSION_KEY = 'supabase.auth.token';

  static async refreshToken() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('No session returned from refresh');
      }

      return data.session;
    } catch (error) {
      errorLogger.logError({
        error,
        category: 'authentication',
        severity: 'error',
        context: { action: 'token_refresh' }
      });
      throw error;
    }
  }

  static scheduleTokenRefresh(expiresAt: number) {
    // Clear any existing timeout
    this.clearRefreshTimeout();

    const now = Date.now();
    const expiresIn = expiresAt * 1000 - now;
    const refreshTime = Math.max(expiresIn - TOKEN_REFRESH_BUFFER, 0);

    this.refreshTimeout = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, refreshTime);
  }

  static clearRefreshTimeout() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  static setSession(session: Session) {
    if (session?.access_token) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      this.scheduleTokenRefresh(session.expires_at);
    }
  }

  static clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
    this.clearRefreshTimeout();
  }

  static getSession(): Session | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
}
