import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  user_type: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const storeToken = (token: string) => {
  localStorage.setItem('auth_token', token);};

const removeToken = () => {
  localStorage.removeItem('auth_token');};

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!(token && !isTokenExpired(token));};

export const signup = async (
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username, display_name: displayName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  const data = await response.json();
  storeToken(data.token);
  return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  storeToken(data.token);
  return data;
};

export const logout = (): void => {
  removeToken();
  window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    removeToken();
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    removeToken();
    return null;
  }
};
