import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '@/theme/colors';

const DURATIONS = [
  { min: 15, label: '15 min', desc: 'Quick sprint' },
  { min: 25, label: '25 min', desc: 'Pomodoro'     },
  { min: 45, label: '45 min', desc: 'Deep work'    },
  { min: 60, label: '60 min', desc: 'Flow state'   },
];

const recentSessions = [
  { id: '1', title: 'Design review',  duration: '25 min', date: 'Today, 9:00 AM'      },
  { id: '2', title: 'Code sprint',    duration: '45 min', date: 'Yesterday, 3:00 PM'  },
  { id: '3', title: 'Email catch-up', duration: '15 min', date: 'Yesterday, 10:00 AM' },
];

export default function PlanScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-slate-100 dark:bg-slate-950"
      edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Plan
        </Text>
        <Text className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
          Make space{'\n'}for deep work.
        </Text>
        <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          A small, intentional session beats waiting for a perfect one.
        </Text>

        {/* Focus timer — local only until the planner API is wired (Phase 3) */}
        <View className="mt-6 items-center rounded-3xl border border-slate-200 bg-white px-6 py-8 dark:border-slate-800 dark:bg-slate-900">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950">
            <Ionicons name="flash" size={28} color={colors.primary} />
          </View>
          <Text className="mt-5 text-6xl font-bold text-slate-900 dark:text-slate-100">25:00</Text>
          <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ready for a focus sprint
          </Text>

          <View className="mt-6 flex-row items-center" style={{ gap: 12 }}>
            <Pressable className="h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 active:opacity-70 dark:border-slate-700 dark:bg-slate-800">
              <Ionicons name="play-skip-back" size={18} color={colors.textMuted} />
            </Pressable>
            <Pressable className="h-14 flex-row items-center justify-center rounded-full bg-violet-600 px-8 active:opacity-80">
              <Ionicons name="play" size={18} color="#fff" />
              <Text className="ml-2 font-bold text-white">Start session</Text>
            </Pressable>
            <Pressable className="h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 active:opacity-70 dark:border-slate-700 dark:bg-slate-800">
              <Ionicons name="play-skip-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Duration picker */}
        <Text className="mt-6 text-base font-bold text-slate-900 dark:text-slate-100">Session length</Text>
        <View className="mt-3 flex-row" style={{ gap: 8 }}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d.min}
              className={`flex-1 items-center rounded-2xl border py-3 active:opacity-70 ${
                d.min === 25
                  ? 'border-violet-600 bg-violet-50 dark:border-violet-500 dark:bg-violet-950'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}>
              <Text
                className={`text-sm font-bold ${
                  d.min === 25
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                {d.label}
              </Text>
              <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d.desc}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Sessions */}
        <Text className="mt-6 text-base font-bold text-slate-900 dark:text-slate-100">Recent sessions</Text>
        <View className="mt-3" style={{ gap: 8 }}>
          {recentSessions.map((s) => (
            <View
              key={s.id}
              className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                <Ionicons name="time" size={16} color={colors.primary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.title}</Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">{s.date}</Text>
              </View>
              <View className="rounded-full bg-violet-50 px-3 py-1 dark:bg-violet-950">
                <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">{s.duration}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tip */}
        <View className="mt-4 flex-row items-center rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text className="ml-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
            Close distracting apps before starting your focus session.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
