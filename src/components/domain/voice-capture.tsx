import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import type { Task } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { FormError } from '@/components/ui/form-error';
import { useCaptureTaskFromVoice, useUpdateTask } from '@/lib/api';
import { friendlyErrorMessage } from '@/lib/errors';
import { formatDueDate } from '@/lib/format';
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
  const update = useUpdateTask();

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [createdTask, setCreatedTask] = useState<Task | null>(null);
  const [pendingDueDate, setPendingDueDate] = useState<string>('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const stopping = useRef(false);

  const [pulseAnim] = useState(() => new Animated.Value(0.6));
  const [waveAnims] = useState(() => Array.from({ length: 5 }, () => new Animated.Value(0.3)));

  useEffect(() => {
    if (uploading || capture.isPending) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        ]),
      );
      const waveLoops: Animated.CompositeAnimation[] = waveAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.9,
              duration: 600,
              delay: i * 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ),
      );
      pulseLoop.start();
      waveLoops.forEach((loop) => loop.start());
      return () => {
        pulseLoop.stop();
        waveLoops.forEach((loop) => loop.stop());
      };
    }
  }, [uploading, capture.isPending, pulseAnim, waveAnims]);

  const seconds = Math.min(MAX_SECONDS, Math.floor(state.durationMillis / 1000));
  const busy = disabled || uploading || capture.isPending;

  const processing = capture.isPending;
  const saving = uploading && !capture.isPending;

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
      setError(friendlyErrorMessage(failure, 'voice'));
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

      if (__DEV__) {
        console.log('[voice-capture] recorder.uri:', uri);
      }

      const task = await capture.mutateAsync({
        file:
          Platform.OS === 'web'
            ? { uri, name: 'voice-note.webm', type: 'audio/webm' }
            : { uri, name: 'voice-note.m4a', type: 'audio/m4a' },
        dueDate: pendingDueDate || undefined,
      });
      setCreatedTask(task);
    } catch (failure) {
      if (__DEV__) {
        console.log('[voice-capture] upload error:', failure);
      }
      setError(friendlyErrorMessage(failure, 'voice'));
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

  async function updateDueDate(date: string) {
    setPendingDueDate(date);
    if (!createdTask) return;
    try {
      await update.mutateAsync({ taskId: createdTask.taskId, input: { dueDate: date } });
      setCreatedTask((prev) => (prev ? { ...prev, dueDate: date } : prev));
    } catch (failure) {
      setError(friendlyErrorMessage(failure, 'task'));
    }
  }

  if (processing) {
    return (
      <View>
        <View className="rounded-lg border border-border bg-surface p-6">
          <View className="items-center">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim,
              }}
              className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-brand-soft"
            >
              <Ionicons name="mic" size={32} color={colors.brandInk} />
            </Animated.View>

            <Text className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-ink">
              Transcribing your voice
            </Text>
            <Text className="mb-4 text-center text-sm text-muted">
              Kova is listening, processing your words, and turning them into a task.
            </Text>

            <View className="flex-row items-center justify-center gap-1">
              {waveAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={{
                    width: 4,
                    height: 24,
                    marginHorizontal: 2,
                    backgroundColor: colors.brand,
                    borderRadius: 2,
                    opacity: anim,
                    transform: [{ scaleY: anim }],
                  }}
                />
              ))}
            </View>

            <Text className="mt-4 text-xs text-muted">This usually takes a few seconds…</Text>
          </View>
        </View>

        {error ? <View className="mt-3"><FormError message={error} /></View> : null}
      </View>
    );
  }

  if (saving) {
    return (
      <View>
        <View className="rounded-lg border border-border bg-surface p-6">
          <View className="items-center">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim,
              }}
              className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-brand-soft"
            >
              <Ionicons name="cloud-upload-outline" size={32} color={colors.brandInk} />
            </Animated.View>

            <Text className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-ink">
              Saving your recording
            </Text>
            <Text className="text-center text-sm text-muted">
              Almost there, filing your task.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View className="items-center rounded-lg border border-border bg-surface px-4 py-6">
        {!createdTask ? (
          <View className="mb-6 self-stretch">
            <Button
              label={
                pendingDueDate
                  ? `Due date: ${formatDueDate(pendingDueDate) ?? pendingDueDate}`
                  : 'Set due date'
              }
              className="w-full"
              variant={pendingDueDate ? 'primary' : 'secondary'}
              icon="calendar-outline"
              size="sm"
              onPress={() => setCalendarOpen(true)}
            />
          </View>
        ) : null}

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
        <Text className="mt-1 px-6 text-center text-sm text-muted">
          {state.isRecording
            ? 'Listening. Tap stop when you are done.'
            : 'Tap to record, up to two minutes.'}
        </Text>
      </View>

      {error ? <View className="mt-3"><FormError message={error} /></View> : null}

      {createdTask ? (
        <View className="mt-4" style={{ gap: 10 }}>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.successInk} />
            <Text className="flex-1 text-sm text-body">Filed as “{createdTask.title}”.</Text>
          </View>
          <Button
            label={
              createdTask.dueDate
                ? `Due date: ${formatDueDate(createdTask.dueDate) ?? 'Set'}`
                : 'Set due date'
            }
            className="w-full"
            variant="secondary"
            icon="calendar-outline"
            size="sm"
            onPress={() => setCalendarOpen(true)}
            disabled={busy || update.isPending}
          />
          <Button
            label="Done"
            icon="checkmark"
            className="w-full"
            onPress={() => onCreated(createdTask)}
            disabled={busy || update.isPending}
          />
        </View>
      ) : null}

      <Text className="mt-4 text-xs text-muted">
        Say it the way you would tell a friend: “Remind me to book the dentist on Tuesday morning.”
      </Text>

      <CalendarPicker
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelect={updateDueDate}
        initialDate={createdTask?.dueDate ?? (pendingDueDate || undefined)}
      />
    </View>
  );
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${`${seconds % 60}`.padStart(2, '0')}`;
}
