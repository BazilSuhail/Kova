import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeading } from '@/components/ui/section-heading';
import { useThemeColors } from '@/theme/colors';

const DURATIONS = [
  { min: 15, label: '15 min', desc: 'Quick sprint' },
  { min: 25, label: '25 min', desc: 'Pomodoro' },
  { min: 45, label: '45 min', desc: 'Deep work' },
  { min: 60, label: '60 min', desc: 'Flow state' },
];

const recentSessions = [
  { id: '1', title: 'Design review', duration: '25 min', date: 'Today, 9:00 AM' },
  { id: '2', title: 'Code sprint', duration: '45 min', date: 'Yesterday, 3:00 PM' },
  { id: '3', title: 'Email catch-up', duration: '15 min', date: 'Yesterday, 10:00 AM' },
];

export default function PlanScreen() {
  const colors = useThemeColors();
  const [duration, setDuration] = useState(25);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Plan"
        title={`Make space${'\n'}for deep work.`}
        subtitle="A small, intentional session beats waiting for a perfect one."
      />

      <Card className="mt-6 items-center rounded-3xl px-6 py-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950">
          <Ionicons name="flash" size={28} color={colors.primary} />
        </View>
        <Text className="mt-5 text-6xl font-bold text-slate-900 dark:text-slate-100">
          {String(duration).padStart(2, '0')}:00
        </Text>
        <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ready for a focus sprint</Text>

        <View className="mt-6 flex-row items-center" style={{ gap: 12 }}>
          <View className="h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            <Ionicons name="play-skip-back" size={18} color={colors.textMuted} />
          </View>
          <View className="h-14 flex-row items-center justify-center rounded-full bg-violet-600 px-8">
            <Ionicons name="play" size={18} color={colors.onPrimary} />
            <Text className="ml-2 font-bold text-white">Start session</Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            <Ionicons name="play-skip-forward" size={18} color={colors.textMuted} />
          </View>
        </View>
      </Card>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Session length</Text>
      </SectionHeading>

      <View className="flex-row" style={{ gap: 8 }}>
        {DURATIONS.map((option) => {
          const active = option.min === duration;

          return (
            <Pressable
              key={option.min}
              onPress={() => setDuration(option.min)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={`flex-1 items-center rounded-2xl border py-3 active:opacity-70 ${
                active
                  ? 'border-violet-600 bg-violet-50 dark:border-violet-500 dark:bg-violet-950'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}>
              <Text
                className={`text-sm font-bold ${
                  active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-slate-100'
                }`}>
                {option.label}
              </Text>
              <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">{option.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeading>
        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Recent sessions</Text>
      </SectionHeading>

      <View style={{ gap: 8 }}>
        {recentSessions.map((session) => (
          <View
            key={session.id}
            className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
              <Ionicons name="time" size={16} color={colors.primary} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{session.title}</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">{session.date}</Text>
            </View>
            <View className="rounded-full bg-violet-50 px-3 py-1 dark:bg-violet-950">
              <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">{session.duration}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-4 flex-row items-center rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
        <Ionicons name="information-circle" size={16} color={colors.primary} />
        <Text className="ml-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
          Close distracting apps before starting your focus session.
        </Text>
      </View>
    </Screen>
  );
}
