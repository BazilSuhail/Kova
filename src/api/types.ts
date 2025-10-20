import { z } from 'zod';

import { ApiError } from '@/lib/errors';

/**
 * Response DTOs.
 *
 * The server strips unknown keys, so these schemas only describe what the client actually
 * depends on. Every payload is validated before it reaches a screen — a shape change on the
 * backend surfaces as one clear error instead of a crash deep in the UI.
 */

export const tokenPairSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  userId: z.string().optional(),
});

export type TokenPairPayload = z.infer<typeof tokenPairSchema>;

/** `preferences` is free-form enough to tolerate fields this client does not know yet. */
export const userPreferencesSchema = z.object({
  theme: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  fontSize: z.string().optional(),
  layout: z.string().optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const userSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  profilePicture: z.string().optional(),
  preferences: userPreferencesSchema.optional(),
  createdAt: z.string().optional(),
});

export type AuthUser = z.infer<typeof userSchema>;

/* ── Paging ── */

export const paginationSchema = z
  .object({
    page: z.number().optional(),
    limit: z.number().optional(),
    total: z.number().optional(),
    totalPages: z.number().optional(),
    hasNext: z.boolean().optional(),
    hasPrev: z.boolean().optional(),
  })
  .optional();

/**
 * A collection in either shape the API returns: a bare array without paging params, or an
 * `{ items, pagination }` envelope with them. Feed the result straight to `unwrapList`.
 */
export function listSchema<S extends z.ZodType>(item: S) {
  return z.union([z.array(item), z.object({ items: z.array(item), pagination: paginationSchema })]);
}

/* ── Tasks ── */

export const taskSchema = z.object({
  taskId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  isCompleted: z.boolean().optional(),
  createdFrom: z.string().optional(),
  createdAt: z.string().optional(),
  hasSubtasks: z.boolean().optional(),
});

export type Task = z.infer<typeof taskSchema>;

/* ── Subtasks ── */

/**
 * The API stores one document per *group* of steps: `subTasks` holds the generated lines and
 * `done` covers the group as a whole. Individual lines are not separately persisted.
 */
export const subtaskGroupSchema = z.object({
  subtaskId: z.string(),
  title: z.string().optional(),
  order: z.number().optional(),
  done: z.boolean().optional(),
  subTasks: z.array(z.string()).optional(),
});

export type SubtaskGroup = z.infer<typeof subtaskGroupSchema>;

/* ── Notifications ── */

export const notificationSchema = z.object({
  notificationId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.string().optional(),
  relatedId: z.string().optional(),
  createdAt: z.string().optional(),
  read: z.boolean().optional(),
  triggerTime: z.string().nullable().optional(),
});

export type NotificationItem = z.infer<typeof notificationSchema>;

/* ── Dashboard ── */

export const taskStatsSchema = z.object({
  total: z.number(),
  completed: z.number(),
  pending: z.number(),
  dueToday: z.number(),
});

export const reminderSchema = z.object({
  reminderId: z.string(),
  title: z.string().catch('Reminder'),
  message: z.string().catch(''),
  fireAt: z.string().catch(''),
  status: z.string().catch('pending'),
  createdAt: z.string().optional(),
});

export type Reminder = z.infer<typeof reminderSchema>;

export const moodSchema = z.object({
  moodId: z.string(),
  mood: z.string().optional(),
  score: z.number().optional(),
});

export const summarySchema = z.object({
  summaryId: z.string(),
  sourceType: z.string().catch('note'),
  originalFileName: z.string().catch(''),
  summaryBullets: z.array(z.string()).catch([]),
  createdAt: z.string().optional(),
});

export type Summary = z.infer<typeof summarySchema>;

export const suggestionSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  priority: z.string().optional(),
  title: z.string(),
  message: z.string().optional(),
});

export type Suggestion = z.infer<typeof suggestionSchema>;

