import { QueryClient } from '@tanstack/react-query';

import { isRetryable } from '@/lib/errors';

/**
 * One cache for the whole app.
 *
 * Retries are decided per error kind: a dropped connection or a 5xx is worth another try,
 * while 400/401/404/429 answers will be identical the second time and just slow the UI down.
 */
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
