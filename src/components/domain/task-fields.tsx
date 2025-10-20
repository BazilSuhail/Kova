import { View } from 'react-native';

import type { CreateTaskInput, UpdateTaskInput } from '@/api/tasks';
import type { Task } from '@/api/types';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { TASK_CATEGORY_SUGGESTIONS } from '@/constants/tasks';
import { formatDueDate, todayIsoDate } from '@/lib/format';

/** The editable shape of a task, shared by the composer and the detail screen. */
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

/** `YYYY-MM-DD` for tomorrow, so the quick chip never has to format a date. */
function tomorrowIsoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Trims the draft into a create body; empty optional fields are dropped. */
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

/**
 * Sends only what actually changed.
 *
 * ⚠️ The server answers 404 when a `PUT` carries no real change, so an unchanged draft must
 * never be submitted — callers check that the patch has at least one key first.
 */
export function draftToPatch(draft: TaskDraft, task: Task): UpdateTaskInput {
  const patch: UpdateTaskInput = {};

  if (draft.title.trim() !== task.title) patch.title = draft.title.trim();
  if (draft.description.trim() !== (task.description ?? '')) patch.description = draft.description.trim();
  if (draft.category.trim() !== (task.category ?? '')) patch.category = draft.category.trim();
  if (draft.dueDate.trim() !== (task.dueDate ?? '')) patch.dueDate = draft.dueDate.trim();

  return patch;
}

type Props = {
  draft: TaskDraft;
  onChange: (patch: Partial<TaskDraft>) => void;
  disabled?: boolean;
};

/** The task form fields, so the composer and the edit sheet cannot drift apart. */
export function TaskFields({ draft, onChange, disabled = false }: Props) {
  const due = formatDueDate(draft.dueDate);
  const today = todayIsoDate();
  const tomorrow = tomorrowIsoDate();

  return (
    <View>
      <Input
        label="What needs doing?"
        placeholder="Call the dentist"
        value={draft.title}
        onChangeText={(title) => onChange({ title })}
        editable={!disabled}
        autoCapitalize="sentences"
        returnKeyType="next"
      />

      <Input
        label="Details (optional)"
        placeholder="Anything worth remembering when you pick this up"
        value={draft.description}
        onChangeText={(description) => onChange({ description })}
        editable={!disabled}
        multiline
      />

      <View className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Chip label="Today" selected={draft.dueDate === today} onPress={() => onChange({ dueDate: today })} />
            <Chip
              label="Tomorrow"
              selected={draft.dueDate === tomorrow}
              onPress={() => onChange({ dueDate: tomorrow })}
            />
            {draft.dueDate ? <Chip label="Clear" onPress={() => onChange({ dueDate: '' })} /> : null}
          </View>
        </View>
        <Input
          placeholder="YYYY-MM-DD"
          value={draft.dueDate}
          onChangeText={(dueDate) => onChange({ dueDate })}
          editable={!disabled}
          hint={due ? `Due ${due}` : 'Leave empty for a task with no date.'}
        />
      </View>

      <View className="mb-1">
        <View className="mb-2 flex-row flex-wrap" style={{ gap: 8 }}>
          {TASK_CATEGORY_SUGGESTIONS.map((category) => (
            <Chip
              key={category}
              label={category}
              selected={draft.category.toLowerCase() === category.toLowerCase()}
              onPress={() => onChange({ category: draft.category === category ? '' : category })}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
