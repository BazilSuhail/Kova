import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppBar, IconButton } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { StatTile, type StatTrend } from '@/components/ui/stat-tile';
import { usePlanners, useWeeklyRecap } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { addDays, formatDueDate, shortDate, todayIsoDate } from '@/lib/format';
import { selectFeedback } from '@/lib/haptics';
import { chartColors, layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

const Y_AXIS_WIDTH = 28;
const COMPLETED_COLOR = chartColors[0];
const PENDING_COLOR = chartColors[2];

function weekdayShort(iso: string | undefined): string {
  if (!iso) return '';
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: 'short' });
}

function compare(current: number, previous: number | undefined, higherIsBetter: boolean) {
  if (previous === undefined) return { delta: undefined, trend: 'flat' as StatTrend };
  const diff = current - previous;
  if (diff === 0) return { delta: 'Same as last week', trend: 'flat' as StatTrend };
  const better = higherIsBetter ? diff > 0 : diff < 0;
  return {
    delta: `${diff > 0 ? '+' : ''}${diff} vs last week`,
    trend: (better ? 'up' : 'down') as StatTrend,
  };
}

function Heading({ icon, title }: { icon: IconName; title: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center" style={{ gap: spacing.sm }}>
      <Ionicons name={icon} size={18} color={colors.heading} />
      <Text className="text-base font-semibold text-heading">{title}</Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 6 }}>
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

