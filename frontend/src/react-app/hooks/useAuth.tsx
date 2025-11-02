import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/react-app/lib/supabaseClient';
import { ApiError as ApiErrorClass } from '@/react-app/lib/api';

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
  session: any;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<{ error: any }>;
  demoLogin: {
    creator: () => Promise<{ error: any }>;
    investor: () => Promise<{ error: any }>;
    advertiser: () => Promise<{ error: any }>;
  };
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (supabaseUser: any): User | null => {
  if (!supabaseUser) return null;
  
  // Extract user metadata
  const userMetadata = supabaseUser.user_metadata || {};
  const appMetadata = supabaseUser.app_metadata || {};
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    username: userMetadata.username || userMetadata.name,
    display_name: 
      userMetadata.full_name || 
      userMetadata.name || 
      userMetadata.email?.split('@')[0] ||
      supabaseUser.email?.split('@')[0],
    user_type: userMetadata.user_type,
    points_balance: userMetadata.points_balance,
    keys_balance: userMetadata.keys_balance,
    gems_balance: userMetadata.gems_balance,
    gold_collected: userMetadata.gold_collected,
    user_tier: userMetadata.user_tier,
    avatar_url: supabaseUser.user_metadata?.avatar_url || userMetadata.avatar_url || userMetadata.picture,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  // Get the current session and set up auth state listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(mapSupabaseUser(session?.user) ?? null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setUser(mapSupabaseUser(session?.user) ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsPending(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      // Update session and user state
      setSession(data.session);
      setUser(mapSupabaseUser(data.user));
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { 
        error: error.message || 'Unable to sign in. Please check your credentials.' 
      };
    } finally {
      setIsPending(false);
    }
  };

  // Register new user
  const signUp = async (email: string, password: string) => {
    setIsPending(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: email.split('@')[0],
            user_type: 'user',
          },
        },
      });
      
      if (error) throw error;
      
      // If email confirmation is required, the user will be null
      if (!data.user) {
        return { 
          error: null, 
          requiresConfirmation: true,
          message: 'Please check your email to confirm your account.'
        };
      }
      
      // If email confirmation is not required, update the session
      setSession(data.session);
      setUser(mapSupabaseUser(data.user));
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { 
        error: error.message || 'Unable to create an account. Please try again.' 
      };
    } finally {
      setIsPending(false);
    }
  };

  // OAuth login
  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      console.error('OAuth error:', error);
      return { 
        error: error.message || `Unable to sign in with ${provider}. Please try again.` 
      };
    }
  };

  // Demo login handler
  const handleDemoLogin = async (type: 'creator' | 'investor' | 'advertiser') => {
    console.warn(`Demo login (${type}) is disabled in this environment.`);
    return { error: 'Demo accounts are not available.' };
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear session and user state
      setSession(null);
      setUser(null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { 
        error: error.message || 'Unable to sign out. Please try again.' 
      };
    }
  };

  // Refresh the current session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      setUser(mapSupabaseUser(data.user));
    } catch (error) {
      console.error('Error refreshing session:', error);
      // If refresh fails, sign out the user
      await signOut();
    }
  };

  // Get the current access token
  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const value: AuthContextType = {
    user,
    session,
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
    refreshSession,
    getAccessToken,
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

// Helper hook to get the current access token
export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);
  const { getAccessToken } = useAuth();
  
  useEffect(() => {
    const fetchToken = async () => {
      const accessToken = await getAccessToken();
      setToken(accessToken);
    };
    
    fetchToken();
  }, [getAccessToken]);
  
  return token;
}

// Helper hook to check if user is authenticated
export function useIsAuthenticated() {
  const { user, session } = useAuth();
  return Boolean(user && session);
}

// Helper hook to get the current user's ID
export function useUserId() {
  const { user } = useAuth();
  return user?.id || null;
}