/**
 * The dashboard aggregates five collections in one call, so every optional block is caught:
 * one malformed section should cost its own card, not the whole home screen.
 */
export const dashboardSchema = z.object({
  date: z.string().optional(),
  tasks: taskStatsSchema,
  todayTasks: z.array(taskSchema).catch([]),
  unreadNotifications: z.number().catch(0),
  nextReminders: z.array(reminderSchema).catch([]),
  latestMood: moodSchema.nullable().catch(null),
  latestSummary: summarySchema.nullable().catch(null),
  streak: z.number().catch(0),
  suggestions: z.array(suggestionSchema).catch([]),
});

export type Dashboard = z.infer<typeof dashboardSchema>;

export const dailyRecapSchema = z.object({
  date: z.string().optional(),
  completedTasks: z.array(z.string()).catch([]),
  pendingTasks: z.array(z.string()).catch([]),
  mood: z.string().catch('Not recorded'),
});

export type DailyRecap = z.infer<typeof dailyRecapSchema>;

/* ── Planner ── */

export const plannerSchema = z.object({
  plannerId: z.string(),
  date: z.string().catch(''),
  focusTasks: z.array(z.string()).catch([]),
  tasks: z.array(z.string()).catch([]),
  reflection: z.string().catch(''),
  /** Linked tasks, resolved by the server in one batched query. */
  tasksDetails: z.array(taskSchema).catch([]),
});

export type Planner = z.infer<typeof plannerSchema>;

/* ── Calendar ── */

export const calendarDaySchema = z.object({
  date: z.string(),
  tasks: z.array(taskSchema).catch([]),
  planner: plannerSchema.nullable().catch(null),
});

export type CalendarDay = z.infer<typeof calendarDaySchema>;

export const calendarSchema = z.object({
  view: z.string().catch('week'),
  start: z.string().catch(''),
  end: z.string().catch(''),
  days: z.array(calendarDaySchema).catch([]),
});

export type CalendarView = z.infer<typeof calendarSchema>;

/* ── Weekly recap ── */

export const weeklyRecapSchema = z.object({
  startDate: z.string().catch(''),
  endDate: z.string().catch(''),
  /** Always exactly 7 entries, oldest first. */
  days: z.array(dailyRecapSchema).catch([]),
  totals: z.object({
    completedTasks: z.number().catch(0),
    pendingTasks: z.number().catch(0),
  }),
});

export type WeeklyRecap = z.infer<typeof weeklyRecapSchema>;

/* ── Progress ── */

export const progressSchema = z.object({
  totals: z.object({
    tasks: z.number().catch(0),
    completedTasks: z.number().catch(0),
    pendingTasks: z.number().catch(0),
    completionRate: z.number().catch(0),
    moodEntries: z.number().catch(0),
    reflections: z.number().catch(0),
  }),
  streak: z.object({
    current: z.number().catch(0),
    longest: z.number().catch(0),
  }),
  loadBalance: z
    .array(
      z.object({
        day: z.string(),
        completed: z.number().catch(0),
        pending: z.number().catch(0),
      }),
    )
    .catch([]),
  achievements: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        earned: z.boolean().catch(false),
        progress: z.number().catch(0),
        target: z.number().catch(1),
      }),
    )
    .catch([]),
  activeDays: z.number().catch(0),
});

export type Progress = z.infer<typeof progressSchema>;

/* ── Mood ── */

