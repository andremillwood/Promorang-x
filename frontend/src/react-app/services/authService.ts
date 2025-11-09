import { api } from '@/lib/api';

export type UserRole = 'user' | 'creator' | 'investor' | 'advertiser' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  user_type: UserRole;
  points_balance: number;
  keys_balance: number;
  gems_balance: number;
  email_verified: boolean;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  google_user_data?: any;
  xp_points?: number;
  level?: number;
}

export interface AuthResponse {
  user?: User | null;
  token?: string;
  refreshToken?: string;
  error?: {
    message: string;
    code?: string;
    status?: number;
  } | null;
  requiresConfirmation?: boolean;
  message?: string;
}

// Token storage keys
const TOKEN_KEY = 'supabase.auth.token';
const REFRESH_TOKEN_KEY = 'sb-refresh-token';

// Helper function to store tokens
const storeTokens = (token: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Helper function to clear tokens
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const authService = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.token && response.refreshToken) {
        storeTokens(response.token, response.refreshToken);
      }
      return response;
    } catch (error: any) {
      return { 
        error: { 
          message: error.response?.data?.error?.message || error.message || 'Login failed',
          code: error.response?.data?.error?.code,
          status: error.response?.status
        } 
      };
    }
  },

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string, userData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/signup', { email, password, ...userData });
      if (response.token && response.refreshToken) {
        storeTokens(response.token, response.refreshToken);
      }
      return response;
    } catch (error: any) {
      return { 
        error: { 
          message: error.response?.data?.error?.message || error.message || 'Signup failed',
          code: error.response?.data?.error?.code,
          status: error.response?.status
        } 
      };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: any }> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await api.post('/api/auth/logout', {}, {
          headers: {
            'X-Refresh-Token': refreshToken
          }
        });
      }
      clearTokens();
      return { error: null };
    } catch (error: any) {
      // Clear tokens even if the request fails
      clearTokens();
      return { 
        error: {
          message: error.response?.data?.error?.message || error.message || 'Logout failed',
          code: error.response?.data?.error?.code,
          status: error.response?.status
        } 
      };
    }
  },

  // Refresh access token
  async refreshSession(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return { 
          error: { 
            message: 'No refresh token found',
            code: 'NO_REFRESH_TOKEN',
            status: 401
          } 
        };
      }
      const response = await api.post('/api/auth/refresh', {}, {
        headers: {
          'X-Refresh-Token': refreshToken
        }
      });
      if (response.token && response.refreshToken) {
        storeTokens(response.token, response.refreshToken);
      }
      return response;
    } catch (error: any) {
      return { 
        error: { 
          message: error.response?.data?.error?.message || error.message || 'Failed to refresh session',
          code: error.response?.data?.error?.code,
          status: error.response?.status
        } 
      };
    }
  },

  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;
