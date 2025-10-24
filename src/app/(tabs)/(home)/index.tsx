import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import type { Task } from '@/lib/api';
import { TaskRow } from '@/components/domain/task-row';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useDailyRecap, useDashboard, useToggleTask } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

const QUICK_ACTIONS: { label: string; icon: IconName; href: Href }[] = [
  { label: 'Add task', icon: 'add-circle', href: '/tasks' },
  { label: 'Plan day', icon: 'flash', href: '/plan' },
  { label: 'Journal', icon: 'book', href: '/insights' },
];

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const dashboard = useDashboard();
  const recap = useDailyRecap();
  const toggleTask = useToggleTask();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const firstName = user?.name.trim().split(/\s+/)[0] ?? 'there';
  const now = new Date();

  function toggle(task: Task) {
    setBusyTaskId(task.taskId);
    toggleTask.mutate(
      { taskId: task.taskId, isCompleted: !task.isCompleted },
      { onSettled: () => setBusyTaskId(null) },
    );
  }

  const data = dashboard.data;
  const stats = data?.tasks;
  const unread = data?.unreadNotifications ?? 0;
  const completion =
    stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const todayTasks = data?.todayTasks ?? [];
  const reminders = data?.nextReminders ?? [];
  const suggestions = (data?.suggestions ?? []).slice(0, 2);

  const bell = (
    <Pressable
      onPress={() => router.push('/notifications')}
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
    >
      <Ionicons name="notifications-outline" size={20} color={colors.heading} />
      {unread > 0 ? (
        <View className="absolute -right-1 -top-1 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5">
          <Text className="text-xs font-bold text-on-brand">{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );

  if (dashboard.isPending) {
    return (
      <Screen>
        <ScreenHeader
          icon="home-outline"
          eyebrow={todayLabel(now)}
          title={`${greetingFor(now)}, ${firstName}.`}
          subtitle="A clear mind starts with one small step."
          right={bell}
        />
        <View className="mt-6" style={{ gap: 12 }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </View>
      </Screen>
    );
  }

  if (dashboard.isError && !data) {
    return (
      <Screen>
        <ScreenHeader
          icon="home-outline"
          eyebrow={todayLabel(now)}
          title={`${greetingFor(now)}, ${firstName}.`}
          right={bell}
        />
        <ErrorState
          title="Could not load your day"
          message={errorMessage(dashboard.error)}
          onRetry={() => void dashboard.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        icon="home-outline"
        eyebrow={todayLabel(now)}
        title={`${greetingFor(now)}, ${firstName}.`}
        subtitle="A clear mind starts with one small step."
        right={bell}
      />

      <View className="mt-6 rounded-3xl bg-brand p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-on-brand">Your progress</Text>
          <Ionicons name="stats-chart" size={20} color={colors.onBrand} />
        </View>
        <Text className="mt-4 text-5xl font-bold text-on-brand">
          {stats?.completed ?? 0} / {stats?.total ?? 0}
        </Text>
        <Text className="mt-1 text-sm text-on-brand">
          {stats && stats.total > 0
            ? `intentions completed Â· ${stats.pending} still open`
            : 'nothing on the list yet'}
        </Text>
        <View className="mt-4 h-2 overflow-hidden rounded-full bg-on-brand/20">
          <View className="h-full rounded-full bg-surface" style={{ width: `${completion}%` }} />
        </View>
      </View>

      <View className="mt-4 flex-row" style={{ gap: 12 }}>
        <Card className="flex-1 rounded-2xl">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
            <Ionicons name="calendar" size={18} color={colors.warning} />
          </View>
          <Text className="mt-3 text-2xl font-bold text-heading">{stats?.dueToday ?? 0}</Text>
          <Text className="text-sm text-muted">due today</Text>
        </Card>

        <Card className="flex-1 rounded-2xl">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
            <Ionicons name="flame" size={18} color={colors.successInk} />
          </View>
          <Text className="mt-3 text-2xl font-bold text-heading">{data?.streak ?? 0}</Text>
          <Text className="text-sm text-muted">day streak</Text>
        </Card>
      </View>

      <View className="mt-4 flex-row" style={{ gap: 10 }}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.navigate(action.href)}
            accessibilityRole="button"
            className="flex-1 items-center rounded-2xl border border-border bg-surface py-4 active:opacity-70"
          >
            <Ionicons name={action.icon} size={22} color={colors.brandInk} />
            <Text className="mt-2 text-xs font-semibold text-heading">{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeading
        action={
          <Pressable onPress={() => router.navigate('/tasks')} accessibilityRole="button">
            <Text className="text-sm font-semibold text-brand-ink">See all</Text>
          </Pressable>
        }
      >
        <Text className="text-base font-bold text-heading">Today</Text>
      </SectionHeading>

      {todayTasks.length > 0 ? (
        <View style={{ gap: 8 }}>
          {todayTasks.map((task) => (
            <TaskRow
              key={task.taskId}
              task={task}
              toggling={busyTaskId === task.taskId}
              onToggle={() => toggle(task)}
              onPress={() => router.push(`/tasks/${task.taskId}`)}
            />
          ))}
        </View>
      ) : (
        <Card>
          <EmptyState
            icon="checkmark-done-circle"
            title="Nothing due today"
            description="Add a task with today's date and it will show up here."
            className="py-6"
          />
        </Card>
      )}

      <SectionHeading>
        <Text className="text-base font-bold text-heading">Today&apos;s recap</Text>
      </SectionHeading>

      {recap.isPending ? (
        <SkeletonCard lines={2} />
      ) : recap.data ? (
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-heading">How the day is going</Text>
            <Chip label={recap.data.mood || 'Not recorded'} icon="happy-outline" />
          </View>

          <View className="mt-4 flex-row" style={{ gap: 12 }}>
            <View className="flex-1 rounded-2xl bg-surface-alt p-3">
              <Text className="text-xl font-bold text-heading">
                {recap.data.completedTasks.length}
              </Text>
              <Text className="text-xs text-muted">finished today</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-surface-alt p-3">
              <Text className="text-xl font-bold text-heading">
                {recap.data.pendingTasks.length}
              </Text>
              <Text className="text-xs text-muted">waiting</Text>
            </View>
          </View>

          {recap.data.pendingTasks.slice(0, 3).map((title) => (
            <View key={title} className="mt-3 flex-row items-center" style={{ gap: 8 }}>
              <View className="h-1.5 w-1.5 rounded-full bg-brand" />
              <Text numberOfLines={1} className="flex-1 text-sm text-muted">
                {title}
              </Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Text className="text-sm text-muted">The recap is unavailable right now.</Text>
        </Card>
      )}

      {reminders.length > 0 ? (
        <>
          <SectionHeading>
            <Text className="text-base font-bold text-heading">Next reminders</Text>
          </SectionHeading>

          <Card padded={false} className="overflow-hidden rounded-2xl">
            {reminders.slice(0, 3).map((reminder) => (
              <View
                key={reminder.reminderId}
                className="flex-row items-center border-b border-border px-4 py-3 last:border-b-0"
                style={{ gap: 12 }}
              >
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-alt">
                  <Ionicons name="alarm-outline" size={17} color={colors.brandInk} />
                </View>
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-sm font-semibold text-heading">
                    {reminder.title ?? 'Reminder'}
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted">
                    {formatDateTime(reminder.fireAt) ?? 'No time set'}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {suggestions.length > 0 ? (
        <>
          <SectionHeading
            action={
              <Pressable
                onPress={() => router.push('/insights/suggestions')}
                accessibilityRole="button"
                accessibilityLabel="See all suggestions"
                className="active:opacity-70"
              >
                <Text className="text-sm font-semibold text-brand-ink">See all</Text>
              </Pressable>
            }
          >
            <Text className="text-base font-bold text-heading">For you</Text>
          </SectionHeading>

          <View style={{ gap: 8 }}>
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                onPress={() => router.push('/insights/suggestions')}
                className="border-border"
              >
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  <Ionicons name="sparkles" size={16} color={colors.brandInk} />
                  <Text className="flex-1 text-sm font-semibold text-heading">
                    {suggestion.title}
                  </Text>
                  {suggestion.priority === 'high' ? <Chip label="Now" /> : null}
                </View>
                {suggestion.message ? (
                  <Text className="mt-2 text-sm leading-5 text-muted">{suggestion.message}</Text>
                ) : null}
              </Card>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
