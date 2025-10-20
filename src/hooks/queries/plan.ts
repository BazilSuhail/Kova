import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchCalendar, type CalendarViewKind } from '@/api/calendar';
import {
  createPlanner,
  deletePlanner,
  listPlanners,
  updatePlanner,
  updatePlannerFocus,
  updatePlannerTasks,
  type CreatePlannerInput,
  type UpdatePlannerInput,
} from '@/api/planner';
import { fetchWeeklyRecap } from '@/api/recaps';
import {
  createReminder,
  deleteReminder,
  listReminders,
  listUpcomingReminders,
  type CreateReminderInput,
  type ReminderStatus,
} from '@/api/reminders';
import type { Planner } from '@/api/types';
import { todayIsoDate } from '@/lib/format';
import { queryKeys } from './keys';

/** A plan write moves the planner, the calendar, both recaps and the home summary. */
function usePlanRefresher() {
  const client = useQueryClient();

  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.planners });
    void client.invalidateQueries({ queryKey: queryKeys.calendar });
    void client.invalidateQueries({ queryKey: queryKeys.recaps });
    void client.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

/** `GET /api/planner/` — every day plan, with linked tasks already resolved. */
export function usePlanners() {
  return useQuery({
    queryKey: queryKeys.planners,
    queryFn: listPlanners,
  });
}

/**
 * Today's plan, picked out of the full list.
 *
 * The API has no date parameter, so the client filters — which also means the whole week
 * is already cached when the calendar or the recaps ask for it.
 */
export function useTodayPlanner(): {
  planner: Planner | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
} {
  const query = usePlanners();
  const today = todayIsoDate();
  const planner = query.data?.find((item) => item.date.startsWith(today)) ?? null;

  return {
    planner,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}

export function useCreatePlanner() {
  const refresh = usePlanRefresher();
  return useMutation({
    mutationFn: (input: CreatePlannerInput) => createPlanner(input),
    onSuccess: refresh,
  });
}

export function useUpdatePlanner() {
  const refresh = usePlanRefresher();
  return useMutation({
    mutationFn: ({ plannerId, input }: { plannerId: string; input: UpdatePlannerInput }) =>
      updatePlanner(plannerId, input),
    onSuccess: refresh,
  });
}

export function useUpdatePlannerFocus() {
  const refresh = usePlanRefresher();
  return useMutation({
    mutationFn: ({ plannerId, focusTasks }: { plannerId: string; focusTasks: string[] }) =>
      updatePlannerFocus(plannerId, focusTasks),
    onSuccess: refresh,
  });
}

export function useUpdatePlannerTasks() {
  const refresh = usePlanRefresher();
  return useMutation({
    mutationFn: ({ plannerId, tasks }: { plannerId: string; tasks: string[] }) =>
      updatePlannerTasks(plannerId, tasks),
    onSuccess: refresh,
  });
}

export function useDeletePlanner() {
  const refresh = usePlanRefresher();
  return useMutation({
    mutationFn: (plannerId: string) => deletePlanner(plannerId),
    onSuccess: refresh,
  });
}

/** `GET /api/calendar/` — day, week or month buckets around an anchor date. */
export function useCalendar(view: CalendarViewKind, date?: string) {
  return useQuery({
    queryKey: queryKeys.calendarView(view, date),
    queryFn: () => fetchCalendar(view, date),
  });
}

export function useReminders(status?: ReminderStatus) {
  return useQuery({
    queryKey: queryKeys.reminderList(status ?? 'all'),
    queryFn: () => listReminders(status),
  });
}

export function useUpcomingReminders(hours = 48) {
  return useQuery({
    queryKey: queryKeys.upcomingReminders(hours),
    queryFn: () => listUpcomingReminders(hours),
  });
}

export function useCreateReminder() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReminderInput) => createReminder(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.reminders });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteReminder() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: string) => deleteReminder(reminderId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.reminders });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

/** `GET /api/weekly-recap/` — seven days ending on `end` (default today, UTC). */
export function useWeeklyRecap(end?: string) {
  return useQuery({
    queryKey: queryKeys.weeklyRecap(end),
    queryFn: () => fetchWeeklyRecap(end),
  });
}
