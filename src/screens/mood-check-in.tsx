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
import { useLogMood, useMoodEntries, useMoodLoad } from '@/hooks/queries/insights';
import { errorMessage } from '@/lib/errors';
import { todayIsoDate } from '@/lib/format';
import { selectFeedback, successFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

type MoodLabel = 'great' | 'good' | 'okay' | 'low' | 'bad' | 'awful';

/** The labels the server derives its 1–5 score from. */
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

/** The three loads the server returns — light, balanced, stretch — tinted emerald / slate / amber. */
function loadSurface(load: string): string {
  if (load === 'light') return 'bg-emerald-50 dark:bg-emerald-950';
  if (load === 'stretch') return 'bg-amber-50 dark:bg-amber-950';
  return 'bg-slate-100 dark:bg-slate-800';
}

function loadText(load: string): string {
  if (load === 'light') return 'text-emerald-700 dark:text-emerald-300';
  if (load === 'stretch') return 'text-amber-700 dark:text-amber-300';
  return 'text-slate-600 dark:text-slate-300';
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
  const loggedToday = (recent.data?.pages[0]?.items ?? []).some((entry) => entry.date.startsWith(today));

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
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}>
      <ScreenHeader
        eyebrow="Check-in"
        title="How the day feels"
        subtitle="One tap is enough — Kova uses it to pace today."
        right={
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <SectionHeading>
          <Text className="text-base font-bold text-slate-900 dark:text-slate-100">How do you feel?</Text>
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
                  selected
                    ? 'border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}>
                <Ionicons
                  name={option.icon}
                  size={26}
                  color={selected ? colors.primary : colors.textMuted}
                />
                <Text
                  className={`mt-2 text-xs font-semibold ${
                    selected
                      ? 'text-violet-700 dark:text-violet-300'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}>
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
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Today&apos;s guidance
              </Text>
              <View className={`rounded-full px-3 py-1.5 ${loadSurface(load.data.suggestedLoad)}`}>
                <Text className={`text-xs font-semibold ${loadText(load.data.suggestedLoad)}`}>
                  {capitalize(load.data.suggestedLoad)}
                </Text>
              </View>
            </View>
            <Text className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-400">
              {load.data.message}
            </Text>
          </Card>
        ) : null}

        <SectionHeading>
          <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Energy</Text>
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
                  filled
                    ? 'border-violet-600 bg-violet-600'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}>
                <Text
                  className={`text-sm font-bold ${
                    filled ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-2 text-xs text-slate-500 dark:text-slate-400">{ENERGY_LABELS[energy - 1]}</Text>

        <SectionHeading>
          <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Anything behind it?</Text>
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
            <Chip key={tag} label={tag} selected={tags.includes(tag)} onPress={() => toggleTag(tag)} />
          ))}
        </View>
      </ScrollView>

      <View className="pt-2">
        {loggedToday ? (
          <Text className="mb-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Already logged today — saving again adds another entry.
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
