import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle } from '@/components/theme-toggle';
import { useThemeColors } from '@/theme/colors';

const preferences = [
  { label: 'Notifications', detail: 'Daily reminders are on', icon: 'notifications' as const },
  { label: 'Focus goal',    detail: '5 sessions per week',    icon: 'locate'        as const },
  { label: 'Sound',         detail: 'Ambient sounds enabled', icon: 'volume-high'   as const },
];

export default function ProfileScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-slate-100 dark:bg-slate-950"
      edges={['top']}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}>

        {/* Label */}
        <Text className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Profile
        </Text>

        {/* Avatar Card */}
        <View className="mt-4 flex-row items-center rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-violet-600">
            <Text className="text-xl font-bold text-white">AL</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">Alex Lee</Text>
            <Text className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Building a calmer routine</Text>
          </View>
          <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:opacity-70 dark:bg-slate-800">
            <Ionicons name="pencil" size={16} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Streak Banner */}
        <View className="mt-3 flex-row items-center rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950">
          <Ionicons name="trophy" size={20} color={colors.success} />
          <Text className="ml-3 flex-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            🔥 7-day streak — you&apos;re on a roll!
          </Text>
        </View>

        {/* Preferences */}
        <Text className="mb-3 mt-5 text-base font-bold text-slate-900 dark:text-slate-100">Preferences</Text>

        <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {/* Appearance */}
          <View className="flex-row items-center border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <Ionicons name="moon" size={17} color={colors.textMuted} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">Appearance</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">Light / dark mode</Text>
            </View>
            <ThemeToggle />
          </View>

          {preferences.map((pref, i) => (
            <Pressable
              key={pref.label}
              className={`flex-row items-center px-4 py-3 active:opacity-70 ${
                i < preferences.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''
              }`}>
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Ionicons name={pref.icon} size={17} color={colors.textMuted} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{pref.label}</Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">{pref.detail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Bottom Buttons */}
        <View style={{ gap: 10 }}>
          <Pressable className="flex-row items-center justify-center rounded-2xl border border-slate-200 bg-white py-4 active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
            <Ionicons name="help-circle" size={18} color={colors.textMuted} />
            <Text className="ml-2 font-semibold text-slate-700 dark:text-slate-300">Help &amp; Support</Text>
          </Pressable>

          <Pressable className="flex-row items-center justify-center rounded-2xl border border-red-200 bg-white py-4 active:opacity-70 dark:border-red-900 dark:bg-slate-900">
            <Ionicons name="log-out" size={18} color={colors.danger} />
            <Text className="ml-2 font-semibold text-red-500 dark:text-red-400">Sign out</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}
