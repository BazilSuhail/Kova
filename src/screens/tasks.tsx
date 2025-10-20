import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Fab } from '@/components/ui/fab';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Sheet } from '@/components/ui/sheet';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

export type Todo = { id: string; title: string; done: boolean; tag: string };

const initialTodos: Todo[] = [
  { id: '1', title: 'Buy groceries', done: false, tag: 'Personal' },
  { id: '2', title: 'Finish Q3 report', done: false, tag: 'Work' },
  { id: '3', title: 'Call dentist', done: false, tag: 'Health' },
  { id: '4', title: '20 minute walk', done: true, tag: 'Health' },
  { id: '5', title: 'Water the plants', done: true, tag: 'Personal' },
  { id: '6', title: 'Reply to emails', done: false, tag: 'Work' },
  { id: '7', title: 'Read 10 pages', done: true, tag: 'Learning' },
  { id: '8', title: 'Plan weekend trip', done: false, tag: 'Personal' },
];

// Category pills — plain Tailwind so light/dark resolve automatically.
const TAG_CLASS: Record<string, string> = {
  Personal: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  Work: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Learning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

type Filter = 'all' | 'open' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'done', label: 'Done' },
];

/** Ways a task will be able to arrive. Only the UI lives here; the write endpoints come later. */
const captureModes: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'create-outline', title: 'Type it in', detail: 'Title, due date and category' },
  { icon: 'chatbubble-ellipses-outline', title: 'Say it naturally', detail: 'One sentence and Kova files it' },
  { icon: 'mic-outline', title: 'Voice note', detail: 'Hands free while you are moving' },
  { icon: 'camera-outline', title: 'Scan your notes', detail: 'A photo of your list becomes tasks' },
];

export default function TasksScreen() {
  const colors = useThemeColors();
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState<Filter>('all');
  const [captureOpen, setCaptureOpen] = useState(false);

  const toggle = (id: string) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const doneCount = todos.filter((t) => t.done).length;
  const visible = todos.filter((t) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done));

  return (
    <Screen scroll={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}>
      <ScreenHeader
        eyebrow="Tasks"
        title="Your tasks"
        subtitle="Keep the next step visible and manageable."
        right={
          <View className="rounded-full bg-violet-100 px-4 py-2 dark:bg-violet-900">
            <Text className="text-sm font-bold text-violet-700 dark:text-violet-300">
              {doneCount} / {todos.length}
            </Text>
          </View>
        }
      />

      <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <View
          className="h-full rounded-full bg-violet-500"
          style={{ width: `${todos.length === 0 ? 0 : (doneCount / todos.length) * 100}%` }}
        />
      </View>

      <View className="mt-4 flex-row" style={{ gap: 8 }}>
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
        data={visible}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 96 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggle(item.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
            className={`flex-row items-center rounded-xl border bg-white px-4 py-3 active:opacity-70 dark:bg-slate-900 ${
              item.done ? 'border-violet-400 dark:border-violet-700' : 'border-slate-200 dark:border-slate-800'
            }`}
            style={{ gap: 12 }}>
            <View
              className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                item.done
                  ? 'border-violet-600 bg-violet-600'
                  : 'border-slate-400 bg-white dark:border-slate-600 dark:bg-slate-900'
              }`}>
              {item.done ? <Ionicons name="checkmark" size={13} color={colors.onPrimary} /> : null}
            </View>
            <Text
              numberOfLines={1}
              className={`flex-1 text-sm font-semibold ${
                item.done ? 'text-slate-400 line-through dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'
              }`}>
              {item.title}
            </Text>
            <View className={`rounded-full px-2 py-1 ${TAG_CLASS[item.tag]}`}>
              <Text className="text-xs font-semibold">{item.tag}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={filter === 'done' ? 'checkmark-done-circle' : 'file-tray-outline'}
            title={filter === 'done' ? 'Nothing finished yet' : 'Nothing open here'}
            description={
              filter === 'done' ? 'Tick something off and it will show up here.' : 'You are all caught up for now.'
            }
          />
        }
      />

      <Fab onPress={() => setCaptureOpen(true)} accessibilityLabel="Capture a task" />

      <Sheet
        visible={captureOpen}
        onClose={() => setCaptureOpen(false)}
        title="Capture a task"
        subtitle="Pick how you want to get it out of your head.">
        <View style={{ gap: 8 }}>
          {captureModes.map((mode) => (
            <View
              key={mode.title}
              className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                <Ionicons name={mode.icon} size={17} color={colors.primary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{mode.title}</Text>
                <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{mode.detail}</Text>
              </View>
              <Chip label="Soon" />
            </View>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}
