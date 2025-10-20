import { request } from './client';
import { parseOrThrow, progressSchema, type Progress } from './types';

/**
 * `GET /api/progress/` — totals, streaks, a 7-day load balance and achievements.
 *
 * Everything is derived on read, so this is always current with no cache to invalidate.
 */
export async function fetchProgress(): Promise<Progress> {
  const payload = await request<unknown>('/api/progress/');
  return parseOrThrow(progressSchema, payload, 'progress');
}
