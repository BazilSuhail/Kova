import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { CalendarDay, Task } from '@/lib/api';
import { TaskRow } from '@/components/domain/task-row';
import { AppBar, IconButton } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useCalendar, useToggleTask } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { addDays, shortDate, todayIsoDate } from '@/lib/format';
import { selectFeedback, tapFeedback } from '@/lib/haptics';
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type CalendarViewKind = 'day' | 'week' | 'month';

const VIEWS: { key: CalendarViewKind; label: string; icon: IconName }[] = [
  { key: 'day', label: 'Day', icon: 'today-outline' },
  { key: 'week', label: 'Week', icon: 'calendar-number-outline' },
  { key: 'month', label: 'Month', icon: 'calendar-outline' },
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function shiftMonth(iso: string, delta: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const target = new Date(year, month - 1 + delta, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const clamped = Math.min(day, lastDay);
  const nextMonth = `${target.getMonth() + 1}`.padStart(2, '0');
  const nextDay = `${clamped}`.padStart(2, '0');
  return `${target.getFullYear()}-${nextMonth}-${nextDay}`;
}

function weekdayDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

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
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const calendar = useCalendar(view, anchor);
  const toggleTask = useToggleTask();
  const data = calendar.data;
  const today = todayIsoDate();

  const rangeLabel = data
    ? view === 'day'
      ? weekdayDate(anchor)
      : `${shortDate(data.start)} – ${shortDate(data.end)}`
    : 'Loading…';

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

  function openDay(iso: string) {
    tapFeedback();
    setAnchor(iso);
    setView('day');
  }

  function toggle(task: Task) {
    setBusyTaskId(task.taskId);
    toggleTask.mutate(
      { taskId: task.taskId, isCompleted: !task.isCompleted },
      {
        onSettled: () => {
          setBusyTaskId(null);
          // useToggleTask does not invalidate calendar queries.
          void calendar.refetch();
        },
      },
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar
        left={<BackButton fallback="/plan" />}
        brand={false}
        title="Calendar"
        actions={[
          {
            icon: 'today-outline',
            accessibilityLabel: 'Jump to today',
            onPress: () => {
              selectFeedback();
              setAnchor(todayIsoDate());
            },
          },
        ]}
      />

      <View
        className="flex-row items-center"
        style={{ paddingHorizontal: layout.gutter, paddingVertical: spacing.sm, gap: spacing.sm }}
      >
        {VIEWS.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            icon={option.icon}
            selected={view === option.key}
            onPress={() => pickView(option.key)}
          />
        ))}
      </View>

      <View
        className="flex-row items-center border-b border-border"
        style={{ paddingHorizontal: spacing.sm }}
      >
        <IconButton icon="chevron-back" accessibilityLabel="Previous" onPress={() => step(-1)} />
        <Text className="flex-1 text-center text-base font-semibold text-heading">
          {rangeLabel}
        </Text>
        <IconButton icon="chevron-forward" accessibilityLabel="Next" onPress={() => step(1)} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={calendar.isRefetching}
            onRefresh={() => void calendar.refetch()}
            tintColor={colors.brandInk}
          />
        }
      >
        {calendar.isPending ? (
          <View className="mt-4" style={{ gap: spacing.md }}>
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
          <DayView
            date={anchor}
            day={data?.days[0]}
            busyTaskId={busyTaskId}
            onToggle={toggle}
          />
        ) : view === 'week' ? (
          <WeekView days={data?.days ?? []} today={today} onOpenDay={openDay} />
        ) : (data?.days ?? []).length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Nothing this month"
            description="Tasks with due dates show up here."
            className="py-8"
          />
        ) : (
          <View className="mt-4">
            <View className="flex-row">
              {WEEKDAYS.map((label, index) => (
                <View
                  key={`${label}-${index}`}
                  className="items-center"
                  style={{ width: `${100 / 7}%` }}
                >
                  <Text className="text-xs font-semibold text-muted">{label}</Text>
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
                    accessibilityLabel={`Open ${weekdayDate(day.date)}, ${day.tasks.length} tasks`}
                    style={{ width: `${100 / 7}%`, height: 54, padding: 2 }}
                  >
                    <View
                      className={`flex-1 items-center justify-center rounded-md ${
                        isToday ? 'bg-brand-soft' : ''
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          isToday ? 'font-bold text-brand-ink' : 'font-medium text-body'
                        }`}
                      >
                        {dayNumber(day.date)}
                      </Text>
                      <View className="mt-1 h-1 flex-row items-center" style={{ gap: 2 }}>
                        {day.tasks.slice(0, 3).map((task, dotIndex) => (
                          <View
                            key={`${task.taskId}-${dotIndex}`}
                            className={`h-1 w-1 rounded-full ${
                              task.isCompleted ? 'bg-muted' : 'bg-brand'
                            }`}
                          />
                        ))}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-4 flex-row items-center" style={{ gap: spacing.lg }}>
              <Legend className="bg-brand" label="Open task" />
              <Legend className="bg-muted" label="Done" />
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 6 }}>
      <View className={`h-2 w-2 rounded-full ${className}`} />
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

function DayView({
  date,
  day,
  busyTaskId,
  onToggle,
}: {
  date: string;
  day: CalendarDay | undefined;
  busyTaskId: string | null;
  onToggle: (task: Task) => void;
}) {
  const colors = useThemeColors();
  const tasks = day?.tasks ?? [];
  const planner = day?.planner ?? null;
  const openEditor = () => router.push({ pathname: '/plan/editor', params: { date } });

  return (
    <View>
      <SectionHeading className="mt-4">
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <Ionicons name="checkbox-outline" size={18} color={colors.heading} />
          <Text className="text-base font-semibold text-heading">Tasks due</Text>
        </View>
      </SectionHeading>

      {tasks.length === 0 ? (
        <Text className="text-sm text-muted">No tasks due on this day.</Text>
      ) : (
        tasks.map((task, index) => (
          <Animated.View key={task.taskId} entering={FadeInDown.duration(220).delay(index * 40)}>
            <TaskRow
              task={task}
              toggling={busyTaskId === task.taskId}
              onToggle={() => onToggle(task)}
              onPress={() => router.push(`/tasks/${task.taskId}`)}
            />
          </Animated.View>
        ))
      )}

      <SectionHeading
        action={
          <Button
            label={planner ? 'Edit plan' : 'Plan this day'}
            icon="create-outline"
            variant="ghost"
            size="sm"
            onPress={openEditor}
          />
        }
      >
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <Ionicons name="flag-outline" size={18} color={colors.heading} />
          <Text className="text-base font-semibold text-heading">Day plan</Text>
        </View>
      </SectionHeading>

      {!planner ? (
        <Text className="text-sm text-muted">No plan for this day.</Text>
      ) : (
        <View>
          {planner.focusTasks.length > 0 ? (
            planner.focusTasks.map((item, index) => (
              <View
                key={`${index}-${item}`}
                className="min-h-12 flex-row items-center border-b border-border py-2"
                style={{ gap: spacing.md }}
              >
                <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-soft">
                  <Text className="text-xs font-bold text-brand-ink">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-[15px] text-heading">{item}</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-muted">No focus set.</Text>
          )}

          {planner.reflection ? (
            <View className="mt-4 flex-row items-start" style={{ gap: spacing.md }}>
              <Ionicons name="journal-outline" size={18} color={colors.muted} />
              <Text className="flex-1 text-sm italic leading-6 text-body">
                {planner.reflection}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function WeekView({
  days,
  today,
  onOpenDay,
}: {
  days: CalendarDay[];
  today: string;
  onOpenDay: (iso: string) => void;
}) {
  const colors = useThemeColors();

  if (days.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="Nothing this week"
        description="Tasks with due dates show up here."
        className="py-8"
      />
    );
  }

  return (
    <View>
      {days.map((day, index) => {
        const total = day.tasks.length;
        const done = day.tasks.filter((task) => task.isCompleted).length;
        const isToday = day.date === today;
        return (
          <Animated.View key={day.date} entering={FadeInDown.duration(220).delay(index * 40)}>
            <Pressable
              onPress={() => onOpenDay(day.date)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${weekdayDate(day.date)}`}
              className="flex-row items-start border-b border-border py-3 active:bg-surface-alt"
              style={{ gap: spacing.lg }}
            >
              <View
                className={`h-10 w-10 items-center justify-center rounded-md ${
                  isToday ? 'bg-brand' : 'bg-surface-alt'
                }`}
              >
                <Text
                  className={`text-base font-bold ${isToday ? 'text-on-brand' : 'text-heading'}`}
                >
                  {dayNumber(day.date)}
                </Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[15px] font-medium text-heading">
                    {weekdayDate(day.date)}
                  </Text>
                  {total > 0 ? (
                    <Text className="text-xs text-muted">
                      {done}/{total} done
                    </Text>
                  ) : null}
                </View>

                {total > 0 ? (
                  <View className="mt-1" style={{ gap: 2 }}>
                    {day.tasks.slice(0, 3).map((task) => (
                      <Text
                        key={task.taskId}
                        numberOfLines={1}
                        className={`text-sm ${
                          task.isCompleted ? 'text-muted line-through' : 'text-body'
                        }`}
                      >
                        {task.title}
                      </Text>
                    ))}
                    {total > 3 ? (
                      <Text className="text-xs text-muted">+{total - 3} more</Text>
                    ) : null}
                  </View>
                ) : (
                  <Text className="mt-1 text-sm text-muted">No tasks</Text>
                )}

                {day.planner ? (
                  <View className="mt-1.5 flex-row items-center" style={{ gap: 4 }}>
                    <Ionicons name="flag-outline" size={12} color={colors.brandInk} />
                    <Text className="text-xs font-medium text-brand-ink">Plan ready</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
