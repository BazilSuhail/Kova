import type { MoodFilters } from '@/api/mood';
import type { NotificationFilters } from '@/api/notifications';
import type { SummaryFilters } from '@/api/summaries';
import type { TaskFilters } from '@/api/tasks';

/**
 * One place for every cache key.
 *
 * `tasks`, `mood`, `reflections` and `summaries` are prefixes on purpose: invalidating the
 * root refreshes every list and detail view of that resource in one go, while the
 * optimistic patches target the narrower `*Lists` keys so they never touch a detail cache.
 */
export const queryKeys = {
  dashboard: ['dashboard'] as const,

  recaps: ['recaps'] as const,
  dailyRecap: ['recaps', 'daily'] as const,
  weeklyRecaps: ['recaps', 'weekly'] as const,
  weeklyRecap: (end?: string) => ['recaps', 'weekly', end ?? 'latest'] as const,

  tasks: ['tasks'] as const,
  taskLists: ['tasks', 'list'] as const,
  taskList: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
  task: (taskId: string) => ['tasks', 'detail', taskId] as const,
  /** Derived from one broad page: the server has no category listing endpoint. */
  taskCategories: ['tasks', 'categories'] as const,
  subtasks: (taskId: string) => ['subtasks', taskId] as const,

  notifications: ['notifications'] as const,
  notificationLists: ['notifications', 'list'] as const,
  notificationList: (filters: NotificationFilters) => ['notifications', 'list', filters] as const,

  planners: ['planners'] as const,
  planner: (plannerId: string) => ['planners', 'detail', plannerId] as const,
  calendar: ['calendar'] as const,
  calendarView: (view: string, date?: string) => ['calendar', view, date ?? 'today'] as const,

  reminders: ['reminders'] as const,
  reminderList: (status: string) => ['reminders', 'list', status] as const,
  upcomingReminders: (hours: number) => ['reminders', 'upcoming', hours] as const,

  progress: ['progress'] as const,
  suggestions: ['suggestions'] as const,

  mood: ['mood'] as const,
  moodLists: ['mood', 'list'] as const,
  moodList: (filters: MoodFilters) => ['mood', 'list', filters] as const,
  moodEntry: (moodId: string) => ['mood', 'detail', moodId] as const,
  moodTrends: (days: number) => ['mood', 'trends', days] as const,
  moodLoad: (mood: string | undefined, energy: number | undefined) =>
    ['mood', 'load', mood ?? 'latest', energy ?? 0] as const,

  reflections: ['reflections'] as const,
  todayReflection: (date?: string) => ['reflections', 'today', date ?? 'today'] as const,
  reflection: (reflectionId: string) => ['reflections', 'detail', reflectionId] as const,

  summaries: ['summaries'] as const,
  summaryLists: ['summaries', 'list'] as const,
  summaryList: (filters: SummaryFilters) => ['summaries', 'list', filters] as const,

  profile: ['profile'] as const,
  settings: ['settings'] as const,
  avatars: ['avatars'] as const,
  devices: ['devices'] as const,
};
