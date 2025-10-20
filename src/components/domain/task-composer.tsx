import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Task } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Sheet } from '@/components/ui/sheet';
import {
  EMPTY_DRAFT,
  TaskFields,
  draftToCreateInput,
  type TaskDraft,
} from '@/components/domain/task-fields';
import { useCaptureTask, useCreateTask, useSuggestTitle } from '@/hooks/queries/tasks';
import { errorMessage } from '@/lib/errors';

type Mode = 'manual' | 'prompt';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Fired after the server has stored the task. */
  onCreated?: (task: Task) => void;
};

/**
 * Two working ways in: a plain form, and one sentence the model turns into a filed task.
 * Voice and camera capture are not built yet, so they are named rather than mocked.
 */
export function TaskComposerSheet({ visible, onClose, onCreated }: Props) {
  const [mode, setMode] = useState<Mode>('manual');
  const [draft, setDraft] = useState<TaskDraft>(EMPTY_DRAFT);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      setError(errorMessage(failure));
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
      finish(await capture.mutateAsync(sentence));
    } catch (failure) {
      setError(errorMessage(failure));
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
      setError(errorMessage(failure));
    }
  }

  return (
    <Sheet visible={visible} onClose={handleClose} title="Capture a task" subtitle="Get it out of your head now, organise it later.">
      <ScrollView style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row" style={{ gap: 8 }}>
          <Chip label="Type it in" selected={mode === 'manual'} onPress={() => setMode('manual')} />
          <Chip label="Say it naturally" selected={mode === 'prompt'} onPress={() => setMode('prompt')} />
        </View>

        {mode === 'manual' ? (
          <>
            <TaskFields
              draft={draft}
              onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
              disabled={submitting}
            />

            <View className="mb-4 flex-row" style={{ gap: 8 }}>
              <Button
                label={suggest.isPending ? 'Improving' : 'Improve title'}
                variant="ghost"
                size="sm"
                icon="sparkles"
                loading={suggest.isPending}
                disabled={submitting}
                onPress={() => void improveTitle()}
              />
            </View>

            <Button
              label="Create task"
              icon="add"
              loading={create.isPending}
              disabled={busy}
              onPress={() => void submitManual()}
            />
          </>
        ) : (
          <>
            <Input
              label="What is on your mind?"
              placeholder="Remind me to email the landlord about the deposit on Friday"
              value={prompt}
              onChangeText={setPrompt}
              editable={!submitting}
              multiline
              hint="Kova picks the title, category and due date from the sentence."
            />

            <Button
              label="Create task"
              icon="sparkles"
              loading={capture.isPending}
              disabled={busy}
              onPress={() => void submitPrompt()}
            />
          </>
        )}

        {error ? (
          <Text className="mt-3 text-sm font-medium text-red-500 dark:text-red-400">{error}</Text>
        ) : null}

        <Text className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          Voice notes and scans arrive in a later update.
        </Text>

        <View className="mt-3">
          <Button label="Cancel" variant="secondary" size="md" disabled={submitting} onPress={handleClose} />
        </View>
      </ScrollView>
    </Sheet>
  );
}
