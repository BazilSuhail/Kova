import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import type { Paginated } from '@/api/client';
import {
  deleteNotification,
  listNotifications,
  markNotificationRead,
  type NotificationFilters,
} from '@/api/notifications';
import type { NotificationItem } from '@/api/types';
import { queryKeys } from './keys';

const PAGE_SIZE = 20;

type NotificationListData = InfiniteData<Paginated<NotificationItem>>;

/** Only the filters a screen controls; paging is the hook's business. */
export type NotificationQuery = Omit<NotificationFilters, 'page' | 'limit'>;

export function useNotifications(filters: NotificationQuery) {
  return useInfiniteQuery({
    queryKey: queryKeys.notificationList(filters),
    queryFn: ({ pageParam }) => listNotifications({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 1) + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

/** Reading or removing one entry also moves the unread badge on the home screen. */
function useNotificationRefresher() {
  const client = useQueryClient();

  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.notifications });
    void client.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

export function useMarkNotificationRead() {
  const client = useQueryClient();
  const refresh = useNotificationRefresher();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),

    onMutate: async (notificationId) => {
      await client.cancelQueries({ queryKey: queryKeys.notifications });
      const lists = client.getQueriesData<NotificationListData>({
        queryKey: queryKeys.notificationLists,
      });

      client.setQueriesData<NotificationListData>({ queryKey: queryKeys.notificationLists }, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.notificationId === notificationId ? { ...item, read: true } : item,
                ),
              })),
            }
          : data,
      );

      return { lists };
    },

    onError: (_error, _notificationId, context) => {
      context?.lists.forEach(([key, data]) => client.setQueryData(key, data));
    },

    onSettled: refresh,
  });
}

export function useDeleteNotification() {
  const client = useQueryClient();
  const refresh = useNotificationRefresher();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),

    onMutate: async (notificationId) => {
      await client.cancelQueries({ queryKey: queryKeys.notifications });
      const lists = client.getQueriesData<NotificationListData>({
        queryKey: queryKeys.notificationLists,
      });

      client.setQueriesData<NotificationListData>({ queryKey: queryKeys.notificationLists }, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.filter((item) => item.notificationId !== notificationId),
                total: Math.max(0, page.total - 1),
              })),
            }
          : data,
      );

      return { lists };
    },

    onError: (_error, _notificationId, context) => {
      context?.lists.forEach(([key, data]) => client.setQueryData(key, data));
    },

    onSettled: refresh,
  });
}