export default function WeeklyRecapScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const [end, setEnd] = useState<string | undefined>(undefined);

  const weekEnd = end ?? todayIsoDate();
  const recap = useWeeklyRecap(end);
  const previous = useWeeklyRecap(addDays(weekEnd, -7));
  const planners = usePlanners();

  const reflections = useMemo(() => {
    const map = new Map<string, string>();
    for (const planner of planners.data ?? []) {
      if (planner.reflection) map.set(planner.date.slice(0, 10), planner.reflection);
    }
    return map;
  }, [planners.data]);

  const days = recap.data?.days ?? [];
  const totals = recap.data?.totals;
  const rangeLabel = recap.data
    ? `${shortDate(recap.data.startDate)} – ${shortDate(recap.data.endDate)}`
    : 'Loading…';

  const completed = compare(
    totals?.completedTasks ?? 0,
    previous.data?.totals.completedTasks,
    true,
  );
  const pending = compare(totals?.pendingTasks ?? 0, previous.data?.totals.pendingTasks, false);

  const peak = Math.max(
    0,
    ...days.map((day) => day.completedTasks.length + day.pendingTasks.length),
  );
  const maxValue = Math.max(4, Math.ceil(peak / 4) * 4);
  const plotWidth = width - layout.gutter * 2 - Y_AXIS_WIDTH;
  const slot = plotWidth / Math.max(days.length, 1);
  const barWidth = Math.max(10, Math.floor(slot * 0.5));
  const hasActivity = peak > 0;

  function step(direction: -1 | 1) {
    selectFeedback();
    setEnd(addDays(weekEnd, direction * 7));
  }

  return (
    <Screen scroll={false}>
      <AppBar
        left={<BackButton fallback="/plan" />}
        brand={false}
        title="Weekly recap"
        actions={
          end
            ? [
                {
                  icon: 'today-outline',
                  accessibilityLabel: 'Back to this week',
                  onPress: () => {
                    selectFeedback();
                    setEnd(undefined);
                  },
                },
              ]
            : []
        }
      />

      <View
        className="flex-row items-center border-b border-border"
        style={{ paddingHorizontal: spacing.sm }}
      >
        <IconButton icon="chevron-back" accessibilityLabel="Previous week" onPress={() => step(-1)} />
        <Text className="flex-1 text-center text-base font-semibold text-heading">
          {rangeLabel}
        </Text>
        <IconButton
          icon="chevron-forward"
          accessibilityLabel="Next week"
          onPress={() => step(1)}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {recap.isPending ? (
          <View className="mt-4" style={{ gap: spacing.md }}>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={1} />
          </View>
        ) : recap.isError ? (
          <ErrorState
            title="Could not load the weekly recap"
            message={errorMessage(recap.error)}
            onRetry={() => void recap.refetch()}
          />
        ) : days.length === 0 ? (
          <EmptyState
            icon="stats-chart-outline"
            title="No recap for this week"
            description="Finish a task and the week fills in."
            actionLabel="Back to this week"
            onAction={() => setEnd(undefined)}
          />
        ) : (
          <>
            <View className="mt-4 flex-row" style={{ gap: spacing.md }}>
              <StatTile
                icon="checkmark-done"
                value={totals?.completedTasks ?? 0}
                label="Completed"
                delta={completed.delta}
                trend={completed.trend}
              />
              <StatTile
                icon="hourglass-outline"
                value={totals?.pendingTasks ?? 0}
                label="Still open"
                delta={pending.delta}
                trend={pending.trend}
              />
            </View>

            <SectionHeading>
              <Heading icon="bar-chart-outline" title="Tasks per day" />
            </SectionHeading>

            {hasActivity ? (
              <View>
                <Text className="mb-2 text-xs text-muted">Tasks</Text>
                <BarChart
                  stackData={days.map((day) => ({
                    label: weekdayShort(day.date),
                    stacks: [
                      { value: day.completedTasks.length, color: COMPLETED_COLOR },
                      { value: day.pendingTasks.length, color: PENDING_COLOR, marginBottom: 2 },
                    ],
                  }))}
                  width={plotWidth}
                  height={160}
                  barWidth={barWidth}
                  spacing={slot - barWidth}
                  initialSpacing={(slot - barWidth) / 2}
                  endSpacing={0}
                  stackBorderRadius={4}
                  maxValue={maxValue}
                  noOfSections={4}
                  hideRules
                  yAxisLabelWidth={Y_AXIS_WIDTH}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.muted, fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: colors.muted, fontSize: 11 }}
                  isAnimated
                  animationDuration={500}
                  disableScroll
                />
                <View className="mt-3 flex-row" style={{ gap: spacing.lg }}>
                  <Legend color={COMPLETED_COLOR} label="Completed" />
                  <Legend color={PENDING_COLOR} label="Still open" />
                </View>
              </View>
            ) : (
              <Text className="text-sm text-muted">No tasks were due or done this week.</Text>
            )}

            <SectionHeading>
              <Heading icon="calendar-outline" title="Day by day" />
            </SectionHeading>

            {days.map((day, index) => {
              const done = day.completedTasks.length;
              const open = day.pendingTasks.length;
              const mood = day.mood && day.mood !== 'Not recorded' ? day.mood : null;
              const reflection = day.date ? reflections.get(day.date.slice(0, 10)) : undefined;

              return (
                <Animated.View
                  key={`${day.date ?? index}`}
                  entering={FadeInDown.duration(220).delay(index * 40)}
                >
                  <View
                    className="border-b border-border py-3"
                    style={{ gap: spacing.xs }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[15px] font-medium text-heading">
                        {day.date ? formatDueDate(day.date) : 'Day'}
                      </Text>
                      <View className="flex-row items-center" style={{ gap: spacing.md }}>
                        <View className="flex-row items-center" style={{ gap: 4 }}>
                          <Ionicons name="checkmark-done" size={13} color={colors.muted} />
                          <Text className="text-xs text-muted">{done} done</Text>
                        </View>
                        <View className="flex-row items-center" style={{ gap: 4 }}>
                          <Ionicons name="hourglass-outline" size={13} color={colors.muted} />
                          <Text className="text-xs text-muted">{open} open</Text>
                        </View>
                      </View>
                    </View>

                    {mood ? (
                      <View className="flex-row items-center" style={{ gap: 6 }}>
                        <Ionicons name="happy-outline" size={14} color={colors.muted} />
                        <Text className="text-xs text-muted">{mood}</Text>
                      </View>
                    ) : null}
                    {reflection ? (
                      <Text className="text-sm italic leading-6 text-body">{reflection}</Text>
                    ) : null}
                    {done === 0 && open === 0 && !mood && !reflection ? (
                      <Text className="text-sm text-muted">Quiet day</Text>
                    ) : null}
                  </View>
                </Animated.View>
              );
            })}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