export const moodEntrySchema = z.object({
  moodId: z.string(),
  mood: z.string().catch(''),
  score: z.number().catch(0),
  energy: z.number().nullable().catch(null),
  note: z.string().catch(''),
  tags: z.array(z.string()).catch([]),
  date: z.string().catch(''),
  loggedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type MoodEntry = z.infer<typeof moodEntrySchema>;

export const moodTrendsSchema = z.object({
  range: z.object({
    start: z.string().catch(''),
    end: z.string().catch(''),
    days: z.number().catch(30),
  }),
  entries: z.number().catch(0),
  averageScore: z.number().catch(0),
  distribution: z.record(z.string(), z.number()).catch({}),
  series: z
    .array(
      z.object({
        date: z.string(),
        score: z.number().nullable().catch(null),
        entries: z.number().catch(0),
      }),
    )
    .catch([]),
  streak: z.number().catch(0),
});

export type MoodTrends = z.infer<typeof moodTrendsSchema>;

export const moodLoadSchema = z.object({
  score: z.number().catch(0),
  energy: z.number().nullable().catch(null),
  suggestedLoad: z.string().catch('balanced'),
  message: z.string().catch(''),
});

export type MoodLoad = z.infer<typeof moodLoadSchema>;

/* ── Reflections ── */

export const reflectionSchema = z.object({
  reflectionId: z.string(),
  date: z.string().catch(''),
  text: z.string().catch(''),
  mood: z.string().catch(''),
  prompt: z.string().catch(''),
  createdAt: z.string().optional(),
});

export type Reflection = z.infer<typeof reflectionSchema>;

export const todayReflectionSchema = z.object({
  date: z.string().catch(''),
  prompt: z.string().catch(''),
  affirmation: z.string().catch(''),
  /** The caller's entry for that date, or null. */
  reflection: reflectionSchema.nullable().catch(null),
});

export type TodayReflection = z.infer<typeof todayReflectionSchema>;

/* ── Summaries ── */

export const summaryCreateSchema = z.object({
  summary: summarySchema,
  /** A suggestion only — it is persisted by `convert-to-tasks`. */
  task: taskSchema.nullable().catch(null),
});

export type SummaryCreate = z.infer<typeof summaryCreateSchema>;

/* ── Account ── */

export const avatarSchema = z.object({
  id: z.string(),
  filename: z.string().catch(''),
  url: z.string().catch(''),
});

export type Avatar = z.infer<typeof avatarSchema>;

export const avatarListSchema = z.object({
  avatars: z.array(avatarSchema).catch([]),
});

export const settingsSchema = userPreferencesSchema.extend({
  notificationStyle: z.string().optional(),
  language: z.string().optional(),
});

export type UserSettings = z.infer<typeof settingsSchema>;

/* ── Devices ── */

export const deviceSchema = z.object({
  deviceId: z.string(),
  expoPushToken: z.string().catch(''),
  platform: z.string().catch(''),
  enabled: z.boolean().catch(true),
  registeredAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Device = z.infer<typeof deviceSchema>;

/* ── Sync ── */

export const syncPullSchema = z.object({
  serverTime: z.string().catch(''),
  full: z.boolean().catch(false),
  tasks: z.array(taskSchema).catch([]),
  subtasks: z.array(subtaskGroupSchema).catch([]),
  planner: z.array(plannerSchema).catch([]),
  summaries: z.array(summarySchema).catch([]),
  notifications: z.array(notificationSchema).catch([]),
  mood: z.array(moodEntrySchema).catch([]),
  reflections: z.array(reflectionSchema).catch([]),
  reminders: z.array(reminderSchema).catch([]),
  deleted: z
    .array(
      z.object({
        collection: z.string(),
        docId: z.string(),
      }),
    )
    .catch([]),
});

export type SyncPull = z.infer<typeof syncPullSchema>;

export const syncPushSchema = z.object({
  applied: z.record(z.string(), z.number()).catch({}),
  skipped: z.array(z.unknown()).catch([]),
  serverTime: z.string().catch(''),
});

export type SyncPush = z.infer<typeof syncPushSchema>;

/** Validates a payload against a schema, or fails with a server-shaped `ApiError`. */
export function parseOrThrow<T>(schema: z.ZodType<T>, payload: unknown, what: string): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError({
      kind: 'server',
      message: `The server returned an unexpected ${what} response.`,
    });
  }
  return result.data;
}
