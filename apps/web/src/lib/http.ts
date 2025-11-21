import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Extend the ImportMeta interface to include env
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

interface CustomImportMeta extends ImportMeta {
  env: ImportMetaEnv;
}

const http = axios.create({
  baseURL: (import.meta as CustomImportMeta).env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for API calls
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('supabase.auth.token');
    if (token) {
      config.headers.Authorization = `Bearer ${JSON.parse(token).access_token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and retries
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If the error is due to a network issue, retry the request
    if (!error.response) {
      if (originalRequest._retry) {
        return Promise.reject({
          status: 503,
          message: 'Network error - unable to connect to the server',
        });
      }
      
      originalRequest._retry = true;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(http(originalRequest));
        }, 1000);
      });
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      // TODO: Implement token refresh logic here if needed
      console.warn('Unauthorized access - redirecting to login');
      // Redirect to login or refresh token
      window.location.href = '/login';
    }

    // For other errors, reject with a normalized error object
    const responseData = error.response?.data as { message?: string } | undefined;
    return Promise.reject({
      status: error.response?.status || 500,
      message: responseData?.message || error.message || 'An unexpected error occurred',
      data: responseData,
    });
  }
);

export default http;
