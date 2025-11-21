import React, { createContext, useContext, ReactNode } from 'react';
import useAuth from '../hooks/useAuth';
import { User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, username: string, displayName?: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={{
      user: auth.user,
      loading: auth.loading,
      error: auth.error,
      isAuthenticated: auth.isAuthenticated,
      login: auth.login,
      signup: auth.signup,
      logout: auth.logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
