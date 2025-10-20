import { request, unwrapList, type Paginated } from './client';
import { listSchema, notificationSchema, parseOrThrow, type NotificationItem } from './types';

export type NotificationFilters = {
  /** `true` = unread only, `false` = read only, `undefined` = everything. */
  unread?: boolean;
  page?: number;
  limit?: number;
};

const notificationListSchema = listSchema(notificationSchema);

/** `GET /api/notifications/` — newest first. */
export async function listNotifications(filters: NotificationFilters = {}): Promise<Paginated<NotificationItem>> {
  const payload = await request<unknown>('/api/notifications/', { query: { ...filters } });
  return unwrapList(parseOrThrow(notificationListSchema, payload, 'notifications'));
}

/** `PUT /api/notifications/<id>` — `read` is the only field the app changes. */
export async function markNotificationRead(notificationId: string, read = true): Promise<void> {
  await request<unknown>(`/api/notifications/${notificationId}`, { method: 'PUT', body: { read } });
}

/** `DELETE /api/notifications/<id>` */
export async function deleteNotification(notificationId: string): Promise<void> {
  await request<unknown>(`/api/notifications/${notificationId}`, { method: 'DELETE' });
}
