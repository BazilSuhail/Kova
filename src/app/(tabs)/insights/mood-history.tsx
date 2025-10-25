import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { MoodEntry } from '@/lib/api';
import { AppBar, IconButton } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import { useDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { Sheet } from '@/components/ui/sheet';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { useDeleteMoodEntry, useMoodEntries } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDateTime, parseDate } from '@/lib/format';
import { warnFeedback } from '@/lib/haptics';
import { chartColors, layout, spacing, useThemeColors } from '@/config/theme';

const EMOJI: Record<string, string> = {
  great: '😄',
  good: '🙂',
  okay: '😐',
  low: '😕',
  bad: '😞',
  awful: '😫',
};

function scoreColor(score: number): string {
  if (score >= 4) return chartColors[0];
  if (score === 3) return chartColors[2];
  return chartColors[4];
}

function MoodRow({
  entry,
  index,
  onMore,
}: {
  entry: MoodEntry;
  index: number;
  onMore: () => void;
}) {
  const when = formatDateTime(entry.loggedAt ?? entry.createdAt);

  return (
    <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 40)}>
      <Pressable
        onLongPress={onMore}
        accessibilityRole="button"
        accessibilityLabel={`${entry.mood || 'Mood'} entry${when ? `, ${when}` : ''}`}
        className="flex-row items-start border-b border-border py-3 active:bg-surface-alt"
        style={{ gap: spacing.md }}
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-alt">
          <Text style={{ fontSize: 22 }}>{EMOJI[entry.mood.toLowerCase()] ?? '🙂'}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center" style={{ gap: spacing.sm }}>
            <Text numberOfLines={1} className="text-[15px] font-medium capitalize text-heading">
              {entry.mood || 'Logged mood'}
            </Text>
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: scoreColor(entry.score) }} />
            <Text className="text-xs text-muted">{entry.score}/5</Text>
          </View>
          {when ? <Text className="mt-0.5 text-xs text-muted">{when}</Text> : null}
          {entry.note ? (
            <Text numberOfLines={2} className="mt-1 text-sm leading-5 text-body">
              {entry.note}
            </Text>
          ) : null}
          {entry.tags.length > 0 ? (
            <Text numberOfLines={1} className="mt-1 text-xs text-muted">
              {entry.tags.map((tag) => `#${tag}`).join('  ')}
            </Text>
          ) : null}
        </View>
        <IconButton icon="ellipsis-vertical" size={18} accessibilityLabel="More" onPress={onMore} />
      </Pressable>
    </Animated.View>
  );
}

export default function MoodHistoryScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const { confirm } = useDialog();
  const query = useMoodEntries();
  const remove = useDeleteMoodEntry();
  const [selected, setSelected] = useState<MoodEntry | null>(null);

  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  // Last 14 check-ins, oldest on the left.
  const bars = entries
    .slice(0, 14)
    .reverse()
    .map((entry) => ({
      value: entry.score,
      frontColor: scoreColor(entry.score),
      label:
        parseDate(entry.loggedAt ?? entry.createdAt ?? entry.date)?.toLocaleDateString(undefined, {
          day: 'numeric',
        }) ?? '',
    }));
  const chartWidth = width - layout.gutter * 2 - spacing.lg * 2;

  async function deleteEntry(entry: MoodEntry) {
    const ok = await confirm({
      title: 'Delete entry',
      message: 'This mood entry will be removed.',
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    warnFeedback();
    remove.mutate(entry.moodId);
  }

  function emptyState() {
    if (query.isPending) {
      return (
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </View>
      );
    }

    if (query.isError) {
      return (
        <ErrorState
          title="Could not load your mood"
          message={errorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      );
    }

    return (
      <EmptyState
        icon="happy-outline"
        title="Nothing logged yet"
        description="A quick check-in shows up here, newest first."
        actionLabel="Log today's mood"
        onAction={() => router.push('/insights/mood')}
      />
    );
  }

  const header =
    bars.length > 1 ? (
      <Animated.View entering={FadeInDown.duration(220)} className="mb-4">
        <Card>
          <Text className="text-sm font-semibold text-heading">Recent check-ins</Text>
          <Text className="mt-0.5 text-xs text-muted">Score per check-in, 1 to 5</Text>
          <View className="mt-3">
            <BarChart
              data={bars}
              adjustToWidth
              parentWidth={chartWidth}
              width={chartWidth - 28}
              height={110}
              maxValue={5}
              noOfSections={5}
              barBorderRadius={4}
              yAxisLabelWidth={20}
              yAxisThickness={0}
              xAxisColor={colors.border}
              rulesColor={colors.border}
              yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10 }}
              isAnimated
              disablePress
              disableScroll
            />
          </View>
        </Card>
      </Animated.View>
    ) : null;

  return (
    <Screen scroll={false}>
      <AppBar
        title="Mood history"
        left={<BackButton fallback="/insights" />}
        actions={[
          {
            icon: 'trending-up',
            accessibilityLabel: 'Mood trends',
            onPress: () => router.push('/insights/mood-trends'),
          },
          { icon: 'add', accessibilityLabel: 'Log mood', onPress: () => router.push('/insights/mood') },
        ]}
      />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.moodId}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => void query.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        ListHeaderComponent={header ?? undefined}
        renderItem={({ item, index }) => (
          <MoodRow entry={item} index={index} onMore={() => setSelected(item)} />
        )}
        ListEmptyComponent={emptyState ?? undefined}
        ListFooterComponent={
          query.isFetchingNextPage ? <Skeleton height={12} style={{ marginTop: 16 }} /> : undefined
        }
      />

      <Sheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.mood || 'Mood'} check-in` : undefined}
        subtitle={selected ? (formatDateTime(selected.loggedAt ?? selected.createdAt) ?? undefined) : undefined}
        actions={[
          {
            icon: 'trash-outline',
            label: 'Delete entry',
            destructive: true,
            disabled: remove.isPending,
            onPress: () => {
              if (selected) void deleteEntry(selected);
            },
          },
        ]}
      />
    </Screen>
  );
}
