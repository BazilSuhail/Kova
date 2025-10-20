import { request } from './client';
import { dashboardSchema, parseOrThrow, type Dashboard } from './types';

/**
 * `GET /api/dashboard/` — the whole home screen in one round trip: task counts, today's
 * tasks, unread count, next reminders, latest mood, streak and suggestions.
 */
export async function fetchDashboard(): Promise<Dashboard> {
  const payload = await request<unknown>('/api/dashboard/');
  return parseOrThrow(dashboardSchema, payload, 'dashboard');
}
