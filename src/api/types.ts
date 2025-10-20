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
  title: z.string().optional(),
  fireAt: z.string().optional(),
  status: z.string().optional(),
});

export const moodSchema = z.object({
  moodId: z.string(),
  mood: z.string().optional(),
  score: z.number().optional(),
});

export const summarySchema = z.object({
  summaryId: z.string(),
  summaryBullets: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
});

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
