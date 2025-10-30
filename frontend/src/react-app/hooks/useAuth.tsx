import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config';

interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  user_type?: string;
  points_balance?: number;
  keys_balance?: number;
  gems_balance?: number;
  gold_collected?: number;
  user_tier?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isPending: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<{ error: any }>;
  demoLogin: {
    creator: () => Promise<{ error: any }>;
    investor: () => Promise<{ error: any }>;
    advertiser: () => Promise<{ error: any }>;
  };
  signOut: () => Promise<{ error: any }>;
  logout: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJwtPayload = (token: string) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn('Failed to decode JWT payload:', error);
    return null;
  }
};

const userFromToken = (token: string): User | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const id = payload.id || payload.sub || payload.user_id || payload.email;
  if (!id) return null;

  return {
    id: String(id),
    email: payload.email,
    username: payload.username,
    display_name: payload.display_name || payload.username || payload.email?.split('@')[0],
    user_type: payload.user_type,
    points_balance: payload.points_balance,
    keys_balance: payload.keys_balance,
    gems_balance: payload.gems_balance,
    gold_collected: payload.gold_collected,
    user_tier: payload.user_tier,
    avatar_url: payload.avatar_url
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(false);

  const persistSession = (token?: string, incomingUser?: User | null) => {
    if (token) {
      localStorage.setItem('authToken', token);
    }
    const resolvedUser = incomingUser ?? (token ? userFromToken(token) : null);
    if (resolvedUser) {
      setUser(resolvedUser);
    }
  };

  // Handle API responses consistently
  const handleApiResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    return data;
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsPending(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await handleApiResponse(response);
      persistSession(data.token, data.user);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setIsPending(false);
    }
  };

  // Register new user
  const signUp = async (email: string, password: string) => {
    setIsPending(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await handleApiResponse(response);
      persistSession(data.token, data.user);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setIsPending(false);
    }
  };

  // OAuth login
  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    try {
      // Redirect to OAuth provider
      window.location.href = API_ENDPOINTS.AUTH.OAUTH(provider);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Demo login handler
  const handleDemoLogin = async (type: 'creator' | 'investor' | 'advertiser') => {
    setIsPending(true);
    const url = API_ENDPOINTS.AUTH.DEMO(type);
    console.log('Demo login URL:', url);
    
    try {
      console.log('Sending demo login request to:', url);
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Changed back to 'include' for cross-origin requests
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({}), // Add empty body to ensure POST works
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.error || response.statusText;
        } catch (e) {
          errorText = await response.text();
        }
        console.error('Demo login failed:', errorText);
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Demo login successful:', data);
      
      if (!data.token) {
        throw new Error('No token received in response');
      }

      persistSession(data.token, data.user ?? null);
      return { error: null };
    } catch (error: any) {
      console.error('Error in demo login:', error);
      return { error: error.message || 'Failed to log in with demo account' };
    } finally {
      setIsPending(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      return { error: null };
    }
  };

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch(API_ENDPOINTS.AUTH.ME, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            persistSession(token, data.user);
          } else if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            setUser(null);
          } else {
            const fallbackUser = userFromToken(token);
            if (fallbackUser) {
              setUser((prev: User | null) => prev ?? fallbackUser);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        const token = localStorage.getItem('authToken');
        const fallbackUser = token ? userFromToken(token) : null;
        if (fallbackUser) {
          setUser((prev: User | null) => prev ?? fallbackUser);
        }
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isPending,
    signIn,
    signUp,
    signInWithOAuth,
    demoLogin: {
      creator: () => handleDemoLogin('creator'),
      investor: () => handleDemoLogin('investor'),
      advertiser: () => handleDemoLogin('advertiser')
    },
    signOut,
    logout: () => signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
