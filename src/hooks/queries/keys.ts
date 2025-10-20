import type { NotificationFilters } from '@/api/notifications';
import type { TaskFilters } from '@/api/tasks';

/**
 * One place for every cache key.
 *
 * `tasks` and `taskLists` are prefixes on purpose: invalidating `tasks` refreshes lists and
 * details together, while the optimistic list patches target `taskLists` only.
 */
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  dailyRecap: ['daily-recap'] as const,

  tasks: ['tasks'] as const,
  taskLists: ['tasks', 'list'] as const,
  taskList: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
  task: (taskId: string) => ['tasks', 'detail', taskId] as const,

  subtasks: (taskId: string) => ['subtasks', taskId] as const,

  notifications: ['notifications'] as const,
  notificationLists: ['notifications', 'list'] as const,
  notificationList: (filters: NotificationFilters) => ['notifications', 'list', filters] as const,
};
