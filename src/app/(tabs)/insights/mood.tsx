import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useLogMood, useMoodEntries, useMoodLoad } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { todayIsoDate } from '@/lib/format';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import { layout, spacing } from '@/config/theme';

type MoodLabel = 'great' | 'good' | 'okay' | 'low' | 'bad' | 'awful';

const MOODS: { label: MoodLabel; name: string; emoji: string }[] = [
  { label: 'great', name: 'Great', emoji: '😄' },
  { label: 'good', name: 'Good', emoji: '🙂' },
  { label: 'okay', name: 'Okay', emoji: '😐' },
  { label: 'low', name: 'Low', emoji: '😕' },
  { label: 'bad', name: 'Bad', emoji: '😞' },
  { label: 'awful', name: 'Awful', emoji: '😫' },
];

const TAGS = ['study', 'work', 'sleep', 'health', 'social', 'family', 'money', 'rest'];
const ENERGY_LABELS = ['Drained', 'Low', 'Steady', 'Charged', 'Buzzing'];
const ENERGY_ICONS = ['battery-dead-outline', 'battery-half-outline', 'battery-half', 'battery-full-outline', 'flash'] as const;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function MoodCheckInScreen() {
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
    <Screen scroll={false}>
      <AppBar
        title="Check-in"
        brand={false}
        actions={[{ icon: 'close', accessibilityLabel: 'Close', onPress: () => router.back() }]}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: spacing.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-2 text-2xl font-bold tracking-tight text-heading">
          How does today feel?
        </Text>
        <Text className="mt-1 text-sm text-muted">One tap is enough. Kova uses it to pace today.</Text>

        <View className="mt-6 flex-row flex-wrap justify-between" style={{ rowGap: spacing.md }}>
          {MOODS.map((option, index) => {
            const selected = mood === option.label;
            return (
              <Animated.View
                key={option.label}
                entering={FadeInDown.duration(220).delay(index * 40)}
                style={{ width: '31.5%' }}
              >
                <PressableScale
                  onPress={() => pickMood(option.label)}
                  scaleTo={0.92}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.name} mood`}
                  className={`items-center rounded-lg border py-4 ${
                    selected ? 'border-brand bg-brand-soft' : 'border-border bg-surface'
                  }`}
                >
                  <Text style={{ fontSize: selected ? 44 : 38 }}>{option.emoji}</Text>
                  <Text
                    className={`mt-1 text-sm font-semibold ${
                      selected ? 'text-brand-ink' : 'text-muted'
                    }`}
                  >
                    {option.name}
                  </Text>
                </PressableScale>
              </Animated.View>
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
              <Text className="text-sm font-semibold text-heading">Today&apos;s pace</Text>
              <View className="rounded-full bg-brand-soft px-3 py-1">
                <Text className="text-xs font-semibold text-brand-ink">
                  {capitalize(load.data.suggestedLoad)}
                </Text>
              </View>
            </View>
            <Text className="mt-2 text-sm leading-5 text-muted">{load.data.message}</Text>
          </Card>
        ) : null}

        <SectionHeading>
          <Text className="text-base font-semibold text-heading">Energy</Text>
        </SectionHeading>

        <View className="flex-row" style={{ gap: spacing.sm }}>
          {[1, 2, 3, 4, 5].map((level) => {
            const filled = energy >= level;
            return (
              <PressableScale
                key={level}
                onPress={() => pickEnergy(level)}
                accessibilityRole="button"
                accessibilityState={{ selected: energy === level }}
                accessibilityLabel={`Energy ${level}, ${ENERGY_LABELS[level - 1]}`}
                className={`h-12 flex-1 items-center justify-center rounded-md ${
                  filled ? 'bg-brand' : 'bg-surface-alt'
                }`}
              >
                <Text className={`text-sm font-bold ${filled ? 'text-on-brand' : 'text-muted'}`}>
                  {level}
                </Text>
              </PressableScale>
            );
          })}
        </View>
        <View className="mt-2">
          <Chip icon={ENERGY_ICONS[energy - 1]} label={ENERGY_LABELS[energy - 1] ?? ''} />
        </View>

        <SectionHeading>
          <Text className="text-base font-semibold text-heading">Anything behind it?</Text>
        </SectionHeading>

        <Input
          icon="create-outline"
          placeholder="A word on what is shaping today (optional)"
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={280}
        />

        <View className="mt-3 flex-row flex-wrap" style={{ gap: spacing.sm }}>
          {TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              icon={tags.includes(tag) ? 'checkmark' : 'pricetag-outline'}
              selected={tags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="border-t border-border px-4 pb-2 pt-3">
        {loggedToday ? (
          <Text className="mb-2 text-center text-xs text-muted">
            Already logged today. Saving again adds another entry.
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
