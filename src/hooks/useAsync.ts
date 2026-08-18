'use client';

import { useState, useEffect, useCallback } from 'react';

type UseAsyncConfig = {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  deps?: any[];
  args?: any[];
  immediate?: boolean;
};

export function useAsync<T extends (...args: any[]) => Promise<any>>(
  action: T,
  config?: UseAsyncConfig
) {
  const [isLoading, setIsLoading] = useState(true);
  const [value, setValue] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [trigger, setTrigger] = useState(0);

  const { onSuccess, onError, deps = [], args = [], immediate = true } = config || {};

  const refetch = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await action(...args);
        if (!cancelled) {
          setValue(result);
          setError(null);
          onSuccess?.(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setValue(null);
          onError?.(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (immediate) {
      fetchData();
    }

    return () => {
      cancelled = true;
    };
  }, [...deps, trigger]);

  return { value, error, isLoading, refetch };
}
