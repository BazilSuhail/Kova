import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Task } from '@/api/types';
import { TaskRow } from '@/components/domain/task-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useDailyRecap } from '@/hooks/queries/dashboard';
import {
  useCreatePlanner,
  useTodayPlanner,
  useUpcomingReminders,
  useUpdatePlanner,
  useUpdatePlannerFocus,
} from '@/hooks/queries/plan';
import { useToggleTask } from '@/hooks/queries/tasks';
import { errorMessage } from '@/lib/errors';
import { todayIsoDate } from '@/lib/format';
import { successFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';

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
  const [reflectionDraft, setReflectionDraft] = useState<{ key: string; text: string } | null>(null);
  const [editingReflection, setEditingReflection] = useState(false);
  const [reflectionBusy, setReflectionBusy] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const reflectionKey = planner?.plannerId ?? 'none';
  const reflectionText =
    reflectionDraft?.key === reflectionKey ? reflectionDraft.text : (planner?.reflection ?? '');
  const showReflectionInput = editingReflection || !planner?.reflection;
  const upcomingCount = upcoming.data?.length ?? 0;

  const calendarButton = (
    <Pressable
      onPress={() => router.push('/plan/calendar')}
      accessibilityRole="button"
      accessibilityLabel="Open calendar"
      className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
      <Ionicons name="calendar-outline" size={20} color={colors.text} />
    </Pressable>
  );

  async function changeFocus(next: string[]) {
    if (!planner) return;
    setFocusBusy(true);
    setFormError(null);
    try {
      await updateFocus.mutateAsync({ plannerId: planner.plannerId, focusTasks: next });
      successFeedback();
    } catch (failure) {
      setFormError(errorMessage(failure));
    } finally {
      setFocusBusy(false);
    }
  }

  function addFocus() {
    const value = focusDraft.trim();
    if (!planner || !value) return;
    setFocusDraft('');
    if (planner.focusTasks.includes(value)) return;
    void changeFocus([...planner.focusTasks, value]);
  }

  function toggle(task: Task) {
    setBusyTaskId(task.taskId);
    toggleTask.mutate(
      { taskId: task.taskId, isCompleted: !task.isCompleted },
      { onSettled: () => setBusyTaskId(null) },
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
        // A reflection needs a plan to live on, so the first save creates today's.
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

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader eyebrow="Plan" title="Your day" right={calendarButton} />
        <View className="mt-6" style={{ gap: 12 }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ScreenHeader eyebrow="Plan" title="Your day" right={calendarButton} />
        <ErrorState
          title="Could not load your plan"
          message={errorMessage(error)}
          onRetry={refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader
        eyebrow="Plan"
        title="Your day"
        subtitle="A few honest priorities beat a long list."
        right={calendarButton}
      />

      {formError ? (
        <View className="mt-4">
          <FormError message={formError} />
        </View>
      ) : null}

      {planner ? (
        <>
          <SectionHeading
            action={
              <Pressable
                onPress={() => router.push('/plan/editor')}
                accessibilityRole="button"
                accessibilityLabel="Edit today's plan">
                <Text className="text-sm font-semibold text-violet-600 dark:text-violet-400">Edit</Text>
              </Pressable>
            }>
            <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Focus</Text>
          </SectionHeading>

          <View className="rounded-3xl bg-violet-600 p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">Today&apos;s focus</Text>
              <Ionicons name="flash" size={18} color={colors.onPrimary} />
            </View>

            {planner.focusTasks.length === 0 ? (
              <Text className="mt-3 text-sm text-violet-100">
                Pick the one thing that would make today count.
              </Text>
            ) : (
              <View className="mt-3" style={{ gap: 10 }}>
                {planner.focusTasks.map((item, index) => (
                  <View key={`${index}-${item}`} className="flex-row items-start" style={{ gap: 10 }}>
                    <Text className="w-5 text-sm font-bold text-violet-200">{index + 1}</Text>
                    <Text className="flex-1 text-sm text-white">{item}</Text>
                    <Pressable
                      onPress={() =>
                        void changeFocus(planner.focusTasks.filter((_, i) => i !== index))
                      }
                      disabled={focusBusy}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove focus ${item}`}
                      className="active:opacity-70">
                      <Ionicons name="close-circle" size={17} color={colors.onPrimary} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <View className="mt-4 flex-row items-center" style={{ gap: 8 }}>
              <View className="flex-1">
                <Input
                  placeholder="Add a focus"
                  value={focusDraft}
                  onChangeText={setFocusDraft}
                  onSubmitEditing={addFocus}
                  returnKeyType="done"
                  editable={!focusBusy}
                />
              </View>
              <Button
                label="Add"
                size="md"
                variant="secondary"
                disabled={!focusDraft.trim()}
                loading={focusBusy}
                onPress={addFocus}
              />
            </View>
          </View>

          <SectionHeading
            action={
              <Pressable
                onPress={() => router.push('/plan/editor')}
                accessibilityRole="button"
                accessibilityLabel="Link tasks to the plan">
                <Text className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  Manage
                </Text>
              </Pressable>
            }>
            <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
              Linked tasks
            </Text>
          </SectionHeading>

          {planner.tasksDetails.length > 0 ? (
            <View style={{ gap: 8 }}>
              {planner.tasksDetails.map((task) => (
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
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                No tasks linked to today yet. Add a few to keep the plan grounded.
              </Text>
            </Card>
          )}
        </>
      ) : (
        <Card className="mt-5">
          <EmptyState
            icon="calendar-outline"
            title="No plan for today"
            description="Start with a single focus and let the rest follow."
            actionLabel="Plan my day"
            onAction={() => router.push('/plan/editor')}
            className="py-6"
          />
        </Card>
      )}

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Reflection</Text>
      </SectionHeading>

      <Card>
        {showReflectionInput ? (
          <View>
            <Input
              placeholder="How did the day feel?"
              value={reflectionText}
              onChangeText={(text) => setReflectionDraft({ key: reflectionKey, text })}
              multiline
              editable={!reflectionBusy}
            />
            <Button
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
            <Text className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              {reflectionText}
            </Text>
            <Pressable
              onPress={() => setEditingReflection(true)}
              accessibilityRole="button"
              accessibilityLabel="Edit reflection"
              className="mt-3 flex-row items-center active:opacity-70">
              <Ionicons name="pencil" size={14} color={colors.primary} />
              <Text className="ml-1 text-sm font-semibold text-violet-600 dark:text-violet-400">
                Edit reflection
              </Text>
            </Pressable>
          </View>
        )}
      </Card>

      <SectionHeading
        action={
          <Pressable
            onPress={() => router.push('/plan/weekly-recap')}
            accessibilityRole="button"
            accessibilityLabel="See weekly recap"
            className="flex-row items-center active:opacity-70">
            <Text className="text-sm font-semibold text-violet-600 dark:text-violet-400">
              See weekly recap
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </Pressable>
        }>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Today&apos;s numbers</Text>
      </SectionHeading>

      {recap.isPending ? (
        <SkeletonCard lines={1} />
      ) : recap.isError ? (
        <Card>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Today&apos;s numbers are unavailable right now.
          </Text>
          <Pressable
            onPress={() => void recap.refetch()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading today's numbers"
            className="mt-2 active:opacity-70">
            <Text className="text-sm font-semibold text-violet-600 dark:text-violet-400">Try again</Text>
          </Pressable>
        </Card>
      ) : (
        <Card>
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950">
              <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {recap.data?.completedTasks.length ?? 0}
              </Text>
              <Text className="text-xs text-slate-600 dark:text-slate-400">completed</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
              <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {recap.data?.pendingTasks.length ?? 0}
              </Text>
              <Text className="text-xs text-slate-600 dark:text-slate-400">pending</Text>
            </View>
          </View>
          {recap.data?.mood && recap.data.mood !== 'Not recorded' ? (
            <Text className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Mood: {recap.data.mood}
            </Text>
          ) : null}
        </Card>
      )}

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Keep going</Text>
      </SectionHeading>

      <Card padded={false} className="overflow-hidden rounded-2xl">
        <Row
          title="Calendar"
          subtitle="Day, week and month views"
          icon="calendar-outline"
          onPress={() => router.push('/plan/calendar')}
        />
        <Row
          title="Reminders"
          subtitle={
            upcomingCount > 0
              ? `${upcomingCount} in the next 48 hours`
              : 'Nothing scheduled soon'
          }
          icon="alarm-outline"
          onPress={() => router.push('/plan/reminders')}
        />
        <Row
          title="Weekly recap"
          subtitle="See how the week went"
          icon="stats-chart"
          onPress={() => router.push('/plan/weekly-recap')}
          last
        />
      </Card>
    </Screen>
  );
}
