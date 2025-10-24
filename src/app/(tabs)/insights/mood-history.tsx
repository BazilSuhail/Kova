import { useMemo } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import type { MoodEntry } from '@/lib/api';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { useDeleteMoodEntry, useMoodEntries } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { warnFeedback } from '@/lib/haptics';

function scoreSurface(score: number): string {
  if (score >= 4) return 'bg-surface-alt';
  if (score === 3) return 'bg-surface-alt';
  return 'bg-surface-alt';
}

function scoreText(score: number): string {
  if (score >= 4) return 'text-brand-ink';
  if (score === 3) return 'text-brand-ink';
  return 'text-danger-ink';
}

function MoodRow({ entry, onLongPress }: { entry: MoodEntry; onLongPress: () => void }) {
  const when = formatDateTime(entry.loggedAt ?? entry.createdAt);

  return (
    <Pressable
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${entry.mood || 'Mood'} entry${when ? `, ${when}` : ''}. Hold to delete.`}
      className="rounded-2xl border border-border bg-surface px-4 py-3 active:opacity-70"
    >
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View
          className={`h-9 w-9 items-center justify-center rounded-xl ${scoreSurface(entry.score)}`}
        >
          <Text className={`text-sm font-bold ${scoreText(entry.score)}`}>{entry.score}</Text>
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm font-semibold capitalize text-heading">
            {entry.mood || 'Logged mood'}
          </Text>
          {when ? <Text className="mt-0.5 text-xs text-muted">{when}</Text> : null}
        </View>
      </View>

      {entry.note ? (
        <Text numberOfLines={2} className="mt-2 text-sm leading-5 text-muted">
          {entry.note}
        </Text>
      ) : null}

      {entry.tags.length > 0 ? (
        <View className="mt-2 flex-row flex-wrap" style={{ gap: 6 }}>
          {entry.tags.map((tag) => (
            <View key={tag} className="rounded-full bg-surface-alt px-2.5 py-1">
              <Text className="text-xs font-medium text-muted">{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

export default function MoodHistoryScreen() {
  const query = useMoodEntries();
  const remove = useDeleteMoodEntry();

  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  function confirmDelete(entry: MoodEntry) {
    if (Platform.OS === 'web') {
      warnFeedback();
      remove.mutate(entry.moodId);
      return;
    }
    Alert.alert('Delete entry', 'This mood entry will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          warnFeedback();
          remove.mutate(entry.moodId);
        },
      },
    ]);
  }

  function emptyState() {
    if (query.isPending) {
      return (
        <View style={{ gap: 12, marginTop: 12 }}>
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

  return (
    <Screen
      scroll={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}
    >
      <ScreenHeader
        icon="time-outline"
        eyebrow="Mood"
        title="Mood history"
        subtitle="Every check-in, newest first. Hold a row to remove it."
        back
        backFallback="/insights"
      />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.moodId}
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => void query.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        renderItem={({ item }) => <MoodRow entry={item} onLongPress={() => confirmDelete(item)} />}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          query.isFetchingNextPage ? <Skeleton height={12} style={{ marginTop: 16 }} /> : null
        }
      />
    </Screen>
  );
}
