import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import type { Planner, Task } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import {
  useCreatePlanner,
  useDeletePlanner,
  usePlanners,
  useUpdatePlanner,
  useTasks,
} from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { addDays, dayLabel, todayIsoDate } from '@/lib/format';
import { selectFeedback, successFeedback, tapFeedback, warnFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default function PlanEditorScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ date?: string | string[] }>();

  const initialDate = useMemo(() => {
    const raw = Array.isArray(params.date) ? params.date[0] : params.date;
    return raw && ISO_DATE.test(raw) ? raw : todayIsoDate();
  }, [params.date]);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showPast, setShowPast] = useState(false);

  const planners = usePlanners();
  const existing = useMemo(
    () => planners.data?.find((item) => item.date.slice(0, 10) === selectedDate) ?? null,
    [planners.data, selectedDate],
  );

  const dayOptions = useMemo(() => {
    const start = showPast ? addDays(todayIsoDate(), -14) : todayIsoDate();
    return Array.from({ length: 14 }, (_, index) => addDays(start, index));
  }, [showPast]);

  function pickDate(iso: string) {
    selectFeedback();
    setSelectedDate(iso);
  }

  function togglePast() {
    selectFeedback();
    const next = !showPast;
    setShowPast(next);
    const start = next ? addDays(todayIsoDate(), -14) : todayIsoDate();
    const nextOptions = Array.from({ length: 14 }, (_, index) => addDays(start, index));
    if (!nextOptions.includes(selectedDate)) {
      setSelectedDate(nextOptions[nextOptions.length - 1] ?? todayIsoDate());
    }
  }

  return (
    <Screen contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
        >
          <Ionicons name="close" size={18} color={colors.heading} />
        </Pressable>
        <Chip label={existing ? 'Editing' : 'New day'} selected={Boolean(existing)} />
      </View>

      <ScreenHeader
        icon="create-outline"
        eyebrow="Plan"
        title={existing ? 'Edit your plan' : 'Plan a day'}
        subtitle="Set the focus, link the tasks, leave a note for later."
      />

      <View className="mt-5 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-body">Day</Text>
        <Chip label="Previous 14 days" selected={showPast} onPress={togglePast} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2"
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {dayOptions.map((iso) => (
          <Chip
            key={iso}
            label={dayLabel(iso)}
            selected={iso === selectedDate}
            onPress={() => pickDate(iso)}
          />
        ))}
      </ScrollView>

      {planners.isPending ? (
        <View className="mt-5" style={{ gap: 12 }}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={3} />
        </View>
      ) : planners.isError ? (
        <ErrorState
          title="Could not load your plans"
          message={errorMessage(planners.error)}
          onRetry={() => void planners.refetch()}
        />
      ) : (
        <PlanForm
          key={`${selectedDate}:${existing?.plannerId ?? 'new'}`}
          date={selectedDate}
          existing={existing}
        />
      )}
    </Screen>
  );
}

