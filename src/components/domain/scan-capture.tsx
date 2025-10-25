import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import type { Task } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { FormError } from '@/components/ui/form-error';
import { useCaptureTaskFromImage, useUpdateTask } from '@/lib/api';
import { friendlyErrorMessage } from '@/lib/errors';
import { formatDueDate } from '@/lib/format';
import { extensionFor } from '@/lib/upload';
import { spacing } from '@/config/theme';

type ScanSource = 'camera' | 'library';

type Props = {
  disabled?: boolean;
  /** Called when the person taps Done after reviewing what was read. */
  onCreated: (task: Task) => void;
};

export function ScanCapture({ disabled = false, onCreated }: Props) {
  const capture = useCaptureTaskFromImage();
  const update = useUpdateTask();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    task: Task;
    extractedText: string;
    preview: string;
  } | null>(null);
  const [pendingDueDate, setPendingDueDate] = useState<string>('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const busy = disabled || capture.isPending;

  async function scan(source: ScanSource) {
    setError(null);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          source === 'camera'
            ? 'Kova needs camera access to photograph your notes.'
            : 'Kova needs access to your photos to read a page.',
        );
        return;
      }

      const picked =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });

      if (picked.canceled) return;

      const asset = picked.assets[0];
      if (!asset) return;

      if (__DEV__) {
        console.log('[scan-capture] asset uri:', asset.uri, 'mimeType:', asset.mimeType);
      }

      const created = await capture.mutateAsync({
        file: {
          uri: asset.uri,
          name: asset.fileName ?? `scan.${extensionFor(asset.mimeType, 'jpg')}`,
          type: asset.mimeType ?? 'image/jpeg',
        },
        dueDate: pendingDueDate || undefined,
      });

      setResult({ task: created.task, extractedText: created.extractedText, preview: asset.uri });
    } catch (failure) {
      if (__DEV__) {
        console.log('[scan-capture] upload error:', failure);
      }
      setError(friendlyErrorMessage(failure, 'photo'));
    }
  }

  async function updateDueDate(date: string) {
    if (!result) return;
    try {
      await update.mutateAsync({ taskId: result.task.taskId, input: { dueDate: date } });
      setResult((prev) =>
        prev ? { ...prev, task: { ...prev.task, dueDate: date } } : prev,
      );
    } catch (failure) {
      setError(friendlyErrorMessage(failure, 'task'));
    }
  }

  if (result) {
    return (
      <View>
        <Card padded={false} className="overflow-hidden">
          <Image
            source={{ uri: result.preview }}
            style={{ width: '100%', height: 132 }}
            contentFit="cover"
            accessibilityLabel="The photo you scanned"
          />
          <View className="p-4">
            <Text className="text-xs font-semibold uppercase tracking-widest text-brand-ink">
              Read from your photo
            </Text>
            <Text className="mt-2 text-sm text-body">
              {result.extractedText || 'The page did not give us any readable text.'}
            </Text>
          </View>
        </Card>

        <View className="mt-4 flex-row items-center" style={{ gap: spacing.sm }}>
          <Icon name="checkmark-circle" size={18} tone="success" />
          <Text className="flex-1 text-sm text-body">Filed as “{result.task.title}”.</Text>
        </View>
        {error ? <View className="mt-4"><FormError message={error} /></View> : null}

        <View className="mt-4" style={{ gap: 10 }}>
          <Button
            label={
              result.task.dueDate
                ? `Due date: ${formatDueDate(result.task.dueDate) ?? 'Set'}`
                : 'Set due date'
            }
            className="w-full"
            variant="secondary"
            icon="calendar-outline"
            onPress={() => setCalendarOpen(true)}
            disabled={update.isPending}
          />
          <Button
            label="Done"
            icon="checkmark"
            className="w-full"
            onPress={() => onCreated(result.task)}
          />
        </View>

        <CalendarPicker
          visible={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          onSelect={(date) => void updateDueDate(date)}
          initialDate={result.task.dueDate ?? (pendingDueDate || undefined)}
        />
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-start" style={{ gap: spacing.md }}>
        <Icon name="scan-outline" size={20} tone="brand" />
        <Text className="flex-1 text-sm leading-5 text-body">
          Photograph a page of notes, a whiteboard or a receipt. Kova reads the text, files a task
          and shows you what it read.
        </Text>
      </View>

      <View className="mt-4 flex-row" style={{ gap: spacing.sm }}>
        <Chip
          icon="calendar-outline"
          label={pendingDueDate ? (formatDueDate(pendingDueDate) ?? pendingDueDate) : 'Due date (optional)'}
          selected={Boolean(pendingDueDate)}
          onPress={() => setCalendarOpen(true)}
        />
        {pendingDueDate ? (
          <Chip icon="close" label="No date" onPress={() => setPendingDueDate('')} />
        ) : null}
      </View>

      <View className="mt-6" style={{ gap: spacing.sm }}>
        {Platform.OS !== 'web' ? (
          <Button
            label={capture.isPending ? 'Reading your photo' : 'Take a photo'}
            icon="camera-outline"
            loading={capture.isPending}
            disabled={busy}
            onPress={() => void scan('camera')}
          />
        ) : null}
        <Button
          label="Choose from photos"
          variant="secondary"
          icon="images-outline"
          loading={capture.isPending && Platform.OS === 'web'}
          disabled={busy}
          onPress={() => void scan('library')}
        />
      </View>

      {error ? <View className="mt-4"><FormError message={error} /></View> : null}

      <CalendarPicker
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelect={setPendingDueDate}
        initialDate={pendingDueDate || undefined}
      />
    </View>
  );
}
