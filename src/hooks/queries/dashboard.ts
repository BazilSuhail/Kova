import { useQuery } from '@tanstack/react-query';

import { fetchDailyRecap, fetchDashboard } from '@/api/dashboard';
import { queryKeys } from './keys';

/**
 * The home screen's single fetch: task counts, today's tasks, reminders, mood, streak and
 * suggestions. Refreshed whenever a task or notification changes.
 */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboard,
    // A short stale window keeps tab switching honest without hammering the server.
    staleTime: 15_000,
  });
}

/** Today's recap card. Separate from the dashboard so a failure there only costs one card. */
export function useDailyRecap() {
  return useQuery({
    queryKey: queryKeys.dailyRecap,
    queryFn: fetchDailyRecap,
    staleTime: 15_000,
  });
}
