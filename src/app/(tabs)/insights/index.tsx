import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { PriorityChip } from '@/components/domain/priority-chip';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useProgress, useSuggestions } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { tapFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <View className={`h-2 w-2 rounded-full ${className}`} />
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const colors = useThemeColors();
  const progress = useProgress();
  const suggestions = useSuggestions();

  const data = progress.data;
  const totals = data?.totals;
  const completed = totals?.completedTasks ?? 0;
  const total = totals?.tasks ?? 0;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const loadBalance = data?.loadBalance ?? [];
  const weekMax = loadBalance.reduce(
    (max, entry) => Math.max(max, entry.completed + entry.pending),
    0,
  );
  const weekScale = weekMax > 0 ? weekMax : 1;
  const achievements = data?.achievements ?? [];
  const topSuggestions = (suggestions.data ?? []).slice(0, 2);

  function openSuggestions() {
    tapFeedback();
    router.push('/insights/suggestions');
  }

  const suggestionButton = (
    <Pressable
      onPress={openSuggestions}
      accessibilityRole="button"
      accessibilityLabel="Open suggestions"
      className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
    >
      <Ionicons name="sparkles" size={20} color={colors.brandInk} />
    </Pressable>
  );

  function progressBody() {
    if (progress.isPending) {
      return (
        <View className="mt-5" style={{ gap: 12 }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={3} />
        </View>
      );
    }

    if (progress.isError || !data) {
      return (
        <ErrorState
          className="mt-5"
          title="Could not load your progress"
          message={errorMessage(progress.error)}
          onRetry={() => void progress.refetch()}
        />
      );
    }

    return (
      <>
        <Card className="mt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-heading">Completion rate</Text>
            <Ionicons name="stats-chart" size={18} color={colors.brandInk} />
          </View>
          <Text className="mt-3 text-5xl font-bold text-brand-ink">{rate}%</Text>
          <Text className="mt-1 text-sm text-muted">
            {completed} of {total} tasks done
          </Text>
          <View className="mt-4 h-2 overflow-hidden rounded-full bg-surface-alt">
            <View className="h-full rounded-full bg-brand" style={{ width: `${rate}%` }} />
          </View>
        </Card>

        <View className="mt-4 flex-row" style={{ gap: 12 }}>
          <Card className="flex-1 rounded-2xl">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
              <Ionicons name="flame" size={18} color={colors.successInk} />
            </View>
            <Text className="mt-3 text-2xl font-bold text-heading">{data.streak.current}</Text>
            <Text className="text-sm text-muted">day streak</Text>
          </Card>

          <Card className="flex-1 rounded-2xl">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
              <Ionicons name="trophy-outline" size={18} color={colors.successInk} />
            </View>
            <Text className="mt-3 text-2xl font-bold text-heading">{data.streak.longest}</Text>
            <Text className="text-sm text-muted">best streak</Text>
          </Card>

          <Card className="flex-1 rounded-2xl">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
              <Ionicons name="calendar-outline" size={18} color={colors.brandInk} />
            </View>
            <Text className="mt-3 text-2xl font-bold text-heading">{data.activeDays}</Text>
            <Text className="text-sm text-muted">active days</Text>
          </Card>
        </View>

        <Card className="mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-heading">This week</Text>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <Legend className="bg-brand" label="done" />
              <Legend className="bg-surface-alt" label="open" />
            </View>
          </View>

          {loadBalance.length === 0 ? (
            <Text className="mt-3 text-sm text-muted">
              Finish a task and the week will fill in.
            </Text>
          ) : (
            <View className="mt-4 flex-row items-end justify-between" style={{ height: 110 }}>
              {loadBalance.map((entry) => {
                const done = Math.round((entry.completed / weekScale) * 72);
                const open = Math.round((entry.pending / weekScale) * 72);

                return (
                  <View key={entry.day} className="flex-1 items-center" style={{ gap: 6 }}>
                    <View className="w-3 items-center justify-end" style={{ height: 72, gap: 2 }}>
                      {open > 0 ? (
                        <View
                          className="w-3 rounded-full bg-surface-alt"
                          style={{ height: open }}
                        />
                      ) : null}
                      {done > 0 ? (
                        <View className="w-3 rounded-full bg-brand" style={{ height: done }} />
                      ) : null}
                    </View>
                    <Text className="text-xs text-muted">{entry.day.slice(0, 3)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Card className="mt-4">
          <Text className="text-sm font-semibold text-heading">Achievements</Text>

          {achievements.length === 0 ? (
            <Text className="mt-3 text-sm text-muted">
              Finish your first task to start earning badges.
            </Text>
          ) : (
            achievements.map((achievement) => {
              const ratio =
                achievement.target > 0 ? Math.min(1, achievement.progress / achievement.target) : 0;

              return (
                <View key={achievement.id} className="mt-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 pr-3 text-sm font-semibold text-heading">
                      {achievement.label}
                    </Text>
                    {achievement.earned ? (
                      <Ionicons name="checkmark-circle" size={18} color={colors.successInk} />
                    ) : (
                      <Text className="text-xs text-muted">
                        {achievement.progress} / {achievement.target}
                      </Text>
                    )}
                  </View>
                  {!achievement.earned ? (
                    <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-alt">
                      <View
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </Card>
      </>
    );
  }

  return (
    <Screen scroll={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={progress.isRefetching || suggestions.isRefetching}
            onRefresh={() => {
              void progress.refetch();
              void suggestions.refetch();
            }}
            tintColor={colors.brandInk}
            colors={[colors.brandInk]}
          />
        }
      >
        <ScreenHeader
          icon="stats-chart-outline"
          eyebrow="Insights"
          title="Your progress"
          right={suggestionButton}
        />

        {progressBody()}

        <SectionHeading
          action={
            <Pressable onPress={openSuggestions} accessibilityRole="button">
              <Text className="text-sm font-semibold text-brand-ink">See all</Text>
            </Pressable>
          }
        >
          <Text className="text-base font-bold text-heading">For you</Text>
        </SectionHeading>

        {suggestions.isPending ? (
          <SkeletonCard lines={2} />
        ) : topSuggestions.length === 0 ? (
          <Card>
            <Text className="text-sm text-muted">
              Suggestions appear once you have some tasks, moods or journal entries behind you.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: 8 }}>
            {topSuggestions.map((suggestion) => (
              <Card key={suggestion.id} onPress={openSuggestions} className="border-border">
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  <Ionicons name="sparkles" size={16} color={colors.brandInk} />
                  <Text numberOfLines={1} className="flex-1 text-sm font-semibold text-heading">
                    {suggestion.title}
                  </Text>
                  {suggestion.priority ? <PriorityChip priority={suggestion.priority} /> : null}
                </View>
                {suggestion.message ? (
                  <Text className="mt-2 text-sm leading-5 text-muted">{suggestion.message}</Text>
                ) : null}
              </Card>
            ))}
          </View>
        )}

        <SectionHeading>
          <Text className="text-base font-bold text-heading">Reflect</Text>
        </SectionHeading>

        <Card padded={false} className="overflow-hidden rounded-2xl">
          <Row
            title="Log today's mood"
            subtitle="A quick check-in shapes the day"
            icon="happy-outline"
            tone="primary"
            onPress={() => router.push('/insights/mood')}
          />
          <Row
            title="Mood trends"
            subtitle="How the last weeks have felt"
            icon="trending-up"
            tone="primary"
            onPress={() => router.push('/insights/mood-trends')}
          />
          <Row
            title="Mood history"
            subtitle="Every check-in, newest first"
            icon="time-outline"
            tone="primary"
            onPress={() => router.push('/insights/mood-history')}
          />
          <Row
            title="Journal"
            subtitle="Guided reflections and prompts"
            icon="book-outline"
            tone="primary"
            onPress={() => router.push('/insights/journal')}
          />
          <Row
            title="Summaries library"
            subtitle="Turn notes and PDFs into bullets"
            icon="library-outline"
            tone="primary"
            onPress={() => router.push('/insights/library')}
            last
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}
