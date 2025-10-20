import { z } from 'zod';

import { request } from './client';
import { parseOrThrow, reminderSchema, type Reminder } from './types';

export type ReminderStatus = 'pending' | 'sent';

export type CreateReminderInput = {
  title: string;
  /** ISO datetime, or `YYYY-MM-DD` (the server reads a bare date as 09:00 UTC). */
  fireAt: string;
  message?: string;
};

const reminderListSchema = z.array(reminderSchema);

/** `GET /api/reminders/?status=pending|sent` */
export async function listReminders(status?: ReminderStatus): Promise<Reminder[]> {
  const payload = await request<unknown>('/api/reminders/', { query: { status } });
  return parseOrThrow(reminderListSchema, payload, 'reminders');
}

/** `GET /api/reminders/upcoming?hours=48` */
export async function listUpcomingReminders(hours = 48): Promise<Reminder[]> {
  const payload = await request<unknown>('/api/reminders/upcoming', { query: { hours } });
  return parseOrThrow(reminderListSchema, payload, 'reminders');
}

/** `POST /api/reminders/` — the server also pushes to every registered device when it fires. */
export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const payload = await request<unknown>('/api/reminders/', { method: 'POST', body: input });
  return parseOrThrow(reminderSchema, payload, 'reminder');
}

/** `DELETE /api/reminders/<reminderId>` */
export async function deleteReminder(reminderId: string): Promise<void> {
  await request<unknown>(`/api/reminders/${reminderId}`, { method: 'DELETE' });
}
