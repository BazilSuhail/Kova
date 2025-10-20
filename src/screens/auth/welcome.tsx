import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { FormError } from '@/components/ui/form-error';
import { useAuth } from '@/providers/auth-provider';
import { retrySession } from '@/store/auth-store';
import { useThemeColors } from '@/theme/colors';
import type { AuthRoute } from './auth-flow';

type IconName = keyof typeof Ionicons.glyphMap;

const highlights: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'sunny-outline', title: 'Plan the day', detail: 'Focus blocks that match your energy' },
  { icon: 'mic-outline', title: 'Capture in a sentence', detail: 'Type or speak, Kova files the task' },
  { icon: 'trending-up-outline', title: 'See progress build', detail: 'Streaks, mood and weekly recaps' },
];

export function WelcomeScreen({ onNavigate }: { onNavigate: (route: AuthRoute) => void }) {
  const colors = useThemeColors();
  const { restoreError } = useAuth();
  const [retrying, setRetrying] = useState(false);

  async function handleRetry() {
    setRetrying(true);
    try {
      await retrySession();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-100 dark:bg-slate-950" edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-violet-600">
          <Ionicons name="sparkles" size={30} color="#FFFFFF" />
        </View>

        <Text className="mt-6 text-4xl font-bold text-slate-900 dark:text-slate-100">Kova</Text>
        <Text className="mt-2 text-base text-slate-500 dark:text-slate-400">
          A calm assistant for the things you actually want to finish.
        </Text>

        {restoreError ? (
          <View className="mt-6">
            <FormError message={restoreError} tone="warning" />
            <Pressable
              onPress={handleRetry}
              disabled={retrying}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
              {retrying ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="refresh" size={16} color={colors.primary} />
                  <Text className="ml-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Try again
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}

        <View className="mt-8" style={{ gap: 12 }}>
          {highlights.map((item) => (
            <View
              key={item.title}
              className="flex-row items-center rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                <Ionicons name={item.icon} size={19} color={colors.primary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</Text>
                <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <View className="mt-8" style={{ gap: 10 }}>
          <PrimaryButton label="Create your account" onPress={() => onNavigate('signup')} />
          <PrimaryButton label="I already have an account" variant="ghost" onPress={() => onNavigate('login')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
