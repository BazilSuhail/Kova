import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { CreateTaskInput, UpdateTaskInput, Task } from '@/lib/api';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { CategoryPicker } from '@/components/ui/category-picker';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { spacing, useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';
import { formatDueDate, todayIsoDate } from '@/lib/format';

export type TaskDraft = {
  title: string;
  description: string;
  category: string;
  dueDate: string;
};

export const EMPTY_DRAFT: TaskDraft = { title: '', description: '', category: '', dueDate: '' };

export function draftFromTask(task: Task | undefined): TaskDraft {
  if (!task) return EMPTY_DRAFT;
  return {
    title: task.title,
    description: task.description ?? '',
    category: task.category ?? '',
    dueDate: task.dueDate ?? '',
  };
}

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function draftToCreateInput(draft: TaskDraft): CreateTaskInput {
  const title = draft.title.trim();
  const description = draft.description.trim();
  const category = draft.category.trim();
  const dueDate = draft.dueDate.trim();

  return {
    title,
    ...(description ? { description } : {}),
    ...(category ? { category } : {}),
    ...(dueDate ? { dueDate } : {}),
  };
}

export function draftToPatch(draft: TaskDraft, task: Task): UpdateTaskInput {
  const patch: UpdateTaskInput = {};

  if (draft.title.trim() !== task.title) patch.title = draft.title.trim();
  if (draft.description.trim() !== (task.description ?? ''))
    patch.description = draft.description.trim();
  if (draft.category.trim() !== (task.category ?? '')) patch.category = draft.category.trim();
  if (draft.dueDate.trim() !== (task.dueDate ?? '')) patch.dueDate = draft.dueDate.trim();

  return patch;
}

type Props = {
  draft: TaskDraft;
  onChange: (patch: Partial<TaskDraft>) => void;
  disabled?: boolean;
};

export function TaskFields({ draft, onChange, disabled = false }: Props) {
  const colors = useThemeColors();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const due = formatDueDate(draft.dueDate);
  const today = todayIsoDate();
  const tomorrow = tomorrowIsoDate();
  const custom = Boolean(draft.dueDate) && draft.dueDate !== today && draft.dueDate !== tomorrow;

  return (
    <View>
      <Input
        label="Title"
        icon="create-outline"
        placeholder="Call the dentist"
        value={draft.title}
        onChangeText={(title) => onChange({ title })}
        editable={!disabled}
        autoCapitalize="sentences"
        returnKeyType="next"
      />

      <Input
        label="Details (optional)"
        icon="document-text-outline"
        placeholder="Anything worth remembering when you pick this up"
        value={draft.description}
        onChangeText={(description) => onChange({ description })}
        editable={!disabled}
        multiline
        style={{ minHeight: 96 }}
      />

      <FieldLabel icon="calendar-outline" label="Due date" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: spacing.sm }}
      >
        <Chip
          label="Today"
          icon="today-outline"
          selected={draft.dueDate === today}
          onPress={() => onChange({ dueDate: today })}
        />
        <Chip
          label="Tomorrow"
          icon="sunny-outline"
          selected={draft.dueDate === tomorrow}
          onPress={() => onChange({ dueDate: tomorrow })}
        />
        <Chip
          label={custom && due ? due : 'Pick a date'}
          icon="calendar-outline"
          selected={custom}
          onPress={() => setCalendarOpen(true)}
        />
        {draft.dueDate ? (
          <Chip label="No date" icon="close" onPress={() => onChange({ dueDate: '' })} />
        ) : null}
      </ScrollView>

      <View className="mt-6">
        <FieldLabel icon="pricetag-outline" label="Category" />
        <Pressable
          onPress={() => setCategoryOpen(true)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Choose a category"
          className="flex-row items-center rounded-md border border-border bg-surface px-3 py-3.5 active:bg-surface-alt"
          style={{ gap: spacing.sm }}
        >
          <Text className={`flex-1 text-base ${draft.category ? 'text-heading' : 'text-muted'}`}>
            {draft.category || 'Choose one'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.muted} />
        </Pressable>
      </View>

      <CategoryPicker
        visible={categoryOpen}
        value={draft.category}
        onClose={() => setCategoryOpen(false)}
        onSelect={(category) => onChange({ category })}
      />
      <CalendarPicker
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelect={(dueDate) => onChange({ dueDate })}
        initialDate={draft.dueDate || undefined}
      />
    </View>
  );
}

function FieldLabel({ icon, label }: { icon: IconName; label: string }) {
  const colors = useThemeColors();
  return (
    <View className="mb-2 flex-row items-center" style={{ gap: 6 }}>
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Text className="text-sm font-medium text-heading">{label}</Text>
    </View>
  );
}
