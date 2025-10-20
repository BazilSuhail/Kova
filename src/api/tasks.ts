import { z } from 'zod';

import { request, unwrapList, type Paginated } from './client';
import { listSchema, parseOrThrow, taskSchema, type Task } from './types';

export type TaskFilters = {
  /** `true` = finished only, `false` = open only, `undefined` = both. */
  completed?: boolean;
  category?: string;
  /** Case-insensitive substring match on the title. */
  q?: string;
  page?: number;
  limit?: number;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  createdFrom?: 'manual' | 'natural-language' | 'voice' | 'image';
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  category?: string;
  dueDate?: string;
  isCompleted?: boolean;
};

const taskListSchema = listSchema(taskSchema);
const titleSchema = z.object({ title: z.string() });
const categorySchema = z.object({ taskId: z.string().optional(), category: z.string() });

/** LLM-backed routes need more patience than a plain database read. */
const AI_TIMEOUT_MS = 45_000;

/** `GET /api/tasks/` — one page of tasks, normalised across both list shapes. */
export async function listTasks(filters: TaskFilters = {}): Promise<Paginated<Task>> {
  const payload = await request<unknown>('/api/tasks/', { query: { ...filters } });
  return unwrapList(parseOrThrow(taskListSchema, payload, 'tasks'));
}

/** `GET /api/tasks/<taskId>` */
export async function fetchTask(taskId: string): Promise<Task> {
  const payload = await request<unknown>(`/api/tasks/${taskId}`);
  return parseOrThrow(taskSchema, payload, 'task');
}

/** `POST /api/tasks/` — manual create. The server categorises it from keywords when none is sent. */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const payload = await request<unknown>('/api/tasks/', {
    method: 'POST',
    body: { createdFrom: 'manual', ...input },
  });
  return parseOrThrow(taskSchema, payload, 'task');
}

/**
 * `PUT /api/tasks/<taskId>`
 *
 * ⚠️ The server answers **404 when no field actually changed**, so callers must read a
 * `notFound` here as "the task already looks like that", not as "the task is gone".
 */
export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<void> {
  await request<unknown>(`/api/tasks/${taskId}`, { method: 'PUT', body: input });
}

/** `DELETE /api/tasks/<taskId>` — also removes the task's subtask documents. */
export async function deleteTask(taskId: string): Promise<void> {
  await request<unknown>(`/api/tasks/${taskId}`, { method: 'DELETE' });
}

/** `POST /api/tasks/create/natural-language` — one sentence becomes a full task. */
export async function createTaskFromPrompt(prompt: string): Promise<Task> {
  const payload = await request<unknown>('/api/tasks/create/natural-language', {
    method: 'POST',
    body: { prompt },
    timeoutMs: AI_TIMEOUT_MS,
  });
  return parseOrThrow(taskSchema, payload, 'task');
}

/**
 * `POST /api/tasks/suggest-title` — rewrites a title without saving it.
 * Falls back to a local heuristic server side when no LLM key is configured.
 */
export async function suggestTitle(title: string): Promise<string> {
  const payload = await request<unknown>('/api/tasks/suggest-title', {
    method: 'POST',
    body: { title },
    timeoutMs: AI_TIMEOUT_MS,
  });
  return parseOrThrow(titleSchema, payload, 'title suggestion').title;
}

/** `POST /api/tasks/<taskId>/categorize` — re-derives and stores the category. */
export async function categorizeTask(taskId: string): Promise<string> {
  const payload = await request<unknown>(`/api/tasks/${taskId}/categorize`, { method: 'POST' });
  return parseOrThrow(categorySchema, payload, 'category').category;
}

/** `POST /api/tasks/<taskId>/rewrite-title` — rewrites the stored title. */
export async function rewriteTaskTitle(taskId: string): Promise<string> {
  const payload = await request<unknown>(`/api/tasks/${taskId}/rewrite-title`, {
    method: 'POST',
    timeoutMs: AI_TIMEOUT_MS,
  });
  return parseOrThrow(titleSchema, payload, 'rewritten title').title;
}
