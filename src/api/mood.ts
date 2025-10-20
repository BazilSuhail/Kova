import { request, unwrapList, type Paginated } from './client';
import {
  listSchema,
  moodEntrySchema,
  moodLoadSchema,
  moodTrendsSchema,
  parseOrThrow,
  type MoodEntry,
  type MoodLoad,
  type MoodTrends,
} from './types';

export type MoodFilters = {
  page?: number;
  limit?: number;
};

export type LogMoodInput = {
  /** Label such as `great`, `okay`, `awful`; the server derives the score from it. */
  mood: string;
  score?: number;
  energy?: number;
  note?: string;
  tags?: string[];
};

const moodListSchema = listSchema(moodEntrySchema);

/** `GET /api/mood/` — the feed, newest first. */
export async function listMoodEntries(filters: MoodFilters = {}): Promise<Paginated<MoodEntry>> {
  const payload = await request<unknown>('/api/mood/', { query: { ...filters } });
  return unwrapList(parseOrThrow(moodListSchema, payload, 'mood entries'));
}

/** `GET /api/mood/<moodId>` */
export async function fetchMoodEntry(moodId: string): Promise<MoodEntry> {
  const payload = await request<unknown>(`/api/mood/${moodId}`);
  return parseOrThrow(moodEntrySchema, payload, 'mood entry');
}

/** `POST /api/mood/` — logging twice a day is fine; each call is its own entry. */
export async function logMood(input: LogMoodInput): Promise<MoodEntry> {
  const payload = await request<unknown>('/api/mood/', { method: 'POST', body: input });
  return parseOrThrow(moodEntrySchema, payload, 'mood entry');
}

/** `GET /api/mood/trends?days=30` — clamped to 1..365 by the server. */
export async function fetchMoodTrends(days = 30): Promise<MoodTrends> {
  const payload = await request<unknown>('/api/mood/trends', { query: { days } });
  return parseOrThrow(moodTrendsSchema, payload, 'mood trends');
}

/**
 * `POST /api/mood/suggestions` — how much to take on today.
 *
 * Both fields are optional: with neither, the server reads the latest logged mood.
 */
export async function fetchMoodLoad(input: { mood?: string; energy?: number } = {}): Promise<MoodLoad> {
  const payload = await request<unknown>('/api/mood/suggestions', { method: 'POST', body: input });
  return parseOrThrow(moodLoadSchema, payload, 'mood guidance');
}

/** `DELETE /api/mood/<moodId>` */
export async function deleteMoodEntry(moodId: string): Promise<void> {
  await request<unknown>(`/api/mood/${moodId}`, { method: 'DELETE' });
}
