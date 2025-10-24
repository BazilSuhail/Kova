import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import type { Task } from '@/lib/api';
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
import { useDeleteTask, useTaskCategories, useTasks, useToggleTask } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useThemeColors } from '@/config/theme';

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
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setApplied(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const completed = filter === 'all' ? undefined : filter === 'done';
  const tasksQuery = useTasks({
    completed,
    q: applied || undefined,
    category: category ?? undefined,
  });
  const categoriesQuery = useTaskCategories();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const tasks = useMemo(
    () => tasksQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [tasksQuery.data],
  );
  const categories = categoriesQuery.data ?? [];
  const total = tasksQuery.data?.pages[0]?.total ?? 0;
  const narrowed = filter !== 'all' || applied.length > 0 || category !== null;

  function toggle(task: Task) {
    setBusyTaskId(task.taskId);
    toggleTask.mutate(
      { taskId: task.taskId, isCompleted: !task.isCompleted },
      { onSettled: () => setBusyTaskId(null) },
    );
  }

  function confirmDelete(task: Task) {
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

    if (category) {
      return (
        <EmptyState
          icon="pricetag-outline"
          title={`Nothing in ${category}`}
          description="Try another category, or clear the filter."
          actionLabel="Clear filter"
          onAction={() => setCategory(null)}
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
    <Screen
      scroll={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}
    >
      <ScreenHeader
        icon="checkbox-outline"
        eyebrow="Tasks"
        title="Your tasks"
        subtitle="Keep the next step visible and manageable."
        right={
          tasksQuery.data ? (
            <View className="rounded-full bg-brand px-4 py-2">
              <Text className="text-sm font-bold text-on-brand">
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

      {categories.length > 0 ? (
        <View className="mt-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Chip
              label="All categories"
              selected={category === null}
              onPress={() => setCategory(null)}
            />
            {categories.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={category === item}
                onPress={() => setCategory(category === item ? null : item)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

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
            <ActivityIndicator style={{ marginTop: 16 }} color={colors.brandInk} />
          ) : null
        }
      />

      {narrowed ? (
        <Text className="mt-2 text-center text-xs text-muted">
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
