import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PriorityChip } from '@/components/domain/priority-chip';
import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { FloatingShapes } from '@/components/ui/floating-shapes';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { StatTile } from '@/components/ui/stat-tile';
import { useMoodTrends, useProgress, useSuggestions } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { parseDate } from '@/lib/format';
import { chartColors, layout, spacing, useThemeColors } from '@/config/theme';

const QUICK_MOODS = ['😄', '🙂', '😐', '😕', '😞'];

function Enter({ index, children }: { index: number; children: ReactNode }) {
  return <Animated.View entering={FadeInDown.duration(220).delay(index * 40)}>{children}</Animated.View>;
}

function Heading({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <SectionHeading
      action={
        onSeeAll ? (
          <Button variant="ghost" size="sm" label="See all" onPress={onSeeAll} />
        ) : undefined
      }
    >
      <Text className="text-base font-semibold text-heading">{title}</Text>
    </SectionHeading>
  );
}

export default function InsightsScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const progress = useProgress();
  const suggestions = useSuggestions();
  const trends = useMoodTrends(7);

  const data = progress.data;
  const completed = data?.totals.completedTasks ?? 0;
  const total = data?.totals.tasks ?? 0;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const loadBalance = data?.loadBalance ?? [];
  const achievements = data?.achievements ?? [];
  const topSuggestions = (suggestions.data ?? []).slice(0, 2);

  // Card content width: screen minus gutters and card padding.
  const chartWidth = width - layout.gutter * 2 - spacing.lg * 2;
  const moodPoints = (trends.data?.series ?? [])
    .filter((point) => point.score !== null)
    .map((point) => ({
      value: point.score ?? 0,
      label: parseDate(point.date)?.toLocaleDateString(undefined, { weekday: 'narrow' }) ?? '',
    }));

  const go = (path: Href) => () => router.push(path);

  function moodTrendBody() {
    if (trends.isPending) return <SkeletonCard lines={3} />;
    if (trends.isError) {
      return (
        <ErrorState
          title="Could not load your mood"
          message={errorMessage(trends.error)}
          onRetry={() => void trends.refetch()}
        />
      );
    }
    return (
      <Card onPress={go('/insights/mood-trends')}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-muted">Average this week</Text>
            <Text className="mt-0.5 text-2xl font-bold tracking-tight text-heading">
              {trends.data.entries > 0 ? trends.data.averageScore.toFixed(1) : '–'}
              <Text className="text-sm font-normal text-muted"> / 5</Text>
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>
        {moodPoints.length > 1 ? (
          <View className="mt-3">
            <LineChart
              data={moodPoints}
              areaChart
              curved
              isAnimated
              adjustToWidth
              parentWidth={chartWidth}
              width={chartWidth - 24}
              height={90}
              maxValue={5}
              noOfSections={5}
              color={chartColors[0]}
              thickness={2}
              startFillColor={chartColors[0]}
              endFillColor={chartColors[0]}
              startOpacity={0.25}
              endOpacity={0.02}
              dataPointsColor={chartColors[0]}
              dataPointsRadius={3}
              initialSpacing={8}
              endSpacing={8}
              yAxisLabelWidth={20}
              yAxisThickness={0}
              xAxisColor={colors.border}
              rulesColor={colors.border}
              rulesType="solid"
              yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10 }}
              disableScroll
            />
          </View>
        ) : (
          <Text className="mt-3 text-sm text-muted">
            Check in on two days and your week shows up here.
          </Text>
        )}
      </Card>
    );
  }

  function progressBody() {
    if (progress.isPending) {
      return (
        <View style={{ gap: spacing.md }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={3} />
        </View>
      );
    }

    if (progress.isError || !data) {
      return (
        <ErrorState
          title="Could not load your progress"
          message={errorMessage(progress.error)}
          onRetry={() => void progress.refetch()}
        />
      );
    }

    return (
      <View style={{ gap: spacing.md }}>
        <View className="flex-row" style={{ gap: spacing.md }}>
          <StatTile icon="checkmark-done" value={`${rate}%`} label={`${completed} of ${total} done`} />
          <StatTile icon="flame-outline" value={data.streak.current} label="Day streak" />
        </View>
        <View className="flex-row" style={{ gap: spacing.md }}>
          <StatTile icon="trophy-outline" value={data.streak.longest} label="Best streak" />
          <StatTile icon="calendar-outline" value={data.activeDays} label="Active days" />
        </View>

        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-heading">This week</Text>
            <View className="flex-row items-center" style={{ gap: spacing.md }}>
              {[
                { color: chartColors[0], label: 'Done' },
                { color: chartColors[1], label: 'Open' },
              ].map((item) => (
                <View key={item.label} className="flex-row items-center" style={{ gap: 4 }}>
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <Text className="text-xs text-muted">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {loadBalance.length === 0 ? (
            <Text className="mt-3 text-sm text-muted">Finish a task and the week will fill in.</Text>
          ) : (
            <View className="mt-3">
              <BarChart
                stackData={loadBalance.map((entry) => ({
                  label: entry.day.slice(0, 3),
                  stacks: [
                    { value: entry.completed, color: chartColors[0] },
                    { value: entry.pending, color: chartColors[1], marginBottom: 2 },
                  ],
                }))}
                adjustToWidth
                parentWidth={chartWidth}
                width={chartWidth - 24}
                height={100}
                barWidth={14}
                barBorderRadius={4}
                noOfSections={3}
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
          )}
        </Card>

        {achievements.length > 0 ? (
          <Card padded={false} className="overflow-hidden">
            {achievements.map((achievement, index) => {
              const ratio =
                achievement.target > 0 ? Math.min(1, achievement.progress / achievement.target) : 0;
              return (
                <Row
                  key={achievement.id}
                  icon={achievement.earned ? 'trophy' : 'trophy-outline'}
                  tone={achievement.earned ? 'primary' : 'neutral'}
                  title={achievement.label}
                  subtitle={
                    achievement.earned
                      ? 'Earned'
                      : `${achievement.progress} of ${achievement.target} · ${Math.round(ratio * 100)}%`
                  }
                  right={
                    achievement.earned ? (
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    ) : undefined
                  }
                  last={index === achievements.length - 1}
                />
              );
            })}
          </Card>
        ) : null}
      </View>
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar
        title="Insights"
        actions={[
          {
            icon: 'sparkles-outline',
            accessibilityLabel: 'Suggestions',
            onPress: go('/insights/suggestions'),
          },
          { icon: 'add', accessibilityLabel: 'Log mood', onPress: go('/insights/mood') },
        ]}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={progress.isRefetching || suggestions.isRefetching || trends.isRefetching}
            onRefresh={() => {
              void progress.refetch();
              void suggestions.refetch();
              void trends.refetch();
            }}
            tintColor={colors.brandInk}
            colors={[colors.brandInk]}
          />
        }
      >
        <Enter index={0}>
          <PressableScale
            haptic
            onPress={go('/insights/mood')}
            accessibilityRole="button"
            accessibilityLabel="Check in on your mood"
            className="relative overflow-hidden rounded-lg border border-border bg-surface p-4"
          >
            <FloatingShapes />
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              Check-in
            </Text>
            <Text className="mt-1 text-lg font-semibold text-heading">How are you feeling?</Text>
            <View className="mt-3 flex-row justify-between">
              {QUICK_MOODS.map((emoji) => (
                <View
                  key={emoji}
                  className="h-12 w-12 items-center justify-center rounded-full bg-surface-alt"
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </View>
              ))}
            </View>
          </PressableScale>
        </Enter>

        <Enter index={1}>
          <Heading title="Mood this week" onSeeAll={go('/insights/mood-trends')} />
          {moodTrendBody()}
        </Enter>

        <Enter index={2}>
          <Heading title="For you" onSeeAll={go('/insights/suggestions')} />
          {suggestions.isPending ? (
            <SkeletonCard lines={2} />
          ) : suggestions.isError ? (
            <ErrorState
              title="Could not load suggestions"
              message={errorMessage(suggestions.error)}
              onRetry={() => void suggestions.refetch()}
            />
          ) : topSuggestions.length === 0 ? (
            <Card>
              <Text className="text-sm text-muted">
                Suggestions appear once you have some tasks, moods or journal entries behind you.
              </Text>
            </Card>
          ) : (
            <Card padded={false} className="overflow-hidden">
              {topSuggestions.map((suggestion, index) => (
                <Row
                  key={suggestion.id}
                  icon="sparkles-outline"
                  tone="primary"
                  title={suggestion.title}
                  subtitle={suggestion.message}
                  right={
                    suggestion.priority ? <PriorityChip priority={suggestion.priority} /> : undefined
                  }
                  onPress={go('/insights/suggestions')}
                  last={index === topSuggestions.length - 1}
                />
              ))}
            </Card>
          )}
        </Enter>

        <Enter index={3}>
          <Heading title="Reflect" />
          <Card padded={false} className="overflow-hidden">
            <Row
              title="Journal"
              subtitle="Today's prompt and past reflections"
              icon="book-outline"
              tone="primary"
              onPress={go('/insights/journal')}
            />
            <Row
              title="Library"
              subtitle="Notes and PDFs turned into bullets"
              icon="library-outline"
              tone="primary"
              onPress={go('/insights/library')}
            />
            <Row
              title="Mood trends"
              subtitle="How the last weeks have felt"
              icon="trending-up"
              tone="primary"
              onPress={go('/insights/mood-trends')}
            />
            <Row
              title="Mood history"
              subtitle="Every check-in, newest first"
              icon="time-outline"
              tone="primary"
              onPress={go('/insights/mood-history')}
              last
            />
          </Card>
        </Enter>

        <Enter index={4}>
          <Heading title="Progress" />
          {progressBody()}
        </Enter>
      </ScrollView>
    </Screen>
  );
}
