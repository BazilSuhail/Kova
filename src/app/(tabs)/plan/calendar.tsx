import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { CalendarDay } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { BackButton } from '@/components/ui/back-button';
import { useCalendar } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { addDays, formatDueDate, shortDate, todayIsoDate } from '@/lib/format';
import { selectFeedback, tapFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';

type CalendarViewKind = 'day' | 'week' | 'month';

const VIEWS: { key: CalendarViewKind; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
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

  const calendar = useCalendar(view, anchor);
  const data = calendar.data;
  const today = todayIsoDate();

  const rangeLabel = data ? `${shortDate(data.start)} â€“ ${shortDate(data.end)}` : 'Loadingâ€¦';

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

  const back = <BackButton fallback="/" />;

  function stepButton(direction: -1 | 1) {
    return (
      <Pressable
        onPress={() => step(direction)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={direction === -1 ? 'Previous' : 'Next'}
        className="h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
      >
        <Ionicons
          name={direction === -1 ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={colors.heading}
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
            tintColor={colors.brandInk}
          />
        }
      >
        <View className="mb-4 flex-row items-center justify-between">
          {back}
          <Chip label="Today" icon="today-outline" onPress={reset} />
        </View>

        <ScreenHeader
          icon="calendar-outline"
          eyebrow="Plan"
          title="Calendar"
          subtitle={rangeLabel}
        />

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
                    accessibilityLabel={`Open ${weekdayDate(day.date)}`}
                    style={{ width: `${100 / 7}%`, height: 54, padding: 2 }}
                  >
                    <View
                      className={`flex-1 items-center justify-center rounded-xl ${
                        isToday
                          ? 'border border-brand-ink bg-surface-alt'
                          : day.tasks.length > 0
                            ? 'bg-surface-alt'
                            : ''
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          isToday ? 'text-brand-ink' : 'text-body'
                        }`}
                      >
                        {dayNumber(day.date)}
                      </Text>
                      <View className="mt-1 flex-row items-center" style={{ gap: 2 }}>
                        {day.tasks.slice(0, 3).map((task, dotIndex) => (
                          <View
                            key={`${task.taskId}-${dotIndex}`}
                            className={`h-1 w-1 rounded-full ${
                              task.isCompleted ? 'bg-brand' : 'bg-muted'
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
                      task.isCompleted ? 'text-muted line-through' : 'text-heading'
                    }`}
                  >
                    {task.title}
                  </Text>
                  {task.category || task.dueDate ? (
                    <View className="mt-1.5 flex-row flex-wrap items-center" style={{ gap: 8 }}>
                      {task.category ? <Chip label={task.category} /> : null}
                      {task.dueDate ? (
                        <Text className="text-xs text-muted">{formatDueDate(task.dueDate)}</Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
                {task.isCompleted ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.successInk} />
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <Card>
          <Text className="text-sm text-muted">No tasks due on this day.</Text>
        </Card>
      )}

      {planner ? (
        <Card className="mt-3 border-border">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Ionicons name="flash" size={16} color={colors.brandInk} />
            <Text className="text-sm font-semibold text-heading">Day plan</Text>
          </View>

          {planner.focusTasks.length > 0 ? (
            <View className="mt-3" style={{ gap: 8 }}>
              {planner.focusTasks.map((item, index) => (
                <View key={`${index}-${item}`} className="flex-row items-start" style={{ gap: 8 }}>
                  <Text className="text-xs font-bold text-brand-ink">{index + 1}</Text>
                  <Text className="flex-1 text-sm text-body">{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="mt-2 text-sm text-muted">No focus set.</Text>
          )}

          {planner.reflection ? (
            <Text className="mt-3 border-t border-border pt-3 text-sm italic leading-6 text-muted">
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
              <Text className="text-sm font-semibold text-heading">{weekdayDate(day.date)}</Text>
              {total > 0 ? (
                <Text className="text-xs font-semibold text-muted">
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
                      task.isCompleted ? 'text-muted line-through' : 'text-body'
                    }`}
                  >
                    {task.title}
                  </Text>
                ))}
                {total > 3 ? <Text className="text-xs text-muted">+{total - 3} more</Text> : null}
              </View>
            ) : (
              <Text className="mt-1.5 text-sm text-muted">No tasks</Text>
            )}

            {day.planner ? (
              <View className="mt-2 flex-row items-center" style={{ gap: 6 }}>
                <Ionicons name="flash" size={12} color={colors.brandInk} />
                <Text className="text-xs font-semibold text-brand-ink">Plan ready</Text>
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}
