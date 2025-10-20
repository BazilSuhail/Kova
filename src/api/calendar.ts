import { request } from './client';
import { calendarSchema, parseOrThrow, type CalendarView } from './types';

export type CalendarViewKind = 'day' | 'week' | 'month';

/**
 * `GET /api/calendar/` — tasks plus the day's planner, bucketed per day.
 *
 * `week` starts on Monday, `month` spans the anchor's month, and `date` defaults to today
 * (UTC) on the server. There is no paging: a month view is 28–31 day buckets in one answer.
 */
export async function fetchCalendar(
  view: CalendarViewKind,
  date?: string,
): Promise<CalendarView> {
  const payload = await request<unknown>('/api/calendar/', { query: { view, date } });
  return parseOrThrow(calendarSchema, payload, 'calendar');
}
