import { request } from './client';
import { dailyRecapSchema, dashboardSchema, parseOrThrow, type DailyRecap, type Dashboard } from './types';

/** `GET /api/dashboard/` — the whole home screen in one round trip. */
export async function fetchDashboard(): Promise<Dashboard> {
  const payload = await request<unknown>('/api/dashboard/');
  return parseOrThrow(dashboardSchema, payload, 'dashboard');
}

/** `GET /api/daily-recap/` — today's finished and waiting tasks plus the planner's reflection. */
export async function fetchDailyRecap(): Promise<DailyRecap> {
  const payload = await request<unknown>('/api/daily-recap/');
  return parseOrThrow(dailyRecapSchema, payload, 'daily recap');
}
