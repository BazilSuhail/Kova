import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ErrorState } from '@/components/ui/error-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import { BackButton } from '@/components/ui/back-button';
import { categoryInkClass, categoryToneClass, createdFromLabel } from '@/constants/tasks';
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
import { errorMessage, isNotFound } from '@/lib/errors';
import { formatDueDate, isOverdue, relativeTime } from '@/lib/format';
import { useThemeColors } from '@/config/theme';

type Status = { tone: 'error' | 'success'; text: string };

function SubtaskGroupCard({
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
    <Card padded={false} className="overflow-hidden rounded-2xl">
      <View className="flex-row items-center px-4 py-3" style={{ gap: 12 }}>
        <TaskCheckbox
          checked={done}
          busy={busy}
          onPress={onToggle}
          accessibilityLabel={done ? 'Reopen these steps' : 'Mark these steps as done'}
        />
        <View className="flex-1">
          <Text
            className={`text-sm font-semibold ${done ? 'text-muted line-through' : 'text-heading'}`}
          >
            {group.title ?? 'Steps'}
          </Text>
          <Text className="mt-0.5 text-xs text-muted">
            {steps.length} {steps.length === 1 ? 'step' : 'steps'}
          </Text>
        </View>
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Delete these steps"
          className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
        >
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </Pressable>
      </View>

      {steps.map((step, index) => (
        <View
          key={`${index}-${step}`}
          className="flex-row items-start border-t border-border px-4 py-3"
          style={{ gap: 10 }}
        >
          <Text className="text-xs font-bold text-brand-ink">{index + 1}</Text>
          <Text className="flex-1 text-sm leading-5 text-body">{step}</Text>
        </View>
      ))}
    </Card>
  );
}

