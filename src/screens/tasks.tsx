import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { useThemeColors } from '@/theme/colors';

export type Todo = { id: string; title: string; done: boolean; tag: string };

const initialTodos: Todo[] = [
  { id: '1', title: 'Buy groceries',     done: false, tag: 'Personal' },
  { id: '2', title: 'Finish Q3 report',  done: false, tag: 'Work'     },
  { id: '3', title: 'Call dentist',      done: false, tag: 'Health'   },
  { id: '4', title: '20 minute walk',    done: true,  tag: 'Health'   },
  { id: '5', title: 'Water the plants',  done: true,  tag: 'Personal' },
  { id: '6', title: 'Reply to emails',   done: false, tag: 'Work'     },
  { id: '7', title: 'Read 10 pages',     done: true,  tag: 'Learning' },
  { id: '8', title: 'Plan weekend trip', done: false, tag: 'Personal' },
];

// Category pills — plain Tailwind so light/dark resolve automatically.
const TAG_CLASS: Record<string, string> = {
  Personal: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  Work: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Learning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

export default function TasksScreen() {
  const colors = useThemeColors();
  const [todos, setTodos] = useState(initialTodos);

  const toggle = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-slate-100 dark:bg-slate-950"
      edges={['top']}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>

        {/* Header */}
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Tasks
            </Text>
            <Text className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
              Your tasks
            </Text>
          </View>
          <View className="rounded-full bg-violet-100 px-4 py-2 dark:bg-violet-900">
            <Text className="text-sm font-bold text-violet-700 dark:text-violet-300">
              {doneCount} / {todos.length}
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Keep the next step visible and manageable.
        </Text>

        {/* Progress bar */}
        <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <View
            className="h-full rounded-full bg-violet-500"
            style={{ width: `${(doneCount / todos.length) * 100}%` }}
          />
        </View>

        {/* Task list */}
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              className={`flex-row items-center rounded-xl border bg-white px-4 py-3 active:opacity-70 dark:bg-slate-900 ${
                item.done
                  ? 'border-violet-400 dark:border-violet-700'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
              style={{ gap: 12 }}>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                  item.done
                    ? 'border-violet-600 bg-violet-600'
                    : 'border-slate-400 bg-white dark:border-slate-600 dark:bg-slate-900'
                }`}>
                {item.done && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
              <Text
                numberOfLines={1}
                className={`flex-1 text-sm font-semibold ${
                  item.done
                    ? 'text-slate-400 line-through dark:text-slate-600'
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                {item.title}
              </Text>
              <View className={`rounded-full px-2 py-1 ${TAG_CLASS[item.tag]}`}>
                <Text className="text-xs font-semibold">{item.tag}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Ionicons name="checkmark-done-circle" size={40} color={colors.success} />
              <Text className="mt-3 text-base text-slate-500 dark:text-slate-400">
                All done! Great work.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
