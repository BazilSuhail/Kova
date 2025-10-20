import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { CalendarDay } from '@/api/types';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useCalendar } from '@/hooks/queries/plan';
import { errorMessage } from '@/lib/errors';
import { formatDueDate, todayIsoDate } from '@/lib/format';
import { selectFeedback, tapFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';

type CalendarViewKind = 'day' | 'week' | 'month';

const VIEWS: { key: CalendarViewKind; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** `YYYY-MM-DD` shifted by whole local days; a date-only string never reaches `new Date(string)`. */
function addDays(iso: string, n: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day + n);
  const nextMonth = `${date.getMonth() + 1}`.padStart(2, '0');
  const nextDay = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

/** Whole months apart, clamped to the target month's last day. */
function shiftMonth(iso: string, delta: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const target = new Date(year, month - 1 + delta, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const clamped = Math.min(day, lastDay);
  const nextMonth = `${target.getMonth() + 1}`.padStart(2, '0');
  const nextDay = `${clamped}`.padStart(2, '0');
  return `${target.getFullYear()}-${nextMonth}-${nextDay}`;
}

/** "5 Oct", never routed through `new Date(string)`. */
function shortDate(iso: string | undefined): string {
  if (!iso) return '';
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

/** "Monday, 5 Oct" for a week bucket. */
function weekdayDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

/** Monday-first column index, for lining up the month grid. */
function weekdayOffset(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return (new Date(year, month - 1, day).getDay() + 6) % 7;
}

function dayNumber(iso: string): string {
  return `${Number(iso.slice(8, 10))}`;
}

export default function CalendarScreen() {
  const colors = useThemeColors();
  const [view, setView] = useState<CalendarViewKind>('week');
  const [anchor, setAnchor] = useState(todayIsoDate());

  const calendar = useCalendar(view, anchor);
  const data = calendar.data;
  const today = todayIsoDate();

  const rangeLabel = data ? `${shortDate(data.start)} – ${shortDate(data.end)}` : 'Loading…';

  const monthCells = useMemo<(CalendarDay | null)[]>(() => {
    const days = data?.days ?? [];
    const offset = days[0] ? weekdayOffset(days[0].date) : 0;
    const blanks: null[] = Array.from({ length: offset }, () => null);
    return [...blanks, ...days];
  }, [data]);

  function pickView(next: CalendarViewKind) {
    selectFeedback();
    setView(next);
  }

  function step(direction: -1 | 1) {
    tapFeedback();
    if (view === 'month') {
      setAnchor((current) => shiftMonth(current, direction));
      return;
    }
    setAnchor((current) => addDays(current, view === 'week' ? direction * 7 : direction));
  }

  function reset() {
    selectFeedback();
    setAnchor(todayIsoDate());
  }

  function openDay(iso: string) {
    tapFeedback();
    setAnchor(iso);
    setView('day');
  }

  const back = (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Back"
      className="h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
      <Ionicons name="chevron-back" size={18} color={colors.text} />
    </Pressable>
  );

  function stepButton(direction: -1 | 1) {
    return (
      <Pressable
        onPress={() => step(direction)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={direction === -1 ? 'Previous' : 'Next'}
        className="h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
        <Ionicons
          name={direction === -1 ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={colors.text}
        />
      </Pressable>
    );
  }

  return (
    <Screen scroll={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={calendar.isRefetching}
            onRefresh={() => void calendar.refetch()}
            tintColor={colors.primary}
          />
        }>
        <View className="mb-4 flex-row items-center justify-between">
          {back}
          <Chip label="Today" icon="today-outline" onPress={reset} />
        </View>

        <ScreenHeader eyebrow="Plan" title="Calendar" subtitle={rangeLabel} />

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row" style={{ gap: 8 }}>
            {VIEWS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={view === option.key}
                onPress={() => pickView(option.key)}
              />
            ))}
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            {stepButton(-1)}
            {stepButton(1)}
          </View>
        </View>

        {calendar.isPending ? (
          <View className="mt-5" style={{ gap: 12 }}>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={1} />
          </View>
        ) : calendar.isError ? (
          <ErrorState
            title="Could not load the calendar"
            message={errorMessage(calendar.error)}
            onRetry={() => void calendar.refetch()}
          />
        ) : view === 'day' ? (
          <DayView day={data?.days[0]} />
        ) : view === 'week' ? (
          <WeekView days={data?.days ?? []} onOpenDay={openDay} />
        ) : (data?.days ?? []).length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Nothing this month"
            description="Once tasks have due dates they will show up here."
            className="py-8"
          />
        ) : (
          <View className="mt-5">
            <View className="flex-row">
              {WEEKDAYS.map((label, index) => (
                <View key={`${label}-${index}`} className="items-center" style={{ width: `${100 / 7}%` }}>
                  <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-2 flex-row flex-wrap">
              {monthCells.map((day, index) => {
                if (!day) {
                  return (
                    <View key={`blank-${index}`} style={{ width: `${100 / 7}%`, height: 54 }} />
                  );
                }
                const isToday = day.date === today;
                return (
                  <Pressable
                    key={day.date}
                    onPress={() => openDay(day.date)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${weekdayDate(day.date)}`}
                    style={{ width: `${100 / 7}%`, height: 54, padding: 2 }}>
                    <View
                      className={`flex-1 items-center justify-center rounded-xl ${
                        isToday
                          ? 'border border-violet-500 bg-violet-50 dark:bg-violet-950'
                          : day.tasks.length > 0
                            ? 'bg-slate-100 dark:bg-slate-800'
                            : ''
                      }`}>
                      <Text
                        className={`text-sm font-semibold ${
                          isToday
                            ? 'text-violet-600 dark:text-violet-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                        {dayNumber(day.date)}
                      </Text>
                      <View className="mt-1 flex-row items-center" style={{ gap: 2 }}>
                        {day.tasks.slice(0, 3).map((task, dotIndex) => (
                          <View
                            key={`${task.taskId}-${dotIndex}`}
                            className={`h-1 w-1 rounded-full ${
                              task.isCompleted ? 'bg-emerald-500' : 'bg-violet-500'
                            }`}
                          />
                        ))}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function DayView({ day }: { day: CalendarDay | undefined }) {
  const colors = useThemeColors();
  const tasks = day?.tasks ?? [];
  const planner = day?.planner ?? null;

  if (tasks.length === 0 && !planner) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="Nothing on this day"
        description="No tasks or plan have been set for the selected day."
        className="py-8"
      />
    );
  }

  return (
    <View className="mt-5">
      {tasks.length > 0 ? (
        <View style={{ gap: 8 }}>
          {tasks.map((task) => (
            <Card key={task.taskId}>
              <View className="flex-row items-center" style={{ gap: 10 }}>
                <View className="flex-1">
                  <Text
                    numberOfLines={2}
                    className={`text-sm font-semibold ${
                      task.isCompleted
                        ? 'text-slate-400 line-through dark:text-slate-600'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                    {task.title}
                  </Text>
                  {task.category || task.dueDate ? (
                    <View className="mt-1.5 flex-row flex-wrap items-center" style={{ gap: 8 }}>
                      {task.category ? <Chip label={task.category} /> : null}
                      {task.dueDate ? (
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDueDate(task.dueDate)}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
                {task.isCompleted ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <Card>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            No tasks due on this day.
          </Text>
        </Card>
      )}

      {planner ? (
        <Card className="mt-3 border-violet-200 dark:border-violet-900">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Ionicons name="flash" size={16} color={colors.primary} />
            <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Day plan
            </Text>
          </View>

          {planner.focusTasks.length > 0 ? (
            <View className="mt-3" style={{ gap: 8 }}>
              {planner.focusTasks.map((item, index) => (
                <View key={`${index}-${item}`} className="flex-row items-start" style={{ gap: 8 }}>
                  <Text className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    {index + 1}
                  </Text>
                  <Text className="flex-1 text-sm text-slate-700 dark:text-slate-300">{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">No focus set.</Text>
          )}

          {planner.reflection ? (
            <Text className="mt-3 border-t border-slate-200 pt-3 text-sm italic leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-400">
              {planner.reflection}
            </Text>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
}

function WeekView({ days, onOpenDay }: { days: CalendarDay[]; onOpenDay: (iso: string) => void }) {
  const colors = useThemeColors();

  if (days.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="Nothing this week"
        description="Once tasks have due dates they will show up here."
        className="py-8"
      />
    );
  }

  return (
    <View className="mt-5" style={{ gap: 8 }}>
      {days.map((day) => {
        const total = day.tasks.length;
        const done = day.tasks.filter((task) => task.isCompleted).length;
        return (
          <Card key={day.date} onPress={() => onOpenDay(day.date)}>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {weekdayDate(day.date)}
              </Text>
              {total > 0 ? (
                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {done}/{total} done
                </Text>
              ) : null}
            </View>

            {total > 0 ? (
              <View className="mt-1.5" style={{ gap: 2 }}>
                {day.tasks.slice(0, 3).map((task) => (
                  <Text
                    key={task.taskId}
                    numberOfLines={1}
                    className={`text-sm ${
                      task.isCompleted
                        ? 'text-slate-400 line-through dark:text-slate-600'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                    {task.title}
                  </Text>
                ))}
                {total > 3 ? (
                  <Text className="text-xs text-slate-500 dark:text-slate-400">
                    +{total - 3} more
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">No tasks</Text>
            )}

            {day.planner ? (
              <View className="mt-2 flex-row items-center" style={{ gap: 6 }}>
                <Ionicons name="flash" size={12} color={colors.primary} />
                <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                  Plan ready
                </Text>
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}
