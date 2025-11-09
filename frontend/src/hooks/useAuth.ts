import { useState, useEffect, useCallback } from 'react';
import { User, login as loginApi, signup as signupApi, logout as logoutApi, getCurrentUser as getCurrentUserApi, isAuthenticated } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (isAuthenticated()) {
          const userData = await getCurrentUserApi();
          setUser(userData);
        }
      } catch (error) {
        const err = error as Error;
        console.error('Failed to load user', err);
        // Clear invalid token
        if (err.message === 'Not authenticated') {
          logoutApi();
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await loginApi(email, password);
      setUser(user);
      return user;
    } catch (error) {
      const err = error as Error;
      setError(err.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup function
  const signup = useCallback(async (email: string, password: string, username: string, displayName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await signupApi(email, password, username, displayName);
      setUser(user);
      return user;
    } catch (error) {
      const err = error as Error;
      setError(err.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };
}

export default useAuth;
