import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import type { Task } from '@/lib/api';
import { TaskComposerSheet, type CaptureMode } from '@/components/domain/task-composer';
import { TaskRow } from '@/components/domain/task-row';
import { AppBar, IconButton } from '@/components/ui/app-bar';
import { Chip } from '@/components/ui/chip';
import { useDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Sheet } from '@/components/ui/sheet';
import { SkeletonCard } from '@/components/ui/skeleton';
import {
  useCreateTask,
  useDeleteTask,
  useTaskCategories,
  useTasks,
  useToggleTask,
} from '@/lib/api';
import { errorMessage, friendlyErrorMessage } from '@/lib/errors';
import { parseDate, todayIsoDate } from '@/lib/format';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import { layout, spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type Filter = 'all' | 'today' | 'upcoming' | 'done';

const FILTERS: { key: Filter; label: string; icon: IconName }[] = [
  { key: 'all', label: 'All', icon: 'layers-outline' },
  { key: 'today', label: 'Today', icon: 'today-outline' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
  { key: 'done', label: 'Done', icon: 'checkmark-done-outline' },
];

/** 'today' covers overdue too, so nothing late hides from the Today view. */
function dueBucket(task: Task, today: string): 'none' | 'today' | 'later' {
  const due = parseDate(task.dueDate);
  if (!due) return 'none';
  const iso = `${due.getFullYear()}-${`${due.getMonth() + 1}`.padStart(2, '0')}-${`${due.getDate()}`.padStart(2, '0')}`;
  return iso <= today ? 'today' : 'later';
}

export default function TasksScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { confirm } = useDialog();
  const listRef = useRef<FlatList<Task>>(null);

  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickError, setQuickError] = useState<string | null>(null);
  const [composer, setComposer] = useState<CaptureMode | null>(null);
  const [menuTask, setMenuTask] = useState<Task | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setApplied(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const tasksQuery = useTasks({
    completed: filter === 'all' ? undefined : filter === 'done',
    q: applied || undefined,
    category: category ?? undefined,
  });
  const categoriesQuery = useTaskCategories();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const today = todayIsoDate();
  // shortcut: Today/Upcoming filter the loaded pages client-side (the API has no due-date filter); add a server filter if lists get long.
  const tasks = useMemo(() => {
    const all = tasksQuery.data?.pages.flatMap((page) => page.items) ?? [];
    if (filter === 'today') return all.filter((task) => dueBucket(task, today) === 'today');
    if (filter === 'upcoming') return all.filter((task) => dueBucket(task, today) === 'later');
    return all;
  }, [tasksQuery.data, filter, today]);
  const categories = categoriesQuery.data ?? [];

  function pickFilter(next: Filter) {
    selectFeedback();
    setFilter(next);
  }

  function toggle(task: Task) {
    setBusyTaskId(task.taskId);
    toggleTask.mutate(
      { taskId: task.taskId, isCompleted: !task.isCompleted },
      { onSettled: () => setBusyTaskId(null) },
    );
  }

  async function quickAdd() {
    const title = quickTitle.trim();
    if (!title || createTask.isPending) return;
    setQuickError(null);
    try {
      await createTask.mutateAsync({
        title,
        ...(filter === 'today' ? { dueDate: today } : {}),
        ...(category ? { category } : {}),
      });
      setQuickTitle('');
      successFeedback();
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (failure) {
      setQuickError(friendlyErrorMessage(failure, 'task'));
    }
  }

  async function confirmDelete(task: Task) {
    const ok = await confirm({
      title: 'Delete task',
      message: `"${task.title}" will be removed along with its steps.`,
      icon: 'trash-outline',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok) deleteTask.mutate(task.taskId);
  }

  function closeSearch() {
    setSearch('');
    setSearchOpen(false);
  }

  function emptyState() {
    if (tasksQuery.isPending) {
      return (
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </View>
      );
    }

    if (tasksQuery.isError) {
      return (
        <ErrorState
          title="Could not load your tasks"
          message={errorMessage(tasksQuery.error)}
          onRetry={() => void tasksQuery.refetch()}
        />
      );
    }

    if (applied) {
      return (
        <EmptyState
          icon="search"
          title="No matches"
          description={`Nothing matches "${applied}".`}
          actionLabel="Clear search"
          onAction={closeSearch}
        />
      );
    }

    if (category) {
      return (
        <EmptyState
          icon="pricetag-outline"
          title={`Nothing in ${category}`}
          description="Try another category."
          actionLabel="Show all categories"
          onAction={() => setCategory(null)}
        />
      );
    }

    if (filter === 'done') {
      return (
        <EmptyState
          icon="checkmark-done-circle-outline"
          title="Nothing finished yet"
          description="Tick a task off and it lands here."
          actionLabel="See open tasks"
          onAction={() => pickFilter('all')}
        />
      );
    }

    if (filter === 'today') {
      return (
        <EmptyState
          icon="sunny-outline"
          title="Nothing due today"
          description="Type above to add one for today."
          actionLabel="See upcoming"
          onAction={() => pickFilter('upcoming')}
        />
      );
    }

    if (filter === 'upcoming') {
      return (
        <EmptyState
          icon="calendar-outline"
          title="Nothing scheduled"
          description="Give a task a due date and it shows up here."
          actionLabel="New task with a date"
          onAction={() => setComposer('manual')}
        />
      );
    }

    return (
      <EmptyState
        icon="file-tray-outline"
        title="No tasks yet"
        description="Type above, or speak or scan one in."
        actionLabel="Record a voice task"
        onAction={() => setComposer('voice')}
      />
    );
  }

  return (
    <Screen scroll={false}>
      <AppBar
        title="Tasks"
        actions={[
          {
            icon: searchOpen ? 'close' : 'search',
            accessibilityLabel: searchOpen ? 'Close search' : 'Search tasks',
            onPress: () => (searchOpen ? closeSearch() : setSearchOpen(true)),
          },
          { icon: 'mic-outline', accessibilityLabel: 'Add by voice', onPress: () => setComposer('voice') },
          { icon: 'camera-outline', accessibilityLabel: 'Add by scanning', onPress: () => setComposer('scan') },
        ]}
      />

      {searchOpen ? (
        <View style={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.sm }}>
          <Input
            icon="search"
            placeholder="Search tasks"
            value={search}
            onChangeText={setSearch}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      ) : null}

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
          {FILTERS.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              icon={item.icon}
              selected={filter === item.key}
              onPress={() => pickFilter(item.key)}
            />
          ))}
          {categories.length > 0 ? <View className="mx-1 w-px self-stretch bg-border" /> : null}
          {categories.map((item) => (
            <Chip
              key={item}
              label={item}
              icon="pricetag-outline"
              selected={category === item}
              onPress={() => {
                selectFeedback();
                setCategory(category === item ? null : item);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        ref={listRef}
        data={tasks}
        keyExtractor={(item) => item.taskId}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl * 2 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshing={tasksQuery.isRefetching && !tasksQuery.isFetchingNextPage}
        onRefresh={() => void tasksQuery.refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (tasksQuery.hasNextPage && !tasksQuery.isFetchingNextPage) {
            void tasksQuery.fetchNextPage();
          }
        }}
        ListHeaderComponent={
          <View style={{ paddingTop: spacing.sm }}>
            <View
              className="flex-row items-center border-b border-border"
              style={{ gap: spacing.md, minHeight: 56 }}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.brandInk} />
              <TextInput
                value={quickTitle}
                onChangeText={(value) => {
                  setQuickTitle(value);
                  setQuickError(null);
                }}
                onSubmitEditing={() => void quickAdd()}
                placeholder={filter === 'today' ? 'Add a task for today' : 'Add a task'}
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                editable={!createTask.isPending}
                accessibilityLabel="Quick add a task"
                className="flex-1 py-3 text-base text-heading"
              />
              {createTask.isPending ? (
                <ActivityIndicator color={colors.brandInk} />
              ) : quickTitle.trim() ? (
                <IconButton
                  icon="arrow-up-circle"
                  size={28}
                  color={colors.brandInk}
                  accessibilityLabel="Add task"
                  onPress={() => void quickAdd()}
                />
              ) : (
                <IconButton
                  icon="options-outline"
                  color={colors.muted}
                  accessibilityLabel="Add with details"
                  onPress={() => setComposer('manual')}
                />
              )}
            </View>
            {quickError ? (
              <View className="mt-3">
                <FormError message={quickError} />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 10) * 40)}>
            <TaskRow
              task={item}
              toggling={busyTaskId === item.taskId}
              onToggle={() => toggle(item)}
              onPress={() => router.push(`/tasks/${item.taskId}`)}
              onMore={() => {
                setMenuTask(item);
                setMenuOpen(true);
              }}
            />
          </Animated.View>
        )}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          tasksQuery.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.brandInk} />
          ) : undefined
        }
      />

      <TaskComposerSheet
        visible={composer !== null}
        initialMode={composer ?? 'manual'}
        onClose={() => setComposer(null)}
        onCreated={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />

      <Sheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={menuTask?.title}
        actions={
          menuTask
            ? [
                {
                  icon: 'open-outline',
                  label: 'Open task',
                  onPress: () => router.push(`/tasks/${menuTask.taskId}`),
                },
                {
                  icon: menuTask.isCompleted ? 'arrow-undo-outline' : 'checkmark-circle-outline',
                  label: menuTask.isCompleted ? 'Mark as not done' : 'Mark as done',
                  onPress: () => toggle(menuTask),
                },
                {
                  icon: 'trash-outline',
                  label: 'Delete task',
                  destructive: true,
                  onPress: () => void confirmDelete(menuTask),
                },
              ]
            : []
        }
      />
    </Screen>
  );
}
