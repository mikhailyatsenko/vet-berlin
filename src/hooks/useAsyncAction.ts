import { useState, useCallback } from 'react';

interface UseAsyncActionOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
  resetDelay?: number;
}

interface AsyncActionState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsyncAction<T = unknown>(
  options: UseAsyncActionOptions<T> = {}
) {
  const [state, setState] = useState<AsyncActionState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction();
        setState({ loading: false, error: null, data: result });
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        if (options.resetOnSuccess && options.resetDelay) {
          setTimeout(() => {
            setState(prev => ({ ...prev, data: null }));
          }, options.resetDelay);
        }

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        setState({ loading: false, error: errorObj, data: null });
        
        if (options.onError) {
          options.onError(errorObj);
        }

        return null;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
  };
}

// Hook for handling navigation with loading states
export function useNavigationLoader() {
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  const navigateWithLoading = useCallback(
    async (navigationKey: string, navigationAction: () => void | Promise<void>) => {
      if (isNavigating) return;
      
      setIsNavigating(navigationKey);
      
      try {
        await navigationAction();
      } finally {
        // Reset after a short delay to show loading state
        setTimeout(() => setIsNavigating(null), 1000);
      }
    },
    [isNavigating]
  );

  const clearNavigation = useCallback(() => {
    setIsNavigating(null);
  }, []);

  return {
    isNavigating,
    navigateWithLoading,
    clearNavigation,
  };
}