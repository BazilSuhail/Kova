import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { Planner, Task } from '@/lib/api';
import { AppBar, IconButton } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { useDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
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
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/plan');
}

function Heading({ icon, title, meta }: { icon: IconName; title: string; meta?: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 flex-row items-center" style={{ gap: spacing.sm }}>
      <Ionicons name={icon} size={18} color={colors.heading} />
      <Text className="flex-1 text-base font-semibold text-heading">{title}</Text>
      {meta ? <Text className="text-xs text-muted">{meta}</Text> : null}
    </View>
  );
}

export default function PlanEditorScreen() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();

  const initialDate = useMemo(() => {
    const raw = Array.isArray(params.date) ? params.date[0] : params.date;
    return raw && ISO_DATE.test(raw) ? raw : todayIsoDate();
  }, [params.date]);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showPast, setShowPast] = useState(() => initialDate < todayIsoDate());

  const planners = usePlanners();
  const existing = useMemo(
    () => planners.data?.find((item) => item.date.slice(0, 10) === selectedDate) ?? null,
    [planners.data, selectedDate],
  );

  const dayOptions = useMemo(() => {
    const start = showPast ? addDays(todayIsoDate(), -14) : todayIsoDate();
    const options = Array.from({ length: 14 }, (_, index) => addDays(start, index));
    // Keep a date opened from the calendar selectable even when it is outside the window.
    return options.includes(selectedDate) ? options : [selectedDate, ...options];
  }, [showPast, selectedDate]);

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
    <Screen scroll={false}>
      <AppBar
        left={<IconButton icon="close" accessibilityLabel="Close" onPress={close} />}
        brand={false}
        title={existing ? 'Edit plan' : 'Plan a day'}
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
          <Chip
            label={showPast ? 'Upcoming days' : 'Past days'}
            icon={showPast ? 'arrow-forward' : 'arrow-back'}
            onPress={togglePast}
          />
          {dayOptions.map((iso) => (
            <Chip
              key={iso}
              label={dayLabel(iso)}
              selected={iso === selectedDate}
              onPress={() => pickDate(iso)}
            />
          ))}
        </ScrollView>
      </View>

      {planners.isPending ? (
        <View style={{ padding: layout.gutter, gap: spacing.md }}>
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
  const { confirm } = useDialog();
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
    // A typed-but-not-added focus is almost always meant to be saved.
    const pending = focusDraft.trim();
    const focus = pending && !focusTasks.includes(pending) ? [...focusTasks, pending] : focusTasks;
    try {
      if (existing) {
        await update.mutateAsync({
          plannerId: existing.plannerId,
          input: { date, focusTasks: focus, tasks: linked, reflection },
        });
      } else {
        await create.mutateAsync({ date, focusTasks: focus, tasks: linked, reflection });
      }
      successFeedback();
      close();
    } catch (failure) {
      setError(errorMessage(failure));
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!existing) return;
    const ok = await confirm({
      title: 'Delete plan',
      message: 'The focus, linked tasks and reflection for this day go with it.',
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    setError(null);
    try {
      await remove.mutateAsync(existing.plannerId);
      warnFeedback();
      close();
    } catch (failure) {
      setError(errorMessage(failure));
      setDeleting(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <SectionHeading className="mt-4">
        <Heading
          icon="flag-outline"
          title="Focus"
          meta={`${focusTasks.length} ${focusTasks.length === 1 ? 'item' : 'items'}`}
        />
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
          placeholder="What matters most?"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          blurOnSubmit={false}
          editable={!saving}
          accessibilityLabel="Add a focus"
          className="flex-1 py-3 text-base text-heading"
        />
        {focusDraft.trim() ? (
          <IconButton
            icon="arrow-up-circle"
            size={28}
            color={colors.brandInk}
            accessibilityLabel="Add focus"
            onPress={addFocus}
          />
        ) : null}
      </View>

      {focusTasks.map((item, index) => (
        <Animated.View key={`${index}-${item}`} entering={FadeInDown.duration(220)}>
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
              onPress={() => removeFocus(index)}
            />
          </View>
        </Animated.View>
      ))}

      <SectionHeading>
        <Heading
          icon="link-outline"
          title="Linked tasks"
          meta={`${linked.length} linked`}
        />
      </SectionHeading>

      {tasksQuery.isPending ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton height={14} width="60%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="80%" />
        </View>
      ) : tasksQuery.isError ? (
        <ErrorState
          title="Could not load your open tasks"
          message={errorMessage(tasksQuery.error)}
          onRetry={() => void tasksQuery.refetch()}
        />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon="checkbox-outline"
          title="No open tasks"
          description="Add tasks first, then link them here."
          actionLabel="Go to tasks"
          onAction={() => router.navigate('/tasks')}
          className="py-6"
        />
      ) : (
        candidates.map((task, index) => {
          const selected = linked.includes(task.taskId);
          return (
            <Animated.View
              key={task.taskId}
              entering={FadeInDown.duration(220).delay(Math.min(index, 10) * 40)}
            >
              <Pressable
                onPress={() => toggleTask(task.taskId)}
                disabled={saving}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled: saving }}
                accessibilityLabel={task.title}
                className="min-h-14 flex-row items-center border-b border-border py-3 active:bg-surface-alt"
                style={{ gap: spacing.md }}
              >
                <Ionicons
                  name={selected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={selected ? colors.brandInk : colors.muted}
                />
                <Text numberOfLines={1} className="flex-1 text-[15px] text-heading">
                  {task.title}
                </Text>
                {task.category ? (
                  <Text className="text-xs text-muted">{task.category}</Text>
                ) : null}
              </Pressable>
            </Animated.View>
          );
        })
      )}

      <SectionHeading>
        <Heading icon="journal-outline" title="Reflection" />
      </SectionHeading>

      <Input
        icon="chatbubble-outline"
        placeholder="How did the day go?"
        value={reflection}
        onChangeText={setReflection}
        multiline
        editable={!saving}
      />

      {error ? (
        <View className="mt-4">
          <FormError message={error} />
        </View>
      ) : null}

      <View className="mt-6" style={{ gap: spacing.sm }}>
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
            icon="trash-outline"
            loading={deleting}
            disabled={saving}
            onPress={() => void confirmDelete()}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}
