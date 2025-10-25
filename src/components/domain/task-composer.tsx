import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import type { Task } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { Chip } from '@/components/ui/chip';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Sheet } from '@/components/ui/sheet';
import { ScanCapture } from '@/components/domain/scan-capture';
import {
  EMPTY_DRAFT,
  TaskFields,
  draftToCreateInput,
  type TaskDraft,
} from '@/components/domain/task-fields';
import { VoiceCapture } from '@/components/domain/voice-capture';
import { useCaptureTask, useCreateTask, useSuggestTitle } from '@/lib/api';
import { friendlyErrorMessage } from '@/lib/errors';
import { formatDueDate } from '@/lib/format';
import { spacing } from '@/config/theme';
import type { IconName } from '@/theme/icons';

export type CaptureMode = 'manual' | 'prompt' | 'voice' | 'scan';
type Mode = CaptureMode;

const MODES: { value: Mode; label: string; icon: IconName }[] = [
  { value: 'manual', label: 'Type', icon: 'create-outline' },
  { value: 'prompt', label: 'Sentence', icon: 'sparkles-outline' },
  { value: 'voice', label: 'Voice', icon: 'mic-outline' },
  { value: 'scan', label: 'Scan', icon: 'camera-outline' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated?: (task: Task) => void;
  /** Mode to open on, e.g. 'voice' from a mic shortcut. */
  initialMode?: CaptureMode;
};

export function TaskComposerSheet({ visible, onClose, onCreated, initialMode = 'manual' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [wasVisible, setWasVisible] = useState(visible);

  const [draft, setDraft] = useState<TaskDraft>(EMPTY_DRAFT);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Open on the requested mode (adjusting state during render, not in an effect).
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setMode(initialMode);
  }

  const create = useCreateTask();
  const capture = useCaptureTask();
  const suggest = useSuggestTitle();

  const submitting = create.isPending || capture.isPending;
  const busy = submitting || suggest.isPending;

  function reset() {
    setDraft(EMPTY_DRAFT);
    setPrompt('');
    setError(null);
    setMode('manual');
  }

  function finish(task: Task) {
    reset();
    onClose();
    onCreated?.(task);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function submitManual() {
    if (!draft.title.trim()) {
      setError('Give the task a title first.');
      return;
    }
    setError(null);
    try {
      finish(await create.mutateAsync(draftToCreateInput(draft)));
    } catch (failure) {
      setError(friendlyErrorMessage(failure, 'task'));
    }
  }

  async function submitPrompt() {
    const sentence = prompt.trim();
    if (!sentence) {
      setError('Describe the task in a sentence.');
      return;
    }
    setError(null);
    try {
      finish(
        await capture.mutateAsync({
          prompt: sentence,
          overrides: { dueDate: draft.dueDate || undefined },
        }),
      );
    } catch (failure) {
      setError(friendlyErrorMessage(failure, 'prompt'));
    }
  }

  async function improveTitle() {
    const title = draft.title.trim();
    if (!title) {
      setError('Write a rough title first, then improve it.');
      return;
    }
    setError(null);
    try {
      const better = await suggest.mutateAsync(title);
      setDraft((current) => ({ ...current, title: better }));
    } catch (failure) {
      setError(friendlyErrorMessage(failure, 'ai'));
    }
  }

  return (
    <Sheet
      visible={visible}
      onClose={handleClose}
      title="New task"
      subtitle="Get it out of your head now, sort it later."
      icon="add-circle-outline"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
      >
        {MODES.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            icon={option.icon}
            selected={mode === option.value}
            onPress={() => {
              setError(null);
              setMode(option.value);
            }}
          />
        ))}
      </ScrollView>

      {error ? <FormError message={error} /> : null}

      {mode === 'manual' ? (
        <>
          <TaskFields
            draft={draft}
            onChange={(patch) => {
              setError(null);
              setDraft((current) => ({ ...current, ...patch }));
            }}
            disabled={submitting}
          />
          <Button
            className="mt-4 self-start"
            label={suggest.isPending ? 'Improving title' : 'Improve title with AI'}
            variant="ghost"
            size="sm"
            icon="sparkles-outline"
            loading={suggest.isPending}
            disabled={submitting}
            onPress={() => void improveTitle()}
          />
        </>
      ) : null}

      {mode === 'prompt' ? (
        <>
          <Input
            label="Describe it in a sentence"
            icon="chatbubble-ellipses-outline"
            placeholder="Email the landlord about the deposit on Friday"
            value={prompt}
            onChangeText={(value) => {
              setPrompt(value);
              setError(null);
            }}
            editable={!submitting}
            multiline
            style={{ minHeight: 120 }}
            hint="Kova picks the title, category and due date for you."
          />
          <View className="flex-row" style={{ gap: spacing.sm }}>
            <Chip
              icon="calendar-outline"
              label={draft.dueDate ? (formatDueDate(draft.dueDate) ?? draft.dueDate) : 'Due date (optional)'}
              selected={!!draft.dueDate}
              onPress={() => setCalendarOpen(true)}
            />
            {draft.dueDate ? (
              <Chip
                icon="close"
                label="No date"
                onPress={() => setDraft((prev) => ({ ...prev, dueDate: '' }))}
              />
            ) : null}
          </View>
          <CalendarPicker
            visible={calendarOpen}
            onClose={() => setCalendarOpen(false)}
            onSelect={(date) => setDraft((prev) => ({ ...prev, dueDate: date }))}
            initialDate={draft.dueDate || undefined}
          />
        </>
      ) : null}

      {mode === 'voice' ? <VoiceCapture disabled={submitting} onCreated={finish} /> : null}

      {mode === 'scan' ? <ScanCapture disabled={submitting} onCreated={finish} /> : null}

      {mode === 'manual' || mode === 'prompt' ? (
        <View className="mt-6 flex-row" style={{ gap: spacing.sm }}>
          <Button
            className="flex-1"
            label="Create task"
            icon="checkmark"
            size="md"
            loading={mode === 'manual' ? create.isPending : capture.isPending}
            disabled={busy}
            onPress={() => void (mode === 'manual' ? submitManual() : submitPrompt())}
          />
          <Button
            className="flex-1"
            label="Cancel"
            variant="secondary"
            size="md"
            disabled={submitting}
            onPress={handleClose}
          />
        </View>
      ) : null}
    </Sheet>
  );
}
