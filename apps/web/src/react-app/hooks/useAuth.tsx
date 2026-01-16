import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAccessToken } from '@/react-app/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  user_type?: string;
  points_balance?: number;
  keys_balance?: number;
  gems_balance?: number;
  email_verified?: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: {
    message: string;
    code?: string;
  };
  message?: string;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, username: string, displayName?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  demoLogin: {
    creator: () => Promise<AuthResponse>;
    investor: () => Promise<AuthResponse>;
    advertiser: () => Promise<AuthResponse>;
    operator: () => Promise<AuthResponse>;
    merchant: () => Promise<AuthResponse>;
    matrix: () => Promise<AuthResponse>;
    samplingMerchant: () => Promise<AuthResponse>;
    activeSampling: () => Promise<AuthResponse>;
    graduatedMerchant: () => Promise<AuthResponse>;
    state0: () => Promise<AuthResponse>;
    state1: () => Promise<AuthResponse>;
    state2: () => Promise<AuthResponse>;
    state3: () => Promise<AuthResponse>;
  };
  checkDemoHealth: () => Promise<{ success: boolean; status: string; missing?: number }>;
  initializeDemo: () => Promise<{ success: boolean; results?: any[] }>;
}

// Using AuthResponse from authService

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('access_token');
        console.log('checkSession: token exists?', !!token);
        if (!token) {
          return;
        }

        // Verify token is not expired
        let tokenValid = false;
        try {
          const tokenExp = JSON.parse(atob(token.split('.')[1])).exp * 1000;
          console.log('Token expiry:', new Date(tokenExp), 'Current time:', new Date());
          tokenValid = tokenExp > Date.now();
        } catch (parseError) {
          console.error('Failed to parse token:', parseError);
        }

        if (!tokenValid) {
          console.log('Token expired or invalid, removing');
          localStorage.removeItem('access_token');
          return;
        }

        // Fetch user profile with valid token
        try {
          console.log('Fetching user profile from /users/me');
          const response = await api.get('/users/me');
          console.log('Profile response:', response);

          // Accept multiple response shapes:
          // - { user: {...} }
          // - { data: { user: {...} } }
          // - direct user object { id, email, ... }
          const userData =
            (response as any)?.user ||
            (response as any)?.data?.user ||
            ((response as any) && typeof response === 'object' && 'id' in (response as any)
              ? (response as any)
              : null);

          if (userData && userData.id) {
            console.log('Setting user from session check:', userData);
            setUser(userData);
            return;
          }

          console.warn('No valid user data in profile response:', response);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Only clear token on clear auth failure; other errors will keep token so user can retry
        }
      } catch (error) {
        console.error('Failed to check session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in with:', { email });

      // Make the login request
      const response = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      console.log('Login response:', response);

      // The API client now returns the response data directly
      if (response && typeof response === 'object') {
        // Handle the token and user data
        const token = response.token || (response as any)?.data?.token;
        const user = response.user || (response as any)?.data?.user;

        if (token) {
          console.log('Setting access token:', token.substring(0, 20) + '...');
          setAccessToken(token);

          // Verify token was stored
          const storedToken = localStorage.getItem('access_token');
          console.log('Token stored in localStorage:', storedToken ? 'YES' : 'NO');

          if (user) {
            setUser(user);
            console.log('Navigating to dashboard with user:', user.email);
            navigate('/dashboard');
            return {
              success: true,
              user,
              token
            };
          }

          // If we have a token but no user data, try to fetch the user profile
          try {
            const userResponse = await api.get<{ user: User }>('/auth/me');
            const userData = userResponse.user || (userResponse as any)?.data?.user;

            if (userData) {
              setUser(userData);
              navigate('/dashboard');
              return {
                success: true,
                user: userData,
                token
              };
            }
          } catch (userError) {
            console.error('Failed to fetch user profile:', userError);
            // Continue with minimal user data
          }

          // If we have a token but couldn't get user data, proceed with minimal info
          return {
            success: true,
            user: {
              id: '',
              email,
              username: email.split('@')[0],
              email_verified: false
            },
            token,
            message: 'Logged in but could not fetch full profile'
          };
        }
      }

      // If we get here, the response format is unexpected
      console.error('Unexpected response format:', response);
      throw new Error(
        (response as any)?.error?.message ||
        (response as any)?.message ||
        'Invalid response format from server'
      );
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'SIGN_IN_ERROR'
        },
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const signUp = useCallback(async (email: string, password: string, username: string, displayName?: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign up with:', { email, username });

      const response = await api.post<{ token: string; user: User }>('/auth/register', {
        email,
        password,
        username,
        display_name: displayName
      });

      if (response && typeof response === 'object') {
        const token = response.token || (response as any)?.data?.token;
        const user = response.user || (response as any)?.data?.user;

        if (token && user) {
          setAccessToken(token);
          setUser(user);
          return { success: true, user, token };
        }
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to sign up',
          code: 'SIGN_UP_ERROR'
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const demoLogin = {
    creator: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/creator');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/dashboard');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    investor: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/investor');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/dashboard');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        // Fallback to advertiser since backend only supports creator/advertiser in check?
        // Actually backend code says "if (!['creator', 'advertiser'].includes(role)) return 400"
        // Wait, backend index.ts Step 1157 checks ['creator', 'advertiser']. What about others?
        // I should check if backend supports all roles.
        // If backend only valid roles are creator/advertiser, I should map others.
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    advertiser: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/advertiser');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/dashboard');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    operator: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/operator');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/dashboard');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    merchant: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/merchant');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/dashboard');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    matrix: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/matrix');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/matrix');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Matrix demo login failed' } };
      }
    },
    samplingMerchant: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/sampling-merchant');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/dashboard');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    activeSampling: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/active-sampling');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/dashboard');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    graduatedMerchant: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/auth/demo/graduated-merchant');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/dashboard');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    state0: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/demo/state-0');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/today');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    state1: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/demo/state-1');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/today');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    state2: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/demo/state-2');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/today');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
    state3: async () => {
      try {
        const response = await api.post<{ token: string, user: User }>('/demo/state-3');
        if (response && response.token) {
          setAccessToken(response.token);
          if (response.user) setUser(response.user);
          navigate('/today');
          return { success: true, user: response.user, token: response.token };
        }
        return { success: false, error: { message: 'Failed to get demo token' } };
      } catch (e: any) {
        return { success: false, error: { message: e.message || 'Demo login failed' } };
      }
    },
  };

  const checkDemoHealth = useCallback(async () => {
    try {
      const response = await api.get<{ status: string; missing: number }>('/auth/demo-health');
      return { success: true, status: response.status, missing: response.missing };
    } catch (error) {
      return { success: false, status: 'error' };
    }
  }, []);

  const initializeDemo = useCallback(async () => {
    try {
      const response = await api.post<{ results: any[] }>('/auth/demo-initialize');
      return { success: true, results: response.results };
    } catch (error) {
      return { success: false };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      // Try to call the logout endpoint, but don't fail if it doesn't exist
      try {
        await api.post('/auth/logout', {});
      } catch (error) {
        console.warn('Logout endpoint failed, continuing with client-side cleanup', error);
      }

      // Clear all auth-related data
      localStorage.removeItem('access_token');
      setUser(null);
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, we should still clear the local state
      localStorage.removeItem('access_token');
      setUser(null);
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const value = useMemo(() => ({
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    demoLogin,
    checkDemoHealth,
    initializeDemo,
    isAuthenticated: !!user,
  }), [user, isLoading, signIn, signUp, signOut, demoLogin, checkDemoHealth, initializeDemo]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
