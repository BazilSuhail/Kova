import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

const stats: { label: string; value: string; sub: string; icon: IconName }[] = [
  { label: 'Tasks done', value: '18', sub: '+4 vs last week', icon: 'checkmark-circle' },
  { label: 'Focus time', value: '6.5h', sub: '+1.5h vs last wk', icon: 'time' },
  { label: 'Best streak', value: '7 days', sub: 'All-time high!', icon: 'trending-up' },
  { label: 'Avg. session', value: '32 min', sub: 'Getting longer!', icon: 'flash' },
];

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const activity = [0.5, 0.85, 1.0, 0.6, 0.9, 0.3, 0.75];

const weeklyMood = [
  { day: 'M', emoji: '😊' },
  { day: 'T', emoji: '😐' },
  { day: 'W', emoji: '🔥' },
  { day: 'T', emoji: '😌' },
  { day: 'F', emoji: '🚀' },
  { day: 'S', emoji: '😴' },
  { day: 'S', emoji: '😊' },
];

export default function InsightsScreen() {
  const colors = useThemeColors();

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Insights"
        title={`Your week${'\n'}in flow.`}
        subtitle="Small wins are adding up. Keep your rhythm."
      />

      <Card className="mt-6 rounded-3xl p-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-slate-900 dark:text-slate-100">Weekly activity</Text>
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Ionicons name="stats-chart" size={14} color={colors.primary} />
            <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">This week</Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-end justify-between" style={{ height: 100 }}>
          {activity.map((level, index) => (
            <View key={index} className="flex-1 items-center" style={{ gap: 6 }}>
              <View
                className={`w-full rounded-lg ${index === 2 ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                style={{ height: Math.round(level * 70) }}
              />
              <Text className="text-xs text-slate-400 dark:text-slate-500">{days[index]}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View className="mt-4 flex-row flex-wrap" style={{ gap: 10 }}>
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl" style={{ width: '47.5%' }}>
            <View className="flex-row items-center justify-between">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                <Ionicons name={stat.icon} size={17} color={colors.primary} />
              </View>
              <Ionicons name="arrow-up" size={16} color={colors.success} />
            </View>
            <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</Text>
            <Text className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{stat.sub}</Text>
          </Card>
        ))}
      </View>

      <Card className="mt-4 rounded-2xl">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-slate-900 dark:text-slate-100">Weekly mood</Text>
          <Ionicons name="happy" size={16} color={colors.primary} />
        </View>
        <View className="mt-3 flex-row justify-between">
          {weeklyMood.map((entry, index) => (
            <View key={index} className="items-center" style={{ gap: 6 }}>
              <Text style={{ fontSize: 20 }}>{entry.emoji}</Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500">{entry.day}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
