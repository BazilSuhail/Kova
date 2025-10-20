import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import type { Task } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCaptureTaskFromImage } from '@/hooks/queries/tasks';
import { errorMessage } from '@/lib/errors';
import { extensionFor } from '@/lib/upload';

type ScanSource = 'camera' | 'library';

type Props = {
  disabled?: boolean;
  /** Fired as soon as the task exists, so the list behind the sheet is already right. */
  onCreated: (task: Task) => void;
  /** Fired when the user is finished with the panel. */
  onDone: () => void;
};

/**
 * Photographs a page and lets OCR plus the model file the task.
 *
 * The recognised text is shown back rather than swallowed: it is the quickest way for the
 * user to see whether the model read the note the way they meant it.
 */
export function ScanCapture({ disabled = false, onCreated, onDone }: Props) {
  const capture = useCaptureTaskFromImage();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ task: Task; extractedText: string; preview: string } | null>(
    null,
  );

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

      const created = await capture.mutateAsync({
        uri: asset.uri,
        name: asset.fileName ?? `scan.${extensionFor(asset.mimeType, 'jpg')}`,
        type: asset.mimeType ?? 'image/jpeg',
      });

      setResult({ task: created.task, extractedText: created.extractedText, preview: asset.uri });
      onCreated(created.task);
    } catch (failure) {
      setError(errorMessage(failure));
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
            <Text className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Read from your photo
            </Text>
            <Text className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              {result.extractedText || 'The page did not give us any readable text.'}
            </Text>
          </View>
        </Card>

        <Text className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Filed as “{result.task.title}”. Open it from the list to change the date or category.
        </Text>

        <View className="mt-4">
          <Button label="Done" icon="checkmark" onPress={onDone} />
        </View>
      </View>
    );
  }

  return (
    <View>
      <View className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Text className="text-sm text-slate-700 dark:text-slate-300">
          Point the camera at a page of notes, a whiteboard or a receipt. Kova reads the text and
          files a task, and shows you what it read.
        </Text>

        <View className="mt-4" style={{ gap: 10 }}>
          {/* The web has no camera roll behind `launchCameraAsync`, so only offer a file pick. */}
          {Platform.OS !== 'web' ? (
            <Button
              label={capture.isPending ? 'Reading your photo' : 'Take a photo'}
              icon="camera"
              loading={capture.isPending}
              disabled={busy}
              onPress={() => void scan('camera')}
            />
          ) : null}
          <Button
            label="Choose a photo"
            variant="secondary"
            icon="images"
            loading={capture.isPending && Platform.OS === 'web'}
            disabled={busy}
            onPress={() => void scan('library')}
          />
        </View>
      </View>

      {error ? (
        <Text className="mt-3 text-sm font-medium text-red-500 dark:text-red-400">{error}</Text>
      ) : null}
    </View>
  );
}
