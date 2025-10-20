import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { Task } from '@/api/types';
import { TaskCheckbox } from '@/components/domain/task-checkbox';
import { categoryToneClass } from '@/constants/tasks';
import { formatDueDate, isOverdue } from '@/lib/format';
import { useThemeColors } from '@/theme/colors';

type Props = {
  task: Task;
  onToggle: () => void;
  /** Tapping the row body; omit to keep the row read only. */
  onPress?: () => void;
  /** Long press, used for the delete affordance. */
  onLongPress?: () => void;
  /** Shows a spinner on the checkbox while the toggle is in flight. */
  toggling?: boolean;
};

/** One task, as it appears on the list and on the home screen. */
export function TaskRow({ task, onToggle, onPress, onLongPress, toggling = false }: Props) {
  const colors = useThemeColors();
  const done = Boolean(task.isCompleted);
  const due = formatDueDate(task.dueDate);
  const late = !done && isOverdue(task.dueDate);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className={`flex-row items-center rounded-2xl border bg-white px-4 py-3 dark:bg-slate-900 ${
        late ? 'border-red-200 dark:border-red-900' : 'border-slate-200 dark:border-slate-800'
      } ${onPress ? 'active:opacity-70' : ''}`}
      style={{ gap: 12 }}>
      <TaskCheckbox
        checked={done}
        busy={toggling}
        onPress={onToggle}
        accessibilityLabel={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
      />

      <View className="flex-1">
        <Text
          numberOfLines={2}
          className={`text-sm font-semibold ${
            done ? 'text-slate-400 line-through dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'
          }`}>
          {task.title}
        </Text>

        {task.category || due || task.hasSubtasks ? (
          <View className="mt-1.5 flex-row items-center" style={{ gap: 8 }}>
            {task.category ? (
              <View className={`rounded-full px-2 py-0.5 ${categoryToneClass(task.category)}`}>
                <Text className="text-xs font-semibold">{task.category}</Text>
              </View>
            ) : null}

            {due ? (
              <View className="flex-row items-center" style={{ gap: 3 }}>
                <Ionicons name="calendar-outline" size={11} color={late ? colors.danger : colors.textMuted} />
                <Text
                  className={`text-xs font-medium ${
                    late ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                  {due}
                </Text>
              </View>
            ) : null}

            {task.hasSubtasks ? (
              <View className="flex-row items-center" style={{ gap: 3 }}>
                <Ionicons name="list-outline" size={11} color={colors.textMuted} />
                <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Steps</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </Pressable>
  );
}
