import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { BackButton } from '@/components/ui/back-button';
import { usePlanners, useWeeklyRecap } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { addDays, formatDueDate, shortDate, todayIsoDate } from '@/lib/format';
import { selectFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';

function weekdayNarrow(iso: string | undefined): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: 'narrow' });
}

export default function WeeklyRecapScreen() {
  const colors = useThemeColors();
  const [end, setEnd] = useState<string | undefined>(undefined);

  const recap = useWeeklyRecap(end);
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
  const maxCompleted = Math.max(1, ...days.map((day) => day.completedTasks.length));
  const rangeLabel = recap.data
    ? `${shortDate(recap.data.startDate)} â€“ ${shortDate(recap.data.endDate)}`
    : 'Loadingâ€¦';

  function step(direction: -1 | 1) {
    selectFeedback();
    setEnd(addDays(end ?? todayIsoDate(), direction * 7));
  }

  function reset() {
    selectFeedback();
    setEnd(undefined);
  }

  const back = <BackButton fallback="/" />;

  return (
    <Screen contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-4 flex-row items-center justify-between">
        {back}
        {end ? <Chip label="This week" icon="today-outline" onPress={reset} /> : null}
      </View>

      <ScreenHeader
        icon="bar-chart-outline"
        eyebrow="Plan"
        title="This week"
        subtitle={rangeLabel}
      />

      <View className="mt-3 flex-row items-center justify-end" style={{ gap: 8 }}>
        <Pressable
          onPress={() => step(-1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Previous week"
          className="h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
        >
          <Ionicons name="chevron-back" size={18} color={colors.heading} />
        </Pressable>
        <Pressable
          onPress={() => step(1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Next week"
          className="h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
        >
          <Ionicons name="chevron-forward" size={18} color={colors.heading} />
        </Pressable>
      </View>

      {recap.isPending ? (
        <View className="mt-5" style={{ gap: 12 }}>
          <SkeletonCard lines={3} />
          <SkeletonCard lines={1} />
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
          icon="stats-chart"
          title="No recap for this week"
          description="Finish a task or write a reflection and the week will fill in."
          className="py-8"
        />
      ) : (
        <>
          <Card className="mt-5">
            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1 rounded-2xl bg-surface-alt p-3">
                <Text className="text-3xl font-bold text-brand-ink">
                  {totals?.completedTasks ?? 0}
                </Text>
                <Text className="text-xs text-muted">completed</Text>
              </View>
              <View className="flex-1 rounded-2xl bg-surface-alt p-3">
                <Text className="text-3xl font-bold text-heading">{totals?.pendingTasks ?? 0}</Text>
                <Text className="text-xs text-muted">pending</Text>
              </View>
            </View>

            <View className="mt-5 flex-row items-end justify-between" style={{ gap: 6 }}>
              {days.map((day, index) => {
                const count = day.completedTasks.length;
                const height = count > 0 ? Math.max(6, Math.round((count / maxCompleted) * 56)) : 4;
                return (
                  <View
                    key={`${day.date ?? index}`}
                    className="flex-1 items-center justify-end"
                    style={{ height: 84, gap: 6 }}
                  >
                    <View
                      className={`w-full rounded-md ${count > 0 ? 'bg-brand' : 'bg-surface-alt'}`}
                      style={{ height }}
                    />
                    <Text className="text-xs text-muted">{weekdayNarrow(day.date)}</Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <SectionHeading>
            <Text className="text-base font-bold text-heading">Day by day</Text>
          </SectionHeading>

          <View style={{ gap: 8 }}>
            {days.map((day, index) => {
              const completed = day.completedTasks.length;
              const pending = day.pendingTasks.length;
              const mood = day.mood && day.mood !== 'Not recorded' ? day.mood : null;
              const reflection = day.date ? reflections.get(day.date.slice(0, 10)) : undefined;
              const quiet = completed === 0 && pending === 0 && !mood && !reflection;

              return (
                <Card key={`${day.date ?? index}`}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-heading">
                      {day.date ? formatDueDate(day.date) : 'Day'}
                    </Text>
                    <Text className="text-xs text-muted">
                      {completed} completed Â· {pending} pending
                    </Text>
                  </View>

                  {quiet ? (
                    <Text className="mt-2 text-sm text-muted">Quiet day</Text>
                  ) : (
                    <>
                      {mood ? (
                        <View className="mt-2 flex-row items-center" style={{ gap: 6 }}>
                          <Ionicons name="happy-outline" size={14} color={colors.brandInk} />
                          <Text className="text-xs font-medium text-muted">{mood}</Text>
                        </View>
                      ) : null}
                      {reflection ? (
                        <Text className="mt-2 text-sm italic leading-6 text-muted">
                          {reflection}
                        </Text>
                      ) : null}
                    </>
                  )}
                </Card>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
