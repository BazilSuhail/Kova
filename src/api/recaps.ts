import { request } from './client';
import { dailyRecapSchema, parseOrThrow, weeklyRecapSchema, type DailyRecap, type WeeklyRecap } from './types';

/** `GET /api/daily-recap/` — today's finished and waiting tasks plus the planner reflection. */
export async function fetchDailyRecap(): Promise<DailyRecap> {
  const payload = await request<unknown>('/api/daily-recap/');
  return parseOrThrow(dailyRecapSchema, payload, 'daily recap');
}

/**
 * `GET /api/weekly-recap/` — seven days ending on `end` (defaults to today, UTC).
 *
 * Each day carries the same shape as the daily recap, so one card component renders both.
 */
export async function fetchWeeklyRecap(end?: string): Promise<WeeklyRecap> {
  const payload = await request<unknown>('/api/weekly-recap/', { query: { end } });
  return parseOrThrow(weeklyRecapSchema, payload, 'weekly recap');
}
