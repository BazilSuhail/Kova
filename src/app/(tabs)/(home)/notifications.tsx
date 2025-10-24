import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { NotificationItem } from '@/lib/api';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useDeleteNotification, useMarkNotificationRead, useNotifications } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDateTime, relativeTime } from '@/lib/format';
import { useThemeColors } from '@/config/theme';

type Filter = 'all' | 'unread';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>('all');
  const query = useNotifications({ unread: filter === 'unread' ? true : undefined });
  const markRead = useMarkNotificationRead();
  const remove = useDeleteNotification();

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

  function open(item: NotificationItem) {
    if (!item.read) markRead.mutate(item.notificationId);
  }

  function removeItem(item: NotificationItem) {
    remove.mutate(item.notificationId);
  }

  function emptyState() {
    if (query.isPending) {
      return (
        <View style={{ gap: 12, marginTop: 12 }}>
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </View>
      );
    }

    if (query.isError) {
      return (
        <ErrorState
          title="Could not load notifications"
          message={errorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      );
    }

    return (
      <EmptyState
        icon={filter === 'unread' ? 'notifications-off-outline' : 'notifications-outline'}
        title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
        description={
          filter === 'unread'
            ? 'You are all caught up.'
            : 'Reminders and updates from Kova will appear here.'
        }
      />
    );
  }

  return (
    <Screen
      scroll={false}
      edges={['top', 'bottom']}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}
    >
      <ScreenHeader
        icon="notifications-outline"
        eyebrow="Inbox"
        title="Notifications"
        subtitle="Reminders, recaps and nudges in one place."
        right={
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
          >
            <Ionicons name="close" size={20} color={colors.heading} />
          </Pressable>
        }
      />

      <View className="mt-4 flex-row" style={{ gap: 8 }}>
        {FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.notificationId}
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => void query.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        renderItem={({ item }) => {
          const unread = !item.read;
          const when = relativeTime(item.createdAt);
          const fires = formatDateTime(item.triggerTime ?? undefined);

          return (
            <Pressable
              onPress={() => open(item)}
              onLongPress={() => removeItem(item)}
              accessibilityRole="button"
              accessibilityLabel={unread ? `${item.title}, unread` : item.title}
              className={`rounded-2xl border bg-surface px-4 py-3 active:opacity-70 ${
                unread ? 'border-border' : 'border-border'
              }`}
            >
              <View className="flex-row items-center" style={{ gap: 8 }}>
                {unread ? <View className="h-2 w-2 rounded-full bg-brand" /> : null}
                <Text numberOfLines={1} className="flex-1 text-sm font-semibold text-heading">
                  {item.title}
                </Text>
                {when ? <Text className="text-xs text-muted">{when}</Text> : null}
              </View>

              <Text className="mt-1.5 text-sm leading-5 text-muted">{item.message}</Text>

              {fires ? (
                <View className="mt-2 flex-row items-center" style={{ gap: 4 }}>
                  <Ionicons name="alarm-outline" size={11} color={colors.muted} />
                  <Text className="text-xs text-muted">{fires}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginTop: 16 }} color={colors.brandInk} />
          ) : null
        }
      />

      <Text className="mt-2 text-center text-xs text-muted">
        {Platform.OS === 'web' ? 'Hold an item to remove it.' : 'Tap to mark read, hold to remove.'}
      </Text>
    </Screen>
  );
}
