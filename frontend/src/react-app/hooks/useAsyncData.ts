import { useState, useCallback, useEffect } from 'react';

type AsyncFunction<T> = () => Promise<T>;

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useAsyncData<T>(
  asyncFunction: AsyncFunction<T>,
  initialData: T | null = null,
  immediate = true
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  // Execute immediately on mount if requested
  useEffect(() => {
    if (immediate) {
      execute().catch(() => {});
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
}

// Example usage:
/*
function MyComponent() {
  const { data, loading, error } = useAsyncData(fetchSomeData);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <div>{data}</div>;
}
*/
