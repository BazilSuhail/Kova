import { z } from 'zod';

import { request } from './client';
import { parseOrThrow, suggestionSchema, type Suggestion } from './types';

const suggestionListSchema = z.object({
  generatedAt: z.string().optional(),
  suggestions: z.array(suggestionSchema).catch([]),
});

/**
 * `GET /api/suggestions/` — adaptive, rule-based nudges derived from tasks, mood and
 * reflections. Rules are deterministic, so the list can change the moment data changes.
 */
export async function fetchSuggestions(): Promise<Suggestion[]> {
  const payload = await request<unknown>('/api/suggestions/');
  return parseOrThrow(suggestionListSchema, payload, 'suggestions').suggestions;
}