export default function TaskDetailScreen() {
  const router = useRouter();
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
  const [draft, setDraft] = useState<TaskDraft>(EMPTY_DRAFT);

  const current = task.data;
  const done = Boolean(current?.isCompleted);
  const due = formatDueDate(current?.dueDate);
  const late = !done && isOverdue(current?.dueDate);
  const aiBusy = rewriteTitle.isPending || categorize.isPending;

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
      setStatus({ tone: 'error', text: errorMessage(failure) });
    }
  }

  async function runAi(action: () => Promise<string>, describe: (result: string) => string) {
    setStatus(null);
    try {
      setStatus({ tone: 'success', text: describe(await action()) });
    } catch (failure) {
      setStatus({ tone: 'error', text: errorMessage(failure) });
    }
  }

  function confirmDeleteTask() {
    removeTask.mutate(taskId, { onSuccess: goBack });
  }

  const back = <BackButton fallback="/tasks" />;

  if (task.isPending) {
    return (
      <Screen contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-4">{back}</View>
        <SkeletonCard lines={3} />
      </Screen>
    );
  }

  if (task.isError || !current) {
    const gone = isNotFound(task.error);

    return (
      <Screen contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-4">{back}</View>
        <ErrorState
          title="Could not open this task"
          message={gone ? 'This task no longer exists.' : errorMessage(task.error)}
          onRetry={gone ? undefined : () => void task.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-4 flex-row items-center justify-between">
        {back}
        <Chip label={done ? 'Completed' : 'Open'} selected={done} />
      </View>

      <ScreenHeader
        icon="document-text-outline"
        eyebrow="Task"
        title={current.title}
        subtitle={
          createdFromLabel(current.createdFrom)
            ? `${createdFromLabel(current.createdFrom)} · ${relativeTime(current.createdAt) ?? 'just now'}`
            : (relativeTime(current.createdAt) ?? undefined)
        }
      />

      <Card className="mt-5">
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <TaskCheckbox
            checked={done}
            busy={toggleTask.isPending}
            onPress={() => toggleTask.mutate({ taskId, isCompleted: !done })}
            accessibilityLabel={done ? 'Reopen this task' : 'Complete this task'}
          />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-heading">
              {done ? 'Done' : 'Still open'}
            </Text>
            <Text className="mt-0.5 text-xs text-muted">{due ? `Due ${due}` : 'No due date'}</Text>
          </View>
          {late ? <Chip label="Overdue" /> : null}
        </View>

        <View className="mt-4 flex-row flex-wrap items-center" style={{ gap: 8 }}>
          {current.category ? (
            <View className={`rounded-full px-3 py-1.5 ${categoryToneClass(current.category)}`}>
              <Text className={`text-xs font-semibold ${categoryInkClass(current.category)}`}>
                {current.category}
              </Text>
            </View>
          ) : (
            <Chip label="No category" />
          )}
        </View>

        {current.description ? (
          <Text className="mt-4 text-sm leading-6 text-muted">{current.description}</Text>
        ) : (
          <Text className="mt-4 text-sm text-muted">
            No details yet. A description also lets Kova split this into steps.
          </Text>
        )}
      </Card>

      {status ? (
        <View
          className={`mt-4 rounded-2xl p-3 ${
            status.tone === 'error' ? 'bg-surface-alt' : 'bg-surface-alt'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              status.tone === 'error' ? 'text-danger-ink' : 'text-brand-ink'
            }`}
          >
            {status.text}
          </Text>
        </View>
      ) : null}

      <SectionHeading>
        <Text className="text-base font-bold text-heading">Actions</Text>
      </SectionHeading>

      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        <Button label="Edit" variant="secondary" size="sm" icon="pencil" onPress={openEdit} />
        <Button
          label="Rewrite title"
          variant="secondary"
          size="sm"
          icon="sparkles"
          loading={rewriteTitle.isPending}
          disabled={aiBusy}
          onPress={() =>
            void runAi(
              () => rewriteTitle.mutateAsync(taskId),
              (title) => `Title is now "${title}".`,
            )
          }
        />
        <Button
          label="Re-categorize"
          variant="secondary"
          size="sm"
          icon="pricetag-outline"
          loading={categorize.isPending}
          disabled={aiBusy}
          onPress={() =>
            void runAi(
              () => categorize.mutateAsync(taskId),
              (category) => `Filed under ${category}.`,
            )
          }
        />
      </View>

      <SectionHeading
        action={
          <Pressable
            onPress={() =>
              void runAi(
                () =>
                  generateSubtasks.mutateAsync(undefined).then((group) => group.title ?? 'Steps'),
                (title) => `Added "${title}".`,
              )
            }
            disabled={generateSubtasks.isPending || !current.description}
            accessibilityRole="button"
          >
            <Text
              className={`text-sm font-semibold ${
                !current.description || generateSubtasks.isPending ? 'text-muted' : 'text-brand-ink'
              }`}
            >
              {generateSubtasks.isPending ? 'Splitting' : 'Split into steps'}
            </Text>
          </Pressable>
        }
      >
        <Text className="text-base font-bold text-heading">Steps</Text>
      </SectionHeading>

      {!current.description ? (
        <Card>
          <Text className="text-sm text-muted">
            Add a description, then Kova can break this task into ordered steps.
          </Text>
        </Card>
      ) : subtasks.isPending ? (
        <SkeletonCard lines={2} />
      ) : subtasks.isError ? (
        <ErrorState
          title="Could not load the steps"
          message={errorMessage(subtasks.error)}
          onRetry={() => void subtasks.refetch()}
        />
      ) : (subtasks.data ?? []).length === 0 ? (
        <Card>
          <Text className="text-sm text-muted">
            No steps yet. Use “Split into steps” to generate them from the description.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: 8 }}>
          {(subtasks.data ?? []).map((group) => (
            <SubtaskGroupCard
              key={group.subtaskId}
              group={group}
              busy={toggleSubtask.isPending}
              onToggle={() =>
                toggleSubtask.mutate({ subtaskId: group.subtaskId, done: !group.done })
              }
              onDelete={() => removeSubtask.mutate(group.subtaskId)}
            />
          ))}
        </View>
      )}

      <View className="mt-8">
        <Button
          label="Delete task"
          variant="danger"
          icon="trash"
          loading={removeTask.isPending}
          onPress={confirmDeleteTask}
        />
      </View>

      <Sheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit task"
        subtitle="Only what you change is sent."
      >
        <ScrollView
          style={{ maxHeight: 460 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TaskFields
            draft={draft}
            onChange={(patch) => setDraft((value) => ({ ...value, ...patch }))}
            disabled={updateTask.isPending}
          />

          <View className="mt-2 flex-row" style={{ gap: 8 }}>
            <View className="flex-1">
              <Button label="Save" loading={updateTask.isPending} onPress={() => void saveEdit()} />
            </View>
            <View className="flex-1">
              <Button
                label="Cancel"
                variant="secondary"
                disabled={updateTask.isPending}
                onPress={() => setEditOpen(false)}
              />
            </View>
          </View>
        </ScrollView>
      </Sheet>
    </Screen>
  );
}
