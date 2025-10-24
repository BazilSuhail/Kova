import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/form-error';
import { ThemedSafeAreaView } from '@/components/ui/styled';
import { useAuth } from '@/providers/auth-provider';
import { retrySession } from '@/store/auth-store';
import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';

const highlights: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'sunny-outline', title: 'Plan the day', detail: 'Focus blocks that match your energy' },
  {
    icon: 'mic-outline',
    title: 'Capture in a sentence',
    detail: 'Type or speak, Kova files the task',
  },
  {
    icon: 'trending-up-outline',
    title: 'See progress build',
    detail: 'Streaks, mood and weekly recaps',
  },
];

export default function WelcomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
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
    <ThemedSafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']} className="bg-surface-alt">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-brand">
          <Ionicons name="sparkles" size={30} color={colors.onBrand} />
        </View>

        <Text className="mt-6 text-4xl font-bold text-heading">Kova</Text>
        <Text className="mt-2 text-base text-muted">
          A calm assistant for the things you actually want to finish.
        </Text>

        {restoreError ? (
          <View className="mt-6">
            <FormError message={restoreError} tone="warning" />
            <Pressable
              onPress={handleRetry}
              disabled={retrying}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl border border-border bg-surface py-3 active:opacity-70"
            >
              {retrying ? (
                <ActivityIndicator color={colors.brandInk} />
              ) : (
                <>
                  <Ionicons name="refresh" size={16} color={colors.brandInk} />
                  <Text className="ml-2 text-sm font-semibold text-heading">Try again</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}

        <View className="mt-8" style={{ gap: 12 }}>
          {highlights.map((item) => (
            <Card key={item.title} className="flex-row items-center rounded-2xl">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-alt">
                <Ionicons name={item.icon} size={19} color={colors.brandInk} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-heading">{item.title}</Text>
                <Text className="mt-0.5 text-xs text-muted">{item.detail}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <View className="mt-8" style={{ gap: 10 }}>
          <Button label="Create your account" onPress={() => router.push('/signup')} />
          <Button
            label="I already have an account"
            variant="secondary"
            onPress={() => router.push('/login')}
          />
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}
