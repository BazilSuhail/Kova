import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import type { Task } from '@/lib/api';
import { useCaptureTaskFromVoice } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useThemeColors } from '@/config/theme';

const VOICE_OPTIONS = { ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1, bitRate: 64_000 };

const MAX_SECONDS = 120;

type Props = {
  disabled?: boolean;
  onCreated: (task: Task) => void;
};

export function VoiceCapture({ disabled = false, onCreated }: Props) {
  const colors = useThemeColors();
  const recorder = useAudioRecorder(VOICE_OPTIONS);
  const state = useAudioRecorderState(recorder, 200);
  const capture = useCaptureTaskFromVoice();

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const stopping = useRef(false);

  const seconds = Math.min(MAX_SECONDS, Math.floor(state.durationMillis / 1000));
  const busy = disabled || uploading || capture.isPending;

  async function start() {
    setError(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Kova needs microphone access to record a voice note.');
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }

  async function stop() {
    if (stopping.current) return;
    stopping.current = true;
    setUploading(true);

    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setError('The recording came back empty. Try again.');
        return;
      }

      onCreated(
        await capture.mutateAsync(
          Platform.OS === 'web'
            ? { uri, name: 'voice-note.webm', type: 'audio/webm' }
            : { uri, name: 'voice-note.m4a', type: 'audio/m4a' },
        ),
      );
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setUploading(false);
      stopping.current = false;
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    }
  }

  useEffect(() => {
    if (!state.isRecording || state.durationMillis < MAX_SECONDS * 1000) return;
    const timer = setTimeout(() => void stop(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isRecording, state.durationMillis]);

  const status = capture.isPending
    ? 'Turning your voice into a task'
    : uploading
      ? 'Saving the recording'
      : state.isRecording
        ? 'Listening. Tap stop when you are done.'
        : 'Tap to record, up to two minutes.';

  return (
    <View>
      <View className="items-center rounded-3xl border border-border bg-surface py-6">
        <Pressable
          onPress={() => void (state.isRecording ? stop() : start())}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={state.isRecording ? 'Stop recording' : 'Start recording'}
          className={`h-20 w-20 items-center justify-center rounded-full ${
            state.isRecording ? 'bg-danger' : 'bg-brand'
          } ${busy ? 'opacity-60' : 'active:opacity-80'}`}
        >
          <Ionicons
            name={state.isRecording ? 'stop' : 'mic'}
            size={32}
            color={state.isRecording ? colors.onDangerFill : colors.onBrand}
          />
        </Pressable>

        <Text className="mt-4 text-2xl font-bold text-heading">{formatClock(seconds)}</Text>
        <Text className="mt-1 px-6 text-center text-sm text-muted">{status}</Text>
      </View>

      {error ? <Text className="mt-3 text-sm font-medium text-danger-ink">{error}</Text> : null}

      <Text className="mt-4 text-xs text-muted">
        Say it the way you would tell a friend: “Remind me to book the dentist on Tuesday morning.”
      </Text>
    </View>
  );
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${`${seconds % 60}`.padStart(2, '0')}`;
}
