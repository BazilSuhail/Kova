import { z } from 'zod';

import { request } from './client';
import { parseOrThrow, subtaskGroupSchema, type SubtaskGroup } from './types';

const subtaskListSchema = z.array(subtaskGroupSchema);

/** Subtask generation calls the model, so give it room. */
const AI_TIMEOUT_MS = 60_000;

/** `GET /api/subtasks/task/<taskId>` — every group of steps attached to a task. */
export async function listSubtasks(taskId: string): Promise<SubtaskGroup[]> {
  const payload = await request<unknown>(`/api/subtasks/task/${taskId}`);
  return parseOrThrow(subtaskListSchema, payload, 'subtasks');
}

/**
 * `POST /api/subtasks/create` — asks the model to split the task's description into 3–8 steps
 * and stores them as one group. A task with an empty description cannot produce useful steps.
 */
export async function generateSubtasks(taskId: string, title?: string): Promise<SubtaskGroup> {
  const payload = await request<unknown>('/api/subtasks/create', {
    method: 'POST',
    body: title ? { taskId, title } : { taskId },
    timeoutMs: AI_TIMEOUT_MS,
  });
  return parseOrThrow(subtaskGroupSchema, payload, 'subtasks');
}

/** `PUT /api/subtasks/<subtaskId>` — `done` covers the whole group. */
export async function updateSubtask(
  subtaskId: string,
  input: { title?: string; done?: boolean; order?: number },
): Promise<void> {
  await request<unknown>(`/api/subtasks/${subtaskId}`, { method: 'PUT', body: input });
}

/** `DELETE /api/subtasks/<subtaskId>` — removes one group. */
export async function deleteSubtask(subtaskId: string): Promise<void> {
  await request<unknown>(`/api/subtasks/${subtaskId}`, { method: 'DELETE' });
}

/** `DELETE /api/subtasks/task/<taskId>` — removes every group for a task. */
export async function deleteSubtasksForTask(taskId: string): Promise<void> {
  await request<unknown>(`/api/subtasks/task/${taskId}`, { method: 'DELETE' });
}
