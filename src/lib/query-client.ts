import { QueryClient } from '@tanstack/react-query';

import { isRetryable } from '@/lib/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => isRetryable(error) && failureCount < 2,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
