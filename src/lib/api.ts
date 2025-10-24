import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';

import { API_BASE } from '@/config/env';
import { ApiError, defaultMessageFor, isNotFound, kindForStatus } from '@/lib/errors';
import { todayIsoDate } from '@/lib/format';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { tokenStorage, type TokenPair } from '@/lib/storage';
import { fileFormData, type UploadFile } from '@/lib/upload';

export const tokenPairSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  userId: z.string().optional(),
});

export type TokenPairPayload = z.infer<typeof tokenPairSchema>;

export const userPreferencesSchema = z.object({
  theme: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  fontSize: z.string().optional(),
  layout: z.string().optional(),
  notificationStyle: z.string().optional(),
  language: z.string().optional(),
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

export function listSchema<S extends z.ZodType>(item: S) {
  return z.union([z.array(item), z.object({ items: z.array(item), pagination: paginationSchema })]);
}

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

export const subtaskGroupSchema = z.object({
  subtaskId: z.string(),
  title: z.string().optional(),
  order: z.number().optional(),
  done: z.boolean().optional(),
  subTasks: z.array(z.string()).optional(),
});

export type SubtaskGroup = z.infer<typeof subtaskGroupSchema>;

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

export const plannerSchema = z.object({
  plannerId: z.string(),
  date: z.string().catch(''),
  focusTasks: z.array(z.string()).catch([]),
  tasks: z.array(z.string()).catch([]),
  reflection: z.string().catch(''),

  tasksDetails: z.array(taskSchema).catch([]),
});

export type Planner = z.infer<typeof plannerSchema>;

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

export const weeklyRecapSchema = z.object({
  startDate: z.string().catch(''),
  endDate: z.string().catch(''),

  days: z.array(dailyRecapSchema).catch([]),
  totals: z.object({
    completedTasks: z.number().catch(0),
    pendingTasks: z.number().catch(0),
  }),
});

export type WeeklyRecap = z.infer<typeof weeklyRecapSchema>;

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

  reflection: reflectionSchema.nullable().catch(null),
});

export type TodayReflection = z.infer<typeof todayReflectionSchema>;

export const summaryCreateSchema = z.object({
  summary: summarySchema,

  task: taskSchema.nullable().catch(null),
});

export type SummaryCreate = z.infer<typeof summaryCreateSchema>;

export const avatarSchema = z.object({
  id: z.string(),
  filename: z.string().catch(''),
  url: z.string().catch(''),
});

export type Avatar = z.infer<typeof avatarSchema>;

export const avatarListSchema = z.object({
  avatars: z.array(avatarSchema).catch([]),
});

export const settingsSchema = userPreferencesSchema;

export type UserSettings = z.infer<typeof settingsSchema>;

