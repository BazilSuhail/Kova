import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/auth-store';
import { useThemeColors } from '@/theme/colors';

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

const quickActions = [
  { id: '1', label: 'Start focus', icon: 'flash' as const,         tone: 'primary' as const },
  { id: '2', label: 'Add task',    icon: 'add-circle' as const,    tone: 'info' as const },
  { id: '3', label: 'Journal',     icon: 'book' as const,          tone: 'success' as const },
];

const upcomingTasks = [
  { id: '1', title: 'Finish Q3 report', time: '10:00 AM', done: false },
  { id: '2', title: '20 min walk',       time: '12:30 PM', done: false },
  { id: '3', title: 'Reply to emails',   time: '2:00 PM',  done: true  },
];

export default function HomeScreen() {
  const colors = useThemeColors();
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name.trim().split(/\s+/)[0] ?? 'there';
  const now = new Date();
  const toneColor = { primary: colors.primary, info: colors.info, success: colors.success };

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
          {todayLabel(now)}
        </Text>
        <Text className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
          {greetingFor(now)}, {firstName}.
        </Text>
        <Text className="mt-2 text-base text-slate-500 dark:text-slate-400">
          A clear mind starts with one small step.
        </Text>

        {/* Progress Card */}
        <View className="mt-6 rounded-3xl bg-violet-600 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-white">Today&apos;s rhythm</Text>
            <Ionicons name="partly-sunny" size={20} color="#fff" />
          </View>
          <Text className="mt-4 text-5xl font-bold text-white">3 / 5</Text>
          <Text className="mt-1 text-sm text-violet-100">intentions completed</Text>
          <View className="mt-4 h-2 overflow-hidden rounded-full bg-violet-500">
            <View className="h-full rounded-full bg-white" style={{ width: '60%' }} />
          </View>
        </View>

        {/* Stats Row */}
        <View className="mt-4 flex-row" style={{ gap: 12 }}>
          <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
            <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">12</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">tasks this week</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
              <Ionicons name="pulse" size={18} color={colors.success} />
            </View>
            <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">7 days</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">current streak</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="mt-6 text-base font-bold text-slate-900 dark:text-slate-100">Quick actions</Text>
        <View className="mt-3 flex-row" style={{ gap: 10 }}>
          {quickActions.map((a) => (
            <Pressable
              key={a.id}
              className="flex-1 items-center rounded-2xl border border-slate-200 bg-white py-4 active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
              <Ionicons name={a.icon} size={22} color={toneColor[a.tone]} />
              <Text className="mt-2 text-xs font-semibold text-slate-900 dark:text-slate-100">{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Upcoming */}
        <Text className="mt-6 text-base font-bold text-slate-900 dark:text-slate-100">Upcoming</Text>
        <View className="mt-3" style={{ gap: 8 }}>
          {upcomingTasks.map((task) => (
            <View
              key={task.id}
              className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  task.done
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-slate-400 dark:border-slate-600'
                }`}>
                {task.done && <Ionicons name="checkmark" size={11} color="#fff" />}
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className={`text-sm font-semibold ${
                    task.done
                      ? 'text-slate-400 line-through dark:text-slate-600'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                  {task.title}
                </Text>
              </View>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="time" size={12} color={colors.textMuted} />
                <Text className="text-xs text-slate-400 dark:text-slate-500">{task.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Continue CTA */}
        <Pressable className="mt-4 flex-row items-center rounded-2xl border border-slate-200 bg-white p-4 active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-semibold text-slate-900 dark:text-slate-100">Continue your plan</Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Finish your afternoon reset</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
