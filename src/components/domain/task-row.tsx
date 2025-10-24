import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { Task } from '@/lib/api';
import { TaskCheckbox } from '@/components/domain/task-checkbox';
import { categoryInkClass, categoryToneClass } from '@/constants/tasks';
import { formatDueDate, isOverdue } from '@/lib/format';
import { useThemeColors } from '@/config/theme';

type Props = {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  toggling?: boolean;
};

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
      className={`flex-row items-center rounded-2xl border bg-surface px-4 py-3 ${
        late ? 'border-danger' : 'border-border'
      } ${onPress ? 'active:opacity-70' : ''}`}
      style={{ gap: 12 }}
    >
      <TaskCheckbox
        checked={done}
        busy={toggling}
        onPress={onToggle}
        accessibilityLabel={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
      />

      <View className="flex-1">
        <Text
          numberOfLines={2}
          className={`text-sm font-semibold ${done ? 'text-muted line-through' : 'text-heading'}`}
        >
          {task.title}
        </Text>

        {task.category || due || task.hasSubtasks ? (
          <View className="mt-1.5 flex-row items-center" style={{ gap: 8 }}>
            {task.category ? (
              <View className={`rounded-full px-2 py-0.5 ${categoryToneClass(task.category)}`}>
                <Text className={`text-xs font-semibold ${categoryInkClass(task.category)}`}>
                  {task.category}
                </Text>
              </View>
            ) : null}

            {due ? (
              <View className="flex-row items-center" style={{ gap: 3 }}>
                <Ionicons
                  name="calendar-outline"
                  size={11}
                  color={late ? colors.dangerInk : colors.muted}
                />
                <Text className={`text-xs font-medium ${late ? 'text-danger-ink' : 'text-muted'}`}>
                  {due}
                </Text>
              </View>
            ) : null}

            {task.hasSubtasks ? (
              <View className="flex-row items-center" style={{ gap: 3 }}>
                <Ionicons name="list-outline" size={11} color={colors.muted} />
                <Text className="text-xs font-medium text-muted">Steps</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.muted} /> : null}
    </Pressable>
  );
}
