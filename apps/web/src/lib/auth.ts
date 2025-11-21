import { api } from './api';

const AUTH_TOKEN_KEY = 'auth_token';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  user_type: string;
  points_balance: number;
  keys_balance: number;
  gems_balance: number;
  email_verified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Store the auth token in localStorage
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

// Get the stored auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

// Remove the auth token (logout)
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Sign up a new user
export const signup = async (
  email: string, 
  password: string, 
  username: string,
  displayName?: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', {
    email,
    password,
    username,
    display_name: displayName || username,
  });
  
  if (response.token) {
    setAuthToken(response.token);
  }
  
  return response;
};

// Log in a user
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  
  if (response.token) {
    setAuthToken(response.token);
  }
  
  return response;
};

// Log out the current user
export const logout = (): void => {
  removeAuthToken();  
  // Redirect to home page or login page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// Get the current user's profile
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.user;
};

// Auth header for API requests
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
