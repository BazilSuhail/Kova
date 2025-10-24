import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import type { Task } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCaptureTaskFromImage } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { extensionFor } from '@/lib/upload';

type ScanSource = 'camera' | 'library';

type Props = {
  disabled?: boolean;
  onCreated: (task: Task) => void;
  onDone: () => void;
};

export function ScanCapture({ disabled = false, onCreated, onDone }: Props) {
  const capture = useCaptureTaskFromImage();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    task: Task;
    extractedText: string;
    preview: string;
  } | null>(null);

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
            <Text className="text-xs font-semibold uppercase tracking-widest text-brand-ink">
              Read from your photo
            </Text>
            <Text className="mt-2 text-sm text-body">
              {result.extractedText || 'The page did not give us any readable text.'}
            </Text>
          </View>
        </Card>

        <Text className="mt-3 text-sm text-muted">
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
      <View className="rounded-3xl border border-border bg-surface p-4">
        <Text className="text-sm text-body">
          Point the camera at a page of notes, a whiteboard or a receipt. Kova reads the text and
          files a task, and shows you what it read.
        </Text>

        <View className="mt-4" style={{ gap: 10 }}>
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

      {error ? <Text className="mt-3 text-sm font-medium text-danger-ink">{error}</Text> : null}
    </View>
  );
}
