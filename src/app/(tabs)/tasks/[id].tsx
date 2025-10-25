import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { SubtaskGroup } from '@/lib/api';
import { TaskCheckbox } from '@/components/domain/task-checkbox';
import {
  EMPTY_DRAFT,
  TaskFields,
  draftFromTask,
  draftToPatch,
  type TaskDraft,
} from '@/components/domain/task-fields';
import { AppBar, IconButton } from '@/components/ui/app-bar';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { useDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Screen } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import { createdFromLabel } from '@/constants/tasks';
import {
  useCategorizeTask,
  useDeleteSubtask,
  useDeleteTask,
  useGenerateSubtasks,
  useRewriteTaskTitle,
  useSubtasks,
  useTask,
  useToggleSubtask,
  useToggleTask,
  useUpdateTask,
} from '@/lib/api';
import { errorMessage, friendlyErrorMessage, isNotFound } from '@/lib/errors';
import { formatDueDate, isOverdue, relativeTime } from '@/lib/format';
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type Status = { tone: 'error' | 'success'; text: string };

function SubtaskGroupRow({
  group,
  busy,
  onToggle,
  onDelete,
}: {
  group: SubtaskGroup;
  busy: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const colors = useThemeColors();
  const done = Boolean(group.done);
  const steps = group.subTasks ?? [];

  return (
    <View className="border-b border-border py-3">
      <View className="flex-row items-center" style={{ gap: spacing.md }}>
        <TaskCheckbox
          checked={done}
          busy={busy}
          onPress={onToggle}
          accessibilityLabel={done ? 'Reopen these steps' : 'Mark these steps as done'}
        />
        <View className="flex-1">
          <Text
            className={`text-[15px] font-medium ${done ? 'text-muted line-through' : 'text-heading'}`}
          >
            {group.title ?? 'Steps'}
          </Text>
          <Text className="mt-0.5 text-xs text-muted">
            {steps.length} {steps.length === 1 ? 'step' : 'steps'}
          </Text>
        </View>
        <IconButton
          icon="trash-outline"
          size={18}
          color={colors.muted}
          accessibilityLabel="Delete these steps"
          onPress={onDelete}
        />
      </View>

      {steps.map((step, index) => (
        <View
          key={`${index}-${step}`}
          className="mt-2 flex-row items-start"
          style={{ gap: spacing.md, paddingLeft: 36 }}
        >
          <Text className="w-4 text-xs font-bold text-brand-ink">{index + 1}</Text>
          <Text className="flex-1 text-sm leading-5 text-body">{step}</Text>
        </View>
      ))}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  tone = 'default',
  onPress,
}: {
  icon: IconName;
  label: string;
  value: string;
  tone?: 'default' | 'danger' | 'muted';
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  const color =
    tone === 'danger' ? colors.dangerInk : tone === 'muted' ? colors.muted : colors.heading;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className="min-h-14 flex-row items-center border-b border-border py-3 active:bg-surface-alt"
      style={{ gap: spacing.lg }}
    >
      <Ionicons name={icon} size={20} color={colors.muted} />
      <View className="flex-1">
        <Text className="text-xs text-muted">{label}</Text>
        <Text className="mt-0.5 text-[15px]" style={{ color }}>
          {value}
        </Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.muted} /> : null}
    </Pressable>
  );
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { confirm } = useDialog();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const taskId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const task = useTask(taskId);
  const subtasks = useSubtasks(taskId);
  const toggleTask = useToggleTask();
  const updateTask = useUpdateTask();
  const removeTask = useDeleteTask();
  const rewriteTitle = useRewriteTaskTitle();
  const categorize = useCategorizeTask();
  const generateSubtasks = useGenerateSubtasks(taskId);
  const toggleSubtask = useToggleSubtask(taskId);
  const removeSubtask = useDeleteSubtask(taskId);

  const [status, setStatus] = useState<Status | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft>(EMPTY_DRAFT);

  const current = task.data;
  const done = Boolean(current?.isCompleted);
  const due = formatDueDate(current?.dueDate);
  const late = !done && isOverdue(current?.dueDate);
  const aiBusy = rewriteTitle.isPending || categorize.isPending || generateSubtasks.isPending;
  const canSplit = Boolean(current?.description) && !aiBusy;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/tasks');
  }

  function openEdit() {
    if (!current) return;
    setDraft(draftFromTask(current));
    setStatus(null);
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!current) return;
    if (!draft.title.trim()) {
      setStatus({ tone: 'error', text: 'Give the task a title first.' });
      return;
    }

    const patch = draftToPatch(draft, current);
    if (Object.keys(patch).length === 0) {
      setEditOpen(false);
      return;
    }

    try {
      await updateTask.mutateAsync({ taskId, input: patch });
      setEditOpen(false);
      setStatus({ tone: 'success', text: 'Task updated.' });
    } catch (failure) {
      setStatus({ tone: 'error', text: friendlyErrorMessage(failure, 'task') });
    }
  }

  async function runAi(action: () => Promise<string>, describe: (result: string) => string) {
    setStatus(null);
    try {
      setStatus({ tone: 'success', text: describe(await action()) });
    } catch (failure) {
      setStatus({ tone: 'error', text: friendlyErrorMessage(failure, 'ai') });
    }
  }

  function splitIntoSteps() {
    void runAi(
      () => generateSubtasks.mutateAsync(undefined).then((group) => group.title ?? 'Steps'),
      (title) => `Added "${title}".`,
    );
  }

  async function confirmDeleteTask() {
    const ok = await confirm({
      title: 'Delete task',
      message: `"${current?.title ?? 'This task'}" and its steps will be removed for good.`,
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    removeTask.mutate(taskId, {
      onSuccess: goBack,
      onError: (failure) =>
        setStatus({ tone: 'error', text: friendlyErrorMessage(failure, 'task') }),
    });
  }

  async function confirmDeleteSteps(group: SubtaskGroup) {
    const ok = await confirm({
      title: 'Delete steps',
      message: `"${group.title ?? 'These steps'}" will be removed.`,
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok) removeSubtask.mutate(group.subtaskId);
  }

  const back = <BackButton fallback="/tasks" />;

  if (task.isPending || task.isError || !current) {
    const gone = task.isError && isNotFound(task.error);
    return (
      <Screen scroll={false}>
        <AppBar left={back} brand={false} title="Task" />
        <View style={{ paddingHorizontal: layout.gutter }}>
          {task.isPending ? (
            <SkeletonCard lines={3} />
          ) : (
            <ErrorState
              title="Could not open this task"
              message={gone ? 'This task no longer exists.' : errorMessage(task.error)}
              onRetry={gone ? undefined : () => void task.refetch()}
            />
          )}
        </View>
      </Screen>
    );
  }

  const source = createdFromLabel(current.createdFrom);
  const created = relativeTime(current.createdAt) ?? 'just now';
  const groups = subtasks.data ?? [];

  return (
    <Screen scroll={false}>
      <AppBar
        left={back}
        brand={false}
        title="Task"
        actions={[
          { icon: 'create-outline', accessibilityLabel: 'Edit task', onPress: openEdit },
          {
            icon: 'ellipsis-vertical',
            accessibilityLabel: 'More actions',
            onPress: () => setMoreOpen(true),
          },
        ]}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className={`text-2xl font-bold tracking-tight ${
            done ? 'text-muted line-through' : 'text-heading'
          }`}
        >
          {current.title}
        </Text>
        <Text className="mt-1 text-sm text-muted">
          {source ? `${source} · ${created}` : `Added ${created}`}
        </Text>

        <Button
          className="mt-4"
          label={done ? 'Mark as not done' : 'Mark as done'}
          icon={done ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
          variant={done ? 'secondary' : 'primary'}
          size="md"
          loading={toggleTask.isPending}
          onPress={() => toggleTask.mutate({ taskId, isCompleted: !done })}
        />

        {aiBusy ? (
          <View className="mt-4 flex-row items-center" style={{ gap: spacing.sm }}>
            <ActivityIndicator size="small" color={colors.brandInk} />
            <Text className="text-sm text-muted">Kova is working on it…</Text>
          </View>
        ) : null}

        {status && !editOpen ? (
          <View className="mt-4">
            {status.tone === 'error' ? (
              <FormError message={status.text} />
            ) : (
              <View className="flex-row items-center" style={{ gap: spacing.sm }}>
                <Ionicons name="checkmark-circle" size={18} color={colors.successInk} />
                <Text className="flex-1 text-sm text-body">{status.text}</Text>
              </View>
            )}
          </View>
        ) : null}

        <View className="mt-4">
          <DetailRow
            icon={done ? 'checkmark-circle-outline' : 'ellipse-outline'}
            label="Status"
            value={done ? 'Done' : 'Open'}
          />
          <DetailRow
            icon={late ? 'alert-circle-outline' : 'calendar-outline'}
            label="Due date"
            value={due ? (late ? `Overdue · ${due}` : due) : 'No due date'}
            tone={late ? 'danger' : due ? 'default' : 'muted'}
            onPress={openEdit}
          />
          <DetailRow
            icon="pricetag-outline"
            label="Category"
            value={current.category || 'No category'}
            tone={current.category ? 'default' : 'muted'}
            onPress={openEdit}
          />
          <DetailRow
            icon="document-text-outline"
            label="Details"
            value={current.description || 'Add details so Kova can split this into steps'}
            tone={current.description ? 'default' : 'muted'}
            onPress={openEdit}
          />
        </View>

        <SectionHeading
          action={
            current.description ? (
              <Button
                label={generateSubtasks.isPending ? 'Splitting' : 'Split into steps'}
                icon="sparkles-outline"
                variant="ghost"
                size="sm"
                disabled={!canSplit}
                onPress={splitIntoSteps}
              />
            ) : undefined
          }
        >
          <View className="flex-row items-center" style={{ gap: spacing.sm }}>
            <Ionicons name="list-outline" size={18} color={colors.heading} />
            <Text className="text-base font-semibold text-heading">Steps</Text>
          </View>
        </SectionHeading>

        {!current.description ? (
          <EmptyState
            icon="list-outline"
            title="No steps yet"
            description="Add details first, then Kova can break it into steps."
            actionLabel="Add details"
            onAction={openEdit}
            className="py-6"
          />
        ) : subtasks.isPending ? (
          <SkeletonCard lines={2} />
        ) : subtasks.isError ? (
          <ErrorState
            title="Could not load the steps"
            message={errorMessage(subtasks.error)}
            onRetry={() => void subtasks.refetch()}
          />
        ) : groups.length === 0 ? (
          <EmptyState
            icon="sparkles-outline"
            title="No steps yet"
            description="Let Kova turn the details into ordered steps."
            actionLabel="Split into steps"
            onAction={splitIntoSteps}
            className="py-6"
          />
        ) : (
          groups.map((group, index) => (
            <Animated.View
              key={group.subtaskId}
              entering={FadeInDown.duration(220).delay(index * 40)}
            >
              <SubtaskGroupRow
                group={group}
                busy={toggleSubtask.isPending}
                onToggle={() =>
                  toggleSubtask.mutate({ subtaskId: group.subtaskId, done: !group.done })
                }
                onDelete={() => void confirmDeleteSteps(group)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      <Sheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={current.title}
        actions={[
          { icon: 'create-outline', label: 'Edit task', onPress: openEdit },
          {
            icon: 'sparkles-outline',
            label: 'Rewrite title with AI',
            disabled: aiBusy,
            onPress: () =>
              void runAi(
                () => rewriteTitle.mutateAsync(taskId),
                (title) => `Title is now "${title}".`,
              ),
          },
          {
            icon: 'pricetag-outline',
            label: 'Pick category with AI',
            disabled: aiBusy,
            onPress: () =>
              void runAi(
                () => categorize.mutateAsync(taskId),
                (category) => `Filed under ${category}.`,
              ),
          },
          {
            icon: 'list-outline',
            label: 'Split into steps',
            subtitle: current.description ? undefined : 'Add details first',
            disabled: !canSplit,
            onPress: splitIntoSteps,
          },
          {
            icon: 'trash-outline',
            label: 'Delete task',
            destructive: true,
            disabled: removeTask.isPending,
            onPress: () => void confirmDeleteTask(),
          },
        ]}
      />

      <Sheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit task"
        subtitle="Only what you change is saved."
        icon="create-outline"
      >
        {status?.tone === 'error' ? <FormError message={status.text} /> : null}
        <TaskFields
          draft={draft}
          onChange={(patch) => setDraft((value) => ({ ...value, ...patch }))}
          disabled={updateTask.isPending}
        />

        <View className="mt-6 flex-row" style={{ gap: spacing.sm }}>
          <Button
            className="flex-1"
            label="Save"
            icon="checkmark"
            size="md"
            loading={updateTask.isPending}
            onPress={() => void saveEdit()}
          />
          <Button
            className="flex-1"
            label="Cancel"
            variant="secondary"
            size="md"
            disabled={updateTask.isPending}
            onPress={() => setEditOpen(false)}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
