import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { Task } from '@/lib/api';
import { TaskRow } from '@/components/domain/task-row';
import { AppBar, IconButton } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { StatTile } from '@/components/ui/stat-tile';
import {
  useCreatePlanner,
  useDailyRecap,
  useTodayPlanner,
  useToggleTask,
  useUpcomingReminders,
  useUpdatePlanner,
  useUpdatePlannerFocus,
} from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { todayIsoDate } from '@/lib/format';
import { successFeedback } from '@/lib/haptics';
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

const SHORTCUTS: { label: string; icon: IconName; href: Href }[] = [
  { label: 'Calendar', icon: 'calendar-outline', href: '/plan/calendar' },
  { label: 'Reminders', icon: 'alarm-outline', href: '/plan/reminders' },
  { label: 'Weekly recap', icon: 'stats-chart-outline', href: '/plan/weekly-recap' },
  { label: 'Plan another day', icon: 'create-outline', href: '/plan/editor' },
];

function Heading({ icon, title }: { icon: IconName; title: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center" style={{ gap: spacing.sm }}>
      <Ionicons name={icon} size={18} color={colors.heading} />
      <Text className="text-base font-semibold text-heading">{title}</Text>
    </View>
  );
}

export default function PlanScreen() {
  const colors = useThemeColors();
  const { planner, isLoading, isError, error, refetch } = useTodayPlanner();
  const recap = useDailyRecap();
  const upcoming = useUpcomingReminders();
  const updateFocus = useUpdatePlannerFocus();
  const updatePlanner = useUpdatePlanner();
  const createPlanner = useCreatePlanner();
  const toggleTask = useToggleTask();

  const [focusDraft, setFocusDraft] = useState('');
  const [focusBusy, setFocusBusy] = useState(false);
  const [reflectionDraft, setReflectionDraft] = useState<{ key: string; text: string } | null>(
    null,
  );
  const [editingReflection, setEditingReflection] = useState(false);
  const [reflectionBusy, setReflectionBusy] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const reflectionKey = planner?.plannerId ?? 'none';
  const reflectionText =
    reflectionDraft?.key === reflectionKey ? reflectionDraft.text : (planner?.reflection ?? '');
  const showReflectionInput = editingReflection || !planner?.reflection;
  const upcomingCount = upcoming.data?.length ?? 0;
  const focus = planner?.focusTasks ?? [];
  const linked = planner?.tasksDetails ?? [];
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  async function changeFocus(next: string[]) {
    setFocusBusy(true);
    setFormError(null);
    try {
      if (planner) {
        await updateFocus.mutateAsync({ plannerId: planner.plannerId, focusTasks: next });
      } else {
        // No plan yet: the first focus creates today's plan.
        await createPlanner.mutateAsync({ date: todayIsoDate(), focusTasks: next });
      }
      successFeedback();
    } catch (failure) {
      setFormError(errorMessage(failure));
    } finally {
      setFocusBusy(false);
    }
  }

  function addFocus() {
    const value = focusDraft.trim();
    if (!value || focusBusy) return;
    setFocusDraft('');
    if (focus.includes(value)) return;
    void changeFocus([...focus, value]);
  }

  function toggle(task: Task) {
    setBusyTaskId(task.taskId);
    toggleTask.mutate(
      { taskId: task.taskId, isCompleted: !task.isCompleted },
      {
        onSettled: () => {
          setBusyTaskId(null);
          // useToggleTask does not invalidate planners, so linked task details would go stale.
          refetch();
        },
      },
    );
  }

  async function saveReflection() {
    const text = reflectionText.trim();
    setReflectionBusy(true);
    setFormError(null);
    try {
      if (planner) {
        await updatePlanner.mutateAsync({
          plannerId: planner.plannerId,
          input: { reflection: text },
        });
      } else {
        await createPlanner.mutateAsync({ date: todayIsoDate(), reflection: text });
      }
      setReflectionDraft({ key: reflectionKey, text });
      setEditingReflection(false);
      successFeedback();
    } catch (failure) {
      setFormError(errorMessage(failure));
    } finally {
      setReflectionBusy(false);
    }
  }

  return (
    <Screen scroll={false}>
      <AppBar
        title="Plan"
        actions={[
          {
            icon: 'alarm-outline',
            accessibilityLabel:
              upcomingCount > 0 ? `Reminders, ${upcomingCount} coming up` : 'Reminders',
            badge: upcomingCount > 0,
            onPress: () => router.push('/plan/reminders'),
          },
          {
            icon: 'create-outline',
            accessibilityLabel: "Edit today's plan",
            onPress: () => router.push('/plan/editor'),
          },
        ]}
      />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacing.sm,
            paddingHorizontal: layout.gutter,
            paddingVertical: spacing.sm,
          }}
        >
          <Chip label="Today" icon="today-outline" selected />
          {SHORTCUTS.map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              icon={item.icon}
              onPress={() => router.push(item.href)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refetch();
              void recap.refetch();
              void upcoming.refetch();
            }}
            tintColor={colors.brandInk}
          />
        }
      >
        <Text className="mt-2 text-sm text-muted">{todayLabel}</Text>

        {formError ? (
          <View className="mt-4">
            <FormError message={formError} />
          </View>
        ) : null}

        {isLoading ? (
          <View className="mt-4" style={{ gap: spacing.md }}>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={1} />
          </View>
        ) : isError ? (
          <ErrorState
            title="Could not load your plan"
            message={errorMessage(error)}
            onRetry={refetch}
          />
        ) : (
          <>
            <SectionHeading className="mt-4">
              <Heading icon="flag-outline" title="Today's focus" />
            </SectionHeading>

            <View
              className="flex-row items-center border-b border-border"
              style={{ gap: spacing.md, minHeight: 56 }}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.brandInk} />
              <TextInput
                value={focusDraft}
                onChangeText={setFocusDraft}
                onSubmitEditing={addFocus}
                placeholder={
                  focus.length === 0 ? 'What would make today count?' : 'Add another focus'
                }
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                editable={!focusBusy}
                accessibilityLabel="Add a focus for today"
                className="flex-1 py-3 text-base text-heading"
              />
              {focusBusy ? (
                <ActivityIndicator color={colors.brandInk} />
              ) : focusDraft.trim() ? (
                <IconButton
                  icon="arrow-up-circle"
                  size={28}
                  color={colors.brandInk}
                  accessibilityLabel="Add focus"
                  onPress={addFocus}
                />
              ) : null}
            </View>

            {focus.map((item, index) => (
              <Animated.View
                key={`${index}-${item}`}
                entering={FadeInDown.duration(220).delay(index * 40)}
              >
                <View
                  className="min-h-14 flex-row items-center border-b border-border py-2"
                  style={{ gap: spacing.md }}
                >
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-soft">
                    <Text className="text-xs font-bold text-brand-ink">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-[15px] text-heading">{item}</Text>
                  <IconButton
                    icon="close"
                    size={18}
                    color={colors.muted}
                    accessibilityLabel={`Remove focus ${item}`}
                    onPress={() => void changeFocus(focus.filter((_, i) => i !== index))}
                  />
                </View>
              </Animated.View>
            ))}

            <SectionHeading
              action={
                planner ? (
                  <Button
                    label="Link tasks"
                    icon="link-outline"
                    variant="ghost"
                    size="sm"
                    onPress={() => router.push('/plan/editor')}
                  />
                ) : undefined
              }
            >
              <Heading icon="checkbox-outline" title="Linked tasks" />
            </SectionHeading>

            {linked.length > 0 ? (
              linked.map((task, index) => (
                <Animated.View
                  key={task.taskId}
                  entering={FadeInDown.duration(220).delay(index * 40)}
                >
                  <TaskRow
                    task={task}
                    toggling={busyTaskId === task.taskId}
                    onToggle={() => toggle(task)}
                    onPress={() => router.push(`/tasks/${task.taskId}`)}
                  />
                </Animated.View>
              ))
            ) : (
              <EmptyState
                icon="link-outline"
                title="No tasks linked"
                description="Pick a few tasks to do today."
                actionLabel="Link tasks"
                onAction={() => router.push('/plan/editor')}
                className="py-6"
              />
            )}
          </>
        )}

        <SectionHeading
          action={
            <Button
              label="Weekly recap"
              icon="stats-chart-outline"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/plan/weekly-recap')}
            />
          }
        >
          <Heading icon="pulse-outline" title="Today so far" />
        </SectionHeading>

        {recap.isPending ? (
          <SkeletonCard lines={1} />
        ) : recap.isError ? (
          <ErrorState
            title="Numbers unavailable"
            message={errorMessage(recap.error)}
            onRetry={() => void recap.refetch()}
          />
        ) : (
          <View className="flex-row" style={{ gap: spacing.md }}>
            <StatTile
              icon="checkmark-done"
              value={recap.data?.completedTasks.length ?? 0}
              label="Done today"
            />
            <StatTile
              icon="hourglass-outline"
              value={recap.data?.pendingTasks.length ?? 0}
              label="Still open"
            />
          </View>
        )}
        {recap.data?.mood && recap.data.mood !== 'Not recorded' ? (
          <View className="mt-3 flex-row items-center" style={{ gap: spacing.sm }}>
            <Ionicons name="happy-outline" size={16} color={colors.muted} />
            <Text className="text-sm text-muted">Mood: {recap.data.mood}</Text>
          </View>
        ) : null}

        <SectionHeading>
          <Heading icon="journal-outline" title="Reflection" />
        </SectionHeading>

        {showReflectionInput ? (
          <View>
            <Input
              icon="chatbubble-outline"
              placeholder="How did the day feel?"
              value={reflectionText}
              onChangeText={(text) => setReflectionDraft({ key: reflectionKey, text })}
              multiline
              editable={!reflectionBusy}
            />
            <Button
              className="mt-3"
              label="Save reflection"
              icon="checkmark"
              size="md"
              loading={reflectionBusy}
              disabled={!reflectionText.trim()}
              onPress={() => void saveReflection()}
            />
          </View>
        ) : (
          <View>
            <Text className="text-[15px] leading-6 text-body">{reflectionText}</Text>
            <Button
              className="mt-2 self-start"
              label="Edit reflection"
              icon="create-outline"
              variant="ghost"
              size="sm"
              onPress={() => setEditingReflection(true)}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
