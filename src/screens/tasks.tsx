import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import type { Task } from '@/api/types';
import { TaskComposerSheet } from '@/components/domain/task-composer';
import { TaskRow } from '@/components/domain/task-row';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Fab } from '@/components/ui/fab';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useDeleteTask, useTasks, useToggleTask } from '@/hooks/queries/tasks';
import { errorMessage } from '@/lib/errors';
import { useThemeColors } from '@/theme/colors';

type Filter = 'all' | 'open' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'done', label: 'Done' },
];

export default function TasksScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const listRef = useRef<FlatList<Task>>(null);

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  // Typing should not fire one request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setApplied(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const completed = filter === 'all' ? undefined : filter === 'done';
  const tasksQuery = useTasks({ completed, q: applied || undefined });
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const tasks = useMemo(
    () => tasksQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [tasksQuery.data],
  );
  const total = tasksQuery.data?.pages[0]?.total ?? 0;
  const narrowed = filter !== 'all' || applied.length > 0;

  function toggle(task: Task) {
    setBusyTaskId(task.taskId);
    toggleTask.mutate(
      { taskId: task.taskId, isCompleted: !task.isCompleted },
      { onSettled: () => setBusyTaskId(null) },
    );
  }

  function confirmDelete(task: Task) {
    // RN Web has no button-capable Alert, so it deletes straight away.
    if (Platform.OS === 'web') {
      deleteTask.mutate(task.taskId);
      return;
    }
    Alert.alert('Delete task', `"${task.title}" will be removed along with its steps.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask.mutate(task.taskId) },
    ]);
  }

  function emptyState() {
    if (tasksQuery.isPending) {
      return (
        <View style={{ gap: 12, marginTop: 12 }}>
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
          description={`Nothing here matches "${applied}".`}
        />
      );
    }

    if (filter === 'done') {
      return (
        <EmptyState
          icon="checkmark-done-circle"
          title="Nothing finished yet"
          description="Tick something off and it will show up here."
        />
      );
    }

    if (filter === 'open') {
      return (
        <EmptyState
          icon="checkmark-circle-outline"
          title="Nothing open here"
          description="You are all caught up for now."
        />
      );
    }

    return (
      <EmptyState
        icon="file-tray-outline"
        title="No tasks yet"
        description="Capture the first one and it will land here."
        actionLabel="Add a task"
        onAction={() => setComposerOpen(true)}
      />
    );
  }

  return (
    <Screen scroll={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}>
      <ScreenHeader
        eyebrow="Tasks"
        title="Your tasks"
        subtitle="Keep the next step visible and manageable."
        right={
          tasksQuery.data ? (
            <View className="rounded-full bg-violet-100 px-4 py-2 dark:bg-violet-900">
              <Text className="text-sm font-bold text-violet-700 dark:text-violet-300">
                {tasks.length} / {total}
              </Text>
            </View>
          ) : null
        }
      />

      <View className="mt-4">
        <Input
          icon="search"
          placeholder="Search tasks"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <View className="flex-row items-center" style={{ gap: 8 }}>
        {FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </View>

      <FlatList
        ref={listRef}
        data={tasks}
        keyExtractor={(item) => item.taskId}
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 96 }}
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
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            toggling={busyTaskId === item.taskId}
            onToggle={() => toggle(item)}
            onPress={() => router.push(`/tasks/${item.taskId}`)}
            onLongPress={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          tasksQuery.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} />
          ) : null
        }
      />

      {narrowed ? (
        <Text className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Showing {tasks.length} of {total}
        </Text>
      ) : null}

      <Fab onPress={() => setComposerOpen(true)} accessibilityLabel="Capture a task" />

      <TaskComposerSheet
        visible={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />
    </Screen>
  );
}
