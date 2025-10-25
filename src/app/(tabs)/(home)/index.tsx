import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, type Href } from 'expo-router';
import { BarChart, LineChart } from 'react-native-gifted-charts';

import { useDashboard, useToggleTask } from '@/lib/api';
import type { Dashboard, Task } from '@/lib/api';
import { TaskComposerSheet, type CaptureMode } from '@/components/domain/task-composer';
import { TaskRow } from '@/components/domain/task-row';
import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FloatingShapes } from '@/components/ui/floating-shapes';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { StatTile } from '@/components/ui/stat-tile';
import { assetUrl } from '@/config/env';
import { chartColors, layout, spacing, useThemeColors } from '@/config/theme';
import { errorMessage } from '@/lib/errors';
import { formatDateTime, initialsOf, relativeTime } from '@/lib/format';
import { useAuthStore } from '@/store/auth-store';
import type { IconName } from '@/theme/icons';

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** 'YYYY-MM-DD' -> 'Mon' (local date, no TZ shift). */
function weekday(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return iso.slice(5);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: 'short' });
}

type QuickAction = { label: string; icon: IconName } & (
  | { compose: CaptureMode }
  | { href: Href }
);

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'New task', icon: 'add-circle-outline', compose: 'manual' },
  { label: 'Voice', icon: 'mic-outline', compose: 'voice' },
  { label: 'Scan', icon: 'camera-outline', compose: 'scan' },
  { label: 'Mood', icon: 'happy-outline', href: '/insights/mood' },
  { label: 'Plan day', icon: 'calendar-outline', href: '/plan/editor' },
];

function Section({ index, children }: { index: number; children: ReactNode }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(220).delay(index * 40)}
      style={{ marginTop: layout.sectionGap }}
    >
      {children}
    </Animated.View>
  );
}

function Heading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-base font-semibold text-heading">{title}</Text>
      {action}
    </View>
  );
}

function WeeklyChart({ days, width }: { days: Dashboard['weeklyCompletion']; width: number }) {
  const colors = useThemeColors();
  if (!days.some((day) => day.total > 0)) {
    return (
      <EmptyState
        icon="bar-chart-outline"
        title="No tasks this week"
        description="Tasks due this week will chart here."
        className="py-6"
      />
    );
  }
  const peak = Math.max(1, ...days.map((day) => day.total));
  const step = Math.ceil(peak / 3);

  return (
    <>
      <BarChart
        stackData={days.map((day) => ({
          label: weekday(day.date),
          stacks: [
            { value: day.completed, color: chartColors[0] },
            { value: Math.max(0, day.total - day.completed), color: chartColors[1], marginBottom: 2 },
          ],
        }))}
        adjustToWidth
        parentWidth={width}
        width={width - 28}
        height={120}
        barBorderRadius={4}
        maxValue={step * 3}
        stepValue={step}
        noOfSections={3}
        yAxisLabelWidth={24}
        yAxisThickness={0}
        xAxisColor={colors.border}
        rulesColor={colors.border}
        rulesType="solid"
        yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10 }}
        disablePress
        disableScroll
      />
      <View className="mt-3 flex-row" style={{ gap: spacing.lg }}>
        <Legend color={chartColors[0]} label="Completed" />
        <Legend color={chartColors[1]} label="Still open" />
      </View>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: spacing.xs }}>
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

function MoodChart({ days, width }: { days: Dashboard['moodTrend']; width: number }) {
  const colors = useThemeColors();
  const router = useRouter();
  // Days without a check-in are skipped rather than plotted as zero.
  const points = days
    .filter((day) => day.score !== null)
    .map((day) => ({ value: day.score ?? 0, label: weekday(day.date) }));

  if (points.length === 0) {
    return (
      <EmptyState
        icon="happy-outline"
        title="No mood check-ins yet"
        description="Log how you feel to see your week."
        actionLabel="Check in"
        onAction={() => router.push('/insights/mood')}
        className="py-6"
      />
    );
  }

  return (
    <LineChart
      data={points}
      areaChart
      curved
      adjustToWidth
      parentWidth={width}
      width={width - 28}
      height={120}
      maxValue={5}
      noOfSections={5}
      color={chartColors[0]}
      thickness={2}
      startFillColor={chartColors[0]}
      endFillColor={chartColors[0]}
      startOpacity={0.24}
      endOpacity={0.02}
      dataPointsColor={chartColors[0]}
      dataPointsRadius={3}
      initialSpacing={12}
      endSpacing={12}
      yAxisLabelWidth={24}
      yAxisThickness={0}
      xAxisColor={colors.border}
      rulesColor={colors.border}
      rulesType="solid"
      yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
      xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10 }}
      disableScroll
    />
  );
}

