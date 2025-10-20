import { z } from 'zod';

import { request } from './client';
import {
  parseOrThrow,
  reflectionSchema,
  todayReflectionSchema,
  type Reflection,
  type TodayReflection,
} from './types';

export type WriteReflectionInput = {
  text: string;
  mood?: string;
  /** `YYYY-MM-DD`; defaults to today (UTC) on the server. */
  date?: string;
  prompt?: string;
};

const reflectionListSchema = z.array(reflectionSchema);

/** `GET /api/reflections/today` — the day's curated prompt, affirmation and any entry. */
export async function fetchTodayReflection(date?: string): Promise<TodayReflection> {
  const payload = await request<unknown>('/api/reflections/today', { query: { date } });
  return parseOrThrow(todayReflectionSchema, payload, 'journal prompt');
}

/** `GET /api/reflections/` — the journal, newest first. */
export async function listReflections(): Promise<Reflection[]> {
  const payload = await request<unknown>('/api/reflections/');
  return parseOrThrow(reflectionListSchema, payload, 'reflections');
}

/** `GET /api/reflections/<reflectionId>` */
export async function fetchReflection(reflectionId: string): Promise<Reflection> {
  const payload = await request<unknown>(`/api/reflections/${reflectionId}`);
  return parseOrThrow(reflectionSchema, payload, 'reflection');
}

/** `POST /api/reflections/` — posting twice for the same date replaces that day's entry. */
export async function writeReflection(input: WriteReflectionInput): Promise<Reflection> {
  const payload = await request<unknown>('/api/reflections/', { method: 'POST', body: input });
  return parseOrThrow(reflectionSchema, payload, 'reflection');
}

/** `DELETE /api/reflections/<reflectionId>` */
export async function deleteReflection(reflectionId: string): Promise<void> {
  await request<unknown>(`/api/reflections/${reflectionId}`, { method: 'DELETE' });
}