export const deviceSchema = z.object({
  deviceId: z.string(),
  expoPushToken: z.string().catch(''),
  platform: z.string().catch(''),
  enabled: z.boolean().catch(true),
  registeredAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Device = z.infer<typeof deviceSchema>;

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

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryValue = string | number | boolean | undefined | null;

export type RequestOptions = {
  method?: HttpMethod;

  body?: unknown;

  query?: Record<string, QueryValue>;

  form?: FormData;

  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
};

const DEFAULT_TIMEOUT_MS = 20_000;
const REFRESH_PATH = '/api/auth/refresh';

type SessionExpiredHandler = () => void;

let onSessionExpired: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  onSessionExpired = handler;
}

let refreshInFlight: Promise<TokenPair | null> | null = null;

async function refreshTokens(): Promise<TokenPair | null> {
  if (refreshInFlight) return refreshInFlight;

  const task = (async (): Promise<TokenPair | null> => {
    const current = await tokenStorage.load();
    if (!current) return null;

    try {
      const response = await fetch(`${API_BASE}${REFRESH_PATH}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: current.refreshToken }),
      });
      if (!response.ok) return null;

      const payload = parseOrThrow(tokenPairSchema, await response.json(), 'token refresh');
      const next: TokenPair = {
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
      };

      await tokenStorage.save(next);
      return next;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  refreshInFlight = task;
  return task;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return send<T>(path, options, false);
}

async function send<T>(path: string, options: RequestOptions, retried: boolean): Promise<T> {
  const requiresAuth = options.auth ?? true;
  const tokens = requiresAuth ? await tokenStorage.load() : null;

  const { response, requestId } = await performFetch(path, options, tokens);

  if (response.status === 401 && requiresAuth && !retried && tokens?.refreshToken) {
    const refreshed = await refreshTokens();
    if (refreshed) return send<T>(path, options, true);

    await tokenStorage.clear();
    onSessionExpired?.();
    throw new ApiError({
      status: 401,
      kind: 'auth',
      requestId,
      message: defaultMessageFor('auth'),
    });
  }

  return readBody<T>(response, requestId);
}

async function performFetch(
  path: string,
  options: RequestOptions,
  tokens: TokenPair | null,
): Promise<{ response: Response; requestId: string | undefined }> {
  const url = buildUrl(path, options.query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
  let body: string | FormData | undefined;

  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      signal: controller.signal,
      ...(body === undefined ? {} : { body }),
    });
    logResponse(path, options.method ?? 'GET', response);
    return { response, requestId: response.headers.get('X-Request-ID') ?? undefined };
  } catch (error) {
    if (options.signal?.aborted) {
      throw new ApiError({
        kind: 'cancelled',
        message: defaultMessageFor('cancelled'),
        cause: error,
      });
    }
    if (controller.signal.aborted) {
      throw new ApiError({ kind: 'timeout', message: defaultMessageFor('timeout'), cause: error });
    }
    throw new ApiError({ kind: 'network', message: defaultMessageFor('network'), cause: error });
  } finally {
    clearTimeout(timer);
  }
}

async function readBody<T>(response: Response, requestId: string | undefined): Promise<T> {
  if (!response.ok) throw await toApiError(response, requestId);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text.trim()) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError({
      status: response.status,
      kind: 'server',
      requestId,
      message: 'The server returned a response the app could not read.',
    });
  }
}

async function toApiError(response: Response, requestId: string | undefined): Promise<ApiError> {
  const kind = kindForStatus(response.status);
  let message = defaultMessageFor(kind);

  try {
    const payload = (await response.json()) as { message?: unknown };
    if (typeof payload?.message === 'string' && payload.message.trim()) {
      message = payload.message;
    }
  } catch {}

  const retryAfterSeconds = Number.parseInt(response.headers.get('Retry-After') ?? '', 10);

  return new ApiError({
    status: response.status,
    kind,
    message,
    requestId,
    retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
  });
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return base;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    search.append(key, String(value));
  }

  const queryString = search.toString();
  return queryString ? `${base}?${queryString}` : base;
}

function logResponse(path: string, method: string, response: Response): void {
  if (!__DEV__) return;
  const timing = response.headers.get('Server-Timing');
  const requestId = response.headers.get('X-Request-ID');
  if (!timing && !requestId) return;
  console.log(
    `[api] ${method} ${path} -> ${response.status}`,
    timing ?? '',
    requestId ? `req=${requestId}` : '',
  );
}

export type Paginated<T> = {
  items: T[];
  page: number | null;
  limit: number | null;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type ListEnvelope<T> = {
  items?: T[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
};

export function unwrapList<T>(payload: T[] | ListEnvelope<T>): Paginated<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: null,
      limit: null,
      total: payload.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    };
  }

  const items = payload.items ?? [];
  const pagination = payload.pagination ?? {};
  return {
    items,
    page: pagination.page ?? 1,
    limit: pagination.limit ?? null,
    total: pagination.total ?? items.length,
    totalPages: pagination.totalPages ?? 1,
    hasNext: pagination.hasNext ?? false,
    hasPrev: pagination.hasPrev ?? false,
  };
}

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export async function signup(input: SignupInput): Promise<TokenPairPayload> {
  const payload = await request<unknown>('/api/auth/signup', {
    method: 'POST',
    body: input,
    auth: false,
  });
  return parseOrThrow(tokenPairSchema, payload, 'signup');
}

export async function login(input: LoginInput): Promise<TokenPairPayload> {
  const payload = await request<unknown>('/api/auth/login', {
    method: 'POST',
    body: input,
    auth: false,
  });
  return parseOrThrow(tokenPairSchema, payload, 'login');
}

export async function fetchMe(): Promise<AuthUser> {
  const payload = await request<unknown>('/api/auth/me');
  return parseOrThrow(userSchema, payload, 'profile');
}

export async function logout(refreshToken?: string): Promise<void> {
  await request<{ message?: string }>('/api/auth/logout', {
    method: 'POST',
    body: refreshToken ? { refresh_token: refreshToken } : {},
  });
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await request<{ message?: string }>('/api/auth/password', { method: 'PUT', body: input });
}

export type CalendarViewKind = 'day' | 'week' | 'month';

export async function fetchCalendar(view: CalendarViewKind, date?: string): Promise<CalendarView> {
  const payload = await request<unknown>('/api/calendar/', { query: { view, date } });
  return parseOrThrow(calendarSchema, payload, 'calendar');
}

export async function fetchDashboard(): Promise<Dashboard> {
  const payload = await request<unknown>('/api/dashboard/');
  return parseOrThrow(dashboardSchema, payload, 'dashboard');
}

export type DevicePlatform = 'ios' | 'android' | 'web';

const deviceListSchema = z.array(deviceSchema);

export async function listDevices(): Promise<Device[]> {
  const payload = await request<unknown>('/api/devices/');
  return parseOrThrow(deviceListSchema, payload, 'devices');
}

export async function registerDevice(input: {
  expoPushToken: string;
  platform: DevicePlatform;
}): Promise<Device> {
  const payload = await request<unknown>('/api/devices/', { method: 'POST', body: input });
  return parseOrThrow(deviceSchema, payload, 'device');
}

export async function unregisterDevice(deviceId: string): Promise<void> {
  await request<unknown>(`/api/devices/${deviceId}`, { method: 'DELETE' });
}

export type MoodFilters = {
  page?: number;
  limit?: number;
};

export type LogMoodInput = {
  mood: string;
  score?: number;
  energy?: number;
  note?: string;
  tags?: string[];
};

const moodListSchema = listSchema(moodEntrySchema);

export async function listMoodEntries(filters: MoodFilters = {}): Promise<Paginated<MoodEntry>> {
  const payload = await request<unknown>('/api/mood/', { query: { ...filters } });
  return unwrapList(parseOrThrow(moodListSchema, payload, 'mood entries'));
}

export async function logMood(input: LogMoodInput): Promise<MoodEntry> {
  const payload = await request<unknown>('/api/mood/', { method: 'POST', body: input });
  return parseOrThrow(moodEntrySchema, payload, 'mood entry');
}

export async function fetchMoodTrends(days = 30): Promise<MoodTrends> {
  const payload = await request<unknown>('/api/mood/trends', { query: { days } });
  return parseOrThrow(moodTrendsSchema, payload, 'mood trends');
}

export async function fetchMoodLoad(
  input: { mood?: string; energy?: number } = {},
): Promise<MoodLoad> {
  const payload = await request<unknown>('/api/mood/suggestions', { method: 'POST', body: input });
  return parseOrThrow(moodLoadSchema, payload, 'mood guidance');
}

export async function deleteMoodEntry(moodId: string): Promise<void> {
  await request<unknown>(`/api/mood/${moodId}`, { method: 'DELETE' });
}

export type NotificationFilters = {
  unread?: boolean;
  page?: number;
  limit?: number;
};

const notificationListSchema = listSchema(notificationSchema);

export async function listNotifications(
  filters: NotificationFilters = {},
): Promise<Paginated<NotificationItem>> {
  const payload = await request<unknown>('/api/notifications/', { query: { ...filters } });
  return unwrapList(parseOrThrow(notificationListSchema, payload, 'notifications'));
}

export async function markNotificationRead(notificationId: string, read = true): Promise<void> {
  await request<unknown>(`/api/notifications/${notificationId}`, { method: 'PUT', body: { read } });
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await request<unknown>(`/api/notifications/${notificationId}`, { method: 'DELETE' });
}

export type CreatePlannerInput = {
  date: string;
  focusTasks?: string[];
  tasks?: string[];
  reflection?: string;
};

export type UpdatePlannerInput = {
  date?: string;
  focusTasks?: string[];
  tasks?: string[];
  reflection?: string;
};

const plannerListSchema = z.array(plannerSchema);

export async function listPlanners(): Promise<Planner[]> {
  const payload = await request<unknown>('/api/planner/');
  return parseOrThrow(plannerListSchema, payload, 'planner');
}

export async function createPlanner(input: CreatePlannerInput): Promise<Planner> {
  const payload = await request<unknown>('/api/planner/', { method: 'POST', body: input });
  return parseOrThrow(plannerSchema, payload, 'planner');
}

export async function updatePlanner(plannerId: string, input: UpdatePlannerInput): Promise<void> {
  await request<unknown>(`/api/planner/${plannerId}`, { method: 'PUT', body: input });
}

export async function updatePlannerFocus(plannerId: string, focusTasks: string[]): Promise<void> {
  await request<unknown>(`/api/planner/${plannerId}/focus`, {
    method: 'PUT',
    body: { focusTasks },
  });
}

export async function deletePlanner(plannerId: string): Promise<void> {
  await request<unknown>(`/api/planner/${plannerId}`, { method: 'DELETE' });
}

export async function fetchProgress(): Promise<Progress> {
  const payload = await request<unknown>('/api/progress/');
  return parseOrThrow(progressSchema, payload, 'progress');
}

export async function fetchDailyRecap(): Promise<DailyRecap> {
  const payload = await request<unknown>('/api/daily-recap/');
  return parseOrThrow(dailyRecapSchema, payload, 'daily recap');
}

export async function fetchWeeklyRecap(end?: string): Promise<WeeklyRecap> {
  const payload = await request<unknown>('/api/weekly-recap/', { query: { end } });
  return parseOrThrow(weeklyRecapSchema, payload, 'weekly recap');
}

export type WriteReflectionInput = {
  text: string;
  mood?: string;

  date?: string;
  prompt?: string;
};

const reflectionListSchema = z.array(reflectionSchema);

export async function fetchTodayReflection(date?: string): Promise<TodayReflection> {
  const payload = await request<unknown>('/api/reflections/today', { query: { date } });
  return parseOrThrow(todayReflectionSchema, payload, 'journal prompt');
}

export async function listReflections(): Promise<Reflection[]> {
  const payload = await request<unknown>('/api/reflections/');
  return parseOrThrow(reflectionListSchema, payload, 'reflections');
}

export async function fetchReflection(reflectionId: string): Promise<Reflection> {
  const payload = await request<unknown>(`/api/reflections/${reflectionId}`);
  return parseOrThrow(reflectionSchema, payload, 'reflection');
}

export async function writeReflection(input: WriteReflectionInput): Promise<Reflection> {
  const payload = await request<unknown>('/api/reflections/', { method: 'POST', body: input });
  return parseOrThrow(reflectionSchema, payload, 'reflection');
}

export async function deleteReflection(reflectionId: string): Promise<void> {
  await request<unknown>(`/api/reflections/${reflectionId}`, { method: 'DELETE' });
}

export type ReminderStatus = 'pending' | 'sent';

export type CreateReminderInput = {
  title: string;

  fireAt: string;
  message?: string;
};

const reminderListSchema = z.array(reminderSchema);

export async function listReminders(status?: ReminderStatus): Promise<Reminder[]> {
  const payload = await request<unknown>('/api/reminders/', { query: { status } });
  return parseOrThrow(reminderListSchema, payload, 'reminders');
}

export async function listUpcomingReminders(hours = 48): Promise<Reminder[]> {
  const payload = await request<unknown>('/api/reminders/upcoming', { query: { hours } });
  return parseOrThrow(reminderListSchema, payload, 'reminders');
}

export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const payload = await request<unknown>('/api/reminders/', { method: 'POST', body: input });
  return parseOrThrow(reminderSchema, payload, 'reminder');
}

export async function deleteReminder(reminderId: string): Promise<void> {
  await request<unknown>(`/api/reminders/${reminderId}`, { method: 'DELETE' });
}

const subtaskListSchema = z.array(subtaskGroupSchema);

const SUBTASK_TIMEOUT_MS = 60_000;

export async function listSubtasks(taskId: string): Promise<SubtaskGroup[]> {
  const payload = await request<unknown>(`/api/subtasks/task/${taskId}`);
  return parseOrThrow(subtaskListSchema, payload, 'subtasks');
}

export async function generateSubtasks(taskId: string, title?: string): Promise<SubtaskGroup> {
  const payload = await request<unknown>('/api/subtasks/create', {
    method: 'POST',
    body: title ? { taskId, title } : { taskId },
    timeoutMs: SUBTASK_TIMEOUT_MS,
  });
  return parseOrThrow(subtaskGroupSchema, payload, 'subtasks');
}

export async function updateSubtask(
  subtaskId: string,
  input: { title?: string; done?: boolean; order?: number },
): Promise<void> {
  await request<unknown>(`/api/subtasks/${subtaskId}`, { method: 'PUT', body: input });
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  await request<unknown>(`/api/subtasks/${subtaskId}`, { method: 'DELETE' });
}

const suggestionListSchema = z.object({
  generatedAt: z.string().optional(),
  suggestions: z.array(suggestionSchema).catch([]),
});

export async function fetchSuggestions(): Promise<Suggestion[]> {
  const payload = await request<unknown>('/api/suggestions/');
  return parseOrThrow(suggestionListSchema, payload, 'suggestions').suggestions;
}

export type SummaryFilters = {
  page?: number;
  limit?: number;
};

const summaryListSchema = listSchema(summarySchema);

const UPLOAD_TIMEOUT_MS = 120_000;

export async function listSummaries(filters: SummaryFilters = {}): Promise<Paginated<Summary>> {
  const payload = await request<unknown>('/api/summaries/', { query: { ...filters } });
  return unwrapList(parseOrThrow(summaryListSchema, payload, 'summaries'));
}

export async function createSummaryFromText(input: {
  text: string;
  title?: string;
}): Promise<SummaryCreate> {
  const payload = await request<unknown>('/api/summaries/create-from-text', {
    method: 'POST',
    body: input,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
  return parseOrThrow(summaryCreateSchema, payload, 'summary');
}

export async function createSummaryFromPdf(file: UploadFile): Promise<SummaryCreate> {
  const payload = await request<unknown>('/api/summaries/create', {
    method: 'POST',
    form: await fileFormData(file),
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
  return parseOrThrow(summaryCreateSchema, payload, 'summary');
}

export async function convertSummaryToTask(summaryId: string): Promise<Task> {
  const payload = await request<unknown>(`/api/summaries/${summaryId}/convert-to-tasks`, {
    method: 'POST',
  });
  return parseOrThrow(taskSchema, payload, 'task');
}

export async function updateSummary(summaryId: string, summaryBullets: string[]): Promise<void> {
  await request<unknown>(`/api/summaries/${summaryId}`, {
    method: 'PUT',
    body: { summaryBullets },
  });
}

export async function deleteSummary(summaryId: string): Promise<void> {
  await request<unknown>(`/api/summaries/${summaryId}`, { method: 'DELETE' });
}

const SYNC_TIMEOUT_MS = 60_000;

export async function pullSync(since?: string): Promise<SyncPull> {
  const payload = await request<unknown>('/api/sync/pull', {
    method: 'POST',
    body: since ? { since } : {},
    timeoutMs: SYNC_TIMEOUT_MS,
  });
  return parseOrThrow(syncPullSchema, payload, 'sync');
}

export type TaskFilters = {
  completed?: boolean;
  category?: string;

  q?: string;
  page?: number;
  limit?: number;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  createdFrom?: 'manual' | 'natural-language' | 'voice' | 'image';
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  category?: string;
  dueDate?: string;
  isCompleted?: boolean;
};

const taskListSchema = listSchema(taskSchema);
const titleSchema = z.object({ title: z.string() });
const categorySchema = z.object({ taskId: z.string().optional(), category: z.string() });

const AI_TIMEOUT_MS = 45_000;

const CAPTURE_TIMEOUT_MS = 90_000;

export async function listTasks(filters: TaskFilters = {}): Promise<Paginated<Task>> {
  const payload = await request<unknown>('/api/tasks/', { query: { ...filters } });
  return unwrapList(parseOrThrow(taskListSchema, payload, 'tasks'));
}

export async function fetchTask(taskId: string): Promise<Task> {
  const payload = await request<unknown>(`/api/tasks/${taskId}`);
  return parseOrThrow(taskSchema, payload, 'task');
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const payload = await request<unknown>('/api/tasks/', {
    method: 'POST',
    body: { createdFrom: 'manual', ...input },
  });
  return parseOrThrow(taskSchema, payload, 'task');
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<void> {
  await request<unknown>(`/api/tasks/${taskId}`, { method: 'PUT', body: input });
}

export async function deleteTask(taskId: string): Promise<void> {
  await request<unknown>(`/api/tasks/${taskId}`, { method: 'DELETE' });
}

export async function createTaskFromPrompt(prompt: string): Promise<Task> {
  const payload = await request<unknown>('/api/tasks/create/natural-language', {
    method: 'POST',
    body: { prompt },
    timeoutMs: AI_TIMEOUT_MS,
  });
  return parseOrThrow(taskSchema, payload, 'task');
}

export async function createTaskFromVoice(file: UploadFile): Promise<Task> {
  const payload = await request<unknown>('/api/tasks/create/voice', {
    method: 'POST',
    form: await fileFormData(file),
    timeoutMs: CAPTURE_TIMEOUT_MS,
  });
  return parseOrThrow(taskSchema, payload, 'task');
}

const imageTaskSchema = taskSchema.extend({ extractedText: z.string().catch('') });

export type ImageCapture = {
  task: Task;
  extractedText: string;
};

export async function createTaskFromImage(file: UploadFile): Promise<ImageCapture> {
  const payload = await request<unknown>('/api/tasks/create/image', {
    method: 'POST',
    form: await fileFormData(file),
    timeoutMs: CAPTURE_TIMEOUT_MS,
  });
  const parsed = parseOrThrow(imageTaskSchema, payload, 'task');
  return { task: parsed, extractedText: parsed.extractedText };
}

export async function suggestTitle(title: string): Promise<string> {
  const payload = await request<unknown>('/api/tasks/suggest-title', {
    method: 'POST',
    body: { title },
    timeoutMs: AI_TIMEOUT_MS,
  });
  return parseOrThrow(titleSchema, payload, 'title suggestion').title;
}

export async function categorizeTask(taskId: string): Promise<string> {
  const payload = await request<unknown>(`/api/tasks/${taskId}/categorize`, { method: 'POST' });
  return parseOrThrow(categorySchema, payload, 'category').category;
}

export async function rewriteTaskTitle(taskId: string): Promise<string> {
  const payload = await request<unknown>(`/api/tasks/${taskId}/rewrite-title`, {
    method: 'POST',
    timeoutMs: AI_TIMEOUT_MS,
  });
  return parseOrThrow(titleSchema, payload, 'rewritten title').title;
}

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  profilePicture?: string;
  preferences?: UserPreferences;

  avatarId?: string;
};

export async function fetchProfile(): Promise<AuthUser> {
  const payload = await request<unknown>('/api/users/profile');
  return parseOrThrow(userSchema, payload, 'profile');
}

export async function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  const payload = await request<unknown>('/api/users/profile', { method: 'PUT', body: input });
  return parseOrThrow(userSchema, payload, 'profile');
}

export async function fetchSettings(): Promise<UserSettings> {
  const payload = await request<unknown>('/api/users/profile/settings');
  return parseOrThrow(settingsSchema, payload, 'settings');
}

export async function updateSettings(input: Partial<UserSettings>): Promise<UserSettings> {
  const payload = await request<unknown>('/api/users/profile/settings', {
    method: 'PUT',
    body: input,
  });
  return parseOrThrow(settingsSchema, payload, 'settings');
}

export async function listAvatars(): Promise<Avatar[]> {
  const payload = await request<unknown>('/api/users/avatars', { auth: false });
  return parseOrThrow(avatarListSchema, payload, 'avatars').avatars;
}

export async function deleteAccount(): Promise<void> {
  await request<unknown>('/api/users/profile', { method: 'DELETE' });
}

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

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => fetchProfile(),
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (profile) => {
      client.setQueryData(queryKeys.profile, profile);

      void client.invalidateQueries({ queryKey: queryKeys.avatars });
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: fetchSettings,
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<UserSettings>) => updateSettings(input),
    onSuccess: (settings) => client.setQueryData(queryKeys.settings, settings),
  });
}

export function useAvatars() {
  return useQuery({
    queryKey: queryKeys.avatars,
    queryFn: listAvatars,

    staleTime: 30 * 60_000,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => changePassword(input),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => deleteAccount(),
  });
}

export function useDevices() {
  return useQuery({
    queryKey: queryKeys.devices,
    queryFn: listDevices,
  });
}

export function useRegisterDevice() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { expoPushToken: string; platform: DevicePlatform }) =>
      registerDevice(input),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.devices }),
  });
}

export function useUnregisterDevice() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => unregisterDevice(deviceId),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.devices }),
  });
}

export function useSyncPull() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (since?: string) => pullSync(since),
    onSuccess: () => client.invalidateQueries(),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboard,

    staleTime: 15_000,
  });
}

export function useDailyRecap() {
  return useQuery({
    queryKey: queryKeys.dailyRecap,
    queryFn: fetchDailyRecap,
    staleTime: 15_000,
  });
}

const PAGE_SIZE = 20;

export function useProgress() {
  return useQuery({
    queryKey: queryKeys.progress,
    queryFn: fetchProgress,
    staleTime: 30_000,
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: queryKeys.suggestions,
    queryFn: fetchSuggestions,
    staleTime: 30_000,
  });
}

export function useMoodEntries(filters: MoodFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.moodList(filters),
    queryFn: ({ pageParam }) => listMoodEntries({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 1) + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useMoodTrends(days = 30) {
  return useQuery({
    queryKey: queryKeys.moodTrends(days),
    queryFn: () => fetchMoodTrends(days),
  });
}

export function useMoodLoad(input: { mood?: string; energy?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.moodLoad(input.mood, input.energy),
    queryFn: () => fetchMoodLoad(input),
    staleTime: 60_000,
  });
}

export function useLogMood() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: LogMoodInput) => logMood(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.mood });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
      void client.invalidateQueries({ queryKey: queryKeys.progress });
      void client.invalidateQueries({ queryKey: queryKeys.suggestions });
    },
  });
}

export function useDeleteMoodEntry() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (moodId: string) => deleteMoodEntry(moodId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.mood });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
      void client.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}

export function useTodayReflection(date?: string) {
  return useQuery({
    queryKey: queryKeys.todayReflection(date),
    queryFn: () => fetchTodayReflection(date),
  });
}

export function useReflections() {
  return useQuery({
    queryKey: queryKeys.reflections,
    queryFn: listReflections,
  });
}

export function useReflection(reflectionId: string) {
  return useQuery({
    queryKey: queryKeys.reflection(reflectionId),
    queryFn: () => fetchReflection(reflectionId),
    enabled: Boolean(reflectionId),
  });
}

export function useWriteReflection(date?: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: WriteReflectionInput) => writeReflection(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.reflections });
      void client.invalidateQueries({ queryKey: queryKeys.todayReflection(date) });
      void client.invalidateQueries({ queryKey: queryKeys.recaps });
      void client.invalidateQueries({ queryKey: queryKeys.progress });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteReflection() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (reflectionId: string) => deleteReflection(reflectionId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.reflections });
      void client.invalidateQueries({ queryKey: queryKeys.recaps });
      void client.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}

export function useSummaries(filters: SummaryFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.summaryList(filters),
    queryFn: ({ pageParam }) => listSummaries({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 1) + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useSummary(summaryId: string): {
  summary: Summary | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
} {
  const query = useSummaries();
  const summary =
    query.data?.pages.flatMap((page) => page.items).find((item) => item.summaryId === summaryId) ??
    null;

  return {
    summary,
    isLoading: query.isPending || (query.isFetching && !summary),
    isError: query.isError && !summary,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}

export function useCreateSummaryFromText() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { text: string; title?: string }) => createSummaryFromText(input),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.summaries }),
  });
}

export function useCreateSummaryFromPdf() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (file: UploadFile) => createSummaryFromPdf(file),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.summaries }),
  });
}

export function useConvertSummaryToTask() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (summaryId: string) => convertSummaryToTask(summaryId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.tasks });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateSummary() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ summaryId, bullets }: { summaryId: string; bullets: string[] }) =>
      updateSummary(summaryId, bullets),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.summaries }),
  });
}

export function useDeleteSummary() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (summaryId: string) => deleteSummary(summaryId),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.summaries }),
  });
}

const NOTIFICATION_PAGE_SIZE = 20;

type NotificationListData = InfiniteData<Paginated<NotificationItem>>;

export type NotificationQuery = Omit<NotificationFilters, 'page' | 'limit'>;

export function useNotifications(filters: NotificationQuery) {
  return useInfiniteQuery({
    queryKey: queryKeys.notificationList(filters),
    queryFn: ({ pageParam }) =>
      listNotifications({ ...filters, page: pageParam, limit: NOTIFICATION_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 1) + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

function useNotificationRefresher() {
  const client = useQueryClient();

  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.notifications });
    void client.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

export function useMarkNotificationRead() {
  const client = useQueryClient();
  const refresh = useNotificationRefresher();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),

    onMutate: async (notificationId) => {
      await client.cancelQueries({ queryKey: queryKeys.notifications });
      const lists = client.getQueriesData<NotificationListData>({
        queryKey: queryKeys.notificationLists,
      });

      client.setQueriesData<NotificationListData>(
        { queryKey: queryKeys.notificationLists },
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  items: page.items.map((item) =>
                    item.notificationId === notificationId ? { ...item, read: true } : item,
                  ),
                })),
              }
            : data,
      );

      return { lists };
    },

    onError: (_error, _notificationId, context) => {
      context?.lists.forEach(([key, data]) => client.setQueryData(key, data));
    },

    onSettled: refresh,
  });
}

export function useDeleteNotification() {
  const client = useQueryClient();
  const refresh = useNotificationRefresher();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),

    onMutate: async (notificationId) => {
      await client.cancelQueries({ queryKey: queryKeys.notifications });
      const lists = client.getQueriesData<NotificationListData>({
        queryKey: queryKeys.notificationLists,
      });

      client.setQueriesData<NotificationListData>(
        { queryKey: queryKeys.notificationLists },
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((item) => item.notificationId !== notificationId),
                  total: Math.max(0, page.total - 1),
                })),
              }
            : data,
      );

      return { lists };
    },

    onError: (_error, _notificationId, context) => {
      context?.lists.forEach(([key, data]) => client.setQueryData(key, data));
    },

    onSettled: refresh,
  });
}

function usePlanRefresher() {
  const client = useQueryClient();

  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.planners });
    void client.invalidateQueries({ queryKey: queryKeys.calendar });
    void client.invalidateQueries({ queryKey: queryKeys.recaps });
    void client.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

export function usePlanners() {
  return useQuery({
    queryKey: queryKeys.planners,
    queryFn: listPlanners,
  });
}

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

export function useDeletePlanner() {
  const refresh = usePlanRefresher();
  return useMutation({
    mutationFn: (plannerId: string) => deletePlanner(plannerId),
    onSuccess: refresh,
  });
}

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

export function useWeeklyRecap(end?: string) {
  return useQuery({
    queryKey: queryKeys.weeklyRecap(end),
    queryFn: () => fetchWeeklyRecap(end),
  });
}

export type TaskQuery = Omit<TaskFilters, 'page' | 'limit'>;

const TASK_PAGE_SIZE = 20;

type TaskListData = InfiniteData<Paginated<Task>>;

function useTaskRefresher() {
  const client = useQueryClient();

  return (taskId?: string) => {
    void client.invalidateQueries({ queryKey: queryKeys.tasks });
    void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    void client.invalidateQueries({ queryKey: queryKeys.dailyRecap });
    if (taskId) void client.invalidateQueries({ queryKey: queryKeys.subtasks(taskId) });
  };
}

function patchCachedTask(
  client: QueryClient,
  taskId: string,
  transform: (task: Task) => Task,
): void {
  client.setQueriesData<TaskListData>({ queryKey: queryKeys.taskLists }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((task) => (task.taskId === taskId ? transform(task) : task)),
          })),
        }
      : data,
  );
}

export function useTasks(filters: TaskQuery) {
  return useInfiniteQuery({
    queryKey: queryKeys.taskList(filters),
    queryFn: ({ pageParam }) => listTasks({ ...filters, page: pageParam, limit: TASK_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 1) + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.task(taskId),
    queryFn: () => fetchTask(taskId),
    enabled: Boolean(taskId),
  });
}

export function useTaskCategories() {
  return useQuery({
    queryKey: queryKeys.taskCategories,
    queryFn: async (): Promise<string[]> => {
      const page = await listTasks({ limit: 100 });
      const found = new Set<string>();
      for (const task of page.items) {
        if (task.category) found.add(task.category);
      }
      return Array.from(found).sort();
    },
    staleTime: 5 * 60_000,
  });
}

export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: queryKeys.subtasks(taskId),
    queryFn: () => listSubtasks(taskId),
    enabled: Boolean(taskId),
  });
}

export function useCreateTask() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: (task) => {
      successFeedback();
      refresh(task.taskId);
    },
  });
}

export function useCaptureTask() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (prompt: string) => createTaskFromPrompt(prompt),
    onSuccess: (task) => {
      successFeedback();
      refresh(task.taskId);
    },
  });
}

export function useCaptureTaskFromVoice() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (file: UploadFile) => createTaskFromVoice(file),
    onSuccess: (task) => {
      successFeedback();
      refresh(task.taskId);
    },
  });
}

export function useCaptureTaskFromImage() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (file: UploadFile) => createTaskFromImage(file),
    onSuccess: ({ task }) => {
      successFeedback();
      refresh(task.taskId);
    },
  });
}

export function useToggleTask() {
  const client = useQueryClient();
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) =>
      updateTask(taskId, { isCompleted }),

    onSuccess: (_data, { isCompleted }) => {
      if (isCompleted) successFeedback();
    },

    onMutate: async ({ taskId, isCompleted }) => {
      await client.cancelQueries({ queryKey: queryKeys.tasks });
      const lists = client.getQueriesData<TaskListData>({ queryKey: queryKeys.taskLists });
      const detail = client.getQueryData<Task>(queryKeys.task(taskId));

      patchCachedTask(client, taskId, (task) => ({ ...task, isCompleted }));
      if (detail) client.setQueryData<Task>(queryKeys.task(taskId), { ...detail, isCompleted });

      return { lists, detail };
    },

    onError: (error, { taskId }, context) => {
      if (isNotFound(error)) return;

      context?.lists.forEach(([key, data]) => client.setQueryData(key, data));
      if (context?.detail) client.setQueryData(queryKeys.task(taskId), context.detail);
    },

    onSettled: (_data, _error, { taskId }) => refresh(taskId),
  });
}

export function useUpdateTask() {
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      updateTask(taskId, input),
    onSuccess: (_data, { taskId }) => refresh(taskId),
    onError: (error, { taskId }) => {
      if (isNotFound(error)) refresh(taskId);
    },
  });
}

export function useDeleteTask() {
  const client = useQueryClient();
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),

    onMutate: async (taskId) => {
      await client.cancelQueries({ queryKey: queryKeys.tasks });
      const lists = client.getQueriesData<TaskListData>({ queryKey: queryKeys.taskLists });
      const detail = client.getQueryData<Task>(queryKeys.task(taskId));

      client.setQueriesData<TaskListData>({ queryKey: queryKeys.taskLists }, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.filter((task) => task.taskId !== taskId),
                total: Math.max(0, page.total - 1),
              })),
            }
          : data,
      );
      client.removeQueries({ queryKey: queryKeys.task(taskId) });

      return { lists, detail };
    },

    onError: (_error, taskId, context) => {
      context?.lists.forEach(([key, data]) => client.setQueryData(key, data));
      if (context?.detail) client.setQueryData(queryKeys.task(taskId), context.detail);
    },

    onSettled: (_data, _error, taskId) => {
      warnFeedback();
      refresh(taskId);
    },
  });
}

export function useCategorizeTask() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (taskId: string) => categorizeTask(taskId),
    onSuccess: (_category, taskId) => refresh(taskId),
  });
}

export function useRewriteTaskTitle() {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (taskId: string) => rewriteTaskTitle(taskId),
    onSuccess: (_title, taskId) => refresh(taskId),
  });
}

export function useSuggestTitle() {
  return useMutation({
    mutationFn: (title: string) => suggestTitle(title),
  });
}

export function useGenerateSubtasks(taskId: string) {
  const refresh = useTaskRefresher();
  return useMutation({
    mutationFn: (title?: string) => generateSubtasks(taskId, title),
    onSuccess: () => refresh(taskId),
  });
}

export function useToggleSubtask(taskId: string) {
  const client = useQueryClient();
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: ({ subtaskId, done }: { subtaskId: string; done: boolean }) =>
      updateSubtask(subtaskId, { done }),

    onMutate: async ({ subtaskId, done }) => {
      await client.cancelQueries({ queryKey: queryKeys.subtasks(taskId) });
      const snapshot = client.getQueryData<SubtaskGroup[]>(queryKeys.subtasks(taskId));

      client.setQueryData<SubtaskGroup[]>(queryKeys.subtasks(taskId), (current) =>
        current
          ? current.map((group) => (group.subtaskId === subtaskId ? { ...group, done } : group))
          : current,
      );

      return { snapshot };
    },

    onError: (_error, _variables, context) => {
      if (context?.snapshot) client.setQueryData(queryKeys.subtasks(taskId), context.snapshot);
    },

    onSettled: () => refresh(taskId),
  });
}

export function useDeleteSubtask(taskId: string) {
  const client = useQueryClient();
  const refresh = useTaskRefresher();

  return useMutation({
    mutationFn: (subtaskId: string) => deleteSubtask(subtaskId),

    onMutate: async (subtaskId) => {
      await client.cancelQueries({ queryKey: queryKeys.subtasks(taskId) });
      const snapshot = client.getQueryData<SubtaskGroup[]>(queryKeys.subtasks(taskId));

      client.setQueryData<SubtaskGroup[]>(queryKeys.subtasks(taskId), (current) =>
        current ? current.filter((group) => group.subtaskId !== subtaskId) : current,
      );

      return { snapshot };
    },

    onError: (_error, _subtaskId, context) => {
      if (context?.snapshot) client.setQueryData(queryKeys.subtasks(taskId), context.snapshot);
    },

    onSettled: () => refresh(taskId),
  });
}
