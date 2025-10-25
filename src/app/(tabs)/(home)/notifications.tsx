import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import type { NotificationItem } from '@/lib/api';
import { AppBar, IconButton } from '@/components/ui/app-bar';
import { Chip } from '@/components/ui/chip';
import { useDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useDeleteNotification, useMarkNotificationRead, useNotifications } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDateTime, relativeTime } from '@/lib/format';
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type Filter = 'all' | 'unread';

const FILTERS: { key: Filter; label: string; icon: IconName }[] = [
  { key: 'all', label: 'All', icon: 'notifications-outline' },
  { key: 'unread', label: 'Unread', icon: 'mail-unread-outline' },
];

function iconFor(type: string | undefined): IconName {
  const kind = (type ?? '').toLowerCase();
  if (kind.includes('remind')) return 'alarm-outline';
  if (kind.includes('task')) return 'checkbox-outline';
  if (kind.includes('summar')) return 'document-text-outline';
  if (kind.includes('mood')) return 'happy-outline';
  if (kind.includes('recap') || kind.includes('digest')) return 'bar-chart-outline';
  return 'notifications-outline';
}

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { confirm } = useDialog();

  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const query = useNotifications({ unread: filter === 'unread' ? true : undefined });
  const markRead = useMarkNotificationRead();
  const remove = useDeleteNotification();

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

  function openSheet(item: NotificationItem) {
    setSelected(item);
    setSheetOpen(true);
  }

  async function confirmDelete(item: NotificationItem) {
    const ok = await confirm({
      title: 'Delete notification',
      message: `"${item.title}" will be removed.`,
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok) remove.mutate(item.notificationId);
  }

  function emptyState() {
    if (query.isPending) {
      return (
        <View style={{ gap: spacing.md, paddingHorizontal: layout.gutter }}>
          <SkeletonCard lines={1} />
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
        icon={filter === 'unread' ? 'checkmark-done-outline' : 'notifications-outline'}
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
    <Screen scroll={false}>
      <AppBar
        title="Notifications"
        left={<IconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} />}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: layout.gutter, paddingBottom: spacing.md }}
      >
        {FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            icon={item.icon}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={items}
        keyExtractor={(item) => item.notificationId}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => void query.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        renderItem={({ item, index }) => {
          const unread = !item.read;
          const when = relativeTime(item.createdAt);
          const fires = formatDateTime(item.triggerTime ?? undefined);

          return (
            <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 10) * 40)}>
              <Pressable
                onPress={() => {
                  if (unread) markRead.mutate(item.notificationId);
                }}
                onLongPress={() => openSheet(item)}
                accessibilityRole="button"
                accessibilityLabel={unread ? `${item.title}, unread` : item.title}
                accessibilityHint="Marks as read. Long press for more options."
                className="flex-row items-start py-3 pl-4 pr-1 active:bg-surface-alt"
                style={{ gap: spacing.md }}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
                  <Icon name={iconFor(item.type)} size={20} tone="brand" />
                </View>

                <View className="flex-1">
                  <Text
                    numberOfLines={2}
                    className={`text-[15px] text-heading ${unread ? 'font-semibold' : 'font-normal'}`}
                  >
                    {item.title}
                  </Text>
                  {item.message ? (
                    <Text numberOfLines={3} className="mt-0.5 text-sm leading-5 text-body">
                      {item.message}
                    </Text>
                  ) : null}
                  <View className="mt-1 flex-row items-center" style={{ gap: spacing.sm }}>
                    {when ? <Text className="text-xs text-muted">{when}</Text> : null}
                    {fires ? (
                      <View className="flex-row items-center" style={{ gap: spacing.xs }}>
                        <Icon name="alarm-outline" size={12} color={colors.muted} />
                        <Text className="text-xs text-muted">{fires}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View className="items-center" style={{ gap: spacing.xs }}>
                  <IconButton
                    icon="ellipsis-vertical"
                    size={18}
                    color={colors.muted}
                    accessibilityLabel={`More options for ${item.title}`}
                    onPress={() => openSheet(item)}
                  />
                  {unread ? <View className="h-2 w-2 rounded-full bg-brand" /> : null}
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.brandInk} />
          ) : undefined
        }
      />

      <Sheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selected?.title}
        icon={iconFor(selected?.type)}
        actions={
          selected
            ? [
                {
                  icon: 'checkmark-done-outline',
                  label: 'Mark as read',
                  disabled: Boolean(selected.read),
                  onPress: () => markRead.mutate(selected.notificationId),
                },
                {
                  icon: 'trash-outline',
                  label: 'Delete',
                  destructive: true,
                  onPress: () => void confirmDelete(selected),
                },
              ]
            : []
        }
      />
    </Screen>
  );
}