function LoadingBody() {
  return (
    <View style={{ gap: layout.sectionGap, marginTop: layout.sectionGap }}>
      <View className="flex-row" style={{ gap: spacing.md }}>
        {QUICK_ACTIONS.map((action) => (
          <Skeleton key={action.label} width={56} height={56} radius={8} />
        ))}
      </View>
      <View className="flex-row" style={{ gap: spacing.md }}>
        <View className="flex-1">
          <SkeletonCard lines={1} />
        </View>
        <View className="flex-1">
          <SkeletonCard lines={1} />
        </View>
      </View>
      <SkeletonCard lines={3} />
      <SkeletonCard lines={4} />
    </View>
  );
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const dashboard = useDashboard();
  const toggleTask = useToggleTask();
  const { width: windowWidth } = useWindowDimensions();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<CaptureMode>('manual');

  const data = dashboard.data;
  const now = new Date();
  const firstName = user?.name.trim().split(/\s+/)[0] || 'there';
  const avatarUri = assetUrl(user?.profilePicture);
  // Screen gutter + card padding on both sides.
  const chartWidth = Math.max(220, windowWidth - layout.gutter * 2 - spacing.lg * 2);

  const progress = data?.todayProgress ?? { total: 0, completed: 0, pending: 0 };
  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const scores = (data?.moodTrend ?? []).flatMap((day) => (day.score === null ? [] : [day.score]));
  const avgMood = scores.length
    ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
    : '–';

  function openComposer(mode: CaptureMode) {
    setComposerMode(mode);
    setComposerOpen(true);
  }

  function toggle(task: Task) {
    setBusyTaskId(task.taskId);
    toggleTask.mutate(
      { taskId: task.taskId, isCompleted: !task.isCompleted },
      { onSettled: () => setBusyTaskId(null) },
    );
  }

  const avatar = (
    <Pressable
      onPress={() => router.navigate('/profile')}
      accessibilityRole="button"
      accessibilityLabel="Profile"
      className="ml-1 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
    >
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          contentFit="cover"
          style={{ width: 30, height: 30, borderRadius: 15 }}
        />
      ) : (
        <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-brand">
          <Text className="text-xs font-bold text-on-brand">{initialsOf(user?.name, 'K')}</Text>
        </View>
      )}
    </Pressable>
  );

  const header = (
    <View className="relative overflow-hidden rounded-lg border border-border bg-surface p-4">
      <FloatingShapes />
      <Text className="text-xs font-medium uppercase tracking-wide text-muted">
        {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </Text>
      <Text className="mt-1 text-2xl font-bold tracking-tight text-heading">
        {greetingFor(now)}, {firstName}
      </Text>

      {data ? (
        <>
          <View className="mt-4 flex-row items-end justify-between">
            <Text className="text-sm text-body">
              <Text className="text-lg font-bold text-heading">{progress.completed}</Text> of{' '}
              {progress.total} due today done
            </Text>
            <View className="flex-row items-center" style={{ gap: spacing.xs }}>
              <Icon name="flame" size={16} tone="warning" />
              <Text className="text-sm font-semibold text-heading">{data.streak} day streak</Text>
            </View>
          </View>
          <View
            className="mt-2 h-2 overflow-hidden rounded-full bg-surface-alt"
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: percent }}
          >
            <View className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
          </View>
        </>
      ) : (
        <Skeleton height={36} style={{ marginTop: spacing.lg }} />
      )}
    </View>
  );

  let body: ReactNode;
  if (dashboard.isPending) {
    body = <LoadingBody />;
  } else if (!data) {
    body = (
      <ErrorState
        title="Could not load your day"
        message={errorMessage(dashboard.error)}
        onRetry={() => void dashboard.refetch()}
      />
    );
  } else {
    const todayTasks = data.todayTasks.slice(0, 4);
    const suggestions = data.suggestions.slice(0, 2);

    body = (
      <>
        <Section index={0}>
          <View className="flex-row justify-between">
            {QUICK_ACTIONS.map((action) => (
              <PressableScale
                key={action.label}
                haptic
                onPress={() =>
                  'compose' in action ? openComposer(action.compose) : router.push(action.href)
                }
                accessibilityRole="button"
                accessibilityLabel={action.label}
                className="items-center"
                style={{ width: 60 }}
              >
                <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand-soft">
                  <Icon name={action.icon} size={22} tone="brand" />
                </View>
                <Text numberOfLines={1} className="mt-1.5 text-xs font-medium text-body">
                  {action.label}
                </Text>
              </PressableScale>
            ))}
          </View>
        </Section>

        <Section index={1}>
          <View style={{ gap: spacing.md }}>
            <View className="flex-row" style={{ gap: spacing.md }}>
              <StatTile icon="checkmark-done" value={progress.completed} label="Done today" />
              <StatTile icon="hourglass-outline" value={progress.pending} label="Pending today" />
            </View>
            <View className="flex-row" style={{ gap: spacing.md }}>
              <StatTile icon="flame-outline" value={data.streak} label="Day streak" />
              <StatTile
                icon="happy-outline"
                value={avgMood}
                label="Avg mood (7d)"
                onPress={() => router.push('/insights/mood-trends')}
              />
            </View>
          </View>
        </Section>

        <Section index={2}>
          <Heading
            title="Today's tasks"
            action={
              <Button
                variant="ghost"
                size="sm"
                label="See all"
                onPress={() => router.navigate('/tasks')}
              />
            }
          />
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <TaskRow
                key={task.taskId}
                task={task}
                toggling={busyTaskId === task.taskId}
                onToggle={() => toggle(task)}
                onPress={() => router.push(`/tasks/${task.taskId}`)}
              />
            ))
          ) : (
            <Card>
              <EmptyState
                icon="checkmark-done-circle-outline"
                title="Nothing due today"
                description="Add a task with today's date and it shows up here."
                actionLabel="New task"
                onAction={() => openComposer('manual')}
                className="py-6"
              />
            </Card>
          )}
        </Section>

        <Section index={3}>
          <Heading title="This week" />
          <Card>
            <WeeklyChart days={data.weeklyCompletion} width={chartWidth} />
          </Card>
        </Section>

        <Section index={4}>
          <Heading
            title="Mood, last 7 days"
            action={
              <Button
                variant="ghost"
                size="sm"
                label="Trends"
                onPress={() => router.push('/insights/mood-trends')}
              />
            }
          />
          <Card>
            <MoodChart days={data.moodTrend} width={chartWidth} />
          </Card>
        </Section>

        {data.nextReminders.length > 0 ? (
          <Section index={5}>
            <Heading title="Upcoming reminders" />
            <Card padded={false}>
              {data.nextReminders.map((reminder, i, all) => (
                <Row
                  key={reminder.reminderId}
                  icon="alarm-outline"
                  tone="primary"
                  title={reminder.title}
                  subtitle={formatDateTime(reminder.fireAt) ?? 'No time set'}
                  onPress={() => router.push('/plan/reminders')}
                  last={i === all.length - 1}
                />
              ))}
            </Card>
          </Section>
        ) : null}

        {data.recentSummaries.length > 0 ? (
          <Section index={6}>
            <Heading
              title="Recent summaries"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  label="Library"
                  onPress={() => router.push('/insights/library')}
                />
              }
            />
            <Card padded={false}>
              {data.recentSummaries.map((summary, i, all) => (
                <Row
                  key={summary.summaryId}
                  icon={summary.sourceType.toLowerCase() === 'pdf' ? 'document-outline' : 'document-text-outline'}
                  title={summary.originalFileName || summary.summaryBullets[0] || 'Summary'}
                  subtitle={relativeTime(summary.createdAt) ?? undefined}
                  onPress={() => router.push(`/insights/library/${summary.summaryId}` as Href)}
                  last={i === all.length - 1}
                />
              ))}
            </Card>
          </Section>
        ) : null}

        {suggestions.length > 0 ? (
          <Section index={7}>
            <Heading title="For you" />
            <Card padded={false}>
              {suggestions.map((suggestion, i, all) => (
                <Row
                  key={suggestion.id}
                  icon="sparkles-outline"
                  tone="primary"
                  title={suggestion.title}
                  subtitle={suggestion.message}
                  onPress={() => router.push('/insights/suggestions')}
                  last={i === all.length - 1}
                />
              ))}
            </Card>
          </Section>
        ) : null}
      </>
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar
        actions={[
          { icon: 'search', accessibilityLabel: 'Search tasks', onPress: () => router.navigate('/tasks') },
          {
            icon: 'notifications-outline',
            accessibilityLabel: data?.unreadNotifications
              ? `Notifications, ${data.unreadNotifications} unread`
              : 'Notifications',
            badge: (data?.unreadNotifications ?? 0) > 0,
            onPress: () => router.push('/notifications'),
          },
        ]}
        right={avatar}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isRefetching}
            onRefresh={() => void dashboard.refetch()}
            tintColor={colors.brandInk}
            colors={[colors.brandInk]}
          />
        }
      >
        {header}
        {body}
      </ScrollView>

      <TaskComposerSheet
        visible={composerOpen}
        initialMode={composerMode}
        onClose={() => setComposerOpen(false)}
      />
    </Screen>
  );
}
