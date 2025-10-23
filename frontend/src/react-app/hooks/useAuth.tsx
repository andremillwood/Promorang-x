import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any;
  isPending: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  // Mock authentication for development
  const signIn = async (email: string, password: string) => {
    setIsPending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ id: 'mock-user-id', email });
    setIsPending(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    setIsPending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ id: 'mock-user-id', email });
    setIsPending(false);
    return { error: null };
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    setIsPending(true);
    // Simulate OAuth redirect
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ id: 'mock-oauth-user-id', provider });
    setIsPending(false);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    return { error: null };
  };

  const value: AuthContextType = {
    user,
    isPending,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
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
