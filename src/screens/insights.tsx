import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '@/theme/colors';

const stats = [
  { label: 'Tasks done',   value: '18',     sub: '+4 vs last week',  icon: 'checkmark-circle' as const },
  { label: 'Focus time',   value: '6.5h',   sub: '+1.5h vs last wk', icon: 'time'             as const },
  { label: 'Best streak',  value: '7 days', sub: 'All-time high!',   icon: 'trending-up'      as const },
  { label: 'Avg. session', value: '32 min', sub: 'Getting longer!',  icon: 'flash'            as const },
];

const days     = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
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
          Insights
        </Text>
        <Text className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
          Your week{'\n'}in flow.
        </Text>
        <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Small wins are adding up. Keep your rhythm.
        </Text>

        {/* Activity Chart */}
        <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-slate-900 dark:text-slate-100">Weekly activity</Text>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="stats-chart" size={14} color={colors.primary} />
              <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">This week</Text>
            </View>
          </View>
          <View className="mt-4 flex-row items-end justify-between" style={{ height: 100 }}>
            {activity.map((level, i) => (
              <View key={i} className="flex-1 items-center" style={{ gap: 6 }}>
                <View
                  className={`w-full rounded-lg ${
                    i === 2 ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  style={{ height: Math.round(level * 70) }}
                />
                <Text className="text-xs text-slate-400 dark:text-slate-500">{days[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="mt-4 flex-row flex-wrap" style={{ gap: 10 }}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              style={{ width: '47.5%' }}>
              <View className="flex-row items-center justify-between">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                  <Ionicons name={stat.icon} size={17} color={colors.primary} />
                </View>
                <Ionicons name="arrow-up" size={16} color={colors.success} />
              </View>
              <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</Text>
              <Text className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{stat.sub}</Text>
            </View>
          ))}
        </View>

        {/* Mood Tracker */}
        <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-slate-900 dark:text-slate-100">Weekly mood</Text>
            <Ionicons name="happy" size={16} color={colors.primary} />
          </View>
          <View className="mt-3 flex-row justify-between">
            {weeklyMood.map((m, i) => (
              <View key={i} className="items-center" style={{ gap: 6 }}>
                <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
                <Text className="text-xs text-slate-400 dark:text-slate-500">{m.day}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
