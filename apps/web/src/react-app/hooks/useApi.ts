import { useState, useCallback } from 'react';
import api, { ApiResponse } from '../services/api';

type ApiFunction<T, P extends any[]> = (...args: P) => Promise<ApiResponse<T>>;

interface UseApiOptions<T, P extends any[]> {
  onSuccess?: (data: T, ...args: P) => void;
  onError?: (error: Error, ...args: P) => void;
  initialData?: T | (() => T);
  enabled?: boolean;
}

export function useApi<T, P extends any[] = []>(
  apiFunction: ApiFunction<T, P>,
  options: UseApiOptions<T, P> = {}
) {
  const {
    onSuccess,
    onError,
    initialData,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData as T);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const execute = useCallback(
    async (...args: P): Promise<T | undefined> => {
      if (!enabled) return;
      
      setIsLoading(true);
      setStatus('loading');
      setError(null);

      try {
        const response = await apiFunction(...args);
        
        if (response.data) {
          setData(response.data);
          setStatus('success');
          onSuccess?.(response.data, ...args);
          return response.data;
        }
        
        throw new Error('No data returned from API');
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setStatus('error');
        onError?.(error, ...args);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, enabled, onError, onSuccess]
  );

  const reset = useCallback(() => {
    setData(initialData as T);
    setError(null);
    setIsLoading(false);
    setStatus('idle');
  }, [initialData]);

  return {
    data,
    error,
    isLoading,
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle',
    execute,
    reset,
    status,
  };
}

export function useGet<T>(url: string, options: Omit<UseApiOptions<T, []>, 'initialData'> = {}) {
  const getData = useCallback(
    (): Promise<ApiResponse<T>> => api.get<T>(url),
    [url]
  );

  return useApi(getData, options);
}

export function usePost<T, D = any>(
  url: string,
  options: Omit<UseApiOptions<T, [D]>, 'initialData'> = {}
) {
  const postData = useCallback(
    (data: D): Promise<ApiResponse<T>> => api.post<T>(url, data),
    [url]
  );

  return useApi(postData, options);
}

export function usePut<T, D = any>(
  url: string,
  options: Omit<UseApiOptions<T, [D]>, 'initialData'> = {}
) {
  const putData = useCallback(
    (data: D): Promise<ApiResponse<T>> => api.put<T>(url, data),
    [url]
  );

  return useApi(putData, options);
}

export function useDelete<T>(
  url: string,
  options: Omit<UseApiOptions<T, []>, 'initialData'> = {}
) {
  const deleteData = useCallback(
    (): Promise<ApiResponse<T>> => api.delete<T>(url),
    [url]
  );

  return useApi(deleteData, options);
}
