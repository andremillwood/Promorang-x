import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  signOut: () => Promise<void>;
  demoLogin: {
    creator: () => Promise<AuthResponse>;
    investor: () => Promise<AuthResponse>;
    advertiser: () => Promise<AuthResponse>;
  };
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
        if (token) {
          // Verify token is not expired
          try {
            const tokenExp = JSON.parse(atob(token.split('.')[1])).exp * 1000;
            console.log('Token expiry:', new Date(tokenExp), 'Current time:', new Date());
            if (tokenExp > Date.now()) {
              // Fetch user profile
              try {
                console.log('Fetching user profile from /users/me');
                const response = await api.get('/users/me');
                console.log('Profile response:', response);
                
                const userData = (response as any)?.user || (response as any)?.data?.user;
                
                if (userData && userData.id) {
                  console.log('Setting user from session check:', userData);
                  setUser(userData);
                  setIsLoading(false);
                  return;
                } else {
                  console.warn('No valid user data in profile response:', response);
                }
              } catch (error) {
                console.error('Failed to fetch user profile:', error);
              }
            } else {
              console.log('Token expired, removing');
            }
          } catch (parseError) {
            console.error('Failed to parse token:', parseError);
          }
          // If we get here, token is invalid or expired
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error('Failed to check session:', error);
        localStorage.removeItem('access_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
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

  const demoLogin = {
    creator: async () => signIn('creator@demo.com', 'demo123'),
    investor: async () => signIn('investor@demo.com', 'demo123'),
    advertiser: async () => signIn('advertiser@demo.com', 'demo123'),
  };

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

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    demoLogin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
