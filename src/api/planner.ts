import { z } from 'zod';

import { request } from './client';
import { parseOrThrow, plannerSchema, type Planner } from './types';

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

/** `GET /api/planner/` — every day plan, with `tasksDetails` already resolved. */
export async function listPlanners(): Promise<Planner[]> {
  const payload = await request<unknown>('/api/planner/');
  return parseOrThrow(plannerListSchema, payload, 'planner');
}

/** `POST /api/planner/` — only `date` is required. */
export async function createPlanner(input: CreatePlannerInput): Promise<Planner> {
  const payload = await request<unknown>('/api/planner/', { method: 'POST', body: input });
  return parseOrThrow(plannerSchema, payload, 'planner');
}

/**
 * `PUT /api/planner/<plannerId>`
 *
 * Unlike the task `PUT`, this one answers **200 even when nothing changed**, so a no-op
 * save is harmless here. At least one field must be present.
 */
export async function updatePlanner(plannerId: string, input: UpdatePlannerInput): Promise<void> {
  await request<unknown>(`/api/planner/${plannerId}`, { method: 'PUT', body: input });
}

/** `PUT /api/planner/<plannerId>/focus` — the day's headline intentions. */
export async function updatePlannerFocus(plannerId: string, focusTasks: string[]): Promise<void> {
  await request<unknown>(`/api/planner/${plannerId}/focus`, {
    method: 'PUT',
    body: { focusTasks },
  });
}

/** `PUT /api/planner/<plannerId>/tasks` — links task ids to the day. */
export async function updatePlannerTasks(plannerId: string, tasks: string[]): Promise<void> {
  await request<unknown>(`/api/planner/${plannerId}/tasks`, { method: 'PUT', body: { tasks } });
}

/** `DELETE /api/planner/<plannerId>` */
export async function deletePlanner(plannerId: string): Promise<void> {
  await request<unknown>(`/api/planner/${plannerId}`, { method: 'DELETE' });
}
