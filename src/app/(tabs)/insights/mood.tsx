import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useLogMood, useMoodEntries, useMoodLoad } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { todayIsoDate } from '@/lib/format';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

type MoodLabel = 'great' | 'good' | 'okay' | 'low' | 'bad' | 'awful';

const MOODS: { label: MoodLabel; name: string; icon: IconName }[] = [
  { label: 'great', name: 'Great', icon: 'happy' },
  { label: 'good', name: 'Good', icon: 'happy-outline' },
  { label: 'okay', name: 'Okay', icon: 'remove-circle-outline' },
  { label: 'low', name: 'Low', icon: 'sad-outline' },
  { label: 'bad', name: 'Bad', icon: 'sad' },
  { label: 'awful', name: 'Awful', icon: 'alert-circle-outline' },
];

const TAGS = ['study', 'work', 'sleep', 'health', 'social', 'family', 'money', 'rest'];
const ENERGY_LABELS = ['Drained', 'Low', 'Steady', 'Charged', 'Buzzing'];

function loadSurface(load: string): string {
  if (load === 'light') return 'bg-surface-alt';
  if (load === 'stretch') return 'bg-surface-alt';
  return 'bg-surface-alt';
}

function loadText(load: string): string {
  if (load === 'light') return 'text-brand-ink';
  if (load === 'stretch') return 'text-brand-ink';
  return 'text-muted';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function MoodCheckInScreen() {
  const colors = useThemeColors();
  const logMood = useLogMood();
  const recent = useMoodEntries();

  const [mood, setMood] = useState<MoodLabel | null>(null);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  const today = todayIsoDate();
  const load = useMoodLoad({ mood: mood ?? undefined, energy });
  const loggedToday = (recent.data?.pages[0]?.items ?? []).some((entry) =>
    entry.date.startsWith(today),
  );

  function pickMood(label: MoodLabel) {
    selectFeedback();
    setMood(label);
  }

  function pickEnergy(level: number) {
    selectFeedback();
    setEnergy(level);
  }

  function toggleTag(tag: string) {
    selectFeedback();
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  async function save() {
    if (!mood) return;
    setFailure(null);
    try {
      await logMood.mutateAsync({ mood, energy, note: note.trim() || undefined, tags });
      successFeedback();
      router.back();
    } catch (error) {
      setFailure(errorMessage(error));
    }
  }

  return (
    <Screen
      scroll={false}
      edges={['top', 'bottom']}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}
    >
      <ScreenHeader
        icon="happy-outline"
        eyebrow="Check-in"
        title="How the day feels"
        subtitle="One tap is enough â€” Kova uses it to pace today."
        right={
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
          >
            <Ionicons name="close" size={20} color={colors.heading} />
          </Pressable>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SectionHeading>
          <Text className="text-base font-bold text-heading">How do you feel?</Text>
        </SectionHeading>

        <View className="flex-row flex-wrap justify-between" style={{ gap: 8 }}>
          {MOODS.map((option) => {
            const selected = mood === option.label;
            return (
              <Pressable
                key={option.label}
                onPress={() => pickMood(option.label)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.name} mood`}
                style={{ width: '31.5%' }}
                className={`items-center rounded-2xl border py-4 active:opacity-80 ${
                  selected ? 'border-brand-ink bg-surface-alt' : 'border-border bg-surface'
                }`}
              >
                <Ionicons
                  name={option.icon}
                  size={26}
                  color={selected ? colors.brandInk : colors.muted}
                />
                <Text
                  className={`mt-2 text-xs font-semibold ${
                    selected ? 'text-brand-ink' : 'text-muted'
                  }`}
                >
                  {option.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {load.isPending ? (
          <View className="mt-4">
            <SkeletonCard lines={1} />
          </View>
        ) : load.data ? (
          <Card className="mt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-heading">Today&apos;s guidance</Text>
              <View className={`rounded-full px-3 py-1.5 ${loadSurface(load.data.suggestedLoad)}`}>
                <Text className={`text-xs font-semibold ${loadText(load.data.suggestedLoad)}`}>
                  {capitalize(load.data.suggestedLoad)}
                </Text>
              </View>
            </View>
            <Text className="mt-2 text-sm leading-5 text-muted">{load.data.message}</Text>
          </Card>
        ) : null}

        <SectionHeading>
          <Text className="text-base font-bold text-heading">Energy</Text>
        </SectionHeading>

        <View className="flex-row" style={{ gap: 8 }}>
          {[1, 2, 3, 4, 5].map((level) => {
            const filled = energy >= level;
            return (
              <Pressable
                key={level}
                onPress={() => pickEnergy(level)}
                accessibilityRole="button"
                accessibilityState={{ selected: energy === level }}
                accessibilityLabel={`Energy ${level}, ${ENERGY_LABELS[level - 1]}`}
                className={`h-12 flex-1 items-center justify-center rounded-2xl border active:opacity-80 ${
                  filled ? 'border-brand-ink bg-brand' : 'border-border bg-surface'
                }`}
              >
                <Text className={`text-sm font-bold ${filled ? 'text-on-brand' : 'text-muted'}`}>
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-2 text-xs text-muted">{ENERGY_LABELS[energy - 1]}</Text>

        <SectionHeading>
          <Text className="text-base font-bold text-heading">Anything behind it?</Text>
        </SectionHeading>

        <Input
          placeholder="A word on what is shaping today (optional)"
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={280}
        />

        <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
          {TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={tags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="pt-2">
        {loggedToday ? (
          <Text className="mb-2 text-center text-xs text-muted">
            Already logged today â€” saving again adds another entry.
          </Text>
        ) : null}
        {failure ? <FormError message={failure} /> : null}
        <Button
          label="Save today's mood"
          icon="checkmark-circle"
          disabled={!mood}
          loading={logMood.isPending}
          onPress={() => void save()}
        />
      </View>
    </Screen>
  );
}
