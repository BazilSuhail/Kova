import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { Task } from '@/lib/api';
import { TaskCheckbox } from '@/components/domain/task-checkbox';
import { IconButton } from '@/components/ui/app-bar';
import { formatDueDate, isOverdue } from '@/lib/format';
import { spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type Props = {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
  /** Shows a trailing "more" button (and long-press) that opens an action sheet. */
  onMore?: () => void;
  toggling?: boolean;
};

/** Flat list row: checkbox, title, icon meta line, hairline separator. */
export function TaskRow({ task, onToggle, onPress, onMore, toggling = false }: Props) {
  const colors = useThemeColors();
  const done = Boolean(task.isCompleted);
  const due = formatDueDate(task.dueDate);
  const late = !done && isOverdue(task.dueDate);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onMore}
      disabled={!onPress && !onMore}
      accessibilityRole={onPress ? 'button' : undefined}
      className="min-h-16 flex-row items-center border-b border-border py-3 active:bg-surface-alt"
      style={{ gap: spacing.md }}
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
          className={`text-[15px] font-medium ${done ? 'text-muted line-through' : 'text-heading'}`}
        >
          {task.title}
        </Text>

        {task.category || due || task.hasSubtasks ? (
          <View className="mt-1 flex-row flex-wrap items-center" style={{ gap: spacing.md }}>
            {due ? (
              <Meta
                icon={late ? 'alert-circle-outline' : 'calendar-outline'}
                label={late ? `Overdue · ${due}` : due}
                color={late ? colors.dangerInk : colors.muted}
              />
            ) : null}
            {task.category ? (
              <Meta icon="pricetag-outline" label={task.category} color={colors.muted} />
            ) : null}
            {task.hasSubtasks ? (
              <Meta icon="list-outline" label="Steps" color={colors.muted} />
            ) : null}
          </View>
        ) : null}
      </View>

      {onMore ? (
        <IconButton
          icon="ellipsis-vertical"
          size={18}
          color={colors.muted}
          accessibilityLabel={`More for ${task.title}`}
          onPress={onMore}
        />
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      ) : null}
    </Pressable>
  );
}

function Meta({
  icon,
  label,
  color,
}: {
  icon: IconName;
  label: string;
  color: string;
}) {
  return (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <Ionicons name={icon} size={12} color={color} />
      <Text className="text-xs" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