function PlanForm({ date, existing }: { date: string; existing: Planner | null }) {
  const colors = useThemeColors();
  const create = useCreatePlanner();
  const update = useUpdatePlanner();
  const remove = useDeletePlanner();
  const tasksQuery = useTasks({ completed: false });

  const [focusTasks, setFocusTasks] = useState<string[]>(existing?.focusTasks ?? []);
  const [reflection, setReflection] = useState(existing?.reflection ?? '');
  const [linked, setLinked] = useState<string[]>(existing?.tasks ?? []);
  const [focusDraft, setFocusDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openTasks = useMemo(
    () => tasksQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [tasksQuery.data],
  );

  const candidates = useMemo<Task[]>(() => {
    const known = new Set(openTasks.map((task) => task.taskId));
    const extras = (existing?.tasksDetails ?? []).filter(
      (task) => linked.includes(task.taskId) && !known.has(task.taskId),
    );
    return [...extras, ...openTasks];
  }, [openTasks, existing, linked]);

  function addFocus() {
    const value = focusDraft.trim();
    if (!value) return;
    setFocusDraft('');
    if (focusTasks.includes(value)) return;
    setFocusTasks((current) => [...current, value]);
    tapFeedback();
  }

  function removeFocus(index: number) {
    setFocusTasks((current) => current.filter((_, i) => i !== index));
    tapFeedback();
  }

  function toggleTask(taskId: string) {
    setLinked((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId],
    );
    tapFeedback();
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        await update.mutateAsync({
          plannerId: existing.plannerId,
          input: { date, focusTasks, tasks: linked, reflection },
        });
      } else {
        await create.mutateAsync({ date, focusTasks, tasks: linked, reflection });
      }
      successFeedback();
      router.back();
    } catch (failure) {
      setError(errorMessage(failure));
      setSaving(false);
    }
  }

  async function runDelete() {
    if (!existing) return;
    setDeleting(true);
    setError(null);
    try {
      await remove.mutateAsync(existing.plannerId);
      warnFeedback();
      router.back();
    } catch (failure) {
      setError(errorMessage(failure));
      setDeleting(false);
    }
  }

  function confirmDelete() {
    if (!existing) return;
    if (Platform.OS === 'web') {
      void runDelete();
      return;
    }
    Alert.alert('Delete plan', 'The focus, linked tasks and reflection for this day go with it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void runDelete() },
    ]);
  }

  return (
    <View className="mt-5">
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-heading">Focus</Text>
          <Text className="text-xs text-muted">
            {focusTasks.length} {focusTasks.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {focusTasks.length > 0 ? (
          <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
            {focusTasks.map((item, index) => (
              <Pressable
                key={`${index}-${item}`}
                onPress={() => removeFocus(index)}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel={`Remove focus ${item}`}
                className="flex-row items-center rounded-full bg-brand px-3 py-1.5 active:opacity-70"
                style={{ gap: 6 }}
              >
                <Text className="text-xs font-semibold text-on-brand">{item}</Text>
                <Ionicons name="close" size={13} color={colors.onBrand} />
              </Pressable>
            ))}
          </View>
        ) : (
          <Text className="mt-2 text-sm text-muted">No focus set for this day yet.</Text>
        )}

        <View className="mt-3 flex-row items-center" style={{ gap: 8 }}>
          <View className="flex-1">
            <Input
              placeholder="What matters most?"
              value={focusDraft}
              onChangeText={setFocusDraft}
              onSubmitEditing={addFocus}
              returnKeyType="done"
              editable={!saving}
            />
          </View>
          <Button
            label="Add"
            size="md"
            variant="secondary"
            disabled={!focusDraft.trim()}
            onPress={addFocus}
          />
        </View>
      </Card>

      <Card className="mt-3">
        <Input
          label="Reflection"
          placeholder="How did the day go?"
          value={reflection}
          onChangeText={setReflection}
          multiline
          editable={!saving}
        />
      </Card>

      <SectionHeading>
        <Text className="text-base font-bold text-heading">Linked tasks</Text>
      </SectionHeading>

      <Card padded={false} className="overflow-hidden rounded-2xl">
        {tasksQuery.isPending ? (
          <View className="p-4" style={{ gap: 12 }}>
            <Skeleton height={14} width="60%" />
            <Skeleton height={14} />
            <Skeleton height={14} width="80%" />
          </View>
        ) : tasksQuery.isError ? (
          <View className="p-4">
            <Text className="text-sm text-muted">Could not load your open tasks.</Text>
            <Pressable
              onPress={() => void tasksQuery.refetch()}
              accessibilityRole="button"
              accessibilityLabel="Retry loading open tasks"
              className="mt-2 active:opacity-70"
            >
              <Text className="text-sm font-semibold text-brand-ink">Try again</Text>
            </Pressable>
          </View>
        ) : candidates.length === 0 ? (
          <View className="p-4">
            <Text className="text-sm text-muted">No open tasks to link yet.</Text>
          </View>
        ) : (
          candidates.map((task, index) => {
            const selected = linked.includes(task.taskId);
            return (
              <Pressable
                key={task.taskId}
                onPress={() => toggleTask(task.taskId)}
                disabled={saving}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled: saving }}
                accessibilityLabel={task.title}
                className={`flex-row items-center px-4 py-3 active:opacity-70 ${
                  index < candidates.length - 1 ? 'border-b border-border' : ''
                }`}
                style={{ gap: 12 }}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-md border ${
                    selected ? 'border-brand-ink bg-brand' : 'border-border'
                  }`}
                >
                  {selected ? <Ionicons name="checkmark" size={13} color={colors.onBrand} /> : null}
                </View>
                <Text numberOfLines={1} className="flex-1 text-sm text-heading">
                  {task.title}
                </Text>
                {task.category ? <Chip label={task.category} /> : null}
              </Pressable>
            );
          })
        )}
      </Card>

      <Text className="mt-2 text-xs text-muted">
        {linked.length} {linked.length === 1 ? 'task linked' : 'tasks linked'}
      </Text>

      {error ? (
        <View className="mt-4">
          <FormError message={error} />
        </View>
      ) : null}

      <View className="mt-5" style={{ gap: 8 }}>
        <Button
          label="Save plan"
          icon="checkmark"
          loading={saving}
          disabled={deleting}
          onPress={() => void save()}
        />
        {existing ? (
          <Button
            label="Delete plan"
            variant="danger"
            icon="trash"
            loading={deleting}
            disabled={saving}
            onPress={confirmDelete}
          />
        ) : null}
      </View>
    </View>
  );
}
